import fastifyCookie from '@fastify/cookie';
import fastifySecureSession from '@fastify/secure-session';
import type { FastifyInstance } from 'fastify';

declare module '@fastify/secure-session' {
  interface SessionData {
    user: {
      id: number;
      uniqueId: string;
      name: string;
      role: string;
    };
    oauth2State?: string;
  }
}

export async function registerSession(fastify: FastifyInstance) {
  const secret = process.env.SESSION_SECRET || '6d4b2e1992c666f40a6ffde275d932ac0e50353953d05f9c5432eab39252257f';
  const salt = process.env.SESSION_SALT || 'bisli-session-salt-16b';

  await fastify.register(fastifyCookie);
  await fastify.register(fastifySecureSession, {
    sessionName: 'session',
    cookieName: 'bisli_session',
    key: Buffer.from(secret, 'hex'),
    cookie: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  });
}
