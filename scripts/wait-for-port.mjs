import { createConnection } from 'node:net';

const port = parseInt(process.argv[2], 10);
const maxAttempts = 120;
const delayMs = 1000;

for (let i = 0; i < maxAttempts; i++) {
  try {
    await new Promise((resolve, reject) => {
      const socket = createConnection({ port, host: 'localhost' });
      socket.on('connect', () => {
        socket.end();
        resolve();
      });
      socket.on('error', reject);
    });
    process.exit(0);
  } catch {
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

console.error(`Port ${port} not available after ${maxAttempts} attempts`);
process.exit(1);
