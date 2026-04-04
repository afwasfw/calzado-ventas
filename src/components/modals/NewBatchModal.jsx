import React from 'react';
import { X, PackageCheck } from 'lucide-react';

export default function NewBatchModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-lg p-8 shadow-2xl relative shadow-[#25D366]/10">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-serif font-bold text-white mb-1">Ingresar Lote Terminado</h2>
        <p className="text-sm text-gray-400 mb-8">Registra las docenas recién fabricadas para pasarlas a Stock de Ventas.</p>

        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Modelo del Catálogo Base</label>
            <select className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366] transition-colors appearance-none font-medium">
              <option>Selecciona el modelo...</option>
              <option>MOC-01 - Mocasín Ejecutivo Oporto</option>
              <option>BOT-TRK - Botín Trekking</option>
              <option>STI-9C - Stiletto Fiesta</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Color Físico</label>
              <input type="text" className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366] transition-colors" placeholder="Tono exacto..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Serie</label>
              <input type="text" className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366] transition-colors" placeholder="Tallas..." />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tipo de Taco</label>
              <input type="text" className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366] transition-colors" placeholder="Físico de planta..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Docenas (Cant.)</label>
              <input type="number" className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-[#25D366] focus:outline-none focus:border-[#25D366] transition-colors font-sans text-xl font-bold text-center" placeholder="0" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nota / Observación</label>
              <textarea className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366] transition-colors" placeholder="Añade observaciones sobre el estado..." rows="2"></textarea>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full flex justify-center items-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-black font-bold py-4 rounded-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(37,211,102,0.2)]">
              <PackageCheck className="w-5 h-5" />
              Ingresar al Almacén Físico
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
