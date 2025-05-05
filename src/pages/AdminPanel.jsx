// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../utils/AuthContext.jsx";
import { Input } from "../components/ui/input.jsx";
import { Button } from "../components/ui/button.jsx";
import { Tabs } from "../components/ui/tabs.jsx";
import { Tab } from "../components/ui/tab.jsx";

export default function AdminPanel() {
  const { user } = useAuth();
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
  const authHeader = { Authorization: `Bearer ${localStorage.getItem("token")}` };

  // Cargar canales existentes al iniciar
  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await fetch(`${API}/api/channels`, {
        headers: authHeader
      });
      if (!res.ok) throw new Error("Error al obtener canales");
      const data = await res.json();
      setChannels(data);
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
      // Limpiar formulario después de éxito
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
      const res = await fetch(`${API}/api/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ title: videoTitle, url: videoUrl })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error desconocido");
      setSuccessMsg("Vídeo agregado correctamente");
      setErrorMsg("");
      // Limpiar formulario después de éxito
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
      const res = await fetch(`${API}/api/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ name: channelName, url: channelUrl })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Error desconocido");
      setSuccessMsg("Canal agregado correctamente");
      setErrorMsg("");
      // Limpiar formulario después de éxito
      setChannelName("");
      setChannelUrl("");
      // Recargar lista de canales
      fetchChannels();
    } catch (error) {
      setErrorMsg(error.message);
      setSuccessMsg("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteChannel = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este canal?')) return;
    
    try {
      const res = await fetch(`${API}/api/channels/${id}`, {
        method: "DELETE",
        headers: authHeader
      });
      if (!res.ok) throw new Error("Error al eliminar canal");
      setSuccessMsg("Canal eliminado correctamente");
      fetchChannels(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar canal:', error);
      setErrorMsg("Error al eliminar el canal");
    }
  };

  // Limpiar mensajes cuando cambia de pestaña
  useEffect(() => {
    setSuccessMsg("");
    setErrorMsg("");
  }, [activeTab]);

  if (!user?.token || user?.role !== "admin") return <p className="p-4">Acceso denegado</p>;

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>
      
      {successMsg && (
        <div className="p-3 bg-green-800 border border-green-600 text-white rounded">
          {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div className="p-3 bg-red-800 border border-red-600 text-white rounded">
          {errorMsg}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <Tab value="m3u" label="Archivo M3U" />
        <Tab value="channels" label="Canales en Vivo (M3U8)" />
        <Tab value="vod" label="Videos VOD" />
      </Tabs>

      {activeTab === "m3u" && (
        <form onSubmit={submitM3u} className="space-y-4 p-6 border border-gray-700 rounded-lg bg-gray-800">
          <h2 className="text-xl font-semibold">Subir lista M3U</h2>
          <p className="text-gray-400 text-sm">Sube un archivo M3U completo con múltiples canales</p>
          <Input
            placeholder="Nombre de archivo (e.g. canales.m3u)"
            value={m3uName}
            onChange={e => setM3uName(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
            required
          />
          <textarea
            rows="6"
            className="w-full p-2 border rounded bg-gray-700 text-white border-gray-600"
            placeholder="#EXTM3U\n#EXTINF:-1,Canal Uno\nhttp://example.com/stream1.m3u8"
            value={m3uContent}
            onChange={e => setM3uContent(e.target.value)}
            required
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? "Subiendo..." : "Subir M3U"}
          </Button>
        </form>
      )}

      {activeTab === "channels" && (
        <div className="space-y-6">
          <form onSubmit={submitChannel} className="space-y-4 p-6 border border-gray-700 rounded-lg bg-gray-800">
            <h2 className="text-xl font-semibold">Agregar Canal en Vivo</h2>
            <p className="text-gray-400 text-sm">Agrega enlaces M3U8 individuales para canales en vivo</p>
            <Input
              placeholder="Nombre del canal (e.g. Latina TV)"
              value={channelName}
              onChange={e => setChannelName(e.target.value)}
              className="bg-gray-700 text-white border-gray-600"
              required
            />
            <Input
              placeholder="URL del stream M3U8"
              value={channelUrl}
              onChange={e => setChannelUrl(e.target.value)}
              className="bg-gray-700 text-white border-gray-600"
              required
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Agregando..." : "Agregar Canal"}
            </Button>
          </form>

          <div className="p-6 border border-gray-700 rounded-lg bg-gray-800">
            <h2 className="text-xl font-semibold mb-4">Canales Existentes</h2>
            {channels.length === 0 ? (
              <p className="text-gray-400">No hay canales registrados</p>
            ) : (
              <div className="space-y-3">
                {channels.map(channel => (
                  <div key={channel._id} className="p-3 bg-gray-700 rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-bold">{channel.name}</h4>
                      <p className="text-sm text-gray-400 truncate">{channel.url}</p>
                    </div>
                    <Button 
                      onClick={() => deleteChannel(channel._id)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Eliminar
                    </Button>
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
          <Input
            placeholder="Título de la película/serie"
            value={videoTitle}
            onChange={e => setVideoTitle(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
            required
          />
          <Input
            placeholder="Enlace del video (mp4/mkv)"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            className="bg-gray-700 text-white border-gray-600"
            required
          />
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Agregar Vídeo"}
          </Button>
        </form>
      )}
    </div>
  );
}