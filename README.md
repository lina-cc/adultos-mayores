# Plataforma de Empleo para Adultos Mayores

Una aplicación web diseñada para conectar a adultos mayores con empresas que buscan su talento, experiencia y dedicación. Esta plataforma facilita la reinserción laboral y el contacto directo entre trabajadores mayores y empleadores, contando con herramientas de accesibilidad integradas.

## 🚀 Características Principales

* **Panel de Accesibilidad:** Herramientas integradas para facilitar la lectura y navegación de los usuarios mayores.
* **Perfiles Especializados:**
  * **Trabajadores:** Pueden crear perfiles, mostrar su experiencia y buscar oportunidades laborales.
  * **Empresas:** Pueden publicar ofertas, buscar perfiles y contactar trabajadores con experiencia.
* **Autenticación Segura:** Sistema de registro e inicio de sesión gestionado con Firebase.
* **Perfil de Usuario:** Gestión de datos personales y currículum.
* **Diseño Responsivo:** Interfaz amigable, moderna y adaptable a cualquier dispositivo móvil o de escritorio.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React 19
* **Enrutamiento:** React Router DOM v7
* **Herramienta de Construcción:** Vite
* **Autenticación y Backend (BaaS):** Firebase
* **Iconografía:** Lucide React
* **Estilos:** CSS Vanilla estructurado

## 📁 Estructura del Proyecto

```
src/
├── assets/         # Imágenes, iconos y recursos estáticos
├── components/     # Componentes reutilizables (Header, Footer, AccessibilityPanel, etc.)
├── firebase/       # Configuración e inicialización de Firebase
├── pages/          # Vistas principales de la aplicación
│   ├── Landing.jsx      # Página de inicio
│   ├── Empresas.jsx     # Sección para empleadores
│   ├── Trabajadores.jsx # Sección para candidatos/trabajadores
│   ├── Nosotros.jsx     # Información sobre la plataforma
│   ├── Contacto.jsx     # Formulario de contacto
│   ├── Auth.jsx         # Login / Registro
│   └── Profile.jsx      # Perfil de usuario
├── App.jsx         # Componente principal y configuración de rutas
├── main.jsx        # Punto de entrada de la aplicación React
└── index.css       # Estilos globales de la aplicación
```

## ⚙️ Instalación y Uso Local

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

1. **Clona el repositorio o navega a la carpeta del proyecto:**
   ```bash
   cd "Adultos mayors"
   ```

2. **Instala las dependencias:**
   Puedes usar `npm`, `yarn` o `pnpm`. Con `npm`:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno:**
   Asegúrate de configurar correctamente el archivo `.env` en la raíz del proyecto con tus credenciales de Firebase.
   ```env
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   # ... otras variables de firebase
   ```

4. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador:**
   El proyecto estará disponible por defecto en `http://localhost:5173`.

## 📜 Scripts Disponibles

En el directorio del proyecto, puedes ejecutar los siguientes comandos:

* `npm run dev`: Inicia el servidor de desarrollo con Vite (HMR activado).
* `npm run build`: Construye la aplicación optimizada para producción.
* `npm run lint`: Ejecuta el linter (Oxlint) para analizar el código.
* `npm run preview`: Previsualiza la aplicación construida localmente antes de desplegar.
