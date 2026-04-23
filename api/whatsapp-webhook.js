// api/whatsapp-webhook.js

const API_URL_RAILWAY = "https://evolution-api-production-b0d7.up.railway.app";
const API_KEY_RAILWAY = "Calzado2026";
const INSTANCE = "emssa";

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
        
        const data = await response.json();
        console.log(`[WhatsApp] Respuesta de Railway:`, JSON.stringify(data));
        
        if (response.ok) {
            console.log(`[WhatsApp] Mensaje aceptado por API para: ${whatsappNumber}`);
        } else {
            console.error(`[WhatsApp] Error en API Railway:`, data);
        }
    } catch (error) {
        console.error("[WhatsApp] Error de red enviando mensaje:", error.message);
    }
}

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
        
        // Detectamos si es texto o audio
        let textMessage = data.message.conversation || data.message.extendedTextMessage?.text || "";
        const isAudio = !!data.message.audioMessage;
        let audioUrl = "";

        if (isAudio) {
            console.log(`[Audio] Recibido mensaje de voz de ${pushName}`);
            await sendTextMessage(remoteJid, "¡He recibido tu audio! Dame un momento para escucharlo... 🎧");
            
            // Intentamos capturar el base64 directamente si viene en el webhook
            // Evolution API puede enviar el base64 en 'data' o 'base64'
            const audioData = data.message.audioMessage;
            audioUrl = audioData.url || "";
            // Si el audio viene como base64 directo, lo usamos
            const rawBase64 = audioData.base64 || audioData.data || "";
            if (rawBase64) {
                console.log("[Audio] Base64 detectado directamente en el mensaje.");
                audioUrl = "base64://" + rawBase64; // Marcador interno
            }
        }

        if (!textMessage && !isAudio) return res.status(200).send('No Content');

        console.log(`[AI] Procesando mensaje de ${pushName}`);

        let aiTextRaw = "";
        let success = false;

        // --- FUNCIÓN PARA DESCARGAR MEDIOS (AUDIO) ---
        const downloadMedia = async (url) => {
            try {
                if (url.startsWith("base64://")) {
                    return url.replace("base64://", "");
                }
                const response = await fetch(url, { headers: { 'apikey': API_KEY_RAILWAY } });
                const arrayBuffer = await response.arrayBuffer();
                return Buffer.from(arrayBuffer).toString('base64');
            } catch (e) {
                console.error("[Audio] Error descargando medio:", e.message);
                return null;
            }
        };

        // --- FUNCIÓN DE LLAMADA A IA (Soporta Texto y Audio) ---
        const callAI = async (modelName, userMessage, base64Audio = null) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
            
            const parts = [];
            if (base64Audio) {
                parts.push({ inlineData: { mimeType: "audio/ogg;codecs=opus", data: base64Audio } });
                parts.push({ text: "He enviado un audio. Por favor, escúchalo y responde al cliente como Emssa Bot." });
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

        // --- LÓGICA DE PROCESAMIENTO (AUDIO PRIMERO) ---
        if (isAudio && audioUrl) {
            try {
                console.log(`[Audio] Intentando procesar URL: ${audioUrl}`);
                const base64 = await downloadMedia(audioUrl);
                
                if (base64) {
                    console.log(`[Audio] Descargado con éxito. Tamaño: ${base64.length} caracteres.`);
                    // Usamos el modelo 8b que es el más estable para audio en v1beta
                    const dataAudio = await callAI("gemini-1.5-flash-8b-latest", "", base64);
                    
                    if (dataAudio.candidates?.[0]?.content?.parts?.[0]?.text) {
                        aiTextRaw = dataAudio.candidates[0].content.parts[0].text;
                        console.log(`[AI Audio] Respuesta obtenida: ${aiTextRaw.substring(0, 50)}...`);
                        success = true;
                    } else {
                        console.error("[AI Audio] La IA no devolvió texto para el audio:", JSON.stringify(dataAudio));
                    }
                } else {
                    console.error("[Audio] Falló la descarga del archivo base64.");
                }
            } catch (e) {
                console.error("[AI] Error en flujo de audio:", e.message);
            }
        }

        // --- SI ES TEXTO O SI EL AUDIO FALLÓ ---
        if (!success) {
            // INTENTO 1: GEMMA 3 27B
            try {
                console.log("[AI] Intentando con Gemma 3 27B...");
                const dataGemma3 = await callAI("gemma-3-27b-it", textMessage || "Hola");
                if (dataGemma3.candidates?.[0]?.content?.parts?.[0]?.text) {
                    aiTextRaw = dataGemma3.candidates[0].content.parts[0].text;
                    success = true;
                }
            } catch (e) {
                console.error("[AI] Error en Gemma 3:", e.message);
            }
        }

        // INTENTO 2 (Failover): GEMINI 1.5 FLASH (8B es ultra rápido)
        if (!success) {
            try {
                console.log("[AI] Usando Respaldo: Gemini 1.5 Flash 8B...");
                const dataFlash = await callAI("gemini-1.5-flash-8b-latest", textMessage || "Hola");
                if (dataFlash.candidates?.[0]?.content?.parts?.[0]?.text) {
                    aiTextRaw = dataFlash.candidates[0].content.parts[0].text;
                    success = true;
                }
            } catch (e) {
                console.error("[AI] Error en Gemini Flash:", e.message);
            }
        }

        // --- LÓGICA DE LIMPIEZA FLEXIBLE ---
        let aiText = "";
        const match = aiTextRaw.match(/<res>([\s\S]*?)<\/res>/i);
        
        if (match) {
            aiText = match[1].trim();
        } else {
            // Si NO hay etiquetas, usamos el texto completo pero limpiamos posibles etiquetas rotas
            aiText = aiTextRaw.replace(/<res>|<\/res>/gi, "").trim();
        }

        // Limpieza final de basura técnica
        aiText = aiText.replace(/`/g, "").trim();

        // Si realmente no hay nada después de limpiar, ahí recién usamos un mensaje básico
        if (!aiText || aiText.length < 2) {
            aiText = "¡Hola! Soy el asistente de Calzado Emssa. ¿En qué puedo ayudarte hoy? 😊";
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
