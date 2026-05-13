import type { Prisma } from '@prisma/client';
import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';

import { appendEvent } from '../lib/append-event.js';
import { logEvent } from '../lib/eventLog.js';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const registrationRoutes = async (fastify: FastifyInstance) => {
  // Get all registrations for a specific course instance
  fastify.get<{ Params: { instanceId: string } }>(
    '/by-instance/:instanceId',
    { preHandler: [authenticate, requireRole('BIS_CDR', 'BRANCH_COORD', 'TEAM_LEADER')] },
    async (request) => {
      return prisma.courseRegistration.findMany({
        where: { courseInstanceId: Number(request.params.instanceId) },
        include: {
          user: { include: { team: true, branch: true } },
          tlApprovedBy: true,
          coordApprovedBy: true,
          bisApprovedBy: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  );

  // Admin manually registers a participant
  fastify.post<{ Body: { courseInstanceId: number; userId: number; status?: string } }>(
    '/manual',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const { courseInstanceId, userId, status } = request.body;
      const resolvedStatus = (status as 'APPROVED' | 'PENDING_TL') ?? 'APPROVED';
      const flowId = randomUUID();
      const registration = await prisma.$transaction(async (tx) => {
        const created = await tx.courseRegistration.create({
          data: {
            courseInstanceId,
            userId,
            status: resolvedStatus,
            bisApprovedById: request.userId,
            bisApprovedAt: new Date(),
          },
          include: { user: true, courseInstance: { include: { course: true } } },
        });
        if (resolvedStatus === 'APPROVED') {
          await appendEvent(tx, {
            eventType: 'registration.bis_approved',
            aggregateType: 'REGISTRATION',
            aggregateId: created.id,
            actorUserId: request.userId!,
            payload: {
              status: 'APPROVED',
              bisNotes: null,
              manual: true,
              courseInstanceId,
              userId,
            },
            flowId,
          });
        } else {
          await appendEvent(tx, {
            eventType: 'registration.manual_intake',
            aggregateType: 'REGISTRATION',
            aggregateId: created.id,
            actorUserId: request.userId!,
            payload: {
              status: 'PENDING_TL',
              courseInstanceId,
              userId,
            },
            flowId,
          });
        }
        return created;
      });
      await logEvent(request.userId!, 'REGISTER', 'REGISTRATION', registration.id, {
        userId,
        courseInstanceId,
        manual: true,
      });
      return reply.status(201).send(registration);
    },
  );

  fastify.post<{ Body: { courseInstanceId: number; formData?: Record<string, unknown> } }>(
    '/advanced',
    { preHandler: [authenticate, requireRole('TRAINEE', 'TEAM_LEADER', 'BIS_CDR')] },
    async (request, reply) => {
      const { courseInstanceId, formData } = request.body;
      const flowId = randomUUID();
      const registration = await prisma.$transaction(async (tx) => {
        const created = await tx.courseRegistration.create({
          data: {
            courseInstanceId,
            userId: request.userId!,
            formData: formData === undefined ? undefined : (formData as Prisma.InputJsonValue),
          },
        });
        await appendEvent(tx, {
          eventType: 'registration.submitted',
          aggregateType: 'REGISTRATION',
          aggregateId: created.id,
          actorUserId: request.userId!,
          payload: {
            courseInstanceId,
            userId: request.userId,
            formData: formData === undefined ? null : (formData as Prisma.InputJsonValue),
          },
          flowId,
        });
        return created;
      });
      await logEvent(request.userId!, 'REGISTER', 'REGISTRATION', registration.id, {
        courseInstanceId,
      });
      return reply.status(201).send(registration);
    },
  );

  fastify.get('/mine', { preHandler: [authenticate, requireRole('TRAINEE')] }, async (request) => {
    return prisma.courseRegistration.findMany({
      where: { userId: request.userId },
      include: {
        courseInstance: { include: { course: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  // TL sees team's pending registrations
  fastify.get(
    '/team',
    { preHandler: [authenticate, requireRole('TEAM_LEADER')] },
    async (request) => {
      return prisma.courseRegistration.findMany({
        where: { user: { teamId: request.userTeamId }, status: 'PENDING_TL' },
        include: { user: true, courseInstance: { include: { course: true } } },
        orderBy: { createdAt: 'desc' },
      });
    },
  );

  fastify.get(
    '/branch',
    { preHandler: [authenticate, requireRole('BRANCH_COORD')] },
    async (request) => {
      return prisma.courseRegistration.findMany({
        where: {
          user: { branchId: request.userBranchId },
          status: { in: ['PENDING_COORD', 'PENDING_BIS', 'APPROVED', 'REJECTED'] },
        },
        include: {
          user: { include: { team: true } },
          courseInstance: { include: { course: true } },
          coordApprovedBy: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },
  );

  // Step 1: TL approves → goes to coord
  fastify.patch<{ Params: { id: string }; Body: { tlNotes?: string } }>(
    '/:id/approve-tl',
    { preHandler: [authenticate, requireRole('TEAM_LEADER')] },
    async (request) => {
      const id = Number(request.params.id);
      const flowId = randomUUID();
      return prisma.$transaction(async (tx) => {
        const updated = await tx.courseRegistration.update({
          where: { id },
          data: {
            status: 'PENDING_COORD',
            tlApprovedById: request.userId,
            tlApprovedAt: new Date(),
            tlNotes: request.body.tlNotes,
          },
        });
        await appendEvent(tx, {
          eventType: 'registration.tl_approved',
          aggregateType: 'REGISTRATION',
          aggregateId: id,
          actorUserId: request.userId!,
          payload: { status: 'PENDING_COORD' },
          flowId,
        });
        return updated;
      });
    },
  );

  // Step 2: Coord approves → goes to BIS
  fastify.patch<{ Params: { id: string }; Body: { coordNotes?: string; coordPriority?: number } }>(
    '/:id/prioritize',
    { preHandler: [authenticate, requireRole('BRANCH_COORD')] },
    async (request) => {
      const id = Number(request.params.id);
      const flowId = randomUUID();
      return prisma.$transaction(async (tx) => {
        const updated = await tx.courseRegistration.update({
          where: { id },
          data: {
            status: 'PENDING_BIS',
            coordApprovedById: request.userId,
            coordApprovedAt: new Date(),
            coordNotes: request.body.coordNotes,
            coordPriority: request.body.coordPriority,
          },
        });
        await appendEvent(tx, {
          eventType: 'registration.approved',
          aggregateType: 'REGISTRATION',
          aggregateId: id,
          actorUserId: request.userId!,
          payload: {
            status: 'APPROVED',
            coordNotes: request.body.coordNotes ?? null,
            coordPriority: request.body.coordPriority ?? null,
          },
          flowId,
        });
        return updated;
      });
    },
  );

  fastify.get('/all', { preHandler: [authenticate, requireRole('BIS_CDR')] }, async () => {
    return prisma.courseRegistration.findMany({
      include: {
        user: { include: { team: true, branch: true } },
        courseInstance: { include: { course: true } },
        coordApprovedBy: true,
        bisApprovedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  fastify.patch<{ Params: { id: string }; Body: { bisNotes?: string } }>(
    '/:id/approve-final',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request) => {
      const id = Number(request.params.id);
      const flowId = randomUUID();
      return prisma.$transaction(async (tx) => {
        const updated = await tx.courseRegistration.update({
          where: { id },
          data: {
            status: 'APPROVED',
            bisApprovedById: request.userId,
            bisApprovedAt: new Date(),
            bisNotes: request.body.bisNotes,
          },
        });
        await appendEvent(tx, {
          eventType: 'registration.bis_approved',
          aggregateType: 'REGISTRATION',
          aggregateId: id,
          actorUserId: request.userId!,
          payload: {
            status: 'APPROVED',
            bisNotes: request.body.bisNotes ?? null,
          },
          flowId,
        });
        return updated;
      });
    },
  );

  fastify.patch<{ Params: { id: string }; Body: { rejectionReason?: string } }>(
    '/:id/reject',
    { preHandler: [authenticate, requireRole('BRANCH_COORD', 'BIS_CDR')] },
    async (request) => {
      const id = Number(request.params.id);
      const flowId = randomUUID();
      return prisma.$transaction(async (tx) => {
        const prev = await tx.courseRegistration.findUniqueOrThrow({ where: { id } });
        const updated = await tx.courseRegistration.update({
          where: { id },
          data: {
            status: 'REJECTED',
            rejectionReason: request.body.rejectionReason,
          },
        });
        await appendEvent(tx, {
          eventType: 'registration.rejected',
          aggregateType: 'REGISTRATION',
          aggregateId: id,
          actorUserId: request.userId!,
          payload: {
            previousStatus: prev.status,
            rejectionReason: request.body.rejectionReason ?? null,
            rejectedByRole: request.userRole ?? null,
          },
          flowId,
        });
        return updated;
      });
    },
  );
};
