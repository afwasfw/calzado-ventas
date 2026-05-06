import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('Active');

  try {
    const { message } = req.body;
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({ response: "Error: No se encontró la clave GOOGLE_AI_API_KEY." });
    }

    // --- COMANDO DE DIAGNÓSTICO ---
    if (message.toUpperCase() === "LISTAR MODELOS") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      const modelList = data.models?.map(m => m.name.replace('models/', '')).join(', ') || "No se pudo obtener la lista.";
      return res.status(200).json({ response: `Modelos disponibles: ${modelList}` });
    }

    // --- 1. OBTENER CONTEXTO DE NEGOCIO ---
    const [{ data: insumos }, { data: zapatos }] = await Promise.all([
      supabase.from('inventario_materiales').select('nombre, stock_actual, unidad_medida, stock_alerta'),
      supabase.from('productos_finales').select('codigo_modelo, nombre, color_fisico, stock_docenas')
    ]);

    const context = `
      Eres el asistente experto de Emssa Valems.
      DATOS REALES:
      Insumos: ${JSON.stringify(insumos?.slice(0,20))}
      Almacén: ${JSON.stringify(zapatos?.slice(0,20))}
    `;

    // --- 2. LLAMADA A GEMMA 4 (EL FUTURO) ---
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`;
    
    const resAI = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${context}\n\nPregunta: ${message}\nRespuesta profesional en español:` }] }]
      })
    });

    const dataAI = await resAI.json();

    if (dataAI.error) {
      return res.status(200).json({ response: `Error con Gemma 4: ${dataAI.error.message}. Intenta con 'LISTAR MODELOS'.` });
    }

    const aiText = dataAI.candidates?.[0]?.content?.parts?.[0]?.text || "No obtuve respuesta de Gemma 4.";

    return res.status(200).json({ response: aiText });

  } catch (error) {
    return res.status(200).json({ response: "Error crítico en el servidor." });
  }
}
