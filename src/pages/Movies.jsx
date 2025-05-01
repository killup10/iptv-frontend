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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {movies.map((movie) => (
          <Link
            key={movie.id}
            to={`/player/${movie.id}`}
            className="p-4 bg-white rounded-xl shadow hover:bg-gray-100 transition"
          >
            {movie.title}
          </Link>
        ))}
      </div>
    </div>
  );
};
