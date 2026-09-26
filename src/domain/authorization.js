import { ROLES } from './auth.js';

export const PERMISSIONS = {
  APPLY_JOB: 'apply_job',
  ENROLL_WORKSHOP: 'enroll_workshop',
  REQUEST_COACH: 'request_coach',
  EDIT_WORKER_PROFILE: 'edit_worker_profile',
  PUBLISH_JOB: 'publish_job',
  BOOK_MEETING: 'book_meeting',
  EDIT_COMPANY_PROFILE: 'edit_company_profile',
  VIEW_APPLICATIONS: 'view_applications',
};

const ROLE_PERMISSIONS = {
  [ROLES.WORKER]: [
    PERMISSIONS.APPLY_JOB,
    PERMISSIONS.ENROLL_WORKSHOP,
    PERMISSIONS.REQUEST_COACH,
    PERMISSIONS.EDIT_WORKER_PROFILE,
  ],
  [ROLES.COMPANY]: [
    PERMISSIONS.PUBLISH_JOB,
    PERMISSIONS.BOOK_MEETING,
    PERMISSIONS.EDIT_COMPANY_PROFILE,
    PERMISSIONS.VIEW_APPLICATIONS,
  ],
};

export function permissionsFor(role) {
  return ROLE_PERMISSIONS[role] ? [...ROLE_PERMISSIONS[role]] : [];
}

export function can(session, permission) {
  if (!session?.role) return false;
  return permissionsFor(session.role).includes(permission);
}

export function assertCan(session, permission) {
  if (!can(session, permission)) {
    const error = new Error('No tienes permiso para realizar esta acción.');
    error.code = 'auth/forbidden';
    throw error;
  }
}

export function visibleNav(role) {
  return {
    empresas: role !== ROLES.WORKER,
    trabajadores: role !== ROLES.COMPANY,
  };
}

export function rejectPrivilegeEscalation(actorRole, requestedRole) {
  if (requestedRole == null) return actorRole;
  if (requestedRole !== actorRole) {
    const error = new Error('No puedes cambiar tu rol ni asumir privilegios de otro perfil.');
    error.code = 'auth/privilege-escalation';
    throw error;
  }
  return actorRole;
}

export function enforceSegregation(role, action) {
  const workerOnly = [
    PERMISSIONS.APPLY_JOB,
    PERMISSIONS.ENROLL_WORKSHOP,
    PERMISSIONS.REQUEST_COACH,
    PERMISSIONS.EDIT_WORKER_PROFILE,
  ];
  const companyOnly = [
    PERMISSIONS.PUBLISH_JOB,
    PERMISSIONS.BOOK_MEETING,
    PERMISSIONS.EDIT_COMPANY_PROFILE,
    PERMISSIONS.VIEW_APPLICATIONS,
  ];

  if (role === ROLES.WORKER && companyOnly.includes(action)) {
    throw new Error('Un adulto mayor no puede ejecutar funciones de empresa.');
  }
  if (role === ROLES.COMPANY && workerOnly.includes(action)) {
    throw new Error('Una empresa no puede ejecutar funciones de postulante.');
  }
  if (role !== ROLES.WORKER && role !== ROLES.COMPANY) {
    throw new Error('Rol no reconocido. Acceso denegado.');
  }
  return true;
}

export function canAccessResource(session, resourceOwnerId) {
  if (!session?.uid || !resourceOwnerId) return false;
  return session.uid === resourceOwnerId;
}
