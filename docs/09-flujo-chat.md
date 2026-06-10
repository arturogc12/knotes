# 09 · Flujo conversacional del chat

Este documento define **cómo se comporta el chat de K-Notes** (`/chat`): el ritmo de escritura, las fases de la conversación, los límites de mensajes y el tono que debe mantener la IA, que ejerce de **psicólogo experto en TCC (Terapia Cognitivo-Conductual)**.

Sirve como especificación tanto para la **UI** (animación de tecleo) como para la **lógica/prompt de la IA** (ChatGPT vía OpenAI API, llamadas server-side en `server/`).

---

## 1. Ritmo de escritura (animación de tecleo)

- Cada mensaje de la IA aparece con un **efecto máquina de escribir**, carácter a carácter.
- **Velocidad: ~22 ms por carácter** (≈ 45 caracteres por segundo).
- Mientras la IA procesa la respuesta del usuario (llamada API), se muestra una burbuja con **puntos animados** ("pensando").
- Mientras teclea:
  - Se muestra un cursor o indicador de "escribiendo".
  - El micrófono permanece **deshabilitado** hasta que el mensaje termina de aparecer (evita solapar turnos).
- Tras terminar de teclear, se habilita de nuevo el micrófono y la IA queda a la espera de la respuesta del usuario.
- El scroll durante el tecleo va **throttled** (1 vez por frame) para evitar tirones cuando el historial es largo.

> Parámetro de referencia: `TYPING_MS_PER_CHAR = 22` en `src/lib/chatTypewriter.ts`.

---

## 2. Fases de la conversación

La conversación es **secuencial y guiada**. La IA avanza por fases y controla cuántos mensajes intercambia en cada una.

```
Fase 0  Bienvenida (1 mensaje IA)
   ▼
Fase 1  Escucha, desahogo y contexto + intensidad inicial 1-10 (máx. 3 mensajes del usuario)
   ▼
Fase 2  Exploración TCC (preguntas hasta completar la ficha A-B-C)
   ▼
Fase 3  Preguntas socráticas (exactamente 3)
   ▼
Fase 4  Aclaración final (máx. 3 mensajes adicionales)
   ▼
Fase 4b Intensidad final 1-10 (1 pregunta IA + respuesta del usuario)
   ▼
Fase 5  Cierre experto (1 mensaje IA, confirma que el nudo está guardado)
```

---

### Fase 0 · Bienvenida

- **Un único mensaje** inicial de la IA, que aparece automáticamente al entrar en el chat.
- Objetivo: dar la bienvenida y transmitir que **el espacio está listo para escuchar**, sin juzgar.
- Tono: cálido, cercano, breve. Invita a empezar a escribir.

> Ejemplo:
> *"Hola, me alegra que estés aquí. Este es tu espacio seguro para soltar lo que llevas dentro, sin prisa y sin juicios. Cuéntame, ¿cómo te sientes hoy?"*

---

### Fase 1 · Escucha y desahogo con contexto (máx. 3 mensajes del usuario)

- La IA **escucha** y deja que el usuario se desahogue durante **un máximo de 3 mensajes**.
- Por cada mensaje, la IA **valida** emocionalmente **y hace una pregunta breve para coger contexto** (qué pasó, con quién, cuándo, qué sintió). El objetivo es **avanzar cuanto antes** hacia las preguntas clínicas y el análisis funcional, sin perder el tono de acompañamiento.
- En el **primer turno**, la IA pide además que el usuario **puntúe del 1 al 10 la intensidad** de la emoción que siente en ese momento (**intensidad inicial**, `distressInitial`). Si el usuario no da el número, la IA insiste con suavidad en los turnos siguientes (incluida la exploración) hasta capturarlo.
- Reglas:
  - **Sin ser repetitiva**: variar validación y preguntas.
  - **Sin interpretar ni aconsejar todavía**: acompaña y recoge datos, no hace preguntas socráticas aún.
  - **Una pregunta por turno**, siempre junto a la validación.

> Ejemplos (validación + pregunta de contexto):
> - *"Tiene sentido que eso te pese. ¿En qué momento del día notaste que empezaba?"*
> - *"Gracias por contármelo. ¿Qué fue lo que más te removió de lo que pasó?"*
> - *"Suena agotador. ¿Qué te dijiste a ti mismo en ese instante?"*

