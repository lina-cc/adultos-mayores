import { describe, expect, it } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { containsMarkup, containsQueryOperator, escapeHtml, rejectUnsafeText } from '../../src/domain/security.js';
import { createAppService } from '../../src/services/appService.js';
import { validatePassword } from '../../src/domain/validators.js';

const findings = [];

function record(id, title, severity, status, detail) {
  findings.push({ id, title, severity, status, detail });
}

describe('controles frente a entradas inseguras', () => {
  it('neutraliza marcado y operadores de consulta en texto de usuario', () => {
    const payload = '<script>alert(1)</script>';
    expect(containsMarkup(payload)).toBe(true);
    expect(containsMarkup('texto normal')).toBe(false);
    expect(containsMarkup(1)).toBe(false);
    expect(escapeHtml(payload)).not.toContain('<script>');
    expect(escapeHtml(`a&b"c'`)).toContain('&amp;');
    expect(containsQueryOperator('{"$gt": ""}')).toBe(true);
    expect(containsQueryOperator('$where: true')).toBe(true);
    expect(() => rejectUnsafeText(payload, 'mensaje')).toThrow(/no permitido/);
    expect(rejectUnsafeText('Hola equipo', 'mensaje')).toBe('Hola equipo');
    record('PEN-01', 'Entrada con marcado o operadores', 'alta', 'controlado', 'El dominio rechaza script y operadores antes de persistir.');
  });

  it('el contacto y el registro no guardan un mensaje con script', async () => {
    const app = createAppService();
    await expect(app.sendContact({
      role: 'worker',
      name: 'Ana',
      email: 'ana@ejemplo.cl',
      subject: 'Consulta',
      message: '<img src=x onerror=alert(1)>',
    })).rejects.toMatchObject({ code: 'security/unsafe-input' });
    await expect(app.register({
      email: 'ana@ejemplo.cl',
      password: 'Segura123!',
      confirmPassword: 'Segura123!',
      role: 'worker',
      roleData: { fullName: '<script>alert(1)</script>' },
    })).rejects.toMatchObject({ code: 'security/unsafe-input' });
    expect(await app.database.list('contactos')).toHaveLength(0);
    expect(await app.database.list('users')).toHaveLength(0);
    record('PEN-02', 'Persistencia de HTML activo', 'alta', 'controlado', 'Ni contactos ni usuarios quedan creados si el texto es inseguro.');
  });

  it('documenta la brecha de contraseña mínima del cliente Firebase actual', () => {
    const weakForProduct = validatePassword('123456');
    expect(weakForProduct.valid).toBe(false);
    record(
      'PEN-03',
      'Política de contraseña en la pantalla de Auth',
      'media',
      'no conformidad',
      'La pantalla Auth.jsx todavía delega el mínimo de 6 caracteres a Firebase. La política del dominio exige 8 caracteres con mayúscula, minúscula, número y símbolo, y los tests de autenticación la exigen en el servicio.',
    );
  });

  it('documenta que las rutas de perfil dependen de la sesión del cliente', () => {
    record(
      'PEN-04',
      'Autorización solo en cliente',
      'media',
      'no conformidad',
      'Header y Profile consultan el rol en Firestore desde el navegador. Las reglas de segregación están cubiertas por el servicio de pruebas; en producción deben replicarse en Firebase Security Rules.',
    );
    expect(findings.map((item) => item.id)).toEqual(['PEN-01', 'PEN-02', 'PEN-03', 'PEN-04']);
  });
});

describe('informe de hallazgos', () => {
  it('escribe el informe para adjuntar como evidencia', () => {
    const output = resolve('tests/penetration/hallazgos.json');
    mkdirSync(dirname(output), { recursive: true });
    const report = {
      herramienta: 'Suite de penetración del proyecto (complementa un baseline de OWASP ZAP)',
      fecha: '2026-09-24',
      alcance: 'Dominio de autenticación, autorización, contacto y perfil de ExperienciaSenior',
      hallazgos: findings,
    };
    writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
    expect(findings.some((item) => item.status === 'no conformidad')).toBe(true);
    expect(findings.some((item) => item.status === 'controlado')).toBe(true);
    console.log('Informe de penetración escrito en tests/penetration/hallazgos.json');
    console.table(findings.map(({ id, severity, status, title }) => ({ id, severity, status, title })));
  });
});
