-- =========================================================================
-- ESQUEMA DE PRODUCCIÓN ACTUALIZADO - EMSSA VALEMS (CALZADO)
-- Instrucciones: Copia y pega esto en el "SQL Editor" de Supabase y córrelo.
-- =========================================================================

-- 1. TABLA DE INVENTARIO DE INSUMOS (Materia Prima)
CREATE TABLE inventario_materiales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL, 
    categoria TEXT NOT NULL, 
    unidad_medida VARCHAR(20) NOT NULL, 
    stock_actual NUMERIC DEFAULT 0 NOT NULL,
    stock_alerta NUMERIC DEFAULT 5 NOT NULL, 
    detalles_proveedor TEXT, 
    activo BOOLEAN DEFAULT TRUE, -- Para borrado lógico (Archivado)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE PRODUCTOS FINALES Y STOCK (Almacén de Terminados)
CREATE TABLE productos_finales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo_modelo VARCHAR(50) UNIQUE NOT NULL, 
    nombre TEXT NOT NULL, 
    color_fisico VARCHAR(50) NOT NULL, 
    taco VARCHAR(50) NOT NULL, 
    serie VARCHAR(50) NOT NULL, 
    stock_docenas NUMERIC DEFAULT 0 NOT NULL, 
    precio_docena_mayorista NUMERIC NOT NULL, 
    foto_url TEXT, 
    activo BOOLEAN DEFAULT TRUE, -- Para borrado lógico de modelos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE RECETAS DE PRODUCCIÓN (Fichas Técnicas)
CREATE TABLE recetas_produccion (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    producto_id UUID REFERENCES productos_finales(id) ON DELETE CASCADE,
    material_id UUID REFERENCES inventario_materiales(id) ON DELETE RESTRICT,
    cantidad_por_docena NUMERIC NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producto_id, material_id)
);

-- 4. TABLA DE PEDIDOS
CREATE TABLE pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_whatsapp VARCHAR(100) NOT NULL, 
    producto_id UUID REFERENCES productos_finales(id) ON DELETE RESTRICT,
    cantidad_docenas NUMERIC NOT NULL CHECK (cantidad_docenas > 0),
    total_venta NUMERIC NOT NULL,
    estado VARCHAR(30) DEFAULT 'Pendiente', 
    ciudad_destino VARCHAR(100), 
    direccion_envio TEXT, 
    notas TEXT, 
    detalles_personalizados JSONB, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS)
-- =========================================================================
ALTER TABLE inventario_materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_finales ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas_produccion ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso total (Fase de desarrollo y operación)
CREATE POLICY "Acceso total inventario" ON inventario_materiales FOR ALL USING (true);
CREATE POLICY "Acceso total productos" ON productos_finales FOR ALL USING (true);
CREATE POLICY "Acceso total recetas" ON recetas_produccion FOR ALL USING (true);
CREATE POLICY "Acceso total pedidos" ON pedidos FOR ALL USING (true);
