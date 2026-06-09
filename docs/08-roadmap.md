# 08 · Roadmap

Estado y próximos pasos del proyecto. K-Notes está hoy en fase de **prototipo de interfaz**: la UI está construida pero las integraciones de backend aún no están conectadas.

## Estado actual

| Área | Estado |
|------|--------|
| Landing de pacientes (`/`) | ✅ Implementada (estática) |
| Landing de profesionales (`/profesionales`) | ✅ Implementada (estática) |
| Login (`/login`) | ✅ Supabase Auth (Magic Link + Google) |
| Ajustes (`/ajustes`) | 🟡 UI completa; suscripción placeholder |
| Chat (`/chat`) | ✅ Conectado a ChatGPT + diseño cálido en PatientAppLayout |
| Mis Nudos (`/nudos`, `/nudos/:id`) | 🟡 UI con datos mock, filtros 7d/30d, detalle A-B-C |
| Exportación PDF (paciente) | ✅ Exportación masiva en `/nudos` (semana/mes) vía `POST /api/export` |
| Sistema de diseño | ✅ Tokens base en Tailwind 4 |
| Integración IA (ChatGPT) | ✅ Chat conversacional TCC (`POST /api/chat`) |
| Extracción A-B-C automática | ❌ Pendiente (post-proceso IA) |
| Autenticación (Supabase) | ✅ Cliente + sesión + rutas protegidas + JWT en export PDF |
| Internacionalización (i18n) | 🟡 Ajustes, Login y navegación (es/en); resto de páginas pendiente |
| Persistencia de datos | 🟡 profiles, chat_sessions y nudos en Supabase; A-B-C automático pendiente |
| Análisis funcional A-B-C automático | ❌ Pendiente |
| Exportación a PDF | ✅ Generación server-side con pdfkit (informe A-B-C consolidado) |
| PWA | ❌ Pendiente (mencionado, sin manifest/service worker) |
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
- Sustituir `src/data/mockNudos.ts` por Supabase (o API propia).
- Modelo de datos: paciente ↔ terapeuta ↔ entradas/sesiones (nudos).

### 4. Vista del terapeuta
- Construir el panel real de "Reporte Semanal" (hoy es una maqueta).
- Implementar el **visualizador de estadísticas** (placeholder en `/profesionales`).
- ~~Activar exportación **PDF masiva** en `/nudos` (generación server-side del informe A-B-C)~~ ✅

### 5. PWA y móvil
- Añadir `manifest.json` y service worker.
- Verificar la experiencia instalable y offline.

### 6. Backend
- Definir si Express se usará como API propia o si todo irá vía Supabase + funciones serverless.

## Deuda técnica / mejoras

- **Tokens de color:** centralizar los muchos valores `bg-[#...]` arbitrarios en el `@theme` de Tailwind para coherencia.
- **Adopción de `cn()`:** el helper existe pero apenas se usa; conviene aplicarlo donde haya clases condicionales.
- **Metadatos del HTML:** `index.html` aún tiene el título por defecto *"My Google AI Studio App"*; actualizar a K-Notes (título, favicon, meta description, lang `es`).
- **README raíz:** el `README.md` de la raíz es el genérico de AI Studio; conviene reemplazarlo por uno propio de K-Notes que enlace a esta carpeta `docs/`.
- **Script `clean`:** usa `rm -rf` (no portable a Windows/PowerShell).
- **Enlaces de Footer:** "Privacidad" y "Términos" apuntan a `#`.
