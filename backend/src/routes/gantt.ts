import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';

import { appendEvent } from '../lib/append-event.js';
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
      const flowId = randomUUID();
      const phase = await prisma.$transaction(async (tx) => {
        const created = await tx.coursePhase.create({
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
        await appendEvent(tx, {
          eventType: 'course_phase.created',
          aggregateType: 'COURSE_PHASE',
          aggregateId: created.id,
          actorUserId: request.userId!,
          payload: {
            courseInstanceId: created.courseInstanceId,
            name: created.name,
            phaseType: created.phaseType,
            startDate: created.startDate.toISOString(),
            endDate: created.endDate.toISOString(),
            description: created.description,
            sortOrder: created.sortOrder,
          },
          flowId,
        });
        return created;
      });
      return reply.status(201).send(phase);
    },
  );

  fastify.patch<{ Params: { id: string } }>(
    '/phases/:id',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request) => {
      const id = Number(request.params.id);
      const flowId = randomUUID();
      const data = request.body as Record<string, unknown>;
      const updateData: Record<string, unknown> = { ...data };
      if (data.startDate) updateData.startDate = new Date(data.startDate as string);
      if (data.endDate) updateData.endDate = new Date(data.endDate as string);
      return prisma.$transaction(async (tx) => {
        const updated = await tx.coursePhase.update({
          where: { id },
          data: updateData,
        });
        await appendEvent(tx, {
          eventType: 'course_phase.updated',
          aggregateType: 'COURSE_PHASE',
          aggregateId: id,
          actorUserId: request.userId!,
          payload: {
            courseInstanceId: updated.courseInstanceId,
            name: updated.name,
            phaseType: updated.phaseType,
            startDate: updated.startDate.toISOString(),
            endDate: updated.endDate.toISOString(),
            description: updated.description,
            sortOrder: updated.sortOrder,
          },
          flowId,
        });
        return updated;
      });
    },
  );

  fastify.delete<{ Params: { id: string } }>(
    '/phases/:id',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const id = Number(request.params.id);
      const flowId = randomUUID();
      await prisma.$transaction(async (tx) => {
        const phase = await tx.coursePhase.findUniqueOrThrow({ where: { id } });
        await tx.coursePhase.delete({ where: { id } });
        await appendEvent(tx, {
          eventType: 'course_phase.deleted',
          aggregateType: 'COURSE_PHASE',
          aggregateId: id,
          actorUserId: request.userId!,
          payload: {
            courseInstanceId: phase.courseInstanceId,
            name: phase.name,
            phaseType: phase.phaseType,
            startDate: phase.startDate.toISOString(),
            endDate: phase.endDate.toISOString(),
            description: phase.description,
            sortOrder: phase.sortOrder,
          },
          flowId,
        });
      });
      return reply.status(204).send();
    },
  );
};
