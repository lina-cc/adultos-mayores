import { buildUserDocument, mapAuthError, validateRegistration } from '../domain/auth.js';
import { assertCan, canAccessResource, enforceSegregation, rejectPrivilegeEscalation, PERMISSIONS } from '../domain/authorization.js';
import { buildMeeting } from '../domain/calendar.js';
import { buildContactMessage } from '../domain/contact.js';
import { INITIAL_JOBS, buildApplication, filterJobs } from '../domain/jobs.js';
import { buildProfileUpdate } from '../domain/profile.js';
import { rejectUnsafeText } from '../domain/security.js';
import { createSession, destroySession, isSessionActive, refreshSession } from '../domain/session.js';
import { createMemoryDatabase } from './memoryDatabase.js';

export function createAppService(database = createMemoryDatabase()) {
  const accounts = new Map();

  return {
    database,

    async register({ email, password, confirmPassword, role, roleData }) {
      const check = validateRegistration({ email, password, confirmPassword, role });
      if (!check.valid) {
        const error = new Error(check.errors[0]);
        error.code = 'auth/invalid-registration';
        error.errors = check.errors;
        throw error;
      }
      rejectUnsafeText(email, 'correo');
      Object.values(roleData || {}).forEach((value) => {
        if (typeof value === 'string') rejectUnsafeText(value, 'dato de registro');
      });
      if (accounts.has(email)) {
        const error = new Error('El correo ya está registrado.');
        error.code = 'auth/email-already-in-use';
        throw error;
      }
      const uid = `uid_${accounts.size + 1}`;
      accounts.set(email, { uid, email, password, role });
      const document = buildUserDocument({ email, role, roleData });
      await database.set('users', uid, { ...document, uid });
      return createSession({ uid, email, role });
    },

    async login({ email, password }) {
      const account = accounts.get(email);
      if (!account || account.password !== password) {
        throw Object.assign(new Error(mapAuthError({ code: 'auth/invalid-credential' })), {
          code: 'auth/invalid-credential',
        });
      }
      return createSession({ uid: account.uid, email: account.email, role: account.role });
    },

    logout() {
      return destroySession();
    },

    touchSession(session) {
      return refreshSession(session);
    },

    async getProfile(session) {
      if (!isSessionActive(session)) throw new Error('Sesión inválida.');
      const profile = await database.get('users', session.uid);
      if (!profile || !canAccessResource(session, profile.uid)) {
        throw new Error('No puedes leer este perfil.');
      }
      return profile;
    },

    async updateProfile(session, fields) {
      if (!isSessionActive(session)) throw new Error('Sesión inválida.');
      rejectPrivilegeEscalation(session.role, fields.role);
      const permission = session.role === 'worker' ? PERMISSIONS.EDIT_WORKER_PROFILE : PERMISSIONS.EDIT_COMPANY_PROFILE;
      assertCan(session, permission);
      enforceSegregation(session.role, permission);
      const payload = buildProfileUpdate(session.role, fields);
      Object.values(payload).forEach((value) => {
        if (typeof value === 'string') rejectUnsafeText(value, 'perfil');
      });
      return database.update('users', session.uid, payload);
    },

    async listJobs() {
      const existing = await database.list('ofertas');
      if (existing.length === 0) {
        for (const job of INITIAL_JOBS) {
          await database.add('ofertas', job);
        }
      }
      return database.list('ofertas');
    },

    async searchJobs(filters) {
      return filterJobs(await this.listJobs(), filters);
    },

    async applyToJob(session, { jobId, jobTitle }) {
      if (!isSessionActive(session)) throw new Error('Sesión inválida.');
      assertCan(session, PERMISSIONS.APPLY_JOB);
      enforceSegregation(session.role, PERMISSIONS.APPLY_JOB);
      const application = buildApplication({ jobId, jobTitle, userId: session.uid });
      return database.add('postulaciones', application);
    },

    async bookMeeting(session, { day, time }) {
      if (!isSessionActive(session)) throw new Error('Sesión inválida.');
      assertCan(session, PERMISSIONS.BOOK_MEETING);
      enforceSegregation(session.role, PERMISSIONS.BOOK_MEETING);
      return database.add('reuniones', buildMeeting({ userId: session.uid, day, time }));
    },

    async sendContact(payload) {
      rejectUnsafeText(payload.message, 'mensaje');
      rejectUnsafeText(payload.subject, 'asunto');
      return database.add('contactos', buildContactMessage(payload));
    },
  };
}
