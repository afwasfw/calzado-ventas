import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GOOGLE_AI_API_KEY) {
  console.error('❌ Error: No se encontró GOOGLE_AI_API_KEY en el archivo .env');
  process.exit(1);
}

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GOOGLE_AI_API_KEY 
});

async function registerWebhook() {
  try {
    console.log('--- Registrando Webhook en Google ---');
    
    const webhook = await genAI.webhooks.create({
      name: "CortexFactoryWebhook",
      subscribed_events: ["batch.succeeded", "batch.failed"],
      uri: "https://calzado-ventas.vercel.app/api/gemini-webhook",
    });

    console.log('\n✅ ¡Webhook registrado con éxito!');
    console.log('-----------------------------------');
    console.log('ID:', webhook.id);
    console.log('NOMBRE:', webhook.name);
    console.log('\n⚠️ COPIA ESTE SECRETO AHORA (Solo se muestra una vez):');
    console.log('SECRET:', webhook.new_signing_secret);
    console.log('-----------------------------------');
    console.log('\nInstrucción: Agrega este SECRET a tus variables de entorno en Vercel con el nombre: GEMINI_WEBHOOK_SECRET');

  } catch (error) {
    console.error('❌ Error al registrar:', error.message);
  }
}

registerWebhook();
