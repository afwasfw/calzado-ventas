# Informe de Proyecto: Sistema de Gestión ERP Emssa Valems (Semanas 3 y 4)

## 🔄 Cuadro de Rotación por Áreas

| ÁREA / SECCIÓN / EMPRESA | DESDE | HASTA | SEMANAS |
| :--- | :--- | :--- | :--- |
| **Almacenamiento de Materiales** | 15/02/2026 | 01/03/2026 | 2 Semanas |
| **Fabricación y Armado** | 02/03/2026 | 22/03/2026 | 3 Semanas |
| **Control de Salidas y Despacho** | 23/03/2026 | 05/04/2026 | 2 Semanas |
| **Administración General** | 06/04/2026 | 13/04/2026 | 1 Semana |



<br />

## 🗓️ Desarrollo de la Semana 3: Control de Inventario, Trazabilidad y Gestión Financiera


**Día 1: Arquitectura de Auditoría e Historial Maestro**
Se diseñó e implementó la tabla de auditoría en la base de datos para registrar cada movimiento físico del almacén. Esta estructura permite capturar cronológicamente las entradas y salidas asegurando que no existan alteraciones manuales sin registro previo.

**Día 2: Implementación del Kárdex de Insumos**
Se desarrolló la interfaz visual para el seguimiento de materia prima integrando filtros avanzados de búsqueda. El sistema ahora permite observar el comportamiento de cada material facilitando la toma de decisiones sobre reposición basándose en el historial de uso.

**Día 3: Valorización de Inventario y Costo Promedio**
Se programó la lógica de cálculo para la valorización de stock mediante el método de costo promedio ponderado. Ahora el sistema actualiza automáticamente el valor financiero del almacén cada vez que se registra una nueva compra de insumos con precios variables.

**Día 4: Integración de Mano de Obra y Categorías**
Se estableció el sistema de categorías productivas para el calzado permitiendo asignar costos de mano de obra por docena. Esta configuración agiliza la creación de nuevos modelos al heredar automáticamente los precios de destajo según el tipo de zapato.

---

## 🗓️ Desarrollo de la Semana 4: Fusión de Costos, Inteligencia de Negocios y Documentación

**Día 1: Automatización del Costo de Fabricación Real**
Se perfeccionó la lógica de producción para que el sistema calcule el costo total de cada docena. El algoritmo suma automáticamente el valor de los insumos consumidos según la receta técnica y le añade el costo de mano de obra de la categoría correspondiente.

**Día 2: Trazabilidad por Folio de Operación Único**
Se implementó un sistema de referencias únicas para amarrar cada salida de materia prima con su respectiva entrada de producto terminado. Esto garantiza que el gerente pueda rastrear exactamente qué materiales específicos se usaron en cada lote fabricado sin confusiones.

**Día 3: Dashboard Financiero y Margen de Utilidad**
Se reprogramó el panel de control principal para mostrar métricas de rentabilidad neta en tiempo real. El panel ahora deduce el costo de fabricación histórico de cada par vendido permitiendo visualizar la ganancia real acumulada del negocio de forma instantánea.

**Día 4: Auditoría Final y Reporte de Estado de Proyecto**
Se realizó una inspección técnica de todo el flujo de datos para validar la integridad del kárdex ante borrados o errores humanos. Se generó un informe detallado de arquitectura y se aseguró la versión más reciente del código en el repositorio central del proyecto.
