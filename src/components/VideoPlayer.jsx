// src/components/VideoPlayer.jsx
import React from "react";
import ReactPlayer from "react-player";
import Hls from "hls.js";

export function VideoPlayer({ url, support4K = false }) {
  const fileConfig = {
    forceVideo: true,              // fuerza usar etiqueta <video>
    forceHLS: true,                // fuerza hls.js incluso si Safari
    hlsOptions: {
      maxBufferLength: support4K ? 30 : 10,
      xhrSetup: (xhr, url) => {
        // si el servidor requiere credenciales o headers custom, ajusta aquí
        xhr.withCredentials = false;
      },
    },
    hlsVersion: Hls.version,       // usa la misma versión de hls.js
  };

  return (
    <div className="relative pt-[56.25%]">
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
        config={{ file: fileConfig }}
      />
    </div>
  );
}

export default VideoPlayer;
