import React, { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';

export default function IPTVApp({ defaultTab = 'live' }) {
  const [m3uFiles, setM3uFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab); // Usar el defaultTab
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState(['Todos', 'Deportes', 'Noticias', 'Entretenimiento', 'Películas']);
  const [activeCategory, setActiveCategory] = useState('Todos');
  
  const playerRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  // Cargar datos cuando cambia la pestaña activa
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    if (activeTab === 'live') {
      loadChannels();
      loadM3UFiles();
    } else if (activeTab === 'vod') {
      loadVideos();
    }
  }, [activeTab, API_URL]);

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
        setChannels(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar canales:', err);
        setError(err.message);
        setIsLoading(false);
      });
  };

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
      })
      .catch(err => {
        console.error('Error al cargar M3U:', err);
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
        setVideoFiles(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar videos:', err);
        setError(err.message);
        setIsLoading(false);
      });
  };

  // Filtrar canales por categoría y búsqueda
  const filteredChannels = channels.filter(channel => 
    (activeCategory === 'Todos' || channel.category === activeCategory) && 
    channel?.name?.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredM3U = m3uFiles.filter(file => 
    file.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredVideos = videoFiles.filter(video => 
    video?.title?.toLowerCase().includes(search.toLowerCase())
  );

  // Manejar error de reproducción
  const handlePlayerError = (e) => {
    console.error("Error en reproducción:", e);
    setError(`Error al reproducir el video. Verifique la URL o su conexión.`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {selectedVideo ? (
        // Vista de reproducción
        <div className="min-h-screen flex flex-col">
          <div className="bg-black flex-grow">
            <div className="container mx-auto px-4 py-4">
              <button 
                onClick={() => setSelectedVideo(null)}
                className="flex items-center mb-4 text-gray-400 hover:text-white transition"
              >
                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver
              </button>
              
              <div className="mb-4">
                <h1 className="text-2xl font-bold">
                  {activeTab === 'live' 
                    ? channels.find(c => c.url === selectedVideo)?.name || selectedVideo.split('/').pop()
                    : videoFiles.find(v => v.url === selectedVideo)?.title || 'Video'
                  }
                </h1>
                <p className="text-gray-400 text-sm">
                  {activeTab === 'live' ? 'Canal en vivo' : 'Película'}
                </p>
              </div>
              
              <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-video">
                {error ? (
                  <div className="absolute inset-0 flex items-center justify-center flex-col p-4">
                    <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-center text-lg font-medium">{error}</p>
                    <button 
                      onClick={() => {
                        setError(null);
                        setSelectedVideo(null);
                      }}
                      className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                    >
                      Volver al catálogo
                    </button>
                  </div>
                ) : (
                  <ReactPlayer
                    ref={playerRef}
                    url={selectedVideo}
                    width="100%"
                    height="100%"
                    playing
                    controls
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
                    onError={handlePlayerError}
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  />
                )}
              </div>
              
              {/* Controles adicionales para la reproducción */}
              <div className="flex justify-between mt-4">
                <div className="flex space-x-2">
                  <button className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                </div>
                
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
                >
                  Volver al catálogo
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Vista de catálogo
        <div className="container mx-auto px-4 py-8">
          {/* Hero section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              {activeTab === 'live' ? 'TV en Vivo' : 'Películas'}
            </h1>
            <p className="text-gray-400">
              {activeTab === 'live' 
                ? 'Disfruta de tus canales favoritos en cualquier momento' 
                : 'Explora nuestra colección de películas'}
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-800 mb-6">
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'live' ? 'text-white border-b-2 border-red-600' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('live')}
            >
              TV en Vivo
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'vod' ? 'text-white border-b-2 border-red-600' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('vod')}
            >
              Películas
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'series' ? 'text-white border-b-2 border-red-600' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('series')}
            >
              Series
            </button>
          </div>
          
          {/* Search and filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-white"
                />
              </div>
              
              {activeTab === 'live' && (
                <div className="flex overflow-x-auto pb-2 max-w-full hide-scrollbar">
                                   {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 whitespace-nowrap rounded-md mr-2 ${activeCategory === category ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'live' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredChannels.map(channel => (
                    <div
                      key={channel._id}
                      onClick={() => setSelectedVideo(channel.url)}
                      className="bg-gray-900 rounded overflow-hidden cursor-pointer transition transform hover:scale-105 hover:z-10"
                    >
                      <div className="aspect-video bg-gray-800 flex items-center justify-center">
                        {channel.logo ? (
                          <img 
                            src={channel.logo} 
                            alt={channel.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>';
                            }}
                          />
                        ) : (
                          <span className="text-4xl">📺</span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-white truncate">{channel.name}</h3>
                        <p className="text-xs text-gray-400">{channel.category || 'Canal en vivo'}</p>
                      </div>
                    </div>
                  ))}
                  
                  {filteredM3U.map(file => (
                    <div
                      key={file}
                      onClick={() => setSelectedVideo(`${API_URL}/uploads/${file}`)}
                      className="bg-gray-900 rounded overflow-hidden cursor-pointer transition transform hover:scale-105"
                    >
                      <div className="aspect-video bg-gray-800 flex items-center justify-center">
                        <span className="text-4xl">📁</span>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-white truncate">{file}</h3>
                        <p className="text-xs text-gray-400">Archivo M3U</p>
                      </div>
                    </div>
                  ))}
                  
                  {filteredChannels.length === 0 && filteredM3U.length === 0 && (
                    <div className="col-span-full py-10 text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-400">No se encontraron canales para tu búsqueda</p>
                      <button 
                        onClick={() => { setSearch(''); setActiveCategory('Todos'); }}
                        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'vod' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredVideos.map(video => (
                    <div
                      key={video._id}
                      onClick={() => setSelectedVideo(video.url)}
                      className="bg-gray-900 rounded overflow-hidden cursor-pointer transition transform hover:scale-105 hover:z-10"
                    >
                      <div className="aspect-[2/3] bg-gray-800 flex items-center justify-center">
                        <span className="text-4xl">🎬</span>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-white truncate">{video.title}</h3>
                        <p className="text-xs text-gray-400">Película</p>
                      </div>
                    </div>
                  ))}
                  
                  {filteredVideos.length === 0 && (
                    <div className="col-span-full py-10 text-center">
                      <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-400">No se encontraron películas para tu búsqueda</p>
                      <button 
                        onClick={() => { setSearch(''); }}
                        className="mt-4 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'series' && (
                <div className="flex flex-col items-center justify-center py-20">
                  <svg className="w-20 h-20 text-gray-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h2 className="text-2xl font-bold text-white mb-2">Próximamente</h2>
                  <p className="text-gray-400 text-center max-w-md">
                    La sección de series estará disponible muy pronto. ¡Estamos trabajando en ello!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}