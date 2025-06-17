// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/Carousel.jsx';
import {
  fetchFeaturedChannels,
  fetchFeaturedMovies,
  fetchFeaturedSeries,
  fetchContinueWatching, // 1. CORRECCIÓN: Importar la función correcta
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
  const [error, setError] = useState(null);

  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState('');

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setError(null);
      try {
        // Obtenemos todo el contenido destacado y la lista de "Continuar Viendo" en paralelo
        const results = await Promise.allSettled([
          fetchContinueWatching(),
          fetchFeaturedChannels(),
          fetchFeaturedMovies(),
          fetchFeaturedSeries(),
        ]);

        const [
          continueWatchingResult,
          channelsResult,
          moviesResult,
          seriesResult,
        ] = results;

        // 2. OPTIMIZACIÓN: Procesar directamente la respuesta del backend
        if (continueWatchingResult.status === 'fulfilled' && Array.isArray(continueWatchingResult.value)) {
          console.log('[Home.jsx] Items de "Continuar Viendo" cargados:', continueWatchingResult.value);
          // El backend ya devuelve el formato correcto con el progreso incluido
          setContinueWatchingItems(continueWatchingResult.value);
        } else {
          console.error('[Home.jsx] Error cargando "Continuar Viendo":', continueWatchingResult.reason);
          setContinueWatchingItems([]);
        }
        
        if (channelsResult.status === 'fulfilled' && Array.isArray(channelsResult.value)) {
          setFeaturedChannels(channelsResult.value.slice(0, 15));
        } else {
          console.error('[Home.jsx] Error cargando canales destacados:', channelsResult.reason);
          setFeaturedChannels([]);
        }

        if (moviesResult.status === 'fulfilled' && Array.isArray(moviesResult.value)) {
            console.log('🎥 Películas destacadas recibidas:', moviesResult.value); // 👈 AGREGA ESTO
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

      } catch (err) {
        console.error('[Home.jsx] Error general en loadInitialData:', err);
        setError(err.message || "Error al cargar contenido.");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadInitialData();
    } else {
      setLoading(false); 
    }
  }, [user]);

  const handleItemClick = (item, itemTypeFromCarousel) => {
    console.log("[Home.jsx] handleItemClick - Item recibido:", JSON.parse(JSON.stringify(item)));
    
    // Prioriza el tipo del objeto, si no, usa el del carrusel
    const type = item.itemType || item.tipo || itemTypeFromCarousel;
    const id = item.id || item._id;

    if (!type || !id) {
      console.error("[Home.jsx] handleItemClick: Tipo o ID del item no definido.", item);
      alert("Error: No se pudo determinar el contenido a reproducir.");
      return;
    }

    // El backend para "Continuar Viendo" devuelve un objeto `watchProgress`
    const progress = item.watchProgress || {};
    const startTime = progress.lastTime || 0;
    
    const navigationState = {};
    if (startTime > 5) { // Solo si el tiempo es significativo
      console.log("[Home.jsx] handleItemClick: Añadiendo startTime a la navegación:", startTime);
      navigationState.startTime = startTime;
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
  
  if (error) {
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
              onItemClick={(item) => handleItemClick(item, item.itemType)}
              itemType="movie" // Fallback, pero item.itemType debería existir
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