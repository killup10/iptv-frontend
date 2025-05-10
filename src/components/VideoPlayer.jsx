// src/components/VideoPlayer.jsx
import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ url }) { // 'url' debe ser la URL final, ya procesada por IPTVApp
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const hlsRef = useRef(null); // Usar useRef para mantener la instancia de HLS

  useEffect(() => {
    if (!url) {
      console.warn("VideoPlayer: La URL es nula o undefined.");
      setError("No se proporcionó una URL para reproducir.");
      return;
    }
    const video = videoRef.current;
    if (!video) {
        console.warn("VideoPlayer: Referencia al elemento de video no encontrada.");
        return;
    }

    setError(null); // Limpiar errores anteriores al cambiar de URL
    console.log("VideoPlayer: Intentando reproducir URL:", url);

    // Limpiar instancia HLS anterior si existe
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Determinar si la URL es para un stream HLS.
    // La URL que llega aquí ya podría ser una URL de proxy (ej. /proxy?url=...original.m3u8)
    // o una URL directa.
    const isHlsStream = url.includes('.m3u8'); // Funciona para URLs directas y para query params

    if (isHlsStream) {
      if (Hls.isSupported()) {
        console.log("VideoPlayer: Usando Hls.js para", url);
        const hls = new Hls({
          // Puedes configurar Hls.js aquí si es necesario
          // Ejemplo: debug: false,
          // capLevelToPlayerSize: true, // Ajusta calidad al tamaño del reproductor
        });
        hlsRef.current = hls; // Guardar la instancia
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("VideoPlayer: Manifiesto HLS parseado, intentando play.");
          video.play().catch(playError => {
            console.warn("VideoPlayer: Error al intentar video.play() tras manifest parsed:", playError);
            //setError("No se pudo iniciar la reproducción automáticamente.");
          });
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error('VideoPlayer: Hls.js Error:', JSON.stringify(data, null, 2));
          setError(`Error HLS (${data.type}): ${data.details || 'Detalles no disponibles'}`);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Podrías intentar recuperar errores de red menores si no son fatales
                // hls.startLoad(); // Ejemplo de intento de recuperación
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                // Si es un error fatal y no se puede recuperar, HLS.js puede necesitar ser destruido.
                // hls.destroy(); // HLS.js a menudo maneja esto, pero revisa su documentación.
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("VideoPlayer: Usando reproducción HLS nativa para", url);
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(playError => {
            console.warn("VideoPlayer: Error al intentar video.play() en nativo HLS:", playError);
          });
        });
        video.addEventListener('error', (e) => {
            console.error("VideoPlayer: Error en video nativo HLS:", e);
            setError(`Error en reproducción nativa HLS (código: ${video.error?.code})`);
        });
      } else {
        setError('HLS no es soportado en este navegador.');
      }
    } else { // Para MP4, MKV, etc. (URLs directas o proxificadas por teamg.store/Cloudflare Worker)
      console.log("VideoPlayer: Usando reproducción directa para (MP4/MKV, etc.):", url);
      video.src = url;
      // video.autoplay = true; // El autoplay puede ser problemático, es mejor que el usuario inicie.
      video.play().catch(playError => { // Intentar reproducir, pero manejar el error si el navegador lo bloquea.
          console.warn("VideoPlayer: Error al intentar video.play() para MP4/MKV:", playError);
          //setError("No se pudo iniciar la reproducción. Haz clic en play.");
      });
      video.addEventListener('error', (e) => {
          console.error("VideoPlayer: Error en video MP4/MKV:", e);
          setError(`Error al reproducir video (código: ${video.error?.code})`);
      });
    }

    return () => {
      // Limpieza cuando el componente se desmonta o la URL cambia
      if (hlsRef.current) {
        console.log("VideoPlayer: Destruyendo instancia HLS en cleanup.");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        // Detener el video y limpiar la fuente para liberar recursos
        video.pause();
        video.removeAttribute('src'); // Importante para que el navegador no siga intentando cargar
        video.load(); // Esto aborta la descarga y resetea el estado del media element
      }
    };
  }, [url]); // Se ejecuta cada vez que la prop 'url' cambia

  const clearErrorAndRetry = () => {
    setError(null);
    // Forzar un re-render o re-intento podría implicar recargar la URL
    // o simplemente permitir que el usuario interactúe de nuevo.
    // Por ahora, solo limpiamos el error.
    // Si la URL sigue siendo la misma, el useEffect no se volverá a disparar
    // a menos que la prop url cambie.
  };

  return (
    <div className="video-player-container w-full">
      {error && (
        <div className="p-3 mb-3 bg-red-600 text-white rounded shadow-md text-sm">
          <strong>Error de Reproducción:</strong> {error}
          <button 
            onClick={clearErrorAndRetry} 
            className="ml-3 px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-xs font-semibold"
          >
            OK
          </button>
        </div>
      )}
      <video
        ref={videoRef}
        controls
        playsInline // Importante para una mejor experiencia en móviles (especialmente iOS)
        className="w-full max-h-[calc(100vh-200px)] min-h-[300px] bg-black rounded focus:outline-none"
        // Podrías añadir listeners para 'canplay', 'waiting', 'playing' etc. para más control
        // onCanPlay={() => console.log("VideoPlayer: Can play.")}
        // onPlaying={() => console.log("VideoPlayer: Playing.")}
        // onWaiting={() => console.log("VideoPlayer: Waiting for data...")}
      />
    </div>
  );
}