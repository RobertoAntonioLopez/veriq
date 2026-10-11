export const labels = {
  low: 'Baja', medium: 'Media', high: 'Alta', passed: 'Aprobada', failed: 'Fallida', blocked: 'Bloqueada',
  minor: 'Menor', major: 'Mayor', critical: 'Crítica', open: 'Abierto', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado',
};

export function escapeHtml(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function emptyState(title, message, action = '') {
  return `<div class="empty"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p>${action}</div>`;
}

export function table(headers, rows) {
  return `<div class="table-scroll"><table><thead><tr>${headers.map((header) => `<th scope="col">${header}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

export function actionButton(action, text, id, className = '') {
  return `<button type="button" class="${className}" data-action="${action}" ${id ? `data-id="${id}"` : ''}>${text}</button>`;
}

export function detailRows(entries) {
  return `<dl>${entries.map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || '—')}</dd>`).join('')}</dl>`;
}
