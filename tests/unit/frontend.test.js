import test from 'node:test';
import assert from 'node:assert/strict';
import { textError } from '../../public/js/validation.js';
import { escapeHtml } from '../../public/js/ui.js';

test('frontend text validation matches Unicode and whitespace rules of the API', () => {
  assert.equal(textError('😀'.repeat(200), true, 200), '');
  assert.notEqual(textError('😀'.repeat(201), true, 200), '');
  assert.notEqual(textError(' \n ', true, 200), '');
  assert.equal(textError(' \n ', false, 200), '');
  assert.equal(textError('   Valid title   ', true, 11), '');
  assert.notEqual(textError('a\u0000b', false, 10000), '');
});

test('user text is escaped for HTML text and attribute contexts', () => {
  assert.equal(escapeHtml(`<img src="x" onerror='alert(1)'>&`), '&lt;img src=&quot;x&quot; onerror=&#39;alert(1)&#39;&gt;&amp;');
  assert.equal(escapeHtml(null), '');
});
