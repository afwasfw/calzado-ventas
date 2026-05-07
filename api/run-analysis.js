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

    const promptAnalisis = `Eres un consultor experto en gestión de fábricas de calzado en Trujillo, Perú. Analiza los siguientes datos de la fábrica "Emssa Valems".

    DATOS DE INVENTARIO:
    ${JSON.stringify(insumos)}
    
    HISTORIAL DE KÁRDEX (Últimos movimientos):
    ${JSON.stringify(kardex)}
    
    ESTRUCTURA DEL REPORTE:
    1. RESUMEN EJECUTIVO (Máximo 2 párrafos).
    2. ALERTAS CRÍTICAS (Lista de materiales que faltan o sobran).
    3. RECOMENDACIONES DE COMPRA.
    4. ANOMALÍAS EN LOS DATOS (Errores de costos o registros).

    IMPORTANTE: Escribe en lenguaje natural, directo y profesional. No uses formato JSON ni bloques de código. Usa negritas para resaltar lo más importante.`;

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

    // Hacer la petición y ESPERAR para asegurar que Vercel no mate el proceso
    const resAI = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await resAI.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const reporte = data.candidates[0].content.parts[0].text;
      
      // Guardamos en Supabase y ESPERAMOS
      const { error: insertError } = await supabase.from('notificaciones_ai').insert([
        { 
          titulo: 'Análisis Maestro Completado',
          mensaje: reporte.substring(0, 250) + '...',
          metadata: { full_report: reporte },
          leido: false
        }
      ]);

      if (insertError) throw insertError;
    }

    // 3. Responder al Dashboard cuando TODO esté listo
    return res.status(200).json({ 
      success: true, 
      message: "¡Análisis completado! Revisa tus reportes recientes.",
      jobId: 'sync-job'
    });

  } catch (error) {
    console.error('Error al iniciar análisis:', error);
    return res.status(500).json({ error: "No se pudo iniciar el análisis. Revisa los logs." });
  }
}
