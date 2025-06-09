
// src/pages/MoviesPage.jsx
  import React, { useState, useEffect, useMemo } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '@/context/AuthContext.jsx';
  import { fetchUserMovies, fetchMainMovieSections } from '@/utils/api.js';
  import Card from '@/components/Card.jsx';
import MovieSectionCard from '@/components/MovieSectionCard.jsx';
  import { ChevronLeftIcon } from '@heroicons/react/24/solid';

  const getUniqueValuesFromArray = (items, field) => {
      if (!items || items.length === 0) return ['Todas'];
      const values = items.flatMap(item => {
          const fieldValue = item[field];
          if (Array.isArray(fieldValue)) {
              return fieldValue;
          }
          return fieldValue ? [fieldValue] : [];
      }).filter(Boolean);
      return ['Todas', ...new Set(values.sort((a,b) => a.localeCompare(b)))];
  };

  export default function MoviesPage() {
    const [specialEvents, setSpecialEvents] = useState([]);

    const shouldShowSpecialsSection = () => {
      return specialEvents.length > 0;
    };

    const getSpecialEventName = () => {
      return specialEvents[0]?.specialEventName || "Especial";
    };

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
          const [moviesData, sectionsDataFromAPI] = await Promise.all([
            fetchUserMovies(),
            fetchMainMovieSections()
          ]);
          
          console.log("MoviesPage - Películas Cargadas (allUserMovies):", moviesData); // VERIFICA ESTO
          console.log("MoviesPage - Secciones Cargadas (mainSections API):", sectionsDataFromAPI);
          setAllUserMovies(moviesData || []);

          let filteredSections = sectionsDataFromAPI || [];
          if (!shouldShowSpecialsSection()) {
            filteredSections = filteredSections.filter(section => section.key !== "ESPECIALES");
          }
          setMainSections(filteredSections);

          // Si después de filtrar solo queda "POR_GENERO" o no hay secciones pero sí películas,
          // podríamos auto-seleccionar "POR_GENERO".
          if (filteredSections?.length === 1 && filteredSections[0].key === "POR_GENERO") {
              setSelectedMainSectionKey("POR_GENERO");
          } else if (filteredSections?.length === 0 && (moviesData && moviesData.length > 0)) {
              // Si no hay secciones definidas pero sí películas, podrías tener una sección "POR_GENERO" por defecto.
              // Opcional: añadir una sección "POR_GENERO" si no existe y hay películas.
              // const hasPorGenero = sectionsDataFromAPI?.some(s => s.key === "POR_GENERO");
              // if (!hasPorGenero) {
              //    setMainSections([{ key: "POR_GENERO", displayName: "POR GÉNEROS", order: -1 }, ...filteredSections]);
              // }
              // setSelectedMainSectionKey("POR_GENERO");
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

    useEffect(() => {
      if (!selectedMainSectionKey || !allUserMovies.length) {
        setGenresForSelectedSection(['Todas']);
        setSelectedGenre('Todas');
        return;
      }
      let moviesForGenreExtraction = [];
      if (selectedMainSectionKey === "POR_GENERO") {
        // Para "POR_GENERO", extrae géneros de películas que tengan mainSection="POR_GENERO" o no tengan mainSection
        moviesForGenreExtraction = allUserMovies.filter(m => m.mainSection === "POR_GENERO" || !m.mainSection);
      } else {
        moviesForGenreExtraction = allUserMovies.filter(m => m.mainSection === selectedMainSectionKey);
      }
      setGenresForSelectedSection(getUniqueValuesFromArray(moviesForGenreExtraction, 'genres'));
      setSelectedGenre('Todas');
      setSearchTerm('');
    }, [selectedMainSectionKey, allUserMovies]);

    const displayedMovies = useMemo(() => {
      // Si no hay sección principal seleccionada Y hay secciones para mostrar (y no es solo POR_GENERO implícito),
      // no mostramos películas aún (estamos en la vista de selección de secciones).
      if (!selectedMainSectionKey && mainSections.length > 0 ) {
          // Si la única sección es POR_GENERO y está implícita (no seleccionada por el usuario aún),
          // podríamos querer mostrar las películas de POR_GENERO.
          // Pero si hay varias secciones, esperamos que el usuario elija una.
          if (mainSections.length === 1 && mainSections[0].key === "POR_GENERO" && !selectedMainSectionKey) {
              // No hacer nada aquí, dejar que el filtro de abajo se aplique si selectedMainSectionKey se auto-establece
          } else if (mainSections.some(s => s.key !== "POR_GENERO")) { // Si hay otras secciones además de un posible "POR_GENERO"
              return [];
          }
      }
      
      let filtered = allUserMovies;

      // Aplicar filtro de sección principal SIEMPRE que haya una seleccionada
      if (selectedMainSectionKey) {
        if (selectedMainSectionKey === "POR_GENERO") {
          // Para "POR_GENERO", mostrar las que tienen mainSection="POR_GENERO" o no tienen mainSection (consideradas generales)
          filtered = filtered.filter(m => m.mainSection === "POR_GENERO" || !m.mainSection);
        } else {
          // Para cualquier otra sección específica, solo mostrar películas de esa sección.
          filtered = filtered.filter(m => m.mainSection === selectedMainSectionKey);
        }
      } else if (mainSections.length === 0 && allUserMovies.length > 0) {
          // Si no hay secciones definidas en absoluto, pero hay películas, mostrarlas todas (se filtrarán por género y búsqueda)
          // Esto es como un fallback a "POR_GENERO" si no hay `mainSections`.
          // No se aplica filtro de `mainSection` aquí.
      } else if (mainSections.length > 0) {
          // Si hay secciones pero ninguna seleccionada, no mostrar nada (ya cubierto arriba)
          return [];
      }
      
      if (selectedGenre !== 'Todas') {
        filtered = filtered.filter(m => 
          (Array.isArray(m.genres) && m.genres.map(g => g.toLowerCase()).includes(selectedGenre.toLowerCase())) || 
          (typeof m.genres === 'string' && m.genres.toLowerCase() === selectedGenre.toLowerCase())
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
      console.log("MoviesPage: movieId para navegación:", movieId);
      if (!movieId) { 
          console.error("MoviesPage: Clic en película sin ID válido.", movie);
          return; 
      }
      navigate(`/watch/movie/${movieId}`);
    };
    
    const handleSelectMainSection = (sectionKey) => {
      setSelectedMainSectionKey(sectionKey);
      setSelectedGenre('Todas'); 
    };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mainSections.map(section => {
              if (section.key === "ESPECIALES" && !shouldShowSpecialsSection()) {
                return null;
              }
              if (section.key === "ESPECIALES" && shouldShowSpecialsSection()) {
                // Cambiar el nombre de la sección especial dinámicamente
                const specialSection = { ...section, displayName: getSpecialEventName() };
                return (
                  <MovieSectionCard 
                    key={specialSection.key} 
                    section={specialSection} 
                    onClick={handleSelectMainSection}
                    userPlan={user.plan || 'gplay'}
                    moviesInSection={allUserMovies.filter(m => m.mainSection === specialSection.key).slice(0, 15)}
                  />
                );
              }
              return (
              <MovieSectionCard 
                key={section.key} 
                section={section} 
                onClick={handleSelectMainSection}
                userPlan={user.plan || 'gplay'}
                moviesInSection={allUserMovies.filter(m => m.mainSection === section.key || (section.key === "POR_GENERO" && (!m.mainSection || m.mainSection === "POR_GENERO"))).slice(0, 15)}
              />
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10 text-lg">No hay secciones de películas disponibles en este momento. O todas las películas se muestran bajo "POR GÉNEROS" si es la única opción.</p>
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
              onClick={() => { setSelectedMainSectionKey(null); setSearchTerm(''); }} 
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
        
        {genresForSelectedSection.length > 1 && (
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

        {displayedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedMovies.map(movie => (
              <Card
                key={movie.id || movie._id}
                item={movie}
                onClick={() => handleMovieClick(movie)}
                itemType="movie"
                onPlayTrailer={(trailerUrl) => { 
                    // Aquí deberías tener la lógica para abrir tu TrailerModal
                    // setCurrentTrailerUrl(trailerUrl); // Necesitarías este estado y setShowTrailerModal(true);
                    // Por ahora, lo dejo como placeholder
                    console.log("Intentando reproducir tráiler:", trailerUrl);
                }}
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
