import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';

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
};
