import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/AuthService.js";
import { useAuth } from "../utils/AuthContext.jsx";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const deviceId = navigator.userAgent;
      const { token, role } = await loginService(username, password, deviceId);
      localStorage.setItem("token", token);
      login({ username, token, role }); // ahora guarda también el rol
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="bg-[#1e1e2f] p-8 rounded-2xl shadow-xl w-full max-w-md text-white">
        <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          <span className="text-blue-500 text-4xl">▶</span> TeamG <span className="text-purple-500">Play</span>
        </h2>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#2c2c3c] border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-[#2c2c3c] border border-gray-600 focus:outline-none focus:border-purple-500"
              placeholder="Tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white py-2 rounded-lg font-semibold transition"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-400">
          ¿No tienes cuenta? <span className="text-blue-400">Contacta con el administrador</span>
        </p>
      </div>
    </div>
  );
}
