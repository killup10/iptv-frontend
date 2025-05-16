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
        className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 pl-1 pr-1 hide-scrollbar"
        aria-label={`Carrusel de ${title}`}
      >
        {items.map((item) => (
          <Card
            key={item.id || item._id}
            item={item}
            onClick={onItemClick} 
            itemType={itemType}
            onPlayTrailer={onPlayTrailerClick} // Pasa la prop onPlayTrailerClick a Card (Card la espera como onPlayTrailer)
          />
        ))}
      </div>
    </section>
  );
}