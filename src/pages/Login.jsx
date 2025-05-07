// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    const fakeToken = "123456";
    const role = username === "admin" ? "admin" : "user";

    login({ username, token: fakeToken, role });
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Iniciar sesión
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 rounded bg-zinc-800 text-white placeholder-gray-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-netflixred"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 pr-10 rounded bg-zinc-800 text-white placeholder-gray-400 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-netflixred"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-400">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              Recordarme
            </label>
            <a href="#" className="hover:text-white">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded bg-netflixred hover:bg-red-700 text-white font-medium transition duration-200"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
