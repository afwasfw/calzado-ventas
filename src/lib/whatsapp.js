/**
 * LIBRERÍA DE COMUNICACIÓN - EVOLUTION API (RAILWAY)
 * Este archivo centraliza todas las peticiones hacia el bot de WhatsApp.
 */

const API_URL = "https://evolution-api-production-b0d7.up.railway.app";
const API_KEY = "Calzado2026";
const INSTANCE = "emssa";

/**
 * Envía un mensaje de texto plano a un número específico.
 * @param {string} number - Número en formato internacional (ej: 51933025385)
 * @param {string} text - El mensaje a enviar
 */
export const sendTextMessage = async (number, text) => {
    try {
        const response = await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                number: number,
                text: text,
                options: {
                    delay: 1200,
                    presence: 'composing'
                }
            })
        });

        if (!response.ok) throw new Error('Error al enviar mensaje');
        return await response.json();
    } catch (error) {
        console.error("WhatsApp Error (Text):", error);
        return null;
    }
};

/**
 * Envía una imagen con pie de foto opcional.
 * @param {string} number 
 * @param {string} mediaUrl - URL pública de la imagen
 * @param {string} caption 
 */
export const sendImageMessage = async (number, mediaUrl, caption = "") => {
    try {
        const response = await fetch(`${API_URL}/message/sendMedia/${INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({
                number: number,
                mediaMessage: {
                    mediatype: 'image',
                    media: mediaUrl,
                    caption: caption
                }
            })
        });

        if (!response.ok) throw new Error('Error al enviar imagen');
        return await response.json();
    } catch (error) {
        console.error("WhatsApp Error (Image):", error);
        return null;
    }
};

/**
 * Obtiene el estado de la instancia (para verificar si el QR sigue activo).
 */
export const getInstanceStatus = async () => {
    try {
        const response = await fetch(`${API_URL}/instance/connectionStatus/${INSTANCE}`, {
            method: 'GET',
            headers: { 'apikey': API_KEY }
        });
        return await response.json();
    } catch (error) {
        console.error("WhatsApp Error (Status):", error);
        return null;
    }
};
