# 08 · Roadmap

Estado y próximos pasos del proyecto. K-Notes tiene **UI completa**, chat TCC conectado a ChatGPT, auth Supabase y persistencia parcial en Supabase.

## Estado actual

| Área | Estado |
|------|--------|
| Landing de pacientes (`/`) | ✅ Implementada (estática) |
| Landing de profesionales (`/profesionales`) | ✅ Implementada (estática) |
| Login (`/login`) | ✅ Supabase Auth (Magic Link + Google) |
| Ajustes (`/ajustes`) | 🟡 UI completa; suscripción placeholder |
| Bienvenida PWA (`/bienvenida`) | ✅ Guía instalación iOS/Android + flujo 1ª visita |
| Chat (`/chat`) | ✅ ChatGPT + UX móvil nativa (100dvh) + tarjeta centrada desktop |
| Mis Nudos (`/nudos`, `/nudos/:id`) | 🟡 Supabase + filtros; A-B-C automático pendiente |
| Navegación móvil (drawer) | ✅ PatientMobileDrawer sustituye barra inferior |
| Exportación PDF (paciente) | ✅ Exportación masiva en `/nudos` (semana/mes) vía `POST /api/export` |
| Sistema de diseño | ✅ Tokens base en Tailwind 4 |
| Integración IA (ChatGPT) | ✅ Chat conversacional TCC (`POST /api/chat`) |
| Extracción A-B-C automática | ❌ Pendiente (post-proceso IA) |
| Autenticación (Supabase) | ✅ Cliente + sesión + rutas protegidas + JWT en export PDF |
| Internacionalización (i18n) | 🟡 Ajustes, Login y navegación (es/en); resto de páginas pendiente |
| Persistencia de datos | 🟡 profiles, chat_sessions y nudos en Supabase; A-B-C automático pendiente |
| Análisis funcional A-B-C automático | ❌ Pendiente |
| Exportación a PDF | ✅ Generación server-side con pdfkit (informe A-B-C consolidado) |
| PWA | 🟡 Manifest (`start_url: /chat`) e instrucciones de instalación; service worker y offline pendientes |
| Backend / API (Express) | ✅ `server/index.ts` — chat + export + health |

Leyenda: ✅ hecho · 🟡 parcial/maqueta · ❌ pendiente

## Próximos pasos sugeridos

### 1. Funcionalidad del chat
- ~~Conectar el input de `/chat` a un estado real~~ ✅
- ~~Integrar ChatGPT (OpenAI) server-side~~ ✅
- Extraer el esquema **A-B-C** en un segundo paso (post-proceso o tool call) y persistirlo.

### 2. Autenticación y sesión
- ~~Implementar **Supabase Auth** (Magic Link + Google)~~ ✅
- ~~Proteger rutas de paciente (`/chat`, `/nudos`, `/ajustes`)~~ ✅
- Añadir validación JWT en el API server-side.
- Página de **Ajustes** con gestión de suscripción real (Stripe u otro).

### 3. Persistencia y nudos reales
- Conectar **Mis Nudos** a datos reales: al cerrar un chat, guardar el nudo con A-B-C extraído.
- Completar migración de `src/data/mockNudos.ts` (nudos ya en Supabase; queda `formatRelativeDate` u otros helpers).
- Modelo de datos: paciente ↔ terapeuta ↔ entradas/sesiones (nudos).

### 4. Vista del terapeuta
- Construir el panel real de "Reporte Semanal" (hoy es una maqueta).
- Implementar el **visualizador de estadísticas** (placeholder en `/profesionales`).
- ~~Activar exportación **PDF masiva** en `/nudos` (generación server-side del informe A-B-C)~~ ✅

### 5. PWA y móvil
- ~~Pantalla de bienvenida con guía de instalación (`/bienvenida`)~~ ✅
- ~~UX móvil nativa del chat (fullscreen, drawer, anti-zoom iOS)~~ ✅
- ~~Manifest con `start_url: /chat` e iconos~~ ✅
- Añadir service worker y verificar experiencia offline.

### 6. Backend
- Definir si Express se usará como API propia o si todo irá vía Supabase + funciones serverless.

## Deuda técnica / mejoras

- **Tokens de color:** centralizar los muchos valores `bg-[#...]` arbitrarios en el `@theme` de Tailwind para coherencia.
- **Adopción de `cn()`:** el helper existe pero apenas se usa; conviene aplicarlo donde haya clases condicionales.
- ~~**Metadatos del HTML:** título K-Notes, lang `es`, manifest y meta PWA en `index.html`~~ ✅
- **Script `clean`:** usa `rm -rf` (no portable a Windows/PowerShell).
- **Enlaces de Footer:** "Privacidad" y "Términos" apuntan a `#`.
