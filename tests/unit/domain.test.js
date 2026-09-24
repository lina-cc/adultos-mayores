import { describe, expect, it } from 'vitest';
import {
  isSeniorBirthDate,
  isValidEmail,
  isValidPhone,
  isValidRut,
  passwordsMatch,
  validatePassword,
} from '../../src/domain/validators.js';
import { buildUserDocument, mapAuthError, validateRegistration } from '../../src/domain/auth.js';
import { clampFontScale, nextFontScale, parseStoredContrast } from '../../src/domain/accessibility.js';
import { filterJobs, vacancyLabel, INITIAL_JOBS, buildApplication } from '../../src/domain/jobs.js';
import { buildProfileUpdate, addExperience, updateExperience, removeExperience, profileTitle } from '../../src/domain/profile.js';
import { canConfirmBooking, formatBookingDate, formatSlotLabel, isSelectableDay, toggleAccordion } from '../../src/domain/calendar.js';
import { buildContactMessage } from '../../src/domain/contact.js';

describe('validadores individuales', () => {
  it('acepta correos con dominio y rechaza vacíos o mal formados', () => {
    expect(isValidEmail('ana@ejemplo.cl')).toBe(true);
    expect(isValidEmail('  ana@ejemplo.cl  ')).toBe(true);
    expect(isValidEmail('ana@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(`${'a'.repeat(250)}@b.co`)).toBe(false);
  });

  it('exige la política de contraseña y confirma coincidencia', () => {
    expect(validatePassword('Corta1!').valid).toBe(false);
    expect(validatePassword('sinmayuscula1!').errors.length).toBeGreaterThan(0);
    expect(validatePassword('SINMINUSCULA1!').valid).toBe(false);
    expect(validatePassword('SinNumero!!').valid).toBe(false);
    expect(validatePassword('SinSimbolo1').valid).toBe(false);
    expect(validatePassword(null).valid).toBe(false);
    expect(validatePassword('Segura123!')).toEqual({ valid: true, errors: [] });
    expect(passwordsMatch('Segura123!', 'Segura123!')).toBe(true);
    expect(passwordsMatch('Segura123!', 'Otra123!')).toBe(false);
    expect(passwordsMatch('', '')).toBe(false);
  });

  it('valida RUT chileno, teléfono y edad senior', () => {
    expect(isValidRut('12.345.678-5')).toBe(true);
    expect(isValidRut('123456785')).toBe(true);
    expect(isValidRut('11.111.111-2')).toBe(false);
    expect(isValidRut('no-rut')).toBe(false);
    expect(isValidRut(12)).toBe(false);
    expect(isValidPhone('+56 9 1234 5678')).toBe(true);
    expect(isValidPhone('')).toBe(true);
    expect(isValidPhone('', { required: true })).toBe(false);
    expect(isValidPhone('123', { required: true })).toBe(false);
    expect(isValidPhone(12345678)).toBe(false);
    expect(isSeniorBirthDate('1960-01-01', new Date('2026-09-24'))).toBe(true);
    expect(isSeniorBirthDate('2005-01-01', new Date('2026-09-24'))).toBe(false);
    expect(isSeniorBirthDate('1900-01-01', new Date('2026-09-24'))).toBe(false);
    expect(isSeniorBirthDate('fecha')).toBe(false);
    expect(isSeniorBirthDate('2026-09-24', new Date('2026-01-01'))).toBe(false);
  });

  it('arma el documento de registro según el rol', () => {
    const worker = validateRegistration({
      email: 'senior@ejemplo.cl',
      password: 'Segura123!',
      confirmPassword: 'Segura123!',
      role: 'worker',
    });
    expect(worker.valid).toBe(true);
    expect(buildUserDocument({
      email: 'senior@ejemplo.cl',
      role: 'worker',
      roleData: { fullName: 'Ana Pérez', birthDate: '1958-04-02', gender: 'Femenino', phone: '' },
      createdAt: '2026-09-24T00:00:00.000Z',
    }).fullName).toBe('Ana Pérez');

    const company = buildUserDocument({
      email: 'rrhh@empresa.cl',
      role: 'company',
      roleData: { companyName: 'Norte SpA', rut: '76.123.456-7' },
      createdAt: '2026-09-24T00:00:00.000Z',
    });
    expect(company.companyName).toBe('Norte SpA');
    expect(validateRegistration({ email: 'mal', password: 'x', confirmPassword: 'y', role: 'admin' }).valid).toBe(false);
  });

  it('traduce los códigos de error de autenticación', () => {
    expect(mapAuthError({ code: 'auth/wrong-password' })).toMatch(/incorrectos/);
    expect(mapAuthError({ code: 'auth/user-not-found' })).toMatch(/incorrectos/);
    expect(mapAuthError({ code: 'auth/email-already-in-use' })).toMatch(/registrado/);
    expect(mapAuthError({ code: 'auth/weak-password' })).toMatch(/política/);
    expect(mapAuthError({ code: 'auth/invalid-email' })).toMatch(/válido/);
    expect(mapAuthError({ code: 'auth/too-many-requests' })).toMatch(/intentos/);
    expect(mapAuthError({})).toMatch(/nuevamente/);
  });
});

describe('funciones de empleo, perfil, calendario y contacto', () => {
  it('filtra vacantes por texto, comuna y jornada', () => {
    expect(filterJobs(INITIAL_JOBS, { keyword: 'inventario' })).toHaveLength(1);
    expect(filterJobs(INITIAL_JOBS, { location: 'Remoto', jobType: 'Remoto' })[0].company).toBe('Seguros VidaPlena');
    expect(filterJobs(INITIAL_JOBS, { keyword: 'no-existe' })).toHaveLength(0);
    expect(filterJobs(INITIAL_JOBS, {})).toHaveLength(3);
    expect(vacancyLabel(1)).toMatch(/1 vacante/);
    expect(vacancyLabel(3)).toMatch(/3 vacantes/);
    expect(buildApplication({ jobId: 'j1', jobTitle: 'Caja', userId: 'u1', appliedAt: 'hoy' }).status).toBe('pending');
    expect(() => buildApplication({ jobId: 'j1' })).toThrow(/incompleta/);
  });

  it('actualiza el historial laboral sin mutar el arreglo original', () => {
    const start = [];
    const withOne = addExperience(start);
    const edited = updateExperience(withOne, 0, 'role', 'Cajera');
    expect(start).toHaveLength(0);
    expect(edited[0].role).toBe('Cajera');
    expect(removeExperience(edited, 0)).toHaveLength(0);
    expect(removeExperience(null, 0)).toEqual([]);
    expect(() => updateExperience(edited, 3, 'role', 'x')).toThrow(/no existe/);
    expect(() => updateExperience(edited, 0, 'salary', '1')).toThrow(/no permitido/);
    expect(buildProfileUpdate('worker', { fullName: 'Ana', experiences: edited }).fullName).toBe('Ana');
    expect(buildProfileUpdate('company', { companyName: 'Norte' }).companyName).toBe('Norte');
    expect(() => buildProfileUpdate('admin', {})).toThrow(/rol válido/);
    expect(profileTitle('worker')).toMatch(/CV/);
    expect(profileTitle('company')).toMatch(/Corporativo/);
    expect(profileTitle(null)).toBe('Mi Perfil');
  });

  it('calcula días hábiles, hora y acordeón', () => {
    expect(isSelectableDay(1)).toBe(false);
    expect(isSelectableDay(6)).toBe(true);
    expect(isSelectableDay(11)).toBe(false);
    expect(isSelectableDay(0)).toBe(false);
    expect(isSelectableDay(1.5)).toBe(false);
    expect(formatBookingDate(6)).toBe('2026-07-06');
    expect(() => formatBookingDate(4)).toThrow(/disponible/);
    expect(formatSlotLabel('15:00')).toBe('03:00 PM');
    expect(formatSlotLabel('09:00')).toBe('09:00 AM');
    expect(formatSlotLabel('08:00')).toBe('08:00');
    expect(canConfirmBooking(6, '11:30')).toBe(true);
    expect(canConfirmBooking(6, '08:00')).toBe(false);
    expect(toggleAccordion(1, 1)).toBeNull();
    expect(toggleAccordion(1, 2)).toBe(2);
  });

  it('ajusta la escala de texto y arma el mensaje de contacto', () => {
    expect(clampFontScale(2)).toBe(1.6);
    expect(clampFontScale(0.1)).toBe(0.8);
    expect(clampFontScale('no')).toBe(1);
    expect(nextFontScale(1, 'up')).toBeCloseTo(1.15);
    expect(nextFontScale(1, 'down')).toBeCloseTo(0.85);
    expect(nextFontScale(1.5, 'reset')).toBe(1);
    expect(parseStoredContrast('true')).toBe(true);
    expect(parseStoredContrast(false)).toBe(false);
    const message = buildContactMessage({
      role: 'company',
      name: ' Luis ',
      email: 'luis@empresa.cl',
      subject: ' Vacantes ',
      companyName: ' Norte ',
      message: ' Hola ',
      createdAt: '2026-09-24',
    });
    expect(message.companyName).toBe('Norte');
    expect(() => buildContactMessage({ role: 'worker', name: '', email: 'x', subject: '', message: '' })).toThrow();
    expect(() => buildContactMessage({
      role: 'company', name: 'Ana', email: 'ana@empresa.cl', subject: 'Hola', companyName: ' ', message: 'Texto',
    })).toThrow(/empresa/);
  });
});
