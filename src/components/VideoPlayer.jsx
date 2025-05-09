// src/components/VideoPlayer.jsx
import React, { useRef, useEffect, useState } from "react";
import Hls from "hls.js";
import shaka from "shaka-player";

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;
    setError("");

    let hls = null;
    let shakaPlayer = null;

    // 1) Si es .m3u8 → HLS.js
    if (url.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e, data) => {
          console.error("Hls.js Error:", data);
          setError("Error HLS: " + data.type);
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("error", () => setError("Error reproducción HLS nativa"));
      } else {
        setError("HLS no soportado");
      }

    // 2) Si es .mpd → DASH con Shaka
    } else if (url.endsWith(".mpd")) {
      shaka.polyfill.installAll();
      if (shaka.Player.isBrowserSupported()) {
        shakaPlayer = new shaka.Player(video);
        shakaPlayer.load(url).catch(err => {
          console.error("Shaka Error:", err);
          setError("Error reproducción DASH");
        });
      } else {
        setError("Shaka no soportado");
      }

    // 3) Cualquier otro (mp4, mkv, etc) → HTML5 nativo
    } else {
      video.src = url;
      video.addEventListener("error", () => setError("Error reproducción nativa de vídeo"));
    }

    return () => {
      if (hls) hls.destroy();
      if (shakaPlayer) shakaPlayer.destroy();
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
