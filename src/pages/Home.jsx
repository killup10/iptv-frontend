// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/Carousel.jsx';
// IMPORTAMOS LAS FUNCIONES CORRECTAS
import { 
  fetchFeaturedChannels, 
  fetchFeaturedPublicContent // Esta devuelve { movies: [...], series: [...] }
} from '../utils/api.js';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredChannels, setFeaturedChannels] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredSeries, setFeaturedSeries] = useState([]);
  const [error, setError] = useState(null); // Estado para errores de carga

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null); // Limpiar errores anteriores
      try {
        console.log("Home.jsx: Iniciando carga de datos destacados...");
        const channelsData = await fetchFeaturedChannels();
        setFeaturedChannels(Array.isArray(channelsData) ? channelsData.slice(0, 10) : []);
        console.log("Home.jsx: Canales destacados cargados:", channelsData);

        const publicContent = await fetchFeaturedPublicContent(); 
        setFeaturedMovies(publicContent && Array.isArray(publicContent.movies) ? publicContent.movies.slice(0, 10) : []);
        setFeaturedSeries(publicContent && Array.isArray(publicContent.series) ? publicContent.series.slice(0, 10) : []);
        console.log("Home.jsx: Contenido VOD destacado cargado:", publicContent);

      } catch (err) {
        console.error('Home.jsx: Error cargando datos destacados:', err.message);
        setError(err.message || "Error al cargar contenido destacado."); // Guardar error para mostrarlo
        setFeaturedChannels([]);
        setFeaturedMovies([]);
        setFeaturedSeries([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleItemClick = (item, itemType) => {
    if (!item || (!item.id && !item._id)) {
      console.error("Home.jsx: Error - Item o ID del item no definido.", item);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Sección Hero */}
      <div className="relative h-[70vh] md:h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-sm"
          style={{ backgroundImage: "url('/bg-login-placeholder.jpg')" }}
        />
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">
            Bienvenido a <span className="text-red-600">TeamG Play</span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-300">
            Descubre los últimos estrenos, canales en vivo, películas y series disponibles en nuestra plataforma.
          </p>
        </div>
      </div>

      {/* Sección de Carouseles */}
      <div className="py-8 md:py-12 lg:py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && <p className="text-center text-red-500 py-10">Error al cargar contenido: {error}</p>}
          
          {!error && featuredChannels.length > 0 && (
            <Carousel 
              title="Canales en Vivo Destacados" 
              items={featuredChannels} 
              onItemClick={(item) => handleItemClick(item, 'channel')} 
            />
          )}
          {!error && featuredMovies.length > 0 && (
            <Carousel 
              title="Películas Destacadas" 
              items={featuredMovies} 
              onItemClick={(item) => handleItemClick(item, 'movie')} 
            />
          )}
          {!error && featuredSeries.length > 0 && (
            <Carousel 
              title="Series Populares" 
              items={featuredSeries} 
              onItemClick={(item) => handleItemClick(item, 'serie')} 
            />
          )}
          {!error && featuredChannels.length === 0 && featuredMovies.length === 0 && featuredSeries.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-10">No hay contenido destacado disponible en este momento.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;