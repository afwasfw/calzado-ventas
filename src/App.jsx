import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import DashboardLayout from './components/DashboardLayout';

import { Toaster } from 'react-hot-toast';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [session, setSession] = useState(null);
  
  // Posición del cursor para el brillo (Linterna magica)
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });

  // 1. Manejo del Tema Oscuro (Estético)
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // 2. Verificar si ya hay una sesión iniciada al cargar la página
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 3. Función real de Login con Supabase
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('Credenciales incorrectas. Verifique e intente nuevamente.');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // ==========================================
  // PANTALLA 1: DASHBOARD (Si está logueado)
  // ==========================================
  if (session) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #333' } }} />
        <DashboardLayout session={session} handleLogout={handleLogout} />
      </>
    );
  }

  // ==========================================
  // PANTALLA 2: LOGIN (Si NO está logueado)
  // ==========================================
  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#fafafa] dark:bg-[#151515]"
    >
      {/* 1. EL FONDO - MALLA DE PUNTOS LUXURY */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#D4B271_1px,transparent_0.5px)] dark:bg-[radial-gradient(#D4B271_1px,transparent_0.5px)] opacity-30 dark:opacity-20 [background-size:24px_24px]"></div>
      </div>

      {/* 2. LINTERNA DE CURSOR DORADA */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-300">
        <div
          className="absolute w-[400px] h-[400px] bg-brand-gold/20 dark:bg-brand-gold/15 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out will-change-transform"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`
          }}
        />
      </div>

      {/* 3. LA TARJETA DE LOGIN */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/80 dark:bg-[#1a1a1a]/90 backdrop-blur-3xl border border-brand-gold/20 dark:border-brand-gold/10 shadow-2xl rounded-2xl p-10 mb-8 relative overflow-hidden">
          
          <div className="absolute inset-0 bg-brand-peach/5 dark:bg-brand-gold/5 pointer-events-none rounded-2xl"></div>

          <div className="flex flex-col items-center justify-center mb-10 relative pointer-events-none">
            {/* Logo  (w-36) */}
            <img
              src="/logo_base.png"
              alt="Logo Emssa Valems"
              className="w-36 h-auto object-contain mb-4 drop-shadow-[0_10px_15px_rgba(212,178,113,0.2)] dark:drop-shadow-[0_10px_15px_rgba(212,178,113,0.1)] transition-transform duration-500 hover:scale-105"
            />
            <h1 className="text-3xl font-serif font-semibold text-brand-black dark:text-white tracking-widest uppercase mt-2 text-center">
              Emssa Valems
            </h1>
            <div className="w-16 h-[1px] bg-brand-gold my-2 hidden dark:block opacity-50"></div>
            <p className="text-brand-gold text-xs font-serif font-medium tracking-[0.3em] uppercase mt-1 text-center">
              For You Woman
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-6 relative">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400 dark:text-brand-gold/70" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-800 py-3 text-brand-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold dark:focus:border-brand-gold transition-colors font-medium text-sm"
                  placeholder="Correo corporativo"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400 dark:text-brand-gold/70" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 w-full bg-transparent border-b-2 border-gray-200 dark:border-gray-800 py-3 text-brand-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold dark:focus:border-brand-gold transition-colors font-medium text-sm"
                  placeholder="Contraseña reservada"
                  required
                />
              </div>
            </div>

            {/* Mensaje de Error */}
            {errorMsg && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium p-3 rounded border border-red-200 dark:border-red-800/30 text-center animate-pulse">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-10 w-full flex items-center justify-center gap-3 bg-brand-black dark:bg-brand-gold hover:bg-gray-800 dark:hover:bg-[#c2a15c] disabled:opacity-70 text-white dark:text-black font-semibold tracking-wide uppercase text-sm py-4 rounded shadow-lg transition-transform active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  Acceder al Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer Minimalista */}
        <p className="text-center text-xs font-serif tracking-widest text-[#a8a8a8] dark:text-gray-500 uppercase">
          Portal de Moda Industrial
        </p>
      </div>
    </div>
  );
}

export default App;
