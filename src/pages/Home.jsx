// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/Carousel.jsx';
// Asegúrate que tu api.js exporte estas tres funciones para contenido público
import { 
  fetchFeaturedChannels, 
  fetchFeaturedMovies,
  fetchFeaturedSeries 
} from '../utils/api.js';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [featuredChannels, setFeaturedChannels] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredSeries, setFeaturedSeries] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        console.log("Home.jsx: Iniciando carga de datos destacados...");
        
        const channelsPromise = fetchFeaturedChannels();
        const moviesPromise = fetchFeaturedMovies();
        const seriesPromise = fetchFeaturedSeries();

        // Esperar todas las promesas
        // Promise.allSettled es bueno porque si una falla, las otras pueden continuar
        const results = await Promise.allSettled([
          channelsPromise,
          moviesPromise,
          seriesPromise
        ]);

        const [channelsResult, moviesResult, seriesResult] = results;

        if (channelsResult.status === 'fulfilled') {
          setFeaturedChannels(Array.isArray(channelsResult.value) ? channelsResult.value.slice(0, 10) : []);
          console.log("Home.jsx: Canales destacados cargados:", channelsResult.value);
        } else {
          console.error('Home.jsx: Error cargando canales destacados:', channelsResult.reason?.message);
          setFeaturedChannels([]);
          // Solo establece el error principal si aún no hay uno de una petición anterior
          if (!error) setError(channelsResult.reason?.message || "Error al cargar canales");
        }

        if (moviesResult.status === 'fulfilled') {
          setFeaturedMovies(Array.isArray(moviesResult.value) ? moviesResult.value.slice(0, 10) : []);
          console.log("Home.jsx: Películas destacadas cargadas:", moviesResult.value);
        } else {
          console.error('Home.jsx: Error cargando películas destacadas:', moviesResult.reason?.message);
          setFeaturedMovies([]);
          if (!error) setError(moviesResult.reason?.message || "Error al cargar películas");
        }
        
        if (seriesResult.status === 'fulfilled') {
          setFeaturedSeries(Array.isArray(seriesResult.value) ? seriesResult.value.slice(0, 10) : []);
          console.log("Home.jsx: Series destacadas cargadas:", seriesResult.value);
        } else {
          console.error('Home.jsx: Error cargando series destacadas:', seriesResult.reason?.message);
          setFeaturedSeries([]);
          if (!error) setError(seriesResult.reason?.message || "Error al cargar series");
        }

      } catch (err) { // Este catch es por si Promise.allSettled en sí mismo fallara (muy raro)
        console.error('Home.jsx: Error general en loadData:', err.message);
        setError(err.message || "Error al cargar contenido destacado.");
        setFeaturedChannels([]);
        setFeaturedMovies([]);
        setFeaturedSeries([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []); // El array de dependencias vacío asegura que se ejecute solo una vez al montar

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
  
  // Si hay un error después de cargar, muéstralo aquí antes del layout principal
  if (error && !loading) { 
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h2 className="text-2xl text-red-500 mb-4">Oops! Algo salió mal</h2>
            <p className="text-gray-400 mb-2">No se pudo cargar el contenido destacado.</p>
            <p className="text-xs text-gray-500 mb-6">Detalle: {error}</p>
            <button 
                onClick={() => {
                    setError(null); // Limpiar error para reintentar
                    // Podrías querer llamar a loadData() aquí de nuevo o simplemente recargar
                    window.location.reload(); 
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
            >
                Reintentar
            </button>
        </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white"> {/* Div principal de la página */}
      
      {/* Sección Hero Principal que contendrá el fondo y todo el contenido visible inicial */}
      {/* Ajusta min-h-xx para controlar la altura mínima de esta sección completa */}
      <div className="relative min-h-screen flex flex-col"> {/* Ocupa al menos toda la pantalla */}
        
        {/* Imagen de Fondo con Blur (ocupa todo este div anterior) */}
        <div
          className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-sm"
          style={{ backgroundImage: "url('/bg-login-placeholder.jpg')" }}
        />

        {/* Contenedor para el contenido superpuesto (texto y carruseles) */}
        {/* pt-20/md:pt-24 para dejar espacio al header fijo, pb-8 para el final */}
        <div className="relative z-10 flex flex-col flex-grow w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-8">
          
          {/* Texto de Bienvenida */}
          <div className="text-center mb-6 md:mb-10"> {/* Margen inferior para separar del primer carrusel */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white">
              Bienvenido a <span className="text-red-600">TeamG Play</span>
            </h1>
            <p className="text-md sm:text-lg md:text-xl max-w-2xl mx-auto text-gray-300">
              Descubre los últimos estrenos, canales en vivo, películas y series disponibles en nuestra plataforma.
            </p>
          </div>

          {/* Sección de Carouseles (dentro del flujo, debajo del texto) */}
          {/* flex-grow aquí para que esta sección de carruseles intente ocupar el espacio restante si el div padre es flex-col */}
          <div className="flex-grow overflow-y-auto hide-scrollbar"> 
            {/* Ya no se muestra el error aquí, se maneja arriba */}
            
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
                itemType="movie" 
              />
            )}
            {featuredSeries.length > 0 && (
              <Carousel 
                title="Series Populares" 
                items={featuredSeries} 
                onItemClick={(item) => handleItemClick(item, 'serie')}
                itemType="serie" 
              />
            )}
            {/* Mensaje si no hay NINGÚN contenido destacado Y no está cargando Y no hay error */}
            {(featuredChannels.length === 0 && featuredMovies.length === 0 && featuredSeries.length === 0 && !loading && !error) && (
              <p className="text-center text-gray-500 py-10">No hay contenido destacado disponible en este momento.</p>
            )}
          </div>
        </div>
      </div> 
      
      {/* Aquí puedes añadir tu componente Footer si lo tienes y lo quieres fuera del fondo blur */}
      {/* <Footer /> */}
    </div>
  );
}

export default Home;