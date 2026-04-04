# INFORME DE DESARROLLO TÉCNICO: FASE DE CONSTRUCCIÓN 1
**Proyecto:** Portal Gerencial Administrativo - EMSSA VALEMS
**Arquitectura:** Serverless (React, Vite, Supabase, Tailwind CSS)

A continuación, se documenta paso a paso el desarrollo de la estructura fundacional del sistema y las decisiones técnicas implementadas durante esta fase de construcción (Basado en metodología AUP).

---

## 1. RE-ESTRUCTURACIÓN DE LA ARQUITECTURA BASE (Clean Code)
Para asegurar que el proyecto pudiera escalar a un nivel de producción, se realizó una "limpieza de lienzo":
*   Se eliminaron componentes prototípicos no optimizados (`Dashboard.jsx`, `Inventory.jsx`).
*   Se unificó la inyección de estilos, manteniendo únicamente la configuración esencial de instalación progresiva (`PWA - Service Workers`) y el control del `Theme` (Dark Mode).

## 2. DESPLIEGUE DEL ESQUEMA SQL "PRODUCCIÓN" EN SUPABASE
Se rediseñó el modelo de base de datos relacional para gestionar la complejidad de una fábrica de calzado al por mayor, creando 4 tablas fundamentales bajo fuertes reglas de seguridad e integridad:
1.  **`inventario_materiales`:** Con implementación de un campo clave tipo `JSONB` que permite almacenar propiedades asimétricas del material (ej. {"color":"azul", "talla":38}) sin corromper o ensanchar la tabla.
2.  **`productos_finales`:** El catálogo de origen central, con permisos públicos de visualización (`RLS: SELECT USING(true)`).
3.  **`recetas_produccion`:** Tabla relacional estratégica (*Bill of Materials*) que estipula las fórmulas de insumos necesarios para armar conjuntos comerciales, en este caso, **docenas** (evitando desgastes matemáticos por par).
4.  **`pedidos`:** Se integraron variables fundamentales de logística (`ciudad_destino`, `direccion_envio`) y un segundo campo `JSONB` llamado `detalles_personalizados` diseñado exclusivamente para almacenar variaciones especiales solicitadas por los clientes desde el bot de mensajería (n8n).

## 3. IDENTIDAD CORPORATIVA Y DISEÑO UX/UI (B2B Luxury Pattern)
Se abandonó el patrón genérico industrial en favor de un diseño "B2B SaaS Premium", adaptado directamente a la identidad de la marca de calzado femenino "EMSSA VALEMS":
*   **Modificación de Tailwind:** Se sobreescribieron las configuraciones de origen en `tailwind.config.js` para inyectar los códigos hexadecimales extraídos del branding oficial: `brand-peach` (Fondo), `brand-gold` (Textos finos) y `brand-black` (Monograma).
*   **Efecto "Dot Matrix" Malla de Puntos:** En lugar de imágenes o videos pesados de fondo, se empleó programación matemática CCS (`radial-gradient`) que imprime un patrón geométrico ultra-ligero que no afecta la tarjeta gráfica de los clientes.
*   **Gaze Effect (Linterna Interactiva):** Mediante el *hook* reactivo `onMouseMove`, el sistema captura las coordenadas de la punta del ratón (a 60 fps) en el DOM principal y traslada una luz difusa gaussiana (`blur-80px`) en tiempo real, generando una percepción de "software vivo y reactivo" propio de Silicon Valley.
*   **Glassmorphism Corporativo:** Uso de desenfoques de fondo superpuestos (`backdrop-blur`) en el formulario principal para dar un efecto de cristal empañado súper moderno y opacidad contrastante.

## 4. INTEGRACIÓN DE SEGURIDAD, ENRUTAMIENTO Y AUTH API (BaaS)
Finalmente, en `App.jsx`, se implementó la lógica dura de control de acceso apoyada en métodos BaaS (Backend as a Service):
*   Se vinculó el formulario a los servicios REST nativos: `supabase.auth.signInWithPassword()`.
*   Se estableció control de estados de carga (`isLoading`) interactivos para evitar dobles peticiones y colapsos de interfaz, en conjunto a mensajes dinámicos ante "credenciales erróneas".
*   **Aislamiento de Panel (Protección Frontend):** Se implementó un escuchador en tiempo real (`onAuthStateChange`) que verifica si el equipo cuenta con una sesión viva garantizando que una vez el usuario logre pasar la barrera de verificación, visualice el entorno cerrado denominado "Portal Gerencial", validándose con efectividad al momento y restringiendo acceso anónimo al contenido administrativo.
