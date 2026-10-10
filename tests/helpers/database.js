import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { createApp } from '../../src/app.js';

const connectionString = process.env.TEST_DATABASE_URL;
const payload = { title: 'Crear un caso', steps: 'Enviar POST', expectedResult: 'Respuesta 201' };

export async function fixture(t, resource = 'test-cases') {
  const url = new URL(connectionString);
  const databaseName = decodeURIComponent(url.pathname.slice(1));
  assert.match(databaseName, /_test$/, 'TEST_DATABASE_URL must name a database ending in _test');
  if (process.env.DATABASE_URL) {
    const developmentName = decodeURIComponent(new URL(process.env.DATABASE_URL).pathname.slice(1));
    assert.notEqual(databaseName, developmentName, 'Use a database distinct from development');
  }
  const admin = new pg.Pool({ connectionString, connectionTimeoutMillis: 2000 });
  const schema = `qa_${randomUUID().replaceAll('-', '')}`;
  let pool;
  let server;
  t.after(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      });
    }
    await pool?.end();
    try {
      await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    } finally {
      await admin.end();
    }
  });
  const current = await admin.query('SELECT current_database() AS name');
  assert.equal(current.rows[0].name, databaseName);
  await admin.query(`CREATE SCHEMA ${schema}`);
  pool = new pg.Pool({ connectionString, options: `-c search_path=${schema}`, connectionTimeoutMillis: 2000 });
  await pool.query(await readFile(new URL('../../database/schema.sql', import.meta.url), 'utf8'));
  const errors = [];
  server = createApp({ database: pool, logger: { error(error) { errors.push(error); } } }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/${resource}`;
  async function request(path = '', method = 'GET', body) {
    return fetch(`${baseUrl}${path}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  async function create(body = payload) {
    const response = await fetch(`${baseUrl.replace(/\/[^/]+$/, '')}/test-cases`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal(response.status, 201);
    const { data } = await response.json();
    assert.equal(response.headers.get('location'), `/api/test-cases/${data.id}`);
    return data;
  }
  return { pool, request, create, errors };
}

export const dbTest = (name, fn) => test(name, { skip: !connectionString && 'Set TEST_DATABASE_URL to run real PostgreSQL tests' }, fn);

