# 04 · Estructura de archivos

## Árbol del proyecto (frontend relevante)

```
knotes+/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example / .env.local
│
├── docs/                       # Esta documentación
│
├── server/                     # API Express (chat, transcribe, export)
│   ├── index.ts
│   ├── chat.ts
│   ├── openai.ts
│   ├── prompt.ts
│   └── types.ts
│
├── supabase/migrations/        # SQL: profiles, chat_sessions, nudos, RLS
│
└── src/
    ├── main.tsx                # Router + AuthProvider
    ├── App.tsx                 # Layout marketing (Navbar + Footer)
    ├── index.css               # Tokens @theme + utilidades (touch-scroll, chat-mobile-lock)
    │
    ├── contexts/
    │   ├── AuthContext.tsx     # Sesión Supabase, signIn, signOut
    │   └── PatientDrawerContext.tsx  # Estado del menú lateral móvil
    │
    ├── components/
    │   ├── auth/
    │   │   ├── AuthCallbackHandler.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── Footer.tsx
    │   ├── patient/
    │   │   ├── PatientAppLayout.tsx    # Shell post-login
    │   │   └── PatientMobileDrawer.tsx # Menú lateral móvil
    │   ├── pwa/
    │   │   ├── PwaWelcomeStep.tsx      # UI guía instalación PWA
    │   │   └── PwaWelcomeRedirect.tsx  # Guard primera visita → /bienvenida
    │   ├── landing/
    │   │   └── PricingSection.tsx
    │   └── nudos/
    │       └── ExportNudosModal.tsx
    │
    ├── hooks/
    │   └── useVoiceInput.ts
    │
    ├── i18n/
    │   ├── index.ts
    │   └── locales/ (es.json, en.json)
    │
    ├── lib/
    │   ├── chatApi.ts
    │   ├── chatSessionsApi.ts
    │   ├── exportApi.ts
    │   ├── nudosApi.ts
    │   ├── profilesApi.ts
    │   ├── pwaWelcome.ts       # hasSeen / markSeen / detectDefaultPlatform
    │   ├── supabase.ts
    │   ├── transcribeApi.ts
    │   └── utils.ts
    │
    └── pages/
        ├── Home.tsx
        ├── Professionals.tsx
        ├── Login.tsx
        ├── PwaWelcome.tsx      # /bienvenida
        ├── Chat.tsx
        ├── Nudos.tsx
        ├── NudoDetail.tsx
        └── Settings.tsx
```

## Responsabilidad por área

### `src/pages/`

| Página | Ruta | Responsabilidad |
|--------|------|-----------------|
| `Home.tsx` | `/` | Landing pacientes, pricing, preview chat. |
| `Professionals.tsx` | `/profesionales` | Landing terapeutas, mockup informe A-B-C. |
| `Login.tsx` | `/login` | Supabase Auth (Magic Link + Google). |
| `PwaWelcome.tsx` | `/bienvenida` | Pantalla bienvenida PWA (1ª vez). |
| `Chat.tsx` | `/chat` | Conversación TCC; fullscreen móvil, tarjeta desktop. |
| `Nudos.tsx` | `/nudos` | Historial de nudos + export PDF. |
| `NudoDetail.tsx` | `/nudos/:id` | Detalle A-B-C de un nudo. |
| `Settings.tsx` | `/ajustes` | Cuenta, idioma, suscripción placeholder, logout. |

### `src/components/patient/`

| Componente | Responsabilidad |
|------------|-----------------|
| `PatientAppLayout.tsx` | Shell post-login: header, tabs desktop, drawer trigger móvil, `<Outlet />`. |
| `PatientMobileDrawer.tsx` | Menú lateral: Conversación, Mis Nudos, Ajustes. |

### `src/components/pwa/`

| Componente | Responsabilidad |
|------------|-----------------|
| `PwaWelcomeStep.tsx` | UI de la guía de instalación (tabs iOS/Android, pasos 1-2-3). |
| `PwaWelcomeRedirect.tsx` | Guard en `/chat`: redirige a `/bienvenida` si no se ha visto. |

### `src/lib/pwaWelcome.ts`

- `hasSeenPwaWelcome(userId)` — consulta `sessionStorage` + `localStorage`.
- `markPwaWelcomeSeen(userId)` — persiste en ambos storages.
- `detectDefaultPlatform()` — iOS o Android por `userAgent`.

Ver el detalle de rutas en [05 · Rutas y páginas](./05-rutas-y-paginas.md) y el flujo del chat en [09 · Flujo del chat](./09-flujo-chat.md).
