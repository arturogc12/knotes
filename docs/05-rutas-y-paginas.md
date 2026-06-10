# 05 · Rutas y páginas

## Tabla de rutas

| Ruta | Componente | Layout | Descripción |
|------|------------|--------|-------------|
| `/` | `Home` | ✅ (Navbar + Footer) | Landing para pacientes. |
| `/profesionales` | `Professionals` | ✅ (Navbar + Footer) | Landing para terapeutas. |
| `/login` | `Login` | ❌ Pantalla completa | Acceso con Supabase Auth (Magic Link + Google). |
| `/bienvenida` | `PwaWelcome` | ❌ Pantalla completa | Guía instalación PWA (móvil, solo 1ª vez). **Ruta protegida.** |
| `/chat` | `Chat` + `PwaWelcomeRedirect` | ✅ (PatientAppLayout) | Conversación activa con K-Notes. **Ruta protegida.** |
| `/nudos` | `Nudos` | ✅ (PatientAppLayout) | Historial de nudos (Supabase). **Ruta protegida.** |
| `/nudos/:id` | `NudoDetail` | ✅ (PatientAppLayout) | Detalle A-B-C de un nudo. **Ruta protegida.** |
| `/ajustes` | `Settings` | ✅ (PatientAppLayout) | Cuenta, suscripción, idioma y cierre de sesión. **Ruta protegida.** |

> Definidas en `src/main.tsx`. Marketing (`/`, `/profesionales`) usa `Layout`; paciente autenticado usa `ProtectedRoute`. `/bienvenida` está fuera de `PatientAppLayout`; `/chat`, `/nudos` y `/ajustes` comparten el shell de paciente.

---

## Zona paciente (`PatientAppLayout`)

Layout post-login en `src/components/patient/PatientAppLayout.tsx`:

- Fondo cálido con gradiente y blobs decorativos.
- Contenedor centrado `max-w-4xl` en desktop.
- **Navegación desktop:** segmented control en el header con **Conversación** (`/chat`) y **Mis Nudos** (`/nudos`); icono de engranaje → `/ajustes`.
- **Navegación móvil (<768px):** menú lateral (`PatientMobileDrawer`) accesible desde el icono hamburger. Incluye Conversación, Mis Nudos y Ajustes. Sin barra inferior.

Tras iniciar sesión con Supabase, el destino lo define `getPostAuthDestination()` en `src/lib/authRoutes.ts`:

- **Desktop:** `/chat` directamente.
- **Móvil 1ª vez:** `/bienvenida` → un clic en "Entrar al Chat" → `/chat` (flag en `sessionStorage` + `localStorage` + estado `welcomeDismissed`).
- **Móvil visitas posteriores:** `/chat`.

El acceso directo PWA (`manifest.webmanifest`, `start_url: /chat`) abre la conversación al instante.

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

## `/bienvenida` — Bienvenida PWA (`src/pages/PwaWelcome.tsx`)

Pantalla de onboarding mostrada **solo en móvil y la primera vez** tras registrarse o iniciar sesión.

- Componente UI: `PwaWelcomeStep` — CTA "Entrar al Chat" primero; bloque opcional "¿Quieres acceso directo?" con tabs iOS/Android.
- Textos definidos en [`docs/pwa-install-text.md`](./pwa-install-text.md).
- Persistencia: `knotes:pwa-welcome-seen:<userId>` en `localStorage` + `sessionStorage`.
- Un solo clic en "Entrar al Chat" navega a `/chat` con `welcomeDismissed: true` (evita rebote del guard).
- **Desktop:** redirige automáticamente a `/chat` (`isMobileDevice()`).
- Si ya se vio la guía, redirige automáticamente a `/chat`.
- Los pasos de instalación indican instalar **desde el chat** para que el icono abra `/chat` (iOS guarda la URL actual; Android usa `start_url` del manifest).

## `/login` — Login (`src/pages/Login.tsx`)

Pantalla de acceso con **Supabase Auth**.

