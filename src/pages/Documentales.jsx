import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '@/utils/axiosInstance';
import Card from '@/components/Card';

export function Documentales() {
  const [documentales, setDocumentales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocumentales = async () => {
      try {
        const response = await axiosInstance.get('/api/videos', {
          params: {
            tipo: 'serie',
            subtipo: 'documental'
          }
        });
        setDocumentales(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching documentales:', err);
        setError('Error al cargar los documentales');
        setLoading(false);
      }
    };

    fetchDocumentales();
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
      <h1 className="text-3xl font-bold text-white mb-8">Documentales</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {documentales.map((documental) => (
          <Link key={documental._id} to={`/watch/serie/${documental._id}`}>
            <Card
              title={documental.title}
              image={documental.customThumbnail || documental.tmdbThumbnail}
              type="serie"
            />
          </Link>
        ))}
      </div>

      {documentales.length === 0 && (
        <p className="text-gray-400 text-center mt-8">
          No hay documentales disponibles en este momento.
        </p>
      )}
    </div>
  );
}

export default Documentales;
