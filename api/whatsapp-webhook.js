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
        
        // --- FILTRO DE SEGURIDAD: SOLO RESPONDER A NÚMEROS AUTORIZADOS ---
        const ALLOWED_NUMBERS = ["51941332536", "TU_OTRO_NUMERO_AQUI"]; // Agrega aquí los números que pueden usar el bot
        const remoteJid = data?.key?.remoteJid || "";
        const isGroup = remoteJid.endsWith('@g.us');
        const senderNumber = remoteJid.split('@')[0];

        // 1. Ignorar si el mensaje es mío
        if (data?.key?.fromMe) return res.status(200).send('Ignored: From Me');
        
        // 2. Ignorar si es un grupo
        if (isGroup) {
            console.log(`[Security] Ignorando mensaje de grupo: ${remoteJid}`);
            return res.status(200).send('Ignored: Group');
        }

        // 3. Ignorar si no está en la lista blanca (opcional, pero recomendado por ahora)
        if (!ALLOWED_NUMBERS.includes(senderNumber)) {
            console.log(`[Security] Bloqueado mensaje de número no autorizado: ${senderNumber}`);
            return res.status(200).send('Ignored: Unauthorized Number');
        }

        if (!data || !data.message) return res.status(200).send('Ignored: No Message');

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

        // DEBUG: Listar modelos para la NUEVA KEY
        try {
            const listModels = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_AI_API_KEY}`);
            const modelsData = await listModels.json();
            console.log("[DEBUG-NEW-KEY] Modelos disponibles:", JSON.stringify(modelsData.models?.map(m => m.name)));
        } catch (e) {
            console.error("[DEBUG] No se pudo listar modelos:", e.message);
        }

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
                parts.push({ text: "INSTRUCCIÓN CRÍTICA: Escucha este audio adjunto. Transcríbelo mentalmente y responde al cliente como 'Emssa Bot' (Asistente de Calzado Emssa). Si el audio es de un cliente consultando por precios, catálogo o pedidos, dale una respuesta amable y profesional en español. NO digas que eres un asistente de texto; ¡puedes escuchar este audio perfectamente!" });
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

        // --- LÓGICA DE PROCESAMIENTO (AUDIO -> TRANSCRIPCIÓN -> GEMMA) ---
        if (isAudio && audioUrl) {
            try {
                console.log(`[Audio] Transcribiendo con Gemini Lite (Nueva Key)...`);
                const base64 = await downloadMedia(audioUrl);
                
                if (base64) {
                    const transcriptionPrompt = "AUDIO TRANSCRIPTION TASK: Listen and write ONLY the words you hear in Spanish. NO greetings. NO summaries. NO explanations. If empty, write 'Audio sin contenido'.";
                    const dataTranscription = await callAI("gemini-2.0-flash-lite", transcriptionPrompt, base64);
                    
                    const transcription = dataTranscription.candidates?.[0]?.content?.parts?.[0]?.text;
                    
                    if (transcription && transcription.length > 2) {
                        console.log(`[AI Audio] Texto detectado: "${transcription}"`);
                        
                        // --- ENVIAR TRANSCRIPCIÓN PARA PRUEBA ---
                        await sendTextMessage(remoteJid, `📝 *He escuchado esto:* "${transcription}"`);
                        
                        textMessage = transcription;
                    } else {
                        console.error("[AI Audio] Falló transcripción con nueva clave:", JSON.stringify(dataTranscription));
                    }
                }
            } catch (e) {
                console.error("[AI] Error crítico en flujo de audio:", e.message);
            }
        }

        // --- CEREBRO: GEMMA 3 27B (Para Texto y Transcripciones) ---
        if (!success) {
            try {
                console.log("[AI] Generando respuesta con Gemma 3 27B...");
                const dataGemma3 = await callAI("gemma-3-27b-it", textMessage || "Hola");
                if (dataGemma3.candidates?.[0]?.content?.parts?.[0]?.text) {
                    aiTextRaw = dataGemma3.candidates[0].content.parts[0].text;
                    success = true;
                }
            } catch (e) {
                console.error("[AI] Error en Gemma 3:", e.message);
            }
        }

        // INTENTO 2 (Failover): GEMINI FLASH LATEST
        if (!success) {
            try {
                console.log("[AI] Usando Respaldo: Gemini Flash Latest...");
                const dataFlash = await callAI("gemini-flash-latest", textMessage || "Hola");
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
