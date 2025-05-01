import React from "react";
import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <div className="p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a TeamG Play 🎬</h1>
      <p className="mb-6">Explora nuestro catálogo de películas y series en alta calidad.</p>

      <div className="flex justify-center gap-6">
        <Link to="/movies" className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow-lg hover:bg-blue-600 transition">
          Películas
        </Link>
        <Link to="/series" className="px-4 py-2 bg-green-500 text-white rounded-xl shadow-lg hover:bg-green-600 transition">
          Series
        </Link>
      </div>
    </div>
  );
};
