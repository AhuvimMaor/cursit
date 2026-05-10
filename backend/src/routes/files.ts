import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';

import { logEvent } from '../lib/eventLog.js';
import { prisma } from '../lib/prisma.js';
import { storage } from '../lib/storage.js';
import { authenticate } from '../middleware/auth.js';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const TTL_MONTHS = Number(process.env.FILE_TTL_MONTHS || '3');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

async function processUpload(request: {
  file: () => Promise<
    { filename: string; mimetype: string; file: AsyncIterable<Buffer> } | undefined
  >;
}) {
  const file = await request.file();
  if (!file) return { error: 'No file provided' };
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) return { error: 'File type not allowed' };

  const chunks: Buffer[] = [];
  for await (const chunk of file.file) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  if (buffer.length > MAX_FILE_SIZE) return { error: 'File too large' };

  return { file, buffer };
}

export const fileRoutes = async (fastify: FastifyInstance) => {
  fastify.register(import('@fastify/multipart'), {
    limits: { fileSize: MAX_FILE_SIZE },
  });

  // Upload to registration
  fastify.post<{ Params: { registrationId: string } }>(
    '/upload/registration/:registrationId',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const registrationId = Number(request.params.registrationId);
      const registration = await prisma.courseRegistration.findUnique({
        where: { id: registrationId },
      });
      if (!registration) return reply.status(404).send({ error: 'Registration not found' });

      const result = await processUpload(request);
      if ('error' in result) return reply.status(400).send({ error: result.error });

      const ext = result.file.filename.split('.').pop() || 'bin';
      const storageName = `${randomUUID()}.${ext}`;
      const storageKey = `registrations/${registrationId}/${storageName}`;

      await storage.upload(storageKey, result.buffer, result.file.mimetype);

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + TTL_MONTHS);

      const record = await prisma.attachedFile.create({
        data: {
          registrationId,
          filename: storageName,
          originalName: result.file.filename,
          mimeType: result.file.mimetype,
          size: result.buffer.length,
          storagePath: storageKey,
          uploadedById: request.userId!,
          expiresAt,
        },
      });

      await logEvent(request.userId!, 'UPLOAD_FILE', 'REGISTRATION', record.id, {
        registrationId,
        originalName: result.file.filename,
      });

      return reply.status(201).send(record);
    },
  );

  // Upload to candidacy
  fastify.post<{ Params: { candidacyId: string } }>(
    '/upload/candidacy/:candidacyId',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const candidacyId = Number(request.params.candidacyId);
      const candidacy = await prisma.commandCandidacy.findUnique({ where: { id: candidacyId } });
      if (!candidacy) return reply.status(404).send({ error: 'Candidacy not found' });

      const result = await processUpload(request);
      if ('error' in result) return reply.status(400).send({ error: result.error });

      const ext = result.file.filename.split('.').pop() || 'bin';
      const storageName = `${randomUUID()}.${ext}`;
      const storageKey = `candidacies/${candidacyId}/${storageName}`;

      await storage.upload(storageKey, result.buffer, result.file.mimetype);

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + TTL_MONTHS);

      const record = await prisma.attachedFile.create({
        data: {
          candidacyId,
          filename: storageName,
          originalName: result.file.filename,
          mimeType: result.file.mimetype,
          size: result.buffer.length,
          storagePath: storageKey,
          uploadedById: request.userId!,
          expiresAt,
        },
      });

      await logEvent(request.userId!, 'UPLOAD_FILE', 'CANDIDACY', record.id, {
        candidacyId,
        originalName: result.file.filename,
      });

      return reply.status(201).send(record);
    },
  );

  // Legacy upload route (backwards compat)
  fastify.post<{ Params: { registrationId: string } }>(
    '/upload/:registrationId',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const registrationId = Number(request.params.registrationId);
      const registration = await prisma.courseRegistration.findUnique({
        where: { id: registrationId },
      });
      if (!registration) return reply.status(404).send({ error: 'Registration not found' });

      const result = await processUpload(request);
      if ('error' in result) return reply.status(400).send({ error: result.error });

      const ext = result.file.filename.split('.').pop() || 'bin';
      const storageName = `${randomUUID()}.${ext}`;
      const storageKey = `registrations/${registrationId}/${storageName}`;

      await storage.upload(storageKey, result.buffer, result.file.mimetype);

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + TTL_MONTHS);

      const record = await prisma.attachedFile.create({
        data: {
          registrationId,
          filename: storageName,
          originalName: result.file.filename,
          mimeType: result.file.mimetype,
          size: result.buffer.length,
          storagePath: storageKey,
          uploadedById: request.userId!,
          expiresAt,
        },
      });

      return reply.status(201).send(record);
    },
  );

  // List files for registration
  fastify.get<{ Params: { registrationId: string } }>(
    '/list/registration/:registrationId',
    { preHandler: [authenticate] },
    async (request) => {
      return prisma.attachedFile.findMany({
        where: { registrationId: Number(request.params.registrationId) },
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { name: true } } },
      });
    },
  );

  // List files for candidacy
  fastify.get<{ Params: { candidacyId: string } }>(
    '/list/candidacy/:candidacyId',
    { preHandler: [authenticate] },
    async (request) => {
      return prisma.attachedFile.findMany({
        where: { candidacyId: Number(request.params.candidacyId) },
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { name: true } } },
      });
    },
  );

  // Legacy list route
  fastify.get<{ Params: { registrationId: string } }>(
    '/list/:registrationId',
    { preHandler: [authenticate] },
    async (request) => {
      return prisma.attachedFile.findMany({
        where: { registrationId: Number(request.params.registrationId) },
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { name: true } } },
      });
    },
  );

  // Download (no auth - browser can't send headers on <a> clicks)
  fastify.get<{ Params: { id: string } }>('/download/:id', async (request, reply) => {
    const file = await prisma.attachedFile.findUnique({ where: { id: Number(request.params.id) } });
    if (!file) return reply.status(404).send({ error: 'File not found' });

    const buffer = await storage.getBuffer(file.storagePath);
    return reply
      .header('Content-Type', file.mimeType)
      .header(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      )
      .send(buffer);
  });

  // View inline (no auth - same reason)
  fastify.get<{ Params: { id: string } }>('/view/:id', async (request, reply) => {
    const file = await prisma.attachedFile.findUnique({ where: { id: Number(request.params.id) } });
    if (!file) return reply.status(404).send({ error: 'File not found' });

    const buffer = await storage.getBuffer(file.storagePath);
    return reply
      .header('Content-Type', file.mimeType)
      .header('Content-Disposition', `inline; filename="${encodeURIComponent(file.originalName)}"`)
      .send(buffer);
  });

  // Delete
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const file = await prisma.attachedFile.findUnique({
        where: { id: Number(request.params.id) },
      });
      if (!file) return reply.status(404).send({ error: 'File not found' });

      await storage.delete(file.storagePath);
      await prisma.attachedFile.delete({ where: { id: file.id } });

      await logEvent(request.userId!, 'DELETE_FILE', 'ATTACHED_FILE', file.id, {
        originalName: file.originalName,
      });

      return reply.status(204).send();
    },
  );
};
