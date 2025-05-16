// src/pages/AdminPanel.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";

// --- Tus Componentes UI (Tab, Input, Textarea, Select, Button) ---
// (Asegúrate de que estén definidos como antes o importados)
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

// Coincidir con el backend (Video.model.js enum y ALL_POSSIBLE_SECTIONS en videos.routes.js)
const MAIN_SECTION_OPTIONS = [
    { key: "POR_GENERO", displayName: "POR GÉNEROS (Agrupador)"},
    { key: "ESPECIALES", displayName: "ESPECIALES (Festividades)"},
    { key: "CINE_2025", displayName: "CINE 2025 (Estrenos)"},
    { key: "CINE_4K", displayName: "CINE 4K"},
    { key: "CINE_60FPS", displayName: "CINE 60 FPS"},
];

export default function AdminPanel() {
  const { user } = useAuth();
  const token = user?.token;
  const API_URL = import.meta.env.VITE_API_URL;
  
  // ... (todos tus otros estados: m3uFile, vodId, videoTitle, etc.) ...
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
  const [videoMainSection, setVideoMainSection] = useState("POR_GENERO"); // Default
  const [videoGenres, setVideoGenres] = useState("");
  const [videoRequiresPlan, setVideoRequiresPlan] = useState("basico");

  const [channelId, setChannelId] = useState(null);
  const [channelName, setChannelName] = useState("");
  // ... (más estados de canal)

  const [channels, setChannels] = useState([]);
  const [videos, setVideos] = useState([]); // Este es el estado para la lista de VODs
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [activeTab, setActiveTab] = useState("manage_vod"); // Iniciar en Gestionar VOD

  const getAuthHeaders = useCallback((isFormData = false) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!isFormData) headers['Content-Type'] = 'application/json';
    return headers;
  }, [token]);

  const clearMessages = () => { setErrorMsg(""); setSuccessMsg(""); };

  const fetchChannels = useCallback(async () => { /* ... (tu función fetchChannels) ... */ }, [token, API_URL, getAuthHeaders]);
  
  const fetchVideos = useCallback(async () => {
    if (!token) return;
    setIsLoadingList(true); 
    clearMessages();
    console.log("AdminPanel: Iniciando fetchVideos...");
    try {
      const res = await fetch(`${API_URL}/api/videos?view=admin`, { headers: getAuthHeaders() });
      const responseText = await res.text();
      console.log(`AdminPanel fetchVideos - Respuesta TEXTO (Status ${res.status}):`, responseText);

      if (!res.ok) {
          let errorDetail = `Error ${res.status} del servidor.`;
          try {
              const parsedError = JSON.parse(responseText);
              errorDetail = parsedError.error || errorDetail;
          } catch (e) { /* No hacer nada si no es JSON */ }
          throw new Error(`Error al cargar VODs para admin: ${errorDetail}`);
      }

      const data = JSON.parse(responseText);
      console.log("AdminPanel - fetchVideos - Datos VOD PARSEADOS para la lista:", data);
      
      if (Array.isArray(data)) {
        setVideos(data);
        if (data.length === 0) {
            console.log("AdminPanel fetchVideos: El backend devolvió un array vacío para los VODs.");
        }
      } else {
        console.error("AdminPanel fetchVideos: La respuesta del backend no es un array:", data);
        setVideos([]); // Establecer a array vacío si la data no es un array
        setErrorMsg("Formato de datos incorrecto recibido del servidor para VODs.");
      }

    } catch (err) { 
      console.error("AdminPanel fetchVideos - CATCH Error:", err);
      setErrorMsg(err.message || "Fallo al cargar VODs."); 
      setVideos([]);
    } finally { 
      setIsLoadingList(false); 
      console.log("AdminPanel: fetchVideos finalizado.");
    }
  }, [token, API_URL, getAuthHeaders]);

  useEffect(() => {
    clearMessages();
    if (user && user.role === 'admin' && token) { // Asegurarse que el usuario sea admin
      if (activeTab === "manage_channels") {
        fetchChannels();
      } else if (activeTab === "add_channel" && !channelId) {
        clearChannelForm();
      }
      
      if (activeTab === "manage_vod") {
        fetchVideos(); // Llamar aquí cuando la pestaña se active
      } else if (activeTab === "add_vod" && !vodId) {
        clearVodForm();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, token, user]); // Quitar channelId y vodId para evitar llamadas múltiples si fetchVideos/Channels no están en useCallback
                               // O añadir fetchVideos/Channels a las dependencias si están con useCallback

  const submitM3uToChannels = async (e) => { /* ... (tu función) ... */ };
  const clearChannelForm = () => { /* ... (tu función) ... */ };
  const handleEditChannelClick = (channel) => { /* ... (tu función) ... */ };
  const submitChannel = async (e) => { /* ... (tu función) ... */ };
  const deleteChannel = async (id) => { /* ... (tu función) ... */ };

  const clearVodForm = () => {
    setVodId(null); setVideoTitle(""); setVideoUrl(""); setVideoLogo("");
    setVideoDescription(""); setVideoTrailerUrl("");
    setVideoReleaseYear(new Date().getFullYear().toString()); setVideoIsFeatured(false); 
    setVideoIsActive(true); setVideoTipo("pelicula");
    setVideoMainSection("POR_GENERO");
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
    setVideoMainSection(video.mainSection || "POR_GENERO");
    setVideoGenres(Array.isArray(video.genres) ? video.genres.join(', ') : (video.genres || ""));
    setVideoRequiresPlan(video.requiresPlan || "basico");
    setActiveTab("add_vod"); 
    clearMessages();
  };

  const submitVideo = async (e) => {
    e.preventDefault();
    if(!videoTitle || !videoUrl) { setErrorMsg("Título y URL son requeridos."); return; }
    setIsSubmitting(true); clearMessages();
    const parsedGenres = videoGenres.split(',').map(g => g.trim()).filter(g => g);
    const videoData = {
      title: videoTitle, url: videoUrl, logo: videoLogo, description: videoDescription,
      trailerUrl: videoTrailerUrl, 
      releaseYear: videoReleaseYear ? parseInt(videoReleaseYear) : null,
      isFeatured: videoIsFeatured, active: videoIsActive, tipo: videoTipo,
      mainSection: videoMainSection, genres: parsedGenres, requiresPlan: videoRequiresPlan,
    };
    console.log("AdminPanel: Enviando datos de VOD:", videoData, "al ID:", vodId);
    try {
      const endpointBase = `${API_URL}/api/videos`;
      const res = vodId 
        ? await fetch(`${endpointBase}/${vodId}`, { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(videoData) })
        : await fetch(`${endpointBase}/upload-link`, { method: "POST", headers: getAuthHeaders(), body: JSON.stringify(videoData) });
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || responseData.message || `Error ${res.status}`);
      setSuccessMsg(vodId ? "VOD actualizado." : "VOD agregado.");
      clearVodForm(); 
      fetchVideos(); // Volver a cargar la lista después de agregar/editar
      if(vodId) setActiveTab("manage_vod"); // Regresar a la lista si estaba editando
    } catch (err) { setErrorMsg(err.message); console.error("Error en submitVideo:", err); } 
    finally { setIsSubmitting(false); }
  };
  
  const deleteVideo = async (id) => {
    if (!window.confirm("¿Eliminar este VOD?")) return;
    // ... (tu lógica de deleteVideo)
    try {
      // ...
      fetchVideos(); // Volver a cargar la lista después de eliminar
    } catch (err) { /* ... */ }
  };

  if (!token || !user || user.role !== "admin") {
    return <div className="flex justify-center items-center min-h-screen"><p className="p-8 text-xl bg-red-900 text-red-200 rounded-md">Acceso denegado.</p></div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 max-w-5xl mx-auto bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-red-500">Panel de Administración</h1>
      {errorMsg && <div className="p-3 my-4 bg-red-200 text-red-800 border border-red-400 rounded-md shadow-lg" role="alert">{errorMsg}</div>}
      {successMsg && <div className="p-3 my-4 bg-green-200 text-green-800 border border-green-400 rounded-md shadow-lg" role="alert">{successMsg}</div>}
      
      <div className="flex flex-wrap justify-center border-b border-gray-700 mb-6">
        {/* ... Tus Tabs ... */}
        <Tab label="Subir M3U (a Canales)" value="m3u_to_channels" activeTab={activeTab} onTabChange={setActiveTab} />
        <Tab label={channelId ? "Editar Canal" : "Agregar Canal"} value="add_channel" activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if(!channelId && tab === 'add_channel') { clearChannelForm(); clearMessages();} }} />
        <Tab label="Gestionar Canales" value="manage_channels" activeTab={activeTab} onTabChange={(tab) => {setActiveTab(tab); clearMessages(); fetchChannels();}} />
        <Tab label={vodId ? "Editar VOD" : "Agregar VOD"} value="add_vod" activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); if(!vodId && tab === 'add_vod') {clearVodForm(); clearMessages();}}} />
        <Tab label="Gestionar VOD" value="manage_vod" activeTab={activeTab} onTabChange={(tab) => {setActiveTab(tab); clearMessages(); fetchVideos();}} />
      </div>

      {/* ... (Renderizado condicional de las pestañas) ... */}

      {/* Pestaña Gestionar VOD - CON CORRECCIÓN DE SINTAXIS Y LOGS */}
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
                    <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md md:max-w-lg" title={vid.url}>{vid.url}</p>
                    <p className="text-xs text-gray-500">Sección: {vid.mainSection || 'N/A'} | Plan: {vid.requiresPlan || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Géneros: {Array.isArray(vid.genres) ? vid.genres.join(', ') : (vid.genres || 'N/A')}</p>
                    <p className="text-xs text-gray-500">{vid.active ? "Activo" : "Inactivo"} - {vid.isFeatured ? "Destacado" : "No Dest."}</p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 self-center sm:self-auto">
                    <Button onClick={() => handleEditVodClick(vid)} className="bg-yellow-500 hover:bg-yellow-600 text-black text-xs px-3 py-1">Editar</Button>
                    <Button onClick={() => deleteVideo(vid.id || vid._id)} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1">Eliminar</Button>
                  </div>
                </div>
              ))}
            </div> 
            ) : ( // Este es el 'else' del ternario (videos && videos.length > 0)
            <p className="text-gray-400 text-center py-10">
                {errorMsg ? `Error: ${errorMsg}` : "No hay VODs (películas/series) para mostrar o no se pudieron cargar."}
            </p>
            )
           }
        </section>
      )}
      {/* ... (resto de las pestañas Add/Edit VOD, M3U, Canales, etc., como las tenías con las correcciones anteriores) ... */}
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
              <Input id="videoGenresAdmin" type="text" placeholder="Ej: Acción, Comedia, Terror" value={videoGenres} onChange={(e) => setVideoGenres(e.target.value)} />
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
            <label className="flex items-center space-x-2 text-gray-300"><input type="checkbox" checked={videoIsFeatured} onChange={(e) => setVideoIsFeatured(e.target.checked)} className="form-checkbox"/><span>Destacado (Home)</span></label>
            <label className="flex items-center space-x-2 text-gray-300"><input type="checkbox" checked={videoIsActive} onChange={(e) => setVideoIsActive(e.target.checked)} className="form-checkbox"/><span>Activo</span></label>
            <div className="flex gap-4 pt-2">
                <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">{isSubmitting ? (vodId ? "Actualizando..." : "Agregando...") : (vodId ? "Actualizar VOD" : "Agregar VOD")}</Button>
                {vodId && <Button type="button" onClick={() => {clearVodForm(); setActiveTab("manage_vod");}} className="bg-gray-600 hover:bg-gray-700">Cancelar</Button>}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}