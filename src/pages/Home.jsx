// src/pages/Home.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/Carousel.jsx';
import {
  fetchFeaturedChannels,
  fetchFeaturedMovies,
  fetchFeaturedSeries,
  fetchUserMovies as fetchAllMovies,
  fetchUserSeries as fetchAllSeries
} from '../utils/api.js';
import TrailerModal from '../components/TrailerModal.jsx';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredChannels, setFeaturedChannels] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredSeries, setFeaturedSeries] = useState([]);
  const [continueWatchingItems, setContinueWatchingItems] = useState([]);
  const [allContentMap, setAllContentMap] = useState(new Map());
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
          fetchAllMovies(),
          fetchAllSeries(),
        ]);

        if (channelsResult.status === 'fulfilled' && Array.isArray(channelsResult.value)) {
          setFeaturedChannels(channelsResult.value.slice(0, 15));
        } else {
          console.error('[Home.jsx] Error cargando canales destacados:', channelsResult.reason);
          setFeaturedChannels([]);
        }

        if (moviesResult.status === 'fulfilled' && Array.isArray(moviesResult.value)) {
          setFeaturedMovies(moviesResult.value.slice(0, 15));
        } else {
          console.error('[Home.jsx] Error cargando películas destacadas:', moviesResult.reason);
          setFeaturedMovies([]);
        }
        
        if (seriesResult.status === 'fulfilled' && Array.isArray(seriesResult.value)) {
          setFeaturedSeries(seriesResult.value.slice(0, 15));
        } else {
          console.error('[Home.jsx] Error cargando series destacadas:', seriesResult.reason);
          setFeaturedSeries([]);
        }

        const contentMap = new Map();
        if (allMoviesData.status === 'fulfilled' && Array.isArray(allMoviesData.value)) {
          allMoviesData.value.forEach(item => contentMap.set(item._id || item.id, {...item, itemType: 'movie'}));
        }
        if (allSeriesData.status === 'fulfilled' && Array.isArray(allSeriesData.value)) {
          allSeriesData.value.forEach(item => contentMap.set(item._id || item.id, {...item, itemType: 'serie'}));
        }
        console.log('[Home.jsx] allContentMap creado:', contentMap);
        setAllContentMap(contentMap);

      } catch (err) {
        console.error('[Home.jsx] Error general en loadAllData:', err);
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
    if (loading || allContentMap.size === 0) {
      // console.log('[Home.jsx] Saltando useEffect de Continuar Viendo: loading o allContentMap vacío.');
      return;
    }
    console.log('[Home.jsx] Procesando "Continuar Viendo"...');
    try {
      const progressDataString = localStorage.getItem('videoProgress');
      // console.log('[Home.jsx] videoProgress desde localStorage (string):', progressDataString);
      const progressData = JSON.parse(progressDataString || '{}');
      // console.log('[Home.jsx] videoProgress parseado:', progressData);

      const itemsWithProgress = Object.entries(progressData)
        .map(([itemId, data]) => {
          // console.log(`[Home.jsx] Buscando en allContentMap por itemId: ${itemId}`);
          const fullItemDetails = allContentMap.get(itemId);
          // console.log(`[Home.jsx] fullItemDetails para ${itemId}:`, fullItemDetails ? JSON.parse(JSON.stringify(fullItemDetails)) : 'No encontrado');
          // console.log(`[Home.jsx] Datos de progreso para ${itemId}:`, data);

          if (fullItemDetails && data.duration > 0 && data.time < data.duration - 15) {
            const hydratedItem = {
              ...fullItemDetails,
              id: itemId,
              _id: itemId,
              progressTime: data.time,
              duration: data.duration,
              lastWatched: data.lastWatched,
              progressPercent: (data.time / data.duration) * 100,
            };
            // console.log(`[Home.jsx] Item hidratado para Continuar Viendo (${itemId}):`, JSON.parse(JSON.stringify(hydratedItem)));
            return hydratedItem;
          }
          // console.log(`[Home.jsx] Item ${itemId} filtrado o no encontrado para Continuar Viendo.`);
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => b.lastWatched - a.lastWatched)
        .slice(0, 10);
      
      console.log('[Home.jsx] Items finales para "Continuar Viendo":', JSON.parse(JSON.stringify(itemsWithProgress)));
      setContinueWatchingItems(itemsWithProgress);
    } catch (e) {
      console.error("[Home.jsx] Error procesando 'Continuar Viendo':", e);
      setContinueWatchingItems([]);
    }
  }, [loading, allContentMap]);

  const handleItemClick = (item, itemTypeFromCarousel) => {
    // LOG PROFUNDO DEL ITEM AL HACER CLIC
    console.log("[Home.jsx] handleItemClick - Item recibido:", JSON.parse(JSON.stringify(item)));
    console.log("[Home.jsx] handleItemClick - itemTypeFromCarousel:", itemTypeFromCarousel);

    const type = item.itemType || itemTypeFromCarousel; // Priorizar itemType del objeto item
    const id = item.id || item._id;

    console.log(`[Home.jsx] handleItemClick - Tipo determinado: ${type}, ID determinado: ${id}`);

    if (!type || !id) {
      console.error("[Home.jsx] handleItemClick: Tipo o ID del item no definido. No se puede navegar.", item);
      alert("Error: No se pudo determinar el contenido a reproducir."); // Feedback al usuario
      return;
    }
    
    const navigationState = {};
    if (typeof item.progressTime === 'number' && item.progressTime >= 0) { // Validar progressTime
      console.log("[Home.jsx] handleItemClick: Tiene progressTime, añadiendo startTime a la navegación:", item.progressTime);
      navigationState.startTime = item.progressTime;
    } else {
      console.log("[Home.jsx] handleItemClick: No tiene progressTime válido o es undefined.");
    }
    
    console.log(`[Home.jsx] Navegando a: /watch/${type}/${id} con estado:`, navigationState);
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-8 space-y-8 md:space-y-12">
          {continueWatchingItems.length > 0 && (
            <Carousel
              title="Continuar Viendo"
              items={continueWatchingItems}
              onItemClick={(item) => handleItemClick(item, item.itemType || 'movie')} // Asegurar un itemType si item.itemType es undefined
              itemType="movie" 
            />
          )}
          {/* Resto de los carruseles (Destacados, etc.) */}
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
