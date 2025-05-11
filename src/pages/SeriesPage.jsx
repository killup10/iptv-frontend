import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserSeries } from '../utils/api.js';
// import Carousel from '../components/Carousel.jsx';

export default function SeriesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const userSeries = await fetchUserSeries();
        setSeries(userSeries || []);
      } catch (err) {
        console.error("Error cargando series en SeriesPage:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.token]);

  const handleSerieClick = (serie) => {
    navigate(`/watch/serie/${serie.id || serie._id}`);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div></div>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!user) return <p className="text-center mt-10">Por favor, inicia sesión para ver las series.</p>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Series</h1>
      {series.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {series.map(serie => (
            <div key={serie.id || serie._id} onClick={() => handleSerieClick(serie)} className="cursor-pointer group">
              <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
                 <img 
                    src={serie.thumbnail || '/placeholder-thumbnail.png'} 
                    alt={serie.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => e.currentTarget.src = '/placeholder-thumbnail.png'}
                 />
              </div>
              <p className="mt-2 text-sm text-gray-200 truncate group-hover:text-white">{serie.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay series disponibles.</p>
      )}
    </div>
  );
}