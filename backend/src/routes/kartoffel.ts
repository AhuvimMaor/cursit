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
    const remote = await getEntitiesByGroup(request.params.groupId);
    if (remote.length > 0) return remote;
    const cached = getCachedMembers();
    return cached.filter((e) => e.directGroup === request.params.groupId);
  });

  // Get members of the same group as a given user (by personalNumber)
  fastify.get<{ Params: { personalNumber: string } }>('/my-team/:personalNumber', async (request) => {
    let cached = getCachedMembers();
    if (cached.length === 0) cached = await loadMembers();
    const me = cached.find((e) => e.personalNumber === request.params.personalNumber);
    if (!me?.directGroup) return [];
    const remote = await getEntitiesByGroup(me.directGroup);
    if (remote.length > 0) return remote.filter((e) => e.personalNumber !== request.params.personalNumber);
    return cached.filter((e) => e.directGroup === me.directGroup && e.personalNumber !== request.params.personalNumber);
  });

  fastify.get('/groups', async () => {
    return getGroups();
  });
};
