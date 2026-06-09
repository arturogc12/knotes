# 08 · Roadmap

Estado y próximos pasos del proyecto. K-Notes está hoy en fase de **prototipo de interfaz**: la UI está construida pero las integraciones de backend aún no están conectadas.

## Estado actual

| Área | Estado |
|------|--------|
| Landing de pacientes (`/`) | ✅ Implementada (estática) |
| Landing de profesionales (`/profesionales`) | ✅ Implementada (estática) |
| Login (`/login`) | 🟡 Simulado (redirige a `/chat`, sin auth real) |
| Chat (`/chat`) | ✅ Conectado a ChatGPT (OpenAI server-side, flujo por fases TCC) |
| Sistema de diseño | ✅ Tokens base en Tailwind 4 |
| Integración IA (ChatGPT) | ✅ Chat conversacional TCC (`POST /api/chat`) |
| Extracción A-B-C automática | ❌ Pendiente (post-proceso IA) |
| Autenticación (Supabase) | ❌ Pendiente (solo mensajes de marca) |
| Persistencia de datos | ❌ Pendiente |
| Análisis funcional A-B-C automático | ❌ Pendiente |
| Exportación a PDF | ❌ Pendiente |
| PWA | ❌ Pendiente (mencionado, sin manifest/service worker) |
| Backend / API (Express) | ✅ `server/index.ts` — chat + health |

Leyenda: ✅ hecho · 🟡 parcial/maqueta · ❌ pendiente

## Próximos pasos sugeridos

### 1. Funcionalidad del chat
- ~~Conectar el input de `/chat` a un estado real~~ ✅
- ~~Integrar ChatGPT (OpenAI) server-side~~ ✅
- Extraer el esquema **A-B-C** en un segundo paso (post-proceso o tool call) y persistirlo.

### 2. Autenticación y sesión
- Implementar **Supabase Auth** (Magic Link + Google) sustituyendo el `navigate("/chat")` simulado.
- Configurar `persistSession: true` y proteger la ruta `/chat`.

### 3. Persistencia
- Guardar las conversaciones y los autorregistros A-B-C por usuario.
- Modelo de datos: paciente ↔ terapeuta ↔ entradas/sesiones.

### 4. Vista del terapeuta
- Construir el panel real de "Reporte Semanal" (hoy es una maqueta).
- Implementar el **visualizador de estadísticas** (placeholder en `/profesionales`).
- Generación y **exportación a PDF** de los informes clínicos.

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
