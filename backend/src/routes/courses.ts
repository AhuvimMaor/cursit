import type { Course } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';

import { appendEvent } from '../lib/append-event.js';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

function courseAuditSnapshot(course: Course) {
  return {
    name: course.name,
    description: course.description,
    type: course.type,
    requirements: course.requirements,
    gmushHours: course.gmushHours,
    location: course.location,
    isPublished: course.isPublished,
  };
}

export const courseRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async (request) => {
    const userId = request.headers['x-user-id'];
    const isBis = userId
      ? (await prisma.user.findUnique({ where: { id: Number(userId) } }))?.role === 'BIS_CDR'
      : false;

    return prisma.course.findMany({
      where: isBis ? {} : { isPublished: true },
      include: {
        instances: {
          where: { status: { not: 'DRAFT' } },
          orderBy: { startDate: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  });

  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const course = await prisma.course.findUnique({
      where: { id: Number(request.params.id) },
      include: {
        instances: { orderBy: { startDate: 'desc' } },
        formTemplates: true,
      },
    });
    if (!course) return reply.status(404).send({ error: 'Course not found' });
    return course;
  });

  fastify.post(
    '/',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const flowId = randomUUID();
      const course = await prisma.$transaction(async (tx) => {
        const created = await tx.course.create({
          data: request.body as Parameters<typeof prisma.course.create>[0]['data'],
        });
        await appendEvent(tx, {
          eventType: 'course.created',
          aggregateType: 'COURSE',
          aggregateId: created.id,
          actorUserId: request.userId!,
          payload: {
            id: created.id,
            name: created.name,
            type: created.type,
            isPublished: created.isPublished,
          },
          flowId,
        });
        return created;
      });
      return reply.status(201).send(course);
    },
  );

  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request) => {
      const id = Number(request.params.id);
      const flowId = randomUUID();
      const patch = request.body as Parameters<typeof prisma.course.update>[0]['data'];
      return prisma.$transaction(async (tx) => {
        const before = await tx.course.findUniqueOrThrow({ where: { id } });
        const updated = await tx.course.update({
          where: { id },
          data: patch,
        });
        await appendEvent(tx, {
          eventType: 'course.updated',
          aggregateType: 'COURSE',
          aggregateId: id,
          actorUserId: request.userId!,
          payload: {
            before: courseAuditSnapshot(before),
            after: courseAuditSnapshot(updated),
          },
          flowId,
        });
        return updated;
      });
    },
  );

  // ── Instances ──
  fastify.get<{ Params: { id: string } }>('/:id/instances', async (request) => {
    return prisma.courseInstance.findMany({
      where: { courseId: Number(request.params.id) },
      include: { phases: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { startDate: 'desc' },
    });
  });

  fastify.post<{ Params: { id: string } }>(
    '/:id/instances',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const data = request.body as { name: string; startDate: string; endDate: string };
      const flowId = randomUUID();
      const instance = await prisma.$transaction(async (tx) => {
        const created = await tx.courseInstance.create({
          data: {
            courseId: Number(request.params.id),
            name: data.name,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
          },
        });
        await appendEvent(tx, {
          eventType: 'course_instance.created',
          aggregateType: 'COURSE_INSTANCE',
          aggregateId: created.id,
          actorUserId: request.userId!,
          payload: {
            courseId: created.courseId,
            name: created.name,
            startDate: created.startDate.toISOString(),
            endDate: created.endDate.toISOString(),
            status: created.status,
          },
          flowId,
        });
        return created;
      });
      return reply.status(201).send(instance);
    },
  );
};
