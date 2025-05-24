// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/Carousel.jsx';
import { 
  fetchFeaturedChannels, 
  fetchFeaturedMovies,
  fetchFeaturedSeries 
} from '../utils/api.js'; // Asegúrate que la ruta a api.js sea correcta
import TrailerModal from '../components/TrailerModal.jsx';

export function Home() {
  console.log('[Home.jsx] Renderizando Home...'); // LOG AÑADIDO
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
    console.log('[Home.jsx] Estado del usuario en Home:', user); // LOG AÑADIDO
    async function loadData() {
      setLoading(true);
      setError(null);
      console.log("[Home.jsx] loadData: Iniciando carga de datos destacados...");
      try {
        const channelsPromise = fetchFeaturedChannels();
        const moviesPromise = fetchFeaturedMovies();
        const seriesPromise = fetchFeaturedSeries();
        
        // Esperamos a que todas las promesas se resuelvan (sean exitosas o fallidas)
        const results = await Promise.allSettled([channelsPromise, moviesPromise, seriesPromise]);
        const [channelsResult, moviesResult, seriesResult] = results;

        console.log("[Home.jsx] loadData: Resultados de Promise.allSettled:", results);

        if (channelsResult.status === 'fulfilled' && Array.isArray(channelsResult.value)) {
          setFeaturedChannels(channelsResult.value.slice(0, 10));
          console.log("[Home.jsx] loadData: Canales destacados cargados:", channelsResult.value.slice(0, 10));
        } else {
          console.error('[Home.jsx] loadData: Error cargando canales destacados:', channelsResult.reason || "Resultado no esperado");
          setFeaturedChannels([]);
          if (!error && channelsResult.reason) setError(channelsResult.reason?.message || "Error al cargar canales destacados.");
        }

        if (moviesResult.status === 'fulfilled' && Array.isArray(moviesResult.value)) {
          setFeaturedMovies(moviesResult.value.slice(0, 10));
          console.log("[Home.jsx] loadData: Películas destacadas cargadas:", moviesResult.value.slice(0, 10));
        } else {
          console.error('[Home.jsx] loadData: Error cargando películas destacadas:', moviesResult.reason || "Resultado no esperado");
          setFeaturedMovies([]);
          if (!error && moviesResult.reason) setError(moviesResult.reason?.message || "Error al cargar películas destacadas.");
        }
        
        if (seriesResult.status === 'fulfilled' && Array.isArray(seriesResult.value)) {
          setFeaturedSeries(seriesResult.value.slice(0, 10));
          console.log("[Home.jsx] loadData: Series destacadas cargadas:", seriesResult.value.slice(0, 10));
        } else {
          console.error('[Home.jsx] loadData: Error cargando series destacadas:', seriesResult.reason || "Resultado no esperado");
          setFeaturedSeries([]);
          if (!error && seriesResult.reason) setError(seriesResult.reason?.message || "Error al cargar series destacadas.");
        }

        // Si todos fallaron, pero no hubo un error de red global, setError podría no haberse activado
        // Esta es una comprobación adicional.
        if (channelsResult.status !== 'fulfilled' && moviesResult.status !== 'fulfilled' && seriesResult.status !== 'fulfilled' && !error) {
            setError("No se pudo cargar ningún contenido destacado.");
        }

      } catch (err) {
        // Este catch es para errores en la lógica de Promise.allSettled o configuración,
        // ya que Promise.allSettled en sí no rechaza.
        console.error('[Home.jsx] loadData: Error general en la función loadData:', err.message, err);
        setError(err.message || "Error crítico al cargar contenido destacado.");
        setFeaturedChannels([]); setFeaturedMovies([]); setFeaturedSeries([]);
      } finally {
        setLoading(false);
        console.log("[Home.jsx] loadData: Carga de datos finalizada. Loading:", false, "Error:", error);
      }
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencia user eliminada para evitar recargas si solo cambia el user y no es necesario para esta data.
          // Si la data destacada depende del usuario, vuelve a añadir 'user'.

  const handleItemClick = (item, itemType) => {
    console.log(`[Home.jsx] handleItemClick llamado con itemType: ${itemType}`, item);
    if (!item || (!item.id && !item._id)) {
      console.error("[Home.jsx] Error - Item o ID del item no definido.", item);
      setError("No se pudo seleccionar el contenido, información incompleta."); // Considera si esto debería ser un alert o un estado de error local
      return;
    }
    const itemId = item.id || item._id;
    const targetPath = `/watch/${itemType}/${itemId}`; 
    if (user && user.token) { // Asumiendo que user.token indica autenticación
      console.log(`[Home.jsx] Usuario autenticado, navegando a: ${targetPath}`);
      navigate(targetPath);
    } else {
      console.log(`[Home.jsx] Usuario NO autenticado, redirigiendo a login desde: ${targetPath}`);
      navigate('/login', { state: { from: targetPath } });
    }
  };

  const handlePlayTrailerClick = (trailerUrl) => {
    if (trailerUrl) {
      console.log("[Home.jsx] Solicitando mostrar tráiler:", trailerUrl);
      setCurrentTrailerUrl(trailerUrl);
      setShowTrailerModal(true);
    } else {
      console.warn("[Home.jsx] Intento de reproducir tráiler sin URL.");
      // Considera usar un componente de notificación en lugar de alert
      // alert("Tráiler no disponible para este título.");
      setError("Tráiler no disponible para este título."); // O un estado local para un mensaje
    }
  };

  if (loading) {
    console.log("[Home.jsx] Mostrando estado de carga (spinner)...");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 pt-20"> {/* Añadido pt-20 para no quedar debajo del header */}
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Si hay un error después de cargar, muestra la pantalla de error.
  // Este es un candidato fuerte para lo que estás viendo si las API fallan.
  if (error) { 
    console.error("[Home.jsx] Mostrando estado de error:", error);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 pt-20"> {/* Añadido pt-20 */}
          <h2 className="text-2xl text-red-500 mb-4">Oops! Algo salió mal</h2>
          <p className="text-gray-400 mb-2">No se pudo cargar el contenido destacado necesario para la página principal.</p>
          <p className="text-sm text-gray-500 bg-gray-800 p-2 rounded mb-6">Detalle del error: {typeof error === 'string' ? error : JSON.stringify(error)}</p>
          <button 
            onClick={() => {
              console.log("[Home.jsx] Botón 'Reintentar Carga' presionado.");
              // Reiniciar estados y llamar a loadData de nuevo
              setLoading(true);
              setError(null);
              // loadData(); // Esto se llamará por el useEffect si se cambian las dependencias,
                           // o puedes llamarlo directamente si quitas la dependencia vacía del useEffect.
                           // Para un reintento simple, recargar la página es más fácil:
              window.location.reload(); 
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
          >
            Reintentar Carga
          </button>
        </div>
    );
  }

  // Si no hay error y no está cargando, renderiza el contenido principal.
  console.log("[Home.jsx] Renderizando contenido principal de Home.");
  return (
    <> {/* Fragmento para permitir que TrailerModal esté al mismo nivel que el contenido principal */}
      <div className="bg-gray-900 text-white"> {/* Fondo general para Home */}
        <div className="relative min-h-screen flex flex-col"> {/* Contenedor principal */}
          {/* Imagen de fondo con efecto */}
          <div 
            className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-sm" 
            style={{ backgroundImage: "url('./bg-login-placeholder.jpg')" }} // Cambiado a ruta relativa
                                                                            // Asegúrate que bg-login-placeholder.jpg esté en public/
          />
          
          {/* Contenido superpuesto */}
          <div className="relative z-10 flex flex-col flex-grow w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-8">
            <div className="text-center mb-6 md:mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white">
                Bienvenido a <span className="text-red-600">TeamG Play</span>
              </h1>
              <p className="text-md sm:text-lg md:text-xl max-w-2xl mx-auto text-gray-300">
                Descubre los últimos estrenos, canales en vivo, películas y series disponibles en nuestra plataforma.
              </p>
            </div>

            {/* Contenedor de carruseles con scroll */}
            <div className="flex-grow overflow-y-auto hide-scrollbar"> 
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
              {/* Mensaje si no hay contenido y no está cargando ni hay error */}
              {(featuredChannels.length === 0 && featuredMovies.length === 0 && featuredSeries.length === 0 && !loading && !error) && (
                <p className="text-center text-gray-500 py-10 text-lg">No hay contenido destacado disponible en este momento.</p>
              )}
            </div>
          </div>
        </div> 
      </div>

      {/* Modal del Tráiler */}
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
