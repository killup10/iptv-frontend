// src/utils/playerUtils.js

// Función para detectar si estamos en Electron usando contextBridge
const IS_ELECTRON = typeof window !== 'undefined' && 
                   typeof window.electronAPI === 'object' &&
                   typeof window.electronAPI.isElectron === 'function' &&
                   window.electronAPI.isElectron();

if (process.env.NODE_ENV === 'development') {
  console.log("playerUtils: ¿Ejecutando en Electron?", IS_ELECTRON);
  console.log("playerUtils: window.electronAPI disponible?", typeof window.electronAPI);
  console.log("playerUtils: window.electronMPV disponible?", typeof window.electronMPV);
}

/**
 * getPlayableUrl
 *
 * @param {object} item - Objeto que debe incluir al menos { url: string }.
 * @param {string} [m3u8ProxyBaseUrl] - Opcional: La URL base de tu proxy M3U8.
 * @returns {string} - URL lista para reproducir en el player.
 * @throws {Error} - Si la URL no es válida o no se puede procesar.
 */
export function getPlayableUrl(item, m3u8ProxyBaseUrl) {
  // Validación de entrada
  if (!item || typeof item !== 'object') {
    throw new Error('Se requiere un objeto item válido');
  }

  if (typeof item.url !== 'string' || item.url.trim() === '') {
    throw new Error('URL inválida o vacía');
  }

  let rawUrl = item.url.trim();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`playerUtils/getPlayableUrl: Procesando URL: ${rawUrl}`);
  }

  try {
    // Si estamos en Electron, intentamos la reproducción directa
    if (IS_ELECTRON) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`playerUtils: Modo Electron - usando URL directa: ${rawUrl}`);
      }
      
      // Manejo especial para URLs de Dropbox en Electron
      if (rawUrl.toLowerCase().includes('dropbox.com')) {
        rawUrl = rawUrl.replace(/[?&]dl=0/g, '?dl=1');
        if (!rawUrl.includes('dl=1')) {
          rawUrl += (rawUrl.includes('?') ? '&' : '?') + 'dl=1';
        }
      }
      
      return rawUrl;
    }

    // Procesamiento para navegador web
    if (process.env.NODE_ENV === 'development') {
      console.log(`playerUtils: Modo Web - procesando URL: ${rawUrl}`);
    }

    // Si la URL ya es del proxy, usarla directamente
    if (m3u8ProxyBaseUrl && rawUrl.startsWith(m3u8ProxyBaseUrl)) {
      return rawUrl;
    }

    // Manejo de streams M3U8
    if (m3u8ProxyBaseUrl && 
        (rawUrl.toLowerCase().includes('.m3u8') || rawUrl.toLowerCase().includes('m3u8?')) &&
        !rawUrl.startsWith('https://teamg.store/') && 
        !rawUrl.startsWith('http://localhost')) {
      
      const encodedUrl = encodeURIComponent(rawUrl);
      const proxiedUrl = `${m3u8ProxyBaseUrl.replace(/\/$/, '')}/?target=${encodedUrl}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`playerUtils: URL M3U8 proxificada: ${proxiedUrl}`);
      }
      
      return proxiedUrl;
    }

    // URLs internas o localhost
    if (rawUrl.startsWith('https://teamg.store/') || rawUrl.startsWith('http://localhost')) {
      return rawUrl;
    }

    // Manejo de URLs de Dropbox
    if (rawUrl.toLowerCase().includes('dropbox.com')) {
      rawUrl = rawUrl.replace(/[?&]dl=0/g, '?dl=1');
      if (!rawUrl.includes('dl=1')) {
        rawUrl += (rawUrl.includes('?') ? '&' : '?') + 'dl=1';
      }
      return rawUrl;
    }

    // URL por defecto
    return rawUrl;

  } catch (error) {
    console.error('playerUtils: Error procesando URL:', error);
    throw new Error(`Error procesando URL: ${error.message}`);
  }
}
