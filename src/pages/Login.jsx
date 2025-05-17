// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; // Asegúrate que la ruta sea correcta

export function Login() {
  const { login } = useAuth(); // De AuthContext
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/"; // Ruta a la que redirigir después del login

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const baseUrl = import.meta.env.VITE_API_URL;
  if (!baseUrl) {
    console.error("CRITICAL: VITE_API_URL no está definida en el frontend. El login fallará. Verifica tu archivo .env o la configuración de Vercel.");
    // Podrías querer mostrar un error más visible al usuario aquí si baseUrl no está definida.
  }
  const loginEndpoint = `${baseUrl}/api/auth/login`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    if (!username || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    const deviceId = navigator.userAgent; // Obtener deviceId

    try {
      console.log(`Login.jsx: Enviando login a ${loginEndpoint} para usuario: ${username}`);
      const response = await fetch(loginEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, deviceId }), // Enviar deviceId si tu backend lo usa
      });

      const responseText = await response.text(); // Leer respuesta como texto primero
      let responseData;

      try {
        responseData = JSON.parse(responseText); // Intentar parsear como JSON
      } catch (parseError) {
        console.error("Login.jsx: Error al parsear respuesta JSON del servidor:", responseText, parseError);
        setError(`Error al procesar la respuesta del servidor. Detalles: ${responseText.substring(0, 200)}`);
        return;
      }

      if (!response.ok) {
        // Si la respuesta del servidor no es 2xx, lanzar error con mensaje del backend
        console.error("Login.jsx: Respuesta no exitosa del backend:", response.status, responseData);
        throw new Error(responseData.error || responseData.message || `Error de autenticación (${response.status})`);
      }

      // En este punto, response.ok es true y responseData es el JSON del backend.
      // Según tu backend (auth.controller.js), responseData tiene la forma:
      // { token: "EL_TOKEN", user: { username: "...", role: "...", plan: "..." } }
      // Esta es la estructura que AuthContext.jsx espera.

      console.log("Login.jsx: Datos recibidos del backend para AuthContext:", responseData);
      login(responseData); // <--- CORRECCIÓN: Pasar 'responseData' directamente a la función login del AuthContext

      console.log("Login.jsx: Login exitoso, redirigiendo a:", from);
      navigate(from, { replace: true });

    } catch (err) {
      console.error("Login.jsx: Error durante el proceso de login:", err);
      setError(err.message || "Ocurrió un error desconocido durante el inicio de sesión.");
    }
  };

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-sm"
        style={{ backgroundImage: "url('/bg-login-placeholder.jpg')" }}
      ></div>
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-sm bg-zinc-900/90 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Iniciar sesión
          </h2>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center bg-red-900/30 p-2 rounded">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded bg-zinc-800 text-white placeholder-gray-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
              autoComplete="username"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-zinc-800 text-white placeholder-gray-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="w-full py-2 rounded bg-red-600 hover:bg-red-700 text-white font-medium transition duration-200"
            >
              Entrar
            </button>
          </form>
          {/* Si tienes una página de registro, puedes descomentar esto */}
          {/* <p className="mt-4 text-center text-sm text-gray-400">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-red-500 hover:underline">
              Regístrate
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}

export default Login;