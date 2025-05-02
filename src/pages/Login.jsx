import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/AuthService.js";  // Ajusta ruta si tu archivo está en /src/services
import { useAuth } from "../utils/AuthContext.jsx";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();    // <-- traemos la función de contexto

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const deviceId = navigator.userAgent;
      // Llamamos al servicio que hace el fetch al backend
      const { token } = await loginService(username, password, deviceId);

      // 1) guardamos el token en localStorage (para usarlo en peticiones)
      localStorage.setItem("token", token);

      // 2) actualizamos el contexto de Auth con algún dato de usuario
      login({ username, token });

      // 3) redirigimos a la ruta privada principal ("/")
      navigate("/");
    } catch (err) {
      // err.message ya contiene el texto que lanzamos en AuthService
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar sesión</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          Entrar
        </button>

        <p className="mt-4 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-blue-500 hover:underline">Regístrate</a>
        </p>
      </form>
    </div>
  );
}
