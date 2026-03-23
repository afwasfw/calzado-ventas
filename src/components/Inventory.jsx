import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Edit2, Save, X, AlertTriangle, PackageSearch, Plus, Loader2 } from 'lucide-react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState(0);
  
  // New Model state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModel, setNewModel] = useState({ modelo: '', precio_docena: '', stock_docenas: 0 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('modelo', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setProducts([
        { id: 1, modelo: 'Bota Rock', stock_docenas: 12, precio_docena: 120 },
        { id: 2, modelo: 'Tenis Air', stock_docenas: 3, precio_docena: 85 },
        { id: 3, modelo: 'Sandalia Beach', stock_docenas: 25, precio_docena: 45 },
        { id: 4, modelo: 'Zapato Oxford', stock_docenas: 4, precio_docena: 95 },
        { id: 5, modelo: 'Zapatilla Urban', stock_docenas: 15, precio_docena: 60 },
        { id: 6, modelo: 'Bota Nieve', stock_docenas: 2, precio_docena: 150 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditValue(product.stock_docenas);
  };

  const handleSave = async (id) => {
    try {
      const { error } = await supabase
        .from('productos')
        .update({ stock_docenas: editValue })
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.map(p => p.id === id ? { ...p, stock_docenas: editValue } : p));
      setEditingId(null);
    } catch (error) {
      console.error('Error updating stock:', error);
      setProducts(products.map(p => p.id === id ? { ...p, stock_docenas: editValue } : p));
      setEditingId(null);
    }
  };

  const handleAddNew = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert([newModel])
        .select();

      if (error) throw error;

      if (data) {
        setProducts([...products, data[0]].sort((a, b) => a.modelo.localeCompare(b.modelo)));
      }
      setIsModalOpen(false);
      setNewModel({ modelo: '', precio_docena: '', stock_docenas: 0 });
    } catch (error) {
      console.error('Error adding new model:', error);
      // Mock add for offline
      const mockNew = { ...newModel, id: Date.now() };
      setProducts([...products, mockNew].sort((a, b) => a.modelo.localeCompare(b.modelo)));
      setIsModalOpen(false);
      setNewModel({ modelo: '', precio_docena: '', stock_docenas: 0 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2 text-industrial-gray uppercase tracking-tight">
            <PackageSearch size={24} className="text-industrial-blue" />
            Control de Inventario
          </h2>
          <p className="text-gray-500 text-sm">Gestiona el stock de docenas por modelo (Curva 38-42).</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-full sm:w-auto shadow-md"
        >
          <Plus size={18} /> Nuevo Modelo
        </button>
      </div>

      <div className="card shadow-lg border-0 overflow-hidden bg-white">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex justify-center p-20">
              <Loader2 className="animate-spin text-industrial-blue" size={40} />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-gray-500 border-b">Modelo de Calzado</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-gray-500 border-b">Precio x Docena</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-gray-500 border-b">Estado Stock</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-gray-500 border-b text-center">Cantidad</th>
                  <th className="p-6 font-bold text-xs uppercase tracking-widest text-gray-500 border-b text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className={`transition-colors ${product.stock_docenas < 5 ? 'bg-red-50/50' : 'hover:bg-gray-50'}`}>
                    <td className="p-6">
                      <div className="font-bold text-industrial-gray text-lg">{product.modelo}</div>
                      <div className="text-xs text-gray-400 font-medium">CURVA ESTÁNDAR 38-42</div>
                    </td>
                    <td className="p-6">
                      <span className="font-mono text-lg font-semibold text-gray-700">${product.precio_docena}</span>
                    </td>
                    <td className="p-6">
                      {product.stock_docenas < 5 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-tighter">
                          <AlertTriangle size={14} /> Stock Crítico
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-tighter">
                          Disponible
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-center">
                      {editingId === product.id ? (
                        <input 
                          type="number" 
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value))}
                          className="w-24 px-3 py-2 border-2 border-industrial-blue rounded-lg text-lg font-bold focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className={`text-2xl font-black ${product.stock_docenas < 5 ? 'text-red-600' : 'text-industrial-gray'}`}>
                          {product.stock_docenas}
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-right">
                      {editingId === product.id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleSave(product.id)} className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 shadow-sm">
                            <Save size={20} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white p-2 rounded-lg hover:bg-gray-500 shadow-sm">
                            <X size={20} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(product)} className="text-industrial-blue hover:bg-blue-50 p-2 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                          <Edit2 size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Modal for New Model */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="card bg-white w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-industrial-blue uppercase italic">Nuevo Modelo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddNew} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Nombre del Modelo</label>
                <input 
                  required
                  type="text" 
                  value={newModel.modelo}
                  onChange={(e) => setNewModel({...newModel, modelo: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Bota Industrial Premium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Precio x Docena ($)</label>
                  <input 
                    required
                    type="number" 
                    value={newModel.precio_docena}
                    onChange={(e) => setNewModel({...newModel, precio_docena: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Stock Inicial</label>
                  <input 
                    required
                    type="number" 
                    value={newModel.stock_docenas}
                    onChange={(e) => setNewModel({...newModel, stock_docenas: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={submitting}
                className="btn-primary w-full py-4 text-lg font-bold uppercase mt-6 shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Guardar Modelo
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 p-6 bg-industrial-blue text-white rounded-2xl shadow-lg">
        <div className="bg-white/20 p-3 rounded-xl">
          <PackageSearch size={24} />
        </div>
        <div>
          <h4 className="font-bold text-sm uppercase tracking-wider">Nota de Inventario</h4>
          <p className="text-blue-100 text-xs">El stock refleja docenas físicas en almacén. Actualice inmediatamente después de cada despacho.</p>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
