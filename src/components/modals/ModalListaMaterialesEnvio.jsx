import React, { useState } from 'react';
import { X, Beaker, FileBox, Calculator, Trash2 } from 'lucide-react';

export default function ModalListaMaterialesEnvio({ isOpen, onClose, shoeData, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !shoeData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto pt-26 md:pt-36">
      <div className="bg-[#161616] border border-[#333] rounded-2xl w-full max-w-4xl p-6 md:p-10 shadow-2xl relative shadow-brand-peach/10 mb-20">
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* ENCABEZADO DE LA RECETA */}
        <div className="flex items-start gap-4 mb-8">
          <div className="p-4 bg-brand-peach/10 rounded-xl text-brand-peach shadow-inner">
            <Beaker className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">Ficha Técnica de Fabricación</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-brand-peach bg-brand-peach/5 border border-brand-peach/20 px-2 py-0.5 rounded">{shoeData.code}</span>
              <p className="text-sm text-gray-400 font-medium">B.O.M Base Estándar (Bill Of Materials)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: RESUMEN Y FOTO */}
          <div className="lg:col-span-1 space-y-6">
            <div className="aspect-square rounded-2xl border-4 border-[#222] overflow-hidden shadow-2xl relative group">
              <img src={shoeData.foto_url || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400'} alt={shoeData.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <p className="absolute bottom-4 left-4 font-bold text-xl text-white drop-shadow-md">{shoeData.name}</p>
            </div>

            <div className="bg-[#111] p-5 rounded-xl border border-[#222]">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-5 h-5 text-gray-400" />
                <h3 className="text-white font-bold text-sm uppercase tracking-wider">Métrica Acordada</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">Los consumos detallados a la derecha sirven para fabricar exactamente:</p>
              <div className="bg-brand-gold text-black text-center py-2 rounded-lg font-bold text-lg shadow-[0_0_10px_rgba(212,178,113,0.3)] mb-4">
                1 DOCENA <span className="text-xs font-medium opacity-70">(12 Pares)</span>
              </div>
              
              <div className="border-t border-[#333] pt-4 mt-2">
                <div className="flex gap-4">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Costo de Fábrica</p>
                    <p className="text-xl font-mono font-bold text-brand-gold">S/ {(shoeData.factoryCost || 0).toFixed(2)}</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase">Insumos + Merma</p>
                  </div>
                  <div className="text-left border-l border-[#333] pl-4">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Precio Sugerido</p>
                    <p className="text-xl font-mono font-bold text-white">S/ {(shoeData.precio || 0).toFixed(2)}</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase">Por Docena</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: LOS INGREDIENTES */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl overflow-hidden shadow-xl">
              <div className="border-b border-[#333] bg-[#111] px-6 py-4 flex justify-between items-center">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <FileBox className="w-5 h-5 text-brand-peach" />
                  Consumo Requerido (Receta)
                </h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#151515] border-b border-[#222]">
                      <th className="py-3 px-6 text-[10px] uppercase tracking-widest text-gray-400">Categoría</th>
                      <th className="py-3 px-6 text-[10px] uppercase tracking-widest text-gray-400">Material Específico</th>
                      <th className="py-3 px-6 text-[10px] uppercase tracking-widest text-gray-400 text-right">Cant. por Docena</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {shoeData.recipe.map((ingredient, idx) => (
                      <tr key={idx} className="hover:bg-[#111] transition-colors">
                        <td className="py-4 px-6">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest border border-[#333] px-2 py-0.5 rounded bg-black">
                            {ingredient.category}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-medium text-white">{ingredient.material}</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-baseline gap-1 bg-[#222] px-3 py-1 rounded">
                            <span className="text-lg font-mono font-bold text-brand-gold">{ingredient.amount}</span>
                            <span className="text-xs text-gray-400">{ingredient.unit}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Aviso de automatización */}
            <div className="mt-6 p-4 rounded-xl border border-blue-900/50 bg-blue-950/20 text-blue-400 text-sm flex gap-3 items-start">
              <span className="text-lg">🤖</span>
              <p>
                <strong>Motor de Producción:</strong> Al aceptar un pedido de WhatsApp que contenga este Zapato, el sistema 
                descontará automáticamente estas cantidades del <span className="font-mono text-xs border border-blue-500/30 px-1 rounded">Inventario de Insumos</span> por cada docena solicitada.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-3 items-center">
              <button 
                onClick={async () => {
                   const action = shoeData.activo ? 'archivar' : 'reactivar';
                   if(window.confirm(`¿Seguro que deseas ${action} el modelo ${shoeData.codigo_modelo || shoeData.code}?`)) {
                     setIsDeleting(true);
                     await onDelete(shoeData.id);
                     setIsDeleting(false);
                   }
                }}
                disabled={isDeleting}
                className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${
                  shoeData.activo ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? (shoeData.activo ? 'Archivando...' : 'Reactivando...') : (shoeData.activo ? 'Archivar Modelo' : 'Reactivar Modelo')}
              </button>
              <button 
                onClick={() => alert("La edición de recetas estará disponible en la próxima actualización.")}
                className="px-6 py-2.5 bg-brand-gold hover:bg-[#c2a15c] text-black font-bold rounded-xl transition-transform active:scale-95 shadow-[0_0_15px_rgba(212,178,113,0.3)]"
              >
                Modificar Receta
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
