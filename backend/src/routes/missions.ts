import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';

export const missionRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async () => {
    return prisma.mission.findMany({
      orderBy: { createdAt: 'desc' },
    });
  });

  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const mission = await prisma.mission.findUnique({
      where: { id: Number(request.params.id) },
      include: { scores: { include: { student: true } } },
    });
    if (!mission) return reply.status(404).send({ error: 'Mission not found' });
    return mission;
  });

  fastify.post<{ Body: { title: string; description: string; maxScore: number } }>(
    '/',
    async (request, reply) => {
      const { title, description, maxScore } = request.body;
      const mission = await prisma.mission.create({ data: { title, description, maxScore } });
      return reply.status(201).send(mission);
    },
  );
};
