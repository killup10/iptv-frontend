// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Input } from "../components/ui/input.jsx";
import { Button } from "../components/ui/button.jsx";
import { Tabs } from "../components/ui/tabs.jsx";
import { Tab } from "../components/ui/tab.jsx";

export default function AdminPanel() {
  const { user } = useAuth();
  const authHeader = { Authorization: `Bearer ${user?.token}` };

  // Estados
  const [m3uName, setM3uName] = useState("");
  const [m3uContent, setM3uContent] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [channels, setChannels] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("m3u");

  const API = import.meta.env.VITE_API_URL;

  // Fetch canales cuando están en pestaña "channels"
  useEffect(() => {
    if (activeTab === "channels") fetchChannels();
  }, [activeTab]);

  const fetchChannels = async () => {
    try {
      const res = await fetch(`${API}/api/channels/list`, { headers: authHeader });
      if (!res.ok) throw new Error((await res.json()).error || "Error al obtener canales");
      setChannels(await res.json());
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const submitM3u = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/m3u/upload-m3u`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ fileName: m3uName, content: m3uContent }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error desconocido");
      setSuccessMsg(j.message);
      setM3uName("");
      setM3uContent("");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitVideo = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/videos/upload-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ title: videoTitle, url: videoUrl }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error desconocido");
      setSuccessMsg("Vídeo agregado correctamente");
      setVideoTitle("");
      setVideoUrl("");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitChannel = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/api/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ name: channelName, url: channelUrl }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Error desconocido");
      setSuccessMsg("Canal agregado correctamente");
      setChannelName("");
      setChannelUrl("");
      fetchChannels();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteChannel = async (id) => {
    if (!confirm("¿Eliminar este canal?")) return;
    try {
      const res = await fetch(`${API}/api/channels/${id}`, { method: "DELETE", headers: authHeader });
      if (!res.ok) throw new Error((await res.json()).error || "Error desconocido");
      setSuccessMsg("Canal eliminado");
      fetchChannels();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    setSuccessMsg("");
    setErrorMsg("");
  }, [activeTab]);

  if (!user?.token || user.role !== "admin") return <p className="p-4">Acceso denegado</p>;

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>
      {successMsg && <div className="p-3 bg-green-800 border-green-600 rounded text-white">{successMsg}</div>}
      {errorMsg && <div className="p-3 bg-red-800 border-red-600 rounded text-white">{errorMsg}</div>}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <Tab value="m3u" label="Archivo M3U" />
        <Tab value="channels" label="Canales en Vivo" />
        <Tab value="vod" label="Videos VOD" />
      </Tabs>
      {activeTab === "m3u" && (
        <form onSubmit={submitM3u} className="space-y-4 p-6 border-gray-700 rounded-lg bg-gray-800 border">
          <h2 className="text-xl font-semibold">Subir lista M3U</h2>
          <Input placeholder="Nombre de archivo" value={m3uName} onChange={e => setM3uName(e.target.value)} className="bg-gray-700" required />
          <textarea rows="6" className="w-full p-2 bg-gray-700 border-gray-600 rounded" placeholder="Contenido M3U" value={m3uContent} onChange={e => setM3uContent(e.target.value)} required />
          <Button type="submit" disabled={isSubmitting}>Subir M3U</Button>
        </form>
      )}
      {activeTab === "channels" && (
        <div className="space-y-6">
          <form onSubmit={submitChannel} className="space-y-4 p-6 border-gray-700 rounded-lg bg-gray-800 border">
            <h2 className="text-xl font-semibold">Agregar Canal</h2>
            <Input placeholder="Nombre de canal" value={channelName} onChange={e => setChannelName(e.target.value)} className="bg-gray-700" required />
            <Input placeholder="URL de stream" value={channelUrl} onChange={e => setChannelUrl(e.target.value)} className="bg-gray-700" required />
            <Button type="submit" disabled={isSubmitting}>Agregar Canal</Button>
          </form>
          <div className="bg-gray-800 p-6 rounded-lg border-gray-700 border">
            <h2 className="text-xl font-semibold mb-4">Canales Existentes</h2>
            {channels.length === 0 ? <p>No hay canales</p> : channels.map(c => (
              <div key={c._id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                <div className="flex items-center">
                  {c.logo && <img src={c.logo} alt="logo" className="w-10 h-6 mr-3 rounded" />}
                  <div>
                    <p className="font-bold">{c.name}</p>
                    <p className="text-sm text-gray-400 truncate">{c.url}</p>
                  </div>
                </div>
                <Button onClick={() => deleteChannel(c._id)} className="bg-red-600">Eliminar</Button>
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === "vod" && (
        <form onSubmit={submitVideo} className="space-y-4 p-6 border-gray-700 rounded-lg bg-gray-800 border">
          <h2 className="text-xl font-semibold">Agregar Vídeo VOD</h2>
          <Input placeholder="Título de vídeo" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="bg-gray-700" required />
          <Input placeholder="Enlace (mp4/mkv)" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="bg-gray-700" required />
          <Button type="submit" disabled={isSubmitting}>Agregar Vídeo</Button>
        </form>
      )}
    </div>
  );
}
