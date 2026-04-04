# Plan de Acción: Metodología AUP (Agile Unified Process)
**Proyecto:** Sistema Integral Omnicanal y ERP para Fábrica de Calzado

La metodología AUP simplifica el desarrollo ágil estructurándolo en un ciclo de vida de cuatro fases claras. A continuación, se detalla el plan de acción aplicado específicamente a nuestro proyecto de gestión de inventarios, recetas y bots.

---

## 🚀 FASE 1: INICIO (Inception)
**Objetivo:** Definir el alcance del sistema, identificar a los usuarios clave y establecer si el proyecto es viable comercial y tecnológicamente.

*   **Identificación del Problema:** La fábrica necesita gestionar un catálogo mayorista (docenas), controlar inventarios de naturaleza diversa (cuero en pie2, pegamento enilitros, plantas en tallas) y registrar ventas externas sin procesos engorrosos.
*   **Recopilación de Requisitos de Alto Nivel:**
    *   Interfaz web administrativa (Gerente).
    *   Automatización de recetas (B.O.M) para descuento de materiales al por mayor.
    *   Catálogo público reutilizable.
    *   Bots de atención (Cliente y Gerencia) conectados al mismo núcleo.
*   **Viabilidad Técnica:** Se confirma la viabilidad eligiendo una arquitectura "Serverless / Cloud": Supabase (DB), n8n + Evolution API (Backend Automático) y React/Vite (Frontend web rápido).

---

## 🏗️ FASE 2: ELABORACIÓN (Elaboration)
**Objetivo:** Demostrar la viabilidad de la arquitectura, mitigar riesgos técnicos graves (ej. seguridad, complejidad de bases de datos) y afinar los detalles de diseño.

*   **Diseño de la Base de Datos (Mitigar riesgos de estructura):** Creación del modelo híbrido. Uso exclusivo del formato `JSONB` en Supabase para absorber variables impredecibles de los materiales, evitando múltiples tablas frágiles.
*   **Diseño de la Interfaz (UX/UI):** Definición de la organización por Pestañas (Corte, Aparado, Armado) y diseño de la "Cuadrícula de Tarjetas" para el Recetario de modelos (Foto + Código).
*   **Arquitectura de Seguridad:** Planificación del muro de Autenticación (Login) y de las políticas de nivel de fila (RLS de Supabase) para evitar eliminaciones masivas por entes públicos.
*   **Planificación del Orquestador:** Estructuración teórica de la bifurcación del flujo de "Evolution API" a través de n8n (Filtro por número 'remoteJid' para Bot Cliente vs Bot Gerente).

---

## 💻 FASE 3: CONSTRUCCIÓN (Construction)
**Objetivo:** Desarrollar el código de forma iterativa (en pequeños sprints), generando versiones que el usuario pueda probar temporalmente.

*   **Iteración 1 (Frontend Base):** Programación del Dashboard en React.js y Tailwind CSS. Implementación del Modo Oscuro (Dark Mode).
*   **Iteración 2 (Backend AI & Webhooks):** Despliegue de los contenedores Docker en Render (n8n y Evolution API). Conexión del número de WhatsApp y afinamiento de los Prompts (Ingeniería de instrucciones) del "Agente Jefe" y del modelo OpenRouter.
*   **Iteración 3 (Las Recetas):** Programación del motor matemático ("Tabla Puente") que agarre una docena de producción y reste en bloque todos los insumos de la fábrica.
*   **Iteración 4 (Bloqueo de Seguridad):** Activar el Login, programar los roles, aislar de forma segura la ruta `/catalogo` y levantar el muro RLS en la nube de Supabase.

---

## 🏁 FASE 4: TRANSICIÓN (Transition)
**Objetivo:** Entregar el sistema terminado al usuario final (la fábrica), asegurar estabilidad, corregir bugs menores de producción y entrenar a los operadores.

*   **Implementación PWA:** Conversión del panel web en una Progressive Web App (Service Worker, Web Manifest) para permitir instalación remota en el celular del Gerente General.
*   **Despliegue Continuo (CI/CD):** Enlace del código matriz (GitHub) hacia los Edge Servers de **Vercel** para tener "Zero downtime" (Cero caídas).
*   **Pruebas de Campo (Testing):** Envío de mensajes agresivos en WhatsApp para ver si la IA alucina con inventario inexistente y verificación del descuento de "pares vs docenas" tras generar un pedido grande.
*   **Capacitación & Cierre:** Entrenamiento a la gerencia sobre cómo hacer uso de las tarjetas para crear nuevas Fichas Técnicas (Recetas) de zapatos y dar por entregado el Proyecto ERP.
