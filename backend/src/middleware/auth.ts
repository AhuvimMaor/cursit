import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../lib/prisma.js';

declare module 'fastify' {
  type FastifyRequest = {
    userId?: number;
    userRole?: string;
    userBranchId?: number | null;
    userTeamId?: number | null;
  }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.headers['x-user-id'];
  if (!userId) {
    return reply.status(401).send({ error: 'Missing x-user-id header' });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
  });

  if (!user || !user.isActive) {
    return reply.status(401).send({ error: 'User not found or inactive' });
  }

  request.userId = user.id;
  request.userRole = user.role;
  request.userBranchId = user.branchId;
  request.userTeamId = user.teamId;
};

export const requireRole = (...roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userRole || !roles.includes(request.userRole)) {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }
  };
};
