// api/whatsapp-webhook.js
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURACIÓN (PRO) ---
const API_URL_RAILWAY = process.env.API_URL_RAILWAY || "https://evolution-api-production-b0d7.up.railway.app";
const API_KEY_RAILWAY = process.env.API_KEY_RAILWAY || "Calzado2026";
const INSTANCE = process.env.INSTANCE || "emssa";
const ALLOWED_NUMBERS = (process.env.ALLOWED_NUMBERS || "51941332536").split(",");

// Inicializar Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// --- FUNCIONES DE MEMORIA ---
async function getChatContext(whatsappNumber) {
    try {
        const { data, error } = await supabase
            .from('ai_chat_history')
            .select('role, content')
            .eq('whatsapp_number', whatsappNumber)
            .order('created_at', { ascending: false })
            .limit(6); // Recordamos los últimos 6 mensajes
        
        if (error) throw error;
        // Los invertimos para que estén en orden cronológico para la IA
        return data.reverse().map(m => `${m.role === 'user' ? 'Cliente' : 'Asistente'}: ${m.content}`).join('\n');
    } catch (e) {
        console.error("[Memoria] Error leyendo historial:", e.message);
        return "";
    }
}

async function saveToHistory(whatsappNumber, role, content) {
    try {
        await supabase.from('ai_chat_history').insert([{ 
            whatsapp_number: whatsappNumber, 
            role: role, 
            content: content 
        }]);
    } catch (e) {
        console.error("[Memoria] Error guardando:", e.message);
    }
}

// --- WHATSAPP UTILS ---
async function sendTextMessage(remoteJid, text) {
    const whatsappNumber = remoteJid.split('@')[0];
    try {
        await fetch(`${API_URL_RAILWAY}/message/sendText/${INSTANCE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': API_KEY_RAILWAY },
            body: JSON.stringify({ number: whatsappNumber, text: text })
        });
    } catch (error) {
        console.error("[WhatsApp] Error de red:", error.message);
    }
}

export default async function (req, res) {
    if (req.method !== 'POST') return res.status(200).send('Active');

    try {
        const data = req.body?.data;
        if (!data || !data.message) return res.status(200).send('Ignored');

        const remoteJid = data?.key?.remoteJid || "";
        const senderNumber = remoteJid.split('@')[0];
        if (data?.key?.fromMe || remoteJid.endsWith('@g.us')) return res.status(200).send('Ignored');

        if (!ALLOWED_NUMBERS.includes(senderNumber)) return res.status(200).send('Unauthorized');

        let textMessage = data.message.conversation || data.message.extendedTextMessage?.text || "";
        const isAudio = !!data.message.audioMessage;

        // --- TRANSCRIPCIÓN (Oído) ---
        if (isAudio) {
            try {
                const response = await fetch(`${API_URL_RAILWAY}/chat/getBase64FromMediaMessage/${INSTANCE}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': API_KEY_RAILWAY },
                    body: JSON.stringify({ message: data })
                });
                const { base64 } = await response.json();
                if (base64) {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
                    const resAI = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ parts: [
                                { inlineData: { mimeType: "audio/ogg;codecs=opus", data: base64 } },
                                { text: "Escribe exactamente lo que escuchas. Solo texto plano." }
                            ]}]
                        })
                    });
                    const dataAI = await resAI.json();
                    textMessage = dataAI.candidates?.[0]?.content?.parts?.[0]?.text || "";
                }
            } catch (e) { console.error("[Audio] Fail:", e.message); }
        }

        if (!textMessage) return res.status(200).send('No Content');

        // --- GESTIÓN DE MEMORIA ---
        const historyContext = await getChatContext(senderNumber);
        await saveToHistory(senderNumber, 'user', textMessage);

        // --- CEREBRO (Pensamiento con contexto) ---
        const callGemma = async (msg, context) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`;
            const prompt = `Eres "Emssa Bot", asistente de Calzado Emssa en Trujillo.
                           HISTORIAL DE CONVERSACIÓN RECIENTE:
                           ${context}
                           
                           NUEVO MENSAJE DEL CLIENTE: "${msg}"
                           
                           Responde amablemente basándote en el historial si es necesario. Encierra tu respuesta entre <res> y </res>.`;
            
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            return await res.json();
        };

        let aiTextRaw = "";
        try {
            const dataGemma = await callGemma(textMessage, historyContext);
            aiTextRaw = dataGemma.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (e) { console.error("[AI] Gemma Fail:", e.message); }

        // --- LIMPIEZA Y RESPUESTA ---
        let aiText = aiTextRaw.match(/<res>([\s\S]*?)<\/res>/i)?.[1]?.trim() || aiTextRaw.replace(/<res>|<\/res>/gi, "").trim();
        
        if (aiText) {
            await saveToHistory(senderNumber, 'assistant', aiText);
            await sendTextMessage(remoteJid, aiText);
        }

        return res.status(200).json({ status: 'success' });
    } catch (error) {
        return res.status(200).send('Error');
    }
}
