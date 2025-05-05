import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-zinc-900 text-white px-4 py-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold flex items-center gap-1">
          <span className="text-blue-500">▶</span> TeamG <span className="text-purple-500">Play</span>
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* Añade esta condición para mostrar el enlace admin */}
              {user.role === "admin" && (
                <Link to="/admin" className="text-blue-400 hover:text-blue-300">
                  Panel Admin
                </Link>
              )}
              <span className="text-gray-300">{user.username}</span>
              <button
                onClick={logout}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}