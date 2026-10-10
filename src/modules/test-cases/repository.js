const selection = `id, title, description, preconditions, steps,
  expected_result AS "expectedResult", priority,
  created_at AS "createdAt", updated_at AS "updatedAt"`;

// Column names come exclusively from this fixed mapping, never from request text.
const columns = {
  title: 'title', description: 'description', preconditions: 'preconditions',
  steps: 'steps', expectedResult: 'expected_result', priority: 'priority',
};

export function createTestCaseRepository(database) {
  return {
    async list({ limit, offset }) {
      const result = await database.query(
        `SELECT ${selection} FROM test_cases ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      return result.rows;
    },
    async findById(id) {
      const result = await database.query(`SELECT ${selection} FROM test_cases WHERE id = $1`, [id]);
      return result.rows[0] ?? null;
    },
    async create(data) {
      const result = await database.query(
        `INSERT INTO test_cases (title, description, preconditions, steps, expected_result, priority)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${selection}`,
        [data.title, data.description, data.preconditions, data.steps, data.expectedResult, data.priority],
      );
      return result.rows[0];
    },
    async update(id, data) {
      const fields = Object.keys(columns).filter((field) => Object.hasOwn(data, field));
      const assignments = fields.map((field, index) => `${columns[field]} = $${index + 1}`);
      const values = fields.map((field) => data[field]);
      values.push(id);
      const result = await database.query(
        `UPDATE test_cases SET ${assignments.join(', ')}, updated_at = clock_timestamp()
         WHERE id = $${values.length} RETURNING ${selection}`, values,
      );
      return result.rows[0] ?? null;
    },
    async remove(id) {
      const result = await database.query('DELETE FROM test_cases WHERE id = $1 RETURNING id', [id]);
      return result.rowCount > 0;
    },
  };
}
