// iptv-frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Animes from "./pages/Animes.jsx";
import Documentales from "./pages/Documentales.jsx";
import Doramas from "./pages/Doramas.jsx";
import Novelas from "./pages/Novelas.jsx";

function App() {
  console.log('[App.jsx] Renderizando AppLayout (App.jsx)...'); // LOG AÑADIDO
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Loguear estado del usuario y ubicación para depuración
  useEffect(() => {
    console.log('[App.jsx] Estado del usuario:', user);
    console.log('[App.jsx] Ubicación actual:', location.pathname);
  }, [user, location.pathname]);

  // Verificar si estamos en una página de autenticación
  const isAuthPage = !user && (location.pathname === "/login" || location.pathname.startsWith("/register"));
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Detectar scroll para cambiar el fondo del header
  useEffect(() => {
    if (isAuthPage) {
      setScrolled(false); // Asegurar que no haya fondo de scroll en páginas de auth
      return;
    }

    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    console.log('[App.jsx] Añadiendo event listener para scroll.');
    window.addEventListener('scroll', handleScroll);
    return () => {
      console.log('[App.jsx] Eliminando event listener para scroll.');
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled, isAuthPage]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("#user-menu")) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    console.log('[App.jsx] Ejecutando handleLogout...');
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {!isAuthPage && (
        <header 
          className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
            scrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-transparent'
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Logo y Navegación Principal */}
              <div className="flex items-center flex-1">
                <Link to="/" className="flex items-center">
                  <span className="text-red-600 font-bold text-2xl mr-1">T</span>
                  <span className="text-white font-bold text-xl">eamG Play</span>
                </Link>
                
                <nav className="hidden md:flex ml-10 space-x-4">
                  <Link to="/" className="text-gray-300 hover:text-white px-3 py-2">Inicio</Link>
                  <Link to="/tv" className="text-gray-300 hover:text-white px-3 py-2">TV en Vivo</Link>
                  <Link to="/peliculas" className="text-gray-300 hover:text-white px-3 py-2">Películas</Link>
                  <Link to="/series" className="text-gray-300 hover:text-white px-3 py-2">Series</Link>
                  <Link to="/animes" className="text-gray-300 hover:text-white px-3 py-2">Animes</Link>
                  <Link to="/doramas" className="text-gray-300 hover:text-white px-3 py-2">Doramas</Link>
                  <Link to="/novelas" className="text-gray-300 hover:text-white px-3 py-2">Novelas</Link>
                  <Link to="/documentales" className="text-gray-300 hover:text-white px-3 py-2">Documentales</Link>
                </nav>
              </div>

              {/* Menú de Usuario */}
              <div className="flex items-center">
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                
                <div className="relative" id="user-menu">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  >
                    <span className="sr-only">Abrir menú de usuario</span>
                    <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`flex-grow ${!isAuthPage ? 'pt-16' : ''}`}>
        <Outlet />
      </main>

      {!isAuthPage && (
        <footer className="bg-black text-gray-500 py-8 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between">
              <div className="mb-6 md:mb-0">
                <span className="text-red-600 font-bold text-2xl mr-1">T</span>
                <span className="text-white font-bold text-xl">TeamG Play</span>
                <p className="mt-2 max-w-md">La mejor plataforma de streaming para disfrutar de canales en vivo, películas, series y mas.</p>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6">
                <div>
                  <h3 className="text-white font-medium mb-2">Explorar</h3>
                  <ul className="space-y-2">
                    <li><Link to="/" className="hover:text-white transition">Inicio</Link></li>
                    <li><Link to="/tv" className="hover:text-white transition">TV en Vivo</Link></li>
                    <li><Link to="/movies" className="hover:text-white transition">VOD</Link></li> {/* Considera si esto debería ser /movies y /series */}
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Legal</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:text-white transition">Términos</a></li>
                    <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-2">Contacto</h3>
                  <ul className="space-y-2">
                    <li><a href="#" className="hover:text-white transition">Soporte</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-800 pt-8 text-center">
              <p>© {new Date().getFullYear()} TeamG Play. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
