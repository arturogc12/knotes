# 01 · Visión general

## Qué es K-Notes

**K-Notes** es un *"diario de terapia que se escribe solo mientras te desahogas"*. Es un software de auto-reflexión basado en **Terapia Cognitivo-Conductual (TCC)** que sirve a dos públicos al mismo tiempo:

- **Pacientes:** disponen de un chat privado de conversación emocional donde escriben cómo se sienten, sin formularios ni fricción.
- **Terapeutas:** reciben de forma automática los autorregistros del paciente estructurados como **análisis funcional A-B-C** (Antecedente – Conducta/Pensamiento – Consecuencia), listos para la sesión.

## El problema que resuelve

Los autorregistros manuales (en papel o Word) son tediosos para el paciente y consumen tiempo clínico al terapeuta. K-Notes elimina esa fricción:

1. El paciente solo conversa con la app como si fuera un bloc de notas seguro.
2. La IA, "tras bambalinas", extrae y etiqueta Antecedentes, Conductas y Consecuencias.
3. El terapeuta recibe informes clínicos limpios (con exportación PDF implementada).

## Propuesta de valor

| Para el paciente | Para el terapeuta |
|------------------|-------------------|
| Desahogo sin fricción ni formularios | Análisis funcional automatizado |
| Espacio íntimo y confidencial | Informes semanales estructurados (A-B-C) |
| Experiencia tipo chat antes de dormir | Exportación PDF para sesión |
| Instalable como PWA en móvil | Optimización del tiempo clínico |

## Usuarios objetivo

- **Pacientes en proceso de TCC** que necesitan registrar su estado emocional de forma sencilla.
- **Psicólogos / terapeutas** que quieren automatizar la recopilación y el análisis funcional de sus pacientes.

## Estado actual del producto

> El proyecto combina una **UI completa** con un **chat TCC conectado a ChatGPT**, **autenticación Supabase**, **persistencia de nudos** y **exportación PDF**. Ver [08 · Roadmap](./08-roadmap.md) para lo pendiente.

Elementos ya presentes:

- Landing para pacientes (`/`) y para profesionales (`/profesionales`).
- Login con Supabase Auth (`/login`): Magic Link + Google OAuth.
- Pantalla de bienvenida PWA (`/bienvenida`) en el **primer acceso móvil**, con guía opcional de instalación iOS/Android (desktop va directo a `/chat`).
- Acceso directo PWA con `start_url: /chat` para abrir la conversación al instante (estilo ChatGPT).
- Zona paciente post-login: chat (`/chat`), nudos (`/nudos`), ajustes (`/ajustes`).
- Chat conversacional con flujo por fases TCC, animación de tecleo y UX móvil nativa (ver [09 · Flujo del chat](./09-flujo-chat.md)).
- Navegación móvil mediante menú lateral (drawer); desktop con pestañas en el header.

Mensajes de marca que anticipan funcionalidades futuras: *CBT-Based Mirroring*, *Cifrado E2E & Supabase Auth* y *Optimizado para PWA & Móvil*.
