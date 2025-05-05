// src/pages/AdminPanel.jsx
import React, { useState } from "react";
import { useAuth } from "../utils/AuthContext.jsx";
import { Input } from "../components/ui/input.jsx";
import { Button } from "../components/ui/button.jsx";

export default function AdminPanel() {
  const { user } = useAuth();
  const [m3uName, setM3uName] = useState("");
  const [m3uContent, setM3uContent] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API = import.meta.env.VITE_API_URL;
  const authHeader = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  const submitM3u = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/m3u/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ fileName: m3uName, content: m3uContent })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error desconocido");
      setSuccessMsg(j.message);
      setErrorMsg("");
    } catch (error) {
      setErrorMsg(error.message);
      setSuccessMsg("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitVideo = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ title: videoTitle, url: videoUrl })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error desconocido");
      setSuccessMsg("Vídeo agregado");
      setErrorMsg("");
    } catch (error) {
      setErrorMsg(error.message);
      setSuccessMsg("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user?.token || user?.role !== "admin") return <p className="p-4">Acceso denegado</p>;

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Panel Admin</h1>
      
      {successMsg && (
        <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMsg}
        </div>
      )}

      <form onSubmit={submitM3u} className="space-y-4 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold">Subir lista M3U</h2>
        <Input
          placeholder="Nombre de archivo (e.g. canales.m3u)"
          value={m3uName}
          onChange={e => setM3uName(e.target.value)}
          required
        />
        <textarea
          rows="6"
          className="w-full p-2 border rounded"
          placeholder="#EXTM3U\n..."
          value={m3uContent}
          onChange={e => setM3uContent(e.target.value)}
          required
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Subiendo..." : "Subir M3U"}
        </Button>
      </form>

      <form onSubmit={submitVideo} className="space-y-4 p-6 border rounded-lg">
        <h2 className="text-xl font-semibold">Agregar Vídeo VOD</h2>
        <Input
          placeholder="Título de la película/serie"
          value={videoTitle}
          onChange={e => setVideoTitle(e.target.value)}
          required
        />
        <Input
          placeholder="Enlace Dropbox (mp4/mkv)"
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          required
        />
        <Button 
          type="submit" 
          className="bg-green-600 hover:bg-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Procesando..." : "Agregar Vídeo"}
        </Button>
      </form>

      <div className="pt-4 text-center">
        <Button
          onClick={() => window.location.href = "/subir-m3u"}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Ir a vista Subir M3U avanzada
        </Button>
      </div>
    </div>
  );
}