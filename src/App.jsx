import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./utils/AuthContext.jsx";

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      {!isAuthPage && (
        <header className="bg-[#1E1E1E] text-white py-3 shadow-lg border-b border-[#333333]">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="bg-[#8B5CF6] text-white p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </span>
              <h1 className="text-2xl font-bold">
                <span className="text-white">TeamG</span> 
                <span className="text-[#8B5CF6]">Play</span>
              </h1>
            </div>
            
            {user && (
              <nav className="hidden md:flex space-x-6">
                <Link to="/" className="text-gray-300 hover:text-white hover:underline transition-colors">
                  Inicio
                </Link>
                <Link to="/" className="text-gray-300 hover:text-white hover:underline transition-colors">
                  Películas
                </Link>
                <Link to="/" className="text-gray-300 hover:text-white hover:underline transition-colors">
                  Series
                </Link>
                <Link to="/" className="text-gray-300 hover:text-white hover:underline transition-colors">
                  TV en Vivo
                </Link>
                {user?.role === "admin" && (
                  <Link to="/admin" className="text-gray-300 hover:text-white hover:underline transition-colors">
                    Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="bg-[#8B5CF6] px-4 py-1 rounded text-white hover:bg-[#7C3AED] transition-colors"
                >
                  Salir
                </button>
              </nav>
            )}
            
            {/* Versión móvil del menú */}
            {user && (
              <div className="md:hidden">
                <button className="text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}
            
            {!user && (
              <Link 
                to="/login" 
                className="px-4 py-2 bg-[#8B5CF6] rounded-md hover:bg-[#7C3AED] transition-colors"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </header>
      )}
      
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>

      {!isAuthPage && (
        <footer className="bg-[#1E1E1E] text-center p-4 text-gray-400 border-t border-[#333333]">
          <p>© {new Date().getFullYear()} TeamG Play - Todos los derechos reservados</p>
        </footer>
      )}
    </div>
  );
}

export default App;