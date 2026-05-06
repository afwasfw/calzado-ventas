import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Modelo optimizado para chat conversacional
const MODEL = 'gemini-2.0-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('Active');

  try {
    const { message, history = [] } = req.body;
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ response: "Error: Falta la clave GOOGLE_AI_API_KEY en las variables de entorno." });
    }

    // --- COMANDO DE DIAGNÓSTICO ---
    if (message?.toUpperCase() === "LISTAR MODELOS") {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const d = await r.json();
      const list = d.models?.map(m => m.name.replace('models/', '')).join(', ') || "Sin lista.";
      return res.status(200).json({ response: `Modelos disponibles: ${list}` });
    }

    // --- 1. DATOS REALES DE SUPABASE ---
    const [{ data: insumos }, { data: zapatos }, { data: kardex }] = await Promise.all([
      supabase.from('inventario_materiales').select('nombre, stock_actual, unidad_medida, stock_alerta').eq('activo', true),
      supabase.from('productos_finales').select('codigo_modelo, nombre, color_fisico, stock_docenas').eq('activo', true),
      supabase.from('auditoria_inventario').select('nombre_entidad, cantidad, motivo, created_at').order('created_at', { ascending: false }).limit(10)
    ]);

    // --- 2. INSTRUCCIÓN DEL SISTEMA (LIMPIA Y CLARA) ---
    const sistemaInstruccion = `Eres "Cortex", el asistente inteligente de la fábrica de calzado Emssa Valems en Trujillo, Perú.

INVENTARIO DE MATERIALES ACTUAL:
${JSON.stringify(insumos)}

ALMACÉN DE PRODUCTO TERMINADO:
${JSON.stringify(zapatos)}

ÚLTIMOS MOVIMIENTOS DEL KÁRDEX:
${JSON.stringify(kardex)}

NORMAS DE COMPORTAMIENTO:
- Habla siempre en español peruano, de forma directa y profesional.
- Responde SOLO con el mensaje final. Sin razonamientos, sin opciones, sin metadatos.
- Si detectas stock bajo (menor al stock_alerta), avísalo proactivamente.
- Usa los datos reales de arriba en tus respuestas.
- Sé conciso: máximo 3-4 oraciones salvo que se pida un reporte.`;

    // --- 3. CONSTRUCCIÓN DEL HISTORIAL DE CONVERSACIÓN ---
    const contents = [];
    
    // Añadir historial previo para que recuerde el contexto
    if (history && history.length > 0) {
      history.slice(-6).forEach(h => {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      });
    }

    // Añadir el mensaje actual del usuario
    contents.push({ role: 'user', parts: [{ text: message }] });

    // --- 4. LLAMADA A LA API CON ESTRUCTURA CORRECTA ---
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const resAI = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sistemaInstruccion }] },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 512,
          topP: 0.9
        }
      })
    });

    const dataAI = await resAI.json();

    // Manejo de errores de la API
    if (dataAI.error) {
      console.error('[Gemini Error]:', dataAI.error);
      return res.status(200).json({ response: `Error del modelo: ${dataAI.error.message}` });
    }

    const aiText = dataAI.candidates?.[0]?.content?.parts?.[0]?.text?.trim() 
      || "No pude procesar tu solicitud en este momento. ¿Podrías reformular tu pregunta?";

    return res.status(200).json({ response: aiText });

  } catch (error) {
    console.error('[AI-Assistant Critical Error]:', error);
    return res.status(200).json({ response: "Error interno del servidor. Por favor, intenta de nuevo." });
  }
}
