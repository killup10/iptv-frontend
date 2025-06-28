import React, { useState } from 'react';
import {
  PlayIcon as PlayOutlineIcon,
  FilmIcon as FilmOutlineIcon,
  PlusCircleIcon as PlusCircleOutlineIcon,
} from '@heroicons/react/24/outline';
import { PlayIcon as PlaySolidIcon } from '@heroicons/react/24/solid';

export default function Card({
  item,
  onClick,
  itemType = 'item',
  onPlayTrailer,
  progressPercent,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePlayPrincipal = (e) => {
    if (onClick) {
      onClick(item);
    }
  };

  const handleOverlayPlayClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(item);
    }
  };

  const handleTriggerPlayTrailer = (e) => {
    e.stopPropagation();
    if (item?.trailerUrl && onPlayTrailer) {
      onPlayTrailer(item.trailerUrl);
    } else if (!item?.trailerUrl) {
      console.warn('Card.jsx: No hay trailerUrl para este item:', item.title || item.name);
    }
  };

  const handleAddToMyList = (e) => {
    e.stopPropagation();
    console.log(`Añadir "${item.name || item.title}" a Mi Lista (pendiente)`);
  };

  const displayThumbnail =
    item.thumbnail ||
    item.logo ||
    item.customThumbnail ||
    item.tmdbThumbnail ||
    '/img/placeholder-thumbnail.png';

  const showDetailedOverlay = isHovered && (itemType === 'movie' || itemType === 'serie');

  return (
    <div
      className="flex-shrink-0 w-full cursor-pointer group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlayPrincipal}
      aria-label={`Ver ${item.name || item.title}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handlePlayPrincipal(e);
      }}
    >
      <div
        className={`relative aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl 
                   transform transition-all duration-300 ease-in-out 
                   ${isHovered ? 'scale-105 z-10' : 'z-0'}`}
      >
        <img
          src={displayThumbnail}
          alt={item.name || item.title || 'Póster'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/img/placeholder-thumbnail.png';
          }}
          loading="lazy"
        />

        {typeof progressPercent === 'number' && progressPercent > 0 && progressPercent < 100 && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700/80">
              <div
                className="h-full bg-red-600"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
              {Math.round(progressPercent)}%
            </div>
          </>
        )}

        {showDetailedOverlay && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent
                       p-2 sm:p-3 flex flex-col justify-end transition-opacity duration-300 ease-in-out opacity-100 space-y-1"
          >
            <h3 className="text-white text-sm sm:text-base font-semibold drop-shadow-md line-clamp-2">
              {item.name || item.title || 'Título no disponible'}
            </h3>

            {item.releaseYear && (
              <p className="text-gray-300 text-[11px] sm:text-xs italic">
                Año: {item.releaseYear}
              </p>
            )}

            {item.description && (
              <p className="text-gray-300 text-[11px] sm:text-xs line-clamp-3">
                {item.description.length > 150
                  ? item.description.slice(0, 150) + '...'
                  : item.description}
              </p>
            )}

            {item.genres && item.genres.length > 0 && (
              <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5">
                Géneros: {item.genres.join(', ')}
              </p>
            )}

            <div className="flex items-center space-x-2 mt-1.5">
              <button
                onClick={handleOverlayPlayClick}
                className="bg-white text-black hover:bg-gray-200 rounded-full p-1 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
                title="Reproducir"
                aria-label={`Reproducir ${item.name || item.title}`}
              >
                <PlaySolidIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {item.trailerUrl && onPlayTrailer && (
                <button
                  onClick={handleTriggerPlayTrailer}
                  className="bg-black/40 border border-white/40 text-white hover:bg-white/20 backdrop-blur-sm rounded-full p-1 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
                  title="Ver Tráiler"
                  aria-label={`Ver tráiler de ${item.name || item.title}`}
                >
                  <FilmOutlineIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              <button
                onClick={handleAddToMyList}
                className="bg-black/40 border border-white/40 text-white hover:bg-white/20 backdrop-blur-sm rounded-full p-1 sm:p-1.5 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
                title="Añadir a Mi Lista"
                aria-label={`Añadir ${item.name || item.title} a Mi Lista`}
              >
                <PlusCircleOutlineIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}

        {(!showDetailedOverlay || itemType === 'channel') &&
          !(typeof progressPercent === 'number' && progressPercent > 0) && (
            <div
              className={`absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent
                          ${
                            isHovered && itemType === 'channel'
                              ? 'opacity-100'
                              : isHovered
                              ? 'opacity-0'
                              : 'opacity-100'
                          }
                          transition-opacity duration-300`}
            >
              <p className="text-white text-xs sm:text-sm font-semibold truncate">
                {item.name || item.title || 'Título no disponible'}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
