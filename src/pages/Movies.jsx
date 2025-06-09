import React from "react";
import { Link } from "react-router-dom";

export const Movies = () => {
  // Simulación de pelis
  const movies = [
    { id: "1", title: "Ejemplo Película 4K" },
    { id: "2", title: "Otra Película 4K" },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Películas Disponibles</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            to={`/player/${movie.id}`}
            className="bg-white rounded-xl shadow hover:bg-gray-100 transition overflow-hidden flex flex-col"
          >
            <div className="w-full aspect-[2/3] bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-semibold text-sm line-clamp-2">{movie.title}</h3>
              <p className="text-xs text-gray-600 mt-1">Haz clic para reproducir</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
