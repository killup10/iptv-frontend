// iptv-frontend/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

console.log('[PRELOAD_LOG] Script de precarga (preload.cjs) ejecutado.');

// Ejemplo de cómo exponer algo al proceso de renderizado de forma segura:
contextBridge.exposeInMainWorld('electronAPI', {
  // Ejemplo: podrías exponer funciones para enviar mensajes al proceso principal
  // sendMessageToMain: (channel, data) => ipcRenderer.send(channel, data),
  // Y para recibir respuestas
  // onReplyFromMain: (channel, func) => {
  //   ipcRenderer.on(channel, (event, ...args) => func(...args));
  // }
  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
  }
});

console.log('[PRELOAD_LOG] electronAPI expuesta a window.');
