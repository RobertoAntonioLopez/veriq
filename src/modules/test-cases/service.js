import { HttpError } from '../../utils/http-error.js';
import { parseId, parsePagination } from '../../utils/validation.js';
import { validateTestCase } from './validation.js';

function notFound() {
  return new HttpError(404, 'TEST_CASE_NOT_FOUND', 'Caso de prueba no encontrado.');
}

export function createTestCaseService(repository) {
  return {
    async list(query) {
      const pagination = parsePagination(query);
      return { data: await repository.list(pagination), pagination };
    },
    async findById(value) {
      const item = await repository.findById(parseId(value));
      if (!item) throw notFound();
      return item;
    },
    async create(body) {
      return repository.create(validateTestCase(body));
    },
    async update(value, body) {
      const id = parseId(value);
      const data = validateTestCase(body, { partial: true });
      const item = await repository.update(id, data);
      if (!item) throw notFound();
      return item;
    },
    async remove(value) {
      const id = parseId(value);
      try {
        if (!await repository.remove(id)) throw notFound();
      } catch (error) {
        if (['23503', '23001'].includes(error.code)) {
          throw new HttpError(409, 'TEST_CASE_HAS_RUNS', 'No se puede borrar un caso con historial de ejecuciones.');
        }
        throw error;
      }
    },
  };
}
