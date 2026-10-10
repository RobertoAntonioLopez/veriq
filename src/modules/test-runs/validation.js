import { validateObject, validateText, validateEnum, validateReference } from '../../utils/validation.js';

export function validateTestRun(body) {
  validateObject(body, ['testCaseId', 'result', 'notes']);
  return {
    testCaseId: validateReference(body.testCaseId),
    result: validateEnum(body.result, 'result', ['passed', 'failed', 'blocked']),
    notes: validateText(body.notes === undefined ? '' : body.notes, 'notes', { required: false }),
  };
}
