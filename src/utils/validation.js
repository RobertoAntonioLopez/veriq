import { HttpError } from './http-error.js';

export function invalidInput(message) {
  return new HttpError(400, 'VALIDATION_ERROR', message);
}

export function parseId(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    throw invalidInput('El ID debe ser un entero positivo.');
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id > 2147483647) {
    throw invalidInput('El ID está fuera del rango permitido.');
  }
  return id;
}

export function parsePagination(query) {
  const unknown = Object.keys(query).filter((key) => !['limit', 'offset'].includes(key));
  if (unknown.length) throw invalidInput('Parámetro de consulta desconocido.');
  const pagination = {};
  for (const [field, fallback, minimum, maximum] of [
    ['limit', 20, 1, 100], ['offset', 0, 0, 2147483647],
  ]) {
    const value = query[field];
    if (value === undefined) {
      pagination[field] = fallback;
      continue;
    }
    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
      throw invalidInput(`${field} debe ser un entero.`);
    }
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
      throw invalidInput(`${field} debe estar entre ${minimum} y ${maximum}.`);
    }
    pagination[field] = number;
  }
  return pagination;
}
