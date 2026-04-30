# FASES DE DESARROLLO - METODOLOGÍA AUP
**Proyecto:** Sistema Integral Omnicanal y ERP para Fábrica de Calzado "Emssa Valems"
**Arquitectura:** Serverless (React, Vite, Supabase, Tailwind CSS)

---

## FASE 1: INICIO (Inception)
**Objetivo:** Definir el alcance del sistema, identificar a los usuarios clave y establecer si el proyecto es viable comercial y tecnológicamente.

*   **Identificación del Problema:** La fábrica necesita gestionar un catálogo mayorista (docenas), controlar inventarios de naturaleza diversa (cuero en pie2, pegamento en litros, plantas en tallas) y registrar ventas externas sin procesos engorrosos.
*   **Recopilación de Requisitos de Alto Nivel:**
    *   Interfaz web administrativa (Gerente).
    *   Automatización de recetas (B.O.M) para descuento de materiales al por mayor.
    *   Catálogo público reutilizable.
    *   Bots de atención (Cliente y Gerencia) conectados al mismo núcleo.
*   **Viabilidad Técnica:** Se confirma la viabilidad eligiendo una arquitectura "Serverless / Cloud": Supabase (DB), n8n + Evolution API (Backend Automático) y React/Vite (Frontend web rápido).

---

## FASE 2: ELABORACIÓN (Elaboration)
**Objetivo:** Demostrar la viabilidad de la arquitectura, mitigar riesgos técnicos graves y afinar los detalles de diseño.

### 2.1. Modelado de Base de Datos Relacional con Soporte JSONB
Se diseñó un esquema de base de datos en **PostgreSQL (vía Supabase)** optimizado para la consistencia transaccional y la flexibilidad de la IA.

*   **Esquema Relacional:** Se definieron tablas para `inventario_materiales`, `productos_finales` y `pedidos`, asegurando la integridad referencial mediante claves primarias (UUID) y foráneas.
*   **Gestión BOM (Bill of Materials):** Implementación de una tabla intermedia `recetas_produccion` que permite el cálculo automático del costo y consumo de insumos por docena fabricada.
*   **Flexibilidad JSONB:** Se implementó la tabla `ai_user_state` utilizando el tipo de dato **JSONB**. Esta decisión técnica permite que el asistente de IA guarde "objetos de estado" dinámicos (Ficha de Venta), capturando atributos variables del pedido (talla, color, ubicación) sin requerir migraciones constantes de esquema.

### 2.2. Diseño de Prototipos de Interfaz (UX/UI)
El diseño de la interfaz se basó en los principios de **Usabilidad y Minimalismo**, priorizando la velocidad de operación en el taller.

*   **Dashboard Administrativo:** Diseñado bajo un enfoque de "Single Page Application" (SPA) con React. Se definieron módulos de visualización de stock, alertas de inventario bajo y un panel de seguimiento de pedidos en tiempo real.
*   **Experiencia Mobile-First:** Debido a que el personal del taller utiliza dispositivos móviles, la interfaz es totalmente responsiva, adaptando las tablas de insumos a vistas de tarjetas (cards) legibles en pantallas pequeñas.
*   **Flujo de Conversación (Conversational UI):** Se diseñó el árbol de decisiones del asistente de WhatsApp para que la interacción sea natural, reduciendo la fricción en la captura de pedidos mediante una personalidad de marca amable y eficiente.

### 2.3. Configuración de Seguridad mediante RLS en Supabase
*   **Aislamiento de Datos:** Las políticas RLS garantizan que los operarios solo puedan consultar el stock, mientras que solo el administrador autenticado tiene permisos de escritura (INSERT/UPDATE) sobre las tablas de precios y recetas.
*   **Autenticación JWT:** Cada solicitud desde el Dashboard está protegida por tokens JSON Web Tokens (JWT).

### 2.4. Definición de Integración con API de Mensajería
*   **Arquitectura de Webhooks:** Se configuró un puente de comunicación asíncrona donde la API de mensajería (WhatsApp) envía notificaciones a un endpoint seguro en Node.js (Vercel).
*   **Procesamiento Multimodal:** La integración incluye la capacidad de capturar mensajes binarios (audio/ogg), permitiendo que la IA procese notas de voz del cliente.

---

## FASE 3: CONSTRUCCIÓN (Construction)
**Objetivo:** Desarrollar el código de forma iterativa, generando versiones que el usuario pueda probar temporalmente.

### 3.1. Desarrollo del Dashboard en React
Se implementó una interfaz de usuario moderna utilizando **React.js** y **Vite**, con un diseño "B2B SaaS Premium" adaptado a la identidad de la marca "EMSSA VALEMS" (Modo Oscuro con acentos Dorados).

