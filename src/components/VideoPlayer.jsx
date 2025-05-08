// src/components/VideoPlayer.jsx
import React from "react";
import ReactPlayer from "react-player";

export function VideoPlayer({ url, support4K = false }) {
  return (
    <div className="player-wrapper relative pt-[56.25%]"> 
      {/* 16:9 aspect ratio */}
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
        config={{
          file: {
            attributes: {
              // permitimos buffers más grandes si es 4K
              preload: "auto",
            },
            hlsOptions: {
              maxBufferLength: support4K ? 30 : 10,
            },
          },
        }}
      />
    </div>
  );
}

export default VideoPlayer;
