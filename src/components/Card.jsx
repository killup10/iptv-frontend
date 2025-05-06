import React from 'react';

export default function Card({ title, thumbnail, onClick }) {
  return (
    <div
      onClick={onClick}
      className="min-w-[160px] sm:min-w-[200px] rounded-lg overflow-hidden transform hover:scale-105 transition cursor-pointer"
    >
      <img src={thumbnail} alt={title} className="w-full h-auto" />
      <p className="mt-2 text-sm text-white truncate px-1">{title}</p>
    </div>
  );
}
