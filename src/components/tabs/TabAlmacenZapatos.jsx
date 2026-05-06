import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Archive, Package } from 'lucide-react';
import ModalNuevoLote from '../modals/ModalNuevoLote';
import ModalDetalleProductoTerminado from '../modals/ModalDetalleProductoTerminado';
import ModalGestionCategoriasCalzado from '../modals/ModalGestionCategoriasCalzado';

import { supabase } from '../../lib/supabase';

export default function TabAlmacenZapatos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedGood, setSelectedGood] = useState(null);
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const fetchFinishedGoods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('productos_finales')
        .select('*')
        .order('codigo_modelo', { ascending: true });

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

  const filteredGoods = finishedGoods.filter(item => {
    const rawSearch = searchTerm.toLowerCase();
    const matchesSearch = (
      (item.codigo_modelo || '').toLowerCase().includes(rawSearch) ||
      (item.color_fisico || '').toLowerCase().includes(rawSearch) ||
      (item.taco || '').toLowerCase().includes(rawSearch) ||
      (item.serie || '').toLowerCase().includes(rawSearch)
    );
    const matchesArchive = showArchived ? !item.activo : item.activo;
    return matchesSearch && matchesArchive;
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 animate-fade-in-up relative z-10">

        {/* HEADER INDUSTRIAL */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              Almacén Central
            </h1>
            <p className="text-gray-400 mt-2 font-medium">
              Inventario físico de calzado terminado listo para despacho.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-2 font-bold py-3 px-6 rounded-xl transition-all border ${showArchived
                  ? 'bg-red-500/10 text-red-500 border-red-500/30'
                  : 'bg-transparent text-gray-400 border-[#333] hover:border-gray-500'
                }`}
            >
              <Archive className="w-5 h-5" />
              {showArchived ? 'Ver Activos' : 'Ver Archivados'}
            </button>
            <button
              onClick={() => setIsBatchOpen(true)}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-black font-bold py-3 px-6 rounded-xl transition-transform active:scale-95 shadow-[0_0_20px_rgba(37,211,102,0.3)]"
            >
              <Plus className="w-5 h-5" />
              Ingresar Lote
            </button>
          </div>
        </div>

        {/* BUSCADOR DE ALTA VELOCIDAD */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 w-full bg-[#111] border border-[#222] rounded-xl py-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#25D366] transition-colors font-medium text-lg"
            placeholder="🔎 Buscar stock por Código, Color o Serie..."
          />
        </div>

        {/* TABLA DE ALTA DENSIDAD */}
        <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a0a0a] border-b border-[#222]">
                  <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Miniatura</th>
                  <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Identificación</th>
                  <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold text-center">Especificación</th>
                  <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-[#25D366] font-bold text-center">Stock Actual</th>
                  <th className="py-4 px-6 text-[10px] uppercase tracking-widest text-gray-500 font-bold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="w-10 h-10 text-gray-700 animate-bounce" />
                        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">Sincronizando Almacén...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredGoods.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <p className="text-gray-600 font-medium">No se encontraron productos con estos criterios.</p>
                    </td>
                  </tr>
                ) : filteredGoods.map((item) => (
                  <tr key={item.id} className="hover:bg-[#161616] transition-colors group">

                    {/* MINIATURA */}
                    <td className="py-3 px-6">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#333] bg-black">
                        <img
                          src={item.foto_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=100'}
                          alt={item.codigo_modelo}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </td>

                    {/* CODIGO Y COLOR */}
                    <td className="py-3 px-6">
                      <div className="flex flex-col">
                        <span className="text-white font-mono font-bold text-lg leading-none">#{item.codigo_modelo}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mt-1">{item.color_fisico || 'COLOR BASE'}</span>
                      </div>
                    </td>

                    {/* TACO Y SERIE */}
                    <td className="py-3 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-300 font-semibold">Taco {item.taco}</span>
                        <span className="text-[10px] text-gray-500 font-medium">Ser. {item.serie}</span>
                      </div>
                    </td>

                    {/* STOCK EN DOCENAS */}
                    <td className="py-3 px-6 text-center">
                      <div className={`inline-block px-4 py-1.5 rounded-xl border font-mono font-bold text-xl
                          ${item.stock_docenas > 0
                          ? 'text-[#25D366] bg-[#25D366]/5 border-[#25D366]/20'
                          : 'text-red-500 bg-red-500/5 border-red-500/20'}`}
                      >
                        {item.stock_docenas} <span className="text-xs font-normal opacity-60">DOC</span>
                      </div>
                    </td>

                    {/* ACCIONES */}
                    <td className="py-3 px-6">
                      <div className="flex justify-center">
                        <button
                          onClick={() => { setSelectedGood(item); setIsDetailsOpen(true); }}
                          className="p-2.5 bg-[#222] hover:bg-[#333] text-gray-400 hover:text-white rounded-xl transition-all border border-transparent hover:border-[#444] group-hover:scale-105 active:scale-95"
                          title="Ver Detalles y Movimientos"
                        >
                          <Eye className="w-5 h-5" />
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
        onSuccess={fetchFinishedGoods}
      />

      <ModalGestionCategoriasCalzado
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
        onUpdate={fetchFinishedGoods}
      />
    </>
  );
}
