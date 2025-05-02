import React, { useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminPanel() {
  const { user } = useAuth();
  const [m3uName, setM3uName] = useState("");
  const [m3uContent, setM3uContent] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [msg, setMsg] = useState("");

  const API = import.meta.env.VITE_API_URL;

  const authHeader = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const submitM3u = async e => {
    e.preventDefault();
    const res = await fetch(`${API}/api/m3u/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ fileName: m3uName, content: m3uContent })
    });
    const j = await res.json();
    setMsg(j.message || j.error);
  };

  const submitVideo = async e => {
    e.preventDefault();
    const res = await fetch(`${API}/api/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify({ title: videoTitle, url: videoUrl })
    });
    const j = await res.json();
    setMsg(j.video ? "Vídeo agregado" : j.error);
  };

  if (!user?.token) return <p className="p-4">Acceso denegado</p>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Panel Admin</h1>
      {msg && <div className="p-2 bg-green-200">{msg}</div>}

      <form onSubmit={submitM3u} className="space-y-2">
        <h2 className="font-semibold">Subir lista M3U</h2>
        <Input
          placeholder="Nombre de archivo (e.g. canales.m3u)"
          value={m3uName}
          onChange={e => setM3uName(e.target.value)}
        />
        <textarea
          rows="6"
          className="w-full p-2 border rounded"
          placeholder="#EXTM3U\n..."
          value={m3uContent}
          onChange={e => setM3uContent(e.target.value)}
        />
        <Button type="submit">Subir M3U</Button>
      </form>

      <form onSubmit={submitVideo} className="space-y-2">
        <h2 className="font-semibold">Agregar Vídeo VOD</h2>
        <Input
          placeholder="Título de la película/serie"
          value={videoTitle}
          onChange={e => setVideoTitle(e.target.value)}
        />
        <Input
          placeholder="Enlace Dropbox (mp4/mkv)"
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
        />
        <Button type="submit">Agregar Vídeo</Button>
      </form>
    </div>
  );
}
