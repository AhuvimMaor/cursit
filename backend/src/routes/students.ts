import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';

export const studentRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/', async () => {
    return prisma.student.findMany({
      orderBy: { name: 'asc' },
    });
  });

  fastify.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const student = await prisma.student.findUnique({
      where: { id: Number(request.params.id) },
      include: { scores: { include: { mission: true } } },
    });
    if (!student) return reply.status(404).send({ error: 'Student not found' });
    return student;
  });

  fastify.post<{ Body: { name: string; email: string } }>('/', async (request, reply) => {
    const { name, email } = request.body;
    const student = await prisma.student.create({ data: { name, email } });
    return reply.status(201).send(student);
  });
};
