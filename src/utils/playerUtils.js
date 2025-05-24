    // src/utils/playerUtils.js (en tu proyecto iptv-frontend)

    // Función para detectar si estamos en Electron usando contextBridge
    // Comprueba si window.electronAPI y window.electronAPI.isElectron existen y son una función
    // antes de llamarla. Esto evita errores si el preload script no se carga o falla.
    const IS_ELECTRON = typeof window.electronAPI === 'object' &&
                        typeof window.electronAPI.isElectron === 'function' &&
                        window.electronAPI.isElectron();

    console.log("playerUtils: ¿Ejecutando en Electron? (vía contextBridge)", IS_ELECTRON);

    /**
     * getPlayableUrl
     *
     * @param {object} item - Objeto que debe incluir al menos { url: string }.
     * @param {string} [m3u8ProxyBaseUrl] - Opcional: La URL base de tu proxy M3U8 (ej. https://stream.teamg.store).
     * Solo se usa si NO estamos en Electron.
     * @returns {string} - URL lista para reproducir en el player, o string vacío si hay error.
     */
    export function getPlayableUrl(item, m3u8ProxyBaseUrl) {
      if (!item || typeof item.url !== 'string' || item.url.trim() === '') {
        console.warn('playerUtils/getPlayableUrl: item.url no es válido o está vacío.');
        return '';
      }

      let rawUrl = item.url.trim();
      console.log(`playerUtils/getPlayableUrl: Evaluando URL: ${rawUrl}`);

      // Si estamos en Electron, intentamos la reproducción directa para TODO.
      // El proceso principal de Electron (si se configuran cabeceras COOP/COEP o se manejan onBeforeSendHeaders)
      // podría ayudar con algunos temas de CORS, o el acceso directo file:// evita otros.
      if (IS_ELECTRON) {
        console.log(`   -> (Electron) Devolviendo URL directamente: ${rawUrl}`);
        // Lógica específica para Dropbox para asegurar ?dl=1 si es necesario, incluso en Electron
        if (rawUrl.toLowerCase().includes('dropbox.com') && rawUrl.includes('?dl=0')) {
          rawUrl = rawUrl.replace('?dl=0', '?dl=1');
          console.log(`   -> (Electron) URL de Dropbox modificada a ?dl=1: ${rawUrl}`);
        }
        return rawUrl;
      }

      // Si NO estamos en Electron (estamos en un navegador web normal):
      // Aplicar la lógica del proxy M3U8 para streams de terceros.
      console.log(`   -> (Web) Procesando URL para entorno web.`);

      // Si la URL ya es de tu dominio proxy M3U8 (stream.teamg.store), úsala directamente.
      if (m3u8ProxyBaseUrl && rawUrl.startsWith(m3u8ProxyBaseUrl)) {
        console.log(`     -> (Web) URL ya es del proxy M3U8, usando directamente: ${rawUrl}`);
        return rawUrl;
      }
      
      // Si es un stream M3U8 y se proporcionó una URL base para el proxy,
      // y la URL no es de tu dominio principal teamg.store ni de localhost.
      if (m3u8ProxyBaseUrl && 
          (rawUrl.toLowerCase().includes('.m3u8') || rawUrl.toLowerCase().includes('m3u8?')) &&
          !rawUrl.startsWith('https://teamg.store/') && 
          !rawUrl.startsWith('http://localhost')) { 
        
        const encodedOriginalUrl = encodeURIComponent(rawUrl);
        const proxiedM3U8Url = `${m3u8ProxyBaseUrl.replace(/\/$/, '')}/?target=${encodedOriginalUrl}`;
        console.log(`     -> (Web) Stream M3U8 detectado para proxificar. Vía ${proxiedM3U8Url} (Original: ${rawUrl})`);
        return proxiedM3U8Url;
      }

      // URLs de teamg.store (que no sean M3U8 para el proxy de stream) o localhost se devuelven directamente.
      if (rawUrl.startsWith('https://teamg.store/') || rawUrl.startsWith('http://localhost')) {
        console.log(`     -> (Web) URL de teamg.store o localhost, usando directamente: ${rawUrl}`);
        return rawUrl;
      }
      
      // Lógica para Dropbox (si aún la necesitas y no pasa por el proxy general de M3U8)
      if (rawUrl.toLowerCase().includes('dropbox.com')) {
        let dropboxUrl = rawUrl;
        if (dropboxUrl.includes('?dl=0')) {
          dropboxUrl = dropboxUrl.replace('?dl=0', '?dl=1');
        }
        // Si no tiene ?dl=0 y no tiene ?dl=1 pero sí tiene otros parámetros,
        // podría ser mejor devolverla tal cual o solo quitar dl=0.
        // La lógica de quitar toda la query string podría ser demasiado agresiva.
        // Vamos a mantener tu lógica original por ahora, pero considera si es lo deseado.
        if (!dropboxUrl.includes('?dl=1') && dropboxUrl.includes('?')) {
            const [baseUrlBeforeQuery] = dropboxUrl.split('?');
            // Solo si no tiene ?dl=1, y no tenía ?dl=0 (porque ya se habría reemplazado)
            // Y sí tiene otros parámetros, aquí decides si quitar la query o no.
            // Por ahora, para mantener la lógica original, si no es dl=0 y no es dl=1,
            // y hay query, se quita.
            if (!rawUrl.includes('?dl=0')) { // Solo aplica si el original no era ?dl=0
                console.log(`     -> (Web) URL de Dropbox (sin ?dl=0 o ?dl=1), quitando query: ${baseUrlBeforeQuery}`);
                return baseUrlBeforeQuery;
            }
        }
        console.log(`     -> (Web) Devolviendo URL de Dropbox (posiblemente ya directa o modificada): ${dropboxUrl}`);
        return dropboxUrl;
      }

      console.log(`     -> (Web) Devolviendo URL como fallback directo: ${rawUrl}`);
      return rawUrl;
    }
    