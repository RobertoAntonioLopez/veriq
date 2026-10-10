import { HttpError } from '../../utils/http-error.js';
import { parseId, parsePagination, validateEnum } from '../../utils/validation.js';
import { validateBug, bugStatuses } from './validation.js';

function relatedCaseError(error) {
  if (error.code === '23503') return new HttpError(404, 'TEST_CASE_NOT_FOUND', 'Caso de prueba relacionado no encontrado.');
  return error;
}

export function createBugService(repository) {
  return {
    async create(body) {
      const data = validateBug(body);
      try {
        return await repository.create(data);
      } catch (error) {
        throw relatedCaseError(error);
      }
    },
    async list(query) {
      const { status, ...paging } = query;
      const pagination = parsePagination(paging);
      const filter = status === undefined ? undefined : validateEnum(status, 'status', bugStatuses);
      return { data: await repository.list({ ...pagination, status: filter }), pagination };
    },
    async findById(value) {
      const data = await repository.findById(parseId(value));
      if (!data) throw new HttpError(404, 'BUG_NOT_FOUND', 'Bug no encontrado.');
      return data;
    },
    async update(value, body) {
      const id = parseId(value);
      const input = validateBug(body, { partial: true });
      let data;
      try {
        data = await repository.update(id, input);
      } catch (error) {
        throw relatedCaseError(error);
      }
      if (!data) throw new HttpError(404, 'BUG_NOT_FOUND', 'Bug no encontrado.');
      return data;
    },
  };
}