Si la IA ya tiene **contexto suficiente** (situación + emoción + detonante), puede **pasar a la Fase 2 antes del tercer mensaje**. Si no, transita al alcanzar el tercero.

---

### Fase 2 · Exploración TCC

- La IA empieza a **ejercer de psicólogo experto en TCC**.
- Hace **preguntas abiertas** para **completar todos los datos de la ficha del episodio** (esquema **A-B-C**):
  - **Antecedente (A):** qué pasó, cuándo, dónde y con quién.
  - **Pensamiento automático (B):** qué se dijo a sí mismo, en sus **palabras literales**.
  - **Consecuencia (C):** qué emoción sintió y qué hizo después (evitación, comprobación, retirada).
  - **Síntomas físicos:** qué notó en el cuerpo (taquicardia, nudo en el estómago, tensión...).
- El número de preguntas es **flexible**: las necesarias hasta tener una **comprensión clara** del episodio y la ficha completa.
- En cuanto la IA considera que **ha entendido la situación**, pasa a la **Fase 3**.

> Objetivo interno: identificar el **pensamiento automático** central y la situación que lo dispara, para poder cuestionarlo después, y dejar recopilada toda la información de la **tarjeta del nudo**.

---

### Fase 3 · Preguntas socráticas (exactamente 3)

- Una vez entendida la situación, la IA plantea **3 preguntas socráticas**, de una en una.
- Finalidad: ayudar al usuario a **examinar y cuestionar** su pensamiento automático, sin imponer conclusiones.
- Tipos de pregunta socrática que se pueden combinar:
  1. **Evidencia:** *"¿Qué datos tienes a favor de ese pensamiento? ¿Y en contra?"*
  2. **Perspectiva alternativa:** *"¿Hay otra forma de mirar esta situación?"*
  3. **Descatastrofización / utilidad:** *"¿Qué es lo peor que podría pasar realmente? ¿Y te ayuda pensarlo así?"*

Cada pregunta se hace **tras la respuesta del usuario** a la anterior.

---

### Fase 4 · Aclaración final (máx. 3 mensajes adicionales)

- Tras las 3 preguntas socráticas, se permiten **hasta 3 intercambios más** para **aclararlo todo**:
  - Resolver dudas que hayan surgido.
  - Afinar el pensamiento alternativo o la conclusión a la que llega el usuario.
  - Asegurar que el usuario se va con algo en claro.
- La IA sigue siendo socrática y validante; **no sermonea**.

---

### Fase 4b · Intensidad final (1-10)

- Tras la aclaración, la IA envía **un mensaje automático** pidiendo al usuario que **vuelva a puntuar del 1 al 10** la intensidad de su emoción tras la conversación (**intensidad final**, `distressFinal`).
- Si el usuario no da un número, la IA lo pide **una vez más** con suavidad; al segundo intento sin número, se pasa al cierre igualmente (la intensidad final queda sin registrar).
- En cuanto se captura el número, se pasa al **cierre experto**.

---

### Fase 5 · Cierre experto

- La IA **cierra la conversación como lo haría un terapeuta experto**:
  - Recoge brevemente el **análisis funcional de la conducta** (A-B-C: antecedente, pensamiento/conducta, consecuencia).
  - Compara la **intensidad inicial y final** (p. ej. 8/10 → 4/10): si bajó, lo refleja como logro del usuario; si no, lo normaliza.
  - **Confirma explícitamente que el nudo ya está guardado** con toda la información, listo para generar el informe o volver a visitarlo en "Mis Nudos".
  - Refuerza el avance del usuario (sin paternalismo).
  - Deja una sensación de contención y continuidad.
- **Un único mensaje** de cierre.
- Antes de mostrar este mensaje, el cliente **finaliza el nudo** (marca la sesión como cerrada, completa la tarjeta con A-B-C vía `/api/extract-abc` y confirma el guardado). Si la extracción A-B-C falla, el nudo queda guardado igualmente y se avisa al usuario de que el análisis se completará al revisar Mis Nudos o al generar el informe.

