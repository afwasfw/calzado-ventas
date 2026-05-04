import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).send('Active');

  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Mensaje requerido' });

    // 1. OBTENER CONTEXTO REAL DE LA BASE DE DATOS
    const [{ data: insumos }, { data: zapatos }] = await Promise.all([
      supabase.from('inventario_materiales').select('nombre, stock_actual, unidad_medida, stock_alerta'),
      supabase.from('productos_finales').select('codigo_modelo, nombre, color_fisico, stock_docenas')
    ]);

    // 2. CONSTRUIR EL "MUNDO" DE LA IA
    const contextoNegocio = `
      CONTEXTO DE NEGOCIO:
      Empresa: Emssa Valems E.I.R.L (Fábrica de Calzado en Trujillo, Perú).
      Inventario de Insumos Actual: ${JSON.stringify(insumos)}
      Almacén de Producto Terminado: ${JSON.stringify(zapatos)}
      
      REGLAS:
      - Eres el Asistente Inteligente del Dashboard de Producción.
      - Responde de forma ejecutiva, precisa y amable.
      - Si detectas stock bajo o alertas, menciónalo.
      - Usa soles (S/) para moneda.
    `;

    // 3. LLAMADA A GOOGLE AI (Gemini 1.5 Flash - Alta velocidad y precisión)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
    
    const prompt = `
      ${contextoNegocio}
      
      HISTORIAL RECIENTE:
      ${history.map(h => `${h.role}: ${h.content}`).join('\n')}
      
      PREGUNTA DEL USUARIO: "${message}"
      
      RESPUESTA:
    `;

    const resAI = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const dataAI = await resAI.json();
    const aiText = dataAI.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, tuve un problema analizando los datos. ¿Puedes repetir la pregunta?";

    return res.status(200).json({ response: aiText });

  } catch (error) {
    console.error("[AI-Assistant Error]:", error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
