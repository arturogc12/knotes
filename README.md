# K-Notes

El diario de terapia que se escribe solo mientras te desahogas. Software de auto-reflexión basado en TCC para pacientes y automatización de análisis funcional para terapeutas.

Documentación del proyecto: [docs/README.md](docs/README.md)

## Requisitos

- Node.js (reciente)
- npm

## Configuración

1. Instala dependencias:

```bash
npm install
```

2. Crea `.env.local` a partir de `.env.example` y configura:

- `OPENAI_API_KEY` — tu clave de OpenAI (ChatGPT)
- `OPENAI_MODEL` — modelo a usar (por defecto `gpt-4o-mini`)
- `PORT` — puerto del API (por defecto `3099`)

## Desarrollo

```bash
npm run dev
```

Esto levanta en paralelo:

- **API** Express en `http://localhost:3099` (ChatGPT server-side)
- **Frontend** Vite en `http://localhost:3000`

El chat está en `http://localhost:3000/chat`. Tras iniciar sesión, la app lleva al usuario al chat (`/chat`); en móvil, la primera visita puede pasar por la guía PWA (`/bienvenida`).

Si instalas la PWA como acceso directo, el manifest abre `/chat` al instante (estilo ChatGPT). Guía de instalación: [docs/pwa-install-text.md](docs/pwa-install-text.md).

### Scripts útiles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | API + frontend |
| `npm run dev:web` | Solo Vite |
| `npm run dev:api` | Solo API Express |
| `npm run build` | Build de producción |
| `npm run lint` | Chequeo de tipos TypeScript |
