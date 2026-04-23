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

        let aiTextRaw = "";
        let success = false;

        // --- FUNCIÓN DE LLAMADA A IA CON REINTENTO (FAILOVER) ---
        const callAI = async (modelName) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ 
                            text: `Eres "Emssa Bot", el asistente experto de Calzado Emssa en Trujillo. 
                                   REGLA CRÍTICA: Tu respuesta debe estar entre <res> y </res>. 
                                   No uses comillas invertidas (\`) ni razonamientos técnicos.` 
                        }]
                    },
                    contents: [{ parts: [{ text: textMessage }] }]
                })
            });
            return await response.json();
        };

        // INTENTO 1: GEMMA 4
        try {
            console.log("[AI] Intentando con Gemma 4...");
            const dataGemma = await callAI("gemma-4-31b-it");
            if (dataGemma.candidates?.[0]?.content?.parts?.[0]?.text) {
                aiTextRaw = dataGemma.candidates[0].content.parts[0].text;
                success = true;
            } else if (dataGemma.error) {
                console.error("[AI] Error en Gemma 4:", dataGemma.error.message);
            }
        } catch (e) {
            console.error("[AI] Error crítico en llamada a Gemma:", e.message);
        }

        // INTENTO 2: GEMINI 2.5 FLASH (Si Gemma falló)
        if (!success) {
            try {
                console.log("[AI] Gemma falló. Intentando con Gemini 2.5 Flash...");
                const dataGemini = await callAI("gemini-2.5-flash");
                if (dataGemini.candidates?.[0]?.content?.parts?.[0]?.text) {
                    aiTextRaw = dataGemini.candidates[0].content.parts[0].text;
                    success = true;
                }
            } catch (e) {
                console.error("[AI] Error crítico en llamada a Gemini:", e.message);
            }
        }

        // --- LÓGICA DE LIMPIEZA REFORZADA ---
        let aiText = "";
        const match = aiTextRaw.match(/<res>([\s\S]*?)<\/res>/i);
        
        if (match) {
            aiText = match[1].trim();
        } else {
            // Si no encontró etiquetas, limpiamos basura común
            aiText = aiTextRaw.replace(/<res>|<\/res>/g, "").trim();
        }

        // ELIMINAR COMILLAS INVERTIDAS (Los backticks que salían en la captura)
        aiText = aiText.replace(/`/g, "").trim();

        // Si después de todo sigue saliendo "and" o algo muy corto, fallback
        if (!aiText || aiText.toLowerCase() === "and" || aiText.length < 2) {
            aiText = "¡Hola! Soy el asistente de Calzado Emssa. ¿En qué puedo ayudarte hoy?";
        }

        if (aiText) {
            await sendTextMessage(remoteJid, aiText);
        }

        return res.status(200).json({ status: 'success' });

    } catch (error) {
        console.error("WEBHOOK ERROR:", error.message);
        return res.status(200).json({ error: error.message });
    }
};
