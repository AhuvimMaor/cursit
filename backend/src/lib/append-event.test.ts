import { Prisma, type AggregateType } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

import { appendEvent, isEventAggregateVersionConflict } from './append-event.js';

function versionConflictError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { modelName: 'Event', target: ['aggregateType', 'aggregateId', 'version'] },
  });
}

describe('isEventAggregateVersionConflict', () => {
  it('returns true for aggregate version unique violations', () => {
    expect(isEventAggregateVersionConflict(versionConflictError())).toBe(true);
  });

  it('returns false for other P2002 targets', () => {
    const e = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['email'] },
    });
    expect(isEventAggregateVersionConflict(e)).toBe(false);
  });

  it('returns false for unrelated errors', () => {
    expect(isEventAggregateVersionConflict(new Error('oops'))).toBe(false);
  });
});

describe('appendEvent', () => {
  const baseParams = {
    eventType: 'test.created',
    aggregateType: 'COURSE' as AggregateType,
    aggregateId: 1,
    actorUserId: 42,
    payload: { ok: true },
    flowId: 'flow',
  };

  it('releases savepoint and returns row on first success', async () => {
    const executeRawUnsafe = vi.fn().mockResolvedValue(undefined);
    const aggregate = vi.fn().mockResolvedValue({ _max: { version: 2 } });
    const create = vi.fn().mockResolvedValue({ id: 10n, version: 3 });

    const tx = {
      $executeRawUnsafe: executeRawUnsafe,
      event: { aggregate, create },
    } as unknown as Prisma.TransactionClient;

    const row = await appendEvent(tx, baseParams);

    expect(row).toEqual({ id: 10n, version: 3 });
    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
    expect(create.mock.calls[0][0].data.version).toBe(3);
    expect(executeRawUnsafe.mock.calls.map(([s]) => String(s))).toEqual([
      'SAVEPOINT append_ev_0',
      'RELEASE SAVEPOINT append_ev_0',
    ]);
  });

  it('retries after aggregate version conflict', async () => {
    const executeRawUnsafe = vi.fn().mockResolvedValue(undefined);
    const aggregate = vi
      .fn()
      .mockResolvedValueOnce({ _max: { version: 5 } })
      .mockResolvedValueOnce({ _max: { version: 6 } });
    const create = vi
      .fn()
      .mockRejectedValueOnce(versionConflictError())
      .mockResolvedValueOnce({ id: 11n, version: 7 });

    const tx = {
      $executeRawUnsafe: executeRawUnsafe,
      event: { aggregate, create },
    } as unknown as Prisma.TransactionClient;

    const row = await appendEvent(tx, baseParams);

    expect(row).toEqual({ id: 11n, version: 7 });
    expect(aggregate).toHaveBeenCalledTimes(2);
    expect(create).toHaveBeenCalledTimes(2);
    expect(create.mock.calls[1][0].data.version).toBe(7);
  });

  it('does not retry unrelated errors', async () => {
    const executeRawUnsafe = vi.fn().mockResolvedValue(undefined);
    const aggregate = vi.fn().mockResolvedValue({ _max: { version: 1 } });
    const create = vi.fn().mockRejectedValue(new Error('db exploded'));

    const tx = {
      $executeRawUnsafe: executeRawUnsafe,
      event: { aggregate, create },
    } as unknown as Prisma.TransactionClient;

    await expect(appendEvent(tx, baseParams)).rejects.toThrow('db exploded');
    expect(create).toHaveBeenCalledTimes(1);
  });
});
