// src/pages/IPTVApp.jsx
import React, { useEffect, useState } from 'react';
import VideoPlayer from '../components/VideoPlayer.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// Proxya URLs HLS o video para evitar CORS
function withProxy(url) {
  if (!url) return url;
  const encoded = encodeURIComponent(url);
  // Proxy solo para .m3u8 y videos (mp4, mkv)
  return url.match(/\.(m3u8|mp4|mkv)(\?|$)/i)
    ? `/proxy?url=${encoded}`
    : url;
}

export default function IPTVApp({ defaultTab = 'live' }) {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = user || {};
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    if (activeTab === 'live') loadChannels();
    else loadVideos();
  }, [activeTab]);

  async function loadChannels() {
    try {
      const res = await fetch(`${API_URL}/api/channels/list`, { headers: authHeader });
      if (!res.ok) throw new Error('Error cargando canales');
      const data = await res.json();
      setChannels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadVideos() {
    try {
      const res = await fetch(`${API_URL}/api/videos`, { headers: authHeader });
      if (!res.ok) throw new Error('Error cargando videos');
      const data = await res.json();
      setVideoFiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredVideos = videoFiles.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return <p className="p-4 text-center">Debes iniciar sesión para acceder.</p>;

  return (
    <div className="min-h-screen bg-black text-white">
      {selectedVideo ? (
        <div className="p-4">
          <button onClick={() => setSelectedVideo(null)} className="mb-4 text-gray-400 hover:text-white">
            ← Volver
          </button>
          <VideoPlayer url={withProxy(selectedVideo)} />
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
          ) : activeTab === 'live' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredChannels.map(c => (
                <div key={c.id} onClick={() => setSelectedVideo(c.url)} className="cursor-pointer rounded overflow-hidden">
                  <img src={c.thumbnail} alt={c.name} className="w-full h-32 object-cover" />
                  <p className="mt-2 truncate">{c.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredVideos.map(v => (
                <div key={v._id} onClick={() => setSelectedVideo(v.url)} className="cursor-pointer rounded overflow-hidden">
                  <div className="aspect-video bg-gray-800 flex items-center justify-center rounded">
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="mt-2 truncate">{v.title}</p>
                </div>
              ))}
            </div>
          )}
          {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
