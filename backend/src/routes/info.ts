import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const infoRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async () => {
    return prisma.infoPage.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
  });

  fastify.get<{ Params: { slug: string } }>('/:slug', async (request, reply) => {
    const page = await prisma.infoPage.findUnique({
      where: { slug: request.params.slug },
    });
    if (!page) return reply.status(404).send({ error: 'Page not found' });
    return page;
  });

  fastify.post(
    '/',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const page = await prisma.infoPage.create({
        data: request.body as Parameters<typeof prisma.infoPage.create>[0]['data'],
      });
      return reply.status(201).send(page);
    },
  );

  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request) => {
      return prisma.infoPage.update({
        where: { id: Number(request.params.id) },
        data: request.body as Parameters<typeof prisma.infoPage.update>[0]['data'],
      });
    },
  );
};
