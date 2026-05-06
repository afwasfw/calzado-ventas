import { Webhook } from "standardwebhooks";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// IMPORTANTE: Desactivamos el bodyParser automático de Vercel para verificar la firma
export const config = {
  api: {
    bodyParser: false,
  },
};

// Función para obtener el cuerpo crudo de la petición
async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = await getRawBody(req);
    const headers = req.headers;
    const secret = process.env.GEMINI_WEBHOOK_SECRET;

    if (!secret) {
      console.error('Falta GEMINI_WEBHOOK_SECRET en las variables de entorno');
      return res.status(500).json({ error: 'Configuración incompleta' });
    }

    // 1. Verificar la firma de seguridad
    const wh = new Webhook(secret);
    let event;
    
    try {
      event = wh.verify(payload, headers);
      console.log('✅ Webhook verificado con éxito:', event.type);
    } catch (err) {
      console.error('❌ Error de verificación de firma:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // 2. Procesar el evento según el tipo
    const { type, data } = event;

    if (type === 'batch.succeeded') {
      console.log('🎊 ¡Tarea pesada terminada con éxito!', data.id);
      
      // Aquí podríamos guardar en Supabase que el reporte está listo
      await supabase.from('notificaciones_ai').insert([
        { 
          titulo: 'Reporte Inteligente Listo',
          mensaje: `La tarea ${data.id} ha finalizado correctamente.`,
          metadata: data,
          leido: false
        }
      ]);
    } 
    else if (type === 'batch.failed') {
      console.error('🛑 La tarea falló:', data.error_message);
    }

    // 3. Responder a Google que recibimos el mensaje (Importante para evitar reintentos)
    return res.status(200).json({ status: 'received' });

  } catch (error) {
    console.error('Internal Webhook Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
