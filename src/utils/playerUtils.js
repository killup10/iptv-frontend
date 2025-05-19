// src/utils/playerUtils.js

/**
 * getPlayableUrl (Versión SIN PROXY de Backend)
 *
 * Esta función procesa una URL de un item para hacerla reproducible,
 * asumiendo que no se utilizará un proxy de backend.
 *
 * Lógica:
 * 1. Si la URL contiene ".m3u8", se devuelve tal cual (para HLS).
 * 2. Si la URL es de "teamg.store", se devuelve tal cual (asumiendo que es tu dominio y ya sirve contenido directamente).
 * 3. Si la URL es de "dropbox.com":
 * a. Intenta cambiar "?dl=0" por "?dl=1" para obtener un enlace de descarga/streaming directo.
 * b. Si no tiene "?dl=0" pero es de Dropbox, simplemente quita otros parámetros de consulta (opcional, puedes ajustarlo).
 * 4. Para todas las demás URLs (MP4, MKV directos, etc.), se devuelven tal cual.
 *
 * @param {object} item - Objeto que debe incluir al menos { url: string }.
 * @returns {string} - URL lista para reproducir en el player, o string vacío si hay error.
 */
export function getPlayableUrl(item) {
  if (!item || typeof item.url !== 'string' || item.url.trim() === '') {
    console.warn('getPlayableUrl: item.url no es válido o está vacío.');
    return ''; // Devuelve string vacío si la URL no es válida
  }

  let rawUrl = item.url.trim();

  // 1. URLs .m3u8 (HLS)
  // Se asume que estas URLs ya son directas o contienen los tokens necesarios.
  if (rawUrl.toLowerCase().includes('.m3u8')) {
    console.log(`getPlayableUrl (sin proxy): Devolviendo URL .m3u8 directamente: ${rawUrl}`);
    return rawUrl;
  }

  // 2. URLs de tu dominio (teamg.store) u otras CDNs confiables
  // Asumimos que estas URLs ya son directas y no necesitan modificación.
  if (rawUrl.startsWith('https://teamg.store/')) {
    console.log(`getPlayableUrl (sin proxy): Devolviendo URL de teamg.store directamente: ${rawUrl}`);
    return rawUrl;
  }
  // Puedes añadir otras condiciones para dominios que sirvan contenido directo:
  // if (rawUrl.startsWith('https://live-evg25.tv360.bitel.com.pe/') || rawUrl.startsWith('http://179.51.136.19')) {
  //   console.log(`getPlayableUrl (sin proxy): Devolviendo URL directa conocida: ${rawUrl}`);
  //   return rawUrl;
  // }


  // 3. Lógica para Dropbox
  if (rawUrl.toLowerCase().includes('dropbox.com')) {
    let dropboxUrl = rawUrl;
    // Intenta convertir enlaces de previsualización de Dropbox (?dl=0) a enlaces de descarga directa (?dl=1)
    if (dropboxUrl.includes('?dl=0')) {
      dropboxUrl = dropboxUrl.replace('?dl=0', '?dl=1');
      console.log(`getPlayableUrl (sin proxy): URL de Dropbox modificada a ?dl=1: ${dropboxUrl}`);
      return dropboxUrl;
    }
    // Si es una URL de www.dropbox.com/s/ (no usercontent) y no tiene dl=1, podría ser una página de previsualización.
    // Para estas, a veces cambiar www.dropbox.com a dl.dropboxusercontent.com funciona,
    // pero puede ser complejo y propenso a errores si la estructura de la URL cambia.
    // Por ahora, si no es ?dl=0, simplemente devolvemos la URL quitando otros parámetros si es necesario,
    // o la URL original si ya es un enlace directo de dl.dropboxusercontent.com.
    // Si tus URLs de Dropbox son del tipo `dl.dropboxusercontent.com/...` es probable que sean directas.
    // Si son `www.dropbox.com/s/...` sin `?dl=1`, es probable que fallen como stream directo.

    // Si solo quieres limpiar parámetros genéricos de Dropbox (y no es .m3u8)
    // y ya te aseguraste que la URL base es la correcta para streaming:
    if (!dropboxUrl.includes('?dl=1') && dropboxUrl.includes('?')) {
        const [baseUrlBeforeQuery] = dropboxUrl.split('?');
        console.log(`getPlayableUrl (sin proxy): URL de Dropbox (sin ?dl=0), quitando query: ${baseUrlBeforeQuery}`);
        return baseUrlBeforeQuery;
    }
    
    // Si no se hicieron modificaciones específicas de ?dl=0 o no se quitaron queries, devolverla como está
    console.log(`getPlayableUrl (sin proxy): Devolviendo URL de Dropbox (posiblemente ya directa o sin ?dl=0): ${dropboxUrl}`);
    return dropboxUrl;
  }

  // 4. Para todas las demás URLs (MP4, MKV, etc., que no son .m3u8 ni los casos especiales de arriba)
  // Se devuelven directamente. Crucial: estos servidores deben tener CORS configurado correctamente
  // para permitir el acceso desde tu dominio frontend.
  console.log(`getPlayableUrl (sin proxy): Devolviendo URL como fallback directo (ej. MP4, MKV): ${rawUrl}`);
  return rawUrl;
}