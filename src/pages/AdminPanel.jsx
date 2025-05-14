// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";

// Componentes UI simples (o usa los tuyos si los tienes en ../components/ui/)
const Tab = ({ label, value, activeTab, onTabChange }) => (
  <button
    onClick={() => onTabChange(value)}
    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap
      ${activeTab === value 
        ? 'border-b-2 border-red-500 text-white' 
        : 'text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-gray-500'}`}
  >
    {label}
  </button>
);
const Input = (props) => <input {...props} className={`w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${props.className || ""}`} />;
const Textarea = (props) => <textarea {...props} className={`w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 h-24 ${props.className || ""}`} />;
const Select = (props) => <select {...props} className={`w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white ${props.className || ""}`} />;
const Button = ({ children, className, disabled, ...props }) => (
    <button 
        {...props} 
        disabled={disabled}
        className={`font-bold py-2 px-4 rounded transition-colors duration-150 ease-in-out ${className || ""} ${disabled ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
    >
        {children}
    </button>
);

export default function AdminPanel() {
  const { user } = useAuth();
  const token = user?.token;
  const API_URL = import.meta.env.VITE_API_URL;
  
  const getAuthHeaders = useCallback((isFormData = false) => {
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }, [token]);

  // Estados M3U
  const [m3uFile, setM3uFile] = useState(null);
  
  // Estados VOD
  const [vodId, setVodId] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLogo, setVideoLogo] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoTrailerUrl, setVideoTrailerUrl] = useState("");
  const [videoCategory, setVideoCategory] = useState("General");
  const [videoReleaseYear, setVideoReleaseYear] = useState(new Date().getFullYear().toString());
  const [videoIsFeatured, setVideoIsFeatured] = useState(false);
  const [videoIsActive, setVideoIsActive] = useState(true);
  const [videoTipo, setVideoTipo] = useState("pelicula");

  // Estados Canales
  const [channelId, setChannelId] = useState(null);
  const [channelName, setChannelName] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [channelLogo, setChannelLogo] = useState("");
  const [channelCategory, setChannelCategory] = useState("General");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelIsActive, setChannelIsActive] = useState(true);

  // Listas y UI
  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("manage_vod"); // Iniciar en Gestionar VOD para pruebas

  const clearMessages = () => { setErrorMsg(""); setSuccessMsg(""); };

  const fetchChannels = useCallback(async () => {
    if (!token) return;
    setIsSubmitting(true); // Usar isSubmitting para indicar carga general de listas
    try {
      const res = await fetch(`${API_URL}/api/channels/list`, { headers: getAuthHeaders() });
      const responseText = await res.text();
      if (!res.ok) { 
        console.error("AdminPanel fetchChannels Error:", res.status, responseText);
        throw new Error(JSON.parse(responseText).error || `Error ${res.status} al cargar canales`);
      }
      const data = JSON.parse(responseText);
      setChannels(data || []);
    } catch (err) { console.error("AdminPanel fetchChannels CATCH Error:", err); setErrorMsg(err.message); setChannels([]);
    } finally { setIsSubmitting(false); }
  }, [token, API_URL, getAuthHeaders]);

  const fetchVideos = useCallback(async () => {
    if (!token) return;
    setIsSubmitting(true); // Usar isSubmitting para indicar carga general de listas
    try {
      const res = await fetch(`${API_URL}/api/videos`, { headers: getAuthHeaders() });
      const responseText = await res.text();
      if (!res.ok) { 
        console.error("AdminPanel fetchVideos Error:", res.status, responseText);
        throw new Error(JSON.parse(responseText).error || `Error ${res.status} al cargar VODs`); 
      }
      const data = JSON.parse(responseText);
      console.log("AdminPanel - fetchVideos - Datos VOD recibidos:", data);
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) { console.error("AdminPanel fetchVideos CATCH Error:", err); setErrorMsg(err.message); setVideos([]);
    } finally { setIsSubmitting(false); }
  }, [token, API_URL, getAuthHeaders]);

  useEffect(() => {
    clearMessages();
    if (token) {
      if (activeTab === "manage_channels") fetchChannels();
      else if (activeTab === "add_channel" && !channelId) clearChannelForm(); // No recargar lista aquí necesariamente
      
      if (activeTab === "manage_vod") fetchVideos();
      else if (activeTab === "add_vod" && !vodId) clearVodForm();
    }
  }, [activeTab, token, channelId, vodId]); // Quitamos fetchChannels y fetchVideos de aquí para evitar bucles

  // --- Handlers M3U ---
  const submitM3u = async (e) => {
    e.preventDefault();
    if (!m3uFile) { setErrorMsg("Selecciona un archivo M3U"); return; }
    setIsSubmitting(true); clearMessages();
    const fd = new FormData();
    fd.append("file", m3uFile); // El backend espera "file"
    try {
      const res = await fetch(`${API_URL}/api/videos/upload-m3u`, {
        method: "POST", headers: getAuthHeaders(true), body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setSuccessMsg(data.message || "M3U procesado.");
      setM3uFile(null); if(e.target.reset) e.target.reset();
      fetchChannels(); 
    } catch (err) { setErrorMsg(err.message); console.error(err);
    } finally { setIsSubmitting(false); }
  };

  // --- Handlers Canales ---
  const clearChannelForm = () => { /* ... (como estaba) ... */ };
  const handleEditChannelClick = (channel) => { /* ... (como estaba) ... */ };
  const submitChannel = async (e) => { /* ... (como estaba) ... */ };
  const deleteChannel = async (id) => { /* ... (como estaba) ... */ };

  // --- Handlers VOD (Películas/Series) ---
  const clearVodForm = () => { /* ... (como estaba, asegurando que videoReleaseYear se ponga a string vacío o año actual) ... */ 
    setVodId(null); setVideoTitle(""); setVideoUrl(""); setVideoLogo("");
    setVideoDescription(""); setVideoTrailerUrl(""); setVideoCategory("General");
    setVideoReleaseYear(new Date().getFullYear().toString()); setVideoIsFeatured(false); 
    setVideoIsActive(true); setVideoTipo("pelicula");
  };
  const handleEditVodClick = (video) => { /* ... (como estaba, asegurando que videoReleaseYear se maneje como string) ... */ 
    setVodId(video.id || video._id);
    setVideoTitle(video.title || video.name || "");
    setVideoUrl(video.url || "");
    setVideoLogo(video.logo || video.thumbnail || "");
    setVideoDescription(video.description || "");
    setVideoTrailerUrl(video.trailerUrl || "");
    setVideoCategory(video.category || "General");
    setVideoReleaseYear(video.releaseYear?.toString() || new Date().getFullYear().toString());
    setVideoIsFeatured(video.isFeatured || false);
    setVideoIsActive(video.active !== undefined ? video.active : true);
    setVideoTipo(video.tipo || "pelicula");
    setActiveTab("add_vod"); 
    clearMessages();
  };

  const submitVideo = async (e) => { /* ... (como estaba, asegurando que videoReleaseYear se parsea a Int o es null) ... */ 
    e.preventDefault();
    if(!videoTitle || !videoUrl) { setErrorMsg("Título y URL del VOD son requeridos."); return; }
    setIsSubmitting(true); clearMessages();
    const videoData = {
      title: videoTitle, url: videoUrl, logo: videoLogo, description: videoDescription,
      trailerUrl: videoTrailerUrl, category: videoCategory, 
      releaseYear: videoReleaseYear ? parseInt(videoReleaseYear) : null,
      isFeatured: videoIsFeatured, active: videoIsActive, tipo: videoTipo,
    };
    try {
      const endpointBase = `${API_URL}/api/videos`;
      const res = vodId 
        ? await fetch(`${endpointBase}/${vodId}`, { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(videoData) })
        : await fetch(`${endpointBase}/upload-link`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(videoData) });
      
      const responseText = await res.text();
      if (!res.ok) {
        try { throw new Error(JSON.parse(responseText).error || JSON.parse(responseText).message || `Error ${res.status}`); }
        catch { throw new Error(`Error ${res.status}: ${responseText.substring(0,100)}`);}
      }
      const data = JSON.parse(responseText);
      setSuccessMsg(vodId ? "VOD actualizado." : "VOD agregado.");
      clearVodForm();
      if(vodId) setActiveTab("manage_vod"); 
      fetchVideos(); 
    } catch (err) { setErrorMsg(err.message); console.error(err);
    } finally { setIsSubmitting(false); }
  };
  
  const deleteVideo = async (id) => { /* ... (como estaba) ... */ };

  if (!token || user?.role !== "admin") {
    return <p className="p-4 text-red-500 text-center">Acceso denegado. Debes ser administrador.</p>;
  }

  return (
    // Tu JSX para el layout del AdminPanel y las pestañas es el mismo que me pasaste
    // La sección clave es {activeTab === "manage_vod"}
    // Pego aquí el JSX completo del return para asegurar que lo tengas:
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-5xl mx-auto bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-red-500">Panel de Administración</h1>
      
      {errorMsg && <div className="p-3 my-4 bg-red-200 text-red-800 border border-red-400 rounded-md shadow-lg">{errorMsg}</div>}
      {successMsg && <div className="p-3 my-4 bg-green-200 text-green-800 border border-green-400 rounded-md shadow-lg">{successMsg}</div>}

      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-6">
        <Tab label="Subir M3U" value="m3u" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label={channelId ? "Editar Canal" : "Agregar Canal"} value="add_channel" activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if(!channelId && tab === 'add_channel') { clearChannelForm(); clearMessages();} }} />
        <Tab label="Gestionar Canales" value="manage_channels" activeTab={activeTab} onTabChange={(tab) => {setActiveTab(tab); clearMessages(); fetchChannels();}} />
        <Tab label={vodId ? "Editar VOD" : "Agregar VOD"} value="add_vod" activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if(!vodId && tab === 'add_vod') {clearVodForm(); clearMessages();}}} />
        <Tab label="Gestionar VOD" value="manage_vod" activeTab={activeTab} onTabChange={(tab) => {setActiveTab(tab); clearMessages(); fetchVideos();}} />
      </div>

      {activeTab === "m3u" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Subir Archivo de Canales M3U</h2>
          <p className="text-sm text-gray-400 mb-4">Procesará el M3U y guardará los canales en la colección "Channels".</p>
          <form onSubmit={submitM3u} className="space-y-4">
            <Input type="file" accept=".m3u,.m3u8" onChange={(e) => setM3uFile(e.target.files[0])}
                   className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"/>
            <Button type="submit" disabled={isSubmitting || !m3uFile} 
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Subiendo..." : "Subir y Procesar M3U"}
            </Button>
          </form>
        </section>
      )}

      {activeTab === "add_channel" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">{channelId ? "Editar Canal" : "Agregar Nuevo Canal"}</h2>
          <form onSubmit={submitChannel} className="space-y-4">
            <Input type="text" placeholder="Nombre del Canal" value={channelName} onChange={(e) => setChannelName(e.target.value)} required />
            <Input type="url" placeholder="URL del Stream" value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} required />
            <Input type="url" placeholder="URL del Logo (opcional)" value={channelLogo} onChange={(e) => setChannelLogo(e.target.value)} />
            <Input type="text" placeholder="Categoría" value={channelCategory} onChange={(e) => setChannelCategory(e.target.value)} />
            <Textarea placeholder="Descripción (opcional)" value={channelDescription} onChange={(e) => setChannelDescription(e.target.value)} />
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
              <input type="checkbox" checked={channelIsActive} onChange={(e) => setChannelIsActive(e.target.checked)} className="form-checkbox h-5 w-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
              <span>Activo</span>
            </label>
            <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting ? (channelId ? "Actualizando..." : "Agregando...") : (channelId ? "Actualizar Canal" : "Agregar Canal")}
                </Button>
                {channelId && <Button type="button" onClick={() => {clearChannelForm(); setActiveTab("manage_channels");}} className="bg-gray-600 hover:bg-gray-700">Cancelar Edición</Button>}
            </div>
          </form>
        </section>
      )}

      {activeTab === "manage_channels" && ( 
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Gestionar Canales Existentes</h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {(channels && channels.length > 0) ? channels.map((ch) => (
              <div key={ch.id || ch._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 rounded-md gap-2">
                <img src={ch.thumbnail || ch.logo || '/img/placeholder-thumbnail.png'} alt={ch.name} className="w-16 h-10 object-contain bg-black rounded-sm mr-3 flex-shrink-0" onError={(e) => {e.currentTarget.src = '/img/placeholder-thumbnail.png';}}/>
                <div className="flex-grow mb-2 sm:mb-0">
                  <strong className={`text-lg ${ch.active ? 'text-white' : 'text-gray-500 line-through'}`}>{ch.name}</strong>
                  <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md md:max-w-lg" title={ch.url}>{ch.url}</p>
                  <p className="text-xs text-gray-500">Categoría: {ch.category} - {ch.active ? "Activo" : "Inactivo"}</p>
                </div>
                <div className="flex space-x-2 flex-shrink-0 self-center sm:self-auto">
                  <Button onClick={() => handleEditChannelClick(ch)} className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1">Editar</Button>
                  <Button onClick={() => deleteChannel(ch.id || ch._id)} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1">Eliminar</Button>
                </div>
              </div>
            )) : <p className="text-gray-400">No hay canales para mostrar.</p>}
          </div>
        </section>
      )}

      {activeTab === "add_vod" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">{vodId ? "Editar VOD" : "Agregar Película o Serie"}</h2>
          <form onSubmit={submitVideo} className="space-y-4">
            <Select value={videoTipo} onChange={(e) => setVideoTipo(e.target.value)}>
                <option value="pelicula">Película</option>
                <option value="serie">Serie</option>
            </Select>
            <Input type="text" placeholder="Título" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
            <Input type="url" placeholder="URL del Video (MP4, MKV, M3U8, etc.)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
            <Input type="url" placeholder="URL del Logo/Thumbnail (principal)" value={videoLogo} onChange={(e) => setVideoLogo(e.target.value)} />
            <Textarea placeholder="Descripción" value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} />
            <Input type="url" placeholder="URL del Tráiler (opcional)" value={videoTrailerUrl} onChange={(e) => setVideoTrailerUrl(e.target.value)} />
            <Input type="text" placeholder="Categoría (ej. Estrenos 2025, Netflix Series)" value={videoCategory} onChange={(e) => setVideoCategory(e.target.value)} />
            <Input type="number" placeholder="Año de Lanzamiento (ej. 2024)" value={videoReleaseYear} onChange={(e) => setVideoReleaseYear(e.target.value)} />
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
              <input type="checkbox" checked={videoIsFeatured} onChange={(e) => setVideoIsFeatured(e.target.checked)} className="form-checkbox h-5 w-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
              <span>Destacado (para Home)</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
              <input type="checkbox" checked={videoIsActive} onChange={(e) => setVideoIsActive(e.target.checked)} className="form-checkbox h-5 w-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
              <span>Activo (visible para usuarios)</span>
            </label>
            <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                  {isSubmitting ? (vodId ? "Actualizando..." : "Agregando...") : (vodId ? "Actualizar VOD" : "Agregar VOD")}
                </Button>
                {vodId && <Button type="button" onClick={() => {clearVodForm(); setActiveTab("manage_vod");}} className="bg-gray-600 hover:bg-gray-700">Cancelar Edición</Button>}
            </div>
          </form>
        </section>
      )}

      {activeTab === "manage_vod" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Gestionar VOD Existente (Películas/Series)</h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2"> 
            {(videos && videos.length > 0) ? videos.map((vid) => (
              <div key={vid.id || vid._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 rounded-md gap-2">
                 <img src={vid.thumbnail || vid.logo || '/img/placeholder-thumbnail.png'} alt={vid.title || vid.name} className="w-16 h-24 object-cover bg-black rounded-sm mr-3 flex-shrink-0" onError={(e) => {e.currentTarget.src = '/img/placeholder-thumbnail.png';}}/>
                <div className="flex-grow mb-2 sm:mb-0">
                  <strong className={`text-lg ${vid.active ? 'text-white' : 'text-gray-500 line-through'}`}>{vid.title || vid.name}</strong> 
                  <span className="text-xs text-gray-400 ml-2">({vid.tipo})</span>
                  <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md md:max-w-lg" title={vid.url}>{vid.url}</p>
                  <p className="text-xs text-gray-500">
                    Cat: {vid.category} - {vid.active ? "Activo" : "Inactivo"} - {vid.isFeatured ? "Destacado" : "No Dest."}
                  </p>
                </div>
                <div className="flex space-x-2 flex-shrink-0 self-center sm:self-auto">
                  <Button onClick={() => handleEditVodClick(vid)} className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1">Editar</Button>
                  <Button onClick={() => deleteVideo(vid.id || vid._id)} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1">Eliminar</Button>
                </div>
              </div>
            )) : <p className="text-gray-400">No hay VODs (películas/series) para mostrar. Revisa la consola para ver los datos cargados.</p>}
          </div>
        </section>
      )}
    </div>
  );
}