import React from 'react';
import { X, Send } from 'lucide-react';

export default function ManualOrderModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-lg p-8 shadow-2xl relative shadow-brand-gold/10">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-serif font-bold text-white mb-1">Registrar Pedido Manual</h2>
        <p className="text-sm text-gray-400 mb-8">Ignora el bot IA y crea una orden de producción forzada.</p>

        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cliente / Distribuidor</label>
            <input type="text" className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" placeholder="Nombre de cliente o empresa..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Modelo Según Ficha</label>
              <select className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none">
                <option>Mocasín Ejecutivo Negro</option>
                <option>Botas Invierno T-40</option>
                <option>Zapatos Roma Clásicos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cantidad (Docenas)</label>
              <input type="number" className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personalización / Variante del Cliente (Opcional)</label>
            <textarea className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" placeholder="Apunta aquí peticiones o características personalizadas del zapato..." rows="2"></textarea>
            <p className="text-[10px] text-gray-500 mt-1">Si dejas esto en blanco, se facturará exactamente como dicta la receta original.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ciudad o Destino</label>
            <input type="text" className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" placeholder="Ciudad y lugar de entrega..." />
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full flex justify-center items-center gap-2 bg-brand-gold hover:bg-[#c2a15c] text-black font-bold py-4 rounded-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(212,178,113,0.2)]">
              <Send className="w-5 h-5" />
              Lanzar Producción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
