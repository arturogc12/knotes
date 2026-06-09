# 02 · Stack tecnológico

## Resumen

| Capa | Tecnología |
|------|------------|
| Lenguaje | TypeScript (~5.8.2) |
| Librería UI | React 19 |
| Enrutado | React Router DOM 7 |
| Bundler / dev server | Vite 6 |
| Estilos | Tailwind CSS 4 (plugin oficial para Vite) |
| Animaciones | Motion (`motion/react`) |
| Iconos | lucide-react |
| IA | OpenAI (`openai`) — ChatGPT + Whisper, server-side en `server/` |
| Auth / DB | Supabase (`@supabase/supabase-js`) — Auth, profiles, nudos, chat_sessions |
| i18n | react-i18next — Login, ajustes y navegación (es/en) |
| Servidor API | Express 4 — `server/index.ts`, puerto `PORT` (3099) |

## Dependencias de producción

| Paquete | Versión | Uso en el proyecto |
|---------|---------|--------------------|
| `react` | ^19.0.1 | Núcleo de la UI. |
| `react-dom` | ^19.0.1 | Renderizado en el DOM (`createRoot`). |
| `react-router-dom` | ^7.17.0 | Enrutado SPA (`BrowserRouter`, `Routes`, `Outlet`). |
| `vite` | ^6.2.3 | Servidor de desarrollo y build. |
| `@vitejs/plugin-react` | ^5.0.4 | Soporte de React/JSX en Vite. |
| `@tailwindcss/vite` | ^4.1.14 | Integración de Tailwind 4 con Vite. |
| `motion` | ^12.23.24 | Animaciones de entrada y transiciones (`motion/react`). |
| `lucide-react` | ^0.546.0 | Set de iconos SVG. |
| `clsx` | ^2.1.1 | Composición condicional de clases. |
| `tailwind-merge` | ^3.6.0 | Fusión inteligente de clases Tailwind (helper `cn`). |
| `openai` | ^4.x | SDK de OpenAI (ChatGPT) para el chat TCC server-side. |
| `express` | ^4.21.2 | Servidor HTTP del API (`/api/chat`). |
| `dotenv` | ^17.2.3 | Carga de variables de entorno. |
| `@supabase/supabase-js` | ^2.x | Auth, profiles, nudos y chat_sessions. |
| `react-i18next` / `i18next` | ^17 / ^26 | Internacionalización (Login, ajustes, navegación). |
| `pdfkit` | ^0.19.0 | Generación de PDF server-side (`POST /api/export`). |
| `concurrently` | ^9.x | Ejecuta API y Vite en paralelo (`npm run dev`). |

## Dependencias de desarrollo

| Paquete | Versión | Uso |
|---------|---------|-----|
| `typescript` | ~5.8.2 | Tipado estático y chequeo (`npm run lint`). |
| `@types/node` | ^22.14.0 | Tipos de Node. |
| `@types/express` | ^4.17.21 | Tipos de Express. |
| `tailwindcss` | ^4.1.14 | Motor de Tailwind. |
| `autoprefixer` | ^10.4.21 | Prefijos CSS. |
| `esbuild` | ^0.25.0 | Transpilación rápida. |
| `tsx` | ^4.21.0 | Ejecución de scripts TS. |
| `vite` | ^6.2.3 | (También declarado en devDependencies). |

## Notas

- El chat llama a `POST /api/chat` (proxy de Vite → Express). La clave `OPENAI_API_KEY` **nunca** se expone al frontend.
- Auth con Supabase: sesión en `sessionStorage`. Tras login, `getPostAuthDestination()` envía a `/chat` (desktop o visitas posteriores) o `/bienvenida` (móvil, 1ª vez). OAuth/magic link aterrizan en `/bienvenida` y la app reenvía según plataforma.
- PWA: `public/manifest.webmanifest` con `start_url: /chat` (service worker pendiente).
- El alias `@` apunta a la raíz del proyecto (configurado tanto en `vite.config.ts` como en `tsconfig.json`).
- El proyecto usa **ESM** (`"type": "module"` en `package.json`).
- Breakpoint móvil/desktop del chat y drawer: `md` (768px).
