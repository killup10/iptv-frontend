// src/pages/MoviesPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserMovies, fetchMainMovieSections } from '../utils/api.js'; // Asumiendo que creaste fetchMainMovieSections
import Card from '../components/Card.jsx';
import MainSectionCard from '../components/MainSectionCard.jsx';
import { ChevronLeftIcon } from '@heroicons/react/24/solid'; // Para el botón de volver

// Helper para extraer valores únicos de un array de objetos
const getUniqueValuesFromArray = (items, field) => {
    if (!items || items.length === 0) return ['Todas'];
    // Maneja tanto campos que son arrays (como genres) como campos que son strings directos
    const values = items.flatMap(item => {
        const fieldValue = item[field];
        if (Array.isArray(fieldValue)) {
            return fieldValue;
        }
        return fieldValue ? [fieldValue] : [];
    }).filter(Boolean); // Filtra null, undefined, y strings vacíos
    return ['Todas', ...new Set(values.sort((a,b) => a.localeCompare(b)))];
};


export default function MoviesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allUserMovies, setAllUserMovies] = useState([]);
  const [mainSections, setMainSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMainSectionKey, setSelectedMainSectionKey] = useState(null);
  const [genresForSelectedSection, setGenresForSelectedSection] = useState(['Todas']);
  const [selectedGenre, setSelectedGenre] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos iniciales (secciones y todas las películas del usuario)
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.token) {
        setError("Por favor, inicia sesión para acceder al contenido.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const [moviesData, sectionsData] = await Promise.all([
          fetchUserMovies(), // Ya debería filtrar por plan en el backend
          fetchMainMovieSections() // Llama a tu nueva función API
        ]);
        setAllUserMovies(moviesData || []);
        setMainSections(sectionsData || []);

        // Si solo hay una sección y es "POR_GENERO", o si no hay secciones, seleccionar POR_GENERO por defecto si existe
        if (sectionsData?.length === 1 && sectionsData[0].key === "POR_GENERO") {
            setSelectedMainSectionKey("POR_GENERO");
        } else if (!sectionsData || sectionsData.length === 0 && (moviesData && moviesData.length > 0)) {
            // Si no hay secciones definidas pero hay películas, podríamos ir a una vista "Todas" o "Por Género" por defecto
            // Por ahora, dejaremos que se muestre el mensaje de no secciones o que el usuario elija
        }

      } catch (err) {
        console.error("MoviesPage: Error cargando datos iniciales:", err);
        setError(err.message || "No se pudieron cargar los datos de películas.");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [user?.token]);

  // Actualizar géneros cuando cambia la sección principal o las películas cargadas
  useEffect(() => {
    if (!selectedMainSectionKey || !allUserMovies.length) {
      setGenresForSelectedSection(['Todas']);
      setSelectedGenre('Todas');
      return;
    }

    let moviesForGenreExtraction = [];
    if (selectedMainSectionKey === "POR_GENERO") {
      moviesForGenreExtraction = allUserMovies; // Usar todas las películas para extraer géneros
    } else {
      moviesForGenreExtraction = allUserMovies.filter(m => m.mainSection === selectedMainSectionKey);
    }
    
    setGenresForSelectedSection(getUniqueValuesFromArray(moviesForGenreExtraction, 'genres'));
    setSelectedGenre('Todas'); // Resetear filtro de género
    setSearchTerm(''); // Limpiar búsqueda al cambiar de sección/género

  }, [selectedMainSectionKey, allUserMovies]);

  // Películas a mostrar en la cuadrícula
  const displayedMovies = useMemo(() => {
    if (!selectedMainSectionKey && mainSections.length > 0) return []; // No mostrar películas si estamos en la vista de secciones
    
    let filtered = allUserMovies;

    if (selectedMainSectionKey && selectedMainSectionKey !== "POR_GENERO") {
      filtered = filtered.filter(m => m.mainSection === selectedMainSectionKey);
    }

    if (selectedGenre !== 'Todas') {
      filtered = filtered.filter(m => 
        (Array.isArray(m.genres) && m.genres.map(g => g.toLowerCase()).includes(selectedGenre.toLowerCase())) || 
        (typeof m.genres === 'string' && m.genres.toLowerCase() === selectedGenre.toLowerCase()) || // Si genres es un solo string
        (selectedMainSectionKey === "POR_GENERO" && m.genres && ( (Array.isArray(m.genres) && m.genres.includes(selectedGenre) ) || m.genres === selectedGenre ) ) // Caso especial para POR_GENERO
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(m => 
        (m.title && m.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return filtered;
  }, [allUserMovies, selectedMainSectionKey, selectedGenre, searchTerm, mainSections]);

  const handleMovieClick = (movie) => {
    const movieId = movie.id || movie._id;
    if (!movieId) { 
        console.error("MoviesPage: Clic en película sin ID válido.", movie);
        return; 
    }
    navigate(`/watch/movie/${movieId}`);
  };
  
  const handleSelectMainSection = (sectionKey) => {
    console.log("Sección principal seleccionada:", sectionKey);
    setSelectedMainSectionKey(sectionKey);
    setSelectedGenre('Todas'); 
  };

  // --- Renderizado ---
  if (isLoading) return <div className="flex justify-center items-center min-h-[calc(100vh-128px)]"><div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-red-600"></div></div>;
  if (error) return <p className="text-center text-red-400 p-6 text-lg bg-gray-800 rounded-md mx-auto max-w-md">{error}</p>;
  if (!user) return <p className="text-center text-xl text-gray-400 mt-20">Debes <a href="/login" className="text-red-500 hover:underline">iniciar sesión</a> para ver este contenido.</p>;

  // Vista de Secciones Principales
  if (!selectedMainSectionKey) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8 text-center sm:text-left">
          Explorar Películas
        </h1>
        {mainSections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {mainSections.map(section => (
              <MainSectionCard 
                key={section.key} 
                section={section} 
                onClick={handleSelectMainSection}
                userPlan={user.plan || 'basico'}
                moviesInSection={allUserMovies.filter(m => m.mainSection === section.key).slice(0, 15)} // Pasa algunas películas para la miniatura cambiante
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10 text-lg">No hay secciones de películas disponibles en este momento.</p>
        )}
      </div>
    );
  }

  // Vista Dentro de una Sección (o "POR_GENERO")
  const currentMainSection = mainSections.find(s => s.key === selectedMainSectionKey);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => {
                setSelectedMainSectionKey(null); 
                setSearchTerm(''); // Limpiar búsqueda al volver
            }} 
            className="mr-3 text-gray-300 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
            title="Volver a Secciones"
          >
            <ChevronLeftIcon className="w-6 h-6 sm:w-7 sm:w-7" />
          </button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
            {currentMainSection?.displayName || "Películas"}
          </h1>
        </div>
        <input
            type="text"
            placeholder={`Buscar en ${selectedGenre === 'Todas' ? (currentMainSection?.displayName || "la sección") : selectedGenre}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 lg:w-1/4 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
        />
      </div>
      
      {/* Filtros de Género/Subcategoría */}
      {genresForSelectedSection.length > 1 && ( // Solo mostrar si hay más que "Todas"
        <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-gray-700">
          {genresForSelectedSection.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150
                          ${selectedGenre === genre 
                              ? 'bg-red-600 text-white shadow-lg' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {/* Cuadrícula de Películas */}
      {displayedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10">
          {displayedMovies.map(movie => (
            <Card
              key={movie.id || movie._id}
              item={movie}
              onClick={() => handleMovieClick(movie)}
              itemType="movie" // Siempre es 'movie' en esta página
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-12 text-lg">
          {isLoading ? 'Cargando películas...' : `No se encontraron películas para "${selectedGenre}" en ${currentMainSection?.displayName || 'la sección actual'}.`}
        </p>
      )}
    </div>
  );
}