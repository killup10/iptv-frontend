import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { Home, Film, Tv, PlayCircle, PanelLeft, LogOut, User } from "lucide-react";

export function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // No mostrar la barra de navegación en la página de login o registro
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="bg-[#1a1a2e] text-white px-4 py-3 shadow-lg border-b border-gray-800 fixed top-0 w-full z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-1">
          <span className="text-blue-500 text-2xl">▶</span> TeamG <span className="text-purple-500">Play</span>
        </Link>

        {user && (
          <div className="hidden md:flex items-center space-x-6 text-sm">
            <Link to="/" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-gray-800">
              <Home size={18} className="text-blue-400" />
              <span>Inicio</span>
            </Link>
            <Link to="/movies" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-gray-800">
              <Film size={18} className="text-blue-400" />
              <span>Películas</span>
            </Link>
            <Link to="/series" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-gray-800">
              <Tv size={18} className="text-blue-400" />
              <span>Series</span>
            </Link>
            <Link to="/iptv" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-gray-800">
              <PlayCircle size={18} className="text-blue-400" />
              <span>TV en vivo</span>
            </Link>
          </div>
        )}

        <div className="flex items-center space-x-3">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 px-2 py-1 rounded-md hover:bg-gray-800">
                  <PanelLeft size={18} />
                  <span className="hidden sm:inline">Panel Admin</span>
                </Link>
              )}
              
              <span className="hidden sm:flex items-center text-gray-300 bg-gray-800/50 px-2 py-1 rounded-md">
                <User size={18} className="mr-1.5 text-gray-400" />
                {user.username}
              </span>
              
              <button
                onClick={logout}
                className="flex items-center gap-1.5 bg-red-600/80 hover:bg-red-700 px-3 py-1.5 rounded-md transition-colors text-sm font-medium"
                aria-label="Cerrar sesión"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              <User size={18} />
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;