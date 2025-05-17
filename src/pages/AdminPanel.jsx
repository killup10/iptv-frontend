// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { 
    // Funciones para Canales
    fetchAdminChannels, 
    createAdminChannel, 
    updateAdminChannel, 
    deleteAdminChannel, 
    processM3UForAdmin,
    // Funciones para VODs (Películas/Series)
    fetchAdminVideos, 
    createAdminVideo, 
    updateAdminVideo, 
    deleteAdminVideo 
} from "../utils/api.js"; // Asegúrate que estas funciones estén definidas en tu api.js

// --- Componentes UI (como los tenías) ---
const Tab = ({ label, value, activeTab, onTabChange }) => (
  <button onClick={() => onTabChange(value)}
    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap ${activeTab === value ? 'border-b-2 border-red-500 text-white' : 'text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-gray-500'}`}>
    {label}
  </button>
);
const Input = (props) => <input {...props} className={`w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${props.className || ""}`} />;
const Textarea = (props) => <textarea {...props} className={`w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 h-24 ${props.className || ""}`} />;
const Select = (props) => <select {...props} className={`w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white ${props.className || ""}`} />;
const Button = ({ children, className, disabled, ...props }) => (
    <button {...props} disabled={disabled}
        className={`font-bold py-2 px-4 rounded transition-colors duration-150 ease-in-out ${className || ""} ${disabled ? "bg-gray-500 text-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
        {children}
    </button>
);

// Opciones para Selects
const MAIN_SECTION_VOD_OPTIONS = [
    { key: "POR_GENERO", displayName: "POR GÉNEROS (Agrupador)"},
    { key: "ESPECIALES", displayName: "ESPECIALES (Festividades)"},
    { key: "CINE_2025", displayName: "CINE 2025 (Estrenos)"},
    { key: "CINE_4K", displayName: "CINE 4K"},
    { key: "CINE_60FPS", displayName: "CINE 60 FPS"},
    // Agrega más según tu backend para VODs
];

const CHANNEL_CATEGORY_OPTIONS = [
    "GENERAL", "NOTICIAS", "DEPORTES", "PELIS", "SERIES", "INFANTILES", 
    "CULTURA", "DOCUMENTALES", "MUSICA", "VARIADOS", "LOCALES", "NOVELAS", "INFORMATIVO",
    "NOTICIAS BASICAS", "INFANTILES BASICOS", "ENTRETENIMIENTO GENERAL", "DEPORTES PREMIUM",
    "EVENTOS DEPORTIVOS", "FUTBOL EXCLUSIVO", "VARIADOS PREMIUM", "ENTRETENIMIENTO VIP",
    "PELIS PREMIUM", "ESTRENOS CINE", "INFANTILES PREMIUM", "FUTBOL TOTAL",
    "CULTURA PREMIUM", "DOCUMENTALES VIP", "NOTICIAS INTERNACIONALES", "FINANZAS",
    "SIN CATEGORIA"
];

const PLAN_OPTIONS = [
    { key: "gplay", displayName: "GPlay (Base)" },
    { key: "cinefilo", displayName: "Cinéfilo" },
    { key: "sports", displayName: "Sports" },
    { key: "premium", displayName: "Premium" },
];

export default function AdminPanel() {
  const { user } = useAuth();
  const token = user?.token; // AuthContext ya debería proveer el token
  
  const [m3uFile, setM3uFile] = useState(null);
  
  // Estados VOD
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
  const [videoMainSection, setVideoMainSection] = useState(MAIN_SECTION_VOD_OPTIONS[0]?.key || "POR_GENERO");
  const [videoGenres, setVideoGenres] = useState("");
  const [videoRequiresPlan, setVideoRequiresPlan] = useState(PLAN_OPTIONS[0]?.key || "gplay");

  // Estados Canales
  const [channelId, setChannelId] = useState(null);
  const [channelName, setChannelName] = useState("");
  const [channelUrl, setChannelUrl] = useState("");
  const [channelLogo, setChannelLogo] = useState("");
  const [channelDescription, setChannelDescription] = useState(""); // Añadido para descripción de canal
  const [channelCategory, setChannelCategory] = useState(CHANNEL_CATEGORY_OPTIONS[0]);
  const [channelIsActive, setChannelIsActive] = useState(true);
  const [channelIsFeatured, setChannelIsFeatured] = useState(false);
  const [channelRequiresPlan, setChannelRequiresPlan] = useState(PLAN_OPTIONS[0]?.key || "gplay");

  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  
  const [activeTab, setActiveTab] = useState("manage_channels"); // Iniciar en canales para probar

  const clearMessages = () => { setErrorMsg(""); setSuccessMsg(""); };

  // --- Funciones para Canales ---
  const fetchAdminChannelsList = useCallback(async () => {
    if (!token) { setErrorMsg("No autenticado."); return; }
    setIsLoadingList(true); clearMessages();
    try {
      const data = await fetchAdminChannels();
      setChannels(data || []);
      if (!data || data.length === 0) setSuccessMsg("No se encontraron canales.");
    } catch (err) { 
      setErrorMsg(err.message || "Fallo al cargar lista de canales."); setChannels([]);
    } finally { setIsLoadingList(false); }
  }, [token]);

  const clearChannelForm = useCallback(() => {
    setChannelId(null); setChannelName(""); setChannelUrl(""); setChannelLogo("");
    setChannelDescription(""); setChannelCategory(CHANNEL_CATEGORY_OPTIONS[0]);
    setChannelIsActive(true); setChannelIsFeatured(false);
    setChannelRequiresPlan(PLAN_OPTIONS[0]?.key || "gplay");
    clearMessages();
  }, []);

  const handleEditChannelClick = useCallback((channel) => {
    if (!channel || !channel.id) { setErrorMsg("Error: ID de canal inválido."); return; }
    setChannelId(channel.id);
    setChannelName(channel.name || "");
    setChannelUrl(channel.url || "");
    setChannelLogo(channel.logo || "");
    setChannelDescription(channel.description || "");
    setChannelCategory(channel.category || CHANNEL_CATEGORY_OPTIONS[0]);
    setChannelIsActive(channel.isActive !== undefined ? channel.isActive : true);
    setChannelIsFeatured(channel.isFeatured || false);
    setChannelRequiresPlan(channel.requiresPlan || (PLAN_OPTIONS[0]?.key || "gplay"));
    setActiveTab("add_channel"); 
    clearMessages();
  }, []);

  const submitChannel = async (e) => {
    e.preventDefault();
    if (!channelName || !channelUrl) { setErrorMsg("Nombre y URL del canal son requeridos."); return; }
    setIsSubmitting(true); clearMessages();
    const channelData = {
      name: channelName, url: channelUrl, logo: channelLogo, description: channelDescription,
      category: channelCategory, isActive: channelIsActive, isFeatured: channelIsFeatured,
      requiresPlan: channelRequiresPlan,
    };
    try {
      if (channelId) {
        await updateAdminChannel(channelId, channelData);
        setSuccessMsg("Canal actualizado.");
      } else {
        await createAdminChannel(channelData);
        setSuccessMsg("Canal agregado.");
      }
      clearChannelForm(); 
      fetchAdminChannelsList(); 
      setActiveTab("manage_channels");
    } catch (err) { setErrorMsg(err.message || "Error al guardar canal."); } 
    finally { setIsSubmitting(false); }
  };
  
  const handleDeleteChannel = async (id) => {
    if (!id || !window.confirm("¿Eliminar este canal?")) return;
    setIsSubmitting(true); clearMessages();
    try {
      await deleteAdminChannel(id);
      setSuccessMsg("Canal eliminado.");
      fetchAdminChannelsList();
    } catch (err) { setErrorMsg(err.message || "Error al eliminar canal.");} 
    finally { setIsSubmitting(false); }
  };

  const submitM3uFileToChannels = async (e) => {
    e.preventDefault();
    if (!m3uFile) { setErrorMsg("Selecciona un archivo M3U."); return; }
    setIsSubmitting(true); clearMessages();
    const formData = new FormData();
    formData.append("m3uFile", m3uFile);
    try {
      const result = await processM3UForAdmin(formData);
      setSuccessMsg(result.message || `M3U procesado. Canales: ${result.channelsProcessed || result.channelsAdded || 0}`);
      setM3uFile(null); 
      if (document.getElementById('m3u-file-input')) document.getElementById('m3u-file-input').value = "";
      fetchAdminChannelsList();
    } catch (err) { setErrorMsg(err.message || "Error al procesar M3U."); } 
    finally { setIsSubmitting(false); }
  };

  // --- Funciones para VOD (Películas/Series) ---
  const fetchVideosList = useCallback(async () => {
    if (!token) { setErrorMsg("No autenticado."); return; }
    setIsLoadingList(true); clearMessages();
    try {
      const data = await fetchAdminVideos();
      setVideos(data || []);
      if (!data || data.length === 0) setSuccessMsg("No se encontraron VODs.");
    } catch (err) { setErrorMsg(err.message || "Fallo al cargar VODs."); setVideos([]); }
    finally { setIsLoadingList(false); }
  }, [token]);

  const clearVodForm = useCallback(() => {
    setVodId(null); setVideoTitle(""); setVideoUrl(""); setVideoLogo("");
    setVideoDescription(""); setVideoTrailerUrl("");
    setVideoReleaseYear(new Date().getFullYear().toString()); setVideoIsFeatured(false); 
    setVideoIsActive(true); setVideoTipo("pelicula");
    setVideoMainSection(MAIN_SECTION_VOD_OPTIONS[0]?.key || "POR_GENERO");
    setVideoGenres(""); setVideoRequiresPlan(PLAN_OPTIONS[0]?.key || "gplay");
    clearMessages();
  }, []);

  const handleEditVodClick = useCallback((video) => {
    if (!video || (!video.id && !video._id)) { setErrorMsg("Error: ID de VOD inválido."); return; }
    setVodId(video.id || video._id);
    setVideoTitle(video.title || video.name || ""); setVideoUrl(video.url || "");
    setVideoLogo(video.logo || video.thumbnail || ""); setVideoDescription(video.description || "");
    setVideoTrailerUrl(video.trailerUrl || "");
    setVideoReleaseYear(video.releaseYear?.toString() || new Date().getFullYear().toString());
    setVideoIsFeatured(video.isFeatured || false);
    setVideoIsActive(video.active !== undefined ? video.active : true);
    setVideoTipo(video.tipo || "pelicula");
    setVideoMainSection(video.mainSection || (MAIN_SECTION_VOD_OPTIONS[0]?.key || "POR_GENERO"));
    setVideoGenres(Array.isArray(video.genres) ? video.genres.join(', ') : (video.genres || ""));
    setVideoRequiresPlan(video.requiresPlan || (PLAN_OPTIONS[0]?.key || "gplay"));
    setActiveTab("add_vod"); clearMessages();
  }, []);

  const submitVideo = async (e) => {
    e.preventDefault();
    if(!videoTitle || !videoUrl) { setErrorMsg("Título y URL son requeridos para VOD."); return; }
    setIsSubmitting(true); clearMessages();
    const parsedGenres = videoGenres.split(',').map(g => g.trim()).filter(g => g);
    const vodData = {
      title: videoTitle, url: videoUrl, logo: videoLogo, description: videoDescription,
      trailerUrl: videoTrailerUrl, releaseYear: videoReleaseYear ? parseInt(videoReleaseYear) : null,
      isFeatured: videoIsFeatured, active: videoIsActive, tipo: videoTipo,
      mainSection: videoMainSection, genres: parsedGenres, requiresPlan: videoRequiresPlan,
    };
    try {
      if (vodId) {
        await updateAdminVideo(vodId, vodData);
        setSuccessMsg("VOD actualizado.");
      } else {
        await createAdminVideo(vodData);
        setSuccessMsg("VOD agregado.");
      }
      clearVodForm(); fetchVideosList(); 
      if(vodId) setActiveTab("manage_vod"); 
    } catch (err) { setErrorMsg(err.message || "Error al guardar VOD."); } 
    finally { setIsSubmitting(false); }
  };
  
  const deleteVideo = async (id) => {
    if (!id || !window.confirm("¿Eliminar este VOD?")) return;
    setIsSubmitting(true); clearMessages();
    try {
        await deleteAdminVideo(id);
        setSuccessMsg("VOD eliminado."); fetchVideosList();
    } catch (err) { setErrorMsg(err.message || "Error al eliminar VOD."); } 
    finally { setIsSubmitting(false); }
  };

  useEffect(() => {
    clearMessages();
    if (user && user.role === 'admin' && token) {
      if (activeTab === "manage_channels") fetchAdminChannelsList();
      else if (activeTab === "add_channel" && !channelId) clearChannelForm();
      else if (activeTab === "manage_vod") fetchVideosList();
      else if (activeTab === "add_vod" && !vodId) clearVodForm();
    }
  }, [activeTab, token, user, channelId, vodId, fetchAdminChannelsList, clearChannelForm, fetchVideosList, clearVodForm]); // Añadidas las funciones de useCallback como dependencias

  if (!token || !user || user.role !== "admin") {
    return <div className="flex justify-center items-center min-h-screen"><p className="p-8 text-xl bg-red-900 text-red-200 rounded-md">Acceso denegado.</p></div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-5xl mx-auto bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-red-500">Panel de Administración</h1>
      {errorMsg && <div className="p-3 my-2 bg-red-800 text-red-100 border border-red-700 rounded-md shadow-lg" role="alert">{errorMsg}</div>}
      {successMsg && <div className="p-3 my-2 bg-green-800 text-green-100 border border-green-700 rounded-md shadow-lg" role="alert">{successMsg}</div>}
      
      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-6">
        <Tab label="Subir M3U (Canales)" value="m3u_to_channels" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label={channelId ? "Editar Canal" : "Agregar Canal"} value="add_channel" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label="Gestionar Canales" value="manage_channels" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label={vodId ? "Editar VOD" : "Agregar VOD"} value="add_vod" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label="Gestionar VOD" value="manage_vod" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Pestaña Subir M3U */}
      {activeTab === "m3u_to_channels" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Subir Archivo M3U para Crear/Actualizar Canales</h2>
          <form onSubmit={submitM3uFileToChannels} className="space-y-4">
            <Input id="m3u-file-input" type="file" accept=".m3u,.m3u8" 
              onChange={(e) => setM3uFile(e.target.files[0])} 
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 cursor-pointer"
            />
            <Button type="submit" disabled={isSubmitting || !m3uFile} className="bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? "Procesando M3U..." : "Subir y Procesar M3U"}
            </Button>
          </form>
        </section>
      )}

      {/* Pestaña Agregar/Editar Canal */}
      {activeTab === "add_channel" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">{channelId ? "Editar Canal" : "Agregar Nuevo Canal"}</h2>
          <form onSubmit={submitChannel} className="space-y-4">
            <Input type="text" placeholder="Nombre del Canal" value={channelName} onChange={(e) => setChannelName(e.target.value)} required />
            <Input type="url" placeholder="URL del Stream (m3u8, etc.)" value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} required />
            <Input type="url" placeholder="URL del Logo/Thumbnail" value={channelLogo} onChange={(e) => setChannelLogo(e.target.value)} />
            <Textarea placeholder="Descripción (Opcional)" value={channelDescription} onChange={(e) => setChannelDescription(e.target.value)} />
            <div>
              <label htmlFor="channelCategoryAdmin" className="block text-sm font-medium text-gray-300 mb-1">Categoría del Canal</label>
              <Select id="channelCategoryAdmin" value={channelCategory} onChange={(e) => setChannelCategory(e.target.value)}>
                {CHANNEL_CATEGORY_OPTIONS.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
              </Select>
            </div>
            <div>
              <label htmlFor="channelRequiresPlanAdmin" className="block text-sm font-medium text-gray-300 mb-1">Plan Requerido</label>
              <Select id="channelRequiresPlanAdmin" value={channelRequiresPlan} onChange={(e) => setChannelRequiresPlan(e.target.value)}>
                {PLAN_OPTIONS.map(plan => (<option key={plan.key} value={plan.key}>{plan.displayName}</option>))}
              </Select>
            </div>
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input type="checkbox" checked={channelIsActive} onChange={(e) => setChannelIsActive(e.target.checked)} className="form-checkbox h-5 w-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
                <span>Activo</span>
            </label>
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input type="checkbox" checked={channelIsFeatured} onChange={(e) => setChannelIsFeatured(e.target.checked)} className="form-checkbox h-5 w-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
                <span>Destacado (Mostrar en Home)</span>
            </label>
            <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting ? (channelId ? "Actualizando..." : "Agregando...") : (channelId ? "Actualizar Canal" : "Agregar Canal")}
                </Button>
                {channelId && <Button type="button" onClick={() => { clearChannelForm(); setActiveTab("manage_channels");}} className="bg-gray-600 hover:bg-gray-700">Cancelar Edición</Button>}
            </div>
          </form>
        </section>
      )}

      {/* Pestaña Gestionar Canales */}
      {activeTab === "manage_channels" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Gestionar Canales Existentes</h2>
           {isLoadingList ? (<p className="text-center text-gray-400">Cargando canales...</p>)
            : (channels && channels.length > 0) ? (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2"> 
              {channels.map((ch) => (
                <div key={ch.id || ch._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 rounded-md gap-2">
                  <img src={ch.logo || '/img/placeholder-thumbnail.png'} alt={ch.name} 
                    className="w-24 h-16 object-contain bg-black rounded-sm mr-3 flex-shrink-0 self-center sm:self-start"
                    onError={(e) => {e.currentTarget.src = '/img/placeholder-thumbnail.png';}}/>
                  <div className="flex-grow mb-2 sm:mb-0 text-sm">
                    <strong className={`text-base ${!ch.isActive ? 'text-gray-500 line-through' : 'text-white'}`}>{ch.name}</strong> 
                    <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md md:max-w-lg" title={ch.url}>{ch.url}</p>
                    <p className="text-xs text-gray-500">Cat: {ch.category} | Plan: {PLAN_OPTIONS.find(p=>p.key === ch.requiresPlan)?.displayName || ch.requiresPlan}</p>
                    <p className="text-xs text-gray-500">{ch.isActive ? "Activo" : "Inactivo"} - {ch.isFeatured ? "Destacado" : "No Dest."}</p>
                    {ch.description && <p className="text-xs text-gray-300 mt-1 line-clamp-1" title={ch.description}>Desc: {ch.description}</p>}
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 self-center sm:self-auto">
                    <Button onClick={() => handleEditChannelClick(ch)} className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1">Editar</Button>
                    <Button onClick={() => handleDeleteChannel(ch.id || ch._id)} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1">Eliminar</Button>
                  </div>
                </div>
              ))}
            </div> 
            ) : (<p className="text-gray-400 text-center py-10">{errorMsg ? `Error: ${errorMsg}` : "No hay canales."}</p>)}
        </section>
      )}

      {/* Pestaña Gestionar VOD */}
      {activeTab === "manage_vod" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Gestionar VOD Existente (Películas/Series)</h2>
            {isLoadingList ? (<p className="text-center text-gray-400">Cargando VODs...</p>)
            : (videos && videos.length > 0) ? (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2"> 
              {videos.map((vid) => (
                <div key={vid.id || vid._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 rounded-md gap-2">
                  <img src={vid.thumbnail || vid.logo || '/img/placeholder-thumbnail.png'} alt={vid.title || vid.name} 
                    className="w-16 h-24 object-cover bg-black rounded-sm mr-3 flex-shrink-0" 
                    onError={(e) => {e.currentTarget.src = '/img/placeholder-thumbnail.png';}}/>
                  <div className="flex-grow mb-2 sm:mb-0 text-sm">
                    <strong className={`text-base ${!vid.active ? 'text-gray-500 line-through' : 'text-white'}`}>{vid.title || vid.name}</strong> 
                    <span className="text-xs text-gray-400 ml-1">({vid.tipo})</span>
                    <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md md:max-w-lg" title={vid.url}>{vid.url}</p>
                    <p className="text-xs text-gray-500">Sección: {MAIN_SECTION_VOD_OPTIONS.find(s=>s.key === vid.mainSection)?.displayName || vid.mainSection || 'N/A'} | Plan: {PLAN_OPTIONS.find(p=>p.key === vid.requiresPlan)?.displayName || vid.requiresPlan}</p>
                    <p className="text-xs text-gray-500">Géneros: {Array.isArray(vid.genres) ? vid.genres.join(', ') : (vid.genres || 'N/A')}</p>
                    <p className="text-xs text-gray-500">{vid.active ? "Activo" : "Inactivo"} - {vid.isFeatured ? "Destacado" : "No Dest."}</p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 self-center sm:self-auto">
                    <Button onClick={() => handleEditVodClick(vid)} className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1">Editar</Button>
                    <Button onClick={() => deleteVideo(vid.id || vid._id)} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-xs px-3 py-1">Eliminar</Button>
                  </div>
                </div>
              ))}
            </div> 
            ) : (<p className="text-gray-400 text-center py-10">{errorMsg ? `Error: ${errorMsg}` : "No hay VODs."}</p>)}
        </section>
      )}

      {/* Pestaña Agregar/Editar VOD */}
        {activeTab === "add_vod" && (
        <section className="p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">{vodId ? "Editar VOD" : "Agregar Película o Serie"}</h2>
          <form onSubmit={submitVideo} className="space-y-4">
            <Select value={videoTipo} onChange={(e) => setVideoTipo(e.target.value)}>
                <option value="pelicula">Película</option><option value="serie">Serie</option>
            </Select>
            <Input type="text" placeholder="Título" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
            <Input type="url" placeholder="URL del Video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
            <Input type="url" placeholder="URL del Logo/Thumbnail" value={videoLogo} onChange={(e) => setVideoLogo(e.target.value)} />
            <Textarea placeholder="Descripción" value={videoDescription} onChange={(e) => setVideoDescription(e.target.value)} />
            <Input type="url" placeholder="URL del Tráiler (YouTube)" value={videoTrailerUrl} onChange={(e) => setVideoTrailerUrl(e.target.value)} />
            <div>
              <label htmlFor="videoMainSectionAdmin" className="block text-sm font-medium text-gray-300 mb-1">Sección Principal (VOD)</label>
              <Select id="videoMainSectionAdmin" value={videoMainSection} onChange={(e) => setVideoMainSection(e.target.value)}>
                {MAIN_SECTION_VOD_OPTIONS.map(opt => (<option key={opt.key} value={opt.key}>{opt.displayName}</option>))}
              </Select>
            </div>
            <div>
              <label htmlFor="videoGenresAdmin" className="block text-sm font-medium text-gray-300 mb-1">Géneros (coma)</label>
              <Input id="videoGenresAdmin" type="text" placeholder="Ej: Acción, Comedia" value={videoGenres} onChange={(e) => setVideoGenres(e.target.value)} />
            </div>
             <div>
              <label htmlFor="videoRequiresPlanAdmin" className="block text-sm font-medium text-gray-300 mb-1">Plan Requerido (VOD)</label>
              <Select id="videoRequiresPlanAdmin" value={videoRequiresPlan} onChange={(e) => setVideoRequiresPlan(e.target.value)}>
                 {PLAN_OPTIONS.map(plan => (<option key={plan.key} value={plan.key}>{plan.displayName}</option>))}
              </Select>
            </div>
            <Input type="number" placeholder="Año de Lanzamiento" value={videoReleaseYear} onChange={(e) => setVideoReleaseYear(e.target.value)} />
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input type="checkbox" checked={videoIsFeatured} onChange={(e) => setVideoIsFeatured(e.target.checked)} className="form-checkbox h-5 w-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
                <span>Destacado (Home)</span></label>
            <label className="flex items-center space-x-2 text-gray-300 cursor-pointer">
                <input type="checkbox" checked={videoIsActive} onChange={(e) => setVideoIsActive(e.target.checked)} className="form-checkbox h-5 w-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"/>
                <span>Activo</span></label>
            <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting ? (vodId ? "Actualizando VOD..." : "Agregando VOD...") : (vodId ? "Actualizar VOD" : "Agregar VOD")}
                </Button>
                {vodId && <Button type="button" onClick={() => {clearVodForm(); setActiveTab("manage_vod");}} className="bg-gray-600 hover:bg-gray-700">Cancelar Edición</Button>}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}