// src/pages/Home.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/Carousel.jsx';
import {
  fetchFeaturedChannels,
  fetchFeaturedMovies,
  fetchFeaturedSeries,
  // CORRECCIÓN AQUÍ:
  // Para renombrar, se usa 'nombreOriginal as nuevoNombre'
  fetchUserMovies as fetchAllMovies,    // Renombrar fetchUserMovies a fetchAllMovies
  fetchUserSeries as fetchAllSeries     // Renombrar fetchUserSeries a fetchAllSeries
} from '../utils/api.js'; // La ruta a tu archivo api.js
import TrailerModal from '../components/TrailerModal.jsx';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredChannels, setFeaturedChannels] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredSeries, setFeaturedSeries] = useState([]);
  const [continueWatchingItems, setContinueWatchingItems] = useState([]);
  const [allContentMap, setAllContentMap] = useState(new Map()); // Para buscar detalles de items
  const [error, setError] = useState(null);

  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState('');

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      setError(null);
      try {
        const [
          channelsResult,
          moviesResult,
          seriesResult,
          allMoviesData,
          allSeriesData,
        ] = await Promise.allSettled([
          fetchFeaturedChannels(),
          fetchFeaturedMovies(),
          fetchFeaturedSeries(),
          fetchAllMovies(), // Usar el alias
          fetchAllSeries(), // Usar el alias
        ]);

        if (channelsResult.status === 'fulfilled') setFeaturedChannels(channelsResult.value?.slice(0, 15) || []);
        else console.error('Error cargando canales destacados:', channelsResult.reason);

        if (moviesResult.status === 'fulfilled') setFeaturedMovies(moviesResult.value?.slice(0, 15) || []);
        else console.error('Error cargando películas destacadas:', moviesResult.reason);
        
        if (seriesResult.status === 'fulfilled') setFeaturedSeries(seriesResult.value?.slice(0, 15) || []);
        else console.error('Error cargando series destacadas:', seriesResult.reason);

        const contentMap = new Map();
        if (allMoviesData.status === 'fulfilled' && Array.isArray(allMoviesData.value)) {
          allMoviesData.value.forEach(item => contentMap.set(item._id || item.id, {...item, itemType: 'movie'}));
        }
        if (allSeriesData.status === 'fulfilled' && Array.isArray(allSeriesData.value)) {
          allSeriesData.value.forEach(item => contentMap.set(item._id || item.id, {...item, itemType: 'serie'}));
        }
        setAllContentMap(contentMap);

      } catch (err) {
        console.error('Home.jsx: Error general en loadAllData:', err);
        setError(err.message || "Error al cargar contenido.");
      } finally {
        setLoading(false);
      }
    }
    if (user) {
        loadAllData();
    } else {
        setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (loading || allContentMap.size === 0) return;

    try {
      const progressData = JSON.parse(localStorage.getItem('videoProgress') || '{}');
      const itemsWithProgress = Object.entries(progressData)
        .map(([itemId, data]) => {
          const fullItemDetails = allContentMap.get(itemId);
          if (fullItemDetails && data.duration > 0 && data.time < data.duration - 15) {
            return {
              ...fullItemDetails,
              id: itemId,
              _id: itemId,
              progressTime: data.time,
              duration: data.duration,
              lastWatched: data.lastWatched,
              progressPercent: (data.time / data.duration) * 100,
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => b.lastWatched - a.lastWatched)
        .slice(0, 10);

      setContinueWatchingItems(itemsWithProgress);
    } catch (e) {
      console.error("Error procesando 'Continuar Viendo':", e);
      setContinueWatchingItems([]);
    }
  }, [loading, allContentMap]);

  const handleItemClick = (item, itemTypeFromCarousel) => {
    const type = item.itemType || itemTypeFromCarousel;
    const id = item.id || item._id;

    if (!type || !id) {
      console.error("Home.jsx: Tipo o ID del item no definido.", item);
      return;
    }
    
    const navigationState = {};
    if (item.progressTime) {
      navigationState.startTime = item.progressTime;
    }
    
    navigate(`/watch/${type}/${id}`, { state: navigationState });
  };

  const handlePlayTrailerClick = (trailerUrl) => {
    if (trailerUrl) {
      setCurrentTrailerUrl(trailerUrl);
      setShowTrailerModal(true);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]"><div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  if (error && !user) {
      return <div className="text-center text-red-400 p-10 pt-24">Error al cargar contenido: {error}</div>;
  }
  
  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] text-center px-4 pt-20">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Bienvenido a TeamG Play</h1>
        <p className="text-lg text-gray-300 mb-8">Inicia sesión para descubrir un mundo de entretenimiento.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform hover:scale-105"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="pt-20 md:pt-24 pb-8 space-y-8 md:space-y-12">
          {continueWatchingItems.length > 0 && (
            <Carousel
              title="Continuar Viendo"
              items={continueWatchingItems}
              onItemClick={(item) => handleItemClick(item, item.itemType)}
              itemType="movie" // Default, pero el item tiene su propio itemType
            />
          )}
          {featuredChannels.length > 0 && (
            <Carousel
              title="Canales en Vivo Destacados"
              items={featuredChannels}
              onItemClick={(item) => handleItemClick(item, 'channel')}
              itemType="channel"
            />
          )}
          {featuredMovies.length > 0 && (
            <Carousel
              title="Películas Destacadas"
              items={featuredMovies}
              onItemClick={(item) => handleItemClick(item, 'movie')}
              onPlayTrailerClick={handlePlayTrailerClick}
              itemType="movie"
            />
          )}
          {featuredSeries.length > 0 && (
            <Carousel
              title="Series Populares"
              items={featuredSeries}
              onItemClick={(item) => handleItemClick(item, 'serie')}
              onPlayTrailerClick={handlePlayTrailerClick}
              itemType="serie"
            />
          )}
          
          {user && !loading && !error &&
           featuredChannels.length === 0 &&
           featuredMovies.length === 0 &&
           featuredSeries.length === 0 &&
           continueWatchingItems.length === 0 && (
            <p className="text-center text-gray-500 py-10 text-lg px-4">
              No hay contenido destacado disponible en este momento. ¡Vuelve pronto!
            </p>
          )}
        </div>
      </div>

      {showTrailerModal && currentTrailerUrl && (
        <TrailerModal
          trailerUrl={currentTrailerUrl}
          onClose={() => {
            setShowTrailerModal(false);
            setCurrentTrailerUrl('');
          }}
        />
      )}
    </>
  );
}
export default Home;
