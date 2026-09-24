# Cómo ejecutar las pruebas en Visual Studio Code

Cada comando abre su propia salida en la terminal. Esa salida es la evidencia para el pantallazo.

## Preparación (una sola vez)

1. Abre esta carpeta en Visual Studio Code: `adultos-mayores`.
2. Confirma que estás en la rama `testing` (esquina inferior izquierda, o `git branch`).
3. En la terminal integrada (`Terminal` → `Nueva terminal`) ejecuta:

```bash
npm install
```

## Opción A: tareas de Visual Studio Code

1. `Terminal` → `Ejecutar tarea...` (atajo `Cmd+Shift+P` y escribe `Tasks: Run Task`).
2. Elige una tarea. Espera a que termine y captura la terminal completa, incluyendo el resumen `Tests passed`.

| Tarea | Qué demuestra |
| --- | --- |
| 1. Pruebas unitarias + cobertura | Funciones individuales y cobertura sobre 80% |
| 2. Pruebas de integración | Registro, Firestore simulado, postulaciones y contacto |
| 3. Pruebas de sistema y rendimiento | Flujos completos y tiempos de búsqueda/registro |
| 4. Pruebas de penetración | Entradas inseguras e informe de no conformidades |
| 5. Pruebas de autenticación | Login, sesión y política de contraseñas |
| 6. Pruebas de autorización | Acceso, escalación de privilegios y segregación |

## Opción B: terminal integrada

Ejecuta un comando por captura, desde la raíz del proyecto:

```bash
npm run test:unit
npm run test:integration
npm run test:system
npm run test:penetration
npm run test:auth
npm run test:authorization
npm run test:coverage
```

`test:unit` y `test:coverage` imprimen la tabla de cobertura. El informe HTML queda en `coverage/index.html`.

## OWASP ZAP (prueba de penetración contra la app en marcha)

La suite automatizada cubre los controles del dominio y deja el informe en `tests/penetration/hallazgos.json`. Para el escaneo con ZAP:

1. En una terminal: `npm run dev` y espera la URL local (normalmente `http://localhost:5173`).
2. Con Docker instalado, en otra terminal:

```bash
docker run --rm -t -v "$(pwd)/tests/penetration:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:5173 -J zap-report.json
```

3. Adjunta `tests/penetration/zap-report.json` junto con el pantallazo de la terminal.

En macOS, `host.docker.internal` apunta al Vite de tu máquina. El informe JSON de la suite propia se genera al correr `npm run test:penetration`.
