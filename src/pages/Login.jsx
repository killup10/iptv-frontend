import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login as loginService } from "../services/AuthService";
import { useAuth } from "../utils/AuthContext";
import { Eye, EyeOff, User, Lock } from "lucide-react"; // Descomentado para usar los iconos

// Componente InputField reutilizable
const InputField = ({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  icon, 
  disabled = false 
}) => (
  <div>
    <label htmlFor={id} className="block text-sm mb-1 font-medium text-gray-300">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-lg bg-[#2c2c3c]/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 transition-all`}
        placeholder={placeholder}
        required
        disabled={disabled}
        aria-label={label}
      />
    </div>
  </div>
);

// Componente PasswordField reutilizable
const PasswordField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  showPassword, 
  setShowPassword,
  disabled = false 
}) => (
  <div>
    <label htmlFor={id} className="block text-sm mb-1 font-medium text-gray-300">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Lock size={18} />
      </span>
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-10 py-3 rounded-lg bg-[#2c2c3c]/70 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 transition-all"
        placeholder={placeholder}
        required
        disabled={disabled}
        aria-label={label}
      />
      <button 
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();

  // Redireccionar si ya está autenticado
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
    // Aquí agregamos flex-col para asegurar que todo esté centrado verticalmente
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4">
      <div 
        className="bg-[#1e1e2f] p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md mx-auto text-white transition-all duration-300"
        role="dialog"
        aria-labelledby="login-title"
      >
        <div className="flex justify-center mb-6">
          <h2 id="login-title" className="text-3xl font-extrabold text-center flex items-center justify-center gap-2">
            <span className="text-blue-500 text-4xl">▶</span> TeamG <span className="text-purple-500">Play</span>
          </h2>
        </div>

        {error && (
          <div 
            className="bg-red-500/20 border border-red-500/50 text-red-300 text-sm p-3 rounded-lg mb-4 transition-all"
            role="alert"
          >
            <p className="text-center font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <InputField
            id="username"
            label="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Ingresa tu usuario"
            icon={<User size={18} />}
            disabled={isLoading}
          />
          
          <PasswordField
            id="password"
            label="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white py-3 rounded-lg font-semibold transition duration-200 transform hover:scale-[1.01] active:scale-[0.99] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Iniciando sesión...</span>
              </span>
            ) : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700/50">
          <p className="text-center text-sm text-gray-400">
            ¿No tienes cuenta? <span className="text-blue-400 font-medium hover:text-blue-300 cursor-pointer transition-colors">Contacta con el administrador</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;