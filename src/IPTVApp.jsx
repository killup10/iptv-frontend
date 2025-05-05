// src/IPTVApp.jsx
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Tabs } from './components/ui/tabs.jsx';
import { Tab } from './components/ui/tab.jsx';
import { Input } from './components/ui/input.jsx';
import { Search } from 'lucide-react'; // Asegúrate de tener este paquete instalado

export default function IPTVApp() {
  const [m3uFiles, setM3uFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  // Cargar datos cuando cambia la pestaña activa
  useEffect(() => {
    setIsLoading(true);
    if (activeTab === 'live') {
      loadM3UFiles();
      loadChannels();
    } else if (activeTab === 'vod') {
      loadVideos();
    }
  }, [activeTab, API_URL]);

  // Cargar archivos M3U
  const loadM3UFiles = () => {
    fetch(`${API_URL}/api/m3u/list`, {
      headers: authHeader,
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar archivos M3U');
        return res.json();
      })
      .then(data => {
        console.log('M3U files cargados:', data);
        setM3uFiles(data.files || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar M3U:', err);
        setError(err.message);
        setIsLoading(false);
      });
  };

  // Cargar canales individuales
  const loadChannels = () => {
    fetch(`${API_URL}/api/channels/list`, {
      headers: authHeader,
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar canales');
        return res.json();
      })
      .then(data => {
        console.log('Canales cargados:', data);
        setChannels(data || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar canales:', err);
        setError(err.message);
        setIsLoading(false);
      });
  };

  // Cargar videos VOD
  const loadVideos = () => {
    fetch(`${API_URL}/api/videos`, {
      headers: authHeader,
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar videos');
        return res.json();
      })
      .then(data => {
        console.log('Videos cargados:', data);
        setVideoFiles(data || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar videos:', err);
        setError(err.message);
        setIsLoading(false);
      });
  };

  const filteredM3U = m3uFiles.filter(file => 
    file.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredChannels = channels.filter(channel => 
    channel?.name?.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredVideos = videoFiles.filter(video => 
    video?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero section */}
        {!selectedVideo && (
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-white">Bienvenido a </span>
              <span className="text-[#8B5CF6]">TeamG Play</span>
            </h1>
            <p className="text-gray-400">
              Explora nuestro catálogo de canales en vivo, películas y series en alta calidad.
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 bg-red-900/50 border border-red-500 text-white rounded-lg">
            Error: {error}
          </div>
        )}

        {/* Tabs section */}
        <div className="mb-6 bg-[#1E1E1E] rounded-lg p-1 inline-flex">
          <button 
            className={`px-4 py-2 rounded-md ${activeTab === 'live' ? 'bg-[#8B5CF6] text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('live')}
          >
            TV en Vivo
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${activeTab === 'vod' ? 'bg-[#8B5CF6] text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('vod')}
          >
            Películas
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${activeTab === 'series' ? 'bg-[#8B5CF6] text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('series')}
          >
            Series
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-3 bg-[#1E1E1E] text-white rounded-lg border border-[#333] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Content section */}
        {selectedVideo ? (
          <div className="mt-8">
            <button 
              onClick={() => setSelectedVideo('')}
              className="mb-4 flex items-center text-[#8B5CF6] hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver
            </button>
            
            <h2 className="text-xl font-semibold mb-4">
              Reproduciendo: {
                activeTab === 'live' 
                  ? channels.find(c => c.url === selectedVideo)?.name || selectedVideo.split('/').pop()
                  : videoFiles.find(v => v.url === selectedVideo)?.title || 'Video'
              }
            </h2>
            
            <div className="rounded-xl overflow-hidden shadow-lg">
              <ReactPlayer
                url={selectedVideo}
                controls
                width="100%"
                height="calc(100vh - 300px)"
                playing
                config={{
                  file: {
                    attributes: { crossOrigin: 'anonymous' },
                    forceHLS: true,
                    hlsOptions: {
                      enableWorker: true,
                      lowLatencyMode: true
                    }
                  }
                }}
                onError={(e) => {
                  console.error("Error en reproducción:", e);
                  setError(`Error al reproducir el video: ${e.message || 'Verifique la URL'}`);
                }}
              />
            </div>
          </div>
        ) : (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B5CF6]"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {activeTab === 'live' && filteredChannels.map(channel => (
                  <div
                    key={`channel-${channel._id}`}
                    className="bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#8B5CF6] transition-all"
                    onClick={() => setSelectedVideo(channel.url)}
                  >
                    <div className="h-32 bg-[#2D2D3A] flex items-center justify-center">
                      <span className="text-4xl">📺</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium truncate">{channel.name}</h3>
                      <p className="text-xs text-gray-400">Canal en vivo</p>
                    </div>
                  </div>
                ))}
                
                {activeTab === 'live' && filteredM3U.map(file => (
                  <div
                    key={`file-${file}`}
                    className="bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#8B5CF6] transition-all"
                    onClick={() => setSelectedVideo(`${API_URL}/uploads/${file}`)}
                  >
                    <div className="h-32 bg-[#2D2D3A] flex items-center justify-center">
                      <span className="text-4xl">📁</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium truncate">{file}</h3>
                      <p className="text-xs text-gray-400">Archivo M3U</p>
                    </div>
                  </div>
                ))}
                
                {activeTab === 'vod' && filteredVideos.map(video => (
                  <div
                    key={video._id}
                    className="bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#8B5CF6] transition-all"
                    onClick={() => setSelectedVideo(video.url)}
                  >
                    <div className="h-32 bg-[#2D2D3A] flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium truncate">{video.title}</h3>
                      <p className="text-xs text-gray-400">Película</p>
                    </div>
                  </div>
                ))}
                
                {activeTab === 'live' && filteredChannels.length === 0 && filteredM3U.length === 0 && (
                  <p className="col-span-full text-center text-gray-400 py-10">No hay canales disponibles</p>
                )}
                
                {activeTab === 'vod' && filteredVideos.length === 0 && (
                  <p className="col-span-full text-center text-gray-400 py-10">No hay películas disponibles</p>
                )}
                
                {activeTab === 'series' && (
                  <p className="col-span-full text-center text-gray-400 py-10">Próximamente: Catálogo de series</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}