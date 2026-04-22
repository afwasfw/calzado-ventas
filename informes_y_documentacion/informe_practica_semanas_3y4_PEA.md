# INFORME DE FORMACIÓN PRÁCTICA EN EMPRESA (Semanas 3 y 4)

### 1. Tarea más significativa durante las dos semanas
Implementación de un Sistema de Auditoría Financiera (Kárdex Valorizado) y Dashboard de Inteligencia de Negocios (BI) para el Control de Rentabilidad Real.

### 2. ¿Por qué eligió esta tarea?
Se seleccionó esta tarea para elevar el prototipo inicial a un sistema de gestión empresarial (ERP) profesional. El objetivo fundamental fue resolver la carencia de visibilidad sobre los costos reales de fabricación, integrando la valorización de insumos y el pago de mano de obra en una sola arquitectura de datos. Esto permite a la gerencia conocer el margen neto exacto de cada lote vendido, facilitando una toma de decisiones basada en datos financieros precisos y no en estimaciones.

### 3. Operaciones del PEA cumplidas con su ejecución:
1.  **Implementa servicios de base de datos:** Creación y gestión de tablas complejas de auditoría y relaciones SQL.
2.  **Crea arquitecturas en la nube:** Orquestación de servicios asíncronos para el flujo de información del Kárdex.
3.  **Planifica soluciones en la nube:** Diseño del esquema de escalado para soportar el historial masivo de movimientos.
4.  **Explora el procesamiento del lenguaje natural:** Mejora de la lógica del bot para interpretar reportes de stock.
5.  **Administra el consumo de recursos en AWS/Cloud:** Optimización de consultas para mantener la eficiencia en la nube.

---

### 4. Descripción del proceso:

**Paso 1: Diseño del Ecosistema de Auditoría (Big Data & DB)**
*   **Sub paso:** Modelado de la tabla maestra `auditoria_inventario` para el almacenamiento masivo de transacciones históricas. 
*   **Sub paso:** Definición de una arquitectura inmutable donde cada movimiento (entrada/salida) genera un registro auditable con "Folio Único" de referencia.
*   **Sub paso:** Implementación de vistas de base de datos para el cálculo automático del Costo Promedio Ponderado de los insumos.

**Paso 2: Ingeniería de Fusión de Costos (Lógica Financiera)**
*   **Sub paso:** Desarrollo de la lógica de "Fusión de Costos" que vincula automáticamente el consumo de materia prima con el precio de mano de obra por categoría (destajo).
*   **Sub paso:** Creación de funciones de cálculo para determinar el "Costo Real de Fabricación" en el momento exacto en que el zapato ingresa al almacén.

**Paso 3: Desarrollo de Inteligencia de Negocios (Dashboard BI)**
*   **Sub paso:** Programación de un panel de control interactivo que consume datos masivos del Kárdex para proyectar la rentabilidad neta.
*   **Sub paso:** Creación de filtros de visualización dinámica para monitorear el flujo de caja y los márgenes de utilidad por modelo de calzado.

**Paso 4: Trazabilidad y Seguridad de Datos en la Nube**
*   **Sub paso:** Implementación del sistema de "Referencias de Operación" para conectar lotes de producción con pedidos finales, eliminando la duplicación de gastos en la contabilidad.
*   **Sub paso:** Fortalecimiento de las políticas RLS (Seguridad a Nivel de Fila) en Supabase para proteger la información financiera sensible.

---

### 5. Máquinas, equipos, herramientas y materiales:
*   **Entornos de Almacenamiento y Cloud:**
    *   **Supabase Platform:** Gestión avanzada de base de datos PostgreSQL y políticas de seguridad Cloud.
    *   **Vercel:** Despliegue de la arquitectura frontend y optimización de recursos.
    *   **Github:** Gestión de versiones y documentación del sistema.
*   **Software y Lenguajes:**
    *   **Frameworks:** React.js, Vite y Tailwind CSS para la interfaz analítica.
    *   **Librerías:** `lucide-react` para la iconografía del dashboard y `@supabase/supabase-js`.
    *   **Documentación:** Editor Markdown para manuales técnicos y reportes de estado.
*   **Hardware:**
    *   Computador portátil de alto rendimiento para desarrollo en local e inspección de servicios en nube.

---

### 6. Resultados de la ejecución de la tarea:
Se logró completar con éxito el 100% de los objetivos planteados para este periodo bimensual, alcanzando un nivel de madurez tecnológica superior en el ERP de "Emssa Valems". El resultado más contundente es la transición exitosa de un sistema de control de stock básico a una arquitectura de Inteligencia de Negocios (BI) totalmente funcional. 

Durante estas dos semanas, se verificó la operatividad de la cadena de valor digital: el sistema ahora procesa pedidos, descuenta materia prima valorizada, integra el costo de mano de obra y proyecta la rentabilidad neta de manera autónoma y precisa. Las pruebas de estrés realizadas sobre el Kárdex confirmaron que la trazabilidad por "Folio Único" elimina cualquier margen de error en el cruce de cuentas entre fabricación y ventas. 

Finalmente, la integración del Dashboard Financiero permite a la gerencia tener una visión panorámica de la economía de la fábrica en tiempo real, facilitando la identificación inmediata de modelos con baja rentabilidad o insumos con variaciones críticas de precio. El sistema no solo opera sin interrupciones, sino que ha profesionalizado la gestión contable de la empresa, estableciendo un estándar de eficiencia y claridad de datos que anteriormente se manejaba de forma manual e imprecisa. El impacto final es un incremento en la agilidad administrativa y una seguridad total sobre la integridad de la información financiera en la nube.

