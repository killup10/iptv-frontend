import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserMovies } from '../utils/api.js'; // Asume que esta función existe y es para usuarios logueados
import Carousel from '../components/Carousel.jsx'; // O tu componente de grid/lista

export default function MoviesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Podrías añadir estados para categorías de películas y filtros

  useEffect(() => {
    const loadData = async () => {
      if (!user?.token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const userMovies = await fetchUserMovies();
        setMovies(userMovies || []);
        // Aquí podrías extraer categorías de películas si tu data las tiene
      } catch (err) {
        console.error("Error cargando películas en MoviesPage:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.token]);
  
  const handleMovieClick = (movie) => {
    navigate(`/watch/movie/${movie.id || movie._id}`);
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div></div>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!user) return <p className="text-center mt-10">Por favor, inicia sesión para ver las películas.</p>;

  // Aquí implementarías la UI para mostrar películas, quizás con carousels por categoría
  // Por ahora, un simple listado o grid:
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Películas</h1>
      {/* Aquí iría tu lógica de filtros por categoría de películas */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map(movie => (
            <div key={movie.id || movie._id} onClick={() => handleMovieClick(movie)} className="cursor-pointer group">
              <div className="aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
                 <img 
                    src={movie.thumbnail || '/placeholder-thumbnail.png'} 
                    alt={movie.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => e.currentTarget.src = '/placeholder-thumbnail.png'}
                 />
              </div>
              <p className="mt-2 text-sm text-gray-200 truncate group-hover:text-white">{movie.name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay películas disponibles.</p>
      )}
    </div>
  );
}