# 09 · Flujo conversacional del chat

Este documento define **cómo se comporta el chat de K-Notes** (`/chat`): el ritmo de escritura, las fases de la conversación, los límites de mensajes y el tono que debe mantener la IA, que ejerce de **psicólogo experto en TCC (Terapia Cognitivo-Conductual)**.

Sirve como especificación tanto para la **UI** (animación de tecleo) como para la **lógica/prompt de la IA** (ChatGPT vía OpenAI API, llamadas server-side en `server/`).

---

## 1. Ritmo de escritura (animación de tecleo)

- Cada mensaje de la IA aparece con un **efecto máquina de escribir**, carácter a carácter.
- **Velocidad: ~25 ms por carácter** (≈ 40 caracteres por segundo).
- Mientras teclea:
  - Se muestra un cursor o indicador de "escribiendo".
  - El campo de entrada del usuario permanece **deshabilitado** hasta que el mensaje termina de aparecer (evita solapar turnos).
- Tras terminar de teclear, se habilita de nuevo el input y la IA queda a la espera de la respuesta del usuario.

> Parámetro de referencia: `TYPING_SPEED_MS = 25`.

---

## 2. Fases de la conversación

La conversación es **secuencial y guiada**. La IA avanza por fases y controla cuántos mensajes intercambia en cada una.

```
Fase 0  Bienvenida (1 mensaje IA)
   ▼
Fase 1  Escucha, desahogo y contexto (máx. 3 mensajes del usuario)
   ▼
Fase 2  Exploración TCC (preguntas hasta entender la situación)
   ▼
Fase 3  Preguntas socráticas (exactamente 3)
   ▼
Fase 4  Aclaración final (máx. 3 mensajes adicionales)
   ▼
Fase 5  Cierre experto (1 mensaje IA)
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
- Hace **preguntas abiertas** para **entender la situación** concreta: qué pasó (antecedente), qué pensó/hizo (conducta/pensamiento) y qué consecuencia tuvo (esquema **A-B-C**).
- El número de preguntas es **flexible**: las necesarias hasta tener una **comprensión clara** del episodio.
- En cuanto la IA considera que **ha entendido la situación**, pasa a la **Fase 3**.

> Objetivo interno: identificar el **pensamiento automático** central y la situación que lo dispara, para poder cuestionarlo después.

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

### Fase 5 · Cierre experto

- La IA **cierra la conversación como lo haría un terapeuta experto**:
  - Recoge brevemente el **análisis funcional de la conducta** (A-B-C: antecedente, pensamiento/conducta, consecuencia).
  - Refuerza el avance del usuario (sin paternalismo).
  - Deja una sensación de contención y continuidad.
- **Un único mensaje** de cierre.

> Ejemplo:
> *"Hoy has hecho algo valioso: mirar de frente ese pensamiento y ponerlo a prueba. Llévate esa pregunta contigo. Aquí estaré cuando lo necesites."*

---

## 3. Resumen de límites

| Fase | Quién habla | Límite |
|------|-------------|--------|
| 0 · Bienvenida | IA | 1 mensaje |
| 1 · Desahogo + contexto | Usuario | máx. 3 mensajes (IA valida y pregunta contexto) |
| 2 · Exploración TCC | IA pregunta | hasta entender la situación |
| 3 · Socráticas | IA pregunta | exactamente 3 |
| 4 · Aclaración | Usuario / IA | máx. 3 intercambios adicionales |
| 5 · Cierre | IA | 1 mensaje |

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
