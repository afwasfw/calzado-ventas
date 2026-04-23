// api/whatsapp-webhook.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuración Global
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });






const API_URL = "https://evolution-api-production-b0d7.up.railway.app";
const API_KEY = "Calzado2026";
const INSTANCE = "emssa";

module.exports = async (req, res) => {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(200).send('Emssa Webhook is Active');
    }

    try {
        const body = req.body;
        if (!body || !body.data) return res.status(200).send('Empty Body');

        const data = body.data;
        if (data.key?.fromMe) return res.status(200).send('From Me');

        const remoteJid = data.key?.remoteJid;
        const pushName = data.pushName || "Cliente";
        const message = data.message;

        if (!remoteJid || !message) return res.status(200).send('No message info');

        // Extraer texto
        const textMessage = message.conversation || 
                            message.extendedTextMessage?.text || 
                            message.imageMessage?.caption || "";

        if (!textMessage) return res.status(200).send('No text');

        // IA
        const prompt = `Eres Emssa Bot de Calzado Emssa. Responde breve y profesional. Cliente: ${textMessage}`;
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // Enviar WhatsApp (Usando https nativo de Node por si acaso fetch falla)
        const whatsappNumber = remoteJid.split('@')[0];
        
        const response = await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
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

        return res.status(200).json({ status: 'success', sent_to: whatsappNumber });

    } catch (error) {
        console.error("WEBHOOK ERROR:", error.message);
        return res.status(500).json({ error: error.message });
    }
};
