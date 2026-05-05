import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: number;
    userRole?: string;
    userBranchId?: number | null;
    userTeamId?: number | null;
  }
}
