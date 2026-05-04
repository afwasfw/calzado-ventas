import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Beaker } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function ModalCrearReceta({ isOpen, onClose, categories = [], units = [], materials = [], onSuccess, initialData = null, isEditing = false }) {
  // Estado local
  const [formData, setFormData] = useState({
    codigo_modelo: '',
    nombre: '',
    precio: '',
    color: '',
    taco: '',
    serie: '',
    categoria_id: ''
  });
  
  const [shoeCategories, setShoeCategories] = useState([]);
  const [fotoBase64, setFotoBase64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [ingredients, setIngredients] = useState([
    { category: '', name: '', amount: '', unit: '', merma: '5' }
  ]);

  const fetchShoeCategories = async () => {
    const { data } = await supabase.from('categorias_calzado').select('*').order('nombre');
    setShoeCategories(data || []);
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchShoeCategories();
      
      if (initialData) {
        // Si estamos editando o clonando, cargamos los datos
        setFormData({
          codigo_modelo: isEditing ? initialData.codigo_modelo : `${initialData.codigo_modelo}-CLON`,
          nombre: initialData.nombre,
          precio: initialData.precio_docena_mayorista || initialData.precio,
          color: initialData.color_fisico,
          taco: initialData.taco,
          serie: initialData.serie,
          categoria_id: initialData.categoria_id
        });
        
        if (initialData.recetas_produccion && initialData.recetas_produccion.length > 0) {
          const mappedIngredients = initialData.recetas_produccion.map(r => ({
            category: r.inventario_materiales?.categoria || '',
            name: r.inventario_materiales?.nombre || '',
            amount: r.cantidad_por_docena,
            unit: r.inventario_materiales?.unidad_medida || '',
            merma: r.margen_merma || '5'
          }));
          setIngredients(mappedIngredients);
        } else if (initialData.recipe && initialData.recipe.length > 0) {
           // Fallback for UI-mapped recipes
           const mappedIngredients = initialData.recipe.map(r => ({
            category: r.category || '',
            name: r.material || r.name || '',
            amount: r.amount,
            unit: r.unit || '',
            merma: r.merma || '5'
          }));
          setIngredients(mappedIngredients);
        }
        
        if (initialData.foto_url) {
          setFotoBase64(initialData.foto_url);
        }
      } else {
        setFormData({ codigo_modelo: '', nombre: '', precio: '', color: '', taco: '', serie: '', categoria_id: '' });
        setIngredients([{ category: '', name: '', amount: '', unit: '', merma: '5' }]);
        setFotoBase64(null);
      }
    }
  }, [isOpen, initialData, isEditing]);

  if (!isOpen) return null;


  const addIngredientRow = () => {
    setIngredients([...ingredients, { category: '', name: '', amount: '', unit: '', merma: '5' }]);
  };

  const handleCategoryChange = (idx, newCategory) => {
    const updated = [...ingredients];
    updated[idx].category = newCategory;
    updated[idx].name = ''; 
    updated[idx].unit = ''; 
    setIngredients(updated);
  };

  const handleMaterialChange = (idx, newMaterialName) => {
    const updated = [...ingredients];
    const selectedMat = materials.find(m => m.nombre === newMaterialName);
    updated[idx].name = newMaterialName;
    if (selectedMat) {
      updated[idx].unit = selectedMat.unidad_medida;
      updated[idx].category = selectedMat.categoria;
    }
    setIngredients(updated);
  };

  const updateIngredient = (idx, field, value) => {
    const updated = [...ingredients];
    updated[idx][field] = value;
    setIngredients(updated);
  };

  const removeIngredientRow = (idx) => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  const handleImageUpload = (e) => {
    const file = e.type === 'drop' ? e.dataTransfer.files[0] : e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFotoBase64(reader.result);
      reader.readAsDataURL(file);
    } else if (file) {
      toast.error('Solo se aceptan archivos de imagen (.jpg, .png)');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codigo_modelo || !formData.nombre || !formData.precio || !formData.color || !formData.taco || !formData.serie || !formData.categoria_id) {
      toast.error("Llena todos los campos del modelo.");
      return;
    }

    const validIngredients = ingredients.filter(i => i.name && i.amount);
    if (validIngredients.length === 0) {
      toast.error("La receta debe tener al menos un insumo.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedCat = shoeCategories.find(c => c.id === formData.categoria_id);
      const laborCost = selectedCat ? selectedCat.costo_mano_obra_docena : 0;

      let productoId = initialData?.id;

      if (isEditing && productoId) {
        // UPDATE EXISTING PRODUCT
        const { error: pError } = await supabase
          .from('productos_finales')
          .update({
            codigo_modelo: formData.codigo_modelo,
            nombre: formData.nombre,
            color_fisico: formData.color,
            taco: formData.taco,
            serie: formData.serie,
            categoria_id: formData.categoria_id,
            costo_mano_obra_docena: laborCost,
            precio_docena_mayorista: parseFloat(formData.precio),
            foto_url: fotoBase64 || null
          })
          .eq('id', productoId);

        if (pError) throw pError;

        // Delete old recipe items to re-insert new ones (Cleanest way to handle BOM updates)
        await supabase.from('recetas_produccion').delete().eq('producto_id', productoId);

      } else {
        // CREATE NEW PRODUCT
        const { data: nProducto, error: pError } = await supabase
          .from('productos_finales')
          .insert([{
            codigo_modelo: formData.codigo_modelo,
            nombre: formData.nombre,
            color_fisico: formData.color,
            taco: formData.taco,
            serie: formData.serie,
            categoria_id: formData.categoria_id,
            costo_mano_obra_docena: laborCost,
            precio_docena_mayorista: parseFloat(formData.precio),
            stock_docenas: 0,
            foto_url: fotoBase64 || null
          }])
          .select('id')
          .single();

        if (pError) throw pError;
        productoId = nProducto.id;
      }
      
      // INSERT RECIPE ITEMS
      const recipeInserts = validIngredients.map(ing => {
        const matId = materials.find(m => m.nombre === ing.name)?.id;
        return {
          producto_id: productoId,
          material_id: matId,
          cantidad_por_docena: parseFloat(ing.amount),
          margen_merma: parseFloat(ing.merma || 0)
        };
      });

      const { error: rError } = await supabase.from('recetas_produccion').insert(recipeInserts);
      if (rError) throw rError;

      toast.success(isEditing ? 'Ficha actualizada correctamente' : 'Nuevo modelo creado correctamente');
      
      if (onSuccess) onSuccess();
      else onClose();

    } catch (err) {
      console.error('Error saving recipe:', err.message);
      toast.error('Error al guardar en la base de datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto pt-24 md:pt-32">
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-4xl p-6 md:p-10 shadow-2xl relative shadow-brand-peach/10 my-8">
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-brand-peach/10 rounded-xl text-brand-peach shadow-inner">
            {isEditing ? <Beaker className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">
              {isEditing ? 'Editar Ficha Técnica' : 'Nuevo Modelo Maestro'}
            </h2>
            <p className="text-sm text-gray-400">
              {isEditing ? 'Modifica los consumos y atributos del modelo.' : 'Diseña la receta base para calcular consumos automáticos.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* BLOQUE 1: DATOS COMERCIALES Y ATRIBUTOS FISICOS */}
          <div className="bg-[#111] border border-[#222] p-6 rounded-xl">
            <h3 className="text-brand-peach font-bold uppercase tracking-wider text-xs mb-4">1. Identidad del Catálogo y Atributos Físicos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Código Base</label>
                <input type="text" value={formData.codigo_modelo} onChange={(e) => setFormData({...formData, codigo_modelo: e.target.value.toUpperCase()})} autoFocus className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors font-mono uppercase" placeholder="Ej. MOC-02" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre Comercial</label>
                <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors" placeholder="Nombre visible en catálogo..." />
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Precio Mín x Doc (S/)</label>
                <input type="number" step="any" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-brand-gold font-bold focus:outline-none focus:border-brand-peach transition-colors" placeholder="0.00" />
              </div>
            </div>
            
            {/* ATRIBUTOS FISICOS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#222] pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Color Físico Deseado</label>
                <input type="text" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-brand-peach transition-colors" placeholder="Ej: Negro, Azul Noche..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Taco/Planta</label>
                <input type="text" value={formData.taco} onChange={(e) => setFormData({...formData, taco: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-brand-peach transition-colors" placeholder="Ej: Aguja 9cm, Suela Goma..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Serie de Tallas Cubiertas</label>
                <input type="text" value={formData.serie} onChange={(e) => setFormData({...formData, serie: e.target.value})} className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-gray-300 focus:outline-none focus:border-brand-peach transition-colors" placeholder="Ej: 35-39, 39-44..." />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría Productiva (Mano de Obra)</label>
                <select 
                  value={formData.categoria_id} 
                  onChange={(e) => setFormData({...formData, categoria_id: e.target.value})}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-peach transition-colors appearance-none"
                >
                  <option value="">Selecciona Categoría...</option>
                  {shoeCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre} (S/ {cat.costo_mano_obra_docena} p/doc)</option>
                  ))}
                </select>
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
                      className="flex-[1.5] bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-brand-gold font-mono focus:border-brand-peach outline-none" 
                      placeholder="Cant." 
                    />

                    <div className="flex-[1.5] relative group/merma">
                      <input 
                        type="number" 
                        step="any"
                        value={ing.merma}
                        onChange={(e) => updateIngredient(idx, 'merma', e.target.value)}
                        className="w-full bg-[#1a1a1a] border border-brand-gold/20 rounded px-3 py-2 text-sm text-brand-gold font-mono focus:border-brand-peach outline-none" 
                        placeholder="% M" 
                      />
                      <span className="absolute -top-6 left-0 text-[9px] bg-black text-brand-gold px-1 rounded opacity-0 group-hover/merma:opacity-100 transition-opacity">% Merma</span>
                    </div>
                    
                    <select 
                      value={ing.unit}
                      onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                      className="flex-[1.5] bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm text-gray-300 focus:border-brand-peach outline-none appearance-none"
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

          {/* FOTO UPLOAD REARMATADO PARA ARRASTRAR Y SOLTAR */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">3. Fotografía de Referencia (Opcional)</label>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleImageUpload(e); }}
              className="border-2 border-dashed border-[#333] hover:border-brand-peach rounded-xl p-8 text-center bg-black/20 hover:bg-[#111] transition-all cursor-pointer relative overflow-hidden group"
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleImageUpload(e)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              
              {fotoBase64 ? (
                <>
                  <img src={fotoBase64} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal transition-all" />
                  <div className="relative z-10 p-2 bg-black/80 rounded-lg inline-block border border-[#444] shadow-xl">
                    <p className="text-white font-medium text-sm">✓ Imagen adjuntada exitosamente</p>
                    <p className="text-[#a8a8a8] text-xs mt-1">Haz clic o arrastra otra para cambiar</p>
                  </div>
                </>
              ) : (
                <div className="relative z-10 pointer-events-none">
                  <p className="text-gray-500 font-medium group-hover:text-brand-peach transition-colors text-lg">
                    + Clic o Arrastra una Foto del Modelo Terminado (.jpg, .png)
                  </p>
                  <p className="text-[#a8a8a8] text-xs mt-2">Esta foto aparecerá en la grilla del catálogo (Máx 2MB recomendado)</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 border border-[#333] text-gray-300 rounded-xl hover:bg-[#222] transition-colors font-medium">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-[#d86145] hover:bg-[#c25035] text-white font-bold py-3 px-8 rounded-xl transition-transform active:scale-95 shadow-none disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Guardando en Servidor...' : 'Guardar Nuevo Modelo'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
