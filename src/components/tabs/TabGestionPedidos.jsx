import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, CheckCircle2, Clock, Truck, Factory, XCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import ModalPedidoManual from '../modals/ModalPedidoManual';

export default function TabGestionPedidos() {
  const [orders, setOrders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const fetchOrdersAndCatalog = async () => {
    setLoading(true);
    try {
      const { data: pedidosData, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          productos_finales (
            codigo_modelo,
            nombre
          )
        `);

      if (error) throw error;
      
      const { data: catData } = await supabase.from('productos_finales').select('*');
      setCatalog(catData || []);

      // Ordenar: por Categoría de status, y si empatan, por Fecha reciente
      const sortedData = (pedidosData || []).sort((a,b) => {
        const priority = { 'Pendiente': 1, 'En Producción': 2, 'Listo': 3, 'Entregado': 4, 'Cancelado': 5 };
        if (priority[a.estado] !== priority[b.estado]) return priority[a.estado] - priority[b.estado];
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setOrders(sortedData);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      toast.error('Error al cargar la tabla de pedidos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndCatalog();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // SI SE MARCA COMO ENTREGADO, DESCONTAR DEL STOCK DE PRODUCTO TERMINADO
      if (newStatus === 'Entregado') {
        const product = catalog.find(p => p.id === order.producto_id);
        if (!product) {
          toast.error("El producto ya no existe en el catálogo.");
          return;
        }

        if (product.stock_docenas < order.cantidad_docenas) {
          toast.error(`No hay suficiente stock en Almacén. (Stock: ${product.stock_docenas} docenas)`);
          return;
        }

        const { error: stockErr } = await supabase
          .from('productos_finales')
          .update({ stock_docenas: product.stock_docenas - order.cantidad_docenas })
          .eq('id', order.producto_id);
          
        if (stockErr) throw stockErr;

        // --- REGISTRO DE AUDITORÍA DE VENTA VALORIZADA ---
        const { data: { user } } = await supabase.auth.getUser();
        
        // Asignamos el costo unitario basado en la última valorización (Mano obra + Insumos)
        // Para simplificar en este punto, usamos el costo_mano_obra_docena que ya integra el modelo
        const costoProduccionUnitario = product.costo_mano_obra_docena || 0;

        await supabase.from('auditoria_inventario').insert({
          tipo_entidad: 'PRODUCTO_FINAL',
          entidad_id: order.producto_id,
          nombre_entidad: product.nombre,
          cantidad: -order.cantidad_docenas,
          stock_final: product.stock_docenas - order.cantidad_docenas,
          costo_unitario_movimiento: costoProduccionUnitario,
          valor_total_movimiento: -(costoProduccionUnitario * order.cantidad_docenas),
          motivo: `Venta Entregada: ${order.cliente_whatsapp}`,
          referencia_operacion: `PED-${order.id.split('-')[0].toUpperCase()}`,
          usuario_email: user?.email || 'Sistema'
        });

      }

      const { error } = await supabase
        .from('pedidos')
        .update({ estado: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Pedido marcado como: ${newStatus}`);
      fetchOrdersAndCatalog(); // Reload orders to reflect changes
    } catch (err) {
      console.error('Error updating order:', err.message);
      toast.error('Ocurrió un error al actualizar el estado.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pendiente':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"><Clock className="w-3.5 h-3.5" /> Pendiente (Bot)</span>;
      case 'En Producción':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"><Factory className="w-3.5 h-3.5" /> En Producción</span>;
      case 'Listo':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider"><CheckCircle2 className="w-3.5 h-3.5" /> Listo / Empacado</span>;
      case 'Entregado':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-[#25D366] border border-green-500/20 rounded-full text-xs font-bold uppercase tracking-wider"><Truck className="w-3.5 h-3.5" /> Entregado</span>;
      case 'Cancelado':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-bold uppercase tracking-wider"><XCircle className="w-3.5 h-3.5" /> Cancelado</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(order => 
    (order.cliente_whatsapp || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.productos_finales?.codigo_modelo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.ciudad_destino || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 animate-fade-in-up relative z-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            Gestión de Pedidos
          </h1>
          <p className="text-gray-400 mt-2 font-medium">
            Monitor de estado de producción y despacho de órdenes B2B.
          </p>
        </div>
        <button 
          onClick={() => setIsOrderModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-gold hover:bg-[#c2a15c] text-black font-bold py-3 px-6 rounded-xl transition-transform active:scale-95 text-sm shadow-[0_0_15px_rgba(212,178,113,0.3)]"
        >
          <Plus className="w-5 h-5" />
          Crear Pedido Manual
        </button>
      </div>

      {/* BARRA DE BÚSQUEDA */}
      <div className="mb-8">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on query change
            }}
            className="pl-12 w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors font-medium text-lg shadow-xl shadow-black/20"
            placeholder="🔎 Buscar por Cliente, Código de Zapato o Ciudad..."
          />
        </div>
      </div>

      {/* TABLA DE PEDIDOS */}
      <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-visible shadow-2xl shadow-black/50">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111] border-b border-[#333]">
                <th className="py-4 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold w-1/4">Cliente / Registro</th>
                <th className="py-4 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold w-1/4">Modelo Pedido</th>
                <th className="py-4 px-6 text-xs uppercase tracking-widest text-brand-gold text-right font-semibold">Monto Bruto</th>
                <th className="py-4 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold text-center">Estado General</th>
                <th className="py-4 px-6 text-xs uppercase tracking-widest text-gray-400 font-semibold text-center">Avanzar Tarea</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500 animate-pulse">Consultando historial de órdenes...</td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500">No hay pedidos registrados que coincidan.</td>
                </tr>
              ) : paginatedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#1f1f1f] transition-colors group relative z-0 hover:z-50">
                  
                  {/* CLIENTE INFO */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-white mb-1 shadow-sm uppercase">{order.cliente_whatsapp}</span>
                      <span className="text-xs text-gray-500 font-medium">
                        Fecha: {new Date(order.created_at).toLocaleDateString()} a las {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {order.ciudad_destino && (
                        <span className="text-xs text-gray-400 mt-1 inline-flex items-center gap-1">📍 {order.ciudad_destino}</span>
                      )}
                    </div>
                  </td>

                  {/* PRODUCTO PEDIDO */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-brand-gold font-mono text-sm tracking-wider font-bold mb-1">
                        {order.productos_finales?.codigo_modelo || 'N/A'}
                      </span>
                      <span className="text-sm font-medium text-gray-300">
                        {order.productos_finales?.nombre || 'Producto Eliminado'}
                      </span>
                      <div className="mt-2 inline-flex">
                        <span className="bg-[#222] text-gray-300 px-2 py-1 rounded text-xs font-bold border border-[#333]">
                          {order.cantidad_docenas} <span className="opacity-70 font-normal">Docenas</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* MONTO */}
                  <td className="py-4 px-6 text-right">
                    <p className="font-bold text-lg text-white">
                      S/ {order.total_venta.toFixed(2)}
                    </p>
                  </td>

                  {/* ESTADO BUBBLE */}
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      {getStatusBadge(order.estado)}
                    </div>
                  </td>

                  {/* ACCIONES (DROPDOWN) */}
                  <td className="py-4 px-6 text-center">
                    <div className="relative flex justify-center group/dropdown z-[20]">
                      <button 
                        disabled={updatingId === order.id}
                        className="flex items-center gap-2 p-2 px-4 text-sm font-bold text-gray-400 bg-[#222] hover:bg-[#333] hover:text-white rounded-lg transition-colors border border-[#444] disabled:opacity-50"
                      >
                        {updatingId === order.id ? '...' : order.estado === 'Pendiente' ? 'Decidir' : 'Actualizar'}
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu invisible hasta Hover, anidado */}
                      <div className="absolute right-1/2 translate-x-1/2 top-full mt-2 w-48 bg-[#161616] border border-[#333] rounded-xl shadow-2xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-200 z-[100] py-2">
                        {order.estado === 'Pendiente' && (
                          <>
                            <button onClick={() => handleStatusChange(order.id, 'En Producción')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors font-bold">🎯 Aprobar a Fabrica</button>
                            <button onClick={() => handleStatusChange(order.id, 'Cancelado')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-500/10 hover:text-red-500 transition-colors font-bold border-t border-[#222]">X Rechazar</button>
                          </>
                        )}
                        {(order.estado !== 'Pendiente' && order.estado !== 'Cancelado' && order.estado !== 'Entregado') && (
                          <>
                            {order.estado === 'En Producción' && <button onClick={() => handleStatusChange(order.id, 'Listo')} className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-brand-gold/10 hover:text-brand-gold transition-colors font-bold">Marcar como Listo</button>}
                            {order.estado === 'Listo' && <button onClick={() => handleStatusChange(order.id, 'Entregado')} className="w-full text-left px-4 py-2 text-sm text-[#25D366] hover:bg-[#25D366]/10 transition-colors font-bold">Marcar como Entregado</button>}
                            <div className="h-[1px] bg-[#222] my-1"></div>
                            <button onClick={() => handleStatusChange(order.id, 'Cancelado')} className="w-full text-left px-4 py-2 text-xs text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-colors font-bold">Anular Pedido</button>
                          </>
                        )}
                        {(order.estado === 'Cancelado' || order.estado === 'Entregado') && (
                          <div className="px-4 py-2 text-xs text-gray-500 font-medium text-center">Proceso Finalizado</div>
                        )}
                      </div>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="border-t border-[#333] px-6 py-4 flex items-center justify-between bg-[#111]">
            <span className="text-sm text-gray-400">
              Mostrando {paginatedOrders.length} de {filteredOrders.length} pedidos
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 px-3 rounded bg-[#222] border border-[#333] text-white disabled:opacity-30 hover:bg-[#333] transition-colors flex items-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-brand-gold font-bold text-sm px-2">
                Página {currentPage} de {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 px-3 rounded bg-[#222] border border-[#333] text-white disabled:opacity-30 hover:bg-[#333] transition-colors flex items-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* RENDERIZADO CONDICIONAL DE LOS MODALES */}
      <ModalPedidoManual 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
        catalog={catalog}
        onSuccess={() => {
          setIsOrderModalOpen(false);
          fetchOrdersAndCatalog();
        }}
      />

    </div>
  );
}