*   **Componentes Modulares:** Se crearon componentes reutilizables para la visualización de materiales, productos terminados y estados de pedidos. La interfaz se dividió en sub-componentes: `OverviewTab.jsx` e `InventoryTab.jsx`.
*   **Gestión de Estado Global:** Uso de hooks avanzados para mantener la sincronización entre la base de datos y la interfaz sin recargas de página.
*   **Ecosistema de Modales:** Se construyeron ventanas modales ultra premium con fondos borrosos estilo "Glassmorphism dark": `ManualOrderModal.jsx`, `MaterialRegistrationModal.jsx` y `StockAdjustmentModal.jsx`.

### 3.2. Implementación de Backend en Node.js
*   **Arquitectura Serverless:** El backend se desplegó como funciones independientes (Serverless Functions), optimizando el consumo de recursos y garantizando escalabilidad automática.
*   **Validación y Seguridad:** Implementación de filtros de seguridad para autorizar únicamente números de WhatsApp registrados.

### 3.3. Integración de API de Mensajería mediante Webhooks
*   **Consumo de Eventos:** Configuración de un endpoint receptor de webhooks que captura notificaciones de mensajes nuevos, estados de lectura y archivos multimedia.
*   **Tratamiento de Audios:** Lógica de conversión de mensajes de voz a formatos compatibles para su análisis por el motor de IA.

### 3.4. Motor de Pedidos y Actualización de Stock
*   **Motor de Descuento Automático:** Lógica que, al detectarse un pedido confirmado, consulta la receta (BOM) del modelo solicitado y descuenta proporcionalmente los insumos.
*   **Consistencia Transaccional:** Garantía de que la actualización del stock y el registro del pedido ocurran de forma atómica.

### 3.5. Integración de Modelo de Lenguaje (LLM)
*   **Extracción de Entidades:** Configuración de modelos **Gemma 3** para identificar datos estructurados (nombre, cantidad, modelo) dentro de una conversación informal.
*   **Memoria de Contexto:** Implementación de un sistema de historial dinámico que permite a la IA recordar los últimos mensajes.

### 3.6. Despliegue del Esquema SQL "Producción" en Supabase
Se rediseñó el modelo de base de datos relacional creando 4 tablas fundamentales:
1.  **`inventario_materiales`:** Con campo `JSONB` para propiedades asimétricas del material.
2.  **`productos_finales`:** Catálogo central con permisos públicos de visualización.
3.  **`recetas_produccion`:** Tabla relacional "Bill of Materials" para fórmulas de insumos por docena.
4.  **`pedidos`:** Con variables de logística y campo `JSONB` para variaciones especiales.

### 3.7. Sistema de Auditoría Financiera (Kárdex Valorizado)
*   **Costo Promedio Ponderado (CPP):** Cada vez que se compran nuevos insumos a un precio diferente, el sistema promedia el valor de todo el stock.
*   **Fusión de Costos:** Vinculación automática del consumo de materia prima con el precio de mano de obra por categoría.
*   **Trazabilidad por Folio Único:** Sistema de referencias únicas para amarrar cada salida de materia prima con su respectiva entrada de producto terminado.

---

## FASE 4: TRANSICIÓN (Transition)
**Objetivo:** Entregar el sistema terminado al usuario final, asegurar estabilidad y capacitar a los operadores.

### 4.1. Despliegue en Entorno Productivo (Vercel)
*   **Pipeline de Despliegue Continuo (CI/CD):** Configuración de la integración entre el repositorio de código y **Vercel**, permitiendo que cada mejora se aplique instantáneamente sin interrumpir el servicio.
*   **Variables de Entorno y Secretos:** Configuración segura de llaves API y credenciales.
*   **Implementación PWA:** Conversión del panel web en una Progressive Web App (Service Worker, Web Manifest) para instalación remota en dispositivos móviles.

### 4.2. Pruebas Funcionales y Validación del Sistema
*   **Pruebas End-to-End:** Validación del ciclo completo: desde el envío de un audio por WhatsApp hasta el descuento automático de stock visualizado en el Dashboard.
*   **Gestión de Errores:** Pruebas de resistencia ante desconexiones de red o ingresos de datos inválidos.

### 4.3. Evaluación del Rendimiento del Asistente de IA
*   **Exactitud en la Transcripción:** Evaluación de la tasa de éxito de Google Gemini al transcribir notas de voz con ruidos ambientales del taller.
*   **Precisión de Memoria:** Verificación de la consistencia de los datos en la "Ficha de Venta" (JSONB).

### 4.4. Capacitación del Personal y Entrega de Documentación
*   **Manual de Operación:** Elaboración de guías rápidas para el uso del Dashboard.
*   **Soporte Técnico:** Entrega del código fuente documentado y las configuraciones de los modelos de IA.
