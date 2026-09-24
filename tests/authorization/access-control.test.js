import { describe, expect, it } from 'vitest';
import {
  PERMISSIONS,
  assertCan,
  can,
  canAccessResource,
  enforceSegregation,
  permissionsFor,
  rejectPrivilegeEscalation,
  visibleNav,
} from '../../src/domain/authorization.js';
import { createAppService } from '../../src/services/appService.js';

function session(role, uid = 'user-1') {
  return { uid, email: `${role}@ejemplo.cl`, role, expiresAt: Date.now() + 60_000 };
}

describe('controles de acceso', () => {
  it('entrega permisos distintos a adulto mayor y a empresa', () => {
    expect(permissionsFor('worker')).toContain(PERMISSIONS.APPLY_JOB);
    expect(permissionsFor('worker')).not.toContain(PERMISSIONS.PUBLISH_JOB);
    expect(permissionsFor('company')).toContain(PERMISSIONS.BOOK_MEETING);
    expect(permissionsFor('company')).not.toContain(PERMISSIONS.REQUEST_COACH);
    expect(permissionsFor('admin')).toEqual([]);
    expect(can(session('worker'), PERMISSIONS.EDIT_WORKER_PROFILE)).toBe(true);
    expect(can(session('company'), PERMISSIONS.EDIT_WORKER_PROFILE)).toBe(false);
    expect(can(null, PERMISSIONS.APPLY_JOB)).toBe(false);
    expect(() => assertCan(session('company'), PERMISSIONS.APPLY_JOB)).toThrow(/permiso/);
  });

  it('oculta la navegación del otro perfil', () => {
    expect(visibleNav('worker')).toEqual({ empresas: false, trabajadores: true });
    expect(visibleNav('company')).toEqual({ empresas: true, trabajadores: false });
    expect(visibleNav(null)).toEqual({ empresas: true, trabajadores: true });
  });

  it('solo el dueño puede leer su propio recurso', () => {
    expect(canAccessResource(session('worker', 'a'), 'a')).toBe(true);
    expect(canAccessResource(session('worker', 'a'), 'b')).toBe(false);
    expect(canAccessResource(null, 'a')).toBe(false);
  });
});

describe('escalación de privilegios', () => {
  it('impide que un adulto mayor se promocione a empresa', () => {
    expect(() => rejectPrivilegeEscalation('worker', 'company')).toThrow(/privilegios/);
    expect(() => rejectPrivilegeEscalation('company', 'admin')).toThrow(/privilegios/);
    expect(rejectPrivilegeEscalation('worker', 'worker')).toBe('worker');
    expect(rejectPrivilegeEscalation('worker', undefined)).toBe('worker');
  });

  it('el servicio ignora un cambio de rol enviado en el perfil', async () => {
    const app = createAppService();
    const worker = await app.register({
      email: 'ana@ejemplo.cl',
      password: 'Segura123!',
      confirmPassword: 'Segura123!',
      role: 'worker',
      roleData: { fullName: 'Ana' },
    });
    await expect(app.updateProfile(worker, { role: 'company', fullName: 'Ana' })).rejects.toThrow(/privilegios/);
    const stored = await app.database.get('users', worker.uid);
    expect(stored.role).toBe('worker');
  });
});

describe('segregación de funciones', () => {
  it('separa postulación y contratación según el rol', () => {
    expect(enforceSegregation('worker', PERMISSIONS.APPLY_JOB)).toBe(true);
    expect(enforceSegregation('company', PERMISSIONS.VIEW_APPLICATIONS)).toBe(true);
    expect(() => enforceSegregation('worker', PERMISSIONS.BOOK_MEETING)).toThrow(/empresa/);
    expect(() => enforceSegregation('company', PERMISSIONS.ENROLL_WORKSHOP)).toThrow(/postulante/);
    expect(() => enforceSegregation('guest', PERMISSIONS.APPLY_JOB)).toThrow(/denegado/);
  });

  it('una empresa no edita un currículum y un adulto mayor no agenda como empresa', async () => {
    const app = createAppService();
    const company = await app.register({
      email: 'rrhh@norte.cl',
      password: 'Empresa123!',
      confirmPassword: 'Empresa123!',
      role: 'company',
      roleData: { companyName: 'Norte' },
    });
    const worker = await app.register({
      email: 'ana@ejemplo.cl',
      password: 'Segura123!',
      confirmPassword: 'Segura123!',
      role: 'worker',
      roleData: { fullName: 'Ana' },
    });
    await expect(app.applyToJob(company, { jobId: '1', jobTitle: 'Caja' })).rejects.toThrow();
    await expect(app.bookMeeting(worker, { day: 6, time: '09:00' })).rejects.toThrow();
    const updated = await app.updateProfile(company, { industry: 'Salud' });
    expect(updated.industry).toBe('Salud');
    expect(updated.fullName).toBeUndefined();
  });
});