> Ejemplo:
> *"Hoy has hecho algo valioso: mirar de frente ese pensamiento y ponerlo a prueba. Tu nudo queda guardado con todo lo que hemos trabajado, para tu informe o para cuando quieras volver a él. Aquí estaré cuando lo necesites."*

---

## 3. Resumen de límites

| Fase | Quién habla | Límite |
|------|-------------|--------|
| 0 · Bienvenida | IA | 1 mensaje |
| 1 · Desahogo + contexto | Usuario | máx. 3 mensajes (IA valida, pregunta contexto y pide intensidad inicial 1-10) |
| 2 · Exploración TCC | IA pregunta | hasta completar la ficha A-B-C |
| 3 · Socráticas | IA pregunta | exactamente 3 |
| 4 · Aclaración | Usuario / IA | máx. 3 intercambios adicionales |
| 4b · Intensidad final | IA pregunta / Usuario | 1 pregunta (máx. 2 intentos) |
| 5 · Cierre | IA | 1 mensaje (guarda el nudo y lo confirma) |

### Implementación server-side

Las fases se mapean a `ChatPhase` en `server/types.ts` y avanzan en `server/chat.ts`:

`welcome` → `venting` → `exploration` → `socratic` → `clarification` → `finalRating` → `closing` → `closed`

- **Exploración:** solo avanza cuando la IA marca `situationUnderstood: true` (sin tope fijo de turnos).
- **Intensidades:** la IA devuelve `distressInitial` / `distressFinal` (1-10) en su JSON cuando el usuario puntúa; se acumulan en `ChatState` y se persisten en el nudo (`distress_initial`, `distress_final`; `distress_scale` = inicial, usada por el informe).
- **Intensidad final (Fase 4b):** fase `finalRating`; el cliente solicita la pregunta automáticamente al terminar la aclaración (flag `finalRatingAsked`). Se avanza a `closing` al capturar el número o tras 2 respuestas sin número.
- **Persistencia incremental:** tras la bienvenida y en cada turno completado, el cliente sincroniza un borrador en Supabase (`chat_sessions` con `closed_at` nulo + `nudos` con `status = draft`). Las intensidades se actualizan en el nudo borrador en cuanto se capturan. Los borradores no aparecen en Mis Nudos.
- **Cierre (Fase 5):** fase `closing`; el cliente solicita el mensaje automáticamente, llama a `finalizeClosedSession` (cierra la sesión existente, marca el nudo `complete`, ejecuta `/api/extract-abc`) y después muestra el mensaje de cierre. `markSaved` solo se activa tras un guardado exitoso.

---

## 4. Principios de tono (transversales)

- **Cálido, humano y no repetitivo**: variar fórmulas, evitar muletillas.
- **Validar antes de cuestionar**: nunca saltar a la pregunta socrática sin haber sostenido primero.
- **Sin diagnósticos ni consejos médicos**: la IA acompaña y explora, no prescribe.
- **Mensajes breves**: una idea por turno; mejor varias intervenciones cortas que un muro de texto.
- **Trabajo tras bambalinas**: mientras conversa, la IA va etiquetando internamente el material como **A-B-C** para el informe del terapeuta (ver [01 · Visión general](./01-vision-general.md)).

---

## 5. Entrada por voz (hablar con el chat)

- El usuario puede **hablar** con el chat pulsando el botón de micrófono.
- El audio se envía al servidor y se transcribe con **OpenAI Whisper** (misma cuenta/API que ChatGPT), **no** con el reconocimiento de voz del navegador.
- La transcripción se envía automáticamente como mensaje del usuario al flujo conversacional.
- Mientras transcribe o la IA escribe, el input queda bloqueado para evitar solapar turnos.

---

## 6. Acceso al chat (primera sesión y PWA)

Tras registrarse o iniciar sesión, el destino depende de plataforma y si ya vio la guía PWA:

```
Login / OAuth  →  getPostAuthDestination()
                      ├─ Desktop ──────────────► /chat
                      ├─ Móvil 1ª vez ─────────► /bienvenida → "Entrar al Chat" → /chat
                      └─ Móvil visitas posteriores ► /chat

PWA instalada  →  manifest start_url /chat  →  /chat (o /login sin sesión)
```

