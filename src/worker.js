import { env } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';
import pg from 'pg';
import { createApp } from './app.js';

// Connections belong to the current request; never share sockets across requests.
const database = {
  async query(text, values) {
    const connectionString = env.HYPERDRIVE?.connectionString ?? env.DATABASE_URL;
    if (!connectionString) throw new Error('Database connection is not configured');
    const client = new pg.Client({
      connectionString,
      connectionTimeoutMillis: 5000,
      statement_timeout: 5000,
    });
    try {
      await client.connect();
      return await client.query(text, values);
    } finally {
      await client.end();
    }
  },
};

const app = createApp({ database, serveStatic: false });
app.listen(3000);
export default httpServerHandler({ port: 3000 });
