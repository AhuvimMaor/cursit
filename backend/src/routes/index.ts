import type { FastifyInstance } from 'fastify';

import { healthRoutes } from './health.js';
import { missionRoutes } from './missions.js';
import { scoreRoutes } from './scores.js';
import { studentRoutes } from './students.js';

export const registerRoutes = (fastify: FastifyInstance) => {
  fastify.register(healthRoutes, { prefix: '/api/health' });
  fastify.register(studentRoutes, { prefix: '/api/students' });
  fastify.register(missionRoutes, { prefix: '/api/missions' });
  fastify.register(scoreRoutes, { prefix: '/api/scores' });
};
