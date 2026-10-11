import { api } from './api.js';
import { textError } from './validation.js';
import { escapeHtml as e, labels, formatDate, emptyState, table, actionButton as button, detailRows } from './ui.js';
import { caseForm, runForm, bugForm } from './forms.js';

const content = document.querySelector('#content');
const notification = document.querySelector('#notification');
const dialog = document.querySelector('#editor');
const dialogContent = document.querySelector('#dialog-content');
const viewNames = { dashboard: 'Resumen', 'test-cases': 'Casos de prueba', 'test-runs': 'Ejecuciones', bugs: 'Bugs' };
const state = { view: 'dashboard', offset: 0, filter: '', revision: 0 };
const pageSize = 10;

function notify(message, error = false) {
  notification.textContent = message;
  notification.className = error ? 'error' : '';
  notification.hidden = false;
  notification.setAttribute('role', error ? 'alert' : 'status');
}

function heading(title, subtitle, action) {
  return `<p class="breadcrumb">Espacio de trabajo / ${e(title)}</p><div class="page-heading"><div><h1>${e(title)}</h1><p class="subtitle">${e(subtitle)}</p></div>${action}</div>`;
}

function caseRows(items) {
  return items.map((item) => `<tr><td class="muted">#${item.id}</td><td class="cell-title">${button('case-detail', e(item.title), item.id, 'text-button')}</td>
    <td>${labels[item.priority]}</td><td class="muted">${formatDate(item.createdAt)}</td><td class="row-actions">${button('run-case', 'Ejecutar', item.id)} ${button('edit-case', 'Editar', item.id)}</td></tr>`);
}

