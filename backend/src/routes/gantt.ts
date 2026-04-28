import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const ganttRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async () => {
    const instances = await prisma.courseInstance.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      include: {
        course: true,
        phases: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { startDate: 'asc' },
    });
    return instances;
  });

  fastify.post<{ Params: { instanceId: string } }>(
    '/instances/:instanceId/phases',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const data = request.body as {
        name: string;
        phaseType: string;
        startDate: string;
        endDate: string;
        description?: string;
        sortOrder?: number;
      };
      const phase = await prisma.coursePhase.create({
        data: {
          courseInstanceId: Number(request.params.instanceId),
          name: data.name,
          phaseType: data.phaseType as
            | 'CANDIDACY_SUBMISSION'
            | 'TRYOUTS'
            | 'COMMANDER_COURSE'
            | 'STAFF_PREP'
            | 'COURSE'
            | 'SUMMARY_WEEK'
            | 'OTHER',
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          description: data.description,
          sortOrder: data.sortOrder ?? 0,
        },
      });
      return reply.status(201).send(phase);
    },
  );

  fastify.patch<{ Params: { id: string } }>(
    '/phases/:id',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request) => {
      const data = request.body as Record<string, unknown>;
      const updateData: Record<string, unknown> = { ...data };
      if (data.startDate) updateData.startDate = new Date(data.startDate as string);
      if (data.endDate) updateData.endDate = new Date(data.endDate as string);
      return prisma.coursePhase.update({
        where: { id: Number(request.params.id) },
        data: updateData,
      });
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    '/phases/:id',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      await prisma.coursePhase.delete({ where: { id: Number(request.params.id) } });
      return reply.status(204).send();
    },
  );
};
