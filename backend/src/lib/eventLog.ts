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
      data: { userId, action, entityType, entityId, details: details ?? undefined },
    });
  } catch {
    console.error('Failed to log event', { userId, action, entityType, entityId });
  }
};
