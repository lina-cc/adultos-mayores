import { beforeEach, describe, expect, it } from 'vitest';
import { createAppService } from '../../src/services/appService.js';
import { createMemoryDatabase } from '../../src/services/memoryDatabase.js';

const worker = {
  email: 'ana@ejemplo.cl',
  password: 'Segura123!',
  confirmPassword: 'Segura123!',
  role: 'worker',
  roleData: { fullName: 'Ana Pérez', birthDate: '1958-04-02', gender: 'Femenino', phone: '+56911112222' },
};

const company = {
  email: 'rrhh@norte.cl',
  password: 'Empresa123!',
  confirmPassword: 'Empresa123!',
  role: 'company',
  roleData: { companyName: 'Norte SpA', rut: '76.543.210-K', contactName: 'Luis', companyPhone: '+56933334444' },
};

describe('integración entre registro, base de datos y servicios', () => {
  let service;

  beforeEach(() => {
    service = createAppService(createMemoryDatabase());
  });

  it('persiste el usuario en la colección users al registrarse', async () => {
    const session = await service.register(worker);
    const stored = await service.database.get('users', session.uid);
    expect(stored.email).toBe(worker.email);
    expect(stored.role).toBe('worker');
    expect(stored.fullName).toBe('Ana Pérez');
  });

  it('siembra ofertas en Firestore simulado y permite buscarlas', async () => {
    const jobs = await service.searchJobs({ keyword: 'recepcion', location: 'Providencia' });
    expect(jobs).toHaveLength(1);
    const again = await service.database.list('ofertas');
    expect(again.length).toBeGreaterThanOrEqual(3);
  });

  it('guarda una postulación ligada al usuario y a la oferta', async () => {
    const session = await service.register(worker);
    const [job] = await service.listJobs();
    const application = await service.applyToJob(session, { jobId: job.id, jobTitle: job.title });
    const stored = await service.database.find('postulaciones', (item) => item.userId === session.uid);
    expect(stored).toHaveLength(1);
    expect(application.jobTitle).toBe(job.title);
  });

  it('guarda una reunión de empresa y un mensaje de contacto', async () => {
    const session = await service.register(company);
    const meeting = await service.bookMeeting(session, { day: 6, time: '09:00' });
    expect(meeting.date).toBe('2026-07-06');
    const contact = await service.sendContact({
      role: 'worker',
      name: 'Marta',
      email: 'marta@correo.cl',
      subject: 'Talleres',
      message: 'Quiero información',
    });
    expect(contact.companyName).toBeNull();
    expect(await service.database.get('contactos', contact.id)).toBeTruthy();
  });

  it('rechaza un correo duplicado como lo haría Firebase Auth', async () => {
    await service.register(worker);
    await expect(service.register(worker)).rejects.toMatchObject({ code: 'auth/email-already-in-use' });
  });

  it('renueva la sesión y falla si el perfil ya no existe', async () => {
    const session = await service.register(worker);
    const renewed = service.touchSession(session);
    expect(renewed.uid).toBe(session.uid);
    await expect(service.database.update('users', 'nadie', { fullName: 'X' })).rejects.toThrow(/no encontrado/);
    await service.database.set('users', session.uid, null);
    const missing = createAppService(service.database);
    await expect(missing.getProfile(renewed)).rejects.toThrow();
  });

  it('actualiza solo el documento del perfil autenticado', async () => {
    const session = await service.register(worker);
    const updated = await service.updateProfile(session, { fullName: 'Ana María Pérez', profession: 'Contadora' });
    expect(updated.profession).toBe('Contadora');
    expect(updated.role).toBe('worker');
  });
});
