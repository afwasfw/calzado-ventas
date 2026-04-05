import React, { useState, useEffect } from 'react';
import { X, PackageCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function NewBatchModal({ isOpen, onClose, shoeDatabase = [], onSuccess }) {
  if (!isOpen) return null;

  const [selectedShoeId, setSelectedShoeId] = useState('');
  const [docenasInput, setDocenasInput] = useState('');
  const [notas, setNotas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedShoe = shoeDatabase.find(s => s.id === selectedShoeId);

  useEffect(() => {
    if (isOpen) {
      setSelectedShoeId('');
      setDocenasInput('');
      setNotas('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShoe) {
      toast.error('Debes seleccionar un modelo del catálogo base.');
      return;
    }
    const cantDocenas = parseFloat(docenasInput);
    if (!cantDocenas || cantDocenas <= 0) {
      toast.error('Debes ingresar una cantidad de docenas válida mayor a 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 1. OBTENER RECETA PARA ESTE ZAPATO
      const { data: recipeData, error: recipeErr } = await supabase
        .from('recetas_produccion')
        .select('*')
        .eq('producto_id', selectedShoe.id);
        
      if (recipeErr) throw recipeErr;

      // 2. DESCONTAR MATERIALES BASADO EN LA DOCENA
      if (recipeData && recipeData.length > 0) {
        const materialIds = recipeData.map(r => r.material_id);
        
        // Consultar el stock actual de los ingredientes
        const { data: materialsData, error: matErr } = await supabase
          .from('inventario_materiales')
          .select('id, stock_actual, nombre')
          .in('id', materialIds);
          
        if (matErr) throw matErr;

        // 2.5 VALIDAR QUE HAYA STOCK SUFICIENTE
        const insufficientMaterials = [];
        recipeData.forEach(req => {
          const mat = materialsData?.find(m => m.id === req.material_id);
          if (mat) {
            const gastoTotal = parseFloat(req.cantidad_por_docena) * cantDocenas;
            if (mat.stock_actual < gastoTotal) {
              insufficientMaterials.push(`${mat.nombre} (Faltan ${(gastoTotal - mat.stock_actual).toFixed(2)})`);
            }
          }
        });

        if (insufficientMaterials.length > 0) {
          toast.error(`Stock insuficiente para producir el lote:\n${insufficientMaterials.join(', ')}`, { duration: 5000 });
          setIsSubmitting(false);
          return;
        }

        // Armar el lote de actualizaciones a disminuir
        const stockUpdates = recipeData.map(req => {
          const mat = materialsData?.find(m => m.id === req.material_id);
          if (mat) {
            const gastoTotal = parseFloat(req.cantidad_por_docena) * cantDocenas;
            const nuevoStockInsumo = parseFloat(mat.stock_actual) - gastoTotal;
            
            return supabase
              .from('inventario_materiales')
              .update({ stock_actual: nuevoStockInsumo })
              .eq('id', mat.id);
          }
          return null;
        }).filter(Boolean);

        // Ejecutarlos en paralelo
        await Promise.all(stockUpdates);
      }

      // 3. ENTRADA DEL ALMACEN DEL ZAPATO TERMINADO
      const newStock = parseFloat(selectedShoe.stock_docenas) + cantDocenas;

      const { error: finalErr } = await supabase
        .from('productos_finales')
        .update({ stock_docenas: newStock })
        .eq('id', selectedShoe.id);

      if (finalErr) throw finalErr;
      
      toast.success(`Se ingresaron ${cantDocenas} docenas de ${selectedShoe.codigo_modelo} y se descontó la materia prima del inventario central.`);
      if (onSuccess) onSuccess();
      else onClose();
      
    } catch (err) {
      console.error('Error procesando lote y/o B.O.M:', err.message);
      toast.error('Ocurrió un error al guardar o descontar sub-insumos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-lg p-8 shadow-2xl relative shadow-[#25D366]/10">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-white mb-1">Ingresar Lote Terminado</h2>
        <p className="text-sm text-gray-400 mb-8">Registra producción recién salida de la línea de ensamblaje para sumar al stock.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Modelo del Catálogo Base</label>
            <select 
              value={selectedShoeId}
              onChange={(e) => setSelectedShoeId(e.target.value)}
              className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366] transition-colors appearance-none font-medium"
            >
              <option value="">Selecciona el modelo...</option>
              {shoeDatabase.map(shoe => (
                <option key={shoe.id} value={shoe.id}>
                  {shoe.codigo_modelo} - {shoe.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Color Físico</label>
              <input type="text" value={selectedShoe?.color_fisico || ''} readOnly className="w-full bg-[#1a1a1a] border border-[#222] text-gray-500 rounded-xl px-4 py-3 font-medium focus:outline-none" placeholder="..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Serie</label>
              <input type="text" value={selectedShoe?.serie || ''} readOnly className="w-full bg-[#1a1a1a] border border-[#222] text-gray-500 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#25D366] transition-colors" placeholder="..." />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tipo de Taco</label>
              <input type="text" value={selectedShoe?.taco || ''} readOnly className="w-full bg-[#1a1a1a] border border-[#222] text-gray-500 rounded-xl px-4 py-3 font-medium focus:outline-none focus:border-[#25D366] transition-colors" placeholder="..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Docenas (Cant.)</label>
              <input 
                type="number" 
                step="any"
                value={docenasInput}
                onChange={(e) => setDocenasInput(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-[#25D366] focus:outline-none focus:border-[#25D366] transition-colors font-sans text-xl font-bold text-center" 
                placeholder="0" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nota / Observación</label>
              <textarea 
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#25D366] transition-colors" 
                placeholder="Añade observaciones sobre el estado..." 
                rows="2"
              ></textarea>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-black font-bold py-4 rounded-xl transition-transform active:scale-95 shadow-none disabled:opacity-50"
            >
              <PackageCheck className="w-5 h-5" />
              {isSubmitting ? 'Sumando al stock...' : 'Ingresar al Almacén'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
