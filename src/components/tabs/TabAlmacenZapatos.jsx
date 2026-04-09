import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye } from 'lucide-react';
import ModalNuevoLote from '../modals/ModalNuevoLote';
import ModalDetalleProductoTerminado from '../modals/ModalDetalleProductoTerminado';

import { supabase } from '../../lib/supabase';

export default function TabAlmacenZapatos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedGood, setSelectedGood] = useState(null);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFinishedGoods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos_finales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFinishedGoods(data || []);
    } catch (error) {
      console.error('Error fetching productos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinishedGoods();
  }, []);

  // Filtrado Reactivo por CUALQUIER campo (código, color, taco, serie)
  const filteredGoods = finishedGoods.filter(item => {
    const rawSearch = searchTerm.toLowerCase();
    return (
      (item.codigo_modelo || '').toLowerCase().includes(rawSearch) ||
      (item.color_fisico || '').toLowerCase().includes(rawSearch) ||
      (item.taco || '').toLowerCase().includes(rawSearch) ||
      (item.serie || '').toLowerCase().includes(rawSearch)
    );
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 animate-fade-in-up relative z-10">
        
        {/* HEADER DEL ALMACÉN */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              Almacén de Producto Terminado
            </h1>
            <p className="text-gray-400 mt-2 font-medium">
              Control de stock físico de calzado listo para despachar (Medido en Docenas).
            </p>
          </div>
          
          {/* BOTON DE ACCION */}
          <button 
            onClick={() => setIsBatchOpen(true)}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-black font-bold py-3 px-6 rounded-xl transition-transform active:scale-95 shadow-[0_0_20px_rgba(37,211,102,0.2)]"
          >
            <Plus className="w-5 h-5" />
            Ingresar Nuevo Lote
          </button>
        </div>

        {/* BARRA DE BÚSQUEDA UNIVERSAL */}
        <div className="mb-8">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#25D366] transition-colors font-medium text-lg shadow-xl shadow-black/20"
              placeholder="🔎 Buscar por código, color, taco o serie de talla..."
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-2">El filtro operará instantáneamente sobre cualquier atributo de la tabla.</p>
        </div>

        {/* LA TABLA DE ZAPATOS TERMINADOS */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#111] border-b border-[#333]">
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold">Código Industrial</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold">Color Físico</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold">Tipo de Taco</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold">Serie</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-[#25D366] font-semibold text-center">Stock (Docenas)</th>
                  <th className="py-4 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-500 animate-pulse">Sincronizando con Supabase de fábrica...</td>
                    </tr>
                  ) : filteredGoods.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-500">No hay productos terminados en inventario.</td>
                    </tr>
                  ) : filteredGoods.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1f1f1f] transition-colors group">
                      
                      {/* CODIGO */}
                      <td className="py-4 px-6">
                        <span className="font-mono text-base tracking-widest font-bold text-white bg-white/10 px-3 py-1 rounded-lg border border-[#333]">
                          {item.codigo_modelo}
                        </span>
                      </td>

                      {/* COLOR FISICO */}
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-gray-300">
                          {item.color_fisico}
                        </span>
                      </td>

                      {/* TIPO DE TACO */}
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-400">
                          {item.taco}
                        </span>
                      </td>

                      {/* SERIE */}
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-300 font-mono">{item.serie}</span>
                      </td>

                      {/* STOCK EN DOCENAS */}
                      <td className="py-4 px-6 text-center">
                        <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg border font-bold text-lg
                          ${item.stock_docenas > 0 
                            ? 'text-[#25D366] bg-[#25D366]/10 border-[#25D366]/20' 
                            : 'text-red-500 bg-red-500/10 border-red-500/20'}`}
                        >
                          {item.stock_docenas} <span className="text-xs font-normal ml-1 opacity-70">Doc.</span>
                        </div>
                      </td>

                      {/* ACCIONES */}
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => { setSelectedGood(item); setIsDetailsOpen(true); }}
                            className="flex items-center gap-2 p-2 px-4 text-sm font-bold text-brand-gold bg-brand-gold/10 hover:bg-brand-gold hover:text-black rounded-lg transition-colors border border-brand-gold/20"
                          >
                            <Eye className="w-4 h-4" />
                            Detalles
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </div>
        
      </div>

      <ModalNuevoLote 
        isOpen={isBatchOpen} 
        onClose={() => setIsBatchOpen(false)} 
        shoeDatabase={finishedGoods}
        onSuccess={() => {
          setIsBatchOpen(false);
          fetchFinishedGoods();
        }}
      />
      
      <ModalDetalleProductoTerminado 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)} 
        goodData={selectedGood}
      />

    </>
  );
}
