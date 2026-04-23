// api/whatsapp-webhook.js

const API_URL_RAILWAY = "https://evolution-api-production-b0d7.up.railway.app";
const API_KEY_RAILWAY = "Calzado2026";
const INSTANCE = "emssa";

// URL de Google AI Studio v1beta (Para 2026)
const GEMMA_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent";

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(200).send('Emssa Webhook v1beta Active');
    }

    try {
        const body = req.body;
        if (!body || !body.data) return res.status(200).send('No Body');

        const data = body.data;
        const key = data.key;
        const message = data.message;

        if (key?.fromMe || !message) return res.status(200).send('Ignored');

        const remoteJid = key.remoteJid;
        const pushName = body.data?.pushName || "Cliente";
        
        // Extraer texto
        const textMessage = message.conversation || 
                            message.extendedTextMessage?.text || 
                            message.imageMessage?.caption || "";

        if (!textMessage) return res.status(200).send('No Text');

        console.log(`[BOT] Pensando con Gemma 4 para: ${pushName}`);

        // --- LLAMADA DIRECTA A GEMMA 4 (v1beta) ---
        const aiResponseRaw = await fetch(`${GEMMA_API_URL}?key=${process.env.GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Eres "Emssa Bot", el asistente experto de "Calzado Emssa". 
                               Responde de forma profesional sobre fabricación de calzado, docenas y series.
                               Cliente dice: "${textMessage}"
                               Respuesta:`
                    }]
                }]
            })
        });

        const aiData = await aiResponseRaw.json();
        const aiResponse = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, estoy teniendo un problema técnico. Intenta de nuevo.";

        // --- ENVIAR A WHATSAPP ---
        const whatsappNumber = remoteJid.split('@')[0];
        
        await fetch(`${API_URL_RAILWAY}/message/sendText/${INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY_RAILWAY
            },
            body: JSON.stringify({
                number: whatsappNumber,
                text: aiResponse
            })
        });

        return res.status(200).json({ status: 'success', model: 'gemma-4-it' });

    } catch (error) {
        console.error("WEBHOOK ERROR:", error.message);
        return res.status(200).json({ error: error.message });
    }
};
