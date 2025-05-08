// src/components/VideoPlayer.jsx
import React, { useRef, useEffect } from "react";
import Hls from "hls.js";

export function VideoPlayer({ url, support4K = false }) {
  const videoRef = useRef();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // si el navegador no soporta nativamente HLS (.m3u8)
    if (Hls.isSupported()) {
      const hls = new Hls({ capLevelToPlayerSize: true, maxBufferLength: support4K ? 30 : 10 });
      hls.loadSource(url);
      hls.attachMedia(video);
      return () => hls.destroy();
    }

    // Safari u otros que sí soportan HLS nativo
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }
  }, [url, support4K]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full max-h-[70vh] bg-black rounded"
    />
  );
}
