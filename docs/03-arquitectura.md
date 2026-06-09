# 03 · Arquitectura

## Visión de alto nivel

K-Notes es una **Single Page Application (SPA)** construida con React y enrutada en el cliente con React Router. El frontend se comunica con un **API Express** (chat, transcripción, export PDF) y con **Supabase** (auth, perfiles, nudos, sesiones de chat).

```
index.html
  └── /src/main.tsx              (punto de entrada: createRoot + BrowserRouter)
        └── <AuthProvider>
              └── <Routes>
                    ├── <Layout> (App.tsx)          ← Navbar + Outlet + Footer
                    │     ├── "/"             → Home
                    │     └── "/profesionales" → Professionals
                    ├── "/login"  → Login   (sin layout compartido)
                    └── <ProtectedRoute>
                          ├── "/bienvenida" → PwaWelcome  (1ª vez, fuera de PatientAppLayout)
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
| Sin PatientAppLayout | `/bienvenida` | Guía PWA post-registro (protegida). |
| `PatientAppLayout` | `/chat`, `/nudos`, `/ajustes` | Shell de zona paciente. En móvil, `/chat` rompe el shell con `position: fixed` a pantalla completa. |

## Flujo de navegación del usuario

```
Home (/)  ──┬── "Para Profesionales" ──► Professionals (/profesionales)
            │
            └── "Empezar mi proceso" ──► Login (/login)
                                              │
                        Magic Link / Google OAuth
                                              ▼
                                    /bienvenida (solo 1ª vez)
                                              │
                                    "Entrar al Chat"
                                              ▼
                                         Chat (/chat)
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                     ▼                     ▼
                    /nudos              /ajustes            (drawer móvil)
```

- Tras autenticación, OAuth y magic link redirigen a `/bienvenida` (`emailRedirectTo` / `redirectTo` en `AuthContext`).
- Si el usuario ya vio la bienvenida PWA, va directo a `/chat`.
- `PwaWelcomeRedirect` envuelve `/chat` y redirige a `/bienvenida` si es la primera visita.

## Flujo de datos

**Chat (implementado):**

```
Paciente escribe en /chat
        ▼
  POST /api/chat (Vite proxy → Express)
        ▼
  OpenAI (ChatGPT)  → responde según fases TCC (ver 09-flujo-chat.md)
        ▼
  Al cerrar conversación → saveClosedChatSession (Supabase)
```

**Nudos y export (parcial):**

```
Conversación cerrada  →  chat_sessions + nudos (Supabase)
        ▼
  /nudos  →  listado filtrado por user_id (RLS)
        ▼
  POST /api/export  →  PDF consolidado A-B-C
```

**Previsto** (ver [08 · Roadmap](./08-roadmap.md)):

- Extracción automática del esquema A-B-C en el cierre del chat.
- Panel real del terapeuta.

## Convenciones de la arquitectura

- **Componentes de página** viven en `src/pages/` y se exportan por defecto.
- **Componentes reutilizables** en `src/components/` (layout, patient, pwa, auth, nudos).
- **Contextos** en `src/contexts/` (`AuthContext`, `PatientDrawerContext`).
- **Utilidades y APIs cliente** en `src/lib/`.
- **Estilos globales y tokens** en `src/index.css` mediante el bloque `@theme` de Tailwind 4.
- **Alias `@`** disponible para imports absolutos desde la raíz.
