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

    const systemContext = `
Eres el asistente virtual experto de la fábrica de calzado Emssa Valems en Trujillo.

REGLAS DE ORO (OBLIGATORIAS):
1. RESPONDE ÚNICA Y EXCLUSIVAMENTE CON EL MENSAJE FINAL QUE LEERÁ EL USUARIO.
2. NUNCA escribas tus pensamientos internos, ni "Option 1", ni "Role:", ni "Goal:".
3. NO des opciones múltiples, elige tú la mejor respuesta y entrégala directamente.
4. Sé amable, profesional, directo y conversacional.

DATOS EN TIEMPO REAL:
- Insumos: ${JSON.stringify(insumos?.slice(0,15))}
- Productos: ${JSON.stringify(zapatos?.slice(0,15))}
    `;

    // --- 2. LLAMADA A GEMMA 4 (CON ESTRUCTURA DE ROLES OFICIAL) ---
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent?key=${apiKey}`;
    
    const resAI = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemContext }]
        },
        contents: [
          { role: "user", parts: [{ text: message }] }
        ]
      })
    });

    const dataAI = await resAI.json();
    let aiText = dataAI.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta. ¿Podrías intentar de nuevo?";

    // Limpieza extrema por si el modelo ignora la estructura
    if (aiText.includes("Option 3")) {
       const parts = aiText.split(/Option 3[^:]*:/);
       if (parts.length > 1) aiText = parts[1];
    }
    aiText = aiText.replace(/\*.*?\*/g, "").replace(/Role:[\s\S]*?Goal:/gi, "").trim();

    return res.status(200).json({ response: aiText });

  } catch (error) {
    return res.status(200).json({ response: "Error crítico en el servidor." });
  }
}
