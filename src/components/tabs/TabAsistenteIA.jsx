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
  ChevronRight,
  FileText,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const scrollRef = useRef(null);

  // Cargar notificaciones iniciales
  useEffect(() => {
    fetchNotifications();
    
    // Suscribirse a cambios en tiempo real en las notificaciones
    const channel = supabase
      .channel('notificaciones_ai_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones_ai' }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
        toast.success('¡Nuevo reporte de IA disponible!');
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notificaciones_ai')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setNotifications(data);
  };

  const handleStartDeepAnalysis = async () => {
    setIsAnalyzing(true);
    toast.loading('Iniciando análisis profundo...', { id: 'analysis' });
    
    try {
      const response = await fetch('/api/run-analysis', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message, { id: 'analysis', duration: 5000 });
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error('Error al lanzar análisis:', err);
      toast.error('No se pudo iniciar el análisis. Revisa tu conexión.', { id: 'analysis' });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
              
              <div className="pt-2">
                <button 
                  onClick={handleStartDeepAnalysis}
                  disabled={isAnalyzing}
                  className="w-full flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 border border-brand-gold/30 hover:border-brand-gold hover:bg-brand-gold/20 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] skew-x-12"></div>
                  <div className="p-2 bg-brand-gold text-black rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                    {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black text-white uppercase tracking-tighter">Lanzar Análisis Maestro</p>
                    <p className="text-[9px] text-brand-gold/70 font-bold uppercase tracking-widest">Procesamiento Asíncrono</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#161616] border border-[#222] rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="w-3 h-3 text-brand-gold" /> Reportes de IA Recientes
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-20 text-center p-4">
                  <Clock className="w-8 h-8 mb-2" />
                  <p className="text-[10px] font-bold uppercase">No hay reportes aún</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button 
                    key={n.id} 
                    onClick={() => setSelectedReport(n)}
                    className="w-full text-left p-3 bg-black/40 border border-[#222] rounded-xl hover:border-brand-gold/40 hover:bg-brand-gold/5 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-green-500/20 text-green-500 rounded-lg group-hover:bg-brand-gold/20 group-hover:text-brand-gold transition-colors">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-white font-bold mb-1 group-hover:text-brand-gold transition-colors">{n.titulo}</p>
                        <p className="text-[11px] text-gray-500 leading-tight line-clamp-2">{n.mensaje}</p>
                        <p className="text-[8px] text-gray-700 mt-2 font-mono uppercase">
                          {new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* MODAL PARA VER REPORTE COMPLETO */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedReport(null)}></div>
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#111] border border-[#222] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-zoom-in">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-[#222] bg-[#161616]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-none mb-1">{selectedReport.titulo}</h3>
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                    Generado el {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {selectedReport.metadata?.full_report || selectedReport.mensaje}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-[#222] bg-[#0c0c0c] flex justify-end">
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2 bg-[#222] hover:bg-[#333] text-white text-sm font-bold rounded-xl transition-all"
              >
                Cerrar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
