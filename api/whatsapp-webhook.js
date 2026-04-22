// api/whatsapp-webhook.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuración de la IA (Asegúrate de poner estas variables en Vercel)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Puedes cambiarlo a gemma2-9b o similar si está disponible

// Configuración de Evolution API
const API_URL = "https://evolution-api-production-b0d7.up.railway.app";
const API_KEY = "Calzado2026";
const INSTANCE = "emssa";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        const data = req.body;
        const message = data.data?.message;
        const remoteJid = data.data?.key?.remoteJid;
        const fromMe = data.data?.key?.fromMe;
        const pushName = data.data?.pushName || "Cliente";

        if (fromMe || !remoteJid) return res.status(200).send('Ignored');

        const textMessage = message?.conversation || message?.extendedTextMessage?.text || "";
        if (!textMessage) return res.status(200).send('No text found');

        console.log(`Mensaje de ${pushName}: ${textMessage}`);

        // --- LÓGICA DE IA ---
        const prompt = `
            Eres el asistente inteligente de "Calzado Emssa", una fábrica de calzado profesional. 
            Tu objetivo es ayudar a los clientes con sus pedidos y consultas.
            
            REGLAS:
            1. Sé amable, profesional y eficiente.
            2. Hablamos en términos de "docenas" (12 pares) y "series".
            3. Si el cliente pregunta por precios o stock, dile que estás consultando el sistema (por ahora no tenemos la conexión a la base de datos lista en este script, pero la tendremos pronto).
            4. Tu nombre es "Emssa Bot".
            
            CLIENTE DICE: "${textMessage}"
            RESPUESTA DEL BOT:
        `;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // --- ENVIAR RESPUESTA A WHATSAPP ---
        await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                number: remoteJid.replace('@s.whatsapp.net', ''),
                text: aiResponse
            })
        });

        return res.status(200).json({ status: 'success', ai_said: aiResponse });

    } catch (error) {
        console.error("WEBHOOK ERROR:", error);
        return res.status(500).json({ error: error.message });
    }
}

