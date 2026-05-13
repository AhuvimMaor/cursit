import type { FastifyInstance } from 'fastify';

import {
  getCachedMembers,
  getCacheTimestamp,
  getEntityByIdentityCard,
  getEntityByPersonalNumber,
  getGroupChildren,
  getGroupMembers,
  getRootMembers,
  isKartoffelEnabled,
  searchEntities,
} from '../lib/kartoffel.js';

export const kartoffelRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/status', async () => ({
    enabled: isKartoffelEnabled(),
    cachedAt: getCacheTimestamp()?.toISOString() ?? null,
    cachedCount: getCachedMembers().length,
  }));

  fastify.get<{ Querystring: { q: string } }>('/search', async (request) => {
    const { q } = request.query;
    if (!q || q.length < 2) return [];
    return searchEntities(q);
  });

  fastify.get('/members', async () => {
    const cached = getCachedMembers();
    if (cached.length > 0) return cached;
    return getRootMembers();
  });

  fastify.post('/refresh', async () => {
    const members = await getRootMembers();
    return { count: members.length, cachedAt: getCacheTimestamp()?.toISOString() };
  });

  fastify.get<{ Params: { personalNumber: string } }>(
    '/person/:personalNumber',
    async (request) => {
      return getEntityByPersonalNumber(request.params.personalNumber);
    },
  );

  fastify.get<{ Params: { id: string } }>('/person/id/:id', async (request) => {
    return getEntityByIdentityCard(request.params.id);
  });

  fastify.get<{ Params: { groupId: string } }>('/group/:groupId/members', async (request) => {
    return getGroupMembers(request.params.groupId);
  });

  fastify.get<{ Params: { groupId: string } }>('/group/:groupId/children', async (request) => {
    return getGroupChildren(request.params.groupId);
  });
};
