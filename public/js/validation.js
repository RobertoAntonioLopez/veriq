export function textError(value, required, maximum) {
  const text = value.trim();
  if (required && !text) return 'Completa este campo.';
  if (text.includes('\u0000')) return 'El texto contiene un carácter no permitido.';
  if (Array.from(text).length > maximum) return `Usa como máximo ${maximum} caracteres.`;
  return '';
}
