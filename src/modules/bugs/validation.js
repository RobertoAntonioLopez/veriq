import { validateObject, validateText, validateEnum, validateReference } from '../../utils/validation.js';

export const bugStatuses = ['open', 'in_progress', 'resolved', 'closed'];
const textFields = ['title', 'description', 'stepsToReproduce', 'expectedResult', 'actualResult'];
const allowedFields = [...textFields, 'severity', 'priority', 'status', 'testCaseId'];

export function validateBug(body, { partial = false } = {}) {
  validateObject(body, allowedFields, partial);
  const data = {};
  for (const field of textFields) {
    if (partial && !Object.hasOwn(body, field)) continue;
    data[field] = validateText(body[field], field, { maximum: field === 'title' ? 200 : 10000 });
  }
  for (const [field, choices, fallback] of [
    ['severity', ['minor', 'major', 'critical'], undefined],
    ['priority', ['low', 'medium', 'high'], 'medium'],
    ['status', bugStatuses, 'open'],
  ]) {
    if (partial && !Object.hasOwn(body, field)) continue;
    data[field] = validateEnum(body[field] === undefined ? fallback : body[field], field, choices);
  }
  if (!partial || Object.hasOwn(body, 'testCaseId')) {
    data.testCaseId = body.testCaseId === undefined || body.testCaseId === null ? null : validateReference(body.testCaseId);
  }
  return data;
}
