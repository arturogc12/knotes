# Estructura de Contenido: Guía de Instalación PWA

## Bloque 1: Título y Subtítulo
- **Badge:** Instala K-Notes
- **Título:** Lleva tu diario en el bolsillo
- **Subtítulo:** Entra al chat ahora y, si quieres, crea un acceso directo en tu pantalla de inicio para abrirlo al instante, a pantalla completa y con una experiencia nativa impecable.

## Bloque 2: CTA principal
- **Botón:** Entrar al Chat (visible antes de los pasos de instalación)

## Bloque 3: Acceso directo (opcional)
- **Título:** ¿Quieres acceso directo?
- **Texto:** Opcional: sigue estos pasos **después** de entrar al chat para que el icono abra la conversación directamente.

## Bloque 4: Pestaña / Instrucciones para iOS (iPhone)
- **Paso 1:** Pulsa **"Entrar al Chat"** arriba y, una vez dentro del chat, toca **Compartir** en Safari (el icono del cuadrado con la flecha hacia arriba en la barra inferior).
- **Paso 2:** Desplaza el menú hacia abajo y selecciona **"Añadir a la pantalla de inicio"**.
- **Paso 3:** Toca **"Añadir"** en la esquina superior derecha. El acceso directo abrirá el chat al instante.

## Bloque 5: Pestaña / Instrucciones para Android
- **Paso 1:** Pulsa **"Entrar al Chat"** arriba y, una vez dentro del chat, abre el menú de **Chrome** (tres puntos en la esquina superior derecha).
- **Paso 2:** Selecciona **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.
- **Paso 3:** Confirma tocando **"Instalar"**. El icono abrirá el chat directamente gracias al acceso directo.

## Bloque 6: Pie de sección
- **Texto de cierre:** ⚡ Instalación instantánea: Ocupa menos de 1 MB, no consume almacenamiento y se actualiza automáticamente.

## Nota técnica
- El manifest (`public/manifest.webmanifest`) define `start_url: /chat` para que el acceso directo instalado abra la conversación (Android/Chrome).
- En iOS Safari, el icono guarda la URL de la página activa al instalar; por eso los pasos indican instalar **desde el chat**.