function runRows(items) {
  return items.map((item) => `<tr><td class="muted">#${item.id}</td><td class="cell-title">${button('run-detail', e(item.caseSnapshot.title ?? `Caso #${item.testCaseId}`), item.id, 'text-button')}</td>
    <td>${labels[item.result]}</td><td class="muted">${formatDate(item.createdAt)}</td></tr>`);
}

function bugRows(items) {
  return items.map((item) => `<tr><td class="muted">#${item.id}</td><td class="cell-title">${button('bug-detail', e(item.title), item.id, 'text-button')}</td>
    <td>${labels[item.severity]}</td><td>${labels[item.priority]}</td><td>${labels[item.status]}</td><td>${button('edit-bug', 'Editar', item.id, 'text-button')}</td></tr>`);
}

async function renderDashboard() {
  const [summary, runs, bugs] = await Promise.all([
    api('/dashboard'), api('/test-runs?limit=5'), api('/bugs?status=open&limit=4'),
  ]);
  const data = summary.data;
  const metrics = [
    ['Casos de prueba', data.testCases, 'Casos disponibles para ejecutar'],
    ['Ejecuciones', data.testRuns, 'Historial completo de resultados'],
    ['Bugs pendientes de cierre', data.openBugs, 'Abiertos, en progreso o resueltos'],
  ];
  return heading('Resumen', 'Una vista del estado de tus pruebas y defectos.', button('new-case', 'Nuevo caso', null, 'primary')) +
    `<section class="metrics" aria-label="Estadísticas del proyecto">${metrics.map(([label, total, hint]) => `<article class="metric"><p>${label}</p><strong>${total}</strong><small>${hint}</small></article>`).join('')}</section>
    <div class="dashboard-grid"><section class="panel"><div class="panel-header"><div><h2>Últimas ejecuciones</h2><p>Los resultados más recientes de tus casos.</p></div><a href="#test-runs">Ver todas</a></div>
    ${runs.data.length ? table(['ID', 'Caso de prueba', 'Resultado', 'Fecha'], runRows(runs.data)) : emptyState('Aún no hay ejecuciones', 'Ejecuta un caso y registra lo que observaste.', '<a class="button" href="#test-cases">Ir a los casos</a>')}</section>
    <section class="panel"><div class="panel-header"><div><h2>Resultados</h2><p>Todas las ejecuciones registradas.</p></div></div><div class="result-summary">
    ${['passed', 'failed', 'blocked'].map((result) => `<div class="result-item ${result}"><div class="result-row"><span>${{ passed: 'Aprobadas', failed: 'Fallidas', blocked: 'Bloqueadas' }[result]}</span><strong>${data[result]}</strong></div><progress max="${Math.max(data.testRuns, 1)}" value="${data[result]}" aria-label="${labels[result]}: ${data[result]} de ${data.testRuns}"></progress></div>`).join('')}</div></section></div>
    <section class="panel"><div class="panel-header"><div><h2>Bugs abiertos</h2><p>Defectos que todavía no han empezado a atenderse.</p></div><a href="#bugs">Ver todos</a></div>
    ${bugs.data.length ? table(['ID', 'Título', 'Severidad', 'Prioridad', 'Estado', 'Acciones'], bugRows(bugs.data)) : emptyState('No hay bugs abiertos', 'Los nuevos defectos que registres aparecerán aquí.')}</section>`;
}

async function renderList(view, offset, filter) {
  const query = new URLSearchParams({ limit: pageSize + 1, offset });
  if (filter) query.set(view === 'bugs' ? 'status' : 'testCaseId', filter);
  const response = await api(`/${view}?${query}`);
  const items = response.data.slice(0, pageSize);
  const hasNext = response.data.length > pageSize;
  const config = {
    'test-cases': { subtitle: 'Define qué probar, cómo hacerlo y qué resultado esperar.', action: button('new-case', 'Nuevo caso', null, 'primary'), headers: ['ID', 'Título', 'Prioridad', 'Creado', 'Acciones'], rows: caseRows, empty: 'Aún no hay casos de prueba', message: 'Empieza por definir el primer comportamiento que quieres verificar.' },
    'test-runs': { subtitle: 'Un historial de lo que se probó y lo que ocurrió.', action: button('choose-case', 'Registrar ejecución', null, 'primary'), headers: ['ID', 'Caso de prueba', 'Resultado', 'Fecha'], rows: runRows, empty: 'No hay ejecuciones para mostrar', message: 'Selecciona un caso de prueba para registrar su resultado.' },
    bugs: { subtitle: 'Documenta los defectos y sigue su estado hasta el cierre.', action: button('new-bug', 'Registrar bug', null, 'primary'), headers: ['ID', 'Título', 'Severidad', 'Prioridad', 'Estado', 'Acciones'], rows: bugRows, empty: 'No hay bugs para mostrar', message: 'Registra un defecto cuando observes un resultado distinto al esperado.' },
  }[view];
  let filterControl = '';
  if (view === 'bugs') {
    filterControl = `<label>Estado <select id="status-filter"><option value="">Todos</option>${['open', 'in_progress', 'resolved', 'closed'].map((status) => `<option value="${status}" ${status === filter ? 'selected' : ''}>${labels[status]}</option>`).join('')}</select></label>`;
  } else if (view === 'test-runs') {
    filterControl = `<form id="run-filter"><label>Filtrar por caso <input type="number" name="testCaseId" min="1" max="2147483647" step="1" placeholder="ID del caso" value="${e(filter)}"><button type="submit">Filtrar</button></label></form>`;
  }
  return heading(viewNames[view], config.subtitle, config.action) + `<section class="panel"><div class="toolbar"><span class="muted">${filter ? 'Resultados filtrados' : 'Todos los registros'}</span>${filterControl}</div>
    ${items.length ? table(config.headers, config.rows(items)) : emptyState(config.empty, config.message)}
    <div class="pagination"><span>${items.length ? `${offset + 1}–${offset + items.length}` : '0'} registros en esta página</span><div>
    <button type="button" data-action="previous" ${offset === 0 ? 'disabled' : ''}>Anterior</button>
    <button type="button" data-action="next" ${hasNext ? '' : 'disabled'}>Siguiente</button></div></div></section>`;
}

async function refresh() {
  const revision = ++state.revision;
  const { view, offset, filter } = state;
  content.setAttribute('aria-busy', 'true');
  content.innerHTML = '<p class="loading">Cargando…</p>';
  try {
    const html = view === 'dashboard' ? await renderDashboard() : await renderList(view, offset, filter);
    if (revision === state.revision) content.innerHTML = html;
  } catch (error) {
    if (revision === state.revision) content.innerHTML = emptyState('No se pudieron cargar los datos', error.message, button('retry', 'Reintentar'));
  } finally {
    if (revision === state.revision) content.setAttribute('aria-busy', 'false');
  }
}

function navigate() {
  const view = location.hash.slice(1) || 'dashboard';
  state.view = Object.hasOwn(viewNames, view) ? view : 'dashboard';
  state.offset = 0;
  state.filter = '';
  document.title = `${viewNames[state.view]} · VeriQ`;
  document.querySelectorAll('[data-view]').forEach((link) => {
    if (link.dataset.view === state.view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  refresh();
}

function openDialog(title, body) {
  dialogContent.innerHTML = `<div class="dialog-heading"><h2 id="dialog-title">${e(title)}</h2><button type="button" data-action="close-dialog" aria-label="Cerrar">×</button></div><div class="dialog-body">${body}</div>`;
  if (!dialog.open) dialog.showModal();
  const firstField = dialog.querySelector('input:not([type="hidden"]), textarea, select');
  if (firstField) firstField.focus();
}

function openForm(title, resource, fields, id) {
  openDialog(title, `<form id="record-form" data-resource="${resource}" ${id ? `data-id="${id}"` : ''}>
    <p class="form-note">Los campos con * son obligatorios.</p><div class="form-error" role="alert" hidden></div><fieldset><div class="form-grid">${fields}</div>
    <div class="dialog-footer"><button type="button" data-action="close-dialog">Cancelar</button><button class="primary" type="submit">Guardar</button></div></fieldset></form>`);
}

async function handleAction(action, id) {
  if (action === 'close-dialog') {
    if (!dialog.querySelector('fieldset:disabled')) dialog.close();
    return;
  }
  if (action === 'retry') return refresh();
  if (action === 'next' || action === 'previous') {
    state.offset = Math.max(0, state.offset + (action === 'next' ? pageSize : -pageSize));
    return refresh();
  }
  if (action === 'choose-case') {
    location.hash = 'test-cases';
    notify('Elige un caso y pulsa «Ejecutar» para registrar su resultado.');
    return;
  }
  if (action === 'new-case') return openForm('Nuevo caso de prueba', 'test-cases', caseForm());
  if (action === 'new-bug') return openForm('Registrar bug', 'bugs', bugForm());
  if (['edit-case', 'case-detail', 'run-case', 'delete-case'].includes(action)) {
    const { data: item } = await api(`/test-cases/${id}`);
    if (action === 'edit-case') return openForm(`Editar caso #${id}`, 'test-cases', caseForm(item), id);
    if (action === 'run-case') return openForm('Registrar ejecución', 'test-runs', runForm(item));
    if (action === 'delete-case') {
      return openDialog('Eliminar caso de prueba', `<p>Se eliminará <strong>${e(item.title)}</strong>. Esta acción no se puede deshacer.</p><p class="muted">Los casos con ejecuciones conservadas no se pueden eliminar.</p><div class="form-error" role="alert" hidden></div><div class="dialog-footer">${button('close-dialog', 'Cancelar')}${button('confirm-delete', 'Eliminar caso', id, 'danger')}</div>`);
    }
    return openDialog(item.title, `<div class="detail-meta"><span>Caso #${item.id}</span><span>Prioridad ${labels[item.priority].toLowerCase()}</span><span>${formatDate(item.createdAt)}</span></div>
      ${detailRows([['Descripción', item.description], ['Precondiciones', item.preconditions], ['Pasos de ejecución', item.steps], ['Resultado esperado', item.expectedResult]])}
      <div class="dialog-footer">${button('delete-case', 'Eliminar', id, 'danger')}${button('edit-case', 'Editar', id)}${button('run-case', 'Ejecutar', id, 'primary')}</div>`);
  }
  if (action === 'confirm-delete') {
    await api(`/test-cases/${id}`, { method: 'DELETE' });
    dialog.close();
    state.offset = 0;
    notify('Caso de prueba eliminado.');
    return refresh();
  }
  if (action === 'run-detail') {
    const { data: item } = await api(`/test-runs/${id}`);
    const snapshot = item.caseSnapshot;
    return openDialog(`Ejecución #${id}`, `<div class="detail-meta"><span>${labels[item.result]}</span><span>Caso #${item.testCaseId}</span><span>${formatDate(item.createdAt)}</span></div>
      ${detailRows([['Caso ejecutado', snapshot.title], ['Observaciones', item.notes], ['Descripción del caso', snapshot.description], ['Precondiciones', snapshot.preconditions], ['Pasos ejecutados', snapshot.steps], ['Resultado esperado', snapshot.expectedResult]])}
      <p class="form-note">Se muestra la versión del caso guardada al registrar esta ejecución.</p>`);
  }
  if (action === 'edit-bug' || action === 'bug-detail') {
    const { data: item } = await api(`/bugs/${id}`);
    if (action === 'edit-bug') return openForm(`Editar bug #${id}`, 'bugs', bugForm(item), id);
    return openDialog(item.title, `<div class="detail-meta"><span>Bug #${item.id}</span><span>${labels[item.status]}</span><span>Severidad ${labels[item.severity].toLowerCase()}</span><span>Prioridad ${labels[item.priority].toLowerCase()}</span></div>
      ${detailRows([['Descripción', item.description], ['Pasos para reproducir', item.stepsToReproduce], ['Resultado esperado', item.expectedResult], ['Resultado actual', item.actualResult], ['Caso relacionado', item.testCaseId ? `#${item.testCaseId}` : 'Sin relación'], ['Registrado', formatDate(item.createdAt)]])}
      <div class="dialog-footer">${button('edit-bug', 'Editar bug', id, 'primary')}</div>`);
  }
}

document.addEventListener('click', async (event) => {
  if (event.target.closest('.skip-link')) {
    event.preventDefault();
    document.querySelector('#main').focus();
    return;
  }
  const target = event.target.closest('[data-action]');
  if (!target || target.disabled) return;
  target.disabled = true;
  try {
    await handleAction(target.dataset.action, target.dataset.id);
  } catch (error) {
    const inlineError = dialog.open && dialog.querySelector('.form-error');
    if (inlineError) {
      inlineError.textContent = error.message;
      inlineError.hidden = false;
    } else notify(error.message, true);
  } finally {
    target.disabled = false;
  }
});

document.addEventListener('submit', async (event) => {
  if (event.target.id === 'run-filter') {
    event.preventDefault();
    state.filter = new FormData(event.target).get('testCaseId');
    state.offset = 0;
    return refresh();
  }
  if (event.target.id !== 'record-form') return;
  event.preventDefault();
  const form = event.target;
  for (const field of form.querySelectorAll('[data-maximum]')) {
    field.setCustomValidity(textError(field.value, field.required, Number(field.dataset.maximum)));
  }
  if (!form.reportValidity()) return;
  const body = Object.fromEntries(new FormData(form));
  if (Object.hasOwn(body, 'testCaseId')) body.testCaseId = body.testCaseId ? Number(body.testCaseId) : null;
  const id = form.dataset.id;
  const fieldset = form.querySelector('fieldset');
  const errorBox = form.querySelector('.form-error');
  const submit = form.querySelector('[type="submit"]');
  errorBox.hidden = true;
  fieldset.disabled = true;
  submit.textContent = 'Guardando…';
  try {
    await api(`/${form.dataset.resource}${id ? `/${id}` : ''}`, { method: id ? 'PATCH' : 'POST', body });
    dialog.close();
    notify('Guardado correctamente.');
    state.offset = 0;
    await refresh();
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.hidden = false;
    errorBox.scrollIntoView({ block: 'nearest' });
  } finally {
    fieldset.disabled = false;
    submit.textContent = 'Guardar';
  }
});

document.addEventListener('input', (event) => {
  const field = event.target;
  if (field.matches('[data-maximum]')) {
    field.setCustomValidity(textError(field.value, field.required, Number(field.dataset.maximum)));
  }
});

document.addEventListener('change', (event) => {
  if (event.target.id !== 'status-filter') return;
  state.filter = event.target.value;
  state.offset = 0;
  refresh();
});
dialog.addEventListener('cancel', (event) => {
  if (dialog.querySelector('fieldset:disabled')) event.preventDefault();
});
window.addEventListener('hashchange', navigate);
navigate();
