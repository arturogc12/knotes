# 01 · Visión general

## Qué es K-Notes

**K-Notes** es un *"diario de terapia que se escribe solo mientras te desahogas"*. Es un software de auto-reflexión basado en **Terapia Cognitivo-Conductual (TCC)** que sirve a dos públicos al mismo tiempo:

- **Pacientes:** disponen de un chat privado de conversación emocional donde escriben cómo se sienten, sin formularios ni fricción.
- **Terapeutas:** reciben de forma automática los autorregistros del paciente estructurados como **análisis funcional A-B-C** (Antecedente – Conducta/Pensamiento – Consecuencia), listos para la sesión.

## El problema que resuelve

Los autorregistros manuales (en papel o Word) son tediosos para el paciente y consumen tiempo clínico al terapeuta. K-Notes elimina esa fricción:

1. El paciente solo conversa con la app como si fuera un bloc de notas seguro.
2. La IA, "tras bambalinas", extrae y etiqueta Antecedentes, Conductas y Consecuencias.
3. El terapeuta recibe informes clínicos limpios (con vistas a exportación en PDF).

## Propuesta de valor

| Para el paciente | Para el terapeuta |
|------------------|-------------------|
| Desahogo sin fricción ni formularios | Análisis funcional automatizado |
| Espacio íntimo y confidencial | Informes semanales estructurados (A-B-C) |
| Experiencia tipo chat antes de dormir | Exportación PDF para sesión (planificado) |
| Privacidad y cifrado E2E (mensaje de marca) | Optimización del tiempo clínico |

## Usuarios objetivo

- **Pacientes en proceso de TCC** que necesitan registrar su estado emocional de forma sencilla.
- **Psicólogos / terapeutas** que quieren automatizar la recopilación y el análisis funcional de sus pacientes.

## Estado actual del producto

> El proyecto combina una **UI completa** con un **chat TCC conectado a ChatGPT** (OpenAI server-side). Autenticación, persistencia y generación de PDF siguen pendientes. Ver [08 · Roadmap](./08-roadmap.md).

Elementos ya presentes:

- Landing para pacientes (`/`) y para profesionales (`/profesionales`).
- Pantalla de login simulado (`/login`) con redirección al chat.
- Chat conversacional (`/chat`) con flujo por fases TCC y animación de tecleo (ver [09 · Flujo del chat](./09-flujo-chat.md)).

Mensajes de marca que anticipan funcionalidades futuras: *CBT-Based Mirroring*, *Cifrado E2E & Supabase Auth*, *Exportación PDF para Sesión* y *Optimizado para PWA & Móvil*.
