const selection = `id, test_case_id AS "testCaseId", result, notes,
  case_snapshot AS "caseSnapshot", created_at AS "createdAt"`;

export function createTestRunRepository(database) {
  return {
    async create({ testCaseId, result, notes }) {
      // One statement captures the case version and inserts its execution atomically.
      const response = await database.query(`
        INSERT INTO test_runs (test_case_id, result, notes, case_snapshot)
        SELECT id, $2, $3, jsonb_build_object(
          'id', id, 'title', title, 'description', description, 'preconditions', preconditions,
          'steps', steps, 'expectedResult', expected_result, 'priority', priority,
          'createdAt', created_at, 'updatedAt', updated_at)
        FROM test_cases WHERE id = $1 RETURNING ${selection}`, [testCaseId, result, notes]);
      return response.rows[0] ?? null;
    },
    async list({ limit, offset, testCaseId }) {
      const response = await database.query(`SELECT ${selection} FROM test_runs
        WHERE ($3::integer IS NULL OR test_case_id = $3)
        ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2`, [limit, offset, testCaseId ?? null]);
      return response.rows;
    },
    async findById(id) {
      const response = await database.query(`SELECT ${selection} FROM test_runs WHERE id = $1`, [id]);
      return response.rows[0] ?? null;
    },
  };
}
