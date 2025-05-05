// src/IPTVApp.jsx
import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Tabs } from './components/ui/tabs.jsx';
import { Tab } from './components/ui/tab.jsx';
import { Input } from './components/ui/input.jsx';

export default function IPTVApp() {
  const [m3uFiles, setM3uFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const authHeader = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  // Cargar datos cuando cambia la pestaña activa
  useEffect(() => {
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
      })
      .catch(err => {
        console.error('Error al cargar M3U:', err);
        setError(err.message);
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
      })
      .catch(err => {
        console.error('Error al cargar canales:', err);
        setError(err.message);
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
      })
      .catch(err => {
        console.error('Error al cargar videos:', err);
        setError(err.message);
      });
  };

  // Log para depuración
  useEffect(() => {
    console.log("Estado actual:");
    console.log("- M3U Files:", m3uFiles.length);
    console.log("- Channels:", channels.length);
    console.log("- Videos:", videoFiles.length);
    console.log("- Tab activa:", activeTab);
  }, [m3uFiles, channels, videoFiles, activeTab]);

  const filteredM3U = m3uFiles.filter(file => 
    file.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredVideos = videoFiles.filter(video => 
    video.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">TeamG Play</h1>
      <p className="text-center text-gray-300 mb-6">
        Explora nuestro catálogo de canales en vivo, películas y series en alta calidad.
      </p>

      {error && (
        <div className="p-3 mb-4 bg-red-800 border border-red-600 text-white rounded-lg">
          Error: {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <Tab value="live" label="TV en Vivo" />
        <Tab value="vod" label="Películas" />
        <Tab value="series" label="Series" />
      </Tabs>

      <Input
        placeholder="Buscar..."
        className="mb-4 bg-gray-800 text-white border-gray-700"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {activeTab === 'live' && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Canales en Vivo ({filteredChannels.length + filteredM3U.length})
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredChannels.map(channel => (
              <button
                key={`channel-${channel._id}`}
                className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition flex flex-col items-center"
                onClick={() => setSelectedVideo(channel.url)}
              >
                <span className="text-3xl mb-2">📺</span>
                <span className="text-center">{channel.name}</span>
              </button>
            ))}

            {filteredM3U.map(file => (
              <button
                key={`file-${file}`}
                className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition flex flex-col items-center"
                onClick={() => setSelectedVideo(`${API_URL}/uploads/${file}`)}
              >
                <span className="text-3xl mb-2">📁</span>
                <span className="text-center">{file}</span>
              </button>
            ))}

            {filteredChannels.length === 0 && filteredM3U.length === 0 && (
              <p className="text-gray-400 col-span-full text-center">No hay canales disponibles</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'vod' && (
        <>
          <h2 className="text-xl font-semibold mb-4">
            Películas ({filteredVideos.length})
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredVideos.map(video => (
              <button
                key={video._id}
                className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition flex flex-col items-center"
                onClick={() => setSelectedVideo(video.url)}
              >
                <span className="text-3xl mb-2">🎬</span>
                <span className="text-center">{video.title}</span>
              </button>
            ))}
            
            {filteredVideos.length === 0 && (
              <p className="text-gray-400 col-span-full text-center">No hay películas disponibles</p>
            )}
          </div>
        </>
      )}

      {selectedVideo && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">
            Reproduciendo: {
              activeTab === 'live' 
                ? channels.find(c => c.url === selectedVideo)?.name || selectedVideo.split('/').pop()
                : videoFiles.find(v => v.url === selectedVideo)?.title || 'Video'
            }
          </h2>
          <ReactPlayer
            url={selectedVideo}
            controls
            width="100%"
            height="480px"
            playing
            config={{
              file: {
                attributes: { crossOrigin: 'anonymous' },
                forceHLS: true,  // Forzar HLS para reproducir streams m3u8
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
      )}

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Versión 1.0.0 - TeamG Play</p>
      </div>
    </div>
  );
}