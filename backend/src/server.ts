import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { registerRoutes } from './routes/index.js';

const frontendDist = path.join(process.cwd(), 'frontend', 'dist');

export const createServer = async (): Promise<FastifyInstance> => {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

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
