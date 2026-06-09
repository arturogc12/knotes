# 06 · Sistema de diseño

El sistema visual se define con **Tailwind CSS 4** mediante el bloque `@theme` en `src/index.css`. La estética es serena, "wellness", con tonos terracota cálidos sobre fondo tipo papel.

## Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-brand-alabaster` | `#F7F5F2` | Fondo principal (alabastro / papel). |
| `--color-brand-terracotta` | `#C17B5C` | Color de marca (terracota): CTAs, acentos, logo. |
| `--color-brand-terracotta-dark` | `#A86548` | Hover de botones primarios. |
| `--color-brand-terracotta-light` | `#D4957A` | Terracota secundario. |
| `--color-brand-sand` | `#F2E8DE` | Fondos suaves, badges, paneles. |
| `--color-brand-cream` | `#FFF6F0` | Fondos crema (burbujas IA, cabeceras). |
| `--color-brand-warm` | `#F0E4D8` | Superficies cálidas. |
| `--color-brand-border` | `#E8D8CC` | Bordes sutiles. |

### Colores usados directamente en JSX (valores arbitrarios)

Además de los tokens, el código usa muchos colores "inline" con la sintaxis `bg-[#...]`:

| Color | Uso típico |
|-------|------------|
| `#2D2D2D` | Texto de titulares (casi negro). |
| `#4A4A4A` | Texto de cuerpo. |
| `#5D6D66` | Texto secundario / etiquetas. |
| `#E8D8CC` | Bordes sutiles. |
| `#F2E8DE` | Fondos terracota muy claros. |

> **Recomendación:** centralizar estos valores arbitrarios en tokens del `@theme` para mayor coherencia (ver [08 · Roadmap](./08-roadmap.md)).

## Tipografías

Importadas desde Google Fonts en `index.css`:

| Token | Fuente | Uso |
|-------|--------|-----|
| `--font-sans` | **Inter** (300–700) | Texto general, UI, titulares. |
| `--font-display` / `--font-serif` | **Playfair Display** (incluye itálicas) | Acentos elegantes, palabras destacadas en cursiva, logo "K". |

Patrón habitual: titulares en `font-medium` con una palabra clave en `font-serif italic` color terracota.

## Patrones visuales recurrentes

- **Esquinas muy redondeadas:** `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-full` en botones y tarjetas.
- **Sombras suaves y tintadas:** `shadow-xl shadow-[#C17B5C]/10`.
- **Glassmorphism:** `bg-white/80 backdrop-blur-md` en navbar, header de chat e inputs.
- **Badges de sección:** texto en mayúsculas, `tracking-[0.2em]`, `text-[10px]`, fondo `#F2E8DE`.
- **Animaciones de entrada:** `motion` con `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`, con `delay` escalonado.
- **Selección de texto:** `selection:bg-[#C17B5C]/20`.

## Utilidades CSS (`src/index.css`)

| Clase | Uso |
|-------|-----|
| `.touch-scroll` | `-webkit-overflow-scrolling: touch` en zona de mensajes del chat. |
| `body.chat-mobile-lock` | Bloquea scroll del documento en móvil cuando el chat está activo. |

## Iconografía

Iconos de **lucide-react**:

- `MessageCircleHeart`, `ShieldCheck` (Home)
- `Bot`, `FileText`, `Activity`, `ArrowRight` (Professionals)
- `Mail` (Login)
- `Menu`, `X` (Navbar marketing + drawer móvil paciente)
- `Mic`, `Send`, `Menu` (Chat móvil)
- `Layers`, `MessageCircle`, `Settings` (Drawer paciente)
- `Share`, `Smartphone`, `Zap`, `Sparkles` (PwaWelcomeStep)

## Responsividad

- **Mobile-first** con breakpoints `sm` / `md` / `lg`.
- La Home tiene secciones específicas para móvil (tarjetas de features) y para desktop (barra inferior).
- El proyecto se describe como **optimizado para PWA y móvil**.

### Chat móvil inmersivo

En `/chat` con viewport `<768px`:

- Pantalla fija a `100dvh` sin scroll del documento (`chat-mobile-lock` en `body`).
- Tres zonas: cabecera 56px, mensajes con scroll independiente (`touch-scroll`), input fijo abajo.
- Input a 16px mínimo (anti-zoom iOS). Safe area en el footer.
- En `md+` se mantiene la tarjeta cálida con bordes `rounded-[2rem]` dentro del shell habitual (sin fullscreen).

### Drawer móvil de paciente

En toda la app logueada con viewport `<768px` (`PatientMobileDrawer`):

- Se abre desde el icono hamburger (en el header del shell o en la cabecera del chat).
- Enlaces: Conversación, Mis Nudos, Ajustes.
- Sustituye la barra inferior de pestañas en móvil.
- En desktop la navegación sigue siendo el segmented control del header.

### Pantalla bienvenida PWA (`/bienvenida`)

- Badge "Instala K-Notes" + título y subtítulo centrados.
- **CTA principal arriba:** botón "Entrar al Chat" terracota `rounded-[2rem]`.
- Bloque opcional "¿Quieres acceso directo?" debajo del CTA.
- Tabs iOS/Android (indicador animado con `layoutId`) y pasos numerados con iconos sutiles.
- Misma paleta y tipografía que el resto de la app.

## Helper de estilos

`src/lib/utils.ts` expone `cn(...)`:

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Permite componer clases condicionales (`clsx`) y resolver conflictos de Tailwind (`twMerge`). *Definido y disponible, aún poco usado en las páginas actuales.*
