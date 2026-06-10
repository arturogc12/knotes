# Estructura Técnica del Reporte Clínico Semanal (K-Notes)

Este documento define las variables y la estructura de datos pura para generar la exportación a PDF destinada al terapeuta.

---

## PÁGINA 1: CONSOLIDACIÓN Y CLÚSTER SEMÁNTICO

### 1. Metadatos de Control Clínico
* **ID_Paciente:** `string` (Código hash o ID único anonimizado).
* **Rango_Fechas:** `date_range` (Fecha de inicio y fin del ciclo semanal).
* **Sesión_Referencia:** `integer` (Número correlativo de consulta).
* **Timestamp_Generación:** `datetime` (Fecha, hora y zona horaria de la exportación).

### 2. Indicadores Cuantitativos de Actividad
* **Volumen_Semanal:** `integer` (Sumatorio total de nudos registrados en el periodo).
* **Malestar_Promedio:** `float` (Media aritmética extraída de los inputs de malestar/ansiedad en escala 1-10).
* **Pico_Máximo:** `float` & `string` (Valor más alto registrado en el ciclo junto al día de la semana correspondiente).

### 3. Matriz de Agrupación Funcional (Clustering Semántico TCC)
*Campos calculados en el backend mediante procesamiento de lenguaje natural (PLN) para indexar por similitud.*

* **Clúster_Antecedentes (A):**
  * `Categoría / Ámbito` + `(Frecuencia)`: Descripción sintetizada del contexto repetitivo sin añadir interpretaciones subjetivas.
* **Clúster_Cogniciones (B):**
  * `Mecanismo / Sesgo detectado`: Recuento exacto de las distorsiones cognitivas indexadas en el flujo del chat.
* **Clúster_Consecuencias (C):**
  * **Manifestaciones Fisiológicas:** `list` (Listado de sintomatología corporal explícitamente reportada).
  * **Patrones Conductuales:** `list` (Clasificación objetiva entre conductas de seguridad/comprobación y de evitación/retirada).

---

## PÁGINA 2: REGISTRO DE EVIDENCIAS EN CRUDO

### 4. Matriz TCC Desglosada (Estructura de Tabla)

Cada fila representa un nudo o registro realizado por el usuario. La información se distribuye de manera estrictamente analítica:

| Campo Temporal | Estímulo Antecedente (A) | Pensamiento Automático Literal (B) | Respuesta Emocional / Fisiológica | Conducta Ejecutada (C) |
| :--- | :--- | :--- | :--- | :--- |
| `datetime` <br>(Día y Hora) | `string` <br>(Descripción objetiva del evento detonante) | `string` <br>(Autoverbalización **literal y entrecomillada** del usuario) | `string` <br>(Emociones identificadas e intensidad cuantitativa) | `string` <br>(Acción, comprobación o evitación realizada) |

---

## Directrices Técnicas para el Backend y Maquetación PDF:
1. **Restricción de Espacio:** El diseño HTML/CSS (`reporte.html`) debe estar configurado para forzar un salto de página (`page-break-before: always;`) antes de la sección 4, garantizando que el reporte ocupe exactamente 2 páginas A4 sin desbordes.
2. **Tratamiento del Texto Literal:** En la columna del Pensamiento Automático (B), se debe renderizar el string almacenado exactamente como el usuario lo escribió para preservar el valor diagnóstico de sus autoverbalizaciones.
3. **Ausencia de Respuestas IA:** Ningún campo de texto libre del reporte debe ser generado con lenguaje directivo, consejos clínicos o juicios automatizados.