export const INITIAL_JOBS = [
  {
    title: 'Asistente de Recepción y Atención',
    company: 'Clínica Dental San Lucas',
    inclusiva: true,
    location: 'Providencia',
    type: 'Part-time',
    schedule: 'Lunes a Viernes 09:00 - 13:00',
    salary: '$480.000 / mes',
    keywords: 'administrativo asistente recepcionista',
  },
  {
    title: 'Supervisor de Control de Inventario',
    company: 'Distribuidora TransSur S.A.',
    inclusiva: true,
    location: 'Santiago',
    type: 'Full-time',
    schedule: 'Turno fijo diurno, no requiere fuerza física',
    salary: '$750.000 / mes',
    keywords: 'supervisor logistica inventario bodega',
  },
  {
    title: 'Consultor Senior de Atención Telefónica',
    company: 'Seguros VidaPlena',
    inclusiva: true,
    location: 'Remoto',
    type: 'Remoto',
    schedule: 'Flexible (30 horas semanales a convenir)',
    salary: '$600.000 + Comisiones',
    keywords: 'consultor senior atencion al cliente ejecutivo ventas',
  },
];

export function filterJobs(jobs, { keyword = '', location = '', jobType = '' } = {}) {
  const needle = keyword.trim().toLowerCase();
  return jobs.filter((job) => {
    const textMatch = !needle
      || (job.keywords && job.keywords.toLowerCase().includes(needle))
      || (job.title && job.title.toLowerCase().includes(needle))
      || (job.company && job.company.toLowerCase().includes(needle));
    const locationMatch = !location || (job.location && job.location.includes(location));
    const typeMatch = !jobType || job.type === jobType;
    return textMatch && locationMatch && typeMatch;
  });
}

export function vacancyLabel(count) {
  if (count === 1) return 'Se muestra 1 vacante de empleo';
  return `Se muestran ${count} vacantes de empleo`;
}

export function buildApplication({ jobId, jobTitle, userId, appliedAt = new Date().toISOString() }) {
  if (!jobId || !jobTitle || !userId) {
    throw new Error('La postulación está incompleta.');
  }
  return { jobId, jobTitle, userId, status: 'pending', appliedAt };
}
