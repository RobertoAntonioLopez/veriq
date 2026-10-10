import assert from 'node:assert/strict';
import { fixture, dbTest } from '../helpers/database.js';

dbTest('dashboard reports zero for empty data and counts all historical runs and non-closed bugs', async (t) => {
  const { request, pool, create } = await fixture(t, 'dashboard');
  let response = await request();
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data, { testCases: 0, testRuns: 0, passed: 0, failed: 0, blocked: 0, openBugs: 0 });
  const item = await create();
  await create();
  for (const result of ['passed', 'passed', 'failed', 'blocked']) {
    await pool.query(`INSERT INTO test_runs (test_case_id, result, case_snapshot) VALUES ($1, $2, '{}')`, [item.id, result]);
  }
  for (const status of ['open', 'in_progress', 'resolved', 'closed']) {
    await pool.query(`INSERT INTO bugs (title, description, steps_to_reproduce, expected_result, actual_result, severity, status)
      VALUES ('Fixture', 'Description', 'Steps', 'Expected', 'Actual', 'minor', $1)`, [status]);
  }
  response = await request();
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual((await response.json()).data, { testCases: 2, testRuns: 4, passed: 2, failed: 1, blocked: 1, openBugs: 3 });
});