- Enlace **"Volver al inicio"** (esquina superior izquierda) → `/`.
- Campo de **correo electrónico** + botón **"Continuar con Magic Link"** (`signInWithOtp`).
- Botón alternativo **"Continuar con Google"** (`signInWithOAuth`).
- Si ya hay sesión activa, redirige vía `getPostAuthDestination()` (`/bienvenida` en móvil 1ª vez, `/chat` en el resto).
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

Conversación activa dentro de `PatientAppLayout`, con comportamiento responsive:

- **Móvil (<768px):** pantalla fija a `100dvh` estilo app nativa (ChatGPT). El shell oculta su cabecera; el chat incluye hamburger que abre el drawer lateral (Conversación / Nudos / Ajustes). Scroll solo en la zona de mensajes.
- **Desktop (`md+`):** tarjeta cálida centrada (`max-w-4xl` + `px-4` en el shell), bordes redondeados, pestañas superiores (sin `position: fixed`).

- Conectado a ChatGPT vía `POST /api/chat`.
- Burbujas IA en hielo (`#EEF6FC`), usuario en azul pastel con gradiente.
- Input de texto + micrófono (Whisper server-side). Input a 16px en móvil (anti-zoom iOS).
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
- **Desktop:** tabs Conversación | Mis Nudos + icono Ajustes en header.
- **Móvil:** hamburger abre `PatientMobileDrawer` (sin barra inferior).
- En `/chat` móvil oculta su cabecera; el chat renderiza su propio hamburger.
- Contenedor `max-w-4xl mx-auto` en desktop; sin padding lateral en móvil para `/chat`.

### `PatientMobileDrawer` (`src/components/patient/PatientMobileDrawer.tsx`)

- Menú lateral deslizante: Conversación, Mis Nudos, Ajustes.
- Se cierra al navegar, pulsar overlay o Escape.

### `PwaWelcomeRedirect` (`src/components/pwa/PwaWelcomeRedirect.tsx`)

- Guard en `/chat`: si móvil y no se vio la bienvenida PWA → `/bienvenida`.
- Respeta `welcomeDismissed` en el estado de navegación y `hasSeenPwaWelcome`.

### `ProtectedRoute` (`src/components/auth/ProtectedRoute.tsx`)

- Guard de autenticación para rutas de paciente.
- Sin sesión activa → redirige a `/login`.

---

## Navegación atrás (sesión iniciada)

### Política

Con sesión activa, el usuario **no sale del área logueada** al pulsar Atrás en rutas de marketing o login. Si el historial devuelve a `/`, `/login` o `/profesionales`, se redirige automáticamente a `/chat` (o `/bienvenida` si aún no vio la guía PWA en móvil).

Entre pantallas del shell paciente (`/chat`, `/nudos`, `/ajustes`, `/nudos/:id`), Atrás funciona con normalidad.

### Implementación

| Componente | Archivo | Comportamiento |
|------------|---------|----------------|
| `LoggedInAppRedirect` | `src/components/auth/LoggedInAppRedirect.tsx` | Guard global montado en `main.tsx`. Redirige rutas públicas con sesión activa. En la primera visita a una ruta paciente, hace `replace` para higiene del historial (`sessionStorage`: `knotes:app-stack-rooted`). |
| `getPostAuthDestination` | `src/lib/authRoutes.ts` | Destino post-login compartido (`/bienvenida` o `/chat`). |
| `Login` | `src/pages/Login.tsx` | Si hay sesión, muestra spinner (sin flash del formulario) mientras redirige. |
| `AnimatedPatientOutlet` | `src/components/patient/PatientAppLayout.tsx` | Crossfade suave (150 ms) entre pestañas; 100 ms en navegación `POP` (atrás). |
| `PatientDrawerContext` | `src/contexts/PatientDrawerContext.tsx` | Al abrir el drawer móvil, `pushState` en el historial. El primer Atrás cierra el menú sin cambiar de ruta. |

### Flujo típico

```
/chat  →  /nudos  →  Atrás  →  /chat     (crossfade, OK)
/chat  →  Atrás  →  /  →  redirect  →  /chat   (no se queda en marketing)
Drawer abierto  →  Atrás  →  drawer cerrado   (misma ruta)
Cerrar sesión  →  /login  →  Atrás  →  no re-entra a rutas protegidas (replace)
```
