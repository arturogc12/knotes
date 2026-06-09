# Documentación de K-Notes

> El diario de terapia que se escribe solo mientras te desahogas.

Esta carpeta contiene la documentación estructural del proyecto **K-Notes**, organizada por temas para facilitar la navegación y el mantenimiento.

## Índice

| Documento | Descripción |
|-----------|-------------|
| [01 · Visión general](./01-vision-general.md) | Qué es K-Notes, problema que resuelve, usuarios y propuesta de valor. |
| [02 · Stack tecnológico](./02-stack-tecnologico.md) | Lenguajes, frameworks y dependencias del proyecto. |
| [03 · Arquitectura](./03-arquitectura.md) | Cómo se monta la aplicación: entrada, layout, enrutado y flujo de datos. |
| [04 · Estructura de archivos](./04-estructura-archivos.md) | Mapa de carpetas y responsabilidad de cada archivo. |
| [05 · Rutas y páginas](./05-rutas-y-paginas.md) | Detalle de cada ruta, página y componente de UI. |
| [06 · Sistema de diseño](./06-sistema-diseno.md) | Paleta de colores, tipografías, tokens y patrones visuales. |
| [07 · Configuración y entorno](./07-configuracion-entorno.md) | Variables de entorno, scripts npm y configuración de build. |
| [08 · Roadmap](./08-roadmap.md) | Integraciones pendientes y próximos pasos. |

## Resumen rápido

- **Nombre del producto:** K-Notes
- **Tipo:** Web app (SPA con React) con orientación PWA/móvil
- **Stack principal:** React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- **Estado actual:** Prototipo de UI (landing + login simulado + chat estático)
- **Repositorio:** https://github.com/arturogc12/knotes.git

## Cómo arrancar

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:3000/`. Más detalles en [07 · Configuración y entorno](./07-configuracion-entorno.md).
