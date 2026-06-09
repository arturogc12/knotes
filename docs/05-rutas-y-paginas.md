# 05 · Rutas y páginas

## Tabla de rutas

| Ruta | Componente | Layout | Descripción |
|------|------------|--------|-------------|
| `/` | `Home` | ✅ (Navbar + Footer) | Landing para pacientes. |
| `/profesionales` | `Professionals` | ✅ (Navbar + Footer) | Landing para terapeutas. |
| `/login` | `Login` | ❌ Pantalla completa | Acceso con Supabase Auth (Magic Link + Google). |
| `/chat` | `Chat` | ✅ (PatientAppLayout) | Conversación activa con K-Notes. **Ruta protegida.** |
| `/nudos` | `Nudos` | ✅ (PatientAppLayout) | Historial de nudos (mock). **Ruta protegida.** |
| `/nudos/:id` | `NudoDetail` | ✅ (PatientAppLayout) | Detalle A-B-C + exportar PDF (placeholder). **Ruta protegida.** |
| `/ajustes` | `Settings` | ✅ (PatientAppLayout) | Cuenta, suscripción, idioma y cierre de sesión. **Ruta protegida.** |

> Definidas en `src/main.tsx`. Las rutas de marketing (`/`, `/profesionales`) usan `Layout`; las de paciente autenticado (`/chat`, `/nudos`, `/ajustes`) comparten `PatientAppLayout` y están envueltas en `ProtectedRoute`.

---

## Zona paciente (`PatientAppLayout`)

Layout post-login en `src/components/patient/PatientAppLayout.tsx`:

- Fondo cálido con gradiente y blobs decorativos.
- Contenedor centrado `max-w-4xl` en desktop.
- **Navegación por pestañas:** barra inferior en móvil, segmented control en desktop.
- Pestañas: **Conversación** (`/chat`) y **Mis Nudos** (`/nudos`).
- **Ajustes:** icono de engranaje en la esquina superior derecha del header (→ `/ajustes`).

Tras iniciar sesión con Supabase, el usuario entra en `/chat` dentro de este shell.

---

## `/` — Home (`src/pages/Home.tsx`)

Landing orientada al **paciente**.

- **Hero a dos columnas:** mensaje principal *"El diario de terapia que se escribe solo mientras te desahogas"*, con CTAs **"Empezar mi proceso"** (→ `/login`) y **"Saber más"**.
- **Etiqueta de marca:** *CBT-Based Mirroring*.
- **Cita flotante:** testimonio de paciente (solo en desktop).
- **Preview visual:** maqueta de chat del paciente superpuesta con un "Informe Semanal" del terapeuta.
- **Barra de features (desktop):** Análisis IA · Clínico (PDF) · Privacidad (E2E + Supabase).
- **Features móviles:** tarjetas "Un chat contigo mismo" y "100% Confidencial".
- **Animaciones:** entradas escalonadas con `motion` (`initial`/`animate`, y `whileInView` en móvil).

## `/profesionales` — Professionals (`src/pages/Professionals.tsx`)

Landing orientada al **terapeuta**.

- **Hero:** *"Tu paciente se desahoga. K-Notes hace el Análisis Funcional"*, con etiqueta *Herramienta clínica para Terapeutas* y CTA **"Comenzar a usar K-Notes"** (→ `/login`).
- **Mockup de informe A-B-C:** tarjeta "Reporte Semanal" con tres bloques:
  - **A – Antecedente:** situación de ansiedad social en reunión.
  - **B – Conducta / Pensamiento:** *"Van a notar que me tiembla la voz"*. Evitación visual.
  - **C – Consecuencia:** alivio a corto plazo, frustración y culpa a largo plazo.
- **Sección de beneficios:** explica el modelo "paciente ve un bloc de notas / terapeuta recibe PDFs clínicos" + placeholder de "Visualizador de estadísticas".

## `/login` — Login (`src/pages/Login.tsx`)

Pantalla de acceso con **Supabase Auth**.

- Campo de **correo electrónico** + botón **"Continuar con Magic Link"** (`signInWithOtp`).
- Botón alternativo **"Continuar con Google"** (`signInWithOAuth`).
- Si ya hay sesión activa, redirige automáticamente a `/chat`.
- Tras el magic link, Supabase detecta la sesión en la URL y redirige al espacio de conversación.
- Textos traducibles vía `react-i18next` (es/en).

## `/ajustes` — Ajustes (`src/pages/Settings.tsx`)

Gestión de cuenta y preferencias del paciente.

- **Cuenta:** email del usuario autenticado.
- **Suscripción:** plan actual (placeholder "Plan gratuito"), botón "Gestionar suscripción" (próximamente).
- **Idioma:** selector ES / EN, persistido en `localStorage` (`knotes-locale`).
- **Privacidad:** enlaces a Política de privacidad y Términos (placeholders).
- **Sesión:** botón **"Cerrar sesión"** (`supabase.auth.signOut()` → `/login`).

## `/chat` — Chat (`src/pages/Chat.tsx`)

Conversación activa dentro de una **tarjeta cálida** (no pantalla completa aislada).

- Conectado a ChatGPT vía `POST /api/chat`.
- Burbujas IA en crema (`#FFF6F0`), usuario en terracota con gradiente.
- Input de texto + micrófono (Whisper server-side).
- Animación de tecleo a 25 ms/carácter.
- Flujo por fases TCC (ver [09 · Flujo del chat](./09-flujo-chat.md)).

## `/nudos` — Mis Nudos (`src/pages/Nudos.tsx`)

Historial de conversaciones cerradas (**Supabase**, tabla `nudos` filtrada por `user_id` vía RLS).

- **Exportar informe:** botón compacto en el encabezado que abre un modal con selector de periodo (última semana / último mes). Genera un PDF server-side (`POST /api/export`) con todos los nudos del rango.
- Filtros de lista (independientes del export): últimos 7 días, último mes, todo.
- Tarjetas con fecha relativa, emoción, título y extracto del antecedente.
- Clic → detalle en `/nudos/:id`.

## `/nudos/:id` — Detalle del nudo (`src/pages/NudoDetail.tsx`)

Vista completa de un nudo.

- Resumen de la conversación.
- Bloques **A-B-C** (antecedente, pensamiento/conducta, consecuencia).
- Pensamiento alternativo (si aplica).
- Enlace para volver a la lista (sin exportación individual).

---

## Componentes de layout

### `Navbar` (`src/components/layout/Navbar.tsx`)

- Barra **fija** superior con blur (solo rutas de marketing).
- Logo "K-Notes" enlazado a `/`.
- Enlace que **alterna** entre "Para Pacientes" y "Para Profesionales" según `location.pathname`.
- CTA "Iniciar Sesión" (→ `/login`).
- **Menú móvil** con estado `isOpen` y animación de despliegue (`AnimatePresence`).

### `Footer` (`src/components/layout/Footer.tsx`)

- Logo + nombre.
- Copyright con año dinámico (`new Date().getFullYear()`).
- Enlaces a **Privacidad** y **Términos** (actualmente apuntan a `#`).

### `PatientAppLayout` (`src/components/patient/PatientAppLayout.tsx`)

- Shell de la zona paciente post-login.
- Tabs: Conversación | Mis Nudos.
- Icono de ajustes (engranaje) en el header → `/ajustes`.
- Sin Navbar/Footer de marketing.

### `ProtectedRoute` (`src/components/auth/ProtectedRoute.tsx`)

- Guard de autenticación para rutas de paciente.
- Sin sesión activa → redirige a `/login`.
