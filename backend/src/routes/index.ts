import type { FastifyInstance } from 'fastify';

import { authRoutes } from './auth.js';
import { branchRoutes } from './branches.js';
import { candidacyRoutes } from './candidacy.js';
import { courseRoutes } from './courses.js';
import { eventRoutes } from './events.js';
import { fileRoutes } from './files.js';
import { ganttRoutes } from './gantt.js';
import { healthRoutes } from './health.js';
import { infoRoutes } from './info.js';
import { kartoffelRoutes } from './kartoffel.js';
import { registrationRoutes } from './registrations.js';
import { templateRoutes } from './templates.js';

export const registerRoutes = (fastify: FastifyInstance) => {
  fastify.register(healthRoutes, { prefix: '/api/health' });
  fastify.register(authRoutes, { prefix: '/api/auth' });
  fastify.register(branchRoutes, { prefix: '/api/branches' });
  fastify.register(courseRoutes, { prefix: '/api/courses' });
  fastify.register(ganttRoutes, { prefix: '/api/gantt' });
  fastify.register(candidacyRoutes, { prefix: '/api/candidacy' });
  fastify.register(registrationRoutes, { prefix: '/api/registrations' });
  fastify.register(fileRoutes, { prefix: '/api/files' });
  fastify.register(infoRoutes, { prefix: '/api/info' });
  fastify.register(eventRoutes, { prefix: '/api/events' });
  fastify.register(kartoffelRoutes, { prefix: '/api/kartoffel' });
  fastify.register(templateRoutes, { prefix: '/api/templates' });
};
