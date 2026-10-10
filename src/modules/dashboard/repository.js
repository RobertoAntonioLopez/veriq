export function createDashboardRepository(database) {
  return {
    async summarize() {
      const response = await database.query(`SELECT
        (SELECT count(*)::integer FROM test_cases) AS "testCases",
        count(*)::integer AS "testRuns",
        count(*) FILTER (WHERE result = 'passed')::integer AS passed,
        count(*) FILTER (WHERE result = 'failed')::integer AS failed,
        count(*) FILTER (WHERE result = 'blocked')::integer AS blocked,
        (SELECT count(*)::integer FROM bugs WHERE status <> 'closed') AS "openBugs"
        FROM test_runs`);
      return response.rows[0];
    },
  };
}
