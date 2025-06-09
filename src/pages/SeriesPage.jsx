import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserSeries } from '../utils/api.js';

const SUBCATEGORIAS = [
  "Netflix",
  "Prime Video",
  "Disney",
  "Apple TV",
  "Hulu y Otros",
  "Retro",
  "Animadas"
];

export default function SeriesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState("Netflix");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredSeries = series.filter(serie => {
    const matchesSubcategoria = serie.subcategoria === selectedSubcategoria;
    const matchesSearch = searchTerm === "" || 
      serie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serie.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubcategoria && matchesSearch;
  });

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-128px)]">
      <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="text-center text-red-400 p-6 text-lg bg-gray-800 rounded-md mx-auto max-w-md">
      {error}
    </div>
  );
  
  if (!user) return (
    <p className="text-center text-xl text-gray-400 mt-20">
      Debes <a href="/login" className="text-red-500 hover:underline">iniciar sesión</a> para ver este contenido.
    </p>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar con subcategorías */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-zinc-800 rounded-lg p-4 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-white">Categorías</h2>
            <div className="space-y-2">
              {SUBCATEGORIAS.map(subcategoria => (
                <button
                  key={subcategoria}
                  onClick={() => setSelectedSubcategoria(subcategoria)}
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    selectedSubcategoria === subcategoria
                      ? 'bg-red-600 text-white'
                      : 'text-gray-300 hover:bg-zinc-700'
                  }`}
                >
                  {subcategoria}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-white">Series: {selectedSubcategoria}</h1>
            <input
              type="text"
              placeholder="Buscar series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {filteredSeries.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredSeries.map(serie => (
                <div
                  key={serie.id || serie._id}
                  onClick={() => handleSerieClick(serie)}
                  className="cursor-pointer group"
                >
                  <div className="aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 relative">
                    <img 
                      src={serie.thumbnail || '/placeholder-thumbnail.png'} 
                      alt={serie.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => e.currentTarget.src = '/placeholder-thumbnail.png'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 p-4">
                        <h3 className="text-white text-sm font-semibold line-clamp-2">{serie.name}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 mt-8">
              No hay series disponibles en la categoría {selectedSubcategoria}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
