import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../utils/AuthService"; // 👈 Importamos del servicio

export const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register(username, password); // 👈 usamos AuthService
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Crear Cuenta</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition"
          >
            Registrarse
          </button>
        </form>
        <p className="mt-4 text-center">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
};
