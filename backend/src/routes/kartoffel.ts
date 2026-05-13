import type { FastifyInstance } from 'fastify';

import {
  getCachedMembers,
  getCacheTimestamp,
  getEntitiesByGroup,
  getEntityByIdentifier,
  getGroups,
  isKartoffelEnabled,
  loadMembers,
} from '../lib/kartoffel.js';

export const kartoffelRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/status', async () => ({
    enabled: isKartoffelEnabled(),
    cachedAt: getCacheTimestamp()?.toISOString() ?? null,
    cachedCount: getCachedMembers().length,
  }));

  fastify.get<{ Querystring: { q?: string } }>('/search', async (request) => {
    const q = request.query.q;
    if (!q || q.length < 2) return [];
    let cached = getCachedMembers();
    if (cached.length === 0) cached = await loadMembers();
    return cached.filter((e) => e.fullName?.includes(q) || e.displayName?.includes(q)).slice(0, 20);
  });

  fastify.get('/members', async () => {
    const cached = getCachedMembers();
    if (cached.length > 0) return cached;
    return loadMembers();
  });

  fastify.post('/refresh', async () => {
    const members = await loadMembers();
    return { count: members.length, cachedAt: getCacheTimestamp()?.toISOString() };
  });

  fastify.get<{ Params: { identifier: string } }>('/person/:identifier', async (request) => {
    return getEntityByIdentifier(request.params.identifier);
  });

  fastify.get<{ Params: { groupId: string } }>('/group/:groupId/members', async (request) => {
    return getEntitiesByGroup(request.params.groupId);
  });

  fastify.get('/groups', async () => {
    return getGroups();
  });
};
