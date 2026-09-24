const SCRIPT_PATTERN = /<\s*script|javascript:|onerror\s*=|onload\s*=/i;
const NOSQL_PATTERN = /(\$where|\$gt|\$ne|\$regex)|({.*})/i;

export function containsMarkup(value) {
  return typeof value === 'string' && SCRIPT_PATTERN.test(value);
}

export function containsQueryOperator(value) {
  return typeof value === 'string' && NOSQL_PATTERN.test(value);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function rejectUnsafeText(value, fieldName = 'campo') {
  if (containsMarkup(value) || containsQueryOperator(value)) {
    const error = new Error(`El ${fieldName} contiene contenido no permitido.`);
    error.code = 'security/unsafe-input';
    throw error;
  }
  return value;
}

export function assessPasswordTransport(password) {
  return {
    sentInQueryString: false,
    storedInPlainTextByClient: false,
    length: typeof password === 'string' ? password.length : 0,
  };
}
