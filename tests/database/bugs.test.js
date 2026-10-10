import assert from 'node:assert/strict';
import { fixture, dbTest } from '../helpers/database.js';
const valid = { title: 'No se guarda el formulario', description: 'El botón no responde', stepsToReproduce: 'Completar y guardar',
  expectedResult: 'Se guarda', actualResult: 'No hay cambios', severity: 'major' };

dbTest('bugs keep severity independent from priority and support lifecycle updates', async (t) => {
  const { request, create } = await fixture(t, 'bugs');
  const testCase = await create();
  const response = await request('', 'POST', { ...valid, testCaseId: testCase.id, priority: 'low' });
  assert.equal(response.status, 201);
  const { data } = await response.json();
  assert.equal(data.status, 'open');
  assert.equal(data.severity, 'major');
  assert.equal(data.priority, 'low');
  assert.equal(response.headers.get('location'), `/api/bugs/${data.id}`);
  for (const status of ['in_progress', 'resolved', 'closed', 'open']) {
    const edit = await request(`/${data.id}`, 'PATCH', { status });
    assert.equal(edit.status, 200);
    const updated = (await edit.json()).data;
    assert.equal(updated.status, status);
    assert.equal(updated.description, valid.description);
  }
  assert.equal((await request(`/${data.id}`, 'PATCH', { testCaseId: null })).status, 200);
  assert.equal((await (await request(`/${data.id}`)).json()).data.testCaseId, null);
  const list = await request('?status=open&limit=1');
  assert.equal((await list.json()).data[0].id, data.id);
  assert.deepEqual((await (await request('?status=closed')).json()).data, []);
});

dbTest('bugs validate required data, filters and optional relationships atomically', async (t) => {
  const { request, pool } = await fixture(t, 'bugs');
  for (const body of [{}, { ...valid, severity: 'urgent' }, { ...valid, priority: 'critical' }, { ...valid, status: 'done' },
    { ...valid, title: 'a'.repeat(201) }, { ...valid, actualResult: ' ' }, { ...valid, testCaseId: '1' }, { ...valid, other: 'x' }]) {
    assert.equal((await request('', 'POST', body)).status, 400);
  }
  assert.equal((await request('', 'POST', { ...valid, testCaseId: 999 })).status, 404);
  assert.equal((await pool.query('SELECT count(*) FROM bugs')).rows[0].count, '0');
  const response = await request('', 'POST', valid);
  assert.equal(response.status, 201);
  const { data } = await response.json();
  assert.equal(data.testCaseId, null);
  assert.equal((await request(`/${data.id}`, 'PATCH', { testCaseId: 999, title: 'No guardar' })).status, 404);
  assert.equal((await (await request(`/${data.id}`)).json()).data.title, valid.title);
  assert.equal((await request(`/${data.id}`, 'PATCH', {})).status, 400);
  assert.equal((await request('/999', 'PATCH', { status: 'closed' })).status, 404);
  assert.equal((await request('/999')).status, 404);
  assert.equal((await request('?status=unknown')).status, 400);
  assert.equal((await request('?status=open&status=closed')).status, 400);
  assert.equal((await request('?unknown=1')).status, 400);
});
