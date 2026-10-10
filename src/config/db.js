import pg from 'pg';

export function createDatabase(connectionString) {
  if (!connectionString) return null;
  return new pg.Pool({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 2000,
    idleTimeoutMillis: 10000,
    statement_timeout: 5000,
  });
}
