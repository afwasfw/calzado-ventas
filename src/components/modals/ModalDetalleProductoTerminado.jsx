import React, { useState, useEffect } from 'react';
import { X, Tag, Edit3, Image as ImageIcon, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function ModalDetalleProductoTerminado({ isOpen, onClose, goodData, onSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [manoObra, setManoObra] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (goodData) {
      setManoObra(goodData.costo_mano_obra_docena || 0);
    }
    setIsEditing(false);
  }, [goodData, isOpen]);

  if (!isOpen || !goodData) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('productos_finales')
        .update({ costo_mano_obra_docena: parseFloat(manoObra) })
        .eq('id', goodData.id);

      if (error) throw error;
      
      toast.success('Costos de mano de obra actualizados.');
      setIsEditing(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error al actualizar mano de obra:', err.message);
      toast.error('No se pudo guardar el cambio.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative shadow-brand-gold/10 overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[80px] pointer-events-none rounded-full"></div>

        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-start gap-3 mb-8">
          <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Detalles de Almacén</h2>
            <p className="text-sm text-gray-400">Expediente del Modelo Comercial Físico.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Columna Izquierda: Foto y Stock */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="aspect-square bg-[#111] border border-[#333] rounded-xl flex flex-col items-center justify-center text-gray-500 shadow-inner group cursor-pointer hover:border-brand-gold/50 transition-colors">
              <ImageIcon className="w-10 h-10 mb-2 opacity-50 group-hover:text-brand-gold transition-colors" />
              <span className="text-xs font-medium uppercase tracking-wider">Foto del Modelo</span>
            </div>
            
            <div className={`border p-4 rounded-xl text-center ${goodData.stock_docenas > 0 ? 'bg-green-950/30 border-green-900/50' : 'bg-red-950/30 border-red-900/50'}`}>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Stock Físico Real</p>
              <h3 className={`text-3xl font-sans font-bold ${goodData.stock_docenas > 0 ? 'text-green-400' : 'text-red-500'}`}>
                {goodData.stock_docenas} <span className="text-sm font-normal text-gray-400">Docenas</span>
              </h3>
            </div>
          </div>

          {/* Columna Derecha: Detalles Técnicos */}
          <div className="w-full md:w-2/3 space-y-6">
            
            <div>
              <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">{goodData.nombre}</h3>
              <div className="inline-flex items-center px-2.5 py-1 rounded bg-[#111] border border-[#333] text-brand-gold font-mono text-sm shadow-sm font-bold tracking-widest">
                CÓD: {goodData.codigo_modelo}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Color / Tono</p>
                <p className="text-sm font-medium text-white">{goodData.color_fisico}</p>
              </div>
              <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Serie de Tallas</p>
                <p className="text-sm font-medium text-white">{goodData.serie}</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-[#222] text-white font-bold rounded-xl hover:bg-[#333] transition-colors"
              >
                Cerrar Expediente
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
