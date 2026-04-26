// api/whatsapp-webhook.js

// --- CONFIGURACIÓN DESDE VARIABLES DE ENTORNO (PRO) ---
const API_URL_RAILWAY = process.env.API_URL_RAILWAY || "https://evolution-api-production-b0d7.up.railway.app";
const API_KEY_RAILWAY = process.env.API_KEY_RAILWAY || "Calzado2026";
const INSTANCE = process.env.INSTANCE || "emssa";
const ALLOWED_NUMBERS = (process.env.ALLOWED_NUMBERS || "51941332536").split(",");

// Función para enviar mensajes a WhatsApp vía Evolution API
async function sendTextMessage(remoteJid, text) {
    const whatsappNumber = remoteJid.split('@')[0];
    try {
        const response = await fetch(`${API_URL_RAILWAY}/message/sendText/${INSTANCE}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'apikey': API_KEY_RAILWAY 
            },
            body: JSON.stringify({ number: whatsappNumber, text: text })
        });
        
        if (response.ok) {
            console.log(`[WhatsApp] Mensaje enviado a: ${whatsappNumber}`);
        } else {
            const err = await response.json();
            console.error(`[WhatsApp] Error Railway:`, err);
        }
    } catch (error) {
        console.error("[WhatsApp] Error de red:", error.message);
    }
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(200).send('Active');

    try {
        const body = req.body;
        const data = body?.data;
        if (!data || !data.message) return res.status(200).send('Ignored: No Message');

        // --- FILTRO DE SEGURIDAD ---
        const remoteJid = data?.key?.remoteJid || "";
        const isGroup = remoteJid.endsWith('@g.us');
        const senderNumber = remoteJid.split('@')[0];

        if (data?.key?.fromMe) return res.status(200).send('Ignored: From Me');
        
        if (isGroup) return res.status(200).send('Ignored: Group');

        if (!ALLOWED_NUMBERS.includes(senderNumber)) {
            console.log(`[Security] Bloqueado: ${senderNumber}`);
            return res.status(200).send('Ignored: Unauthorized');
        }

        const pushName = data.pushName || "Cliente";
        let textMessage = data.message.conversation || data.message.extendedTextMessage?.text || "";
        const isAudio = !!data.message.audioMessage;

        // --- FUNCIÓN PARA DESCARGAR MEDIOS (AUDIO) VÍA EVOLUTION API ---
        const downloadMedia = async (webhookData) => {
            try {
                if (webhookData.message?.base64) return webhookData.message.base64;
                const response = await fetch(`${API_URL_RAILWAY}/chat/getBase64FromMediaMessage/${INSTANCE}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': API_KEY_RAILWAY },
                    body: JSON.stringify({ message: webhookData })
                });
                const result = await response.json();
                return result.base64 || null;
            } catch (e) {
                console.error("[Audio] Error obteniendo base64:", e.message);
                return null;
            }
        };

        // --- FUNCIÓN DE LLAMADA A IA (Soporta Texto y Audio) ---
        const callAI = async (modelName, userMessage, base64Audio = null) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
            const parts = [];
            if (base64Audio) {
                parts.push({ inlineData: { mimeType: "audio/ogg;codecs=opus", data: base64Audio } });
                parts.push({ text: userMessage }); 
            } else {
                parts.push({ 
                    text: `Eres "Emssa Bot", el asistente experto de Calzado Emssa en Trujillo. 
                           Responde amablemente y encierra tu mensaje entre <res> y </res>.
                           Cliente dice: "${userMessage}"
                           Respuesta:` 
                });
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: parts }],
                    generationConfig: { temperature: 0.7 }
                })
            });
            return await response.json();
        };

        let aiTextRaw = "";
        let success = false;

        // --- PROCESAMIENTO DE AUDIO (NIVEL 1) ---
        if (isAudio) {
            try {
                console.log(`[Audio] Transcribiendo con GEMINI 2.5 FLASH (Nivel 1)...`);
                const base64 = await downloadMedia(data);
                if (base64) {
                    const promptTrans = "ACTÚA COMO UN TRANSCRIPTOR MECÁNICO ESTRICTO. Escribe exactamente lo que escuchas en español. Solo texto plano, sin formato.";
                    const dataTrans = await callAI("gemini-2.5-flash", promptTrans, base64);
                    const transcription = dataTrans.candidates?.[0]?.content?.parts?.[0]?.text;
                    
                    if (transcription && transcription.length > 2) {
                        textMessage = transcription;
                    }
                }
            } catch (e) {
                console.error("[Audio] Error en Nivel 1:", e.message);
            }
        }

        if (!textMessage) return res.status(200).send('No Content');

        // --- CEREBRO: GEMMA 3 27B (Modelo Premium) ---
        try {
            console.log("[AI] Generando respuesta con Gemma 3 27B...");
            const dataGemma = await callAI("gemma-3-27b-it", textMessage);
            if (dataGemma.candidates?.[0]?.content?.parts?.[0]?.text) {
                aiTextRaw = dataGemma.candidates[0].content.parts[0].text;
                success = true;
            }
        } catch (e) {
            console.error("[AI] Error en Gemma 3:", e.message);
        }

        // --- RESPALDO: GEMINI 2.5 FLASH ---
        if (!success) {
            try {
                console.log("[AI] Usando Respaldo: Gemini 2.5 Flash...");
                const dataFlash = await callAI("gemini-2.5-flash", textMessage);
                if (dataFlash.candidates?.[0]?.content?.parts?.[0]?.text) {
                    aiTextRaw = dataFlash.candidates[0].content.parts[0].text;
                    success = true;
                }
            } catch (e) {
                console.error("[AI] Error en Gemini 2.5:", e.message);
            }
        }

        // --- LIMPIEZA Y ENVÍO ---
        let aiText = aiTextRaw.match(/<res>([\s\S]*?)<\/res>/i)?.[1]?.trim() || aiTextRaw.replace(/<res>|<\/res>/gi, "").trim();
        aiText = aiText.replace(/`/g, "").trim();

        if (aiText && aiText.length > 2) {
            await sendTextMessage(remoteJid, aiText);
        }

        return res.status(200).json({ status: 'success' });

    } catch (error) {
        console.error("WEBHOOK ERROR:", error.message);
        return res.status(200).send('Error');
    }
};
