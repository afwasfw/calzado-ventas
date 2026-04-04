import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Beaker } from 'lucide-react';

export default function CreateRecipeModal({ isOpen, onClose, categories = [], units = [], materials = [] }) {
  // Estado local para simular la lista de ingredientes dinámicos
  const [ingredients, setIngredients] = useState([
    { category: '', name: '', amount: '', unit: '' }
  ]);

  if (!isOpen) return null;

  const addIngredientRow = () => {
    setIngredients([...ingredients, { category: '', name: '', amount: '', unit: '' }]);
  };

  const removeIngredientRow = (idx) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleCategoryChange = (idx, newCategory) => {
    const updated = [...ingredients];
    updated[idx].category = newCategory;
    updated[idx].name = ''; // Reset the sub-insumo when category changes
    updated[idx].unit = ''; // Reset the unit when category changes
    setIngredients(updated);
  };

  const handleMaterialChange = (idx, newMaterialName) => {
    const updated = [...ingredients];
    const selectedMat = materials.find(m => m.nombre === newMaterialName);
    updated[idx].name = newMaterialName;
    if (selectedMat) {
      updated[idx].unit = selectedMat.unidad_medida; // Auto-assign the correct unit!
    }
    setIngredients(updated);
  };

  const updateIngredient = (idx, field, value) => {
    const updated = [...ingredients];
    updated[idx][field] = value;
    setIngredients(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto">
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-4xl p-6 md:p-10 shadow-2xl relative shadow-brand-peach/10 my-8">
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-brand-peach/10 rounded-xl text-brand-peach shadow-inner">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">Nuevo Modelo Maestro</h2>
            <p className="text-sm text-gray-400">Diseña la receta base (Plantilla) para calcular consumos automáticos.</p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="space-y-8">
          
          {/* BLOQUE 1: DATOS COMERCIALES */}
          <div className="bg-[#111] border border-[#222] p-6 rounded-xl">
            <h3 className="text-brand-peach font-bold uppercase tracking-wider text-xs mb-4">1. Identidad del Catálogo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Código Base</label>
                <input type="text" autoFocus className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors font-mono" placeholder="Ej. MOC-02" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre Comercial</label>
                <input type="text" className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors" placeholder="Nombre visible en catálogo..." />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Precio x Docena (S/)</label>
                <input type="number" className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-brand-gold font-bold focus:outline-none focus:border-brand-peach transition-colors" placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* BLOQUE 2: B.O.M / Constructor de Receta */}
          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <div className="bg-[#1a1a1a] p-4 border-b border-[#222] flex justify-between items-center">
              <div>
                <h3 className="text-brand-peach font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                  <Beaker className="w-4 h-4" />
                  2. Receta de Consumos (Métrica: 1 Docena)
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">Declara insumos de forma "Variable" si dependerán del color/talla del lote final.</p>
              </div>
              <button 
                type="button"
                onClick={addIngredientRow}
                className="text-xs bg-[#333] hover:bg-[#444] text-white px-3 py-1.5 rounded transition-colors font-bold"
              >
                + Fila
              </button>
            </div>

            <div className="p-4 space-y-3">
              {ingredients.map((ing, idx) => {
                const availableMaterials = ing.category 
                  ? materials.filter(m => m.categoria === ing.category)
                  : materials;

                return (
                  <div key={idx} className="flex gap-2 items-center">
                    {/* CATEGORY SELECTOR */}
                    <select 
                      value={ing.category}
                      onChange={(e) => handleCategoryChange(idx, e.target.value)}
                      className="flex-[2] bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-gray-300 focus:border-brand-peach outline-none"
                    >
                      <option value="">Categoría...</option>
                      {categories.map((cat, catIdx) => (
                        <option key={catIdx} value={cat}>{cat}</option>
                      ))}
                    </select>
                    
                    {/* MATERIAL / SUB-INSUMO SELECTOR (NOW DYNAMIC) */}
                    <select 
                      value={ing.name}
                      onChange={(e) => handleMaterialChange(idx, e.target.value)}
                      className={`flex-[3] bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm focus:border-brand-peach outline-none ${ing.name ? 'text-white' : 'text-gray-500'}`}
                    >
                      <option value="">Insumo del Almacén...</option>
                      {availableMaterials.map(m => (
                        <option key={m.id} value={m.nombre}>{m.nombre}</option>
                      ))}
                    </select>
                    
                    <input 
                      type="number" 
                      step="any"
                      value={ing.amount}
                      onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                      className="flex-[2] bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-brand-gold font-mono focus:border-brand-peach outline-none" 
                      placeholder="Cant." 
                    />
                    
                    <select 
                      value={ing.unit}
                      onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                      className="flex-[2] bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-gray-300 focus:border-brand-peach outline-none appearance-none"
                    >
                      <option value="">Medida...</option>
                      {units.map((unit, unitIdx) => (
                        <option key={unitIdx} value={unit}>{unit}</option>
                      ))}
                    </select>

                    <button type="button" onClick={() => removeIngredientRow(idx)} className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              
              {ingredients.length === 0 && (
                 <p className="text-center text-sm text-gray-600 py-4">No hay materiales en la receta. Agrega una fila.</p>
              )}
            </div>
          </div>

          {/* FOTO UPLOAD PLACEHOLDER */}
          <div className="border border-dashed border-[#333] rounded-xl p-8 text-center bg-black/20 hover:bg-[#111] transition-colors cursor-pointer group">
            <p className="text-gray-500 font-medium group-hover:text-brand-peach transition-colors">
              + Adjuntar Foto del Modelo Base (.jpg, .png)
            </p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-[#333] text-gray-300 rounded-xl hover:bg-[#222] transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" className="flex items-center gap-2 bg-[#d86145] hover:bg-[#c25035] text-white font-bold py-3 px-8 rounded-xl transition-transform active:scale-95 shadow-none">
              <Save className="w-5 h-5" />
              Guardar Nuevo Modelo
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
