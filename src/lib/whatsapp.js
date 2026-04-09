/**
 * WhatsApp Service Layer (Evolution API Integration)
 * Corrected structure for Evolution API v2
 */

const EVO_CONFIG = {
  baseUrl: 'https://evolution-api-v2-3-7-nmoa.onrender.com',
  apiKey: 'Calzado2026'
};

export const whatsappService = {
  async sendText(remoteJid, text) {
    const cleanNumber = remoteJid.replace('+', '').replace(/\s/g, '');
    
    try {
      // 1. Fetch instances correctly
      const responseInstances = await fetch(`${EVO_CONFIG.baseUrl}/instance/fetchInstances`, {
        headers: { 'apikey': EVO_CONFIG.apiKey }
      });
      
      const data = await responseInstances.json();
      console.log('DEBUG: Full raw data from server:', data);

      // Evolution API v2 usually returns an array directly or inside a property
      const instancesList = Array.isArray(data) ? data : (data.instances || []);
      
      // Find instance that is connected or just pick the first one from the list
      const targetInstance = instancesList.find(i => i.connectionStatus === 'open' || i.instance?.connectionStatus === 'open') || instancesList[0];

      if (!targetInstance) {
        throw new Error('No se encontró ninguna instancia activa en el servidor.');
      }

      // Extract the name - in v2 it might be inside targetInstance.name or targetInstance.instanceName
      const name = targetInstance.instanceName || targetInstance.name || (targetInstance.instance && targetInstance.instance.instanceName);

      if (!name) {
        console.error('Could not find name in:', targetInstance);
        throw new Error('La instancia existe pero no tiene un nombre válido.');
      }

      console.log('Sending message via instance:', name);

      // 2. Send the message
      const sendRes = await fetch(`${EVO_CONFIG.baseUrl}/message/sendText/${name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': targetInstance.token || EVO_CONFIG.apiKey
        },
        body: JSON.stringify({
          number: cleanNumber,
          text: text
        })
      });

      const sendData = await sendRes.json();

      if (!sendRes.ok) {
        throw new Error(sendData.message || 'Error al enviar mensaje');
      }

      return sendData;
    } catch (error) {
      console.error('WhatsApp Service Error:', error);
      throw error;
    }
  }
};
