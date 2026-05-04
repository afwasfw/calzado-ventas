import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('Active');

  try {
    const { message, history = [] } = req.body;
    
    // VALIDACIÓN DE API KEY
    if (!process.env.GOOGLE_AI_API_KEY) {
      return res.status(200).json({ response: "Error: No se encontró la clave 'GOOGLE_AI_API_KEY' en las variables de entorno de Vercel." });
    }

    // 1. OBTENER CONTEXTO
    const [{ data: insumos }, { data: zapatos }] = await Promise.all([
      supabase.from('inventario_materiales').select('nombre, stock_actual, unidad_medida, stock_alerta'),
      supabase.from('productos_finales').select('codigo_modelo, nombre, color_fisico, stock_docenas')
    ]);

    const contextoNegocio = `
      Eres el asistente experto de Emssa Valems (Trujillo).
      Inventario: ${JSON.stringify(insumos?.slice(0,10))}
      Productos: ${JSON.stringify(zapatos?.slice(0,10))}
    `;

    // 2. LLAMADA A GOOGLE AI (Usando Gemini 1.5 Flash que es el más compatible)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
    
    const resAI = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${contextoNegocio}\n\nPregunta: ${message}` }] }]
      })
    });

    const dataAI = await resAI.json();
    
    // LOG PARA DEPURACIÓN (Aparecerá en tus logs de Vercel)
    console.log("Respuesta de Google AI:", JSON.stringify(dataAI));

    if (dataAI.error) {
      return res.status(200).json({ response: `Error de Google AI: ${dataAI.error.message}` });
    }

    const aiText = dataAI.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta. Por favor, intenta con otra pregunta.";

    return res.status(200).json({ response: aiText });

  } catch (error) {
    console.error("[AI-Assistant Error]:", error);
    return res.status(200).json({ response: "Error interno al procesar la solicitud." });
  }
}
