// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";

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

const MAIN_SECTION_OPTIONS = [
    { key: "ESPECIALES", displayName: "ESPECIALES (Básico)"},
    { key: "CINE_2025", displayName: "CINE 2025 (Premium/Cinéfilo)"},
    { key: "CINE_4K", displayName: "CINE 4K (Premium/Cinéfilo)"},
    { key: "CINE_60FPS", displayName: "CINE 60 FPS (Premium/Cinéfilo)"},
    { key: "POR_GENERO", displayName: "POR GÉNEROS (Agrupador)"},
    { key: "CLASICOS", displayName: "Clásicos del Cine (Básico)"},
    { key: "OTROS", displayName: "Otros (Básico)"},
];

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

  const [m3uFile, setM3uFile] = useState(null);
  const [vodId, setVodId] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLogo, setVideoLogo] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoTrailerUrl, setVideoTrailerUrl] = useState("");
  const [videoReleaseYear, setVideoReleaseYear] = useState(new Date().getFullYear().toString());
  const [videoIsFeatured, setVideoIsFeatured] = useState(false);
  const [videoIsActive, setVideoIsActive] = useState(true);
  const [videoTipo, setVideoTipo] = useState("pelicula");
  const [videoMainSection, setVideoMainSection] = useState(MAIN_SECTION_OPTIONS[0].key);
  const [videoGenres, setVideoGenres] = useState("");
  const [videoRequiresPlan, setVideoRequiresPlan] = useState("basico");

  const [channelId, setChannelId] = useState(null);
  const [channelName, setChannelName] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [channelLogo, setChannelLogo] = useState("");
  const [channelCategory, setChannelCategory] = useState("General");
  const [channelDescription, setChannelDescription] = useState("");
  const [channelIsActive, setChannelIsActive] = useState(true);

  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [activeTab, setActiveTab] = useState("manage_vod");

  const clearMessages = () => { setErrorMsg(""); setSuccessMsg(""); };

  const fetchChannels = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true); clearMessages();
    try {
      const res = await fetch(`${API_URL}/api/channels/list`, { headers: getAuthHeaders() });
      const responseText = await res.text();
      if (!res.ok) throw new Error(JSON.parse(responseText).error || `Error ${res.status}`);
      const data = JSON.parse(responseText);
      setChannels(Array.isArray(data) ? data : []);
    } catch (err) { setErrorMsg(err.message || "Error al cargar canales."); setChannels([]); } 
    finally { setIsLoadingList(false); }
  }, [token, API_URL, getAuthHeaders]);

  const fetchVideos = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true); clearMessages();
    try {
      const res = await fetch(`${API_URL}/api/videos?view=admin`, { headers: getAuthHeaders() });
      const responseText = await res.text();
      if (!res.ok) throw new Error(JSON.parse(responseText).error || `Error ${res.status}`);
      const data = JSON.parse(responseText);
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) { setErrorMsg(err.message || "Error al cargar VODs."); setVideos([]); } 
    finally { setIsLoadingList(false); }
  }, [token, API_URL, getAuthHeaders]);

  useEffect(() => {
    clearMessages();
    if (token) {
      if (activeTab === "manage_channels") fetchChannels();
      else if (activeTab === "add_channel" && !channelId) clearChannelForm();
      
      if (activeTab === "manage_vod") fetchVideos();
      else if (activeTab === "add_vod" && !vodId) clearVodForm();
    }
  }, [activeTab, token, channelId, vodId, fetchChannels, fetchVideos]);

  const submitM3uToChannels = async (e) => {
    e.preventDefault();
    if (!m3uFile) { setErrorMsg("Selecciona un archivo M3U"); return; }
    setIsSubmitting(true); clearMessages();
    const fd = new FormData();
    fd.append("file", m3uFile);
    try {
      const res = await fetch(`${API_URL}/api/videos/upload-m3u`, {
        method: "POST", headers: getAuthHeaders(true), body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`);
      setSuccessMsg(data.message || "M3U procesado.");
      setM3uFile(null); 
      const formElement = e.target;
      if (formElement && typeof formElement.reset === 'function') {
          formElement.reset();
      }
      fetchChannels(); 
    } catch (err) { setErrorMsg(err.message); } 
    finally { setIsSubmitting(false); }
  };

  const clearChannelForm = () => {
    setChannelId(null); setChannelName(""); setChannelUrl(""); setChannelLogo("");
    setChannelCategory("General"); setChannelDescription(""); setChannelIsActive(true);
  };

  const handleEditChannelClick = (channel) => {
    if (!channel || (!channel.id && !channel._id)) {
      alert("Error: No se puede editar el canal, falta ID."); return;
    }
    setChannelId(channel.id || channel._id);
    setChannelName(channel.name || "");
    setChannelUrl(channel.url || "");
    setChannelLogo(channel.logo || channel.thumbnail || "");
    setChannelCategory(channel.category || "General");
    setChannelDescription(channel.description || "");
    setChannelIsActive(channel.active !== undefined ? channel.active : true);
    setActiveTab("add_channel"); 
    clearMessages();
  };

  const submitChannel = async (e) => {
    e.preventDefault();
    if(!channelName || !channelUrl) { setErrorMsg("Nombre y URL del canal son requeridos."); return; }
    setIsSubmitting(true); clearMessages();
    const channelData = {
      name: channelName, url: channelUrl, logo: channelLogo, category: channelCategory,
      description: channelDescription, active: channelIsActive,
    };
    try {
      const endpointBase = `${API_URL}/api/channels`;
      const res = channelId 
        ? await fetch(`${endpointBase}/${channelId}`, { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(channelData) })
        : await fetch(endpointBase, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(channelData) });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || responseData.message || `Error ${res.status}`);
      setSuccessMsg(channelId ? "Canal actualizado." : "Canal agregado.");
      clearChannelForm(); fetchChannels();
      if(channelId) setActiveTab("manage_channels");
    } catch (err) { setErrorMsg(err.message); } 
    finally { setIsSubmitting(false); }
  };

  const deleteChannel = async (id) => {
    if (!window.confirm("¿Eliminar este canal?")) return;
    setIsSubmitting(true); clearMessages();
    try {
      const res = await fetch(`${API_URL}/api/channels/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`);
      setSuccessMsg(data.message || "Canal eliminado."); fetchChannels();
    } catch (err) { setErrorMsg(err.message); } 
    finally { setIsSubmitting(false); }
  };

  const clearVodForm = () => {
    setVodId(null); setVideoTitle(""); setVideoUrl(""); setVideoLogo("");
    setVideoDescription(""); setVideoTrailerUrl("");
    setVideoReleaseYear(new Date().getFullYear().toString()); setVideoIsFeatured(false); 
    setVideoIsActive(true); setVideoTipo("pelicula");
    setVideoMainSection(MAIN_SECTION_OPTIONS[0].key);
    setVideoGenres("");
    setVideoRequiresPlan("basico");
  };

  const handleEditVodClick = (video) => {
    if (!video || (!video.id && !video._id)) {
        alert("Error: No se puede editar el VOD, falta ID."); return;
    }
    setVodId(video.id || video._id);
    setVideoTitle(video.title || video.name || "");
    setVideoUrl(video.url || "");
    setVideoLogo(video.logo || video.thumbnail || "");
    setVideoDescription(video.description || "");
    setVideoTrailerUrl(video.trailerUrl || "");
    setVideoReleaseYear(video.releaseYear?.toString() || new Date().getFullYear().toString());
    setVideoIsFeatured(video.isFeatured || false);
    setVideoIsActive(video.active !== undefined ? video.active : true);
    setVideoTipo(video.tipo || "pelicula");
    setVideoMainSection(video.mainSection || MAIN_SECTION_OPTIONS[0].key);
    setVideoGenres(Array.isArray(video.genres) ? video.genres.join(', ') : (video.genres || ""));
    setVideoRequiresPlan(video.requiresPlan || "basico");
    setActiveTab("add_vod"); 
    clearMessages();
  };

  const submitVideo = async (e) => {
    e.preventDefault();
    if(!videoTitle || !videoUrl) { setErrorMsg("Título y URL del VOD son requeridos."); return; }
    setIsSubmitting(true); clearMessages();
    const parsedGenres = videoGenres.split(',').map(g => g.trim()).filter(g => g);
    const videoData = {
      title: videoTitle, url: videoUrl, logo: videoLogo, description: videoDescription,
      trailerUrl: videoTrailerUrl, 
      releaseYear: videoReleaseYear ? parseInt(videoReleaseYear) : null,
      isFeatured: videoIsFeatured, active: videoIsActive, tipo: videoTipo,
      mainSection: videoMainSection,
      genres: parsedGenres,
      requiresPlan: videoRequiresPlan,
    };
    try {
      const endpointBase = `${API_URL}/api/videos`;
      const res = vodId 
        ? await fetch(`${endpointBase}/${vodId}`, { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(videoData) })
        : await fetch(`${endpointBase}/upload-link`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(videoData) });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || responseData.message || `Error ${res.status}`);
      setSuccessMsg(vodId ? "VOD actualizado." : "VOD agregado.");
      clearVodForm(); fetchVideos();
      if(vodId) setActiveTab("manage_vod");
    } catch (err) { setErrorMsg(err.message); } 
    finally { setIsSubmitting(false); }
  };
  
  const deleteVideo = async (id) => {
    if (!window.confirm("¿Eliminar este VOD?")) return;
    setIsSubmitting(true); clearMessages();
    try {
      const res = await fetch(`${API_URL}/api/videos/${id}`, { method: "DELETE", headers: getAuthHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`);
      setSuccessMsg(data.message || "VOD eliminado."); fetchVideos();
    } catch (err) { setErrorMsg(err.message); } 
    finally { setIsSubmitting(false); }
  };

  if (!token || user?.role !== "admin") {
    return <p className="p-4 text-red-500 text-center">Acceso denegado.</p>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-5xl mx-auto bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-red-500">Panel de Administración</h1>
      
      {errorMsg && <div className="p-3 my-4 bg-red-200 text-red-800 border border-red-400 rounded-md shadow-lg" role="alert">{errorMsg}</div>}
      {successMsg && <div className="p-3 my-4 bg-green-200 text-green-800 border border-green-400 rounded-md shadow-lg" role="alert">{successMsg}</div>}

      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-6">
        <Tab label="Subir M3U (a Canales)" value="m3u_to_channels" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label={channelId ? "Editar Canal" : "Agregar Canal"} value="add_channel" activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if(!channelId && tab === 'add_channel') { clearChannelForm(); clearMessages();} }} />
        <Tab label="Gestionar Canales" value="manage_channels" activeTab={activeTab} onTabChange={(tab) => {setActiveTab(tab); clearMessages(); fetchChannels();}} />
        <Tab label={vodId ? "Editar VOD" : "Agregar VOD"} value="add_vod" activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if(!vodId && tab === 'add_vod') {clearVodForm(); clearMessages();}}} />
        <Tab label="Gestionar VOD" value="manage_vod" activeTab={activeTab} onTabChange={(tab) => {setActiveTab(tab); clearMessages(); fetchVideos();}} />
      </div>

      {activeTab === "m3u_to_channels" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Subir Archivo M3U (Importar a Canales)</h2>
          <form onSubmit={submitM3uToChannels} className="space-y-4">
            <Input type="file" name="m3uFileField" accept=".m3u,.m3u8" onChange={(e) => setM3uFile(e.target.files[0])}
                   className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"/>
            <Button type="submit" disabled={isSubmitting || !m3uFile} className="w-full sm:w-auto">
              {isSubmitting ? "Procesando..." : "Subir y Procesar M3U a Canales"}
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
            <label className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" checked={channelIsActive} onChange={(e) => setChannelIsActive(e.target.checked)} className="form-checkbox h-5 w-5"/>
              <span>Activo</span>
            </label>
            <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting ? (channelId ? "Actualizando..." : "Agregando...") : (channelId ? "Actualizar Canal" : "Agregar Canal")}
                </Button>
                {channelId && <Button type="button" onClick={() => {clearChannelForm(); setActiveTab("manage_channels");}} className="bg-gray-600 hover:bg-gray-700">Cancelar</Button>}
            </div>
          </form>
        </section>
      )}

      {/* Pestaña Gestionar Canales - CORREGIDA */}
      {activeTab === "manage_channels" && ( 
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Gestionar Canales Existentes</h2>
          {isLoadingList ? (
            <p className="text-center text-gray-400">Cargando canales...</p> 
          ) : (channels && channels.length > 0) ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {channels.map((ch) => (
                <div key={ch.id || ch._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 rounded-md gap-2">
                  <img 
                    src={ch.thumbnail || ch.logo || '/img/placeholder-thumbnail.png'} 
                    alt={ch.name} 
                    className="w-16 h-10 object-contain bg-black rounded-sm mr-3 flex-shrink-0" 
                    onError={(e) => {e.currentTarget.src = '/img/placeholder-thumbnail.png';}}
                  />
                  <div className="flex-grow mb-2 sm:mb-0">
                    <strong className={`text-lg ${ch.active ? 'text-white' : 'text-gray-500 line-through'}`}>
                      {ch.name}
                    </strong>
                    <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md md:max-w-lg" title={ch.url}>
                      {ch.url}
                    </p>
                    <p className="text-xs text-gray-500">
                      Categoría: {ch.category || 'N/A'} - {ch.active ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 self-center sm:self-auto">
                    <Button 
                      onClick={() => handleEditChannelClick(ch)} 
                      className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1"
                    >
                      Editar
                    </Button>
                    <Button 
                      onClick={() => deleteChannel(ch.id || ch._id)} 
                      disabled={isSubmitting} 
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div> 
          ) : (
            <p className="text-gray-400 text-center">No hay canales para mostrar o no se pudieron cargar.</p>
          )}
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
            <Input type="url" placeholder="URL del Video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
            <Input type="url" placeholder="URL del Logo/Thumbnail" value={videoLogo} onChange={(e) => setVideoLogo(e.target.value)} />
            <Textarea placeholder="Descripción" value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} />
            <Input type="url" placeholder="URL del Tráiler" value={videoTrailerUrl} onChange={(e) => setVideoTrailerUrl(e.target.value)} />
            
            <div>
              <label htmlFor="videoMainSectionAdmin" className="block text-sm font-medium text-gray-300 mb-1">Sección Principal</label>
              <Select id="videoMainSectionAdmin" value={videoMainSection} onChange={(e) => setVideoMainSection(e.target.value)}>
                {MAIN_SECTION_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.displayName}</option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="videoGenresAdmin" className="block text-sm font-medium text-gray-300 mb-1">Géneros (separados por coma)</label>
              <Input 
                id="videoGenresAdmin"
                type="text" 
                placeholder="Ej: Acción, Comedia, Terror" 
                value={videoGenres} 
                onChange={(e) => setVideoGenres(e.target.value)} 
              />
            </div>
             <div>
              <label htmlFor="videoRequiresPlanAdmin" className="block text-sm font-medium text-gray-300 mb-1">Plan Requerido</label>
              <Select id="videoRequiresPlanAdmin" value={videoRequiresPlan} onChange={(e) => setVideoRequiresPlan(e.target.value)}>
                <option value="basico">Básico</option>
                <option value="premium">Premium</option>
                <option value="cinefilo">Cinéfilo</option>
              </Select>
            </div>

            <Input type="number" placeholder="Año de Lanzamiento" value={videoReleaseYear} onChange={(e) => setVideoReleaseYear(e.target.value)} />
            <label className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" checked={videoIsFeatured} onChange={(e) => setVideoIsFeatured(e.target.checked)} className="form-checkbox"/>
              <span>Destacado (Home)</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-300">
              <input type="checkbox" checked={videoIsActive} onChange={(e) => setVideoIsActive(e.target.checked)} className="form-checkbox"/>
              <span>Activo</span>
            </label>
            <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                  {isSubmitting ? (vodId ? "Actualizando..." : "Agregando...") : (vodId ? "Actualizar VOD" : "Agregar VOD")}
                </Button>
                {vodId && <Button type="button" onClick={() => {clearVodForm(); setActiveTab("manage_vod");}} className="bg-gray-600 hover:bg-gray-700">Cancelar</Button>}
            </div>
          </form>
        </section>
      )}

      {/* Pestaña Gestionar VOD - CORREGIDA */}
      {activeTab === "manage_vod" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Gestionar VOD Existente (Películas/Series)</h2>
           {isLoadingList ? (
            <p className="text-center text-gray-400">Cargando VODs...</p>
           ) : (videos && videos.length > 0) ? (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2"> 
              {videos.map((vid) => (
                <div key={vid.id || vid._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 rounded-md gap-2">
                  <img 
                    src={vid.thumbnail || vid.logo || '/img/placeholder-thumbnail.png'} 
                    alt={vid.title || vid.name} 
                    className="w-16 h-24 object-cover bg-black rounded-sm mr-3 flex-shrink-0" 
                    onError={(e) => {e.currentTarget.src = '/img/placeholder-thumbnail.png';}}
                  />
                  <div className="flex-grow mb-2 sm:mb-0">
                    <strong className={`text-lg ${vid.active ? 'text-white' : 'text-gray-500 line-through'}`}>
                        {vid.title || vid.name}
                    </strong> 
                    <span className="text-xs text-gray-400 ml-2">({vid.tipo})</span>
                    <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md md:max-w-lg" title={vid.url}>
                        {vid.url}
                    </p>
                    <p className="text-xs text-gray-500">
                      Sección: {vid.mainSection || 'N/A'} | Plan: {vid.requiresPlan || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Géneros: {Array.isArray(vid.genres) ? vid.genres.join(', ') : (vid.genres || 'N/A')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {vid.active ? "Activo" : "Inactivo"} - {vid.isFeatured ? "Destacado" : "No Dest."}
                    </p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 self-center sm:self-auto">
                    <Button 
                        onClick={() => handleEditVodClick(vid)} 
                        className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1"
                    >
                        Editar
                    </Button>
                    <Button 
                        onClick={() => deleteVideo(vid.id || vid._id)} 
                        disabled={isSubmitting} 
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1"
                    >
                        Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div> 
            ) : (
            <p className="text-gray-400 text-center">No hay VODs (películas/series) para mostrar o no se pudieron cargar.</p>
            )
           }
        </section>
      )}
    </div>
  );
}