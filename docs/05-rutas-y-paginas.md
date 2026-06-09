# 05 · Rutas y páginas

## Tabla de rutas

| Ruta | Componente | Layout | Descripción |
|------|------------|--------|-------------|
| `/` | `Home` | ✅ (Navbar + Footer) | Landing para pacientes. |
| `/profesionales` | `Professionals` | ✅ (Navbar + Footer) | Landing para terapeutas. |
| `/login` | `Login` | ❌ Pantalla completa | Acceso simulado. |
| `/chat` | `Chat` | ❌ Pantalla completa | Conversación con K-Notes. |

> Definidas en `src/main.tsx`. Las dos primeras se anidan bajo `<Route element={<Layout />}>`; las dos últimas son rutas independientes.

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

Pantalla de acceso **simulada** (sin backend).

- Campo de **correo electrónico** + botón **"Continuar con Magic Link"**.
- Botón alternativo **"Continuar con Google"**.
- `handleMockLogin` y el botón de Google ejecutan `navigate("/chat")`.
- Nota en UI: integración preparada para **Supabase Auth** con `persistSession: true` y redirección PWA a `/chat`.

## `/chat` — Chat (`src/pages/Chat.tsx`)

Interfaz de conversación a **pantalla completa**.

- **Header:** botón de volver (→ `/`), logo "K" y título *"Tu Lienzo"*.
- **Área de mensajes:** burbujas de ejemplo (IA y paciente) animadas con `motion`. Contenido estático de maqueta.
- **Aviso:** *"La IA de K-Notes estructurará esto en un Autorregistro A-B-C para tu Psicólogo"*.
- **Input:** campo de texto con botón de envío (sin lógica de envío todavía).

---

## Componentes de layout

### `Navbar` (`src/components/layout/Navbar.tsx`)

- Barra **fija** superior con blur.
- Logo "K-Notes" enlazado a `/`.
- Enlace que **alterna** entre "Para Pacientes" y "Para Profesionales" según `location.pathname`.
- CTA "Iniciar Sesión" (→ `/login`).
- **Menú móvil** con estado `isOpen` y animación de despliegue (`AnimatePresence`).

### `Footer` (`src/components/layout/Footer.tsx`)

- Logo + nombre.
- Copyright con año dinámico (`new Date().getFullYear()`).
- Enlaces a **Privacidad** y **Términos** (actualmente apuntan a `#`).
