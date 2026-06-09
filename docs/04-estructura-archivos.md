# 04 · Estructura de archivos

## Árbol del proyecto

```
knotes+/
├── index.html                  # HTML raíz; monta /src/main.tsx en #root
├── package.json                # Metadatos, scripts y dependencias
├── package-lock.json           # Lockfile de npm
├── vite.config.ts              # Configuración de Vite (plugins, alias, server)
├── tsconfig.json               # Configuración de TypeScript
├── metadata.json               # Metadatos del producto
├── README.md                   # Instrucciones de arranque local
├── .env.example                # Plantilla de variables de entorno
├── .env.local                  # Variables locales (NO versionado, contiene secretos)
├── .gitignore                  # Exclusiones de git
│
├── assets/
│   └── .aistudio/              # Artefactos de Google AI Studio
│
├── docs/                       # 📚 Esta documentación
│
├── server/
│   ├── index.ts                # Express: health + POST /api/chat
│   ├── chat.ts                 # Handler del chat y máquina de fases
│   ├── openai.ts               # Cliente OpenAI (ChatGPT)
│   ├── prompt.ts               # System prompt por fase TCC
│   └── types.ts                # Tipos compartidos del API
│
└── src/
    ├── main.tsx                # Punto de entrada: createRoot + router
    ├── App.tsx                 # Componente Layout (Navbar + Outlet + Footer)
    ├── index.css               # Estilos globales + tokens de tema (Tailwind 4)
    │
    ├── components/
    │   └── layout/
    │       ├── Navbar.tsx       # Barra de navegación superior (fija)
    │       └── Footer.tsx       # Pie de página
    │
    ├── lib/
    │   ├── utils.ts            # Helper cn() (clsx + tailwind-merge)
    │   └── chatApi.ts          # Cliente fetch → POST /api/chat
    │
    └── pages/
        ├── Home.tsx            # Landing para pacientes ("/")
        ├── Professionals.tsx   # Landing para terapeutas ("/profesionales")
        ├── Login.tsx           # Login simulado ("/login")
        └── Chat.tsx            # Pantalla de chat ("/chat")
```

## Responsabilidad de cada archivo

### Raíz

| Archivo | Responsabilidad |
|---------|-----------------|
| `index.html` | Documento HTML mínimo con `#root` y el script de entrada. |
| `package.json` | Scripts (`dev`, `build`, `preview`, `clean`, `lint`) y dependencias. |
| `vite.config.ts` | Plugins React + Tailwind, alias `@`, y control de HMR/watch por variable `DISABLE_HMR`. |
| `tsconfig.json` | Target ES2022, JSX `react-jsx`, alias `@/*`, `noEmit`. |
| `metadata.json` | Nombre y descripción del producto. |
| `.env.example` | Plantilla con `OPENAI_API_KEY`, `OPENAI_MODEL`, `PORT` y `APP_URL`. |

### `src/`

| Archivo | Responsabilidad |
|---------|-----------------|
| `main.tsx` | Arranca React, define el router y todas las rutas. |
| `App.tsx` | Layout común que envuelve las rutas principales. |
| `index.css` | Importa fuentes + Tailwind y define los tokens `@theme`. |

### `src/components/layout/`

| Componente | Responsabilidad |
|------------|-----------------|
| `Navbar.tsx` | Navegación fija superior con logo, alternancia Pacientes/Profesionales y CTA de login. Incluye menú móvil con `AnimatePresence`. |
| `Footer.tsx` | Pie con logo, copyright dinámico y enlaces a Privacidad/Términos. |

### `src/lib/`

| Archivo | Responsabilidad |
|---------|-----------------|
| `utils.ts` | Exporta `cn(...)`, que combina `clsx` y `twMerge` para componer clases Tailwind sin conflictos. |

### `src/pages/`

| Página | Ruta | Responsabilidad |
|--------|------|-----------------|
| `Home.tsx` | `/` | Hero para pacientes, preview de chat/informe, features. |
| `Professionals.tsx` | `/profesionales` | Hero para terapeutas, mockup de informe A-B-C, beneficios. |
| `Login.tsx` | `/login` | Formulario de acceso simulado (Magic Link + Google). |
| `Chat.tsx` | `/chat` | Interfaz de conversación a pantalla completa. |

Ver el detalle de cada página en [05 · Rutas y páginas](./05-rutas-y-paginas.md).
