import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';

export const healthRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/ready', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return reply.send({ status: 'ok' });
    } catch {
      return reply.status(503).send({ status: 'error', message: 'Database not reachable' });
    }
  });
};
