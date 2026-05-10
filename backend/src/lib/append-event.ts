import { Prisma, type AggregateType, type Event } from '@prisma/client';

/**
 * Append-only domain audit (`Event` table). Uses PostgreSQL SAVEPOINTs so a rare
 * concurrent version collision can retry without aborting the outer transaction.
 *
 * For authoritative auditing and workflows, prefer this stream over `EventLog`
 * (see `eventLog.ts` and prisma README).
 */

const MAX_APPEND_ATTEMPTS = 8;

export function isEventAggregateVersionConflict(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== 'P2002') return false;
  const target = error.meta?.target;
  if (!Array.isArray(target)) return false;
  const names = new Set(target.map((t) => String(t)));
  return names.has('aggregateType') && names.has('aggregateId') && names.has('version');
}

export async function appendEvent(
  tx: Prisma.TransactionClient,
  params: {
    eventType: string;
    aggregateType: AggregateType;
    aggregateId: number;
    actorUserId: number | null;
    payload: Prisma.InputJsonValue;
    flowId?: string | null;
    causationEventId?: bigint | null;
  },
): Promise<Event> {
  for (let attempt = 0; attempt < MAX_APPEND_ATTEMPTS; attempt++) {
    const savepoint = `append_ev_${attempt}`;
    await tx.$executeRawUnsafe(`SAVEPOINT ${savepoint}`);
    try {
      const agg = await tx.event.aggregate({
        where: { aggregateType: params.aggregateType, aggregateId: params.aggregateId },
        _max: { version: true },
      });
      const version = (agg._max.version ?? 0) + 1;
      const created = await tx.event.create({
        data: {
          eventType: params.eventType,
          aggregateType: params.aggregateType,
          aggregateId: params.aggregateId,
          actorUserId: params.actorUserId,
          payload: params.payload,
          version,
          flowId: params.flowId ?? null,
          causationEventId: params.causationEventId ?? null,
        },
      });
      await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${savepoint}`);
      return created;
    } catch (e) {
      await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${savepoint}`);
      await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${savepoint}`);
      if (attempt === MAX_APPEND_ATTEMPTS - 1 || !isEventAggregateVersionConflict(e)) {
        throw e;
      }
    }
  }

  throw new Error('appendEvent: unreachable');
}
