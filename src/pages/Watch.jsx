// src/pages/Watch.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { VideoPlayer } from "../components/VideoPlayer";
import axios from "axios";

export function Watch() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/videos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setVideo(response.data);
      } catch (err) {
        console.error("Error al cargar el video:", err);
        setError("No se pudo cargar el video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  if (loading) return <div className="flex justify-center p-10"><div className="loader"></div></div>;
  if (error) return <div className="text-red-500 p-10 text-center">{error}</div>;
  if (!video) return <div className="text-white p-10 text-center">Video no encontrado</div>;

  return (
    <div className="p-4 bg-zinc-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-4">{video.titulo}</h1>
      <VideoPlayer url={video.url} support4K={true} />
      {video.descripcion && (
        <div className="mt-4 p-4 bg-zinc-800 rounded text-white">
          <p>{video.descripcion}</p>
        </div>
      )}
    </div>
  );
}

export default Watch;