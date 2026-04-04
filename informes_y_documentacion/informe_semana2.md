# Informe de Proyecto: Sistema de Gestión de Inventario y Pedidos (Semana 2)

> **Nota Arquitectónica Importante:** 
> Todo el trabajo desarrollado durante esta semana y la anterior constituye un **Proyecto Base (Prototipo MVP)**. La estructura de la base de datos actual (Supabase), la lógica de respuestas del servidor bot (Agente IA) y la arquitectura general del código, fueron diseñadas estrictamente como una "prueba de concepto". **Todo el sistema sufrirá refactorizaciones y cambios profundos** en las siguientes fases del proyecto para manejar lógicas de negocio reales, escalabilidad de catálogos y flujos conversacionales avanzados.

---

## 🗓️ Desarrollo de la Semana 2: Agente Inteligente, Consolidación y Despliegue Público

### Día 1: Implementación del Agente de Inteligencia Artificial (n8n)
* **Integración del modelo LLM:** Configuración del nodo "Agente IA de Ventas" en n8n mediante Langchain, conectando motores de lenguaje externos (ej. modelos de OpenRouter).
* **Ingeniería de Instrucciones (Prompting):** Redacción de las reglas maestras del comportamiento del bot para asegurar la recepción fluida de comandos de los usuarios en WhatsApp.
* **Diseño de Herramientas (Tools de IA):** Creación de funciones aisladas que le permiten al agente leer la base (`Consultar Productos`) y escribir en ella (`Crear Pedido`), asegurando el paso correcto de parámetros JSON.
* *Limitación actual:* El bot actual es un "borrador" que servirá de bloque de construcción para el asistente definitivo.

### Día 2: Consolidación del Panel de Control (Frontend React)
* **Desarrollo del Dashboard:** Maquetación reactiva de la tarjeta de métricas principales ("Docenas Vendidas" y "Pedidos Pendientes").
* **Consumo de datos dinámicos:** Eliminación de los datos falsos temporales (mocks) para dar paso a la integración asíncrona real con Supabase (`select()`, `eq()`), capturando y mostrando las ventas del motor de n8n en el instante.
* *Limitación actual:* Esta estructura de tabla para el inventario es solo el contenedor base; será drásticamente mejorada una vez que la base de datos sea reemplazada por el esquema de producción.

### Día 3: Resolución UX/UI, Componentes y Modo Oscuro
* **Limpieza de especificidad CSS:** Identificación y parcheo de conflictos en la compilación de estilos (Tailwind CSS) donde ciertas capas y clases personalizadas colisionaban (ej. `.card` background overrides).
* **Experiencia de usuario (Dark Mode):** Implementación integral de Modo Oscuro en la aplicación. Programación de un interruptor global (`toggle`) apoyado por persistencia de configuración local en el navegador del usuario (`localStorage`).
* **Mejora visual de tarjetas:** Personalización de los componentes `OrderCard` para representar de forma vistosa si un cliente requiere atención humana o si fue procesado exitosamente por el bot.

### Día 4: Transformación PWA, Aprovisionamiento y Despliegue Global
* **Metamorfosis a PWA:** Instalación del empaquetador `vite-plugin-pwa`. Generación de un *Web App Manifest* completo, provisión de Service Workers para soporte offline, e introducción del juego de iconos redimensionables para diferentes sistemas operativos móviles.
* **Empaquetado y Control de Versiones:** Inicialización estricta del repositorio local con Git, empaquetamiento del Código Fuente Base y empuje (`push`) hacia un repositorio estructurado en GitHub.
* **Despliegue Continuo publico en Vercel:** Enlace automático exitoso entre la cuenta de repositorio de GitHub y los servidores Edge de **Vercel**. Resultado: Página web (SPA Frontend) globalmente accesible 24/7 mediante URLs públicas, totalmente gratis y lista para permitir al usuario "Añadir a la pantalla de inicio" en su teléfono móvil.
