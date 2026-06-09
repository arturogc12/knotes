# 07 · Configuración y entorno

## Requisitos previos

- **Node.js** (versión reciente; el proyecto usa tipos de Node 22).
- **npm** (gestor de paquetes usado, con `package-lock.json`).

## Scripts npm

Definidos en `package.json`:

| Script | Comando | Descripción |
|--------|---------|-------------|
| `dev` | `concurrently` API + Vite | Levanta API (`3099`) y frontend (`3000`) en paralelo. |
| `dev:web` | `vite --port=3000 --host=0.0.0.0` | Solo frontend. |
| `dev:api` | `tsx watch server/index.ts` | Solo API Express. |
| `build` | `vite build` | Build de producción en `dist/`. |
| `preview` | `vite preview` | Sirve localmente el build de producción. |
| `clean` | `rm -rf dist` | Limpia artefactos (comando Unix; en Windows/PowerShell puede requerir ajuste). |
| `lint` | `tsc --noEmit` | Chequeo de tipos con TypeScript sin emitir archivos. |

```bash
# Flujo habitual
npm install
npm run dev
```

> El chat requiere **API + frontend**. Si solo ejecutas `dev:web`, las llamadas a `/api/chat` fallarán.

> **Nota Windows/PowerShell:** esta shell no admite `&&` para encadenar comandos; ejecuta cada uno por separado. El script `clean` usa `rm -rf` (Unix); en Windows usa el equivalente o `Remove-Item`.

## Variables de entorno

Plantilla en `.env.example`. Las variables reales van en `.env.local` (**no versionado**).

| Variable | Descripción |
|----------|-------------|
| `OPENAI_API_KEY` | Clave de OpenAI para ChatGPT. **Solo server-side** (`server/`). |
| `OPENAI_MODEL` | Modelo OpenAI (p. ej. `gpt-4o-mini`). Por defecto `gpt-4o-mini`. |
| `PORT` | Puerto del API Express (por defecto `3099`). Vite hace proxy de `/api` a este puerto. |
| `APP_URL` | URL donde se hospeda la app. Usada para enlaces auto-referenciales y callbacks OAuth. |

> ⚠️ **Seguridad:** `.env.local` contiene secretos y está excluido por `.gitignore` (regla `.env*` con excepción `!.env.example`). Nunca lo subas al repositorio.

## Configuración de Vite (`vite.config.ts`)

- **Plugins:** `@vitejs/plugin-react` y `@tailwindcss/vite`.
- **Alias:** `@` → raíz del proyecto.
- **HMR / watch:** controlados por la variable `DISABLE_HMR`. Cuando vale `"true"` (entorno AI Studio), se desactiva el HMR y el file-watching para evitar parpadeos durante las ediciones del agente.

## Configuración de TypeScript (`tsconfig.json`)

- **Target / module:** `ES2022` / `ESNext`.
- **JSX:** `react-jsx`.
- **moduleResolution:** `bundler`.
- **Paths:** `@/*` → `./*`.
- **noEmit:** `true` (Vite/esbuild se encarga de la transpilación).
- `allowImportingTsExtensions`, `isolatedModules`, `skipLibCheck` activados.

## Git e ignorados

`.gitignore` excluye:

```
node_modules/
build/
dist/
coverage/
.DS_Store
*.log
.env*
!.env.example
```

**Repositorio remoto:** `https://github.com/arturogc12/knotes.git` (rama principal: `main`).
