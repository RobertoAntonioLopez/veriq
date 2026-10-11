import { escapeHtml as e, labels } from './ui.js';

function textField(name, label, value = '', { required = true, multiline = false, maximum = 10000, hint = '' } = {}) {
  return `<div class="field full"><label for="field-${name}">${label}${required ? ' *' : ''}</label>
    ${multiline ? `<textarea id="field-${name}" name="${name}" ${required ? 'required' : ''} data-maximum="${maximum}" rows="3">${e(value)}</textarea>` :
    `<input id="field-${name}" name="${name}" value="${e(value)}" ${required ? 'required' : ''} data-maximum="${maximum}">`}
    ${hint ? `<small>${hint}</small>` : ''}</div>`;
}

function selectField(name, label, values, value) {
  return `<div class="field"><label for="field-${name}">${label} *</label><select id="field-${name}" name="${name}" required>
    ${values.map((option) => `<option value="${option}" ${option === value ? 'selected' : ''}>${labels[option]}</option>`).join('')}</select></div>`;
}

export function caseForm(item = {}) {
  return textField('title', 'Título', item.title, { maximum: 200 }) +
    textField('description', 'Descripción', item.description, { required: false, multiline: true }) +
    textField('preconditions', 'Precondiciones', item.preconditions, { required: false, multiline: true }) +
    textField('steps', 'Pasos de ejecución', item.steps, { multiline: true }) +
    textField('expectedResult', 'Resultado esperado', item.expectedResult, { multiline: true }) +
    selectField('priority', 'Prioridad', ['low', 'medium', 'high'], item.priority ?? 'medium');
}

export function runForm(item) {
  return `<input type="hidden" name="testCaseId" value="${item.id}"><div class="field full"><p class="form-note">Caso #${item.id} · ${e(item.title)}<br>El resultado quedará registrado en el historial.</p></div>` +
    selectField('result', 'Resultado', ['passed', 'failed', 'blocked'], 'passed') +
    textField('notes', 'Observaciones', '', { required: false, multiline: true }) +
    `<div class="field full"><details><summary>Consultar pasos y resultado esperado</summary><p class="case-instructions">${e(item.steps).replaceAll('\n', '<br>')}</p><strong>Resultado esperado</strong><p>${e(item.expectedResult).replaceAll('\n', '<br>')}</p></details></div>`;
}

export function bugForm(item = {}) {
  return textField('title', 'Título', item.title, { maximum: 200 }) +
    textField('description', 'Descripción', item.description, { multiline: true }) +
    textField('stepsToReproduce', 'Pasos para reproducir', item.stepsToReproduce, { multiline: true }) +
    textField('expectedResult', 'Resultado esperado', item.expectedResult, { multiline: true }) +
    textField('actualResult', 'Resultado actual', item.actualResult, { multiline: true }) +
    selectField('severity', 'Severidad', ['minor', 'major', 'critical'], item.severity ?? 'major') +
    selectField('priority', 'Prioridad', ['low', 'medium', 'high'], item.priority ?? 'medium') +
    selectField('status', 'Estado', ['open', 'in_progress', 'resolved', 'closed'], item.status ?? 'open') +
    `<div class="field"><label for="field-testCaseId">ID del caso relacionado</label><input type="number" min="1" max="2147483647" step="1" id="field-testCaseId" name="testCaseId" value="${e(item.testCaseId ?? '')}"><small>Opcional. Puedes consultar el ID en Casos de prueba.</small></div>
    <div class="field full"><small>Severidad: impacto del defecto. Prioridad: urgencia para atenderlo.</small></div>`;
}
