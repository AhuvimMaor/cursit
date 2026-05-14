import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../lib/prisma.js';

const IS_DEV = process.env.NODE_ENV !== 'production';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  // 1. Try session (production OAuth)
  const sessionUser = request.session?.get?.('user');
  if (sessionUser?.id) {
    const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
    if (user && user.isActive) {
      request.userId = user.id;
      request.userRole = user.role;
      request.userBranchId = user.branchId;
      request.userTeamId = user.teamId;
      return;
    }
  }

  // 2. Try x-user-id header (dev mode)
  if (IS_DEV) {
    const userId = request.headers['x-user-id'];
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
      if (user && user.isActive) {
        request.userId = user.id;
        request.userRole = user.role;
        request.userBranchId = user.branchId;
        request.userTeamId = user.teamId;
        return;
      }
    }
  }

  return reply.status(401).send({ error: 'Unauthorized' });
};

export const requireRole = (...roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userRole || !roles.includes(request.userRole)) {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }
  };
};
