import React, { useState, useEffect } from 'react';
import { Search, Filter, History, TrendingUp, TrendingDown, Clock, SearchCode } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TabKardex() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos'); // 'INSUMO' o 'PRODUCTO_FINAL'

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auditoria_inventario')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMovements(data || []);
    } catch (err) {
      console.error('Error fetching auditing data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filteredMovements = movements.filter(m => {
    const matchesSearch = (m.nombre_entidad || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.motivo || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Todos' || m.tipo_entidad === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 animate-fade-in-up relative z-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            <History className="w-8 h-8 text-brand-gold" />
            Kárdex de Almacén
          </h1>
          <p className="text-gray-400 mt-2 font-medium">
            Historial cronológico de movimientos, ingresos y egresos de mercadería.
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative col-span-1 md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input 
            type="text"
            placeholder="Buscar por material, zapato o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-brand-gold transition-all shadow-xl shadow-black/20"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gold" />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-brand-gold appearance-none cursor-pointer font-bold shadow-xl shadow-black/20"
          >
            <option value="Todos">📦 Todo el Almacén</option>
            <option value="INSUMO">🧵 Materia Prima (Insumos)</option>
            <option value="PRODUCTO_FINAL">👟 Calzado Terminado</option>
          </select>
        </div>
      </div>

      {/* TABLA DE MOVIMIENTOS */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111] border-b border-[#333]">
                <th className="py-5 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold">Fecha y Hora</th>
                <th className="py-5 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold">Ítem</th>
                <th className="py-5 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold text-center">Ref. Operación</th>
                <th className="py-5 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold text-center">Movimiento</th>

                <th className="py-5 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold text-right">Stock Final</th>
                <th className="py-5 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold text-right">Valorizado</th>
                <th className="py-5 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold">Motivo / Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-gray-500 animate-pulse italic font-serif">Consultando folios del kárdex...</td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-gray-500">No hay movimientos registrados para mostrar.</td>
                </tr>
              ) : filteredMovements.map((move) => (
                <tr key={move.id} className="hover:bg-[#1f1f1f] transition-colors group">
                  
                  {/* FECHA */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-white font-medium text-sm">
                        {new Date(move.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric'})}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(move.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>

                  {/* ITEM */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded w-fit mb-1 ${move.tipo_entidad === 'INSUMO' ? 'bg-blue-500/10 text-blue-400' : 'bg-brand-gold/10 text-brand-gold'}`}>
                        {move.tipo_entidad === 'INSUMO' ? '🧵 INSUMO' : '👟 ZAPATO'}
                      </span>
                      <span className="text-white font-bold text-sm uppercase tracking-tight">{move.nombre_entidad}</span>
                    </div>
                  </td>

                  {/* REFERENCIA DE OPERACIÓN */}
                  <td className="py-4 px-6 text-center">
                    <span className="text-[10px] font-mono font-bold text-gray-500 bg-white/5 border border-white/10 px-2 py-1 rounded">
                      {move.referencia_operacion || '---'}
                    </span>
                  </td>


                  {/* MOVIMIENTO (Entrada/Salida) */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center gap-1.5 font-bold text-lg ${move.cantidad > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {move.cantidad > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {move.cantidad > 0 ? `+${move.cantidad}` : move.cantidad}
                      </div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter opacity-70">Cant. Afectada</span>
                    </div>
                  </td>

                  {/* STOCK FINAL */}
                  <td className="py-4 px-6 text-right font-mono">
                    <span className="text-white bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-sm font-bold">
                      {move.stock_final}
                    </span>
                  </td>

                  {/* VALORIZADO (Opcional si existe) */}
                  <td className="py-4 px-6 text-right font-mono">
                    <div className="flex flex-col items-end">
                      <span className="text-white font-bold text-sm">S/ {(move.valor_total_movimiento || 0).toFixed(2)}</span>
                      <span className="text-[10px] text-gray-500">Unit: S/ {(move.costo_unitario_movimiento || 0).toFixed(2)}</span>
                    </div>
                  </td>

                  {/* MOTIVO Y RESPONSABLE */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-gray-300 text-sm font-medium italic">"{move.motivo}"</span>
                      <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest font-bold">👤 {move.usuario_email?.split('@')[0] || 'Sistema'}</span>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
