import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import MaterialRegistrationModal from '../modals/MaterialRegistrationModal';
import StockAdjustmentModal from '../modals/StockAdjustmentModal';
import CategoryManagerModal from '../modals/CategoryManagerModal';
import UnitManagerModal from '../modals/UnitManagerModal';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function InventoryTab() {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [adjustmentItem, setAdjustmentItem] = useState(null); // Para saber qué ítem preseleccionar
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Maestras directamente desde Supabase
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  
  // Estado real de Supabase
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Consulta en Tiempo Promedio a Supabase
  const fetchInventoryAndCategories = async () => {
    try {
      setLoading(true);

      // Traer las categorías maestras
      const { data: catData, error: catError } = await supabase
        .from('categorias_insumos')
        .select('nombre')
        .order('nombre', { ascending: true });

      if (!catError && catData) {
        setCategories(catData.map(c => c.nombre));
      }

      // Traer las unidades de medida maestras
      const { data: unitData, error: unitError } = await supabase
        .from('unidades_medida')
        .select('nombre')
        .order('nombre', { ascending: true });
        
      if (!unitError && unitData) {
        setUnits(unitData.map(u => u.nombre));
      }

      // Traer el inventario
      const { data, error } = await supabase
        .from('inventario_materiales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory or categories:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryAndCategories();
  }, []);

  const deleteInsumo = async (id, nombre) => {
    setActiveDropdown(null);
    toast((t) => (
      <div className="flex flex-col gap-4 p-2 bg-[#1a1a1a]">
        <p className="text-white font-medium text-sm">
          ¿Eliminar definitivamente el insumo <strong className="text-brand-gold">{nombre}</strong>?
          <br /><br />
          <span className="text-gray-400 text-xs">Esta acción no se puede deshacer y borrará su historial de stock.</span>
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button 
            className="px-3 py-1.5 text-gray-400 hover:text-white border border-[#333] rounded text-sm min-w-20"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
          <button 
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-sm min-w-20"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase.from('inventario_materiales').delete().eq('id', id);
                if (error) throw error;
                setInventory(inventory.filter(item => item.id !== id));
                toast.success('Insumo eliminado del almacén');
              } catch (err) {
                console.error('Error al borrar insumo:', err.message);
                toast.error('No se pudo eliminar el insumo.');
              }
            }}
          >
            Sí, Eliminar
          </button>
        </div>
      </div>
    ), { duration: Infinity, style: { background: '#1a1a1a', padding: 0 } });
  };

  const getStatusStyle = (stock_actual, stock_alerta) => {
    if (stock_actual > stock_alerta * 2) return 'bg-green-950/30 text-green-500 border-green-900/50';
    if (stock_actual > stock_alerta) return 'bg-yellow-950/30 text-yellow-500 border-yellow-900/50';
    return 'bg-red-950/30 text-red-500 border-red-900/50 animate-pulse';
  };
  
  const getStatusText = (stock_actual, stock_alerta) => {
    if (stock_actual > stock_alerta * 2) return 'Sano';
    if (stock_actual > stock_alerta) return 'Medio';
    return 'Crítico';
  };

  // Filtrado reactivo en la data real
  const filteredInventory = inventory.filter(item => {
    const matchesCategory = activeCategory === 'Todos' || item.categoria === activeCategory;
    const matchesSearch = (item.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.categoria || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 animate-fade-in-up relative z-10" onClick={() => activeDropdown !== null && setActiveDropdown(null)}>
        {/* HEADER DEL INVENTARIO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Inventario de Insumos
            </h1>
            <p className="text-gray-400 mt-2 font-medium">
              Control general de materia prima segmentada por categorías.
            </p>
          </div>
          
          {/* BOTON DE ACCION PRINCIPAL */}
          <button 
            onClick={() => setIsRegistrationOpen(true)}
            className="flex items-center gap-2 bg-brand-gold hover:bg-[#c2a15c] text-black font-bold py-3 px-6 rounded-xl transition-transform active:scale-95 shadow-[0_0_20px_rgba(212,178,113,0.3)]"
          >
            <Plus className="w-5 h-5" />
            Registrar Insumo
          </button>
        </div>

        {/* BARRA DE BUSQUEDA Y FILTROS POR CATEGORÍA */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Barra de Búsqueda */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors font-medium"
              placeholder="Buscar insumos por nombre o tipo..."
            />
          </div>
          
          {/* Fila de Filtro de Categoría y Botón Nueva Categoría */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-brand-gold" />
              </div>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="pl-12 w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-3.5 text-white focus:outline-none focus:border-brand-gold transition-colors font-medium appearance-none cursor-pointer"
              >
                <option value="Todos">Todas las categorías</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Botón Mágico Nueva Categoría */}
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="bg-[#1a1a1a] border border-[#333] text-gray-300 hover:text-brand-gold hover:border-brand-gold/50 px-4 py-3.5 rounded-xl transition-colors shrink-0 font-bold flex items-center gap-2"
              title="Administrar categorías"
            >
              <Plus className="w-4 h-4" />
              Categorías
            </button>
            <button 
              onClick={() => setIsUnitModalOpen(true)}
              className="bg-[#1a1a1a] border border-[#333] text-gray-300 hover:text-brand-gold hover:border-brand-gold/50 px-4 py-3.5 rounded-xl transition-colors shrink-0 font-bold flex items-center gap-2"
              title="Administrar Magnitudes"
            >
              <Plus className="w-4 h-4" />
              Unidades
            </button>
          </div>
        </div>

        {/* LA TABLA CORPORATIVA */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-visible shadow-2xl shadow-black/50">
          <div className="overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111] border-b border-[#333]">
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold">Material / Insumo</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold">Categoría Asignada</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold text-right">Stock Actual</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold text-center">Estado</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500 animate-pulse">Sincronizando con Supabase de fábrica...</td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500">El almacén está vacío. Registra tu primer material.</td>
                  </tr>
                ) : filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1f1f1f] transition-colors group">
                    <td className="py-4 px-6">
                      <span className="font-medium text-white">{item.nombre}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-400 bg-white/5 px-3 py-1 rounded border border-[#333]">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-baseline gap-1">
                        <span className="text-xl font-mono font-bold text-brand-gold">{item.stock_actual}</span>
                        <span className="text-xs text-gray-400 ml-1">{item.unidad_medida}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-transparent ${getStatusStyle(item.stock_actual, item.stock_alerta)}`}>
                          {getStatusText(item.stock_actual, item.stock_alerta)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === item.id ? null : item.id);
                          }}
                          className="p-2 text-gray-500 hover:text-brand-gold transition-colors rounded-lg hover:bg-white/5"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {activeDropdown === item.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-[#111] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-20 animate-fade-in-up origin-top-right">
                            <button 
                              onClick={() => setAdjustmentItem(item)} 
                              className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors border-b border-[#222]"
                            >
                              Ajustar Stock Manual
                            </button>
                            <button 
                              onClick={() => toast('El historial de cambios de insumos estará disponible pronto.', { icon: '🚧' })}
                              className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors border-b border-[#222]"
                            >
                              Ver Historial de Cambios
                            </button>
                            <button 
                              onClick={() => deleteInsumo(item.id, item.nombre)}
                              className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                              Eliminar Insumo
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer de Tabla Oculto si no hay data */}
          {filteredInventory.length > 0 && (
            <div className="bg-[#111] border-t border-[#333] p-4 flex justify-between items-center text-sm text-gray-500">
              <p>Mostrando {filteredInventory.length} insumos registrados</p>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-[#333] rounded hover:bg-[#222] opacity-50 cursor-not-allowed">Anterior</button>
                <button className="px-3 py-1 border border-[#333] rounded hover:bg-[#222] opacity-50 cursor-not-allowed">Siguiente</button>
              </div>
            </div>
          )}
        </div>
        
      </div>

      {/* RENDERIZADO CONDICIONAL DE LOS MODALES */}
      <MaterialRegistrationModal 
        isOpen={isRegistrationOpen} 
        onClose={() => setIsRegistrationOpen(false)} 
        onSuccess={() => {
          setIsRegistrationOpen(false);
          fetchInventoryAndCategories();
        }}
        categories={categories} 
        units={units} 
      />
      
      {/* BOTON GENERICO PARA ABRIR MODAL STOCK TOTAL */}
      {/* Nota: InventoryTab no tiene botón genérico de Ajustar Stock, solo en la fila de 3 puntos */}

      <StockAdjustmentModal 
        isOpen={adjustmentItem !== null} 
        onClose={() => setAdjustmentItem(null)} 
        inventory={inventory}
        preselectedItem={adjustmentItem}
        onSuccess={() => {
          setAdjustmentItem(null);
          fetchInventoryAndCategories();
        }}
      />
      
      <CategoryManagerModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        categories={categories}
        setCategories={setCategories}
      />
      
      <UnitManagerModal 
        isOpen={isUnitModalOpen} 
        onClose={() => setIsUnitModalOpen(false)} 
        units={units}
        setUnits={setUnits}
      />
    </>
  );
}
