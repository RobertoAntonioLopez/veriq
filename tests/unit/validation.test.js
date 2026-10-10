import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTestCase } from '../../src/modules/test-cases/validation.js';
import { parseId, parsePagination } from '../../src/utils/validation.js';

const valid = { title: ' Crear caso ', steps: ' Enviar POST ', expectedResult: ' Respuesta 201 ' };
const isValidationError = (error) => error.status === 400 && error.code === 'VALIDATION_ERROR';

test('normalizes required fields, applies defaults and does not mutate input', () => {
  const input = { ...valid };
  assert.deepEqual(validateTestCase(input), {
    title: 'Crear caso', steps: 'Enviar POST', expectedResult: 'Respuesta 201',
    description: '', preconditions: '', priority: 'medium',
  });
  assert.deepEqual(input, valid);
});

for (const [label, body] of [
  ['missing body', undefined], ['null', null], ['array', []], ['string', 'hello'],
  ['missing title', { steps: 'a', expectedResult: 'b' }],
  ['blank title', { ...valid, title: '  ' }],
  ['numeric title', { ...valid, title: 42 }],
  ['null description', { ...valid, description: null }],
  ['invalid priority', { ...valid, priority: 'urgent' }],
  ['unknown field', { ...valid, owner: 'someone' }],
  ['blank steps', { ...valid, steps: '\n' }],
  ['null character', { ...valid, description: 'a\u0000b' }],
]) {
  test(`rejects ${label}`, () => assert.throws(() => validateTestCase(body), isValidationError));
}

for (const [field, maximum] of [['title', 200], ['steps', 10000], ['description', 10000], ['preconditions', 10000], ['expectedResult', 10000]]) {
  test(`${field} accepts the boundary and rejects one character above`, () => {
    assert.equal(validateTestCase({ ...valid, [field]: 'a'.repeat(maximum) })[field].length, maximum);
    assert.throws(() => validateTestCase({ ...valid, [field]: 'a'.repeat(maximum + 1) }), isValidationError);
  });
}

test('Unicode title length agrees with PostgreSQL character count', () => {
  assert.equal(validateTestCase({ ...valid, title: '😀'.repeat(200) }).title, '😀'.repeat(200));
  assert.throws(() => validateTestCase({ ...valid, title: '😀'.repeat(201) }), isValidationError);
});

test('partial edit only returns supplied fields and permits clearing optional text', () => {
  assert.deepEqual(validateTestCase({ description: '' }, { partial: true }), { description: '' });
  assert.deepEqual(validateTestCase({ priority: 'high' }, { partial: true }), { priority: 'high' });
  assert.throws(() => validateTestCase({}, { partial: true }), isValidationError);
  assert.throws(() => validateTestCase({ title: '' }, { partial: true }), isValidationError);
});

test('IDs reject coercion, decimals, SQL text and integer overflow', () => {
  assert.equal(parseId('2147483647'), 2147483647);
  for (const value of ['0', '-1', '1.1', '1e2', '1 OR 1=1', '2147483648', ' 1', ['1']]) {
    assert.throws(() => parseId(value), isValidationError);
  }
});

test('pagination defaults and boundaries', () => {
  assert.deepEqual(parsePagination({}), { limit: 20, offset: 0 });
  assert.deepEqual(parsePagination({ limit: '100', offset: '0' }), { limit: 100, offset: 0 });
  for (const query of [{ limit: '0' }, { limit: '101' }, { offset: '-1' }, { limit: ['1', '2'] }, { offset: '1.2' }, { page: '2' }]) {
    assert.throws(() => parsePagination(query), isValidationError);
  }
});
