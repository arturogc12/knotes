# 03 · Arquitectura

## Visión de alto nivel

K-Notes es una **Single Page Application (SPA)** construida con React y enrutada en el cliente con React Router. No hay backend activo todavía: toda la lógica vive en el navegador y las pantallas son, por ahora, estáticas o simuladas.

```
index.html
  └── /src/main.tsx              (punto de entrada: createRoot + BrowserRouter)
        └── <Routes>
              ├── <Layout> (App.tsx)          ← Navbar + Outlet + Footer
              │     ├── "/"             → Home
              │     └── "/profesionales" → Professionals
              ├── "/login"  → Login   (sin layout compartido)
              └── "/chat"   → Chat    (sin layout compartido, pantalla completa)
```

## Punto de entrada

`src/main.tsx` monta la aplicación en el `<div id="root">` de `index.html`:

- Envuelve todo en `<StrictMode>`.
- Usa `<BrowserRouter>` para enrutado basado en history API.
- Declara las rutas con `<Routes>` / `<Route>`.

## Layout compartido

`src/App.tsx` exporta el componente `Layout`, que define el marco común (fondo, `Navbar`, `Footer`) y renderiza la página activa mediante `<Outlet />`.

- **Rutas con layout:** `/` y `/profesionales` comparten Navbar + Footer.
- **Rutas sin layout:** `/login` y `/chat` se renderizan a pantalla completa, fuera del `Layout`, porque son experiencias inmersivas (auth y conversación).

## Flujo de navegación del usuario

```
Home (/)  ──┬── "Para Profesionales" ──► Professionals (/profesionales)
            │
            └── "Empezar mi proceso" / "Iniciar Sesión" ──► Login (/login)
                                                                │
                                          (submit o Google) ────┘
                                                                ▼
                                                            Chat (/chat)
```

- En `Login`, tanto el formulario (`handleMockLogin`) como el botón de Google llaman a `navigate("/chat")`. Es un **login simulado**: no hay validación real ni sesión persistente todavía.

## Flujo de datos (actual vs. previsto)

**Chat (implementado):**

```
Paciente escribe en /chat
        ▼
  POST /api/chat (Vite proxy → Express)
        ▼
  OpenAI (ChatGPT)  → responde según fases TCC (ver 09-flujo-chat.md)
```

**Previsto** (ver [08 · Roadmap](./08-roadmap.md)):

```
        ▼
  Extracción esquema A-B-C (segundo paso IA o post-proceso)
        ▼
  Persistencia (Supabase)  → almacena entradas + sesión
        ▼
  Informe clínico  → exportable a PDF para el terapeuta
```

## Convenciones de la arquitectura

- **Componentes de página** viven en `src/pages/` y se exportan por defecto.
- **Componentes de layout/UI reutilizables** viven en `src/components/`.
- **Utilidades** en `src/lib/` (p. ej. el helper `cn` para clases).
- **Estilos globales y tokens** en `src/index.css` mediante el bloque `@theme` de Tailwind 4.
- **Alias `@`** disponible para imports absolutos desde la raíz.
