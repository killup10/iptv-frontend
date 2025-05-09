// src/components/VideoPlayer.jsx
import React, { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;
    const video = videoRef.current;
    setError(null);

    // Construir URL a través del proxy para esquivar CORS en HLS
    const sourceUrl = url.endsWith('.m3u8')
      ? `${import.meta.env.VITE_API_URL.replace(/\/${'$'}/, '')}/proxy?url=${encodeURIComponent(url)}`
      : url;

    let hls;

    if (url.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error('Hls.js Error:', data);
          setError(`Error HLS: ${data.type}`);
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {});
        });
        video.addEventListener('error', () => setError('Error nativo HLS'));
      } else {
        setError('HLS no soportado en este navegador');
      }
    } else {
      video.src = sourceUrl;
      video.autoplay = true;
      video.addEventListener('error', () => setError('Error al reproducir video'));
    }

    return () => {
      if (hls) hls.destroy();
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
