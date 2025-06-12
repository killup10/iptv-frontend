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
            subtipo: 'anime'
          }
        });
        setAnimes(response.data);
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
        {animes.map((anime) => (
          <Link key={anime._id} to={`/watch/serie/${anime._id}`}>
            <Card
              title={anime.title}
              image={anime.customThumbnail || anime.tmdbThumbnail}
              type="serie"
            />
          </Link>
        ))}
      </div>

      {animes.length === 0 && (
        <p className="text-gray-400 text-center mt-8">
          No hay animes disponibles en este momento.
        </p>
      )}
    </div>
  );
}

export default Animes;
