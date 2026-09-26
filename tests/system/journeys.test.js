import { describe, expect, it } from 'vitest';
import { createAppService } from '../../src/services/appService.js';
import { filterJobs } from '../../src/domain/jobs.js';
import { INITIAL_JOBS } from '../../src/domain/jobs.js';

describe('casos de uso de punta a punta', () => {
  it('un adulto mayor se registra, inicia sesión, busca empleo y postula', async () => {
    const app = createAppService();
    const registered = await app.register({
      email: 'pedro@ejemplo.cl',
      password: 'Senior2026!',
      confirmPassword: 'Senior2026!',
      role: 'worker',
      roleData: { fullName: 'Pedro Soto', birthDate: '1955-03-10', gender: 'Masculino', phone: '+56912345678' },
    });
    const loggedOut = app.logout();
    expect(loggedOut).toBeNull();
    const session = await app.login({ email: 'pedro@ejemplo.cl', password: 'Senior2026!' });
    expect(session.uid).toBe(registered.uid);

    const matches = await app.searchJobs({ keyword: 'supervisor', location: 'Santiago', jobType: 'Full-time' });
    expect(matches).toHaveLength(1);
    const application = await app.applyToJob(session, { jobId: matches[0].id, jobTitle: matches[0].title });
    const profile = await app.getProfile(session);
    expect(profile.fullName).toBe('Pedro Soto');
    expect(application.status).toBe('pending');
  });

  it('una empresa agenda asesoría y no puede postular a una vacante', async () => {
    const app = createAppService();
    const session = await app.register({
      email: 'contacto@sur.cl',
      password: 'Empresa2026!',
      confirmPassword: 'Empresa2026!',
      role: 'company',
      roleData: { companyName: 'Sur Ltda', rut: '96.555.444-7', contactName: 'Rosa', companyPhone: '+56223456789' },
    });
    const meeting = await app.bookMeeting(session, { day: 7, time: '11:30' });
    expect(meeting.time).toBe('11:30');
    await expect(app.applyToJob(session, { jobId: 'job_1', jobTitle: 'Caja' })).rejects.toThrow(/permiso|postulante/);
  });

  it('el formulario de contacto queda almacenado para seguimiento', async () => {
    const app = createAppService();
    const saved = await app.sendContact({
      role: 'company',
      name: 'Elena Díaz',
      email: 'elena@holding.cl',
      subject: 'Inclusión senior',
      companyName: 'Holding Andes',
      message: 'Queremos agendar una charla.',
    });
    const rows = await app.database.list('contactos');
    expect(rows.some((row) => row.id === saved.id && row.companyName === 'Holding Andes')).toBe(true);
  });
});

describe('rendimiento de búsqueda y registro', () => {
  it('filtra 5.000 ofertas en menos de 250 ms', () => {
    const jobs = Array.from({ length: 5000 }, (_, index) => ({
      ...INITIAL_JOBS[index % INITIAL_JOBS.length],
      title: index % 17 === 0 ? `Asistente ${index}` : `Cargo ${index}`,
      location: index % 2 === 0 ? 'Santiago' : 'Remoto',
    }));
    const start = performance.now();
    const result = filterJobs(jobs, { keyword: 'asistente', location: 'Santiago' });
    const elapsed = performance.now() - start;
    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(250);
    console.log(`Rendimiento búsqueda: ${elapsed.toFixed(2)} ms para ${jobs.length} ofertas, ${result.length} coincidencias`);
  });

  it('registra 200 cuentas en la base en memoria en menos de 1 s', async () => {
    const app = createAppService();
    const start = performance.now();
    for (let i = 0; i < 200; i += 1) {
      await app.register({
        email: `user${i}@ejemplo.cl`,
        password: 'Segura123!',
        confirmPassword: 'Segura123!',
        role: i % 2 === 0 ? 'worker' : 'company',
        roleData: i % 2 === 0
          ? { fullName: `Persona ${i}`, birthDate: '1960-01-01', gender: 'Femenino', phone: '+56911111111' }
          : { companyName: `Empresa ${i}`, rut: '76.000.000-0', contactName: 'Contacto', companyPhone: '+56220000000' },
      });
    }
    const elapsed = performance.now() - start;
    expect(await app.database.list('users')).toHaveLength(200);
    expect(elapsed).toBeLessThan(1000);
    console.log(`Rendimiento registro: ${elapsed.toFixed(2)} ms para 200 cuentas`);
  });
});
