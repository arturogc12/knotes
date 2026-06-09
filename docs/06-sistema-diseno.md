# 06 · Sistema de diseño

El sistema visual se define con **Tailwind CSS 4** mediante el bloque `@theme` en `src/index.css`. La estética es serena, "wellness", con verdes salvia sobre fondo cálido tipo papel.

## Paleta de colores

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-brand-alabaster` | `#F7F5F2` | Fondo principal (alabastro / papel). |
| `--color-brand-eucalyptus` | `#8DA399` | Color de marca (verde eucalipto): CTAs, acentos, logo. |
| `--color-brand-eucalyptus-dark` | `#7D9389` | Hover de botones primarios. |
| `--color-brand-sage` | `#8CAE99` | Verde salvia secundario. |
| `--color-brand-sand` | `#E8EEEB` | Fondos suaves, badges, paneles. |

### Colores usados directamente en JSX (valores arbitrarios)

Además de los tokens, el código usa muchos colores "inline" con la sintaxis `bg-[#...]`:

| Color | Uso típico |
|-------|------------|
| `#2D2D2D` | Texto de titulares (casi negro). |
| `#4A4A4A` | Texto de cuerpo. |
| `#5D6D66` | Texto secundario / etiquetas. |
| `#E8E4DF` | Bordes sutiles. |
| `#E8EEEB` | Fondos verdes muy claros. |

> **Recomendación:** centralizar estos valores arbitrarios en tokens del `@theme` para mayor coherencia (ver [08 · Roadmap](./08-roadmap.md)).

## Tipografías

Importadas desde Google Fonts en `index.css`:

| Token | Fuente | Uso |
|-------|--------|-----|
| `--font-sans` | **Inter** (300–700) | Texto general, UI, titulares. |
| `--font-display` / `--font-serif` | **Playfair Display** (incluye itálicas) | Acentos elegantes, palabras destacadas en cursiva, logo "K". |

Patrón habitual: titulares en `font-medium` con una palabra clave en `font-serif italic` color eucalipto.

## Patrones visuales recurrentes

- **Esquinas muy redondeadas:** `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-full` en botones y tarjetas.
- **Sombras suaves y tintadas:** `shadow-xl shadow-[#8DA399]/10`.
- **Glassmorphism:** `bg-white/80 backdrop-blur-md` en navbar, header de chat e inputs.
- **Badges de sección:** texto en mayúsculas, `tracking-[0.2em]`, `text-[10px]`, fondo `#E8EEEB`.
- **Animaciones de entrada:** `motion` con `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`, con `delay` escalonado.
- **Selección de texto:** `selection:bg-[#8DA399]/20`.

## Iconografía

Iconos de **lucide-react**:

- `MessageCircleHeart`, `ShieldCheck` (Home)
- `Bot`, `FileText`, `Activity`, `ArrowRight` (Professionals)
- `Mail` (Login)
- `ArrowLeft`, `Send` (Chat)
- `BookHeart`, `Menu`, `X` (Navbar)

## Responsividad

- **Mobile-first** con breakpoints `sm` / `md` / `lg`.
- La Home tiene secciones específicas para móvil (tarjetas de features) y para desktop (barra inferior).
- El proyecto se describe como **optimizado para PWA y móvil**.

## Helper de estilos

`src/lib/utils.ts` expone `cn(...)`:

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Permite componer clases condicionales (`clsx`) y resolver conflictos de Tailwind (`twMerge`). *Definido y disponible, aún poco usado en las páginas actuales.*
