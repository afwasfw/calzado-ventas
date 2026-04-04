import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function MaterialRegistrationModal({ isOpen, onClose, onSuccess, categories = [], units = [] }) {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    unidad_medida: '',
    stock_alerta: '',
    detalles: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.categoria || !formData.unidad_medida) {
      alert("Por favor llena los campos obligatorios (Nombre, Categoría, Medida)");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('inventario_materiales')
        .insert([{
          nombre: formData.nombre,
          categoria: formData.categoria,
          unidad_medida: formData.unidad_medida,
          stock_actual: 0, // Inicia en 0, luego se ajusta
          stock_alerta: parseInt(formData.stock_alerta) || 5, // 5 por defecto si está vacío
          detalles_proveedor: formData.detalles
        }]);

      if (error) throw error;
      
      // Limpiar y cerrar exitosamente
      setFormData({ nombre: '', categoria: '', unidad_medida: '', stock_alerta: '', detalles: '' });
      if (onSuccess) onSuccess();
      else onClose();

    } catch (err) {
      console.error('Error insertando material:', err.message);
      alert("Ocurrió un error al guardar. Revisa la consola.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-lg p-8 shadow-2xl relative shadow-none">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-1">Nuevo Insumo</h2>
        <p className="text-sm text-gray-400 mb-8">Añade un nuevo tipo de material al catálogo oficial de la fábrica.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre del Insumo / Material</label>
            <input 
              type="text" 
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" 
              placeholder="Nombre completo del insumo..." 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categoría del Insumo</label>
              <select 
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none font-medium"
              >
                <option value="">Selecciona categoría...</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Medida Principal</label>
              <select 
                value={formData.unidad_medida}
                onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none"
              >
                <option value="">Selecciona unidad...</option>
                {units.map((unit, idx) => (
                  <option key={idx} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Punto de Alerta Crítica (Stock Mínimo)</label>
            <input 
              type="number" 
              value={formData.stock_alerta}
              onChange={(e) => setFormData({...formData, stock_alerta: e.target.value})}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors" 
              placeholder="Indicar stock mínimo permitido..." 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detalles Adicionales / Proveedor Original (Opcional)</label>
            <textarea 
              value={formData.detalles}
              onChange={(e) => setFormData({...formData, detalles: e.target.value})}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors" 
              placeholder="Añade detalles del proveedor, marca u otras características..." 
              rows="2"
            ></textarea>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 bg-brand-gold hover:bg-[#c2a15c] text-black font-bold py-4 rounded-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(212,178,113,0.2)] disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Registrando espere...' : 'Guardar en Catálogo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
