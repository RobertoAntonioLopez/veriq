import assert from 'node:assert/strict';
import { fixture, dbTest } from '../helpers/database.js';
const payload = { title: 'Crear un caso', steps: 'Enviar POST', expectedResult: 'Respuesta 201' };

dbTest('CRUD persists data and preserves fields on PATCH', async (t) => {
  const { pool, request, create, errors } = await fixture(t);
  const item = await create();
  assert.equal(item.priority, 'medium');
  const stored = await pool.query('SELECT title FROM test_cases WHERE id = $1', [item.id]);
  assert.equal(stored.rows[0].title, payload.title);
  const detail = await request(`/${item.id}`);
  assert.equal(detail.status, 200);
  assert.deepEqual((await detail.json()).data, item);
  const edit = await request(`/${item.id}`, 'PATCH', { priority: 'high' });
  assert.equal(edit.status, 200);
  const updated = (await edit.json()).data;
  assert.equal(updated.priority, 'high');
  assert.equal(updated.title, item.title);
  assert.equal(updated.createdAt, item.createdAt);
  assert.ok(Date.parse(updated.updatedAt) >= Date.parse(item.updatedAt));
  const removed = await request(`/${item.id}`, 'DELETE');
  assert.equal(removed.status, 204);
  assert.equal(await removed.text(), '');
  assert.equal((await request(`/${item.id}`)).status, 404);
  assert.equal((await pool.query('SELECT count(*) FROM test_cases')).rows[0].count, '0');
  assert.deepEqual(errors, []);
});

dbTest('pagination orders newest first, accepts duplicates and returns empty pages', async (t) => {
  const { request, create } = await fixture(t);
  const first = await create();
  const second = await create();
  assert.notEqual(first.id, second.id);
  let result = await request('?limit=1&offset=0');
  let body = await result.json();
  assert.deepEqual(body.pagination, { limit: 1, offset: 0 });
  assert.deepEqual(body.data.map((item) => item.id), [second.id]);
  result = await request('?limit=1&offset=1');
  assert.deepEqual((await result.json()).data.map((item) => item.id), [first.id]);
  result = await request('?offset=20');
  assert.deepEqual((await result.json()).data, []);
});

dbTest('invalid inputs never insert or modify records', async (t) => {
  const { pool, request, create } = await fixture(t);
  for (const body of [{}, { ...payload, title: ' ' }, { ...payload, priority: 'urgent' }, { ...payload, title: 'a'.repeat(201) }, { ...payload, extra: true }, { ...payload, steps: null }, { ...payload, description: '\u0000' }]) {
    const response = await request('', 'POST', body);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).error.code, 'VALIDATION_ERROR');
  }
  assert.equal((await pool.query('SELECT count(*) FROM test_cases')).rows[0].count, '0');
  const item = await create();
  assert.equal((await request(`/${item.id}`, 'PATCH', {})).status, 400);
  assert.equal((await request(`/${item.id}`, 'PATCH', { id: 9 })).status, 400);
  assert.deepEqual((await (await request(`/${item.id}`)).json()).data, item);
  for (const path of ['/0', '/1.5', '/2147483648', '?limit=0', '?limit=101', '?offset=-1', '?limit=1&limit=2', '?unknown=1']) {
    assert.equal((await request(path)).status, 400, path);
  }
});

dbTest('missing resources return 404 for read, edit and delete', async (t) => {
  const { request } = await fixture(t);
  for (const [method, body] of [['GET'], ['PATCH', { title: 'Nuevo' }], ['DELETE']]) {
    const response = await request('/123', method, body);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error.code, 'TEST_CASE_NOT_FOUND');
  }
});

dbTest('SQL-looking text is stored literally and Unicode boundaries persist', async (t) => {
  const { pool, create } = await fixture(t);
  const text = "Robert'); DROP TABLE test_cases; --";
  const item = await create({ ...payload, title: text });
  assert.equal(item.title, text);
  const unicode = await create({ ...payload, title: '😀'.repeat(200), steps: 'a'.repeat(10000) });
  assert.equal(unicode.title, '😀'.repeat(200));
  assert.equal((await pool.query('SELECT count(*) FROM test_cases')).rows[0].count, '2');
});

dbTest('existing runs prevent deletion and retain their snapshot after editing', async (t) => {
  const { pool, request, create, errors } = await fixture(t);
  const item = await create();
  await pool.query(`INSERT INTO test_runs (test_case_id, result, case_snapshot)
    SELECT id, 'passed', to_jsonb(test_cases) FROM test_cases WHERE id = $1`, [item.id]);
  const response = await request(`/${item.id}`, 'DELETE');
  assert.equal(response.status, 409, JSON.stringify(errors.map(({ code, message }) => ({ code, message }))));
  assert.equal((await response.json()).error.code, 'TEST_CASE_HAS_RUNS');
  assert.equal((await request(`/${item.id}`, 'PATCH', { title: 'Caso editado' })).status, 200);
  const run = await pool.query('SELECT case_snapshot FROM test_runs WHERE test_case_id = $1', [item.id]);
  assert.equal(run.rows[0].case_snapshot.title, item.title);
  assert.equal((await request(`/${item.id}`)).status, 200);
});

dbTest('deleting a case keeps its bug and clears the optional relation', async (t) => {
  const { pool, request, create } = await fixture(t);
  const item = await create();
  await pool.query(`INSERT INTO bugs (test_case_id, title, description, steps_to_reproduce,
    expected_result, actual_result, severity) VALUES ($1, 'Fixture', 'Fixture', 'Steps', 'Expected', 'Actual', 'major')`, [item.id]);
  assert.equal((await request(`/${item.id}`, 'DELETE')).status, 204);
  const bugs = await pool.query('SELECT test_case_id FROM bugs');
  assert.deepEqual(bugs.rows, [{ test_case_id: null }]);
});

dbTest('database constraints reject invalid priority, empty titles and orphan runs', async (t) => {
  const { pool } = await fixture(t);
  for (const [title, priority] of [['Valid', 'urgent'], [' ', 'medium']]) {
    await assert.rejects(pool.query(`INSERT INTO test_cases (title, steps, expected_result, priority)
      VALUES ($1, 'Steps', 'Expected', $2)`, [title, priority]), { code: '23514' });
  }
  await assert.rejects(pool.query(`INSERT INTO test_runs (test_case_id, result, case_snapshot)
    VALUES (999, 'passed', '{}')`), { code: '23503' });
});
