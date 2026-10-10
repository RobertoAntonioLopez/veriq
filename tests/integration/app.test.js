import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../../src/app.js';

async function startApp(t, database) {
  const app = createApp({ database, logger: { error() {} } });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('health responds without a database', async (t) => {
  const url = await startApp(t);
  const response = await fetch(`${url}/api/health`);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.deepEqual(await response.json(), { data: { status: 'ok', name: 'VeriQ' } });
});

test('readiness checks the database', async (t) => {
  const queries = [];
  const url = await startApp(t, { async query(sql) { queries.push(sql); } });
  const response = await fetch(`${url}/api/ready`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: { status: 'ready' } });
  assert.deepEqual(queries, ['SELECT 1']);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

for (const [name, database] of [
  ['missing', null],
  ['failing', { async query() { throw new Error('secret connection details'); } }],
]) {
  test(`readiness returns 503 for ${name} database without leaking details`, async (t) => {
    const url = await startApp(t, database);
    const response = await fetch(`${url}/api/ready`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: {
      code: 'DATABASE_UNAVAILABLE', message: 'La base de datos no está disponible.',
    } });
  });
}

test('unknown route returns JSON 404', async (t) => {
  const url = await startApp(t);
  const response = await fetch(`${url}/api/missing`);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).error.code, 'NOT_FOUND');
});

test('malformed JSON returns 400', async (t) => {
  const url = await startApp(t);
  const response = await fetch(`${url}/api/missing`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{',
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, 'INVALID_JSON');
});

test('oversized JSON returns 413', async (t) => {
  const url = await startApp(t);
  const response = await fetch(`${url}/api/missing`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'a'.repeat(66000) }),
  });
  assert.equal(response.status, 413);
  assert.equal((await response.json()).error.code, 'PAYLOAD_TOO_LARGE');
});
