import type { AggregateType, Prisma } from '@prisma/client';

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
) {
  const agg = await tx.event.aggregate({
    where: { aggregateType: params.aggregateType, aggregateId: params.aggregateId },
    _max: { version: true },
  });
  const version = (agg._max.version ?? 0) + 1;
  return tx.event.create({
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
}
