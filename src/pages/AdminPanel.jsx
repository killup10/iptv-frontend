// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  fetchAdminChannels, createAdminChannel, updateAdminChannel,
  deleteAdminChannel, processM3UForAdmin,
  fetchAdminVideos, createAdminVideo, updateAdminVideo, deleteAdminVideo
} from "../utils/api.js"; // Asegúrate que estas funciones estén en tu api.js y sean correctas

// --- Componentes UI (Simplificados para el ejemplo, usa los tuyos) ---
const Tab = ({ label, value, activeTab, onTabChange }) => ( <button onClick={() => onTabChange(value)} className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap ${activeTab === value ? 'border-b-2 border-red-500 text-white' : 'text-gray-400 hover:text-gray-200 hover:border-b-2 hover:border-gray-500'}`}> {label} </button> );
const Input = (props) => <input {...props} className={`w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 ${props.className || ""}`} />;
const Textarea = (props) => <textarea {...props} className={`w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white placeholder-gray-400 h-24 ${props.className || ""}`} />;
const Select = (props) => <select {...props} className={`w-full p-3 bg-gray-700 rounded-md border border-gray-600 focus:ring-1 focus:ring-red-500 focus:border-red-500 text-white ${props.className || ""}`} />;
const Button = ({ children, className, disabled, ...props }) => ( <button {...props} disabled={disabled} className={`font-bold py-2 px-4 rounded transition-colors duration-150 ease-in-out ${className || ""} ${disabled ? "bg-gray-500 text-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}> {children} </button> );

const MAIN_SECTION_VOD_OPTIONS = [
    { key: "POR_GENERO", displayName: "POR GÉNEROS (Agrupador)"}, { key: "ESPECIALES", displayName: "ESPECIALES (Festividades)"},
    { key: "CINE_2025", displayName: "CINE 2025 (Estrenos)"}, { key: "CINE_4K", displayName: "CINE 4K"},
    { key: "CINE_60FPS", displayName: "CINE 60 FPS"},
];
const ALL_AVAILABLE_PLANS = [ // Asegúrate que 'basico' y 'estandar' estén aquí
  { key: "basico", displayName: "Básico (GPlay)" }, { key: "estandar", displayName: "Estándar" },
  { key: "cinefilo", displayName: "Cinéfilo" }, { key: "sports", displayName: "Sports" },
  { key: "premium", displayName: "Premium" }, { key: "free_preview", displayName: "Vista Previa Gratuita" },
];
const VOD_PLAN_OPTIONS = [ // Incluye 'estandar' si aplica a VODs
  { key: "basico", displayName: "Básico (VOD)" }, { key: "estandar", displayName: "Estándar (VOD)" },
  { key: "premium", displayName: "Premium (VOD)" }, { key: "cinefilo", displayName: "Cinéfilo (VOD)" },
];

export default function AdminPanel() {
  const { user } = useAuth();

  const [m3uFile, setM3uFile] = useState(null);
  // VOD States
  const [vodId, setVodId] = useState(null); const [videoTitle, setVideoTitle] = useState(""); const [videoUrl, setVideoUrl] = useState(""); const [videoLogo, setVideoLogo] = useState(""); const [videoDescription, setVideoDescription] = useState(""); const [videoTrailerUrl, setVideoTrailerUrl] = useState(""); const [videoReleaseYear, setVideoReleaseYear] = useState(new Date().getFullYear().toString()); const [videoIsFeatured, setVideoIsFeatured] = useState(false); const [videoIsActive, setVideoIsActive] = useState(true); const [videoTipo, setVideoTipo] = useState("pelicula"); const [videoMainSection, setVideoMainSection] = useState(MAIN_SECTION_VOD_OPTIONS[0]?.key || "POR_GENERO"); const [videoGenres, setVideoGenres] = useState(""); const [videoRequiresPlan, setVideoRequiresPlan] = useState(VOD_PLAN_OPTIONS[0]?.key || "basico");
  // Channel States
  const [channelId, setChannelId] = useState(null); const [channelName, setChannelName] = useState(""); const [channelUrl, setChannelUrl] = useState(""); const [channelLogo, setChannelLogo] = useState(""); const [channelDescription, setChannelDescription] = useState(""); const [channelSection, setChannelSection] = useState("General"); const [channelIsActive, setChannelIsActive] = useState(true); const [channelIsFeatured, setChannelIsFeatured] = useState(false); const [channelRequiresPlan, setChannelRequiresPlan] = useState([]); const [channelIsPubliclyVisible, setChannelIsPubliclyVisible] = useState(true);

  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState({ channels: false, vod: false }); // Estado de carga individual
  const [activeTab, setActiveTab] = useState("manage_channels");

  const clearMessages = useCallback(() => { setErrorMsg(""); setSuccessMsg(""); }, []);

  const _fetchAdminChannelsList = useCallback(async () => {
    if (!user?.token) { setErrorMsg("No autenticado."); return; }
    setIsLoading(prev => ({ ...prev, channels: true })); clearMessages();
    try {
      console.log("AdminPanel: Llamando a fetchAdminChannels...");
      const data = await fetchAdminChannels();
      setChannels(data || []);
      console.log("AdminPanel: Canales de admin recibidos:", data);
      if (!data || data.length === 0) setSuccessMsg("No hay canales para mostrar en el panel.");
      else setSuccessMsg("");
    } catch (err) {
      console.error("AdminPanel: Error en fetchAdminChannels:", err);
      setErrorMsg(err.message || "Fallo al cargar canales para el panel."); setChannels([]);
    } finally { setIsLoading(prev => ({ ...prev, channels: false })); }
  }, [user?.token, clearMessages]);

  const _fetchAdminVideosList = useCallback(async () => {
    if (!user?.token) { setErrorMsg("No autenticado."); return; }
    setIsLoading(prev => ({ ...prev, vod: true })); clearMessages();
    try {
      console.log("AdminPanel: Llamando a fetchAdminVideos...");
      const data = await fetchAdminVideos();
      setVideos(data || []);
      console.log("AdminPanel: VODs de admin recibidos:", data);
      if (!data || data.length === 0) setSuccessMsg("No hay VODs para mostrar en el panel.");
      else setSuccessMsg("");
    } catch (err) {
      console.error("AdminPanel: Error en fetchAdminVideos:", err);
      setErrorMsg(err.message || "Fallo al cargar VODs para el panel."); setVideos([]);
    } finally { setIsLoading(prev => ({ ...prev, vod: false })); }
  }, [user?.token, clearMessages]);

  useEffect(() => {
    if (user?.token && user?.role === 'admin') {
      clearMessages();
      if (activeTab === "manage_channels") {
        _fetchAdminChannelsList();
      } else if (activeTab === "manage_vod") {
        _fetchAdminVideosList();
      }
      // Limpiar formularios si no se está editando al cambiar a la pestaña de agregar
      if (activeTab === "add_channel" && !channelId) {
        clearChannelForm();
      }
      if (activeTab === "add_vod" && !vodId) {
        clearVodForm();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?.token, user?.role]); // No incluyas las funciones de fetch aquí para evitar bucles infinitos si no están con useCallback puro

  const clearChannelForm = useCallback(() => { /* ...tu código ... */ }, []);
  const handleChannelPlanChange = (planKey) => {setChannelRequiresPlan(prev => prev.includes(planKey) ? prev.filter(p => p !== planKey) : [...prev, planKey]);};
  const handleEditChannelClick = useCallback((channel) => { /* ...tu código ... */ setChannelId(channel.id||channel._id); setChannelName(channel.name||""); setChannelUrl(channel.url||""); setChannelLogo(channel.logo||""); setChannelDescription(channel.description||""); setChannelSection(channel.section||"General"); setChannelIsActive(channel.active !== undefined ? channel.active : true); setChannelIsFeatured(channel.isFeatured||false); setChannelRequiresPlan(Array.isArray(channel.requiresPlan) ? channel.requiresPlan : (channel.requiresPlan ? [String(channel.requiresPlan)] : [])); setChannelIsPubliclyVisible(channel.isPubliclyVisible === undefined ? true : channel.isPubliclyVisible); setActiveTab("add_channel"); clearMessages(); }, [clearMessages]);
  const submitChannel = async (e) => { e.preventDefault(); /* ...tu código ... */ try { if(channelId) await updateAdminChannel(channelId, channelData); else await createAdminChannel(channelData); setSuccessMsg("OK"); clearChannelForm(); _fetchAdminChannelsList(); setActiveTab("manage_channels"); } catch(err){setErrorMsg(err.message)} finally{setIsSubmitting(false)} };
  const handleDeleteChannel = async (id) => { if(!id || !window.confirm("Eliminar?")) return; /* ...tu código ... */ try { await deleteAdminChannel(id); setSuccessMsg("OK"); _fetchAdminChannelsList(); } catch(err){setErrorMsg(err.message)} finally{setIsSubmitting(false)} };
  const submitM3uFileToChannels = async (e) => { e.preventDefault(); /* ...tu código ... */ try { const result = await processM3UForAdmin(formData); setSuccessMsg(result.message); _fetchAdminChannelsList(); } catch(err){setErrorMsg(err.message)} finally{setIsSubmitting(false)} };
  const clearVodForm = useCallback(() => { /* ...tu código ... */ }, []);
  const handleEditVodClick = useCallback((video) => { /* ...tu código ... */ setVodId(video.id||video._id); setVideoTitle(video.title||""); /* setea todos los demás campos del VOD */ setActiveTab("add_vod"); clearMessages(); }, [clearMessages]);
  const submitVideo = async (e) => { e.preventDefault(); /* ...tu código ... */ try { if(vodId) await updateAdminVideo(vodId, videoData); else await createAdminVideo(videoData); setSuccessMsg("OK"); clearVodForm(); _fetchAdminVideosList(); setActiveTab("manage_vod"); } catch(err){setErrorMsg(err.message)} finally{setIsSubmitting(false)} };
  const deleteVideoHandler = async (id) => { if(!id || !window.confirm("Eliminar?")) return; /* ...tu código ... */ try { await deleteAdminVideo(id); setSuccessMsg("OK"); _fetchAdminVideosList(); } catch(err){setErrorMsg(err.message)} finally{setIsSubmitting(false)} };

  if (!user?.token || user?.role !== "admin") {
    return <div className="flex justify-center items-center min-h-screen"><p className="text-xl text-red-500">Acceso denegado. Debes ser administrador.</p></div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-6xl mx-auto bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-red-500">Panel de Administración</h1>
      <div className="my-4 min-h-[2.5rem]">
        {errorMsg && <div className="p-3 bg-red-800 text-red-100 rounded shadow text-sm" role="alert">{errorMsg}</div>}
        {successMsg && <div className="p-3 bg-green-800 text-green-100 rounded shadow text-sm" role="alert">{successMsg}</div>}
      </div>
      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-6">
        {/* ... Tus Tabs ... */}
        <Tab label="Subir M3U (Canales)" value="m3u_to_channels" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label={channelId ? "Editar Canal" : "Agregar Canal"} value="add_channel" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label="Gestionar Canales" value="manage_channels" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label={vodId ? "Editar VOD" : "Agregar VOD"} value="add_vod" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label="Gestionar VOD" value="manage_vod" activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === "m3u_to_channels" && ( <section> {/* ... Tu JSX para M3U ... */} </section> )}
      {activeTab === "add_channel" && ( <section> {/* ... Tu JSX para Formulario de Canal ... */} </section> )}
      
      {activeTab === "manage_channels" && (
        <section className="p-1 sm:p-6 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 px-4 pt-4 sm:px-0 sm:pt-0">Gestionar Canales Existentes</h2>
          {isLoading.channels ? (<div className="text-center py-10 text-gray-400">Cargando canales...</div>)
          : (channels && channels.length > 0) ? (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
              {channels.map((ch) => ( /* ... Tu JSX para mostrar cada canal ... */
                 <div key={ch.id || ch._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 hover:bg-gray-600/80 transition-colors rounded-md gap-3">
                  <img src={ch.logo || '/img/placeholder-thumbnail.png'} alt={ch.name || 'logo'} className="w-20 h-14 sm:w-24 sm:h-16 object-contain bg-black rounded-sm mr-0 sm:mr-3 flex-shrink-0 self-center sm:self-start border border-gray-600" onError={(e) => {e.currentTarget.src = '/img/placeholder-thumbnail.png';}}/>
                  <div className="flex-grow mb-2 sm:mb-0 text-sm min-w-0 text-center sm:text-left">
                    <strong className={`text-base block truncate ${!ch.active ? 'text-gray-500 line-through' : 'text-white'}`} title={ch.name || "Sin Nombre"}>{ch.name || "Sin Nombre"}</strong>
                    <p className="text-xs text-gray-400 truncate" title={ch.url}>{ch.url}</p>
                    <p className="text-xs text-gray-500">Sección: <span className="text-gray-400">{ch.section || "N/A"}</span></p>
                    <p className="text-xs text-gray-500">
                      Planes: <span className="text-gray-400">{(Array.isArray(ch.requiresPlan) ? ch.requiresPlan : [ch.requiresPlan]).map(pKey => ALL_AVAILABLE_PLANS.find(p => p.key === pKey)?.displayName || pKey).join(', ') || 'N/A'}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {ch.active ? "Activo" : "Inactivo"} | {ch.isFeatured ? "Destacado" : "No Dest."} | {ch.isPubliclyVisible ? "Público" : "Privado"}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 flex-shrink-0 self-center sm:self-auto w-full sm:w-auto justify-around sm:justify-start">
                    <Button onClick={() => handleEditChannelClick(ch)} className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1.5">Editar</Button>
                    <Button onClick={() => handleDeleteChannel(ch.id || ch._id)} disabled={isSubmitting} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5">Eliminar</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (<p className="text-gray-400 text-center py-10">{!errorMsg ? "No hay canales para mostrar." : errorMsg}</p>)}
        </section>
      )}

      {activeTab === "manage_vod" && (
        <section className="p-1 sm:p-6 bg-gray-800 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 px-4 pt-4 sm:px-0 sm:pt-0">Gestionar VOD Existente</h2>
            {isLoading.vod ? <div className="text-center py-10 text-gray-400">Cargando VODs...</div> 
            : videos && videos.length > 0 ? (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                    {videos.map(vid => ( /* ... Tu JSX para mostrar cada VOD ... */ 
                        <div key={vid.id || vid._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-700 hover:bg-gray-600/80 transition-colors rounded-md gap-3">
                          <img src={vid.logo || vid.thumbnail || '/img/placeholder-thumbnail.png'} alt={vid.title || 'logo'} className="w-16 h-24 object-cover bg-black rounded-sm mr-0 sm:mr-3 flex-shrink-0 self-center sm:self-start border border-gray-600" onError={(e) => {e.currentTarget.src = '/img/placeholder-thumbnail.png';}}/>
                          <div className="flex-grow mb-2 sm:mb-0 text-sm min-w-0 text-center sm:text-left">
                            <strong className={`text-base block truncate ${!vid.active ? 'text-gray-500 line-through' : 'text-white'}`} title={vid.title || "Sin Título"}>{vid.title || "Sin Título"} <span className="text-xs text-gray-400">({vid.tipo || 'N/A'})</span></strong>
                            <p className="text-xs text-gray-400 truncate" title={vid.url}>{vid.url}</p>
                            <p className="text-xs text-gray-500">Sección VOD: <span className="text-gray-400">{MAIN_SECTION_VOD_OPTIONS.find(s=>s.key === vid.mainSection)?.displayName || vid.mainSection || 'N/A'}</span></p>
                            <p className="text-xs text-gray-500">Plan VOD: <span className="text-gray-400">{VOD_PLAN_OPTIONS.find(p=>p.key === vid.requiresPlan)?.displayName || vid.requiresPlan || 'N/A'}</span></p>
                            <p className="text-xs text-gray-500">Géneros: <span className="text-gray-400">{Array.isArray(vid.genres) ? vid.genres.join(', ') : (vid.genres || 'N/A')}</span></p>
                            <p className="text-xs text-gray-500">{vid.active ? "Activo" : "Inactivo"} | {vid.isFeatured ? "Destacado" : "No Dest."}</p>
                          </div>
                          <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 flex-shrink-0 self-center sm:self-auto w-full sm:w-auto justify-around sm:justify-start">
                            <Button onClick={() => handleEditVodClick(vid)} className="flex-1 sm:flex-none bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1.5">Editar</Button>
                            <Button onClick={() => deleteVideoHandler(vid.id || vid._id)} disabled={isSubmitting} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-xs px-3 py-1.5">Eliminar</Button>
                          </div>
                        </div>
                    ))}
                </div>
            ) : <p className="text-gray-400 text-center py-10">{!errorMsg ? "No hay VODs para mostrar." : errorMsg}</p>}
        </section>
      )}
      {activeTab === "add_vod" && ( <section> {/* ... Tu JSX para Formulario de VOD ... */} </section> )}
    </div>
  );
}