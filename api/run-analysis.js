import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Lanzamos la generación con el webhook configurado
    // Nota: Usamos fetch puro porque el SDK nuevo a veces choca con el compilador de Vercel
    const payload = {
      contents: [{ role: 'user', parts: [{ text: promptAnalisis }] }],
      // Intentamos pasar la configuración del webhook (Google puede aceptarlo o ignorarlo según el tipo de LRO)
      generationConfig: {
        temperature: 0.2,
      }
    };

    // Hacer la petición asíncrona sin esperar a que termine para liberar Vercel
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async (res) => {
      const data = await res.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        // Guardar resultado directamente en Supabase si el webhook no entra
        const reporte = data.candidates[0].content.parts[0].text;
        await supabase.from('notificaciones_ai').insert([
          { 
            titulo: 'Análisis Maestro Completado',
            mensaje: reporte.substring(0, 200) + '...',
            metadata: { full_report: reporte },
            leido: false
          }
        ]);
      }
    }).catch(err => console.error("Error en proceso asíncrono:", err));

    // 3. Responder de inmediato al Dashboard
    return res.status(200).json({ 
      success: true, 
      message: "Análisis profundo iniciado. Cortex te avisará por las notificaciones cuando esté listo.",
      jobId: 'async-job'
    });

  } catch (error) {
    console.error('Error al iniciar análisis:', error);
    return res.status(500).json({ error: "No se pudo iniciar el análisis. Revisa los logs." });
  }
}
