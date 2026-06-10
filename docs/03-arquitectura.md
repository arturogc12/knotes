# 03 · Arquitectura

## Visión de alto nivel

K-Notes es una **Single Page Application (SPA)** construida con React y enrutada en el cliente con React Router. El frontend se comunica con un **API Express** (chat, transcripción, export PDF) y con **Supabase** (auth, perfiles, nudos, sesiones de chat).

```
index.html  (+ manifest.webmanifest, start_url: /chat)
  └── /src/main.tsx              (punto de entrada: createRoot + BrowserRouter)
        └── <AuthProvider>
              ├── <AuthCallbackHandler>   ← OAuth / magic link en URL
              ├── <LoggedInAppRedirect>   ← sesión activa fuera de marketing → /chat o /bienvenida
              └── <Routes>
                    ├── <Layout> (App.tsx)          ← Navbar + Outlet + Footer
                    │     ├── "/"             → Home
                    │     └── "/profesionales" → Professionals
                    ├── "/login"  → Login   (sin layout compartido)
                    └── <ProtectedRoute>
                          ├── "/bienvenida" → PwaWelcome  (móvil 1ª vez, fuera de PatientAppLayout)
                          └── <PatientAppLayout>
                                ├── "/chat"   → PwaWelcomeRedirect → Chat
                                ├── "/nudos"  → Nudos
                                ├── "/nudos/:id" → NudoDetail
                                └── "/ajustes" → Settings
```

## Punto de entrada

`src/main.tsx` monta la aplicación en el `<div id="root">` de `index.html`:

- Envuelve todo en `<StrictMode>` y `<AuthProvider>`.
- Usa `<BrowserRouter>` para enrutado basado en history API.
- Declara las rutas con `<Routes>` / `<Route>`.

## Layouts

| Layout | Rutas | Descripción |
|--------|-------|-------------|
| `Layout` (`App.tsx`) | `/`, `/profesionales` | Navbar + Footer de marketing. |
| Sin layout | `/login` | Pantalla de acceso a pantalla completa. |
| Sin PatientAppLayout | `/bienvenida` | Guía PWA post-registro (protegida, solo móvil 1ª vez). |
| `PatientAppLayout` | `/chat`, `/nudos`, `/ajustes` | Shell de zona paciente. En móvil, `/chat` rompe el shell con `position: fixed` a pantalla completa. |

## Flujo de navegación del usuario

```
Home (/)  ──┬── "Para Profesionales" ──► Professionals (/profesionales)
            │
            └── "Empezar mi proceso" ──► Login (/login)
                                              │
                        Magic Link / Google OAuth
                                              ▼
                              getPostAuthDestination()
                         ┌──────────┴──────────┐
                         ▼                     ▼
              /bienvenida (móvil 1ª vez)    /chat (desktop o visitas posteriores)
                         │
                 "Entrar al Chat"
                         ▼
                    Chat (/chat)
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
     /nudos          /ajustes      (drawer móvil)

PWA instalada  →  start_url /chat  →  Chat (o /login si no hay sesión)
```

- Tras autenticación, OAuth y magic link aterrizan en `/bienvenida` (`redirectTo` en `AuthContext`); `AuthCallbackHandler` y `Login` aplican `getPostAuthDestination()`.
- **Desktop:** salta `/bienvenida` y va directo a `/chat`.
- **Móvil 1ª vez:** `/bienvenida` → "Entrar al Chat" → `/chat`; instalación opcional **desde el chat** (iOS guarda la URL actual).
- **Visitas posteriores:** siempre `/chat`.
- `PwaWelcomeRedirect` envuelve `/chat` y redirige a `/bienvenida` solo en móvil si no se ha visto la guía.
- `LoggedInAppRedirect` evita que usuarios logueados permanezcan en rutas de marketing (`/`, `/login`, `/profesionales`).

## Flujo de datos

**Chat (implementado):**

```
Paciente escribe en /chat
        ▼
  POST /api/chat (Vite proxy → Express)
        ▼
  OpenAI (ChatGPT)  → responde según fases TCC (ver 09-flujo-chat.md)
        ▼
  Cada turno  →  borrador en Supabase (chat_sessions + nudos status=draft)
        ▼
  Al cerrar  →  finalizeClosedSession + POST /api/extract-abc (A-B-C)
```

**Nudos y export (implementado):**

```
Conversación cerrada  →  chat_sessions (closed_at) + nudos (status=complete)
        ▼
  /nudos  →  listado filtrado por user_id y status=complete (RLS)
        ▼
  POST /api/export  →  PDF consolidado A-B-C (reintenta extracción si ABC pendiente)
```

**Previsto** (ver [08 · Roadmap](./08-roadmap.md)):

- Panel real del terapeuta.

## Convenciones de la arquitectura

- **Componentes de página** viven en `src/pages/` y se exportan por defecto.
- **Componentes reutilizables** en `src/components/` (layout, patient, pwa, auth, nudos).
- **Contextos** en `src/contexts/` (`AuthContext`, `PatientDrawerContext`).
- **Utilidades y APIs cliente** en `src/lib/`.
- **Estilos globales y tokens** en `src/index.css` mediante el bloque `@theme` de Tailwind 4.
- **Alias `@`** disponible para imports absolutos desde la raíz.
