import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const featuredContent = {
    title: "Los mejores canales en vivo",
    description: "Accede a canales de TV en vivo de todo el mundo. Deportes, noticias, películas y mucho más en un solo lugar.",
    imageUrl: "https://source.unsplash.com/random/1200x600/?television",
    link: "/tv"
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10"></div>
        <img 
          src={featuredContent.imageUrl} 
          alt="Featured content" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 container mx-auto px-4 flex flex-col justify-center h-full">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 max-w-2xl">{featuredContent.title}</h1>
          <p className="text-lg text-gray-300 mb-8 max-w-xl">{featuredContent.description}</p>
          <div className="flex flex-wrap gap-4">
            <Link to={featuredContent.link} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-medium flex items-center">
              <span>Ver ahora</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </Link>
            <button className="bg-gray-800/80 hover:bg-gray-700/80 text-white px-8 py-3 rounded-md font-medium flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Más información</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Rows */}
      <div className="bg-black py-12">
        <div className="container mx-auto px-4">
          {/* TV Channels Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Canales en Vivo</h2>
              <Link to="/tv" className="text-sm text-gray-400 hover:text-white">Ver todos</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div 
                  key={`tv-${item}`}
                  className="bg-gray-900 rounded-md overflow-hidden transition transform hover:scale-105 cursor-pointer"
                  onClick={() => navigate('/tv')}
                >
                  <div className="aspect-video bg-gray-800 flex items-center justify-center text-4xl">📺</div>
                  <div className="p-2">
                    <h3 className="text-white font-medium truncate">Canal {item}</h3>
                    <p className="text-gray-400 text-sm">TV en Vivo</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Movies Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Películas Destacadas</h2>
              <Link to="/movies" className="text-sm text-gray-400 hover:text-white">Ver todas</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div 
                  key={`movie-${item}`}
                  className="bg-gray-900 rounded-md overflow-hidden transition transform hover:scale-105 hover:z-10 cursor-pointer"
                  onClick={() => navigate('/movies')}
                >
                  <div 
                    className="aspect-[2/3] bg-cover bg-center" 
                    style={{backgroundImage: `url(https://source.unsplash.com/random/300x450?movie-${item})`}}
                  ></div>
                  <div className="p-2">
                    <h3 className="text-white font-medium truncate">Película {item}</h3>
                    <p className="text-gray-400 text-sm">Acción • 2023</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Series Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Series Populares</h2>
              <Link to="/series" className="text-sm text-gray-400 hover:text-white">Ver todas</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div 
                  key={`series-${item}`}
                  className="bg-gray-900 rounded-md overflow-hidden transition transform hover:scale-105 hover:z-10 cursor-pointer"
                  onClick={() => navigate('/series')}
                >
                  <div 
                    className="aspect-video bg-cover bg-center" 
                    style={{backgroundImage: `url(https://source.unsplash.com/random/300x169?tv-${item})`}}
                  ></div>
                  <div className="p-2">
                    <h3 className="text-white font-medium truncate">Serie {item}</h3>
                    <p className="text-gray-400 text-sm">Drama • {2023 - item} Temporadas</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Home;