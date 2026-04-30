import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: { uniqueId: string } }>('/login', async (request, reply) => {
    const { uniqueId } = request.body;
    const user = await prisma.user.findUnique({
      where: { uniqueId },
      include: { team: true, branch: true },
    });
    if (!user || !user.isActive) {
      return reply.status(401).send({ error: 'User not found' });
    }
    return user;
  });

  fastify.get('/me', async (request, reply) => {
    const userId = request.headers['x-user-id'];
    if (!userId) return reply.status(401).send({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { team: true, branch: true },
    });
    if (!user) return reply.status(401).send({ error: 'User not found' });
    return user;
  });

  fastify.get('/users', async () => {
    return prisma.user.findMany({
      include: { team: true, branch: true },
      orderBy: { name: 'asc' },
    });
  });

  fastify.get<{ Params: { teamId: string } }>('/team/:teamId/members', async (request) => {
    return prisma.user.findMany({
      where: { teamId: Number(request.params.teamId), role: 'TRAINEE', isActive: true },
      orderBy: { name: 'asc' },
    });
  });

  fastify.post<{
    Body: { uniqueId: string; name: string; role: string; teamId?: number; branchId?: number };
  }>('/users', { preHandler: [authenticate, requireRole('BIS_CDR')] }, async (request, reply) => {
    const { uniqueId, name, role, teamId, branchId } = request.body;
    const user = await prisma.user.create({
      data: {
        uniqueId,
        name,
        role: role as 'BIS_CDR' | 'BRANCH_COORD' | 'TEAM_LEADER' | 'TRAINEE',
        teamId,
        branchId,
      },
      include: { team: true, branch: true },
    });
    return reply.status(201).send(user);
  });

  fastify.patch<{
    Params: { id: string };
    Body: {
      name?: string;
      role?: string;
      teamId?: number | null;
      branchId?: number | null;
      isActive?: boolean;
    };
  }>('/users/:id', { preHandler: [authenticate, requireRole('BIS_CDR')] }, async (request) => {
    const { name, role, teamId, branchId, isActive } = request.body;
    return prisma.user.update({
      where: { id: Number(request.params.id) },
      data: {
        ...(name !== undefined && { name }),
        ...(role !== undefined && {
          role: role as 'BIS_CDR' | 'BRANCH_COORD' | 'TEAM_LEADER' | 'TRAINEE',
        }),
        ...(teamId !== undefined && { teamId }),
        ...(branchId !== undefined && { branchId }),
        ...(isActive !== undefined && { isActive }),
      },
      include: { team: true, branch: true },
    });
  });
};
