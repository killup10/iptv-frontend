import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/utils/axiosInstance';
import Card from '@/components/Card';

export function Animes() {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const response = await axiosInstance.get('/api/videos', {
          params: {
            tipo: 'serie',
            subtipo: 'anime',
            limit: 100 // Increased limit to show more animes
          }
        });
        console.log("Respuesta completa del backend:", response);
        console.log("Datos de la respuesta:", response.data);
        
        // Asegurarse de que response.data.videos existe y es un array
        const videos = response.data?.videos;
        if (Array.isArray(videos)) {
          console.log("Videos encontrados:", videos.length);
          // Asegurarse de que cada video tiene la estructura correcta
          const validVideos = videos.map(video => ({
            ...video,
            title: video.title || video.name || 'Sin título',
            thumbnail: video.thumbnail || video.logo || video.customThumbnail || video.tmdbThumbnail || '',
            _id: video._id || video.id
          }));
          setAnimes(validVideos);
        } else {
          setAnimes([]);
          console.error("Error: response.data.videos no es un array");
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching animes:', err);
        setError('Error al cargar los animes');
        setLoading(false);
      }
    };

    fetchAnimes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-10 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Animes</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.isArray(animes) && animes.length > 0 ? (
          animes.map((anime) => {
            const cardItem = {
              _id: anime._id,
              id: anime._id,
              title: anime.title,
              name: anime.title,
              thumbnail: anime.thumbnail || anime.logo || anime.customThumbnail || anime.tmdbThumbnail || '/img/placeholder-thumbnail.png',
              type: 'serie',
              description: anime.description || '',
              genres: anime.genres || [],
              trailerUrl: anime.trailerUrl || '',
              releaseYear: anime.releaseYear,
              isFeatured: anime.isFeatured
            };
            
            return (
              <Link key={cardItem._id} to={`/watch/serie/${cardItem._id}`}>
                <Card
                  item={cardItem}
                  itemType="serie"
                />
              </Link>
            );
          })
        ) : (
          <p className="text-gray-400 text-center col-span-full">
            No hay animes disponibles en este momento.
          </p>
        )}
      </div>
    </div>
  );
}

export default Animes;
