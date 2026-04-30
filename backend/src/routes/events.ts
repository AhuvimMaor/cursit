import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const eventRoutes = async (fastify: FastifyInstance) => {
  fastify.get<{
    Querystring: {
      action?: string;
      entityType?: string;
      userId?: string;
      from?: string;
      to?: string;
      limit?: string;
    };
  }>('/', { preHandler: [authenticate, requireRole('BIS_CDR')] }, async (request) => {
    const { action, entityType, userId, from, to, limit } = request.query;

    return prisma.eventLog.findMany({
      where: {
        ...(action && { action }),
        ...(entityType && { entityType }),
        ...(userId && { userId: Number(userId) }),
        ...(from || to
          ? {
              createdAt: {
                ...(from && { gte: new Date(from) }),
                ...(to && { lte: new Date(to) }),
              },
            }
          : {}),
      },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit) || 100, 500),
    });
  });
};
