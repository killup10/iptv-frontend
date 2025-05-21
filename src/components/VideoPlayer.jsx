// src/components/VideoPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player/lazy'; // Usar lazy load para mejor rendimiento inicial
import Hls from 'hls.js';

export default function VideoPlayer({ url }) {
  const [error, setError] = useState(null);
  const [isHlsStream, setIsHlsStream] = useState(false);
  const videoElementRef = useRef(null); // Ref para el tag <video> si usamos HLS.js manualmente
  const hlsInstanceRef = useRef(null);  // Ref para la instancia de HLS.js

  useEffect(() => {
    setError(null); // Limpiar errores al cambiar de URL
    // Una detección más robusta para URLs M3U8, incluyendo aquellas con query params
    const newIsHls = url && (url.toLowerCase().includes('.m3u8') || url.toLowerCase().includes('m3u8?'));
    console.log(`VideoPlayer: URL recibida: ${url}, ¿Es HLS? ${newIsHls}`);
    setIsHlsStream(newIsHls);
  }, [url]);

  useEffect(() => {
    // Limpiar instancia HLS anterior si existe cuando la URL o el tipo de stream cambian
    if (hlsInstanceRef.current) {
      console.log("VideoPlayer: Destruyendo instancia HLS anterior.");
      hlsInstanceRef.current.destroy();
      hlsInstanceRef.current = null;
    }

    if (isHlsStream && Hls.isSupported() && videoElementRef.current && url) {
      console.log("VideoPlayer: Configurando Hls.js para URL:", url);
      const hls = new Hls({
         debug: false, // Poner en true para logs detallados de HLS.js en la consola
         // Puedes añadir más configuraciones de HLS.js aquí si es necesario
         // Por ejemplo, para manejo de errores de red:
         // abrEwmaDefaultEstimate: 500000, // 500 kbps, un valor inicial para el estimador de ancho de banda
         // AbrController.capLevelToPlayerSize = true; // Ajusta la calidad al tamaño del reproductor
      });
      hls.loadSource(url);
      hls.attachMedia(videoElementRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("VideoPlayer: Manifiesto HLS parseado, intentando play.");
        // Intentar reproducir una vez que el manifiesto esté listo
        videoElementRef.current?.play().catch(playError => {
          console.warn("VideoPlayer (HLS.js): Error al intentar video.play() tras manifest parsed:", playError);
          // No establecer error aquí necesariamente, el navegador podría bloquear autoplay.
          // El usuario puede necesitar interactuar para iniciar.
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('VideoPlayer: HLS.js Error:', data);
        let errorMsg = `Error HLS (${data.type}): ${data.details || 'Detalles no disponibles'}`;
        if (data.fatal) {
          errorMsg += " (Error fatal)";
          // En errores fatales, HLS.js puede necesitar ser destruido y recreado
          // o podría ser un problema con el stream/CORS/red que no se puede recuperar.
          // hls.destroy(); // HLS.js a menudo intenta recuperarse, pero esta es una opción
        }
        setError(errorMsg);
      });
      hlsInstanceRef.current = hls; // Guardar la instancia para poder destruirla luego

      // Función de limpieza para este efecto
      return () => {
        if (hlsInstanceRef.current) {
          console.log("VideoPlayer: Destruyendo instancia HLS en cleanup de useEffect (isHlsStream o url cambiaron).");
          hlsInstanceRef.current.destroy();
          hlsInstanceRef.current = null;
        }
      };
    } else if (isHlsStream && !Hls.isSupported() && videoElementRef.current) {
        // Fallback a reproducción nativa de HLS si HLS.js no es soportado pero el navegador sí
        if (videoElementRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            console.log("VideoPlayer: HLS.js no soportado, intentando reproducción HLS nativa para", url);
            videoElementRef.current.src = url;
            videoElementRef.current.addEventListener('loadedmetadata', () => {
                videoElementRef.current?.play().catch(playError => {
                    console.warn("VideoPlayer (Nativo HLS): Error al intentar video.play():", playError);
                });
            });
        } else {
            setError("HLS no es soportado en este navegador.");
        }
    }
  }, [isHlsStream, url]); // Este efecto se re-ejecuta si isHlsStream o url cambian

  if (!url) {
    return <div className="p-4 text-center text-orange-400 bg-black rounded-lg">No se proporcionó URL para reproducir.</div>;
  }

  if (error) {
    return (
      <div className="p-3 mb-3 bg-red-800 text-white rounded shadow-md text-sm">
        <strong>Error de Reproducción:</strong> {error}
        <button 
          onClick={() => setError(null)} // Simplemente limpia el error. El usuario puede reintentar o cambiar de fuente.
          className="ml-3 mt-2 sm:mt-0 px-3 py-1 bg-red-900 hover:bg-red-700 rounded text-xs font-semibold"
        >
          OK
        </button>
      </div>
    );
  }

  // Renderizar el reproductor apropiado
  if (isHlsStream) {
    // Para HLS, usamos un tag <video> controlado por HLS.js o nativo
    return (
      <video
        ref={videoElementRef}
        controls
        playsInline
        className="w-full max-h-[calc(100vh-160px)] min-h-[300px] bg-black rounded focus:outline-none"
        autoPlay // El autoplay puede ser bloqueado por políticas del navegador
      />
    );
  } else {
    // Para otros formatos (MP4, MKV, YouTube, etc.), ReactPlayer
    console.log("VideoPlayer: Usando ReactPlayer para URL (no HLS):", url);
    return (
      <div className='player-wrapper w-full aspect-video bg-black rounded'>
        <ReactPlayer
          className='react-player'
          url={url}
          playing={true} // Intenta autoplay; puede ser bloqueado.
          controls={true}
          width='100%'
          height='100%'
          onError={e => {
            console.error('VideoPlayer: ReactPlayer Error:', e);
            let errorMessage = "Error desconocido al reproducir con ReactPlayer.";
            // Intentar obtener un mensaje más específico del error
            if (typeof e === 'object' && e !== null) {
                if(e.message) errorMessage = e.message; // Para errores de JS
                else if (e.target && e.target.error && e.target.error.message) errorMessage = e.target.error.message; // Para errores de media element
                else if (e.target && e.target.error) errorMessage = `Error de medio (código ${e.target.error.code})`;
            } else if (typeof e === 'string') { // A veces ReactPlayer devuelve solo un string
                errorMessage = e;
            }
            setError(`Error de ReactPlayer: ${errorMessage}`);
          }}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload', // Opcional: deshabilita botón de descarga en algunos navegadores
                crossOrigin: 'anonymous', // Puede ser necesario para algunas fuentes o tracks/subtítulos
              },
              // forceVideo: true, // Podría ayudar para algunos formatos si ReactPlayer duda
            }
          }}
        />
      </div>
    );
  }
}
