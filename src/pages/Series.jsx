import React, { useState } from "react";
import { Link } from "react-router-dom";

export const Series = () => {
  const [activeSection, setActiveSection] = useState("todas");

  // Simulación de series por categorías
  const series = {
    todas: [
      { id: "1", title: "Serie 1", category: "general" },
      { id: "2", title: "Serie Infantil 1", category: "kids" },
    ],
    kids: [
      { id: "2", title: "Serie Infantil 1", category: "kids" },
      { id: "3", title: "Serie Infantil 2", category: "kids" },
    ]
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Series</h1>
      
      {/* Tabs de categorías */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveSection("todas")}
          className={`px-4 py-2 rounded-lg ${
            activeSection === "todas"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Todas las Series
        </button>
        <button
          onClick={() => setActiveSection("kids")}
          className={`px-4 py-2 rounded-lg ${
            activeSection === "kids"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          ZONA KIDS
        </button>
      </div>

      {/* Lista de series */}
      <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
        {series[activeSection]?.map((serie) => (
          <Link
            key={serie.id}
            to={`/series/${serie.id}`}
            className="p-4 bg-white rounded-xl shadow hover:bg-gray-100 transition flex items-center"
          >
            <div className="w-16 h-24 bg-gray-200 rounded-lg mr-4"></div>
            <div>
              <h3 className="font-semibold">{serie.title}</h3>
              <p className="text-sm text-gray-600">
                {serie.category === "kids" ? "ZONA KIDS" : "Serie General"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
