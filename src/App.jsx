// iptv-frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

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

  const isAuthPage = location.pathname.startsWith("/login") || location.pathname.startsWith("/register");
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
        <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-black' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center mr-10">
                <span className="text-white font-bold text-2xl">
                  <span className="text-red-600">T</span>eamG Play
                </span>
              </Link>

              {user && (
                <nav className="hidden md:flex space-x-6">
                  <Link to="/" className="text-gray-300 hover:text-white transition">Inicio</Link>
                  <Link to="/tv" className="text-gray-300 hover:text-white transition">TV en Vivo</Link>
                  <Link to="/movies" className="text-gray-300 hover:text-white transition">Películas</Link>
                  <Link to="/series" className="text-gray-300 hover:text-white transition">Series</Link>
                </nav>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user?.role === "admin" && (
                <Link to="/admin" className="text-gray-300 hover:text-white transition">Admin</Link>
              )}

              {user ? (
                <div className="relative" id="user-menu">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center text-white">
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-gray-800 rounded shadow-lg z-50">
                      <div className="px-4 py-3 text-sm text-gray-300 border-b border-gray-800">
                        <div className="font-medium">{user.username}</div>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-red-600 hover:text-white transition"
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-red-600 px-4 py-1 rounded text-white hover:bg-red-700 transition">
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <main className={`flex-grow ${!isAuthPage ? 'pt-16 md:pt-20' : ''}`}> {/* Ajuste de padding-top responsivo */}
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
