const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
};

export function isValidEmail(email) {
  if (typeof email !== 'string') return false;
  const value = email.trim();
  if (!value || value.length > 254) return false;
  return EMAIL_PATTERN.test(value);
}

export function validatePassword(password) {
  const value = typeof password === 'string' ? password : '';
  const errors = [];

  if (value.length < PASSWORD_POLICY.minLength) {
    errors.push(`La contraseña debe tener al menos ${PASSWORD_POLICY.minLength} caracteres.`);
  }
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(value)) {
    errors.push('La contraseña debe incluir una letra mayúscula.');
  }
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(value)) {
    errors.push('La contraseña debe incluir una letra minúscula.');
  }
  if (PASSWORD_POLICY.requireNumber && !/[0-9]/.test(value)) {
    errors.push('La contraseña debe incluir un número.');
  }
  if (PASSWORD_POLICY.requireSymbol && !/[^A-Za-z0-9]/.test(value)) {
    errors.push('La contraseña debe incluir un símbolo.');
  }

  return { valid: errors.length === 0, errors };
}

export function passwordsMatch(password, confirmPassword) {
  return typeof password === 'string' && password === confirmPassword && password.length > 0;
}

export function isValidRut(rut) {
  if (typeof rut !== 'string') return false;
  const clean = rut.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;

  const body = clean.slice(0, -1);
  const verifier = clean.slice(-1);
  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return verifier === expected;
}

export function isValidPhone(phone, { required = false } = {}) {
  if (phone == null || phone === '') return !required;
  if (typeof phone !== 'string') return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export function isSeniorBirthDate(birthDate, today = new Date()) {
  if (typeof birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return false;
  const born = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(born.getTime())) return false;
  let age = today.getFullYear() - born.getFullYear();
  const monthDelta = today.getMonth() - born.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < born.getDate())) age -= 1;
  return age >= 50 && age <= 120;
}
