// src/components/Carousel.jsx
import React from 'react';
import Card from './Card'; // Asegúrate que la ruta a Card.jsx sea correcta

export default function Carousel({ title, items = [], onItemClick, itemType = 'item' }) {
  if (!items || !items.length) {
    return null; // No renderizar nada si no hay items
  }

  return (
    <section className="mb-8 md:mb-12">
      <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-white px-1">
        {title}
      </h2>
      <div
        className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 pl-1 pr-1 hide-scrollbar"
        // Para la clase hide-scrollbar, añade este CSS global si aún no lo tienes:
        // En tu index.css o similar:
        // .hide-scrollbar::-webkit-scrollbar { display: none; }
        // .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        aria-label={`Carrusel de ${title}`}
      >
        {items.map((item) => (
          <Card
            key={item.id || item._id} // Usar _id como fallback si id no existe
            item={item} // Pasar el objeto item completo
            onClick={onItemClick} // Esta es la función que se llama cuando se hace clic para reproducir
            itemType={itemType} // Pasar el tipo de item (channel, movie, serie)
          />
        ))}
      </div>
    </section>
  );
}