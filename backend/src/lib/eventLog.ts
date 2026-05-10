/**
 * Best-effort activity rows (`EventLog`). Writes run outside domain transactions and errors are swallowed.
 * For authoritative append-only auditing tied to mutations, use `appendEvent` → `Event` instead (see `append-event.ts`).
 */
import type { Prisma } from '@prisma/client';

import { prisma } from './prisma.js';

export const logEvent = async (
  userId: number,
  action: string,
  entityType: string,
  entityId?: number,
  details?: Record<string, unknown>,
) => {
  try {
    await prisma.eventLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: details !== undefined ? (details as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch {
    console.error('Failed to log event', { userId, action, entityType, entityId });
  }
};
