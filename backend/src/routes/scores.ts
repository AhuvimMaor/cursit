import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';

export const scoreRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async () => {
    return prisma.score.findMany({
      include: { student: true, mission: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  fastify.post<{ Body: { studentId: number; missionId: number; score: number; comment?: string } }>(
    '/',
    async (request, reply) => {
      const { studentId, missionId, score, comment } = request.body;
      const record = await prisma.score.upsert({
        where: { studentId_missionId: { studentId, missionId } },
        update: { score, comment },
        create: { studentId, missionId, score, comment },
      });
      return reply.status(201).send(record);
    },
  );
};
