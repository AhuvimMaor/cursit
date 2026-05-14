import oauthPlugin from '@fastify/oauth2';
import type { FastifyInstance } from 'fastify';

import { prisma } from '../lib/prisma.js';
import { getEntityByIdentifier } from '../lib/kartoffel.js';

export async function registerOAuth(fastify: FastifyInstance) {
  const enabled = process.env.OAUTH_ENABLED === 'true';
  if (!enabled) {
    fastify.get('/api/auth', async (_req, reply) => {
      return reply.status(501).send({ error: 'OAuth not configured. Use dev login.' });
    });
    return;
  }

  await fastify.register(oauthPlugin, {
    name: 'bisliOAuth',
    scope: ['openid', 'profile', 'email'],
    credentials: {
      client: {
        id: process.env.OAUTH_CLIENT_ID!,
        secret: process.env.OAUTH_CLIENT_SECRET!,
      },
    },
    startRedirectPath: '/api/auth',
    callbackUri: process.env.OAUTH_CALLBACK_URI || 'http://localhost:8000/api/auth/callback',
    discovery: { issuer: process.env.OAUTH_WELL_KNOWN! },
  });

  fastify.get('/api/auth/callback', async (request, reply) => {
    try {
      const { token } = await (fastify as any).bisliOAuth.getAccessTokenFromAuthorizationCodeFlow(request);

      // Decode token to get user info (depends on OIDC provider)
      const userInfo = await (fastify as any).bisliOAuth.userinfo(token.access_token).catch(() => null);

      // Try to find user by identity from token
      const identifier = userInfo?.preferred_username || userInfo?.sub || '';

      // Look up in Kartoffel
      const kartoffelEntity = await getEntityByIdentifier(identifier);

      // Find or create user in DB
      let user = await prisma.user.findFirst({
        where: { uniqueId: kartoffelEntity?.personalNumber || identifier },
      });

      if (!user && kartoffelEntity) {
        user = await prisma.user.create({
          data: {
            uniqueId: kartoffelEntity.personalNumber,
            name: kartoffelEntity.fullName || kartoffelEntity.displayName || identifier,
            role: 'TRAINEE',
          },
        });
      }

      if (!user) {
        return reply.redirect('/auth-error?reason=unknown_user');
      }

      // Set session
      request.session.set('user', {
        id: user.id,
        uniqueId: user.uniqueId,
        name: user.name,
        role: user.role,
      });

      return reply.redirect('/');
    } catch (err) {
      console.error('[OAuth] Callback error:', err);
      return reply.redirect('/auth-error?reason=oauth_error');
    }
  });

  // Check auth endpoint
  fastify.get('/api/auth/check', async (request, reply) => {
    const sessionUser = request.session.get('user');
    if (!sessionUser) {
      return reply.status(401).send({ ok: false });
    }
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { team: true, branch: true },
    });
    if (!user) {
      request.session.delete();
      return reply.status(401).send({ ok: false });
    }
    return { ok: true, user };
  });

  // Logout
  fastify.get('/api/auth/logout', async (request, reply) => {
    request.session.delete();
    return reply.redirect('/');
  });
}
