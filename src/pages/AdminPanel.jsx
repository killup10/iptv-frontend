// src/pages/AdminPanel.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
// Asumiré que tienes componentes Input y Button simples, o puedes usar los de Tailwind directamente
// import { Input } from "../components/ui/input.jsx"; // Si los tienes
// import { Button } from "../components/ui/button.jsx"; // Si los tienes

// Componente Tab simple (puedes mantener el tuyo si es diferente)
const Tab = ({ label, value, activeTab, onTabChange }) => (
  <button
    onClick={() => onTabChange(value)}
    className={`px-4 py-2 font-medium transition-colors duration-150
      ${activeTab === value 
        ? 'border-b-2 border-red-500 text-white' 
        : 'text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-gray-500'}`}
  >
    {label}
  </button>
);

export default function AdminPanel() {
  const { user } = useAuth();
  const token = user?.token;
  const API_URL = import.meta.env.VITE_API_URL;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  const jsonAuthHeader = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : {'Content-Type': 'application/json'};


  // Estados para M3U
  const [m3uFile, setM3uFile] = useState(null);
  
  // Estados para VOD (Películas/Series) - Añadidos más campos
  const [vodId, setVodId] = useState(null); // Para saber si estamos editando
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLogo, setVideoLogo] = useState(""); // Usaremos 'logo' como el thumbnail principal
  const [videoDescription, setVideoDescription] = useState("");
  const [videoTrailerUrl, setVideoTrailerUrl] = useState("");
  const [videoCategory, setVideoCategory] = useState("General"); // Categoría para VOD
  const [videoReleaseYear, setVideoReleaseYear] = useState("");
  const [videoIsFeatured, setVideoIsFeatured] = useState(false);
  const [videoIsActive, setVideoIsActive] = useState(true);
  const [videoTipo, setVideoTipo] = useState("pelicula"); // 'pelicula' o 'serie'

  // Estados para Canales (Manual y Edición)
  const [channelId, setChannelId] = useState(null); // Para saber si estamos editando
  const [channelName, setChannelName] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [channelLogo, setChannelLogo] = useState("");
  const [channelCategory, setChannelCategory] = useState("General");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelIsActive, setChannelIsActive] = useState(true);

  // Listas y UI
  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]); // Para VOD (películas y series)
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("m3u"); // Pestañas: m3u, add_channel, edit_channel, add_vod, edit_vod

  // --- Fetch Data ---
  const fetchChannels = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/channels/list`, { headers: authHeader }); // Asume que /list devuelve todos para admin o usa otra ruta
      if (!res.ok) throw new Error('Error al cargar canales');
      const data = await res.json();
      setChannels(data || []);
    } catch (err) { setErrorMsg(err.message || "Error fetching channels"); }
  };

  const fetchVideos = async () => { // VOD (películas y series)
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/videos`, { headers: authHeader }); // Endpoint protegido que lista todos los VODs
      if (!res.ok) throw new Error('Error al cargar videos VOD');
      const data = await res.json();
      setVideos(data || []);
    } catch (err) { setErrorMsg(err.message || "Error fetching VODs"); }
  };

  useEffect(() => {
    if (token) { // Solo hacer fetch si hay token
      if (activeTab === "manage_channels" || activeTab === "add_channel") fetchChannels();
      if (activeTab === "manage_vod" || activeTab === "add_vod") fetchVideos();
    }
  }, [activeTab, token]);


  // --- Handlers M3U ---
  const submitM3u = async (e) => {
    e.preventDefault();
    if (!m3uFile) return setErrorMsg("Selecciona un archivo M3U");
    setIsSubmitting(true); setErrorMsg(""); setSuccessMsg("");
    const fd = new FormData();
    fd.append("file", m3uFile); // El backend espera "file" para el upload de M3U
    try {
      const res = await fetch(`${API_URL}/api/videos/upload-m3u`, { // Este endpoint guarda en Channels ahora
        method: "POST",
        headers: authHeader, // No Content-Type aquí, FormData lo establece
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setSuccessMsg(data.message || "M3U procesado exitosamente.");
      setM3uFile(null); e.target.reset(); // Limpiar input de archivo
      fetchChannels(); // Recargar lista de canales
    } catch (err) { setErrorMsg(err.message || "Error al subir M3U"); console.error(err);
    } finally { setIsSubmitting(false); }
  };

  // --- Handlers Canales ---
  const clearChannelForm = () => {
    setChannelId(null); setChannelName(""); setChannelUrl(""); 
    setChannelLogo(""); setChannelCategory("General"); 
    setChannelDescription(""); setChannelIsActive(true);
  };

  const handleEditChannelClick = (channel) => {
    setChannelId(channel.id || channel._id);
    setChannelName(channel.name || "");
    setChannelUrl(channel.url || "");
    setChannelLogo(channel.logo || channel.thumbnail || "");
    setChannelCategory(channel.category || "General");
    setChannelDescription(channel.description || "");
    setChannelIsActive(channel.active !== undefined ? channel.active : true);
    setActiveTab("add_channel"); // Reutilizar el formulario para editar
    setSuccessMsg(""); setErrorMsg("");
  };
  
  const submitChannel = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); setErrorMsg(""); setSuccessMsg("");
    const channelData = {
      name: channelName, url: channelUrl, logo: channelLogo,
      category: channelCategory, description: channelDescription, active: channelIsActive,
    };

    try {
      let res;
      if (channelId) { // Editando
        res = await fetch(`${API_URL}/api/channels/${channelId}`, { // Endpoint PUT /api/channels/:id
          method: "PUT", headers: jsonAuthHeader, body: JSON.stringify(channelData),
        });
      } else { // Creando
        res = await fetch(`${API_URL}/api/channels`, { // Endpoint POST /api/channels
          method: "POST", headers: jsonAuthHeader, body: JSON.stringify(channelData),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setSuccessMsg(channelId ? "Canal actualizado." : "Canal agregado.");
      clearChannelForm();
      fetchChannels(); // Recargar lista
    } catch (err) { setErrorMsg(err.message || "Error guardando canal"); console.error(err);
    } finally { setIsSubmitting(false); }
  };

  const deleteChannel = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este canal?")) return;
    setIsSubmitting(true); setErrorMsg(""); setSuccessMsg("");
    try {
      const res = await fetch(`${API_URL}/api/channels/${id}`, { method: "DELETE", headers: authHeader });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || `Error ${res.status}`); }
      setSuccessMsg("Canal eliminado.");
      fetchChannels();
    } catch (err) { setErrorMsg(err.message || "Error eliminando canal"); console.error(err);
    } finally { setIsSubmitting(false); }
  };


  // --- Handlers VOD (Películas/Series) ---
  const clearVodForm = () => {
    setVodId(null); setVideoTitle(""); setVideoUrl(""); setVideoLogo("");
    setVideoDescription(""); setVideoTrailerUrl(""); setVideoCategory("General");
    setVideoReleaseYear(""); setVideoIsFeatured(false); setVideoIsActive(true);
    setVideoTipo("pelicula");
  };

  const handleEditVodClick = (video) => {
    setVodId(video.id || video._id);
    setVideoTitle(video.title || video.name || "");
    setVideoUrl(video.url || "");
    setVideoLogo(video.logo || video.thumbnail || "");
    setVideoDescription(video.description || "");
    setVideoTrailerUrl(video.trailerUrl || "");
    setVideoCategory(video.category || "General");
    setVideoReleaseYear(video.releaseYear || "");
    setVideoIsFeatured(video.isFeatured || false);
    setVideoIsActive(video.active !== undefined ? video.active : true);
    setVideoTipo(video.tipo || "pelicula");
    setActiveTab("add_vod"); // Reutilizar el formulario para editar
    setSuccessMsg(""); setErrorMsg("");
  };

  const submitVideo = async (e) => { // Para Películas y Series
    e.preventDefault();
    setIsSubmitting(true); setErrorMsg(""); setSuccessMsg("");
    const videoData = {
      title: videoTitle, url: videoUrl, logo: videoLogo, description: videoDescription,
      trailerUrl: videoTrailerUrl, category: videoCategory, releaseYear: parseInt(videoReleaseYear) || null,
      isFeatured: videoIsFeatured, active: videoIsActive, tipo: videoTipo,
    };

    try {
      let res;
      const endpointBase = `${API_URL}/api/videos`; // Endpoint base para VOD
      if (vodId) { // Editando VOD
        // Necesitas un endpoint PUT /api/videos/:id en tu videos.routes.js
        res = await fetch(`${endpointBase}/${vodId}`, {
          method: "PUT", headers: jsonAuthHeader, body: JSON.stringify(videoData),
        });
      } else { // Creando VOD
        res = await fetch(`${endpointBase}/upload-link`, { // Tu endpoint existente para crear VOD
          method: "POST", headers: jsonAuthHeader, body: JSON.stringify(videoData),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`);
      setSuccessMsg(vodId ? "VOD actualizado." : "VOD agregado.");
      clearVodForm();
      fetchVideos(); // Recargar lista de VODs
    } catch (err) { setErrorMsg(err.message || "Error guardando VOD"); console.error(err);
    } finally { setIsSubmitting(false); }
  };
  
  const deleteVideo = async (id) => { // Para VOD
    if (!window.confirm("¿Seguro que quieres eliminar este VOD?")) return;
    setIsSubmitting(true); setErrorMsg(""); setSuccessMsg("");
    try {
      // Necesitas un endpoint DELETE /api/videos/:id en tu videos.routes.js
      const res = await fetch(`${API_URL}/api/videos/${id}`, { method: "DELETE", headers: authHeader });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || `Error ${res.status}`);}
      setSuccessMsg("VOD eliminado.");
      fetchVideos();
    } catch (err) { setErrorMsg(err.message || "Error eliminando VOD"); console.error(err);
    } finally { setIsSubmitting(false); }
  };


  // --- Renderizado ---
  if (!token || user?.role !== "admin") {
    return <p className="p-4 text-red-500 text-center">Acceso denegado. Debes ser administrador.</p>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-5xl mx-auto bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-red-500">Panel de Administración</h1>
      
      {/* Mensajes de estado */}
      {errorMsg && <div className="p-3 bg-red-700 text-white rounded-md shadow-lg animate-pulse_once">{errorMsg}</div>}
      {successMsg && <div className="p-3 bg-green-700 text-white rounded-md shadow-lg animate-pulse_once">{successMsg}</div>}

      {/* Pestañas */}
      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-6">
        <Tab label="Subir M3U" value="m3u" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label={channelId ? "Editar Canal" : "Agregar Canal"} value="add_channel" activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if(!channelId && tab === 'add_channel') clearChannelForm(); }} />
        <Tab label="Gestionar Canales" value="manage_channels" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label={vodId ? "Editar VOD" : "Agregar VOD"} value="add_vod" activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if(!vodId && tab === 'add_vod') clearVodForm(); }} />
        <Tab label="Gestionar VOD" value="manage_vod" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Contenido de Pestañas */}
      {activeTab === "m3u" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Subir Archivo de Canales M3U</h2>
          <p className="text-sm text-gray-400 mb-4">Esto procesará el M3U y guardará los canales en la colección "Channels".</p>
          <form onSubmit={submitM3u} className="space-y-4">
            <input type="file" accept=".m3u,.m3u8" onChange={(e) => setM3uFile(e.target.files[0])}
                   className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"/>
            <button type="submit" disabled={isSubmitting || !m3uFile} 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">
              {isSubmitting ? "Subiendo y Procesando..." : "Subir y Procesar M3U"}
            </button>
          </form>
        </section>
      )}

      {activeTab === "add_channel" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">{channelId ? "Editar Canal" : "Agregar Nuevo Canal Manualmente"}</h2>
          <form onSubmit={submitChannel} className="space-y-4">
            <input type="text" placeholder="Nombre del Canal" value={channelName} onChange={(e) => setChannelName(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500"/>
            <input type="url" placeholder="URL del Stream (M3U8, MP4, etc.)" value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500"/>
            <input type="url" placeholder="URL del Logo (opcional)" value={channelLogo} onChange={(e) => setChannelLogo(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500"/>
            <input type="text" placeholder="Categoría (ej. General, Deportes)" value={channelCategory} onChange={(e) => setChannelCategory(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500"/>
            <textarea placeholder="Descripción (opcional)" value={channelDescription} onChange={(e) => setChannelDescription(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500 h-24"></textarea>
            <label className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" checked={channelIsActive} onChange={(e) => setChannelIsActive(e.target.checked)} className="form-checkbox h-5 w-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
              <span>Activo</span>
            </label>
            <div className="flex gap-4">
                <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">
                    {isSubmitting ? (channelId ? "Actualizando..." : "Agregando...") : (channelId ? "Actualizar Canal" : "Agregar Canal")}
                </button>
                {channelId && <button type="button" onClick={() => {clearChannelForm(); setActiveTab("add_channel");}} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">Cancelar Edición</button>}
            </div>
          </form>
        </section>
      )}

      {activeTab === "manage_channels" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Gestionar Canales Existentes</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {channels.map((ch) => (
              <div key={ch.id || ch._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 rounded-md">
                <div className="flex-grow mb-2 sm:mb-0">
                  <strong className="text-lg text-white">{ch.name}</strong>
                  <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md" title={ch.url}>{ch.url}</p>
                  <p className="text-xs text-gray-500">Categoría: {ch.category} - {ch.active ? "Activo" : "Inactivo"}</p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button onClick={() => handleEditChannelClick(ch)} className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1 rounded">Editar</button>
                  <button onClick={() => deleteChannel(ch.id || ch._id)} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded disabled:opacity-50">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "add_vod" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">{vodId ? "Editar VOD" : "Agregar Video/Serie (VOD)"}</h2>
          <form onSubmit={submitVideo} className="space-y-4">
            <select value={videoTipo} onChange={(e) => setVideoTipo(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500">
                <option value="pelicula">Película</option>
                <option value="serie">Serie</option>
            </select>
            <input type="text" placeholder="Título" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500"/>
            <input type="url" placeholder="URL del Video (MP4, MKV, M3U8)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500"/>
            <input type="url" placeholder="URL del Logo/Thumbnail (opcional)" value={videoLogo} onChange={(e) => setVideoLogo(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500"/>
            <textarea placeholder="Descripción (opcional)" value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500 h-24"></textarea>
            <input type="url" placeholder="URL del Tráiler (opcional)" value={videoTrailerUrl} onChange={(e) => setVideoTrailerUrl(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500"/>
            <input type="text" placeholder="Categoría (ej. Estrenos 2025, Netflix Series)" value={videoCategory} onChange={(e) => setVideoCategory(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500"/>
            <input type="number" placeholder="Año de Lanzamiento (opcional)" value={videoReleaseYear} onChange={(e) => setVideoReleaseYear(e.target.value)} className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-red-500 focus:border-red-500"/>
            <label className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" checked={videoIsFeatured} onChange={(e) => setVideoIsFeatured(e.target.checked)} className="form-checkbox h-5 w-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
              <span>Destacado (para Home)</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" checked={videoIsActive} onChange={(e) => setVideoIsActive(e.target.checked)} className="form-checkbox h-5 w-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
              <span>Activo (visible para usuarios)</span>
            </label>
             <div className="flex gap-4">
                <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">
                  {isSubmitting ? (vodId ? "Actualizando..." : "Agregando...") : (vodId ? "Actualizar VOD" : "Agregar VOD")}
                </button>
                {vodId && <button type="button" onClick={() => {clearVodForm(); setActiveTab("add_vod");}} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">Cancelar Edición</button>}
            </div>
          </form>
        </section>
      )}

      {activeTab === "manage_vod" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Gestionar VOD Existente (Películas/Series)</h2>
           <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {videos.map((vid) => (
              <div key={vid.id || vid._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 rounded-md">
                <div className="flex-grow mb-2 sm:mb-0">
                  <strong className="text-lg text-white">{vid.title}</strong> ({vid.tipo})
                  <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md" title={vid.url}>{vid.url}</p>
                  <p className="text-xs text-gray-500">Categoría: {vid.category} - {vid.active ? "Activo" : "Inactivo"} - {vid.isFeatured ? "Destacado" : "No Destacado"}</p>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                  <button onClick={() => handleEditVodClick(vid)} className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1 rounded">Editar</button>
                  <button onClick={() => deleteVideo(vid.id || vid._id)} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded disabled:opacity-50">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}