import React from "react";
import { Outlet } from "react-router-dom"; // Importa Outlet en lugar de Router, Routes, Route

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="p-4">
        <Outlet /> {/* Usa Outlet para renderizar las rutas hijas definidas en main.jsx */}
      </main>
    </div>
  );
}

export default App;