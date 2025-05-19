// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
// Importa la función 'login' desde tu AuthService unificado
import { login as authServiceLogin } from "../utils/AuthService.js";

export function Login() {
  // Renombramos 'login' de AuthContext para evitar colisión de nombres
  const { login: loginContexto } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // 'from' es la ruta a la que el usuario intentaba acceder antes de ser redirigido a login
  const from = location.state?.from?.pathname || "/"; // Asegúrate que location.state.from es un objeto con pathname

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // La variable de entorno VITE_API_URL ahora se usa directamente dentro de AuthService.js
  // por lo que no es necesario definir baseUrl aquí.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!username || !password) {
      setError("Por favor, completa todos los campos.");
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Login.jsx: Llamando a authServiceLogin para el usuario: ${username}`);
      // Llama a la función login de tu servicio de autenticación.
      // authServiceLogin ya maneja deviceId y la URL completa de la API.
      const backendResponse = await authServiceLogin(username, password);

      // Se espera que backendResponse sea un objeto como:
      // { token: "EL_TOKEN", user: { username: "...", role: "...", plan: "..." } }
      // Esta es la estructura que la función login de tu AuthContext espera.
      console.log("Login.jsx: Datos recibidos del backend para AuthContext:", backendResponse);
      loginContexto(backendResponse); // Llama a la función login del AuthContext

      console.log("Login.jsx: Login exitoso, redirigiendo a:", from);
      navigate(from, { replace: true });

    } catch (err) {
      console.error("Login.jsx: Error durante el proceso de login:", err);
      // 'err' aquí será el error lanzado por AuthService (que a su vez puede ser de axios)
      // err.error (si el backend devuelve un objeto {error: 'mensaje'}) o err.message
      const errorMessage = err.error || err.message || "Ocurrió un error desconocido durante el inicio de sesión.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Fondo con imagen */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-sm"
        style={{ backgroundImage: "url('/bg-login-placeholder.jpg')" }} // Asegúrate que esta imagen exista en tu carpeta public/
      ></div>

      {/* Contenido del formulario */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-sm bg-zinc-900/90 p-8 rounded-lg shadow-xl">
          <div className="flex justify-center mb-6">
            {/* Puedes poner tu logo aquí si tienes uno */}
            <span className="text-white font-bold text-3xl">
              <span className="text-red-600">T</span>eamG Play
            </span>
          </div>
          <h2 className="text-xl font-semibold text-white text-center mb-6">
            Iniciar sesión
          </h2>
          {error && (
            <p className="text-red-400 text-sm mb-4 text-center bg-red-900/40 p-3 rounded-md border border-red-700">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                placeholder="Tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-zinc-800 text-white placeholder-gray-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                required
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-zinc-800 text-white placeholder-gray-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition duration-200 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </div>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
          {/*
          <p className="mt-6 text-center text-sm text-gray-400">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="font-medium text-red-500 hover:text-red-400 hover:underline">
              Regístrate aquí
            </Link>
          </p>
          */}
        </div>
      </div>
    </div>
  ); // Fin del return del componente
} // <--- ESTA ES LA LLAVE DE CIERRE DE LA FUNCIÓN DEL COMPONENTE Login

// No olvides la exportación por defecto si es tu forma de exportar principal para esta página.
// Si ya usas 'export function Login()', esta línea de abajo podría no ser estrictamente necesaria
// si en tus rutas importas { Login } from './pages/Login.jsx'.
// Sin embargo, es común tenerla.
export default Login;