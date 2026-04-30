import type { FastifyInstance } from 'fastify';

import { logEvent } from '../lib/eventLog.js';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const candidacyRoutes = async (fastify: FastifyInstance) => {
  fastify.post<{
    Body: {
      courseInstanceId: number;
      candidateId: number;
      motivation?: string;
      commanderNotes?: string;
    };
  }>(
    '/submit',
    { preHandler: [authenticate, requireRole('TEAM_LEADER', 'BIS_CDR')] },
    async (request, reply) => {
      const { courseInstanceId, candidateId, motivation, commanderNotes } = request.body;
      const candidacy = await prisma.commandCandidacy.create({
        data: {
          courseInstanceId,
          candidateId,
          submittedById: request.userId!,
          motivation,
          commanderNotes,
        },
      });
      await logEvent(request.userId!, 'SUBMIT', 'CANDIDACY', candidacy.id, {
        candidateId,
        courseInstanceId,
      });
      return reply.status(201).send(candidacy);
    },
  );

  fastify.get(
    '/my-submissions',
    { preHandler: [authenticate, requireRole('TEAM_LEADER')] },
    async (request) => {
      return prisma.commandCandidacy.findMany({
        where: { submittedById: request.userId },
        include: {
          candidate: true,
          courseInstance: { include: { course: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  );

  fastify.get(
    '/branch',
    { preHandler: [authenticate, requireRole('BRANCH_COORD')] },
    async (request) => {
      return prisma.commandCandidacy.findMany({
        where: {
          candidate: { branchId: request.userBranchId },
        },
        include: {
          candidate: { include: { team: true } },
          submittedBy: true,
          courseInstance: { include: { course: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  );

  fastify.patch<{ Params: { id: string } }>(
    '/:id/coord-review',
    { preHandler: [authenticate, requireRole('BRANCH_COORD')] },
    async (request) => {
      return prisma.commandCandidacy.update({
        where: { id: Number(request.params.id) },
        data: { status: 'COORD_REVIEWED' },
      });
    },
  );

  fastify.get('/all', { preHandler: [authenticate, requireRole('BIS_CDR')] }, async () => {
    return prisma.commandCandidacy.findMany({
      include: {
        candidate: { include: { team: true, branch: true } },
        submittedBy: true,
        courseInstance: { include: { course: true } },
        reviewedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  fastify.patch<{ Params: { id: string }; Body: { reviewNotes?: string } }>(
    '/:id/approve',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request) => {
      const result = await prisma.commandCandidacy.update({
        where: { id: Number(request.params.id) },
        data: {
          status: 'APPROVED',
          reviewedById: request.userId,
          reviewNotes: request.body.reviewNotes,
        },
      });
      await logEvent(request.userId!, 'APPROVE', 'CANDIDACY', result.id);
      return result;
    },
  );

  fastify.patch<{ Params: { id: string }; Body: { reviewNotes?: string } }>(
    '/:id/reject',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request) => {
      const result = await prisma.commandCandidacy.update({
        where: { id: Number(request.params.id) },
        data: {
          status: 'REJECTED',
          reviewedById: request.userId,
          reviewNotes: request.body.reviewNotes,
        },
      });
      await logEvent(request.userId!, 'REJECT', 'CANDIDACY', result.id);
      return result;
    },
  );
};
