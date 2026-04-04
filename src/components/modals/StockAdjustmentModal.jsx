import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function StockAdjustmentModal({ isOpen, onClose, inventory = [], preselectedItem = null, onSuccess }) {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [operation, setOperation] = useState('add');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set the default if preselected item comes down
  useEffect(() => {
    if (preselectedItem && isOpen) {
      setSelectedItemId(preselectedItem.id);
      setOperation('add');
      setAmount('');
      setNote('');
    } else if (isOpen) {
      setSelectedItemId('');
      setAmount('');
      setNote('');
    }
  }, [preselectedItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !amount || parseFloat(amount) <= 0) {
      toast.error('Selecciona un material y digita una cantidad válida mayor a 0');
      return;
    }

    const item = inventory.find(i => i.id === selectedItemId);
    if (!item) return;

    try {
      setIsSubmitting(true);
      
      const numAmount = parseFloat(amount);
      const diff = operation === 'add' ? numAmount : -numAmount;
      const newStock = parseFloat(item.stock_actual) + diff;

      // Actualizar en base de datos
      const { error } = await supabase
        .from('inventario_materiales')
        .update({ stock_actual: newStock })
        .eq('id', selectedItemId);

      if (error) throw error;

      toast.success(`Movimiento guardado. El nuevo stock de ${item.nombre} es ${newStock} ${item.unidad_medida}.`);
      if (onSuccess) onSuccess();
      else onClose();

    } catch (err) {
      console.error('Error al actualizar stock:', err.message);
      toast.error('Ocurrió un error al actualizar el stock.');
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
        
        <h2 className="text-2xl font-bold text-white mb-1">Ajuste / Ingreso de Stock</h2>
        <p className="text-sm text-gray-400 mb-8">Registra ingresos de proveedores o mermas operativas.</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Material / Insumo Afectado</label>
            <select 
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors appearance-none"
            >
              <option value="">Selecciona Insumo...</option>
              {inventory.map(item => (
                <option key={item.id} value={item.id}>
                  {item.nombre} - Stock Actual: {item.stock_actual} {item.unidad_medida}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tipo de Operación</label>
              <select 
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-brand-gold transition-colors appearance-none font-bold"
              >
                <option value="add">🟢 Añadir Ingreso</option>
                <option value="subtract">🔴 Disminuir / Merma</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cantidad a Afectar</label>
              <input 
                type="number" 
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors font-sans text-lg font-bold text-center" 
                placeholder="0" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nota / Justificación (Opcional)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-brand-gold transition-colors" 
              placeholder="Escribe la factura del proveedor o motivo del ajuste..." 
              rows="2"
            ></textarea>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-brand-gold hover:bg-[#c2a15c] text-black rounded-xl font-bold shadow-none transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Procesando...' : 'Aplicar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
