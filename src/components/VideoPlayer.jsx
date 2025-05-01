import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Loader } from "./Loader";

export const VideoPlayer = ({ url, support4K }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    let hls;

    if (!video) return;

    const onCanPlay = () => {
      setLoading(false);
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('canplay', onCanPlay);
    } else if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        console.error("Error de reproducción:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Error de red, intentando reconectar...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Error de media, intentando recuperar...");
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else {
      console.error("Este navegador no soporta reproducción HLS.");
      setLoading(false);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      video.removeEventListener('canplay', onCanPlay);
    };
  }, [url]);

  return (
    <div className="flex justify-center">
      {loading ? (
        <Loader />
      ) : (
        <video
          ref={videoRef}
          controls
          className="w-full max-w-5xl rounded-xl shadow-lg"
          style={{ maxHeight: support4K ? "100%" : "720px" }}
        />
      )}
    </div>
  );
};
