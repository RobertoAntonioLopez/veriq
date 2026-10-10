import { invalidInput } from '../../utils/validation.js';

const textFields = {
  title: { required: true, maximum: 200 },
  description: { required: false, maximum: 10000 },
  preconditions: { required: false, maximum: 10000 },
  steps: { required: true, maximum: 10000 },
  expectedResult: { required: true, maximum: 10000 },
};
const allowedFields = [...Object.keys(textFields), 'priority'];

export function validateTestCase(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw invalidInput('El cuerpo debe ser un objeto JSON.');
  }
  const keys = Object.keys(body);
  if (keys.some((key) => !allowedFields.includes(key))) {
    throw invalidInput('El cuerpo contiene campos desconocidos.');
  }
  if (partial && keys.length === 0) throw invalidInput('Incluye al menos un campo para editar.');

  const result = {};
  for (const [field, { required, maximum }] of Object.entries(textFields)) {
    if (!Object.hasOwn(body, field)) {
      if (partial) continue;
      if (required) throw invalidInput(`${field} es obligatorio.`);
      result[field] = '';
      continue;
    }
    if (typeof body[field] !== 'string') throw invalidInput(`${field} debe ser texto.`);
    if (body[field].includes('\u0000')) throw invalidInput(`${field} contiene un carácter no permitido.`);
    const value = body[field].trim();
    if (required && value.length === 0) throw invalidInput(`${field} es obligatorio.`);
    // Count Unicode code points, like PostgreSQL char_length, rather than UTF-16 units.
    if (Array.from(value).length > maximum) throw invalidInput(`${field} admite hasta ${maximum} caracteres.`);
    result[field] = value;
  }
  if (Object.hasOwn(body, 'priority')) {
    if (!['low', 'medium', 'high'].includes(body.priority)) {
      throw invalidInput('priority debe ser low, medium o high.');
    }
    result.priority = body.priority;
  } else if (!partial) {
    result.priority = 'medium';
  }
  return result;
}
