import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    // 1. Obtener datos masivos para el análisis
    const [{ data: insumos }, { data: kardex }] = await Promise.all([
      supabase.from('inventario_materiales').select('*'),
      supabase.from('auditoria_inventario').select('*').order('created_at', { ascending: false }).limit(100)
    ]);

    const promptAnalisis = `Analiza profundamente el estado de la fábrica de calzado Emssa Valems.
    
    DATOS DE INVENTARIO:
    ${JSON.stringify(insumos)}
    
    HISTORIAL DE KÁRDEX (Últimos 100 movimientos):
    ${JSON.stringify(kardex)}
    
    INSTRUCCIONES:
    - Identifica materiales estancados o con stock crítico.
    - Analiza tendencias de uso en el kárdex.
    - Genera un reporte ejecutivo con recomendaciones de compra y alertas de desperdicio.
    - Habla como un consultor experto en calzado de Trujillo.
    - Responde en formato profesional para ser guardado en base de datos.`;

    // 2. Configurar la llamada asíncrona con el Webhook dinámico
    // Nota: Usamos el ID del proyecto y el webhook que registramos
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Lanzamos la generación con el webhook configurado
    // Según la documentación, esto permite que Google nos avise al terminar
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promptAnalisis }] }],
      config: {
        webhookConfig: {
          uris: ["https://calzado-ventas.vercel.app/api/gemini-webhook"],
          userMetadata: { type: "reporte_profundo", source: "dashboard_manual" }
        }
      }
    });

    // 3. Responder de inmediato al Dashboard
    return res.status(200).json({ 
      success: true, 
      message: "Análisis profundo iniciado en segundo plano. Cortex te avisará por las notificaciones cuando el reporte esté listo.",
      jobId: result.response?.id || 'pending'
    });

  } catch (error) {
    console.error('Error al iniciar análisis:', error);
    return res.status(500).json({ error: "No se pudo iniciar el análisis. Revisa los logs." });
  }
}
