// src/components/Carousel.jsx
import React from 'react';
import Card from './Card';

export default function Carousel({ title, items = [], onItemClick }) {
  if (!items.length) return null;

  return (
    <section className="mt-24 px-6">
      <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
      <div
        className="flex space-x-4 overflow-x-auto scrollbar-hide py-2"
        aria-label={`Carrusel de ${title}`}
      >
        {items.map((item) => (
          <Card
            key={item.id}
            title={item.name}
            thumbnail={item.thumbnail}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </section>
  );
}