import React, { useState, useEffect } from 'react';
import { 
  Search, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Package, 
  Layers,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TabKardex() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');

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
                          (m.motivo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (m.referencia_operacion || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'Todos' || m.tipo_entidad === filterType;
    return matchesSearch && matchesType;
  });

  const stats = {
    entradas: filteredMovements.filter(m => m.cantidad > 0).length,
    salidas: filteredMovements.filter(m => m.cantidad < 0).length
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 animate-fade-in">
      
      {/* HEADER INDUSTRIAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-[#161616] p-6 rounded-2xl border border-[#222] shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-brand-gold/10 rounded-lg">
              <History className="w-6 h-6 text-brand-gold" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Kárdex Central de Almacén</h1>
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <Clock className="w-3 h-3" /> Monitor de Auditoría en Tiempo Real
          </p>
        </div>

        <div className="flex gap-4">
          <div className="px-4 py-3 bg-black/40 rounded-xl border border-[#222] flex flex-col items-center min-w-[100px]">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter mb-1">Entradas</span>
            <div className="flex items-center gap-1.5 text-green-500 font-bold">
              <ArrowDownLeft className="w-3 h-3" />
              <span>{stats.entradas}</span>
            </div>
          </div>
          <div className="px-4 py-3 bg-black/40 rounded-xl border border-[#222] flex flex-col items-center min-w-[100px]">
            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter mb-1">Salidas</span>
            <div className="flex items-center gap-1.5 text-red-500 font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>{stats.salidas}</span>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-brand-gold transition-colors" />
          <input 
            type="text"
            placeholder="Buscar por item, motivo o Referencia (LOT-XXXX)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-gold transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#111] border border-[#222] rounded-xl px-4 py-3.5 text-xs text-gray-300 font-bold uppercase tracking-widest focus:outline-none focus:border-brand-gold cursor-pointer"
          >
            <option value="Todos">📦 Todo el Almacén</option>
            <option value="INSUMO">🧵 Materia Prima</option>
            <option value="PRODUCTO_FINAL">👟 Calzado Terminado</option>
          </select>
          <button 
            onClick={fetchMovements}
            className="bg-[#111] border border-[#222] p-3.5 rounded-xl text-gray-400 hover:text-brand-gold hover:border-brand-gold/30 transition-all"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TABLA INDUSTRIAL */}
      <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-420px)] custom-scrollbar">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 z-20">
              <tr className="bg-[#0c0c0c] border-b border-[#222]">
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold w-[160px]">Fecha / Hora</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold w-[220px]">Ítem / Clasificación</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold text-center w-[150px]">Referencia</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold text-center w-[120px]">Movimiento</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold text-right w-[100px]">S. Final</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-brand-gold font-bold text-right w-[140px]">Valorizado (S/)</th>
                <th className="py-4 px-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold">Motivo / Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-brand-gold/10 border-t-brand-gold rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sincronizando...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-32 text-center text-gray-600 font-bold uppercase text-xs tracking-widest">
                    No se han encontrado registros.
                  </td>
                </tr>
              ) : filteredMovements.map((move) => {
                const isEntry = move.cantidad > 0;
                return (
                  <tr key={move.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3 px-4 border-r border-[#1a1a1a]">
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-8 rounded-full ${isEntry ? 'bg-green-500/30' : 'bg-red-500/30'}`}></div>
                        <div className="flex flex-col">
                          <span className="text-white font-mono text-[11px] font-bold mb-1">
                            {new Date(move.created_at).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric'})}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono">
                            {new Date(move.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${move.tipo_entidad === 'INSUMO' ? 'bg-blue-500/10 text-blue-400' : 'bg-brand-gold/10 text-brand-gold'}`}>
                          {move.tipo_entidad === 'INSUMO' ? <Layers className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-white font-bold text-[11px] uppercase truncate">{move.nombre_entidad}</span>
                          <span className="text-[9px] text-gray-600 font-bold uppercase">
                            {move.tipo_entidad === 'INSUMO' ? '🧵 Insumo' : '👟 Calzado'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono font-bold border ${
                        move.referencia_operacion 
                        ? 'bg-brand-gold/5 border-brand-gold/20 text-brand-gold' 
                        : 'bg-gray-500/5 border-gray-500/10 text-gray-600'
                      }`}>
                        {move.referencia_operacion || '---'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col items-center">
                        <div className={`flex items-center gap-1 font-mono font-bold text-sm ${isEntry ? 'text-green-500' : 'text-red-500'}`}>
                          {isEntry ? '+' : ''}{move.cantidad}
                          {isEntry ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-400 font-mono text-[11px] font-bold">
                        {move.stock_final}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right border-l border-[#1a1a1a]">
                      <div className="flex flex-col items-end">
                        <span className="text-white font-mono text-[11px] font-bold">
                          S/ {(move.valor_total_movimiento || 0).toFixed(2)}
                        </span>
                        <span className="text-[9px] text-gray-600 font-mono">
                          u: S/ {(move.costo_unitario_movimiento || 0).toFixed(2)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-400 text-[11px] font-medium italic truncate max-w-[200px]">
                          "{move.motivo || 'Sin motivo'}"
                        </span>
                        <span className="text-[9px] text-gray-600 font-bold uppercase bg-[#1a1a1a] px-2 py-1 rounded border border-[#222]">
                          👤 {move.usuario_email?.split('@')[0] || 'Sistema'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
