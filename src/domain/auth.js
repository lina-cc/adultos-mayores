import { isValidEmail, passwordsMatch, validatePassword } from './validators.js';

export const ROLES = {
  WORKER: 'worker',
  COMPANY: 'company',
};

export function mapAuthError(error) {
  const code = error?.code || '';
  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Correo o contraseña incorrectos.';
  }
  if (code === 'auth/email-already-in-use') return 'El correo ya está registrado.';
  if (code === 'auth/weak-password') return 'La contraseña no cumple la política de seguridad.';
  if (code === 'auth/invalid-email') return 'El correo electrónico no es válido.';
  if (code === 'auth/too-many-requests') return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  return 'No se pudo completar la operación. Inténtalo nuevamente.';
}

export function assertRole(role) {
  if (role !== ROLES.WORKER && role !== ROLES.COMPANY) {
    throw new Error('El tipo de cuenta no es válido.');
  }
  return role;
}

export function validateRegistration({ email, password, confirmPassword, role }) {
  const errors = [];
  if (!isValidEmail(email)) errors.push('El correo electrónico no es válido.');
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) errors.push(...passwordCheck.errors);
  if (!passwordsMatch(password, confirmPassword)) errors.push('Las contraseñas no coinciden.');
  try {
    assertRole(role);
  } catch (error) {
    errors.push(error.message);
  }
  return { valid: errors.length === 0, errors };
}

export function buildUserDocument({ email, role, roleData, createdAt = new Date().toISOString() }) {
  assertRole(role);
  const base = { email, role, createdAt };
  if (role === ROLES.WORKER) {
    return {
      ...base,
      fullName: roleData.fullName || '',
      birthDate: roleData.birthDate || '',
      gender: roleData.gender || '',
      phone: roleData.phone || '',
    };
  }
  return {
    ...base,
    companyName: roleData.companyName || '',
    rut: roleData.rut || '',
    contactName: roleData.contactName || '',
    companyPhone: roleData.companyPhone || '',
  };
}
