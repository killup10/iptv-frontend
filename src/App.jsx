import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./utils/AuthContext.jsx";

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // No mostrar el encabezado en la página de login o registro
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!isAuthPage && (
        <header className="bg-blue-800 text-white py-4 shadow">
          <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">TeamG Play</h1>
            {user ? (
              <>
                <nav className="space-x-4">
                  <Link to="/" className="hover:underline">Inicio</Link>
                  <Link to="/" className="hover:underline">Películas</Link>
                  <Link to="/" className="hover:underline">Series</Link>
                  <Link to="/" className="hover:underline">TV en Vivo</Link>
                  {user?.role === "admin" && (
                    <>
                      <Link to="/admin" className="hover:underline">Admin</Link>
                      <Link to="/admin" className="hover:underline">Subir M3U</Link>
                      <Link to="/admin" className="hover:underline">Contenido</Link>
                    </>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Salir
                  </button>
                </nav>
              </>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </header>
      )}
      
      <main className="container mx-auto p-4">
        <Outlet />
      </main>

      {!isAuthPage && (
        <footer className="bg-gray-800 text-center p-4 text-white mt-auto">
          <p>© {new Date().getFullYear()} TeamG Play - Todos los derechos reservados</p>
        </footer>
      )}
    </div>
  );
}

export default App;