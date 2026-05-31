import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { registerOAuth } from './plugins/oauth.js';
import { registerSession } from './plugins/session.js';
import { registerRoutes } from './routes/index.js';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(serverDir, '..', '..', 'frontend', 'dist');

export const createServer = async (): Promise<FastifyInstance> => {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  const tagDescriptions: Record<string, string> = {
    health: 'Service health & readiness',
    auth: 'Authentication, session, users',
    branches: 'Branches (units)',
    courses: 'Courses, instances, phases',
    gantt: 'Gantt timeline data',
    candidacy: 'Command candidacies',
    registrations: 'Course registrations',
    files: 'File upload / download',
    info: 'Info pages',
    events: 'Event log',
    kartoffel: 'Kartoffel directory integration',
    templates: 'Form templates',
  };

  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Bisli API',
        description: 'Cursit/Bisli backend API',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${process.env.PORT || 8001}` }],
      tags: Object.entries(tagDescriptions).map(([name, description]) => ({ name, description })),
    },
  });
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'none',
      deepLinking: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  fastify.addHook('onRoute', (route) => {
    if (!route.url.startsWith('/api/')) return;
    const segment = route.url.split('/')[2];
    if (!segment) return;
    const schema = (route.schema ?? {}) as { tags?: string[]; hide?: boolean };
    if (!schema.tags || schema.tags.length === 0) {
      schema.tags = [segment];
    }
    route.schema = schema;
  });

  // Session + OAuth (production auth)
  await registerSession(fastify);
  await registerOAuth(fastify);

  registerRoutes(fastify);

  const serveStatic = process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true';

  if (serveStatic && existsSync(frontendDist)) {
    await fastify.register(fastifyStatic, {
      root: frontendDist,
      prefix: '/',
    });

    fastify.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api')) {
        reply.code(404).send({ error: 'Not Found' });
        return;
      }
      reply.sendFile('index.html');
    });
  }

  return fastify;
};

export const startServer = async (fastify: FastifyInstance) => {
  const port = Number(process.env.PORT) || 8000;

  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`Server running on port ${port}`);
};
