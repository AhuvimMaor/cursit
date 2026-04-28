import 'dotenv/config';

import { createServer, startServer } from './server.js';

const main = async () => {
  const fastify = createServer();
  await startServer(fastify);
};

main().catch((err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});
