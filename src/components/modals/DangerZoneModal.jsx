import React, { useState } from 'react';
import { Trash2, AlertTriangle, Database, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function DangerZoneModal({ isOpen, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const handleDeleteAll = async () => {
    if (confirmText !== 'ELIMINAR TODO') {
      toast.error('Por favor escribe "ELIMINAR TODO" para confirmar');
      return;
    }

    try {
      setIsDeleting(true);
      
      // ELIMINAR EN ORDEN DE DEPENDENCIA (HIJOS PRIMERO)
      
      // 1. Recetas de producción (depende de productos y materiales)
      const { error: err1 } = await supabase.from('recetas_produccion').delete().neq('id', 0);
      if (err1) throw err1;

      // 2. Pedidos (depende de productos)
      const { error: err2 } = await supabase.from('pedidos').delete().neq('id', 0);
      if (err2) throw err2;

      // 3. Productos finales
      const { error: err3 } = await supabase.from('productos_finales').delete().neq('id', 0);
      if (err3) throw err3;

      // 4. Inventario de materiales
      const { error: err4 } = await supabase.from('inventario_materiales').delete().neq('id', 0);
      if (err4) throw err4;

      toast.success('Todas las pruebas han sido eliminadas correctamente.');
      onClose();
      window.location.reload(); // Recargar para limpiar estados de la app

    } catch (err) {
      console.error('Error al limpiar base de datos:', err);
      toast.error('Error al eliminar datos: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#1a1a1a] border-2 border-red-900/30 rounded-2xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative">
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="p-4 bg-red-500/10 rounded-full text-red-500 mb-4 animate-pulse">
            <AlertTriangle className="w-12 h-12" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Zona de Peligro</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Esta acción eliminará <strong>TODOS</strong> los pedidos, materiales, productos y recetas que has creado. <br/>
            No se puede deshacer. Se usa solo para limpiar datos de prueba.
          </p>

          <div className="w-full space-y-4">
            <div className="text-left">
              <label className="block text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 px-1">
                Escribe "ELIMINAR TODO" para continuar
              </label>
              <input 
                type="text" 
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="ELIMINAR TODO"
                className="w-full bg-black/40 border border-red-900/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-all text-center font-mono font-bold placeholder:text-gray-700"
              />
            </div>

            <button 
              onClick={handleDeleteAll}
              disabled={isDeleting || confirmText !== 'ELIMINAR TODO'}
              className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-xl active:scale-95"
            >
              {isDeleting ? (
                <>Limpiando Servidor...</>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Borrar Todas las Pruebas
                </>
              )}
            </button>

            <button 
              onClick={onClose}
              disabled={isDeleting}
              className="w-full text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors py-2"
            >
              Mejor no, cancelar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
