import React, { useState } from 'react';
import { X, ListTree, Edit2, Trash2, Plus, Save } from 'lucide-react';

export default function CategoryManagerModal({ isOpen, onClose, categories, setCategories }) {
  const [isAddMode, setIsAddMode] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  // Para la edición en línea
  const [editingIndex, setEditingIndex] = useState(null);
  const [editCatName, setEditCatName] = useState('');

  if (!isOpen) return null;

  // Cierra y limpia todo
  const handleClose = () => {
    setIsAddMode(false);
    setEditingIndex(null);
    onClose();
  };

  // Maneja la creación de categorías
  const handleAddNew = (e) => {
    e.preventDefault();
    if (newCatName.trim() !== '') {
      setCategories([...categories, newCatName.trim()]);
      setNewCatName('');
      setIsAddMode(false);
    }
  };

  // Maneja el guardado de la edición
  const handleSaveEdit = (idx) => {
    if (editCatName.trim() !== '') {
      const updated = [...categories];
      updated[idx] = editCatName.trim();
      setCategories(updated);
    }
    setEditingIndex(null);
  };

  // Eliminar
  const handleDelete = (idx) => {
    if (window.confirm("¿Seguro que deseas eliminar esta categoría? Los insumos que estén bajo ella podrían quedar sin filtro correcto.")) {
      const updated = categories.filter((_, i) => i !== idx);
      setCategories(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      {/* CUERPO DEL MODAL PRINCIPAL */}
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-2xl p-6 md:p-8 shadow-2xl relative shadow-brand-gold/10 overflow-hidden">
        
        <button 
          onClick={handleClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-start gap-4 mb-8">
          <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-gold">
            <ListTree className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Administrador de Categorías</h2>
            <p className="text-sm text-gray-400">Edita, elimina o agrega nuevas carpetas de clasificación al almacén.</p>
          </div>
        </div>

        {/* VISTA 1: LA TABLA DE CATEGORÍAS */}
        {!isAddMode ? (
          <>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111] border-b border-[#333]">
                    <th className="py-3 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold">Nombre de Categoría Oficial</th>
                    <th className="py-3 px-6 text-xs uppercase tracking-widest text-brand-gold font-semibold text-center w-32">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222] max-h-80 overflow-y-auto block w-full table-fixed table-layout" style={{ display: 'table-row-group' }}>
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan="2" className="py-6 text-center text-gray-500">No hay categorías registradas.</td>
                    </tr>
                  )}
                  {categories.map((cat, idx) => (
                    <tr key={idx} className="hover:bg-[#1f1f1f] transition-colors">
                      <td className="py-4 px-6 w-full">
                        {editingIndex === idx ? (
                          <input 
                            type="text"
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(idx); }}
                            className="bg-black border border-brand-gold text-white px-3 py-1 rounded focus:outline-none w-full"
                          />
                        ) : (
                          <span className="font-medium text-white">{cat}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        {editingIndex === idx ? (
                          <button onClick={() => handleSaveEdit(idx)} className="text-green-500 hover:text-green-400 p-2">
                            <Save className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setEditingIndex(idx); setEditCatName(cat); }}
                              className="text-gray-500 hover:text-brand-gold p-2 transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(idx)}
                              className="text-gray-500 hover:text-red-500 p-2 transition-colors ml-1"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              onClick={() => setIsAddMode(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#333] hover:border-brand-gold text-gray-400 hover:text-brand-gold py-4 rounded-xl transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Crear Nueva Categoría
            </button>
          </>
        ) : (
          /* VISTA 2: EL SUB-MODAL DE AÑADIR (EN LÍNEA) */
          <div className="bg-[#111] border border-[#333] rounded-xl p-8 animate-fade-in-up">
            <h3 className="text-lg font-bold text-white mb-4">Ingresa la nueva Categoría</h3>
            <form onSubmit={handleAddNew} className="space-y-4">
              <input 
                type="text"
                autoFocus
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Nombrar nueva categoría..."
                className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors text-lg"
              />
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddMode(false)}
                  className="flex-1 px-4 py-3 border border-[#333] text-gray-300 rounded-xl hover:bg-[#222] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-brand-gold hover:bg-[#c2a15c] text-black font-bold py-3 px-4 rounded-xl shadow-[0_0_15px_rgba(212,178,113,0.3)] transition-colors"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
