import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles, 
  BrainCircuit, 
  Database,
  TrendingUp,
  AlertTriangle,
  Zap,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TabAsistenteIA() {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: '¡Hola Diego! Soy el Núcleo IA de Emssa Valems. Tengo acceso a tu Kárdex, Inventario y Fichas Técnicas. ¿Qué reporte o análisis necesitas hoy?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { 
      role: 'user', 
      content: input, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // --- LLAMADA REAL A LA API DEL ASISTENTE ---
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      if (data.response) {
        const assistantMsg = { 
          role: 'assistant', 
          content: data.response, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('Sin respuesta');
      }
    } catch (err) {
      console.error('Error IA:', err);
      const errorMsg = { 
        role: 'assistant', 
        content: 'Lo siento, tuve un problema de conexión con mi núcleo de inteligencia. ¿Podrías intentar de nuevo?', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col p-4 md:p-6 animate-fade-in">
      
      {/* HEADER TIPO CORTEX */}
      <div className="flex items-center justify-between mb-6 bg-[#161616]/50 backdrop-blur-md p-4 rounded-2xl border border-[#222] shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-brand-gold rounded-xl text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-[#161616] rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-none mb-1">Cortex IA <span className="text-[10px] bg-brand-gold/10 text-brand-gold px-2 py-0.5 rounded ml-2 border border-brand-gold/20 uppercase tracking-widest font-black">v2.0</span></h2>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Conectado al Almacén Central</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <div className="text-right">
            <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Estado de Datos</p>
            <div className="flex items-center gap-2 text-xs text-white font-mono">
              <Database className="w-3 h-3 text-brand-gold" />
              SINCRO OK
            </div>
          </div>
          <div className="h-8 w-[1px] bg-[#222]"></div>
          <div className="text-right">
            <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Capacidad de Análisis</p>
            <div className="flex items-center gap-2 text-xs text-brand-gold font-mono">
              <Zap className="w-3 h-3 fill-brand-gold" />
              100% LISTO
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        
        {/* CHAT CONTAINER PRINCIPAL */}
        <div className="flex-1 flex flex-col bg-[#111] rounded-3xl border border-[#222] overflow-hidden shadow-2xl relative">
          
          {/* AREA DE MENSAJES */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/5 via-transparent to-transparent"
          >
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div className={`flex gap-4 max-w-[90%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transition-transform hover:scale-110 ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-brand-gold to-[#c2a15c] text-black' 
                      : 'bg-[#1a1a1a] text-brand-gold border border-[#333]'
                  }`}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-lg ${
                      msg.role === 'user' 
                        ? 'bg-white/5 text-gray-200 border border-white/10 rounded-tr-none' 
                        : 'bg-[#1a1a1a] text-gray-200 border border-[#222] rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-gray-600 mt-2 font-mono uppercase tracking-widest font-bold">{msg.time}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-4 items-center bg-[#1a1a1a]/50 px-6 py-3 rounded-full border border-brand-gold/20 animate-pulse shadow-lg">
                  <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Anclando datos de producción...</span>
                </div>
              </div>
            )}
          </div>

          {/* INPUT MODERNO */}
          <div className="p-6 bg-[#0c0c0c] border-t border-[#222]">
            <form 
              onSubmit={handleSendMessage}
              className="relative flex items-center group"
            >
              <div className="absolute left-4 p-2 text-gray-600 group-focus-within:text-brand-gold transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe una consulta (ej: 'Resumen de stock crítico' o 'Costo del lote LOT-DEMO')..."
                className="w-full bg-[#161616] border border-[#333] text-white rounded-2xl py-5 pl-14 pr-16 focus:outline-none focus:border-brand-gold/50 transition-all text-sm placeholder:text-gray-600 shadow-inner"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-3 p-3 bg-brand-gold text-black rounded-xl hover:bg-white transition-all disabled:opacity-30 active:scale-95 shadow-lg flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="flex justify-center gap-6 mt-4 opacity-50">
               <span className="text-[8px] text-gray-600 font-bold uppercase tracking-[.2em]">End-to-End Encryption</span>
               <span className="text-[8px] text-gray-600 font-bold uppercase tracking-[.2em]">Real-time Database Sync</span>
            </div>
          </div>
        </div>

        {/* SIDEBAR DE ANALISIS RAPIDO (Desktop) */}
        <div className="hidden xl:flex w-80 flex-col gap-4">
          
          <div className="bg-[#161616] border border-[#222] rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="w-20 h-20 text-brand-gold" />
            </div>
            <h3 className="text-brand-gold text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <Zap className="w-3 h-3 fill-brand-gold" /> Accesos Rápidos
            </h3>
            <div className="space-y-3 relative z-10">
              {[
                "¿Qué materiales se agotan?",
                "Análisis de costos lote actual",
                "Modelos sin stock físico",
                "Reporte de pedidos listos"
              ].map((sug, i) => (
                <button 
                  key={i}
                  onClick={() => setInput(sug)}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-black/40 border border-[#222] hover:border-brand-gold/40 hover:bg-brand-gold/5 text-[11px] text-gray-400 hover:text-white transition-all group"
                >
                  {sug}
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-b from-[#161616] to-[#0c0c0c] border border-[#222] rounded-3xl p-6 shadow-2xl">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-brand-gold" /> Alertas Predictivas
            </h3>
            <div className="space-y-4">
               <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <p className="text-[10px] text-red-400 font-bold mb-1 leading-none uppercase">Crítico: Cuero</p>
                  <p className="text-[11px] text-gray-500 leading-tight">Quedan menos de 100m. Reabastecer antes del viernes.</p>
               </div>
               <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                  <p className="text-[10px] text-green-400 font-bold mb-1 leading-none uppercase">Producción OK</p>
                  <p className="text-[11px] text-gray-500 leading-tight">Eficiencia de materiales +5% vs mes anterior.</p>
               </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
