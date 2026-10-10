const selection = `id, test_case_id AS "testCaseId", title, description,
  steps_to_reproduce AS "stepsToReproduce", expected_result AS "expectedResult",
  actual_result AS "actualResult", severity, priority, status,
  created_at AS "createdAt", updated_at AS "updatedAt"`;
const columns = {
  testCaseId: 'test_case_id', title: 'title', description: 'description', stepsToReproduce: 'steps_to_reproduce',
  expectedResult: 'expected_result', actualResult: 'actual_result', severity: 'severity', priority: 'priority', status: 'status',
};

export function createBugRepository(database) {
  return {
    async create(data) {
      const fields = Object.keys(columns);
      const response = await database.query(`INSERT INTO bugs (${Object.values(columns).join(', ')})
        VALUES (${fields.map((_, index) => `$${index + 1}`).join(', ')}) RETURNING ${selection}`,
      fields.map((field) => data[field]));
      return response.rows[0];
    },
    async list({ limit, offset, status }) {
      const response = await database.query(`SELECT ${selection} FROM bugs
        WHERE ($3::text IS NULL OR status = $3)
        ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2`, [limit, offset, status ?? null]);
      return response.rows;
    },
    async findById(id) {
      const response = await database.query(`SELECT ${selection} FROM bugs WHERE id = $1`, [id]);
      return response.rows[0] ?? null;
    },
    async update(id, data) {
      const fields = Object.keys(columns).filter((field) => Object.hasOwn(data, field));
      const assignments = fields.map((field, index) => `${columns[field]} = $${index + 1}`);
      const values = fields.map((field) => data[field]);
      values.push(id);
      const response = await database.query(`UPDATE bugs SET ${assignments.join(', ')}, updated_at = clock_timestamp()
        WHERE id = $${values.length} RETURNING ${selection}`, values);
      return response.rows[0] ?? null;
    },
  };
}
