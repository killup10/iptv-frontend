// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Input } from "../components/ui/input.jsx";
import { Button } from "../components/ui/button.jsx";
import { Tabs } from "../components/ui/tabs.jsx";
import { Tab } from "../components/ui/tab.jsx";

export default function AdminPanel() {
  const { user } = useAuth();
  const token = user?.token;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const [m3uFile, setM3uFile] = useState(null);
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

  // Carga lista de canales cuando abres la pestaña "Canales"
  useEffect(() => {
    if (activeTab === "channels") fetchChannels();
  }, [activeTab]);

  const fetchChannels = async () => {
    try {
      const res = await fetch(`${API}/api/channels/list`, { headers: authHeader });
      const text = await res.text();
      // si recibimos HTML (login) en vez de JSON, lanzamos error
      if (!res.ok || text.trim().startsWith("<!DOCTYPE")) {
        throw new Error("Token inválido o sesión expirada");
      }
      const data = JSON.parse(text);
      setChannels(data);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const submitM3u = async (e) => {
    e.preventDefault();
    if (!m3uFile) {
      setErrorMsg("Selecciona un archivo M3U");
      return;
    }
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append("file", m3uFile);
    try {
      const res = await fetch(`${API}/api/m3u/upload-m3u`, {
        method: "POST",
        headers: authHeader,
        body: fd,
      });
      const text = await res.text();
      if (!res.ok || text.trim().startsWith("<!DOCTYPE")) {
        throw new Error("Token inválido o error al subir M3U");
      }
      const data = JSON.parse(text);
      setSuccessMsg(data.message);
      setErrorMsg("");
      setM3uFile(null);
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
      const text = await res.text();
      if (!res.ok || text.trim().startsWith("<!DOCTYPE")) {
        const err = JSON.parse(text);
        throw new Error(err.error || "Error al agregar canal");
      }
      setSuccessMsg("Canal agregado");
      setErrorMsg("");
      setChannelName("");
      setChannelUrl("");
      fetchChannels();
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
      const text = await res.text();
      if (!res.ok || text.trim().startsWith("<!DOCTYPE")) {
        const err = JSON.parse(text);
        throw new Error(err.error || "Error al agregar video");
      }
      setSuccessMsg("Video VOD agregado");
      setErrorMsg("");
      setVideoTitle("");
      setVideoUrl("");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || user.role !== "admin") {
    return <p className="p-4 text-red-500">Acceso denegado</p>;
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>

      {errorMsg && <div className="p-3 bg-red-800 rounded">{errorMsg}</div>}
      {successMsg && <div className="p-3 bg-green-800 rounded">{successMsg}</div>}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <Tab value="m3u" label="Archivo M3U" />
        <Tab value="channels" label="Canales en Vivo" />
        <Tab value="vod" label="Videos VOD" />
      </Tabs>

      {activeTab === "m3u" && (
        <form onSubmit={submitM3u} className="p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl mb-4">Subir lista M3U</h2>
          <input
            type="file"
            accept=".m3u,.txt"
            onChange={(e) => setM3uFile(e.target.files[0])}
            className="block w-full text-sm text-white file:bg-red-600 file:text-white file:py-2 file:px-4 rounded"
          />
          <Button type="submit" disabled={isSubmitting} className="mt-4 bg-blue-600">
            {isSubmitting ? "Subiendo..." : "Subir M3U"}
          </Button>
        </form>
      )}

      {activeTab === "channels" && (
        <>
          <form onSubmit={submitChannel} className="p-6 bg-gray-800 rounded-lg space-y-4">
            <h2 className="text-xl">Agregar Canal</h2>
            <Input
              placeholder="Nombre"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="bg-gray-700"
            />
            <Input
              placeholder="URL M3U8"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              className="bg-gray-700"
            />
            <Button disabled={isSubmitting} className="bg-blue-600">
              {isSubmitting ? "Agregando..." : "Agregar Canal"}
            </Button>
          </form>

          <div className="p-6 bg-gray-800 rounded-lg">
            <h2 className="text-xl mb-4">Canales Existentes</h2>
            {channels.map((ch) => (
              <div key={ch._id} className="flex justify-between mb-2">
                <span>{ch.name}</span>
                <Button onClick={() => {/* TODO: eliminar */}} className="bg-red-600">
                  Eliminar
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "vod" && (
        <form onSubmit={submitVideo} className="p-6 bg-gray-800 rounded-lg space-y-4">
          <h2 className="text-xl">Agregar Video VOD</h2>
          <Input
            placeholder="Título"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="bg-gray-700"
          />
          <Input
            placeholder="URL MP4/MKV"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="bg-gray-700"
          />
          <Button disabled={isSubmitting} className="bg-blue-600">
            {isSubmitting ? "Procesando..." : "Agregar VOD"}
          </Button>
        </form>
      )}
    </div>
  );
}
