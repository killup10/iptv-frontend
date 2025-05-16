// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/Carousel.jsx';
import { 
  fetchFeaturedChannels, 
  fetchFeaturedMovies,
  fetchFeaturedSeries 
} from '../utils/api.js';
import TrailerModal from '../components/TrailerModal.jsx'; // Importar el modal

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredChannels, setFeaturedChannels] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredSeries, setFeaturedSeries] = useState([]);
  const [error, setError] = useState(null);

  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        console.log("Home.jsx: Iniciando carga de datos destacados...");
        const channelsPromise = fetchFeaturedChannels();
        const moviesPromise = fetchFeaturedMovies();
        const seriesPromise = fetchFeaturedSeries();
        const results = await Promise.allSettled([channelsPromise, moviesPromise, seriesPromise]);
        const [channelsResult, moviesResult, seriesResult] = results;

        if (channelsResult.status === 'fulfilled' && Array.isArray(channelsResult.value)) {
          setFeaturedChannels(channelsResult.value.slice(0, 10));
          console.log("Home.jsx: Canales destacados cargados:", channelsResult.value);
        } else {
          console.error('Home.jsx: Error cargando canales destacados:', channelsResult.reason?.message);
          setFeaturedChannels([]);
          if (!error && channelsResult.reason) setError(channelsResult.reason?.message || "Error canales");
        }

        if (moviesResult.status === 'fulfilled' && Array.isArray(moviesResult.value)) {
          setFeaturedMovies(moviesResult.value.slice(0, 10));
          console.log("Home.jsx: Películas destacadas cargadas:", moviesResult.value);
        } else {
          console.error('Home.jsx: Error cargando películas destacadas:', moviesResult.reason?.message);
          setFeaturedMovies([]);
          if (!error && moviesResult.reason) setError(moviesResult.reason?.message || "Error películas");
        }
        
        if (seriesResult.status === 'fulfilled' && Array.isArray(seriesResult.value)) {
          setFeaturedSeries(seriesResult.value.slice(0, 10));
          console.log("Home.jsx: Series destacadas cargadas:", seriesResult.value);
        } else {
          console.error('Home.jsx: Error cargando series destacadas:', seriesResult.reason?.message);
          setFeaturedSeries([]);
          if (!error && seriesResult.reason) setError(seriesResult.reason?.message || "Error series");
        }
      } catch (err) {
        console.error('Home.jsx: Error general en loadData:', err.message);
        setError(err.message || "Error al cargar contenido destacado.");
        setFeaturedChannels([]); setFeaturedMovies([]); setFeaturedSeries([]); // Resetear en error
      } finally {
        setLoading(false);
      }
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleItemClick = (item, itemType) => {
    console.log(`Home.jsx: handleItemClick llamado con itemType: ${itemType}`, item);
    if (!item || (!item.id && !item._id)) {
      console.error("Home.jsx: Error - Item o ID del item no definido.", item);
      setError("No se pudo seleccionar el contenido, información incompleta.");
      return;
    }
    const itemId = item.id || item._id;
    const targetPath = `/watch/${itemType}/${itemId}`; 
    if (user && user.token) {
      navigate(targetPath);
    } else {
      navigate('/login', { state: { from: targetPath } });
    }
  };

  const handlePlayTrailerClick = (trailerUrl) => {
    if (trailerUrl) {
      console.log("Home.jsx: Solicitando mostrar tráiler:", trailerUrl);
      setCurrentTrailerUrl(trailerUrl);
      setShowTrailerModal(true);
    } else {
      console.warn("Home.jsx: Intento de reproducir tráiler sin URL.");
      alert("Tráiler no disponible para este título.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) { 
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 pt-20">
            <h2 className="text-2xl text-red-500 mb-4">Oops! Algo salió mal</h2>
            <p className="text-gray-400 mb-2">No se pudo cargar parte del contenido destacado.</p>
            <p className="text-sm text-gray-500 bg-gray-800 p-2 rounded mb-6">Detalle: {error}</p>
            <button 
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
            >
                Reintentar Carga
            </button>
        </div>
    );
  }

  return (
    <> {/* Fragmento para permitir que TrailerModal esté al mismo nivel que el contenido principal */}
      <div className="bg-gray-900 text-white">
        <div className="relative min-h-screen flex flex-col">
          <div className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-sm" style={{ backgroundImage: "url('/bg-login-placeholder.jpg')" }} />
          <div className="relative z-10 flex flex-col flex-grow w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-8">
            <div className="text-center mb-6 md:mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white">
                Bienvenido a <span className="text-red-600">TeamG Play</span>
              </h1>
              <p className="text-md sm:text-lg md:text-xl max-w-2xl mx-auto text-gray-300">
                Descubre los últimos estrenos, canales en vivo, películas y series disponibles en nuestra plataforma.
              </p>
            </div>
            <div className="flex-grow overflow-y-auto hide-scrollbar"> 
              {featuredChannels.length > 0 && (
                <Carousel 
                  title="Canales en Vivo Destacados" 
                  items={featuredChannels} 
                  onItemClick={(item) => handleItemClick(item, 'channel')}
                  itemType="channel" 
                  // No se pasa onPlayTrailerClick a canales
                />
              )}
              {featuredMovies.length > 0 && (
                <Carousel 
                  title="Películas Destacadas" 
                  items={featuredMovies} 
                  onItemClick={(item) => handleItemClick(item, 'movie')}
                  onPlayTrailerClick={handlePlayTrailerClick} // Pasar la función
                  itemType="movie" 
                />
              )}
              {featuredSeries.length > 0 && (
                <Carousel 
                  title="Series Populares" 
                  items={featuredSeries} 
                  onItemClick={(item) => handleItemClick(item, 'serie')}
                  onPlayTrailerClick={handlePlayTrailerClick} // Pasar la función
                  itemType="serie" 
                />
              )}
              {(featuredChannels.length === 0 && featuredMovies.length === 0 && featuredSeries.length === 0 && !loading && !error) && (
                <p className="text-center text-gray-500 py-10 text-lg">No hay contenido destacado disponible en este momento.</p>
              )}
            </div>
          </div>
        </div> 
      </div>

      {showTrailerModal && currentTrailerUrl && ( // Solo renderizar si hay URL y se debe mostrar
        <TrailerModal 
          trailerUrl={currentTrailerUrl} 
          onClose={() => {
            setShowTrailerModal(false);
            setCurrentTrailerUrl(''); // Limpiar para la próxima vez
          }} 
        />
      )}
    </>
  );
}
export default Home;