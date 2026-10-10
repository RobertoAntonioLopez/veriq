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

export function validateObject(body, allowedFields, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw invalidInput('El cuerpo debe ser un objeto JSON.');
  }
  const keys = Object.keys(body);
  if (keys.some((key) => !allowedFields.includes(key))) throw invalidInput('El cuerpo contiene campos desconocidos.');
  if (partial && keys.length === 0) throw invalidInput('Incluye al menos un campo para editar.');
}

export function validateText(value, field, { required = true, maximum = 10000 } = {}) {
  if (typeof value !== 'string' || value.includes('\u0000')) throw invalidInput(`${field} debe ser texto válido.`);
  const text = value.trim();
  if (required && !text) throw invalidInput(`${field} es obligatorio.`);
  if (Array.from(text).length > maximum) throw invalidInput(`${field} admite hasta ${maximum} caracteres.`);
  return text;
}

export function validateEnum(value, field, choices) {
  if (!choices.includes(value)) throw invalidInput(`${field} debe ser ${choices.join(', ')}.`);
  return value;
}

export function validateReference(value) {
  if (!Number.isInteger(value) || value < 1 || value > 2147483647) {
    throw invalidInput('testCaseId debe ser un entero positivo.');
  }
  return value;
}
