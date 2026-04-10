import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Tags } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function ModalGestionCategoriasCalzado({ isOpen, onClose, onUpdate }) {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatPrice, setNewCatPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categorias_calzado')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (!error) setCategories(data || []);
  };

  useEffect(() => {
    if (isOpen) fetchCategories();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!newCatName || !newCatPrice) {
      toast.error('Nombre y precio requeridos');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase
        .from('categorias_calzado')
        .insert([{ nombre: newCatName, costo_mano_obra_docena: parseFloat(newCatPrice) }]);
      
      if (error) throw error;
      setNewCatName('');
      setNewCatPrice('');
      fetchCategories();
      if (onUpdate) onUpdate();
      toast.success('Categoría añadida');
    } catch (err) {
      toast.error('Error al guardar categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('categorias_calzado').delete().eq('id', id);
      if (error) throw error;
      fetchCategories();
      if (onUpdate) onUpdate();
      toast.success('Categoría eliminada');
    } catch (err) {
      toast.error('No se puede eliminar: Quizás hay zapatos usándola');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        
        <div className="flex items-center gap-2 mb-6">
          <Tags className="w-5 h-5 text-brand-gold" />
          <h2 className="text-xl font-bold text-white">Categorías de Calzado</h2>
        </div>

        {/* Formulario de Entrada */}
        <div className="space-y-3 mb-6 bg-[#111] p-4 rounded-xl border border-[#333]">
          <input 
            type="text" 
            placeholder="Nombre (Ej: Tacones)"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-gold text-sm"
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Costo Mano Obra/Doc"
              value={newCatPrice}
              onChange={(e) => setNewCatPrice(e.target.value)}
              className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-gold text-sm"
            />
            <button 
              onClick={handleAdd}
              disabled={loading}
              className="bg-brand-gold text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lista de Categorías */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#333] group">
              <div>
                <p className="text-sm font-bold text-white">{cat.nombre}</p>
                <p className="text-[10px] text-brand-gold uppercase tracking-wider">S/ {cat.costo_mano_obra_docena.toFixed(2)} por Docena</p>
              </div>
              <button onClick={() => handleDelete(cat.id)} className="text-gray-600 hover:text-red-500 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {categories.length === 0 && <p className="text-center text-gray-600 text-sm py-4 italic">No hay categorías registradas.</p>}
        </div>
      </div>
    </div>
  );
}
