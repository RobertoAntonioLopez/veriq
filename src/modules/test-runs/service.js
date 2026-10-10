import { HttpError } from '../../utils/http-error.js';
import { parseId, parsePagination } from '../../utils/validation.js';
import { validateTestRun } from './validation.js';

export function createTestRunService(repository) {
  return {
    async create(body) {
      const input = validateTestRun(body);
      let data;
      try {
        data = await repository.create(input);
      } catch (error) {
        if (error.code !== '23503') throw error;
      }
      if (!data) throw new HttpError(404, 'TEST_CASE_NOT_FOUND', 'Caso de prueba no encontrado.');
      return data;
    },
    async list(query) {
      const { testCaseId, ...paging } = query;
      const pagination = parsePagination(paging);
      const filter = testCaseId === undefined ? undefined : parseId(testCaseId);
      return { data: await repository.list({ ...pagination, testCaseId: filter }), pagination };
    },
    async findById(value) {
      const data = await repository.findById(parseId(value));
      if (!data) throw new HttpError(404, 'TEST_RUN_NOT_FOUND', 'Ejecución no encontrada.');
      return data;
    },
  };
}
