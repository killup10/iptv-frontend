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

  // Estado para M3U de archivo
  const [m3uName, setM3uName] = useState("");
  const [m3uContent, setM3uContent] = useState("");
  
  // Estado para videos VOD
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  
  // Estado para canales en vivo (M3U8)
  const [channelName, setChannelName] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [channels, setChannels] = useState([]);
  
  // Estado para mensajes y carga
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para pestañas
  const [activeTab, setActiveTab] = useState("m3u");

  const API = import.meta.env.VITE_API_URL;

  // Cargar canales existentes al iniciar
  useEffect(() => {
    if (activeTab === "channels") {
      fetchChannels();
    }
  }, [activeTab]);

  const fetchChannels = async () => {
    try {
      console.log("Obteniendo canales desde:", `${API}/api/channels/list`);
      const res = await fetch(`${API}/api/channels/list`, {
        headers: authHeader
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al obtener canales");
      }
      const data = await res.json();
      console.log("Canales recibidos:", data);
      setChannels(data || []);
    } catch (error) {
      console.error("Error al cargar canales:", error);
      setErrorMsg("No se pudieron cargar los canales existentes");
    }
  };

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
      setM3uName("");
      setM3uContent("");
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
      const res = await fetch(`${API}/api/videos/upload-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ title: videoTitle, url: videoUrl })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error desconocido");
      setSuccessMsg("Vídeo agregado correctamente");
      setErrorMsg("");
      setVideoTitle("");
      setVideoUrl("");
    } catch (error) {
      setErrorMsg(error.message);
      setSuccessMsg("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitChannel = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      console.log("Enviando canal:", { name: channelName, url: channelUrl });
      const res = await fetch(`${API}/api/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ name: channelName, url: channelUrl })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error desconocido");
      }
      await res.json();
      setSuccessMsg("Canal agregado correctamente");
      setErrorMsg("");
      setChannelName("");
      setChannelUrl("");
      fetchChannels();
    } catch (error) {
      console.error("Error al agregar canal:", error);
      setErrorMsg(error.message);
      setSuccessMsg("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteChannel = async id => {
    if (!confirm('¿Estás seguro de eliminar este canal?')) return;
    try {
      const res = await fetch(`${API}/api/channels/${id}`, {
        method: "DELETE",
        headers: authHeader
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error desconocido");
      }
      setSuccessMsg("Canal eliminado correctamente");
      fetchChannels();
    } catch (error) {
      console.error('Error al eliminar canal:', error);
      setErrorMsg(error.message || "Error al eliminar canal");
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
      {successMsg && <div className="p-3 bg-green-800 border border-green-600 rounded text-white">{successMsg}</div>}
      {errorMsg && <div className="p-3 bg-red-800 border border-red-600 rounded text-white">{errorMsg}</div>}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <Tab value="m3u" label="Archivo M3U" />
        <Tab value="channels" label="Canales en Vivo (M3U8)" />
        <Tab value="vod" label="Videos VOD" />
      </Tabs>
      {activeTab === "m3u" && (
        <form onSubmit={submitM3u} className="space-y-4 p-6 border border-gray-700 rounded-lg bg-gray-800">
          <h2 className="text-xl font-semibold">Subir lista M3U</h2>
          <p className="text-gray-400 text-sm">Sube un archivo M3U completo con múltiples canales</p>
          <Input placeholder="Nombre de archivo (e.g. canales.m3u)" value={m3uName} onChange={e => setM3uName(e.target.value)} className="bg-gray-700 text-white border-gray-600" required />
          <textarea rows="6" className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded" placeholder="#EXTM3U\n#EXTINF:-1,Canal Uno\nhttp://example.com/stream1.m3u8" value={m3uContent} onChange={e => setM3uContent(e.target.value)} required />
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">{isSubmitting ? "Subiendo..." : "Subir M3U"}</Button>
        </form>
      )}
      {activeTab === "channels" && (
        <div className="space-y-6">
          <form onSubmit={submitChannel} className="space-y-4 p-6 border border-gray-700 rounded-lg bg-gray-800">
            <h2 className="text-xl font-semibold">Agregar Canal en Vivo</h2>
            <p className="text-gray-400 text-sm">Agrega enlaces M3U8 individuales para canales en vivo</p>
            <Input placeholder="Nombre del canal (e.g. Latina TV)" value={channelName} onChange={e => setChannelName(e.target.value)} className="bg-gray-700 text-white border-gray-600" required />
            <Input placeholder="URL del stream M3U8" value={channelUrl} onChange={e => setChannelUrl(e.target.value)} className="bg-gray-700 text-white border-gray-600" required />
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">{isSubmitting ? "Agregando..." : "Agregar Canal"}</Button>
          </form>
          <div className="p-6 border border-gray-700 rounded-lg bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">Canales Existentes</h2>
            {channels.length === 0 ? (
              <p className="text-gray-400">No hay canales registrados</p>
            ) : (
              <div className="space-y-3">
                {channels.map(channel => (
                  <div key={channel._id} className="p-3 bg-gray-700 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      {channel.logo && <img src={channel.logo} alt="logo" className="w-10 h-6 object-contain rounded mr-3" />}
                      <div>
                        <h4 className="font-bold">{channel.name}</h4>
                        <p className="text-sm text-gray-400 truncate">{channel.url}</p>
                      </div>
                    </div>
                    <Button onClick={() => deleteChannel(channel._id)} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "vod" && (
        <form onSubmit={submitVideo} className="space-y-4 p-6 border border-gray-700 rounded-lg bg-gray-800">
          <h2 className="text-xl font-semibold">Agregar Vídeo VOD</h2>
          <p className="text-gray-400 text-sm">Agrega películas o series desde enlaces externos (Dropbox, etc.)</p>
          <Input placeholder="Título de la película/serie" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="bg-gray-700 text-white border-gray-600" required />
          <Input placeholder="Enlace del video (mp4/mkv)" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="bg-gray-700 text-white border-gray-600" required />
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>{isSubmitting ? "Procesando..." : "Agregar Vídeo"}</Button>
        </form>
      )}
    </div>
  );
}
