// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { login as authServiceLogin } from "../utils/AuthService.js";
import ErrorBoundary from "../components/ErrorBoundary";

// Componente interno que maneja la lógica de login
function LoginForm() {
  const { login: loginContexto } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const backendResponse = await authServiceLogin(username, password);
      console.log("Login.jsx: Datos recibidos del backend para AuthContext:", backendResponse);
      await loginContexto(backendResponse);
      console.log("Login.jsx: Login exitoso, redirigiendo a:", from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login.jsx: Error durante el proceso de login:", err);
      setError(err.message || "Ocurrió un error desconocido durante el inicio de sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-sm"
        style={{ backgroundImage: "url('/bg-login-placeholder.jpg')" }}
      ></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-sm bg-zinc-900/90 p-8 rounded-lg shadow-xl">
          <div className="flex justify-center mb-6">
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
        </div>
      </div>
    </div>
  );
}

// Componente principal que envuelve LoginForm con ErrorBoundary
export function Login() {
  return (
    <ErrorBoundary>
      <LoginForm />
    </ErrorBoundary>
  );
}

export default Login;
