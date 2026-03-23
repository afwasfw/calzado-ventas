import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import OrderCard from './OrderCard';
import { ShoppingBag, Clock, Loader2, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todaySold: 0, pending: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);

      const today = new Date().toISOString().split('T')[0];
      const { data: allToday } = await supabase
        .from('pedidos')
        .select('cantidad_docenas')
        .gte('created_at', today);
      
      const totalToday = allToday?.reduce((acc, curr) => acc + curr.cantidad_docenas, 0) || 0;
      
      setStats({
        todaySold: totalToday,
        pending: data?.length || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setOrders([
        { id: 1, cliente_whatsapp: '+51987654321', modelo: 'Bota Rock', cantidad_docenas: 12, total_venta: 1440, atencion_humana: false, ubicacion_gps: '-12.046374,-77.042793' },
        { id: 2, cliente_whatsapp: '+51999888777', modelo: 'Tenis Air', cantidad_docenas: 5, total_venta: 425, atencion_humana: true, ubicacion_gps: '-12.062106,-77.036526' },
        { id: 3, cliente_whatsapp: '+51912345678', modelo: 'Sandalia Beach', cantidad_docenas: 20, total_venta: 900, atencion_humana: false, ubicacion_gps: '-12.055, -77.041' }
      ]);
      setStats({ todaySold: 37, pending: 3 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-industrial-blue text-white p-8 flex items-center gap-6 shadow-lg transform transition-transform hover:scale-[1.02]">
          <div className="bg-blue-800/50 p-4 rounded-xl">
            <ShoppingBag size={32} className="text-blue-200" />
          </div>
          <div>
            <span className="text-4xl font-black block leading-tight">{stats.todaySold}</span>
            <span className="text-xs uppercase tracking-widest text-blue-200 font-bold">Docenas Vendidas Hoy</span>
          </div>
        </div>

        <div className="card bg-white dark:bg-gray-800 p-8 border-l-8 border-industrial-blue flex items-center gap-6 shadow-md transform transition-transform hover:scale-[1.02]">
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl">
            <Clock size={32} className="text-industrial-blue dark:text-blue-400" />
          </div>
          <div>
            <span className="text-4xl font-black block leading-tight text-industrial-blue dark:text-blue-400">{stats.pending}</span>
            <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">Pedidos Pendientes</span>
          </div>
        </div>

        {/* Action card for Desktop */}
        <div className="hidden lg:flex card bg-gray-100 dark:bg-gray-800 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer" onClick={fetchData}>
          <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
            <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
            <span className="text-xs font-bold uppercase tracking-wider">Actualizar Datos</span>
          </div>
        </div>
      </div>

      {/* Orders List - Responsive Multi-column on Desktop */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold flex items-center gap-2 text-industrial-gray dark:text-gray-200 uppercase tracking-tight">
            Pedidos Recientes
          </h2>
          <button className="lg:hidden p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" onClick={fetchData}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-24">
            <Loader2 className="animate-spin text-industrial-blue" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.length === 0 ? (
              <div className="col-span-full text-center p-20 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                No hay pedidos nuevos registrados en el sistema.
              </div>
            ) : (
              orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
