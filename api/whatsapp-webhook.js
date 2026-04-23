// api/whatsapp-webhook.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const API_URL = "https://evolution-api-production-b0d7.up.railway.app";
const API_KEY = "Calzado2026";
const INSTANCE = "emssa";

export default async function handler(req, res) {
    // 1. Solo POST
    if (req.method !== 'POST') {
        return res.status(200).send('Webhook is active (GET not allowed, use POST)');
    }

    try {
        const body = req.body;
        
        // 2. Verificación de estructura básica de Evolution v2
        if (!body || !body.data) {
            return res.status(200).json({ status: 'ignored', reason: 'empty_payload' });
        }

        const data = body.data;
        const key = data.key;
        const message = data.message;

        // 3. Ignorar si es de nosotros mismos o no tiene mensaje
        if (key?.fromMe || !message) {
            return res.status(200).json({ status: 'ignored', reason: 'from_me_or_no_message' });
        }

        const remoteJid = key.remoteJid;
        const pushName = body.data?.pushName || "Cliente";

        // 4. Extraer texto de forma segura
        const textMessage = message.conversation || 
                            message.extendedTextMessage?.text || 
                            message.imageMessage?.caption || 
                            "";

        if (!textMessage) {
            return res.status(200).json({ status: 'ignored', reason: 'no_text_content' });
        }

        console.log(`[BOT] Mensaje de ${pushName}: ${textMessage}`);

        // 5. Lógica de IA
        const prompt = `
            Eres "Emssa Bot", el asistente de "Calzado Emssa".
            Responde de forma amable y profesional. 
            Reglas: Hablamos por docenas y series. 
            Si preguntan stock, di que estás revisando.
            
            Cliente: ${textMessage}
            Respuesta:
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // 6. Enviar respuesta vía Evolution API
        const whatsappNumber = remoteJid.split('@')[0];
        
        await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                number: whatsappNumber,
                text: aiResponse
            })
        });

        console.log(`[BOT] Respuesta enviada a ${whatsappNumber}`);
        return res.status(200).json({ status: 'success' });

    } catch (error) {
        console.error("CRITICAL ERROR:", error.message);
        // Respondemos con 200 aunque falle para que Evolution no reintente infinitamente
        return res.status(200).json({ error: error.message });
    }
}
