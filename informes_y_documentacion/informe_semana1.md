# Informe de Proyecto: Sistema de Gestión de Inventario y Pedidos (Semana 1)

**Objetivo General:** Desarrollar un ecosistema integrado omnicanal utilizando automatización de IA (n8n), integración de mensajería (Evolution API), base de datos en nube (Supabase) y una Aplicación Web Web Progresiva (PWA con React/Vite) para la recepción y control de stock.

---

## 🗓️ Desarrollo de la Semana 1: Infraestructura y Bases del Sistema

### Día 1: Configuración de la Base de Datos y Estructura Backend
* **Análisis y modelado de datos:** Definición de la estructura necesaria para soportar un sistema de pedidos dinámico.
* **Creación del entorno de Supabase:** Configuración inicial del servicio de base de datos en la nube.
* **Diseño de tablas relacionales:** Creación de las tablas principales (`pedidos` y `productos`) con sus respectivos campos (ID, cliente_whatsapp, cantidad_docenas, estado, etc.).
* **Configuración de seguridad:** Generación de llaves API (Anon Key / URL) para preparar el consumo externo.

### Día 2: Despliegue del Motor de Mensajería (Evolution API)
* **Aprovisionamiento de servidor en Render:** Creación del servicio web (Web Service) gratuito/básico en la plataforma Render para alojar contenedores.
* **Despliegue de Evolution API:** Instalación de la API de WhatsApp para permitir el control programático de las líneas de comunicación del negocio.
* **Configuración de Webhooks:** Establecimiento de la ruta de conexión para que todos los mensajes de los clientes se reenvíen al sistema de automatización de manera instantánea.

### Día 3: Instalación del Motor de Tareas y Orquestación (n8n)
* **Despliegue de n8n en Render:** Levantamiento en la nube de la plataforma de automatización de código abierto (n8n).
* **Conexión entre APIs:** Enlace exitoso del Webhook despachado por Evolution API hacia el disparador (Trigger) inicial de n8n.
* **Configuración de variables de entorno:** Almacenamiento seguro de credenciales para asegurar la comunicación fluida entre WhatsApp, n8n y Supabase.

### Día 4: Inicialización y Diseño del Frontend (Proyecto Base)
* **Construcción del repositorio local:** Creación del proyecto base (App) utilizando de React.js junto a Vite para una experiencia de desarrollo veloz y hot-reloading.
* **Diseño del sistema de interfaz (UI):** Instalación y configuración de Tailwind CSS para definir la paleta de colores (ej. Industrial Blue) y las tipografías del sistema.
* **Construcción de componentes visuales:** Creación de los módulos interactivos iniciales como el *Dashboard* y las tarjetas de pedidos (*OrderCards*).
* **Conexión de datos:** Enlace preliminar de la aplicación cliente con la base de datos mediante `@supabase/supabase-js`.
