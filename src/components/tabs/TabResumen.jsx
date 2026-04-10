import React, { useState, useEffect } from 'react';
import { Clock, TrendingDown, Settings, MessageCircle, ArrowRight } from 'lucide-react';
import ModalPedidoManual from '../modals/ModalPedidoManual';
import ModalAjusteStock from '../modals/ModalAjusteStock';

import { supabase } from '../../lib/supabase';

export default function TabResumen({ session }) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const [stats, setStats] = useState({
    pendingOrders: 0,
    criticalMaterials: 0,
    totalModels: 0,
    totalProfit: 0,
    totalRevenue: 0,
    recentOrders: [],
    catalog: []
  });


  const loadStats = async () => {
      try {
        // Pedidos Pendientes
        const { data: pedidos } = await supabase
          .from('pedidos')
          .select('*')
          .eq('estado', 'Pendiente')
          .order('created_at', { ascending: false });

        // Materiales Críticos (stock_actual <= stock_alerta)
        const { data: materiales } = await supabase
          .from('inventario_materiales')
          .select('*');
        
        const criticalCount = (materiales || []).filter(m => m.stock_actual <= m.stock_alerta).length;

        // Ganancia Real (Ventas - Costos del Kárdex)
        const { data: auditData } = await supabase
          .from('auditoria_inventario')
          .select('valor_total_movimiento')
          .eq('tipo_entidad', 'PRODUCTO_FINAL')
          .lt('cantidad', 0); // Solo las salidas (ventas)

        const totalCosts = (auditData || []).reduce((sum, move) => sum + Math.abs(move.valor_total_movimiento || 0), 0);
        
        const { data: allOrders } = await supabase
          .from('pedidos')
          .select('total_venta')
          .eq('estado', 'Entregado');
        
        const totalRevenue = (allOrders || []).reduce((sum, o) => sum + (o.total_venta || 0), 0);

        // Catálogo entero en vez de count limitante
        const { data: modelsData } = await supabase
          .from('productos_finales')
          .select('*')
          .order('created_at', { ascending: false });

        setStats({
          pendingOrders: pedidos?.length || 0,
          criticalMaterials: criticalCount,
          totalModels: modelsData?.length || 0,
          totalProfit: totalRevenue - totalCosts,
          totalRevenue: totalRevenue,
          recentOrders: pedidos?.slice(0, 5) || [],
          catalog: modelsData || []
        });

      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 animate-fade-in-up relative z-10">
        {/* HEADER DEL DASHBOARD */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Visión General
          </h1>
          <p className="text-gray-400 mt-2 font-medium">
            Bienvenido de nuevo, {session?.user?.email?.split('@')[0] || 'Gerente'}. Aquí está el pulso de la fábrica.
          </p>
        </div>

        {/* 1. KPIs (MÉTRICAS CLAVE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all shadow-brand-gold/5 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400">Pedidos Sin Aprobar</p>
            <h3 className="text-3xl font-sans font-extrabold text-white mt-1 uppercase tracking-tight">{stats.pendingOrders} Nuevos</h3>
          </div>

          <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all shadow-green-500/5 group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stats.criticalMaterials > 0 ? 'bg-red-950/40 text-red-500' : 'bg-green-950/40 text-green-500'}`}>
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400">Alertas de Almacén</p>
            <h3 className={`text-3xl font-sans font-extrabold mt-1 uppercase tracking-tight ${stats.criticalMaterials > 0 ? 'text-red-500' : 'text-[#25D366]'}`}>
              {stats.criticalMaterials} Insumos
            </h3>
            <p className={`text-xs mt-2 font-medium ${stats.criticalMaterials > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {stats.criticalMaterials > 0 ? '⚠️ Revisar inventario' : '✨ Stock Saludable'}
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all shadow-green-500/10 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                <TrendingDown className="rotate-180 w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-400">Ganancia Estimada (Histórica)</p>
            <h3 className="text-3xl font-sans font-extrabold text-[#25D366] mt-1 uppercase tracking-tight">
              S/ {stats.totalProfit.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs mt-2 font-medium text-gray-500">
              Ventas: S/ {stats.totalRevenue.toLocaleString('es-PE')}
            </p>
          </div>

        </div>

        {/* 2. SPLIT VIEW: TABLAS DE ACTIVIDAD */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* IZQUIERDA: Recepción n8n */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#25D366]" />
                Bandeja IA (Por Aprobar)
              </h3>
              <button className="text-brand-gold text-sm font-semibold hover:underline">Ver Historial</button>
            </div>

            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-[#333] rounded-xl">
                  <p className="text-gray-500 font-medium">No hay pedidos pendientes en la bandeja.</p>
                  <p className="text-xs text-gray-600 mt-1">El Bot de IA está a la espera de WhatsApps.</p>
                </div>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-[#222]">
                    <div className="mb-3 sm:mb-0">
                      <p className="font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
                        Pedido de Cliente
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{order.cantidad_docenas} Docenas • Chat: {order.cliente_whatsapp}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-[#222] hover:bg-red-950/50 hover:text-red-500 text-gray-400 text-xs font-bold rounded transition-colors border border-[#333]">
                        Rechazar
                      </button>
                      <button className="px-3 py-1.5 bg-brand-gold/20 hover:bg-brand-gold text-brand-gold hover:text-black text-xs font-bold rounded transition-colors border border-brand-gold/50">
                        Aprobar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* DERECHA: Accesos Rápidos */}
          <div className="bg-[#1a1a1a] rounded-2xl p-8 shadow-sm flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-gold/10 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">Completar Operaciones</h3>
              <p className="text-[#a8a8a8] text-sm md:w-3/4">
                Acciones administrativas directas. Nada se fabrica sin tu orden superior.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-8">
              <button 
                onClick={() => setIsOrderModalOpen(true)}
                className="flex items-center justify-between w-full bg-brand-gold/10 hover:bg-brand-gold/20 text-brand-gold p-4 rounded-xl border border-brand-gold/20 transition-colors shadow-lg"
              >
                <span className="font-medium tracking-wide">📝 Crear Pedido Manualmente</span>
                <ArrowRight className="w-5 h-5 opacity-50" />
              </button>
              
              <button 
                onClick={() => setIsStockModalOpen(true)}
                className="flex items-center justify-between w-full bg-white/5 hover:bg-white/10 text-gray-300 p-4 rounded-xl border border-white/10 transition-colors"
              >
                <span className="font-medium tracking-wide">📦 Recibir Nuevo Material</span>
                <ArrowRight className="w-5 h-5 opacity-50" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL DE LOS MODALES */}
      <ModalPedidoManual 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
        catalog={stats.catalog}
        onSuccess={() => {
          setIsOrderModalOpen(false);
          loadStats();
        }}
      />
      <ModalAjusteStock 
        isOpen={isStockModalOpen} 
        onClose={() => setIsStockModalOpen(false)} 
      />

    </>
  );
}
