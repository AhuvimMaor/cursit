import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const branchRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async () => {
    return prisma.branch.findMany({
      include: { teams: true },
      orderBy: { name: 'asc' },
    });
  });

  fastify.get<{ Params: { id: string } }>('/:id/teams', async (request) => {
    return prisma.team.findMany({
      where: { branchId: Number(request.params.id) },
      orderBy: { name: 'asc' },
    });
  });

  fastify.post<{ Body: { name: string } }>(
    '/',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const branch = await prisma.branch.create({ data: { name: request.body.name } });
      return reply.status(201).send(branch);
    },
  );

  fastify.post<{ Body: { name: string; branchId: number } }>(
    '/teams',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const team = await prisma.team.create({
        data: { name: request.body.name, branchId: request.body.branchId },
      });
      return reply.status(201).send(team);
    },
  );
};
