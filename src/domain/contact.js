import { isValidEmail } from './validators.js';
import { ROLES } from './auth.js';

export function buildContactMessage({ role, name, email, subject, companyName, message, createdAt = new Date().toISOString() }) {
  const errors = [];
  if (role !== ROLES.WORKER && role !== ROLES.COMPANY) errors.push('Selecciona si eres adulto mayor o empresa.');
  if (!name || !name.trim()) errors.push('El nombre es obligatorio.');
  if (!isValidEmail(email)) errors.push('El correo electrónico no es válido.');
  if (!subject || !subject.trim()) errors.push('El asunto es obligatorio.');
  if (!message || !message.trim()) errors.push('El mensaje es obligatorio.');
  if (role === ROLES.COMPANY && (!companyName || !companyName.trim())) {
    errors.push('El nombre de la empresa es obligatorio.');
  }
  if (errors.length) {
    const error = new Error(errors.join(' '));
    error.errors = errors;
    throw error;
  }
  return {
    role,
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    companyName: role === ROLES.COMPANY ? companyName.trim() : null,
    message: message.trim(),
    createdAt,
  };
}
