import React, { useState, useEffect } from 'react';
import { Search, Info, Plus } from 'lucide-react';
import ModalListaMaterialesEnvio from '../modals/ModalListaMaterialesEnvio';
import ModalCrearReceta from '../modals/ModalCrearReceta';

import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function TabRecetasProduccion() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cloneData, setCloneData] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const [shoeDatabase, setShoeDatabase] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipesAndCategories = async () => {
    try {
      setLoading(true);

      // Traer categorías dinámicas
      const { data: catData, error: catError } = await supabase
        .from('categorias_insumos')
        .select('nombre')
        .order('nombre', { ascending: true });

      if (!catError && catData) {
        setCategories(catData.map(c => c.nombre));
      }

      // Traer unidades dinámicas
      const { data: unitData, error: unitError } = await supabase
        .from('unidades_medida')
        .select('nombre')
        .order('nombre', { ascending: true });

      if (!unitError && unitData) {
        setUnits(unitData.map(u => u.nombre));
      }

      // Traer inventario_materiales
      const { data: matData, error: matError } = await supabase
        .from('inventario_materiales')
        .select('id, nombre, categoria, unidad_medida')
        .order('nombre', { ascending: true });

      if (!matError && matData) {
        setMaterials(matData);
      }

      // Traer zapatos con sus respectivas recetas y los materiales vinculados
      const { data, error } = await supabase
        .from('productos_finales')
        .select(`
          *,
          recetas_produccion (
            cantidad_por_docena,
            margen_merma,
            inventario_materiales (
              nombre,
              categoria,
              unidad_medida,
              costo_unitario
            )
          )
        `)
        .order('codigo_modelo', { ascending: true });

      if (error) throw error;
      
      const adaptedData = (data || []).map(item => {
        // Formatear recetas anidadas
        const mappedRecipe = (item.recetas_produccion || []).map(r => ({
          category: r.inventario_materiales?.categoria || 'Sin categoría',
          material: r.inventario_materiales?.nombre || 'Material eliminado',
          amount: r.cantidad_por_docena,
          unit: r.inventario_materiales?.unidad_medida || ''
        }));

        // Calcular costo de fábrica (Insumos + Merma)
        const factoryCost = (item.recetas_produccion || []).reduce((acc, r) => {
          const cost = r.inventario_materiales?.costo_unitario || 0;
          const qty = r.cantidad_por_docena || 0;
          const waste = 1 + ((r.margen_merma || 0) / 100);
          return acc + (cost * qty * waste);
        }, 0);

        return {
          ...item,
          name: item.nombre,
          precio: item.precio_docena_mayorista,
          factoryCost: factoryCost,
          recipe: mappedRecipe
        };
      });
      
      setShoeDatabase(adaptedData);
    } catch (error) {
      console.error('Error fetching recipes or categories:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipesAndCategories();
  }, []);

  const filteredShoes = shoeDatabase.filter(shoe => {
    const matchesSearch = (shoe.codigo_modelo || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (shoe.nombre || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchive = showArchived ? !shoe.activo : shoe.activo;
    return matchesSearch && matchesArchive;
  });

  const handleClone = (shoe) => {
    setCloneData(shoe);
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 animate-fade-in-up relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              Fichas Técnicas (B.O.M)
            </h1>
            <p className="text-gray-400 mt-2 font-medium">
              Estructura de costos y materiales. Define el ADN de tu producción.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 font-bold py-3 px-6 rounded-xl transition-all border ${
                showArchived 
                ? 'bg-brand-gold text-black border-brand-gold' 
                : 'bg-transparent text-gray-400 border-[#333] hover:border-gray-500'
              }`}
            >
              {showArchived ? 'Ver Activos' : 'Ver Archivados'}
            </button>
            <button 
              onClick={() => { setCloneData(null); setIsCreateModalOpen(true); }}
              className="flex items-center gap-2 bg-[#d86145] hover:bg-[#c25035] text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-none"
            >
              <Plus className="w-5 h-5" />
              Nuevo Modelo
            </button>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-peach transition-colors font-medium text-lg"
            placeholder="🔎 Buscar catálogo por Código Industrial o Nombre del Zapato..."
          />
        </div>

        {/* GRID DE RECETAS / CATÁLOGO */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border border-[#333] border-dashed rounded-2xl">
            <p className="text-gray-500 animate-pulse font-bold tracking-widest uppercase">Sincronizando Recetas con Supabase...</p>
          </div>
        ) : filteredShoes.length === 0 ? (
          <div className="flex justify-center items-center h-64 border border-[#333] border-dashed rounded-2xl">
            <p className="text-gray-500 font-bold tracking-widest uppercase">El catálogo está vacío. Crea tu primer modelo base.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShoes.map((shoe) => (
              <div 
                key={shoe.id} 
                className="bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-hidden hover:border-[#555] transition-all cursor-pointer group shadow-xl shadow-black/40 flex flex-col"
                onClick={() => setSelectedShoe(shoe)}
              >
                {/* INYECTANDO LA IMAGEN POR DEFECTO PARA LA DB VACIA */}
                <div className="h-56 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                  {/* Etiqueta Superior */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-black/60 backdrop-blur-md text-white text-xs font-mono font-bold px-3 py-1 rounded-lg border border-white/10 uppercase tracking-widest">
                      {shoe.codigo_modelo || shoe.code}
                    </span>
                  </div>
                  
                  <img 
                    src={shoe.foto_url || '/shoepics/mocasin.png'} 
                    alt={shoe.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100 mix-blend-luminosity hover:mix-blend-normal"
                  />
                </div>

                {/* CARD FOOTER COMPACTO */}
                <div className="p-4 bg-[#111] group-hover:bg-[#161616] transition-colors border-t border-[#222]">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-bold text-base leading-tight">{shoe.name}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        Costo Fábrica: <span className="text-brand-gold">S/ {shoe.factoryCost.toFixed(2)}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">P. Mayorista</p>
                      <p className="text-base font-mono font-bold text-brand-peach">S/ {shoe.precio ? shoe.precio.toFixed(2) : '0.00'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedShoe(shoe); }}
                      className="flex-1 bg-[#222] hover:bg-[#333] text-gray-300 text-[10px] font-bold uppercase py-2 rounded-lg transition-colors"
                    >
                      Ver Detalle
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleClone(shoe); }}
                      className="flex-1 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold text-[10px] font-bold uppercase py-2 rounded-lg transition-colors"
                    >
                      Clonar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Renderizado condicional del Modal pasándole el Zapato en turno */}
      <ModalListaMaterialesEnvio 
        isOpen={selectedShoe !== null} 
        onClose={() => setSelectedShoe(null)} 
        shoeData={selectedShoe}
        onDelete={async (id) => {
          try {
            // Borrado lógico: Cambiar activo a false
            const { error } = await supabase
              .from('productos_finales')
              .update({ activo: showArchived }) // Si está en archivados, lo reactiva; si no, lo archiva.
              .eq('id', id);
              
            if (error) throw error;
            toast.success(showArchived ? 'Modelo reactivado.' : 'Modelo movido al archivo.');
            setSelectedShoe(null);
            fetchRecipesAndCategories();
          } catch(err) {
            console.error('Error archiving:', err.message);
            toast.error('Error al cambiar estado del modelo.');
          }
        }}
      />

      {/* Renderizado condicional del Modal de Creación */}
      <ModalCrearReceta 
        isOpen={isCreateModalOpen} 
        onClose={() => { setIsCreateModalOpen(false); setCloneData(null); }} 
        categories={categories}
        units={units}
        materials={materials}
        initialData={cloneData}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          setCloneData(null);
          fetchRecipesAndCategories();
        }}
      />

    </>
  );
}
