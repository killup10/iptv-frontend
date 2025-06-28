// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/Carousel.jsx';
import {
  fetchFeaturedChannels,
  fetchFeaturedMovies,
  fetchFeaturedSeries,
} from '../utils/api.js';
import { videoProgressService } from '../services/videoProgress.js';
import TrailerModal from '../components/TrailerModal.jsx';

export function Home() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // State for login form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // State for content
  const [featuredChannels, setFeaturedChannels] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [featuredSeries, setFeaturedSeries] = useState([]);
  const [continueWatchingItems, setContinueWatchingItems] = useState([]);
  const [contentError, setContentError] = useState(null);

  // State for trailer modal
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login({ username, password });
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Error al iniciar sesión');
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setContentError(null);
      try {
        const results = await Promise.allSettled([
          videoProgressService.getContinueWatching(),
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

        if (continueWatchingResult.status === 'fulfilled' && Array.isArray(continueWatchingResult.value)) {
          console.log('[Home.jsx] Continue watching items loaded:', continueWatchingResult.value);
          setContinueWatchingItems(continueWatchingResult.value);
        } else {
          console.error('[Home.jsx] Error loading "Continue Watching":', continueWatchingResult.reason);
          setContinueWatchingItems([]);
        }
        
        if (channelsResult.status === 'fulfilled' && Array.isArray(channelsResult.value)) {
          setFeaturedChannels(channelsResult.value.slice(0, 15));
        } else {
          console.error('[Home.jsx] Error loading featured channels:', channelsResult.reason);
          setFeaturedChannels([]);
        }

        if (moviesResult.status === 'fulfilled' && Array.isArray(moviesResult.value)) {
          setFeaturedMovies(moviesResult.value.slice(0, 15));
        } else {
          console.error('[Home.jsx] Error loading featured movies:', moviesResult.reason);
          setFeaturedMovies([]);
        }
        
        if (seriesResult.status === 'fulfilled' && Array.isArray(seriesResult.value)) {
          setFeaturedSeries(seriesResult.value.slice(0, 15));
        } else {
          console.error('[Home.jsx] Error loading featured series:', seriesResult.reason);
          setFeaturedSeries([]);
        }

      } catch (err) {
        console.error('[Home.jsx] General error in loadInitialData:', err);
        setContentError(err.message || "Error loading content.");
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
    const type = item.itemType || item.tipo || itemTypeFromCarousel;
    const id = item.id || item._id;

    if (!type || !id) {
      console.error("[Home.jsx] handleItemClick: Item type or ID is undefined.", item);
      alert("Error: Cannot determine the content to play.");
      return;
    }

    const progress = item.watchProgress || {};
    const startTime = progress.lastTime || 0;
    const lastChapter = progress.lastChapter || 0;
    
    const navigationState = {};
    
    // Para "Continuar viendo", siempre pasar el progreso
    if (itemTypeFromCarousel === 'continue-watching' || startTime > 5) {
      navigationState.continueWatching = true;
      navigationState.startTime = startTime;
      
      // Si es una serie y tiene capítulos, navegar al último capítulo visto
      if ((type === 'serie' || type === 'series') && lastChapter !== undefined) {
        navigationState.chapterIndex = lastChapter;
      }
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
  
  if (contentError) {
      return <div className="text-center text-red-400 p-10 pt-24">Error loading content: {contentError}</div>;
  }
  
  if (!user?.token && !loading) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');

          :root {
            --background: 254 50% 5%;
            --foreground: 210 40% 98%;
            --primary: 190 100% 50%;
            --primary-foreground: 254 50% 5%;
            --secondary: 315 100% 60%;
            --secondary-foreground: 210 40% 98%;
            --muted-foreground: 190 30% 80%;
            --card-background: 254 50% 8%;
            --input-background: 254 50% 12%;
            --input-border: 315 100% 25%;
            --footer-text: 210 40% 70%;
          }

          body {
            font-family: 'Inter', sans-serif;
          }

          .text-glow-primary {
            text-shadow: 0 0 5px hsl(var(--primary) / 0.8), 0 0 10px hsl(var(--primary) / 0.6);
          }
          .text-glow-secondary {
            text-shadow: 0 0 5px hsl(var(--secondary) / 0.8), 0 0 10px hsl(var(--secondary) / 0.6);
          }
          .shadow-glow-primary {
            box-shadow: 0 0 25px hsl(var(--primary) / 0.8);
          }
          .drop-shadow-glow-logo {
            filter: drop-shadow(0 0 25px hsl(var(--secondary) / 0.6)) drop-shadow(0 0 15px hsl(var(--primary) / 0.5));
          }
        `}</style>
        <div 
          className="relative min-h-screen w-full flex flex-col"
          style={{
          backgroundImage: "url('/fondo.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
          }}
        >
          <main className="relative z-10 flex-grow flex flex-col md:flex-row items-center justify-center p-4">
            <div className="hidden md:flex flex-col flex-1 p-8 lg:p-16 items-center justify-center text-center">
                <h1 className="text-5xl font-black text-primary text-glow-primary mb-6">
                    Bienvenido a
                </h1>
                <img 
                  src="/TeamG Play.png" 
                  alt="Logo de TeamG Play" 
                  className="w-full max-w-xs drop-shadow-glow-logo" 
                />
                <p className="text-xl text-muted-foreground mt-4 max-w-md">
                  Inicia sesión para descubrir un mundo de entretenimiento.
                </p>
            </div>
            <div className="flex-1 w-full max-w-md p-4">
              <div 
                className="w-full p-8 rounded-2xl" 
                style={{
                  backgroundColor: 'hsl(var(--card-background) / 0.8)',
                  border: '1px solid hsl(var(--input-border) / 0.5)'
                }}
              >
                <h2 className="text-3xl font-black text-center text-primary text-glow-primary mb-8">
                    Iniciar Sesión
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Usuario</label>
                    <input 
                      type="text" 
                      placeholder="Tu nombre de usuario"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'hsl(var(--input-background))',
                        border: '1px solid hsl(var(--input-border))',
                        '--tw-ring-color': 'hsl(var(--primary))'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Contraseña</label>
                    <input 
                      type="password" 
                      placeholder="Tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg text-foreground focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'hsl(var(--input-background))',
                        border: '1px solid hsl(var(--input-border))',
                        '--tw-ring-color': 'hsl(var(--primary))'
                      }}
                    />
                  </div>
                  {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-glow-primary"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                  >
                    Entrar
                  </button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-6">
                  ¿No tienes cuenta?{' '}
                  <a href="/register" className="font-medium text-secondary hover:underline text-glow-secondary">
                    Regístrate aquí
                  </a>
                </p>
              </div>
            </div>
          </main>
        </div>
      </>
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
              onItemClick={(item) => handleItemClick(item, 'continue-watching')}
              itemType={item => item.tipo || item.itemType || 'movie'}
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
          
          {user && !loading && !contentError &&
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
