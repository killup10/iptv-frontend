// src/components/Card.jsx
import React, { useState } from 'react';
import { PlayIcon, FilmIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

export default function Card({ item, onClick, itemType = 'item', onPlayTrailer }) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePlayPrincipal = (e) => {
    // No necesitas e.stopPropagation() si este es el evento principal de la tarjeta
    if (onClick) {
        onClick(item); 
    }
  };

  // Este se usa si el botón de play está DENTRO del overlay y no quieres que el click de la tarjeta se dispare también
  const handleOverlayPlayClick = (e) => {
    e.stopPropagation(); 
    if (onClick) {
        onClick(item); 
    }
  };

  const handleTriggerPlayTrailer = (e) => { // Nombre cambiado para claridad
    e.stopPropagation();
    if (item && item.trailerUrl && onPlayTrailer) {
      console.log("Card.jsx: Solicitando reproducción de tráiler para:", item.trailerUrl);
      onPlayTrailer(item.trailerUrl);
    } else if (item && !item.trailerUrl) {
      // alert("Tráiler no disponible para este título."); // Evitar alerts si es posible
      console.warn("Card.jsx: No hay trailerUrl para este item:", item.title || item.name);
    } else if (!onPlayTrailer) {
      console.warn("Card.jsx: La función onPlayTrailer no fue proporcionada como prop.");
    } else {
      console.warn("Card.jsx: El objeto item es nulo o undefined al intentar reproducir tráiler.");
    }
  };

  const handleAddToMyList = (e) => {
    e.stopPropagation();
    alert(`"${item.name || item.title}" añadido a Mi Lista (funcionalidad pendiente).`);
  };

  const displayThumbnail = item.thumbnail || item.logo || '/img/placeholder-thumbnail.png'; 

  const showDetailedOverlay = isHovered && (itemType === 'movie' || itemType === 'serie');

  return (
    <div
      className="flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-56 xl:w-60 cursor-pointer group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlayPrincipal}
      aria-label={`Ver ${item.name || item.title}`}
    >
      <div
        className={`relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden shadow-lg 
                   transform transition-all duration-300 ease-in-out 
                   ${isHovered ? 'scale-105 shadow-2xl z-20' : 'z-0'}`}
      >
        <img
          src={displayThumbnail}
          alt={item.name || item.title || "Poster"}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/img/placeholder-thumbnail.png'; }}
        />

        {showDetailedOverlay && (itemType === 'movie' || itemType === 'serie') && ( // Solo para movie/serie
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent 
                       p-3 flex flex-col justify-end transition-opacity duration-300 ease-in-out opacity-100"
          >
            <h3 className="text-white text-sm sm:text-base font-bold truncate mb-1 drop-shadow-lg">
              {item.name || item.title || "Título no disponible"}
            </h3>
            
            <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1 sm:mb-2">
              <button 
                onClick={handleOverlayPlayClick}
                className="bg-white text-black hover:bg-gray-200 rounded-full p-1 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-white"
                title="Reproducir"
                aria-label={`Reproducir ${item.name || item.title}`}
              >
                <PlayIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {item.trailerUrl && ( // Solo mostrar el botón si hay trailerUrl
                <button 
                  onClick={handleTriggerPlayTrailer}
                  className="bg-black/40 border border-white/50 text-white hover:bg-white/20 backdrop-blur-sm rounded-full p-1 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-white"
                  title="Ver Tráiler"
                  aria-label={`Ver tráiler de ${item.name || item.title}`}
                >
                  <FilmIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              <button 
                onClick={handleAddToMyList}
                className="bg-black/40 border border-white/50 text-white hover:bg-white/20 backdrop-blur-sm rounded-full p-1 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-white"
                title="Añadir a Mi Lista"
                aria-label={`Añadir ${item.name || item.title} a Mi Lista`}
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
        
        {/* Título base si no hay overlay detallado o es un canal */}
        {(!showDetailedOverlay || itemType === 'channel') && (
          <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent
                          ${isHovered && itemType === 'channel' ? 'opacity-100' : (isHovered ? 'opacity-0' : 'opacity-100')}
                          transition-opacity duration-300`}
          >
            <p className="text-white text-sm font-semibold truncate">
              {item.name || item.title || "Título no disponible"}
            </p>
            {itemType === 'channel' && item.category && isHovered && (
               <p className="text-gray-400 text-xs mt-0.5 truncate">{item.category}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}