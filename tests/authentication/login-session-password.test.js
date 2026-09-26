import { describe, expect, it } from 'vitest';
import { createSession, isSessionActive, refreshSession, SESSION_TTL_MS } from '../../src/domain/session.js';
import { mapAuthError, validateRegistration } from '../../src/domain/auth.js';
import { validatePassword } from '../../src/domain/validators.js';
import { assessPasswordTransport } from '../../src/domain/security.js';
import { createAppService } from '../../src/services/appService.js';

describe('mecanismo de login', () => {
  it('inicia sesión con credenciales correctas y rechaza las incorrectas', async () => {
    const app = createAppService();
    await app.register({
      email: 'ana@ejemplo.cl',
      password: 'Segura123!',
      confirmPassword: 'Segura123!',
      role: 'worker',
      roleData: { fullName: 'Ana' },
    });
    const session = await app.login({ email: 'ana@ejemplo.cl', password: 'Segura123!' });
    expect(session.email).toBe('ana@ejemplo.cl');
    await expect(app.login({ email: 'ana@ejemplo.cl', password: 'mala' })).rejects.toThrow(/incorrectos/);
    await expect(app.login({ email: 'otro@ejemplo.cl', password: 'Segura123!' })).rejects.toThrow(/incorrectos/);
  });

  it('no revela si falló el correo o la contraseña', () => {
    expect(mapAuthError({ code: 'auth/user-not-found' })).toBe(mapAuthError({ code: 'auth/wrong-password' }));
  });
});

describe('gestión de sesiones', () => {
  it('crea una sesión con vencimiento de 8 horas', () => {
    const issuedAt = Date.parse('2026-09-24T12:00:00.000Z');
    const session = createSession({ uid: 'u1', email: 'ana@ejemplo.cl', role: 'worker', issuedAt });
    expect(session.expiresAt - session.issuedAt).toBe(SESSION_TTL_MS);
    expect(isSessionActive(session, issuedAt + 1000)).toBe(true);
    expect(isSessionActive(session, session.expiresAt)).toBe(false);
    expect(isSessionActive(null)).toBe(false);
    expect(isSessionActive({})).toBe(false);
  });

  it('renueva una sesión vigente y rechaza una expirada', () => {
    const issuedAt = Date.now() - SESSION_TTL_MS - 1;
    const expired = createSession({ uid: 'u1', email: 'ana@ejemplo.cl', role: 'worker', issuedAt });
    expect(() => refreshSession(expired)).toThrow(/expiró/);
    const active = createSession({ uid: 'u1', email: 'ana@ejemplo.cl', role: 'worker' });
    const renewed = refreshSession(active);
    expect(renewed.expiresAt).toBeGreaterThan(active.issuedAt);
  });

  it('impide operar el perfil cuando la sesión ya venció', async () => {
    const app = createAppService();
    const session = await app.register({
      email: 'ana@ejemplo.cl',
      password: 'Segura123!',
      confirmPassword: 'Segura123!',
      role: 'worker',
      roleData: { fullName: 'Ana' },
    });
    session.expiresAt = Date.now() - 1;
    await expect(app.getProfile(session)).rejects.toThrow(/inválida/);
    await expect(app.updateProfile(session, { fullName: 'Otra' })).rejects.toThrow(/inválida/);
  });

  it('exige identificadores para abrir sesión', () => {
    expect(() => createSession({ uid: '', email: 'a@b.cl', role: 'worker' })).toThrow(/sesión/);
  });
});

describe('política de contraseñas', () => {
  it('rechaza contraseñas cortas, sin mezcla de caracteres o que no coinciden', () => {
    expect(validatePassword('123456').valid).toBe(false);
    expect(validatePassword('password').valid).toBe(false);
    expect(validatePassword('Password1').valid).toBe(false);
    const result = validateRegistration({
      email: 'ana@ejemplo.cl',
      password: 'Segura123!',
      confirmPassword: 'Distinta123!',
      role: 'worker',
    });
    expect(result.errors).toContain('Las contraseñas no coinciden.');
    expect(assessPasswordTransport('Segura123!')).toMatchObject({ sentInQueryString: false, length: 10 });
    expect(assessPasswordTransport(null).length).toBe(0);
  });

  it('el servicio de registro aplica la misma política antes de crear la cuenta', async () => {
    const app = createAppService();
    await expect(app.register({
      email: 'ana@ejemplo.cl',
      password: '123456',
      confirmPassword: '123456',
      role: 'worker',
      roleData: {},
    })).rejects.toMatchObject({ code: 'auth/invalid-registration' });
  });
});
