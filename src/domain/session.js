export const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

export function createSession({ uid, email, role, issuedAt = Date.now() }) {
  if (!uid || !email || !role) {
    throw new Error('La sesión requiere usuario, correo y rol.');
  }
  return {
    uid,
    email,
    role,
    issuedAt,
    expiresAt: issuedAt + SESSION_TTL_MS,
  };
}

export function isSessionActive(session, now = Date.now()) {
  if (!session || !session.uid || !session.expiresAt) return false;
  return now < session.expiresAt;
}

export function refreshSession(session, now = Date.now()) {
  if (!isSessionActive(session, now)) {
    throw new Error('La sesión expiró. Inicia sesión nuevamente.');
  }
  return createSession({
    uid: session.uid,
    email: session.email,
    role: session.role,
    issuedAt: now,
  });
}

export function destroySession() {
  return null;
}
