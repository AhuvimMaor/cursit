import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'crypto';

import { prisma } from '../lib/prisma.js';
import { storage } from '../lib/storage.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export const templateRoutes = async (fastify: FastifyInstance) => {
  fastify.register(import('@fastify/multipart'), {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  // List all active templates
  fastify.get('/', async () => {
    return prisma.formTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  // Create template (admin only)
  fastify.post(
    '/',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const parts = request.parts();
      let name = '';
      let type = 'registration';
      let fields = '[]';
      let courseId: number | null = null;
      let pdfPath: string | null = null;
      let pdfName: string | null = null;

      for await (const part of parts) {
        if (part.type === 'field') {
          if (part.fieldname === 'name') name = part.value as string;
          if (part.fieldname === 'type') type = part.value as string;
          if (part.fieldname === 'fields') fields = part.value as string;
          if (part.fieldname === 'courseId') courseId = Number(part.value) || null;
        } else if (part.type === 'file' && part.fieldname === 'pdf') {
          const chunks: Buffer[] = [];
          for await (const chunk of part.file) chunks.push(chunk);
          const buffer = Buffer.concat(chunks);
          const ext = (part.filename ?? 'template.pdf').split('.').pop() || 'pdf';
          const key = `templates/${randomUUID()}.${ext}`;
          await storage.upload(key, buffer, part.mimetype);
          pdfPath = key;
          pdfName = part.filename ?? 'template.pdf';
        }
      }

      if (!name) return reply.status(400).send({ error: 'Name required' });

      const template = await prisma.formTemplate.create({
        data: {
          name,
          type,
          fields: JSON.parse(fields),
          courseId,
          pdfPath,
          pdfName,
        },
      });

      return reply.status(201).send(template);
    },
  );

  // Update template
  fastify.patch<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const id = Number(request.params.id);
      const body = request.body as { name?: string; fields?: any; isActive?: boolean };
      return prisma.formTemplate.update({
        where: { id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.fields && { fields: body.fields }),
          ...(body.isActive !== undefined && { isActive: body.isActive }),
        },
      });
    },
  );

  // Download template PDF
  fastify.get<{ Params: { id: string } }>('/:id/pdf', async (request, reply) => {
    const template = await prisma.formTemplate.findUnique({ where: { id: Number(request.params.id) } });
    if (!template?.pdfPath) return reply.status(404).send({ error: 'No PDF' });

    const buffer = await storage.getBuffer(template.pdfPath);
    return reply
      .header('Content-Type', 'application/pdf')
      .header('Content-Disposition', `attachment; filename="${encodeURIComponent(template.pdfName ?? 'template.pdf')}"`)
      .send(buffer);
  });

  // Delete template
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    { preHandler: [authenticate, requireRole('BIS_CDR')] },
    async (request, reply) => {
      const id = Number(request.params.id);
      const template = await prisma.formTemplate.findUnique({ where: { id } });
      if (template?.pdfPath) await storage.delete(template.pdfPath);
      await prisma.formTemplate.delete({ where: { id } });
      return reply.status(204).send();
    },
  );
};
