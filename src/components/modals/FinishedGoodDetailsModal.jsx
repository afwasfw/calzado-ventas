import React from 'react';
import { X, Tag, Edit3, Image as ImageIcon } from 'lucide-react';

export default function FinishedGoodDetailsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

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
          
          {/* Columna Izquierda: Imagen del Producto */}
          <div className="w-full md:w-1/3 flex flex-col gap-4">
            <div className="aspect-square bg-[#111] border border-[#333] rounded-xl flex flex-col items-center justify-center text-gray-500 shadow-inner group cursor-pointer hover:border-brand-gold/50 transition-colors">
              <ImageIcon className="w-10 h-10 mb-2 opacity-50 group-hover:text-brand-gold transition-colors" />
              <span className="text-xs font-medium uppercase tracking-wider">Ver Foto B.O.M</span>
            </div>
            
            <div className="bg-green-950/30 border border-green-900/50 p-4 rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Stock Físico Real</p>
              <h3 className="text-3xl font-sans font-bold text-green-400">5 <span className="text-sm font-normal">Docenas</span></h3>
            </div>
          </div>

          {/* Columna Derecha: Detalles de Fila */}
          <div className="w-full md:w-2/3 space-y-6">
            
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Mocasín Ejecutivo Oporto</h3>
              <div className="inline-flex items-center px-2.5 py-1 rounded bg-[#111] border border-[#333] text-gray-300 font-mono text-sm shadow-sm">
                CÓD: MOC-01
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Color / Tono</p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-black border border-gray-600 shadow-inner"></div>
                  <p className="text-sm font-medium text-white">Negro Brillante</p>
                </div>
              </div>
              <div className="bg-[#111] p-4 rounded-xl border border-[#222]">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Serie</p>
                <p className="text-sm font-medium text-white">Del 38 al 42</p>
              </div>
              <div className="bg-[#111] p-4 rounded-xl border border-[#222] col-span-2">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Especificación de Taco</p>
                <p className="text-sm font-medium text-white">Plano (Planta Goma TR Antideslizante)</p>
              </div>
            </div>

            {/* Apartado de Notas Editables */}
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Nota / Observaciones (Editable)</label>
              <textarea 
                className="w-full bg-[#111] border border-[#333] rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-brand-gold transition-colors"
                placeholder="Escribe aquí cualquier nota u observación sobre este almacén físico..."
                rows="3"
                defaultValue="Lote revisado. La partida de cuero negro vino con un brillo superior al habitual, considerar para próximos lotes."
              ></textarea>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-[#222] mt-4">
              <button className="px-4 py-2.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                Ver Historial de Movimientos
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 hover:bg-brand-gold hover:text-black hover:border-brand-gold font-bold rounded-lg transition-colors text-sm">
                <Edit3 className="w-4 h-4" />
                Editar Datos
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
