// src/pages/MoviesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserMovies } from '../utils/api.js';
import Carousel from '../components/Carousel.jsx'; // Reutilizamos el Carousel

export default function MoviesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Aquí podrías tener estados para categorías y filtros específicos de películas
  // const [movieCategories, setMovieCategories] = useState(['Todas']);
  // const [activeMovieCategory, setActiveMovieCategory] = useState('Todas');

  useEffect(() => {
    const loadData = async () => {
      if (!user?.token) {
        setError("Por favor, inicia sesión para ver las películas.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const userMovies = await fetchUserMovies(); // Carga TODAS las películas del usuario
        setMovies(userMovies || []);
        // Aquí podrías extraer categorías de películas si los datos las incluyen:
        // const uniqueCats = ['Todas', ...new Set(userMovies.map(m => m.category).filter(Boolean).sort())];
        // setMovieCategories(uniqueCats);
      } catch (err) {
        console.error("Error cargando películas en MoviesPage:", err.message);
        setError(err.message || "No se pudieron cargar las películas.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.token]);
  
  const handleMovieClick = (movie) => {
    // Asumiendo que movie tiene .id o ._id
    navigate(`/watch/movie/${movie.id || movie._id}`);
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[calc(100vh-100px)]"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div></div>;
  if (error) return <p className="text-center text-red-500 mt-10 p-4 text-xl">{error}</p>;
  if (!user) return <p className="text-center text-xl text-gray-400 mt-20">Debes <a href="/login" className="text-red-500 hover:underline">iniciar sesión</a> para ver este contenido.</p>;


  // Ejemplo: Si quieres mostrar todas las películas en un solo carrusel por ahora
  // o podrías agruparlas por categorías si tienes esa data
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Películas</h1>
      {/* Aquí iría tu lógica de filtros por categoría de películas */}
      {/* <div className="mb-6 flex flex-wrap gap-2"> ... botones de categoría ... </div> */}

      {movies.length > 0 ? (
        // Puedes tener múltiples carruseles aquí, uno por cada categoría que definas
        // O un grid si prefieres. Por ahora, un solo carrusel con todas las películas:
        <Carousel
          title="Todas las Películas"
          items={movies}
          onItemClick={handleMovieClick}
          itemType="movie" // MUY IMPORTANTE: Pasar el tipo correcto
        />
        // Ejemplo de cómo podrías hacerlo por categorías si 'movies' ya está agrupado o lo filtras:
        // movieCategories.map(category => {
        //   const moviesInCategory = movies.filter(m => activeMovieCategory === 'Todas' || m.category === activeMovieCategory);
        //   if (moviesInCategory.length === 0) return null;
        //   return <Carousel key={category} title={category} items={moviesInCategory} onItemClick={handleMovieClick} itemType="movie" />
        // })
      ) : (
        <p className="text-center text-gray-500 mt-10 text-lg">
          No hay películas disponibles en este momento.
        </p>
      )}
    </div>
  );
}