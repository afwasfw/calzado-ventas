# Manual de Usuario - Portal Operativo Emssa Valems

Este documento describe las funciones principales del sistema de gestión para el control de producción, inventarios y pedidos.

---

## 1. Visión General (Dashboard)
El panel principal ofrece un resumen en tiempo real del estado de la fábrica.
- **Métricas Clave**: Visualización de pedidos pendientes, alertas de insumos con stock bajo y cantidad de modelos activos en el catálogo.
- **Bandeja de Entrada**: Espacio donde se reciben las solicitudes externas (ej. WhatsApp) para ser aprobadas o rechazadas por la gerencia.
- **Accesos Rápidos**: Botones directos para crear pedidos de forma manual o registrar ingresos de materiales.

## 2. Gestión de Pedidos
Sección dedicada al seguimiento de las órdenes de venta.
- **Estados del Pedido**: Las órdenes avanzan desde "Pendiente" hasta "Entregado". 
- **Actualización de Flujo**: Cambiar el estado de un pedido permite a todo el equipo saber en qué etapa se encuentra la producción.
- **Entrega y Stock**: Al marcar un pedido como terminado y entregado, el sistema descuenta automáticamente las unidades del inventario de productos terminados.

## 3. Inventario de Insumos (Materia Prima)
Módulo para el control de todo el material necesario para la fabricación.
- **Registro de Materiales**: Permite dar de alta nuevos insumos definiendo su categoría y unidad de medida.
- **Ajustes de Stock**: Función para registrar ingresos por compras a proveedores o salidas por mermas y uso operativo.
- **Alertas de Reposición**: El sistema resalta en color rojo aquellos materiales que han llegado a un nivel crítico de existencias.
- **Búsqueda Avanzada**: Filtros dinámicos para localizar materiales por nombre o tipo.

## 4. Recetario y Fichas Técnicas
Aquí se define la "inteligencia" de fabricación de cada modelo.
- **Creación de Modelos**: Registro de nuevos diseños con sus atributos físicos y comerciales.
- **Definición de Consumos (B.O.M)**: Especificación exacta de qué materiales usa cada modelo y en qué cantidad por cada docena fabricada.
- **Cálculo Automático**: El sistema utiliza estas fichas para validar si hay material suficiente en el almacén antes de iniciar un nuevo lote de producción.

## 5. Producto Terminado (Almacén Central)
Control de las unidades listas para la venta.
- **Ingreso de Lotes**: Registro de nuevos lotes de producción que suman stock al catálogo.
- **Validación de Materiales**: Al ingresar un lote, el sistema descuenta automáticamente los insumos utilizados según la ficha técnica del modelo.
- **Balance Físico**: Consulta rápida de cuántas docenas hay disponibles de cada modelo para ser enviadas a los clientes.

---

## 💡 Recomendaciones de Uso
- **PWA (Aplicación Móvil)**: El sistema está diseñado para ser instalado en dispositivos móviles. Use la opción "Instalar aplicación" desde su navegador para un acceso más rápido.
- **Cierre de Ciclo**: Procure actualizar los movimientos de stock e ingresos de lotes el mismo día que ocurren para mantener la exactitud de los reportes.
