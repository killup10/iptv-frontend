import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login as loginService } from "../services/AuthService";
import { useAuth } from "../utils/AuthContext";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user?.token) {
      navigate(location.state?.from || "/");
    }
  }, [user, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const deviceId = navigator.userAgent;
      const { token, role } = await loginService(username, password, deviceId);
      localStorage.setItem("token", token);
      login({ username, token, role });
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black bg-cover bg-center bg-no-repeat" 
         style={{ 
           backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(https://source.unsplash.com/random/1920x1080?movie)' 
         }}>
        
      <header className="py-6 px-12">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-red-600 font-bold text-4xl mr-1">T</span>
            <span className="text-white font-bold text-2xl">TeamG Play</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-black/80 p-8 sm:p-10 rounded-md w-full max-w-md">
          <h2 className="text-3xl font-bold text-white mb-6">Iniciar sesión</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-white text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Tu nombre de usuario"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Tu contraseña"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              ¿No tienes una cuenta? 
              <a href="#" className="ml-1 font-medium text-red-600 hover:text-red-500">
                Contacta con el administrador
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;