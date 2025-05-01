import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Tabs, Tab } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function IPTVApp() {
  const [m3uFiles, setM3uFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState('');
  const [activeTab, setActiveTab] = useState('live');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/api/m3u/list`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setM3uFiles(data.files || []));

    fetch(`${API_URL}/api/videos`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setVideoFiles(data));
  }, [API_URL]);

  const filteredM3U = m3uFiles.filter(file => file.toLowerCase().includes(search.toLowerCase()));
  const filteredVideos = videoFiles.filter(v => v.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">IPTV Streaming</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <Tab value="live" label="Canales en Vivo" />
        <Tab value="vod" label="Películas / Series" />
      </Tabs>

      <Input
        placeholder="Buscar..."
        className="mb-4 text-black"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {activeTab === 'live' && filteredM3U.map(file => (
          <button
            key={file}
            className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition"
            onClick={() => setSelectedVideo(`${API_URL}/uploads/${file}`)}
          >
            📺 {file}
          </button>
        ))}

        {activeTab === 'vod' && filteredVideos.map(video => (
          <button
            key={video._id}
            className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition"
            onClick={() => setSelectedVideo(video.url)}
          >
            🎬 {video.title}
          </button>
        ))}
      </div>

      {selectedVideo && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">
            Reproduciendo: {selectedVideo.split('/').pop()}
          </h2>
          <ReactPlayer
            url={selectedVideo}
            controls
            width="100%"
            height="480px"
            playing
            config={{ file: { attributes: { crossOrigin: 'anonymous' } } }}
          />
        </div>
      )}
    </div>
  );
}

/*
In src/main.jsx ensure you import IPTVApp instead of App:
import IPTVApp from './IPTVApp.jsx';
*/
