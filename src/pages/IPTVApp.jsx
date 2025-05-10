// src/pages/IPTVApp.jsx
import React, { useEffect, useState } from 'react';
import VideoPlayer from '../components/VideoPlayer.jsx'; // Asegúrate que este componente es robusto
import { useAuth } from '../context/AuthContext.jsx';

export default function IPTVApp({ defaultTab = 'live' }) {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null); // Almacenará la URL original
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL; // URL de tu backend Node.js
  const { token } = user || {};
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    if (activeTab === 'live') {
      loadChannels();
    } else {
      loadVideos();
    }
  }, [activeTab, user]); // Agregado user por si el token cambia

  async function loadChannels() {
    if (!token) { // No cargar si no hay token
      setIsLoading(false);
      setChannels([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/channels/list`, { headers: authHeader });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Error cargando canales: ${res.status} ${errorData}`);
      }
      const data = await res.json();
      setChannels(data || []); // Asegurar que sea un array
    } catch (err) {
      console.error("Error en loadChannels:", err);
      setError(err.message);
      setChannels([]); // Limpiar en caso de error
    } finally {
      setIsLoading(false);
    }
  }

  async function loadVideos() {
    if (!token) { // No cargar si no hay token
      setIsLoading(false);
      setVideoFiles([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/videos`, { headers: authHeader });
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Error cargando videos: ${res.status} ${errorData}`);
      }
      const data = await res.json();
      setVideoFiles(data || []); // Asegurar que sea un array
    } catch (err) {
      console.error("Error en loadVideos:", err);
      setError(err.message);
      setVideoFiles([]); // Limpiar en caso de error
    } finally {
      setIsLoading(false);
    }
  }

  // Función para determinar la URL final para el reproductor
  function getPlayableUrl(originalUrl) {
    if (!originalUrl) {
      console.warn("getPlayableUrl recibió una URL nula o undefined");
      return originalUrl;
    }

    // 1. URLs que ya usan tu dominio teamg.store (manejadas por tu Cloudflare Worker)
    //    Estas se reproducen directamente.
    if (originalUrl.startsWith('https://teamg.store/')) {
      console.log(`Reproduciendo directamente (URL de teamg.store): ${originalUrl}`);
      return originalUrl;
    }

    // 2. URLs que necesitan pasar por el proxy de tu backend Node.js
    //    (canales M3U8, MKV/MP4 directos de Dropbox u otras fuentes no-teamg.store)
    if (originalUrl.match(/\.(m3u8|mp4|mkv)(\?|$)/i)) {
      const encodedUrl = encodeURIComponent(originalUrl);
      const proxiedUrl = `${API_URL}/proxy?url=${encodedUrl}`;
      console.log(`Reproduciendo vía proxy del backend Node.js: ${proxiedUrl} (Original: ${originalUrl})`);
      return proxiedUrl;
    }

    // 3. Otros tipos de URL (si los hubiera) - reproducir directamente por defecto
    console.log(`Reproduciendo directamente (otro tipo de URL): ${originalUrl}`);
    return originalUrl;
  }

  const handleSelectVideo = (urlOriginal) => {
    if (!urlOriginal) {
      console.error("Se intentó seleccionar un video con URL undefined!");
      setError("La URL del video seleccionado no es válida.");
      setSelectedVideoUrl(null);
      return;
    }
    console.log("URL original seleccionada:", urlOriginal);
    setSelectedVideoUrl(urlOriginal); // Guardamos la URL original cruda
  };


  const filteredChannels = Array.isArray(channels) ? channels.filter(c =>
    c && c.name && c.name.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const filteredVideos = Array.isArray(videoFiles) ? videoFiles.filter(v =>
    v && v.title && v.title.toLowerCase().includes(search.toLowerCase())
  ) : [];

  if (!user) return <p className="p-4 text-center">Debes iniciar sesión para acceder.</p>;

  // Preparamos la URL para el VideoPlayer solo si hay una selectedVideoUrl
  const finalUrlForPlayer = selectedVideoUrl ? getPlayableUrl(selectedVideoUrl) : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {finalUrlForPlayer ? ( // Usamos finalUrlForPlayer para decidir si mostrar el reproductor
        <div className="p-4">
          <button onClick={() => setSelectedVideoUrl(null)} className="mb-4 text-gray-400 hover:text-white">
            ← Volver
          </button>
          <VideoPlayer url={finalUrlForPlayer} />
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">
                {activeTab === 'live' ? 'TV en Vivo' : 'Películas'}
              </h1>
              <p className="text-gray-400">
                {activeTab === 'live'
                  ? 'Disfruta de tus canales favoritos.'
                  : 'Explora nuestra colección.'}
              </p>
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            />
          </div>

          <div className="mb-6 flex space-x-4">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2 font-medium ${activeTab === 'live' ? 'border-b-2 border-red-600 text-white' : 'text-gray-400'}`}
            >
              Live
            </button>
            <button
              onClick={() => setActiveTab('vod')}
              className={`px-4 py-2 font-medium ${activeTab === 'vod' ? 'border-b-2 border-red-600 text-white' : 'text-gray-400'}`}
            >
              VOD
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-12 w-12 border-t-2 border-red-600 rounded-full"></div>
            </div>
          ) : error ? (
            <p className="mt-4 text-center text-red-500">{error}</p>
          ) : activeTab === 'live' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredChannels.length > 0 ? filteredChannels.map(c => {
                // **Importante: Asegúrate que 'c.url' y 'c.thumbnail' existen y son válidos**
                if (!c || !c.url) {
                  console.warn("Canal sin URL:", c);
                  return null; // O mostrar un placeholder
                }
                return (
                  <div key={c.id || c._id} onClick={() => handleSelectVideo(c.url)} className="cursor-pointer rounded overflow-hidden">
                    <img src={c.thumbnail || '/placeholder-thumbnail.png'} alt={c.name || 'Canal sin nombre'} className="w-full h-32 object-cover" />
                    <p className="mt-2 truncate">{c.name || 'Canal sin nombre'}</p>
                  </div>
                );
              }) : <p>No hay canales disponibles.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredVideos.length > 0 ? filteredVideos.map(v => {
                // **Importante: Asegúrate que 'v.url' y 'v.thumbnail' existen y son válidos**
                 if (!v || !v.url) {
                  console.warn("Video sin URL:", v);
                  return null; // O mostrar un placeholder
                }
                return (
                  <div key={v._id} onClick={() => handleSelectVideo(v.url)} className="cursor-pointer rounded overflow-hidden">
                    <div className="aspect-video bg-gray-800 flex items-center justify-center rounded">
                      <img src={v.thumbnail || '/placeholder-thumbnail.png'} alt={v.title || 'Video sin título'} className="w-full h-full object-cover" />
                    </div>
                    <p className="mt-2 truncate">{v.title || 'Video sin título'}</p>
                  </div>
                );
              }) : <p>No hay películas disponibles.</p>}
            </div>
          )}
          {/* El error general ya se muestra arriba si isLoading es false */}
        </div>
      )}
    </div>
  );
}