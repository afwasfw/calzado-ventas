import React from 'react';
import { X, Save } from 'lucide-react';

export default function MaterialRegistrationModal({ isOpen, onClose }) {
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
        
        <h2 className="text-2xl font-serif font-bold text-white mb-1">Nuevo Insumo</h2>
        <p className="text-sm text-gray-400 mb-8">Añade un nuevo tipo de material al catálogo oficial de la fábrica.</p>

        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre del Insumo / Material</label>
            <input type="text" className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" placeholder="Nombre completo del insumo..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categoría del Insumo</label>
              <select className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none font-medium">
                <option>Selecciona una categoría...</option>
                <option>Cueros (Ternera, badana, gamuza)</option>
                <option>Suelas (Goma, TR, Eva, Cuero)</option>
                <option>Químicos (Pegamentos, diluyentes)</option>
                <option>Avíos (Hilos, cierres, ojalillos)</option>
                <option>Empaque (Cajas, bolsas, papel seda)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Medida Principal</label>
              <select className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none">
                <option>Metros</option>
                <option>Pies cuadrados</option>
                <option>Pares</option>
                <option>Galones</option>
                <option>Unidades</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Punto de Alerta Crítica (Stock Mínimo)</label>
            <input type="number" className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Indicar stock mínimo permitido..." />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detalles Adicionales / Proveedor Original (Opcional)</label>
            <textarea className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" placeholder="Añade detalles del proveedor, marca u otras características..." rows="2"></textarea>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full flex justify-center items-center gap-2 bg-brand-gold hover:bg-[#c2a15c] text-black font-bold py-4 rounded-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(212,178,113,0.2)]">
              <Save className="w-5 h-5" />
              Guardar en Catálogo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
