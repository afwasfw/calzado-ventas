# Informe de Proyecto: Sistema de Gestión ERP Emssa Valems (Semanas 5 y 6)

## 🔄 Cuadro de Rotación por Áreas

| ÁREA / SECCIÓN / EMPRESA | DESDE | HASTA | SEMANAS |
| :--- | :--- | :--- | :--- |
| **Integración de Mensajería e IA** | 14/04/2026 | 20/04/2026 | 1 Semana |
| **Automatización de Pedidos y Estados** | 21/04/2026 | 27/04/2026 | 1 Semana |

<br />

## 🗓️ Desarrollo de la Semana 5: Inteligencia Artificial, Webhooks y Procesamiento Multimodal

**Día 1: Arquitectura del Asistente de Mensajería**
    Se diseñó la infraestructura para conectar el sistema con WhatsApp utilizando la Evolution API. Se configuró el servidor de webhooks en Node.js para recibir eventos en tiempo real, estableciendo las bases para una comunicación bidireccional entre el cliente y la base de datos.

**Día 2: Implementación de Procesamiento Multimodal (Audio/Voz)**
Se integraron modelos de inteligencia artificial (Google Gemini 2.5 Flash) para la transcripción automática de notas de voz. Esta funcionalidad permite que el bot comprenda pedidos dictados por audio, facilitando la interacción para clientes mayoristas en entornos de trabajo rápidos.

**Día 3: Reconocimiento Automatizado de Intenciones**
Se programó la lógica de razonamiento del bot utilizando el modelo Gemma 3 27B. Se establecieron instrucciones de sistema (System Prompts) para que la IA sea capaz de distinguir entre consultas generales, quejas y solicitudes firmes de compra de calzado.

**Día 4: Gestión de Memoria de Chat a Corto Plazo**
Se implementó la tabla `ai_chat_history` en Supabase. El sistema ahora es capaz de recuperar los últimos 6 mensajes de cada conversación, permitiendo que el asistente mantenga la coherencia y el hilo conductor del diálogo sin repetir preguntas al usuario.

---

## 🗓️ Desarrollo de la Semana 6: Memoria Persistente, Ficha de Venta y Estabilización

**Día 1: Extracción de Entidades y Lógica de Pedidos**
Se desarrolló el algoritmo de extracción de datos críticos. La IA ahora identifica automáticamente el nombre del cliente, el modelo de zapato solicitado, la cantidad en docenas y la ciudad de destino, transformando lenguaje natural en datos estructurados.

**Día 2: Implementación de Memoria de Estado Persistente (JSONB)**
Se integró la tabla `ai_user_state` utilizando objetos JSONB. Esta mejora técnica permite que el bot guarde de forma permanente una "Ficha de Venta" que no se borra aunque el historial de mensajes avance, garantizando que el asistente nunca olvide los detalles de un pedido en curso.

**Día 3: Manejo de Conflictos y Cambios de Opinión**
Se perfeccionó la lógica de actualización de estados. El sistema ahora detecta cuando un cliente cambia de opinión sobre un dato (ej: cambia la cantidad de docenas) y actualiza automáticamente el registro en Supabase mediante una operación "upsert", manteniendo la integridad de la ficha.

**Día 4: Validación End-to-End y Despliegue en Vercel**
Se realizaron pruebas de flujo completo desde WhatsApp hasta la base de datos. Se estabilizó el webhook corrigiendo errores de cierre de etiquetas y se desplegó la versión final en el entorno de Vercel, asegurando una latencia de respuesta menor a 8 segundos.
