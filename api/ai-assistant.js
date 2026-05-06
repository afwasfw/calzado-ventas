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

    // --- COMANDO SECRETO PARA LISTAR MODELOS ---
    if (message.toUpperCase() === "LISTAR MODELOS") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const modelList = data.models?.map(m => m.name.replace('models/', '')).join(', ') || "No se pudo obtener la lista.";
      return res.status(200).json({ response: `Modelos disponibles para tu clave: ${modelList}` });
    }

    // --- LÓGICA NORMAL ---
    const [{ data: insumos }, { data: zapatos }] = await Promise.all([
      supabase.from('inventario_materiales').select('nombre, stock_actual'),
      supabase.from('productos_finales').select('codigo_modelo, stock_docenas')
    ]);

    const context = `Empresa: Emssa Valems. Insumos: ${JSON.stringify(insumos?.slice(0,5))}. Zapatos: ${JSON.stringify(zapatos?.slice(0,5))}`;

    // Intentamos con Gemini 1.5 Flash primero, que es el estándar
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${context}\n\nPregunta: ${message}` }] }]
      })
    });
    
    const result = await response.json();

    if (result.error) {
      return res.status(200).json({ response: `Error de Google: ${result.error.message}. Escribe 'LISTAR MODELOS' para ver cuáles puedes usar.` });
    }

    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta del modelo.";
    return res.status(200).json({ response: aiText });

  } catch (error) {
    return res.status(200).json({ response: "Error crítico en el servidor." });
  }
}
