import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import ModalRegistroMaterial from '../modals/ModalRegistroMaterial';
import ModalAjusteStock from '../modals/ModalAjusteStock';
import ModalGestionCategorias from '../modals/ModalGestionCategorias';
import ModalGestionUnidades from '../modals/ModalGestionUnidades';

import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function TabInventarioInsumos() {
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
  const [showInactive, setShowInactive] = useState(false); // Nuevo estado para filtrar

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

  const toggleInsumoStatus = async (id, nombre, currentStatus) => {
    setActiveDropdown(null);
    const actionText = currentStatus ? 'desactivar' : 'reactivar';
    const confirmButtonClass = currentStatus ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500';

    toast((t) => (
      <div className="flex flex-col gap-4 p-2 bg-[#1a1a1a]">
        <p className="text-white font-medium text-sm">
          ¿Deseas <strong className={currentStatus ? "text-red-500" : "text-green-500"}>{actionText}</strong> el insumo <strong className="text-brand-gold">{nombre}</strong>?
          <br /><br />
          <span className="text-gray-400 text-xs">
            {currentStatus 
              ? "El material ya no aparecerá en las listas de producción pero se mantendrá en el historial." 
              : "El material volverá a estar disponible para recetas y producción."}
          </span>
        </p>
        <div className="flex justify-end gap-2 mt-2">
          <button 
            className="px-3 py-1.5 text-gray-400 hover:text-white border border-[#333] rounded text-sm min-w-20"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
          <button 
            className={`px-3 py-1.5 ${confirmButtonClass} text-white rounded font-bold text-sm min-w-20`}
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase
                  .from('inventario_materiales')
                  .update({ activo: !currentStatus })
                  .eq('id', id);

                if (error) throw error;
                
                // Actualizar estado local
                setInventory(inventory.map(item => 
                  item.id === id ? { ...item, activo: !currentStatus } : item
                ));

                toast.success(`Insumo ${currentStatus ? 'desactivado' : 'reactivado'} correctamente`);
              } catch (err) {
                console.error('Error al cambiar estado de insumo:', err.message);
                toast.error('Ocurrió un error en la base de datos.');
              }
            }}
          >
            Sí, {currentStatus ? 'Desactivar' : 'Reactivar'}
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
    const matchesStatus = showInactive ? !item.activo : (item.activo !== false);
    const matchesCategory = activeCategory === 'Todos' || item.categoria === activeCategory;
    const matchesSearch = (item.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.categoria || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
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

          <div className="flex flex-col items-end">
            <div className="bg-[#1a1a1a] border border-[#333] px-6 py-4 rounded-2xl shadow-xl shadow-black/50">
              <span className="text-[10px] text-brand-gold font-bold uppercase tracking-[0.2em] mb-1 block">Inversión en Insumos</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">S/ {inventory.reduce((sum, item) => sum + ((item.stock_actual || 0) * (item.costo_unitario || 0)), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <button 
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all font-bold text-sm ${
                showInactive 
                ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:text-white'
              }`}
            >
              {showInactive ? 'Viendo Archivados' : 'Ver Archivados'}
            </button>

            <button 
              onClick={() => setIsRegistrationOpen(true)}
              className="flex items-center gap-2 bg-brand-gold hover:bg-[#c2a15c] text-black font-bold py-3 px-6 rounded-xl transition-transform active:scale-95 shadow-[0_0_20px_rgba(212,178,113,0.3)]"
            >
              <Plus className="w-5 h-5" />
              Registrar Insumo
            </button>
          </div>
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

        {/* VISTA DE TABLA (ESCRITORIO / TABLET ANCHA) */}
        <div className="hidden md:block bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-visible shadow-2xl shadow-black/50">
          <div className="overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111] border-b border-[#333]">
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold">Material / Insumo</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold">Categoría Asignada</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold text-right">Stock Actual</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold text-right">Costo Unit.</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold text-right">Total (S/)</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold text-center">Estado</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold text-center">Acciones</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500 animate-pulse font-serif italic">Sincronizando con Supabase de fábrica...</td>
                  </tr>
                ) : filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-gray-500">No se encontraron insumos con esos criterios.</td>
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
                    <td className="py-4 px-6 text-right font-mono text-sm text-gray-300">
                      S/ {(item.costo_unitario || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-white">
                      S/ {((item.stock_actual || 0) * (item.costo_unitario || 0)).toFixed(2)}
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
                              onClick={() => toggleInsumoStatus(item.id, item.nombre, item.activo !== false)}
                              className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                                item.activo !== false ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'
                              }`}
                            >
                              {item.activo !== false ? 'Desactivar Insumo' : 'Reactivar Insumo'}
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
          
          {filteredInventory.length > 0 && (
            <div className="bg-[#111] border-t border-[#333] p-4 flex justify-between items-center text-sm text-gray-500">
              <p>Mostrando {filteredInventory.length} insumos registrados</p>
              <div className="flex gap-2 text-xs">
                <button className="px-3 py-1 border border-[#333] rounded hover:bg-[#222] opacity-50 cursor-not-allowed uppercase font-bold tracking-widest">Ant.</button>
                <button className="px-3 py-1 border border-[#333] rounded hover:bg-[#222] opacity-50 cursor-not-allowed uppercase font-bold tracking-widest">Sig.</button>
              </div>
            </div>
          )}
        </div>

        {/* VISTA DE TARJETAS (MÓVIL / PANTALLAS PEQUEÑAS) */}
        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="py-20 text-center text-brand-gold/50 animate-pulse font-serif italic">Sincronizando almacén móvil...</div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-20 text-center text-gray-500 bg-[#161616] rounded-2xl border border-dashed border-[#333]">El almacén móvil está vacío.</div>
          ) : (
            filteredInventory.map((item) => (
              <div key={item.id} className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-5 shadow-lg active:scale-[0.98] transition-all overflow-hidden relative group">
                {/* Indicador de estado lateral */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${item.stock_actual <= item.stock_alerta ? 'bg-red-500' : 'bg-brand-gold'}`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{item.nombre}</h3>
                    <p className="inline-block mt-2 px-2 py-0.5 rounded bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase tracking-widest border border-brand-gold/20">
                      {item.categoria}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-mono font-bold text-white leading-none">{item.stock_actual}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold mt-1 tracking-widest">{item.unidad_medida}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#333]">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(item.stock_actual, item.stock_alerta)}`}>
                    Stock {getStatusText(item.stock_actual, item.stock_alerta)}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setAdjustmentItem(item)}
                      className="p-2.5 bg-brand-gold/10 text-brand-gold rounded-lg border border-brand-gold/20 active:bg-brand-gold active:text-black transition-colors"
                      title="Ajustar"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => toggleInsumoStatus(item.id, item.nombre, item.activo !== false)}
                      className={`p-2.5 rounded-lg border transition-colors ${
                        item.activo !== false 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20 active:bg-red-500 active:text-white' 
                        : 'bg-green-500/10 text-green-500 border-green-500/20 active:bg-green-500 active:text-white'
                      }`}
                      title={item.activo !== false ? 'Desactivar' : 'Reactivar'}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
      </div>

      {/* RENDERIZADO CONDICIONAL DE LOS MODALES */}
      <ModalRegistroMaterial 
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

      <ModalAjusteStock 
        isOpen={adjustmentItem !== null} 
        onClose={() => setAdjustmentItem(null)} 
        inventory={inventory}
        preselectedItem={adjustmentItem}
        onSuccess={() => {
          setAdjustmentItem(null);
          fetchInventoryAndCategories();
        }}
      />
      
      <ModalGestionCategorias 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        categories={categories}
        setCategories={setCategories}
      />
      
      <ModalGestionUnidades 
        isOpen={isUnitModalOpen} 
        onClose={() => setIsUnitModalOpen(false)} 
        units={units}
        setUnits={setUnits}
      />

    </>
  );
}
