// src/components/Carousel.jsx
import React from 'react';
import Card from './Card';

// Asegúrate de que el componente Carousel acepte y use onPlayTrailerClick
export default function Carousel({ title, items = [], onItemClick, itemType = 'item', onPlayTrailerClick }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 md:mb-12">
      <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-white px-1">
        {title}
      </h2>
      <div
        className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 pl-1 pr-1 hide-scrollbar [&>*]:w-[120px] sm:[&>*]:w-[150px] md:[&>*]:w-[180px]"
        aria-label={`Carrusel de ${title}`}
      >
         {items.map((item) => {
          // Calcular progreso para "Continuar viendo"
          let progressPercent = undefined;
          
          if (item.watchProgress?.lastTime && item.watchProgress?.duration) {
            progressPercent = (item.watchProgress.lastTime / item.watchProgress.duration) * 100;
          } else if (typeof item.progressTime === 'number' && item.duration) {
            progressPercent = (item.progressTime / item.duration) * 100;
          }
          
          // Asegurar que el progreso esté entre 0 y 100
          if (progressPercent !== undefined) {
            progressPercent = Math.max(0, Math.min(100, progressPercent));
          }

          return (
            <Card
              key={item.id || item._id}
              item={item}
              onClick={onItemClick}
              itemType={typeof itemType === 'function' ? itemType(item) : itemType}
              onPlayTrailer={onPlayTrailerClick} // Pasa la prop onPlayTrailerClick a Card (Card la espera como onPlayTrailer)
              progressPercent={progressPercent}
            />
          );
        })}
      </div>
    </section>
  );
}