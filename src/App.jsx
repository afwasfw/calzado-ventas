import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import { LayoutDashboard, Package, Footprints, ClipboardList, Menu, X, Moon, Sun } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Package },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Sidebar (Desktop) / Header (Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-industrial-blue dark:bg-gray-950 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full border-r border-transparent dark:border-gray-800">
          <div className="flex items-center gap-3 mb-10">
            <Footprints size={32} className="text-blue-300" />
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter m-0 leading-none">
                Calzado S.A.
              </h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-1">
                Industrial System
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                  ? 'bg-blue-800 dark:bg-gray-800 text-white' 
                  : 'text-blue-100 hover:bg-blue-800/50 dark:hover:bg-gray-800/50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
            
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-300/50 dark:text-gray-600 cursor-not-allowed" disabled>
              <ClipboardList size={20} />
              <span className="font-semibold">Reportes</span>
            </button>
          </nav>

          <div className="mt-auto pt-6 border-t border-blue-800 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-blue-300 dark:text-gray-500">v1.2.0 • Admin</span>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 bg-blue-800 dark:bg-gray-800 rounded-full text-blue-200 hover:text-white transition-colors"
              title="Alternar Modo Oscuro"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-industrial-blue dark:bg-gray-950 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-sm border-b border-transparent dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Footprints size={24} className="text-blue-300" />
            <span className="font-black uppercase tracking-tighter">Calzado S.A.</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 hover:bg-blue-800 dark:hover:bg-gray-800 rounded-md">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-blue-800 dark:hover:bg-gray-800 rounded-md">
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold text-industrial-gray uppercase tracking-tight">
              {activeTab === 'dashboard' ? 'Panel de Control' : 'Gestión de Inventario'}
            </h2>
            <p className="text-gray-500 text-sm">Bienvenido de nuevo al sistema de gestión mayorista.</p>
          </div>
          
          {activeTab === 'dashboard' ? <Dashboard /> : <Inventory />}
        </main>
      </div>

      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
