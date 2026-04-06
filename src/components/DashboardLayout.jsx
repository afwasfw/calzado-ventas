import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Archive
} from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import InventoryTab from './tabs/InventoryTab';
import FinishedGoodsTab from './tabs/FinishedGoodsTab';
import ShoeRecipesTab from './tabs/ShoeRecipesTab';
import OrdersTab from './tabs/OrdersTab';

export default function DashboardLayout({ session, handleLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');

  const navItems = [
    { id: 'resumen', label: 'Panel de Control', icon: LayoutDashboard },
    { id: 'pedidos', label: 'Gestión de Pedidos', icon: Package },
    { id: 'almacen', label: 'Producto Terminado', icon: Archive },
    { id: 'inventario', label: 'Inventario Insumos', icon: Settings },
    { id: 'recetario', label: 'Fichas de Calzado', icon: Settings },
  ];

  return (
    <div className="flex h-screen w-full bg-[#111111] overflow-hidden">
      
      {/* ======================================= */}
      {/* SIDEBAR ESCRITORIO */}
      {/* ======================================= */}
      <aside className="hidden md:flex flex-col w-72 bg-[#161616] border-r border-[#222] z-10 transition-colors shadow-2xl shadow-brand-gold/5">
        <div className="p-8 flex flex-col items-center border-b border-[#222]">
          <img src="/logo_base.png" alt="Emssa Valems" className="w-16 mb-4 drop-shadow-[0_0px_10px_rgba(212,178,113,0.15)]" />
          <h2 className="text-xl font-serif tracking-widest text-white uppercase font-semibold">Emssa Valems</h2>
          <p className="text-brand-gold text-[10px] tracking-[0.25em] font-serif uppercase mt-1">Portal Operativo</p>
        </div>

        <nav className="flex-1 py-8 px-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm
                    ${activeTab === item.id 
                      ? 'bg-brand-gold text-black shadow-lg' 
                      : 'text-gray-400 hover:bg-brand-gold/10 hover:text-brand-gold'
                    }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#222] space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ======================================= */}
      {/* MENÚ MÓVIL (HEADER HAMBURGUESA) */}
      {/* ======================================= */}
      <div className="md:hidden fixed top-0 w-full bg-[#161616] border-b border-[#222] px-4 py-4 z-20 flex justify-between items-center shadow-sm">
        <img src="/logo.png" alt="Logo" className="w-10" />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ======================================= */}
      {/* AREA PRINCIPAL DE TRABAJO */}
      {/* ======================================= */}
      <main className="flex-1 h-screen overflow-y-auto w-full pt-20 md:pt-0 relative">
        <div className="absolute inset-0 bg-[#111111] z-[-1] pointer-events-none"></div>

        {/* ------------------------------------- */}
        {/* RUTEADOR CONDICIONAL DE PESTAÑAS      */}
        {/* ------------------------------------- */}
        
        {activeTab === 'resumen' && <OverviewTab session={session} />}
        
        {activeTab === 'pedidos' && <OrdersTab />}
        
        {activeTab === 'almacen' && <FinishedGoodsTab />}
        
        {activeTab === 'inventario' && <InventoryTab />}

        {activeTab === 'recetario' && <ShoeRecipesTab />}

      </main>

    </div>
  );
}
