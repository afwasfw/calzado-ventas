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

        // Llamada a la IA con instrucciones estrictas para que no muestre el razonamiento interno
        const aiResponseRaw = await fetch(`${AI_URL}?key=${process.env.GOOGLE_AI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Eres "Emssa Bot", el asistente de Calzado Emssa. 
                               REGLA CRÍTICA: Responde ÚNICAMENTE con el mensaje final para el cliente. 
                               No muestres tu razonamiento, no muestres borradores, ni explicaciones de tu proceso.
                               Sé profesional, amable y experto en calzado.
                               
                               Cliente dice: "${textMessage}"
                               Respuesta final para el cliente:`
                    }]
                }]
            })
        });


        const aiData = await aiResponseRaw.json();
        
        // Extraemos el texto crudo de la respuesta
        let aiText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        console.log("[AI Raw Response]:", aiText);

        // --- LÓGICA DE LIMPIEZA PARA GEMMA 4 ---
        // Si la IA mandó opciones, intentamos quedarnos con la "Option 3" o la que diga "(Good)" o "(Balanced)"
        const optionMatch = aiText.match(/\* Option 3 \(Balanced\): ([\s\S]*?)(\(Good\)\.|(?=\*)|$)/i) || 
                            aiText.match(/\* Option \d.*?: ([\s\S]*?)(\((Good|Balanced)\)\.|(?=\*)|$)/i);

        if (optionMatch && optionMatch[1]) {
            aiText = optionMatch[1].trim();
        } else {
            // Si no hay opciones pero hay una lista de "Role", "Constraint", etc., limpiamos el encabezado
            aiText = aiText.replace(/^\*[\s\S]*?Respuesta final para el cliente:/i, "").trim();
            // Eliminamos asteriscos iniciales de la respuesta final si existen
            aiText = aiText.replace(/^\* /gm, "").trim();
        }
        
        // Si después de limpiar quedó vacío o algo falló, usamos el texto original pero quitando los asteriscos de las listas
        if (!aiText) {
            aiText = "¡Hola! ¿En qué puedo ayudarte hoy con tu calzado?";
        }

        // Si hay error de Google, lo imprimimos en logs para debuguear
        if (aiData.error) {
            console.error("GOOGLE AI ERROR:", aiData.error.message);
            throw new Error(aiData.error.message);
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
