import { createApp } from './app.js';
import { createDatabase } from './config/db.js';

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535');
}
const database = createDatabase(process.env.DATABASE_URL);
database?.on('error', (error) => console.error('PostgreSQL pool error:', error));
const app = createApp({ database });
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`VeriQ: http://127.0.0.1:${port}`);
});
server.on('error', async (error) => {
  console.error('Unable to start VeriQ:', error);
  await database?.end();
  process.exitCode = 1;
});

let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  server.close(async () => {
    try {
      await database?.end();
    } catch (error) {
      console.error('Unable to close database:', error);
      process.exitCode = 1;
    } finally {
      clearTimeout(timeout);
    }
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
