import React from 'react';
import { X, ArrowDownRight } from 'lucide-react';

export default function StockAdjustmentModal({ isOpen, onClose }) {
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
        
        <h2 className="text-2xl font-bold text-white mb-1">Ajuste / Ingreso de Stock</h2>
        <p className="text-sm text-gray-400 mb-8">Registra ingresos de proveedores o mermas operativas.</p>

        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Material / Insumo Afectado</label>
            {/* Si se abriera desde Acciones en un insumo específico, el insumo saldría pre-seleccionado */}
            <select className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none">
              <option>Selecciona Insumo...</option>
              <option>Cuero Liso Premium (Negro) - Stock Actual: 45</option>
              <option>Suela Goma T-38 Blanca - Stock Actual: 140</option>
              <option>Pegamento Extra Fuerte PU - Stock Actual: 2</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tipo de Operación</label>
              <select className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-brand-gold transition-colors appearance-none font-bold">
                <option>🟢 Añadir Ingreso</option>
                <option>🔴 Disminuir</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cantidad a Afectar</label>
              <input type="number" className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors font-sans text-lg font-bold text-center" placeholder="0" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nota / Justificación (Opcional)</label>
            <textarea className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" placeholder="Escribe cualquier observación o justificación..." rows="2"></textarea>
          </div>

          <div className="pt-4">
            <button type="submit" className="px-6 py-3 bg-brand-gold hover:bg-[#c2a15c] text-black rounded-xl font-bold shadow-none transition-transform active:scale-95 flex items-center gap-2">
              <Save className="w-5 h-5" />
              Aplicar Movimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
