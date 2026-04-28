import cors from '@fastify/cors';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

import { registerRoutes } from './routes/index.js';

export const createServer = (): FastifyInstance => {
  const fastify = Fastify({
    logger: true,
  });

  fastify.register(cors, {
    origin: true,
  });

  registerRoutes(fastify);

  return fastify;
};

export const startServer = async (fastify: FastifyInstance) => {
  const port = Number(process.env.PORT) || 8000;

  await fastify.listen({ port, host: '0.0.0.0' });
  console.log(`Server running on port ${port}`);
};
