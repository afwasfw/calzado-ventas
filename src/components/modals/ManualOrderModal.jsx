import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function ManualOrderModal({ isOpen, onClose, catalog = [], onSuccess }) {
  const [formData, setFormData] = useState({
    cliente: '',
    producto_id: '',
    cantidad: '',
    ciudad: '',
    notas: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ cliente: '', producto_id: '', cantidad: '', ciudad: '', notas: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cliente || !formData.producto_id || !formData.cantidad) {
      toast.error('Cliente, Modelo y Cantidad son obligatorios.');
      return;
    }

    const docenas = parseInt(formData.cantidad, 10);
    if(isNaN(docenas) || docenas <= 0) {
      toast.error('La cantidad debe ser un número entero mayor a 0');
      return;
    }

    const matchedProduct = catalog.find(c => c.id === formData.producto_id);
    if (!matchedProduct) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('pedidos').insert([{
        cliente_whatsapp: formData.cliente,
        producto_id: formData.producto_id,
        cantidad_docenas: docenas,
        total_venta: parseFloat(matchedProduct.precio_docena_mayorista) * docenas,
        estado: 'Pendiente',
        ciudad_destino: formData.ciudad || null,
        notas: formData.notas || null
      }]);

      if (error) throw error;
      
      toast.success('El pedido manual ha sido encolado en la bandeja.');
      if (onSuccess) onSuccess();
      else onClose();

    } catch (err) {
      console.error('Error creando pedido:', err.message);
      toast.error('Hubo un error al crear el pedido manual.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-lg p-8 shadow-2xl relative shadow-brand-gold/10">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-1">Registrar Pedido Manual</h2>
        <p className="text-sm text-gray-400 mb-8">Ignora el bot IA y crea una orden de producción forzada.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cliente / Distribuidor</label>
            <input 
              type="text" 
              value={formData.cliente}
              onChange={(e) => setFormData({...formData, cliente: e.target.value})}
              autoFocus
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" 
              placeholder="Nombre de cliente o empresa..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Modelo Según Ficha</label>
              <select 
                value={formData.producto_id}
                onChange={(e) => setFormData({...formData, producto_id: e.target.value})}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none"
              >
                <option value="">Selecciona un modelo...</option>
                {catalog.map(item => (
                  <option key={item.id} value={item.id}>{item.codigo_modelo} - {item.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cantidad (Docenas)</label>
              <input 
                type="number" 
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" 
                placeholder="0" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personalización / Variante del Cliente (Opcional)</label>
            <textarea 
              value={formData.notas}
              onChange={(e) => setFormData({...formData, notas: e.target.value})}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" 
              placeholder="Apunta aquí peticiones o características personalizadas del zapato..." 
              rows="2"
            ></textarea>
            <p className="text-[10px] text-gray-500 mt-1">Si dejas esto en blanco, se facturará exactamente como dicta la receta original.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ciudad o Destino</label>
            <input 
              type="text" 
              value={formData.ciudad}
              onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" 
              placeholder="Ciudad y lugar de entrega..." 
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 bg-brand-gold hover:bg-[#c2a15c] text-black font-bold py-4 rounded-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(212,178,113,0.2)] disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? 'Lanzando Pedido...' : 'Lanzar Producción Múltiple'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
