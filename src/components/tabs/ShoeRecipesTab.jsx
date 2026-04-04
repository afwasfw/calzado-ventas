import React, { useState, useEffect } from 'react';
import { Search, Info, Plus } from 'lucide-react';
import RecipeBOMModal from '../modals/RecipeBOMModal';
import CreateRecipeModal from '../modals/CreateRecipeModal';
import { supabase } from '../../lib/supabase';

export default function ShoeRecipesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShoe, setSelectedShoe] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Datos reales en lugar de mocks
  const [shoeDatabase, setShoeDatabase] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
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

      // Traer zapatos
      const { data, error } = await supabase
        .from('productos_finales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const adaptedData = (data || []).map(item => ({
        ...item,
        name: item.nombre,
        precio: item.precio_docena_mayorista,
        recipe: [] 
      }));
      
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

  const filteredShoes = shoeDatabase.filter(shoe => 
    (shoe.codigo_modelo || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (shoe.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 animate-fade-in-up relative z-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              Fichas de Calzado (B.O.M)
            </h1>
            <p className="text-gray-400 mt-2 font-medium">
              El ADN de tu producción. Define cuántos insumos cuesta fabricar cada modelo.
            </p>
          </div>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#d86145] hover:bg-[#c25035] text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-none"
          >
            <Plus className="w-5 h-5" />
            Crear Nuevo Modelo
          </button>
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
                    src={shoe.image || '/shoepics/mocasin.png'} 
                    alt={shoe.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100 mix-blend-luminosity hover:mix-blend-normal"
                  />
                </div>

                {/* CARD FOOTER */}
                <div className="p-5 flex justify-between items-center bg-[#111] group-hover:bg-[#161616] transition-colors h-full">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{shoe.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">Receta de: {shoe.recipe?.length || 0} componentes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">P. Mayorista</p>
                    <p className="text-lg font-mono font-bold text-brand-peach">S/ {shoe.precio ? shoe.precio.toFixed(2) : '0.00'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Renderizado condicional del Modal pasándole el Zapato en turno */}
      <RecipeBOMModal 
        isOpen={selectedShoe !== null} 
        onClose={() => setSelectedShoe(null)} 
        shoeData={selectedShoe}
      />
      {/* Renderizado condicional del Modal de Creación */}
      <CreateRecipeModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        categories={categories}
        units={units}
      />
    </>
  );
}
