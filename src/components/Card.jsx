// src/components/Card.jsx
import React, { useState } from 'react';
import { PlayIcon, FilmIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

export default function Card({ item, onClick, itemType = 'item' }) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePlayPrincipal = () => {
    onClick(item); 
  };

  const handleOverlayPlayClick = (e) => {
    e.stopPropagation();
    onClick(item); 
  };

  const handlePlayTrailer = (e) => {
    e.stopPropagation();
    if (item.trailerUrl) {
      alert(`Simulando reproducción de tráiler: ${item.trailerUrl}`);
      console.log("Reproducir tráiler para:", item.trailerUrl);
      // Aquí iría tu lógica para abrir un modal de tráiler
    } else {
      alert("Tráiler no disponible para este título.");
    }
  };

  const handleAddToMyList = (e) => {
    e.stopPropagation();
    alert(`"${item.name}" añadido a Mi Lista (funcionalidad pendiente).`);
    console.log("Añadir a Mi Lista:", item);
  };

  const displayThumbnail = item.thumbnail || '/img/placeholder-thumbnail.png'; // Asegúrate de tener esta imagen en public/img/

  // Para canales, el hover será más simple o no existirá el overlay detallado
  const showDetailedOverlay = isHovered && (itemType === 'movie' || itemType === 'serie');
  const showSimpleOverlayForChannel = isHovered && itemType === 'channel';

  return (
    <div
      className="flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-56 xl:w-60 cursor-pointer group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlayPrincipal}
    >
      <div
        className={`relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden shadow-lg 
                   transform transition-all duration-300 ease-in-out 
                   ${isHovered ? 'scale-105 shadow-2xl z-20' : 'z-0'}`}
      >
        <img
          src={displayThumbnail}
          alt={item.name || "Poster"}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = '/img/placeholder-thumbnail.png'; }}
        />

        {/* Overlay Detallado para Películas y Series */}
        {showDetailedOverlay && (
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent 
                       p-3 flex flex-col justify-end transition-opacity duration-300 ease-in-out opacity-100"
          >
            <h3 className="text-white text-sm sm:text-base font-bold truncate mb-1 drop-shadow-lg">
              {item.name || "Título no disponible"}
            </h3>
            
            <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1 sm:mb-2">
              <button 
                onClick={handleOverlayPlayClick}
                className="bg-white text-black hover:bg-gray-200 rounded-full p-1 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-white"
                title="Reproducir"
              >
                <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {item.trailerUrl && (
                <button 
                  onClick={handlePlayTrailer}
                  className="bg-black/40 border border-white/50 text-white hover:bg-white/20 backdrop-blur-sm rounded-full p-1 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-white"
                  title="Ver Tráiler"
                >
                  <FilmIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              <button 
                onClick={handleAddToMyList}
                className="bg-black/40 border border-white/50 text-white hover:bg-white/20 backdrop-blur-sm rounded-full p-1 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-white"
                title="Añadir a Mi Lista"
              >
                <PlusCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {item.description && (
              <p className="text-gray-300 text-xs line-clamp-2 sm:line-clamp-3"> 
                {item.description}
              </p>
            )}
          </div>
        )}
        
        {/* Overlay Simple para Canales (o título base si no hay hover) */}
        {/* Este se muestra si no está el overlay detallado (para canales, o cuando no hay hover en películas/series) */}
        {(!showDetailedOverlay) && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
            <p className="text-white text-sm font-semibold truncate">
              {item.name || "Título no disponible"}
            </p>
            {/* Para canales, podrías mostrar la categoría aquí si el overlay detallado no se muestra */}
            {itemType === 'channel' && item.category && isHovered && (
               <p className="text-gray-400 text-xs mt-0.5 truncate">{item.category}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}