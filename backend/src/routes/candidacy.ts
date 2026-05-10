import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';

import { appendEvent } from '../lib/append-event.js';
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
      const flowId = randomUUID();
      const candidacy = await prisma.$transaction(async (tx) => {
        const created = await tx.commandCandidacy.create({
          data: {
            courseInstanceId,
            candidateId,
            submittedById: request.userId!,
            motivation,
            commanderNotes,
          },
        });
        await appendEvent(tx, {
          eventType: 'candidacy.submitted',
          aggregateType: 'CANDIDACY',
          aggregateId: created.id,
          actorUserId: request.userId!,
          payload: {
            courseInstanceId,
            candidateId,
            submittedById: request.userId,
            motivation,
            commanderNotes,
          },
          flowId,
        });
        return created;
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
      const id = Number(request.params.id);
      const flowId = randomUUID();
      return prisma.$transaction(async (tx) => {
        const updated = await tx.commandCandidacy.update({
          where: { id },
          data: { status: 'COORD_REVIEWED' },
        });
        await appendEvent(tx, {
          eventType: 'candidacy.coord_reviewed',
          aggregateType: 'CANDIDACY',
          aggregateId: id,
          actorUserId: request.userId!,
          payload: { status: 'COORD_REVIEWED' },
          flowId,
        });
        return updated;
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
      const id = Number(request.params.id);
      const flowId = randomUUID();
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.commandCandidacy.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedById: request.userId,
            reviewNotes: request.body.reviewNotes,
          },
        });
        await appendEvent(tx, {
          eventType: 'candidacy.approved',
          aggregateType: 'CANDIDACY',
          aggregateId: id,
          actorUserId: request.userId!,
          payload: {
            status: 'APPROVED',
            reviewNotes: request.body.reviewNotes ?? null,
          },
          flowId,
        });
        return updated;
      });
      await logEvent(request.userId!, 'APPROVE', 'CANDIDACY', result.id);
      return result;
    },
  );

  fastify.patch<{ Params: { id: string }; Body: { reviewNotes?: string } }>(
    '/:id/reject',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request) => {
      const id = Number(request.params.id);
      const flowId = randomUUID();
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.commandCandidacy.update({
          where: { id },
          data: {
            status: 'REJECTED',
            reviewedById: request.userId,
            reviewNotes: request.body.reviewNotes,
          },
        });
        await appendEvent(tx, {
          eventType: 'candidacy.rejected',
          aggregateType: 'CANDIDACY',
          aggregateId: id,
          actorUserId: request.userId!,
          payload: {
            status: 'REJECTED',
            reviewNotes: request.body.reviewNotes ?? null,
          },
          flowId,
        });
        return updated;
      });
      await logEvent(request.userId!, 'REJECT', 'CANDIDACY', result.id);
      return result;
    },
  );
};