- Implementación: `src/pages/PwaWelcome.tsx`, `src/components/pwa/PwaWelcomeStep.tsx`, `public/manifest.webmanifest`.
- Persistencia: `localStorage` + `sessionStorage` (`knotes:pwa-welcome-seen:<userId>`).
- Al pulsar "Entrar al Chat" se navega a `/chat` con estado `welcomeDismissed: true` para evitar rebotes del guard (`PwaWelcomeRedirect`).
- La guía de instalación es **opcional** y se muestra después del CTA; los pasos indican instalar **desde el chat** (iOS guarda la URL actual al añadir a inicio).
- En visitas posteriores y en desktop el usuario va directo a `/chat`.

---

## 7. Layout, navegación y UI del chat

Implementación en `src/pages/Chat.tsx` dentro de `PatientAppLayout` (`src/components/patient/PatientAppLayout.tsx`).

### Apariencia visual

| Elemento | Estilo |
|----------|--------|
| Burbujas IA | Fondo hielo `#EEF6FC`, borde `#DDEAF5`, `rounded-[1.5rem]` |
| Burbujas usuario | Gradiente azul pastel `#7EB8DA` → `#5A9BC4`, alineadas a la derecha |
| Cabecera del chat | Fondo `#EEF6FC`, título "Conversación" en serif itálica azul pastel |
| Input | Fondo `#F5F9FC`, borde `#C8DAE8`, `rounded-full`; micrófono + enviar |

### Móvil (`<768px`) — pantalla completa

El chat ocupa el 100% del viewport como una app nativa (estilo ChatGPT):

- Contenedor raíz: `position: fixed; inset: 0; height: 100dvh; width: 100vw; overflow: hidden; overscroll-behavior: none`.
- El `body` recibe la clase `chat-mobile-lock` para bloquear scroll y rebote del documento.
- `PatientAppLayout` oculta su cabecera en `/chat` y no aplica padding lateral (`max-md:px-0`).

```
┌─────────────────────────────┐
│ Header (56px, shrink-0)     │  ← Hamburger → drawer lateral
├─────────────────────────────┤
│ Mensajes (flex-1, scroll)   │  ← overflow-y: auto, touch-scroll
│                             │
├─────────────────────────────┤
│ Input (shrink-0)            │  ← safe-area-inset-bottom, font-size 16px
└─────────────────────────────┘
```

- Input a **16px** en móvil (anti-zoom iOS Safari).
- Con `100dvh`, al abrir el teclado el layout flex se contrae: cabecera fija, mensajes con scroll propio, input encima del teclado.

### Persistencia de sesión

- La conversación activa se guarda en `ChatSessionContext` y en `sessionStorage` (clave `knotes:chat-session:<userId>`), incluyendo `chatSessionId` y `nudoId` del borrador en Supabase.
- En paralelo, cada turno sincroniza el borrador en Supabase (`chat_sessions` + `nudos` draft) vía `src/lib/chatSessionsApi.ts`.
- Al cambiar entre **Conversación**, **Mis Nudos** o **Ajustes**, o al recargar la página (F5), se restaura la misma conversación.
- Solo se reinicia al pulsar **Nueva conversación** en la cabecera del chat, al cerrar la pestaña del navegador o al cerrar sesión.
- Implementación: `src/contexts/ChatSessionContext.tsx`, montado en `PatientAppLayout`.

### Desktop (`md+`) — tarjeta centrada

- Tarjeta con `rounded-[2rem]`, borde `#C8DAE8` y sombra suave.
- Shell completo visible: logo, pestañas superiores (Conversación / Mis Nudos), icono de Ajustes.
- Contenedor centrado: `px-4` + `max-w-4xl mx-auto` en el shell (mismos márgenes que nudos y ajustes).
- Sin `position: fixed` ni fullscreen.

### Navegación móvil (drawer lateral)

En toda la app logueada con viewport `<768px`, la barra inferior de pestañas se sustituye por un **menú lateral** (`PatientMobileDrawer`):

| Destino | Ruta |
|---------|------|
| Conversación | `/chat` |
| Mis Nudos | `/nudos` |
| Ajustes | `/ajustes` |

- Se abre desde el icono hamburger (☰) en la cabecera del shell o en la cabecera del chat.
- Se cierra al navegar, pulsar el overlay o pulsar Escape.
- En desktop la navegación sigue siendo el segmented control del header.
