import React from 'react';
import { Phone, MapPin, Package, User, Bot, UserCheck } from 'lucide-react';

const OrderCard = ({ order }) => {
  const openLocation = () => {
    if (order.ubicacion_gps) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${order.ubicacion_gps}`, '_blank');
    }
  };

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <User className="text-industrial-blue dark:text-blue-400 w-5 h-5" />
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{order.cliente_whatsapp}</span>
        </div>
        <div className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${order.atencion_humana ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
          {order.atencion_humana ? <UserCheck size={14} /> : <Bot size={14} />}
          {order.atencion_humana ? 'Atención Humana' : 'Atención Bot'}
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
        <Package size={18} />
        <span>Modelo: <span className="font-semibold text-gray-900 dark:text-white">{order.modelo || 'Sin especificar'}</span></span>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {order.cantidad_docenas} docenas
        </div>
        <div className="text-xl font-bold text-industrial-blue dark:text-blue-400">
          ${order.total_venta}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button 
          onClick={() => window.open(`https://wa.me/${order.cliente_whatsapp.replace(/\D/g, '')}`, '_blank')}
          className="btn-secondary flex-1"
        >
          <Phone size={18} /> WhatsApp
        </button>
        <button 
          onClick={openLocation}
          className="btn-primary flex-1"
          disabled={!order.ubicacion_gps}
        >
          <MapPin size={18} /> Ver Ubicación
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
