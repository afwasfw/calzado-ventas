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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      {/* SIDEBAR ESCRITORIO (Y TABLET RESPONSIVO) */}
      {/* ======================================= */}
      <aside className={`hidden md:flex flex-col bg-[#161616] border-r border-[#222] z-10 transition-all duration-500 ease-in-out shadow-2xl shadow-brand-gold/5 
        ${isSidebarCollapsed ? 'w-24' : 'w-72'}`}
      >
        {/* Cabecera Sidebar con Toggle */}
        <div className={`p-6 flex flex-col items-center border-b border-[#222] relative transition-all duration-500
          ${isSidebarCollapsed ? 'pb-8' : 'p-8'}`}
        >
          <img 
            src="/logo_base.png" 
            alt="Emssa Valems" 
            className={`transition-all duration-500 drop-shadow-[0_0px_10px_rgba(212,178,113,0.15)]
              ${isSidebarCollapsed ? 'w-10 mb-0' : 'w-16 mb-4'}`} 
          />
          {!isSidebarCollapsed && (
            <div className="text-center animate-fade-in">
              <h2 className="text-xl font-serif tracking-widest text-white uppercase font-semibold leading-tight">Emssa Valems</h2>
              <p className="text-brand-gold text-[10px] tracking-[0.25em] font-serif uppercase mt-1">Portal Operativo</p>
            </div>
          )}

          {/* Botón para colapsar (Desktop) */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-brand-gold text-black rounded-full p-1 shadow-xl hover:scale-110 transition-transform z-20"
          >
            {isSidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-8 px-3 overflow-y-auto">
          <ul className="space-y-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  title={isSidebarCollapsed ? item.label : ''}
                  className={`w-full flex items-center transition-all duration-300 font-medium text-sm rounded-xl py-3.5
                    ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-4'}
                    ${activeTab === item.id 
                      ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
                      : 'text-gray-400 hover:bg-brand-gold/10 hover:text-brand-gold'
                    }`}
                >
                  <item.icon className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5 flex-shrink-0'}`} />
                  {!isSidebarCollapsed && <span className="truncate whitespace-nowrap animate-fade-in">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`p-4 border-t border-[#222] transition-all duration-500 ${isSidebarCollapsed ? 'items-center' : ''}`}>
          <button 
            onClick={handleLogout}
            title={isSidebarCollapsed ? 'Cerrar Sesión' : ''}
            className={`w-full flex items-center text-sm font-medium text-red-500 hover:bg-red-950/30 rounded-xl transition-all py-3
              ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}`}
          >
            <LogOut className={`transition-all ${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-4'}`} />
            {!isSidebarCollapsed && <span className="animate-fade-in">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ======================================= */}
      {/* MENÚ MÓVIL (Mismo código optimizado) */}
      {/* ======================================= */}
      <div className="md:hidden fixed top-0 w-full bg-[#161616] border-b border-[#222] px-4 py-4 z-50 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo_base.png" alt="Emssa Valems" className="w-8 h-8 object-contain" />
          <span className="text-white font-serif text-sm uppercase tracking-wider font-bold">EMSSA</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2 bg-[#222] rounded-lg">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Móvil Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Content */}
          <div className="absolute top-0 right-0 w-4/5 max-w-sm h-full bg-[#161616] shadow-2xl flex flex-col animate-slide-in-right border-l border-[#333]">
            <div className="p-8 flex flex-col items-center border-b border-[#222] bg-black/20">
              <img src="/logo_base.png" alt="Emssa Valems" className="w-14 mb-4" />
              <h2 className="text-lg font-serif tracking-widest text-white uppercase font-bold text-center">Emssa Valems</h2>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 py-8 px-4 overflow-y-auto overflow-x-hidden">
              <ul className="space-y-3">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-bold text-sm
                        ${activeTab === item.id 
                          ? 'bg-brand-gold text-black shadow-lg translate-x-1' 
                          : 'text-gray-400 active:bg-brand-gold/10 active:text-brand-gold'
                        }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-6 border-t border-[#222] bg-black/20">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-4 text-sm font-bold text-red-500 bg-red-950/20 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión del Portal
              </button>
            </div>
          </div>
        </div>
      )}

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
