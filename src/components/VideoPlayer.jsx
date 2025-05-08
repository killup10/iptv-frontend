// src/components/VideoPlayer.jsx
import React, { useRef, useEffect, useState } from "react";
import shaka from 'shaka-player';

export function VideoPlayer({ url }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // Instalar polyfills
    shaka.polyfill.installAll();

    let player;
    async function initPlayer() {
      if (shaka.Player.isBrowserSupported()) {
        player = new shaka.Player(video);
        player.getNetworkingEngine().registerRequestFilter((type, request) => {
          // Opcional: Puedes agregar headers o proxy aquí
        });
        try {
          await player.load(url);
        } catch (err) {
          console.error('Error cargando stream con Shaka:', err);
          setError('No se pudo reproducir el video. Verifique la URL o su conexión.');
        }
      } else {
        // Fallback nativo HLS
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.addEventListener('error', () => {
            setError('Error al reproducir el video nativamente.');
          });
        } else {
          setError('Su navegador no soporta reproducción de video.');
        }
      }
    }

    initPlayer();

    return () => {
      if (player) player.destroy();
    };
  }, [url]);

  if (error) {
    return (
      <div className="p-4 bg-red-800 text-white rounded">
        {error}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      controls
      className="w-full max-h-[70vh] bg-black rounded"
    />
  );
}

export default VideoPlayer;
