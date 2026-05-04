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
  const [isEditing, setIsEditing] = useState(false);
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
          code: item.codigo_modelo, // Mapeo crítico para que el modal de detalle funcione
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
    setIsEditing(false);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (shoe) => {
    setCloneData(shoe);
    setIsEditing(true);
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
              onClick={() => { setCloneData(null); setIsEditing(false); setIsCreateModalOpen(true); }}
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

        {/* TABLA DE PRODUCCIÓN INDUSTRIAL (B.O.M) */}
        {loading ? (
          <div className="flex justify-center items-center h-64 border border-[#333] border-dashed rounded-2xl">
            <p className="text-gray-500 animate-pulse font-bold tracking-widest uppercase">Sincronizando Recetas con Supabase...</p>
          </div>
        ) : filteredShoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#111] rounded-3xl border border-[#222] border-dashed">
            <Beaker className="w-16 h-16 text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium text-lg">No hay modelos registrados con este código.</p>
          </div>
        ) : (
          <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a0a0a] border-b border-[#222]">
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Miniatura</th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Código Modelo</th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Taco / Serie</th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold text-right">Costo Fábrica</th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold text-right">Precio Venta (DOC)</th>
                    <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {filteredShoes.map((shoe) => (
                    <tr 
                      key={shoe.id} 
                      onClick={() => setSelectedShoe(shoe)}
                      className="group hover:bg-[#161616] transition-colors border-b border-[#1a1a1a] cursor-pointer"
                    >
                      {/* MINIATURA */}
                      <td className="py-3 px-6">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#333] bg-black">
                          <img 
                            src={shoe.foto_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=100'} 
                            alt={shoe.codigo_modelo} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </td>

                      {/* CÓDIGO */}
                      <td className="py-3 px-6">
                        <div className="flex flex-col">
                          <span className="text-brand-peach font-mono font-bold text-lg tracking-tight">#{shoe.codigo_modelo}</span>
                          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{shoe.color_fisico || 'COLOR BASE'}</span>
                        </div>
                      </td>

                      {/* TACO / SERIE */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#222] px-2 py-0.5 rounded text-[10px] font-bold text-gray-300 border border-[#333]">Taco {shoe.taco}</span>
                          <span className="text-[10px] text-gray-500 font-medium">Ser. {shoe.serie}</span>
                        </div>
                      </td>

                      {/* COSTO FÁBRICA */}
                      <td className="py-3 px-6 text-right">
                        <span className="text-sm font-mono font-bold text-brand-gold">S/ {shoe.factoryCost.toFixed(2)}</span>
                        <p className="text-[8px] text-gray-600 font-bold uppercase">Insumos + Merma</p>
                      </td>

                      {/* PRECIO VENTA */}
                      <td className="py-3 px-6 text-right">
                        <span className="text-sm font-mono font-bold text-white">S/ {shoe.precio ? shoe.precio.toFixed(2) : '0.00'}</span>
                        <p className="text-[8px] text-gray-600 font-bold uppercase">Docena</p>
                      </td>

                      {/* ACCIONES */}
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedShoe(shoe)}
                            className="p-2 bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-[#444]"
                            title="Ver Detalle / B.O.M"
                          >
                            <Beaker className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEdit(shoe)}
                            className="p-2 bg-brand-peach/10 hover:bg-brand-peach/20 text-brand-peach rounded-lg transition-colors border border-brand-peach/20"
                            title="Editar Ficha"
                          >
                            <Plus className="w-4 h-4 rotate-45" />
                          </button>
                          <button 
                            onClick={() => handleClone(shoe)}
                            className="p-2 bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold rounded-lg transition-colors border border-brand-gold/20"
                            title="Clonar Modelo"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        onClose={() => { setIsCreateModalOpen(false); setCloneData(null); setIsEditing(false); }} 
        categories={categories}
        units={units}
        materials={materials}
        initialData={cloneData}
        isEditing={isEditing}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          setCloneData(null);
          setIsEditing(false);
          fetchRecipesAndCategories();
        }}
      />

    </>
  );
}
