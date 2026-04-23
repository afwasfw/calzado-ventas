// api/whatsapp-webhook.js

const API_URL_RAILWAY = "https://evolution-api-production-b0d7.up.railway.app";
const API_KEY_RAILWAY = "Calzado2026";
const INSTANCE = "emssa";

// URL de Google AI Studio v1beta - ¡POR FIN ACTIVANDO GEMMA 4 31B IT!
const AI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-4-31b-it:generateContent";



module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(200).send('Active');

    try {
        const body = req.body;
        const data = body?.data;
        if (!data || data.key?.fromMe || !data.message) return res.status(200).send('Ignored');

        const remoteJid = data.key.remoteJid;
        const pushName = data.pushName || "Cliente";
        const textMessage = data.message.conversation || data.message.extendedTextMessage?.text || "";

        if (!textMessage) return res.status(200).send('No Text');

        console.log(`[AI] Procesando mensaje de ${pushName}`);

        // Llamada a la IA con instrucciones de etiquetas delimitadoras y EJEMPLO
        const aiResponseRaw = await fetch(`${AI_URL}?key=${process.env.GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Eres "Emssa Bot", el asistente experto de Calzado Emssa. 
                               INSTRUCCIÓN: Puedes razonar internamente sobre la mejor respuesta, pero el mensaje que enviaremos al cliente DEBE estar encerrado entre <res> y </res>.
                               
                               EJEMPLO:
                               Razonamiento: El cliente quiere saber el precio. Buscaré en la lista.
                               <res>Hola! El precio de las botas es de $50.</res>

                               Cliente dice: "${textMessage}"
                               Respuesta:`
                    }]
                }]
            })
        });

        const aiData = await aiResponseRaw.json();
        
        // Extraemos el texto crudo de la respuesta
        let aiTextRaw = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log("[AI Raw Response]:", aiTextRaw);

        // --- NUEVA LÓGICA DE LIMPIEZA POR ETIQUETAS ---
        const match = aiTextRaw.match(/<res>([\s\S]*?)<\/res>/i);
        let aiText = match ? match[1].trim() : "";

        // Si la IA no cerró la etiqueta o algo falló, intentamos una limpieza manual
        if (!aiText && aiTextRaw.includes("<res>")) {
            aiText = aiTextRaw.split("<res>").pop().split("</res>")[0].trim();
        }
        
        // Mensaje de respaldo si todo falla
        if (!aiText || aiText.length < 2) {
            aiText = "¡Hola! Soy el asistente de Calzado Emssa. ¿En qué puedo ayudarte hoy?";
        }

        // Si hay error de Google en la data
        if (aiData.error) {
            console.error("GOOGLE AI ERROR:", aiData.error.message);
            return res.status(200).send("AI Error");
        }

        // Enviar a WhatsApp
        const whatsappNumber = remoteJid.split('@')[0];
        await fetch(`${API_URL_RAILWAY}/message/sendText/${INSTANCE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': API_KEY_RAILWAY },
            body: JSON.stringify({ number: whatsappNumber, text: aiText })
        });

        return res.status(200).json({ status: 'success' });

    } catch (error) {
        console.error("WEBHOOK ERROR:", error.message);
        return res.status(200).json({ error: error.message });
    }
};
