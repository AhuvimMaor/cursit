import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

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
      const course = await prisma.course.create({
        data: request.body as Parameters<typeof prisma.course.create>[0]['data'],
      });
      return reply.status(201).send(course);
    },
  );

  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request) => {
      return prisma.course.update({
        where: { id: Number(request.params.id) },
        data: request.body as Parameters<typeof prisma.course.update>[0]['data'],
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
      const instance = await prisma.courseInstance.create({
        data: {
          courseId: Number(request.params.id),
          name: data.name,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
      });
      return reply.status(201).send(instance);
    },
  );
};
