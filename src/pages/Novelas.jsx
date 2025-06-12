import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/utils/axiosInstance';
import Card from '@/components/Card';

export function Novelas() {
  const [novelas, setNovelas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNovelas = async () => {
      try {
        const response = await axiosInstance.get('/api/videos', {
          params: {
            tipo: 'serie',
            subtipo: 'novela'
          }
        });
        setNovelas(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching novelas:', err);
        setError('Error al cargar las novelas');
        setLoading(false);
      }
    };

    fetchNovelas();
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
      <h1 className="text-3xl font-bold text-white mb-8">Novelas</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {novelas.map((novela) => (
          <Link key={novela._id} to={`/watch/serie/${novela._id}`}>
            <Card
              title={novela.title}
              image={novela.customThumbnail || novela.tmdbThumbnail}
              type="serie"
            />
          </Link>
        ))}
      </div>

      {novelas.length === 0 && (
        <p className="text-gray-400 text-center mt-8">
          No hay novelas disponibles en este momento.
        </p>
      )}
    </div>
  );
}

export default Novelas;
