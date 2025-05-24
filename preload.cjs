// iptv-frontend/preload.cjs
const { contextBridge } = require('electron'); // Solo necesitas contextBridge aquí por ahora

console.log('[PRELOAD_LOG] Script de precarga (preload.cjs) ejecutándose...');

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    isElectron: () => true, // <--- ¡AÑADE ESTA LÍNEA!
    versions: { // Puedes mantener esto si lo usas en otro lado
      node: () => process.versions.node,
      chrome: () => process.versions.chrome,
      electron: () => process.versions.electron
    }
    // Aquí puedes agregar otras funciones o propiedades que necesites exponer
  });
  console.log('[PRELOAD_LOG] electronAPI (con isElectron) expuesta a window.electronAPI');
} catch (error) {
  console.error('[PRELOAD_ERROR] Error al exponer electronAPI:', error);
}
