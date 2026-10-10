import assert from 'node:assert/strict';
import { fixture, dbTest } from '../helpers/database.js';

dbTest('runs append results, filter by case and preserve the executed version', async (t) => {
  const { create, request, pool } = await fixture(t, 'test-runs');
  const first = await create();
  const second = await create();
  const ids = [];
  for (const result of ['passed', 'failed', 'blocked']) {
    const response = await request('', 'POST', { testCaseId: first.id, result, notes: ' Observado ' });
    assert.equal(response.status, 201);
    const { data } = await response.json();
    ids.push(data.id);
    assert.equal(data.caseSnapshot.expectedResult, first.expectedResult);
    assert.equal(data.notes, 'Observado');
    assert.equal(response.headers.get('location'), `/api/test-runs/${data.id}`);
  }
  assert.equal((await request('', 'POST', { testCaseId: second.id, result: 'passed' })).status, 201);
  const response = await request(`?testCaseId=${first.id}&limit=2`);
  const body = await response.json();
  assert.deepEqual(body.data.map((row) => row.id), ids.slice(1).reverse());
  await pool.query('UPDATE test_cases SET title = $1 WHERE id = $2', ['Editado', first.id]);
  const detail = await request(`/${ids[0]}`);
  assert.equal((await detail.json()).data.caseSnapshot.title, first.title);
  assert.equal((await request(`/${ids[0]}`, 'PATCH', { result: 'failed' })).status, 404);
  assert.equal((await request(`/${ids[0]}`, 'DELETE')).status, 404);
  assert.equal((await pool.query('SELECT count(*) FROM test_runs')).rows[0].count, '4');
});

dbTest('runs reject invalid fields, missing cases and invalid filters without writes', async (t) => {
  const { request, pool } = await fixture(t, 'test-runs');
  for (const body of [{}, { testCaseId: '1', result: 'passed' }, { testCaseId: 1, result: 'unknown' },
    { testCaseId: 1, result: 'passed', notes: null }, { testCaseId: 1, result: 'passed', notes: 'a'.repeat(10001) },
    { testCaseId: 1, result: 'passed', extra: true }]) {
    assert.equal((await request('', 'POST', body)).status, 400);
  }
  assert.equal((await request('', 'POST', { testCaseId: 999, result: 'passed' })).status, 404);
  assert.equal((await request('/999')).status, 404);
  assert.equal((await request('?testCaseId=0')).status, 400);
  assert.equal((await request('?testCaseId=1&testCaseId=2')).status, 400);
  assert.equal((await request('?unknown=1')).status, 400);
  assert.equal((await pool.query('SELECT count(*) FROM test_runs')).rows[0].count, '0');
});
