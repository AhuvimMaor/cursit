import type { FastifyInstance } from 'fastify';

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
      const registration = await prisma.courseRegistration.create({
        data: {
          courseInstanceId,
          userId,
          status: (status as 'APPROVED' | 'PENDING_TL') ?? 'APPROVED',
          bisApprovedById: request.userId,
          bisApprovedAt: new Date(),
        },
        include: { user: true, courseInstance: { include: { course: true } } },
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
    { preHandler: [authenticate, requireRole('TRAINEE')] },
    async (request, reply) => {
      const { courseInstanceId, formData } = request.body;
      const registration = await prisma.courseRegistration.create({
        data: {
          courseInstanceId,
          userId: request.userId!,
          formData: formData ?? undefined,
        },
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

  // Team leader sees team registrations
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

  // Team leader approves
  fastify.patch<{ Params: { id: string }; Body: { tlNotes?: string } }>(
    '/:id/approve-tl',
    { preHandler: [authenticate, requireRole('TEAM_LEADER')] },
    async (request) => {
      return prisma.courseRegistration.update({
        where: { id: Number(request.params.id) },
        data: {
          status: 'PENDING_COORD',
          tlApprovedById: request.userId,
          tlApprovedAt: new Date(),
          tlNotes: request.body.tlNotes,
        },
      });
    },
  );

  fastify.patch<{ Params: { id: string }; Body: { coordNotes?: string; coordPriority?: number } }>(
    '/:id/prioritize',
    { preHandler: [authenticate, requireRole('BRANCH_COORD')] },
    async (request) => {
      return prisma.courseRegistration.update({
        where: { id: Number(request.params.id) },
        data: {
          status: 'PENDING_BIS',
          coordApprovedById: request.userId,
          coordApprovedAt: new Date(),
          coordNotes: request.body.coordNotes,
          coordPriority: request.body.coordPriority,
        },
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
      return prisma.courseRegistration.update({
        where: { id: Number(request.params.id) },
        data: {
          status: 'APPROVED',
          bisApprovedById: request.userId,
          bisApprovedAt: new Date(),
          bisNotes: request.body.bisNotes,
        },
      });
    },
  );

  fastify.patch<{ Params: { id: string }; Body: { rejectionReason?: string } }>(
    '/:id/reject',
    { preHandler: [authenticate, requireRole('BRANCH_COORD', 'BIS_CDR')] },
    async (request) => {
      return prisma.courseRegistration.update({
        where: { id: Number(request.params.id) },
        data: {
          status: 'REJECTED',
          rejectionReason: request.body.rejectionReason,
        },
      });
    },
  );
};
