import { ROLES } from './auth.js';

export function emptyExperience() {
  return { company: '', role: '', years: '', description: '' };
}

export function addExperience(experiences) {
  return [...(experiences || []), emptyExperience()];
}

export function updateExperience(experiences, index, field, value) {
  const allowed = ['company', 'role', 'years', 'description'];
  if (!allowed.includes(field)) {
    throw new Error('Campo de experiencia no permitido.');
  }
  if (!Array.isArray(experiences) || index < 0 || index >= experiences.length) {
    throw new Error('La experiencia indicada no existe.');
  }
  return experiences.map((item, i) => (i === index ? { ...item, [field]: value } : item));
}

export function removeExperience(experiences, index) {
  if (!Array.isArray(experiences)) return [];
  return experiences.filter((_, i) => i !== index);
}

export function buildProfileUpdate(role, fields) {
  if (role === ROLES.WORKER) {
    return {
      fullName: fields.fullName || '',
      birthDate: fields.birthDate || '',
      gender: fields.gender || '',
      phone: fields.phone || '',
      profession: fields.profession || '',
      skills: fields.skills || '',
      experiences: fields.experiences || [],
    };
  }
  if (role === ROLES.COMPANY) {
    return {
      companyName: fields.companyName || '',
      rut: fields.rut || '',
      industry: fields.industry || '',
      contactName: fields.contactName || '',
      companyPhone: fields.companyPhone || '',
    };
  }
  throw new Error('No se puede actualizar un perfil sin rol válido.');
}

export function profileTitle(role) {
  if (role === ROLES.WORKER) return 'Mi Perfil Profesional (CV)';
  if (role === ROLES.COMPANY) return 'Mi Perfil Corporativo';
  return 'Mi Perfil';
}
