-- =========================================================================
-- ESQUEMA DE PRODUCCIÓN - ERP FÁBRICA DE CALZADO
-- Instrucciones: Copia y pega esto en el "SQL Editor" de Supabase y córrelo.
-- =========================================================================

-- 1. TABLA DE INVENTARIO DE INSUMOS (Materia Prima)
CREATE TABLE inventario_materiales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL, -- Ej: Cuero Liso Premium Negro
    categoria TEXT NOT NULL, -- Ej: Cueros, Suelas, Químicos, Avíos, Empaque
    unidad_medida VARCHAR(20) NOT NULL, -- Ej: metros, pares, galones
    stock_actual NUMERIC DEFAULT 0 NOT NULL,
    stock_alerta NUMERIC DEFAULT 5 NOT NULL, -- Punto crítico de alerta en UI
    detalles_proveedor TEXT, -- Nota de quien lo vende
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE PRODUCTOS FINALES Y STOCK (Almacén de Terminados)
CREATE TABLE productos_finales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_modelo VARCHAR(50) UNIQUE NOT NULL, -- Ej: MOC-01
    nombre TEXT NOT NULL, -- Ej: Mocasín Ejecutivo Oporto
    color_fisico VARCHAR(50) NOT NULL, -- Ej: Negro Brillante
    taco VARCHAR(50) NOT NULL, -- Ej: Plano Goma
    serie VARCHAR(50) NOT NULL, -- Ej: 38-42
    stock_docenas INTEGER DEFAULT 0 NOT NULL, -- Inventario Físico Real Listos
    precio_docena_mayorista NUMERIC NOT NULL, -- Cuánto vale la docena para venta externa
    foto_url TEXT, -- Enlace de la foto para el B.O.M
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE RECETAS DE PRODUCCIÓN (Fichas Técnicas / El puente)
-- ¿Qué mezcla de materiales se necesita para hacer UNA DOCENA de X producto?
CREATE TABLE recetas_produccion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id UUID REFERENCES productos_finales(id) ON DELETE CASCADE,
    material_id UUID REFERENCES inventario_materiales(id) ON DELETE RESTRICT,
    cantidad_por_docena NUMERIC NOT NULL, -- Ej: Si usa 30 pies cuadrados por cada docena
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producto_id, material_id) -- Evita poner el mismo material dos veces en la misma receta
);

-- 4. TABLA DE PEDIDOS (Donde el Bot y Gerente registran ventas)
CREATE TABLE pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_whatsapp VARCHAR(50) NOT NULL, -- Ej: 51987654321, el bot lo llenará oculto
    producto_id UUID REFERENCES productos_finales(id) ON DELETE RESTRICT,
    cantidad_docenas INTEGER NOT NULL CHECK (cantidad_docenas > 0),
    total_venta NUMERIC NOT NULL,
    estado VARCHAR(30) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Producción', 'Listo', 'Entregado', 'Cancelado')),
    ciudad_destino VARCHAR(100), -- Ej: Lima, Arequipa, Bogotá
    direccion_envio TEXT, -- Ej: Calle las flores 123, referencia cruzando el puente
    notas TEXT, -- Comentarios generales ("Entregar a las 5pm")
    detalles_personalizados JSONB, -- Ej: {"color_cuero": "azul", "planta": "expanso"}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- ACTIVACIÓN DE SEGURIDAD (Row Level Security - RLS)
-- =========================================================================
-- Habilitamos la seguridad. ¡Tu base de datos ahora está blindada!
ALTER TABLE inventario_materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_finales ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas_produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- POLITICAS BÁSICAS (Para empezar):
-- Todo proyecto debe permitir a cualquiera LEER el catálogo de productos_finales (Para la PWA y Bot).
CREATE POLICY "Permitir lectura de catálogo a todos" 
ON productos_finales FOR SELECT USING (true);

-- (Nota: Para Insertar/Actualizar/Borrar, luego enlazaremos las políticas a que tengas la sesión iniciada en tu React App).
