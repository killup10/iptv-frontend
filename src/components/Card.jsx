import React from 'react';

export default function Card({ title, thumbnail, onClick }) {
  return (
    <div
      onClick={onClick}
      className="min-w-[160px] sm:min-w-[200px] rounded-lg overflow-hidden transform hover:scale-105 hover:shadow-xl transition duration-300 cursor-pointer bg-[#1f1f1f]"
    >
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-auto rounded-t-lg object-cover transition duration-300"
      />
      <p className="mt-2 text-sm text-white/80 hover:text-white px-2 pb-2 truncate transition duration-200">
        {title}
      </p>
    </div>
  );
}
