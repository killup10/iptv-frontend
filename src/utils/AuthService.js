// src/utils/AuthService.js
import axiosInstance from "./axiosInstance.js"; // <--- CAMBIO: Importa tu instancia configurada

// API_URL ya no es necesaria aquí si la baseURL está en axiosInstance
// const API_URL = import.meta.env.VITE_API_URL;

export const login = async (username, password) => {
  const deviceId = navigator.userAgent;
  // La ruta es relativa porque baseURL ya está en axiosInstance
  const loginPath = "/api/auth/login";
  console.log(`AuthService: Intentando login para ${username} en ${loginPath} (usando axiosInstance)`);
  try {
    const response = await axiosInstance.post(loginPath, { // <--- CAMBIO: Usa axiosInstance
      username,
      password,
      deviceId,
    });
    return response.data;
  } catch (error) {
    // El interceptor de axiosInstance ya habrá manejado errores 401/403 globalmente
    // y redirigido si es necesario. Aquí podemos loguear el error específico de esta llamada
    // y el error que se re-lanza desde el interceptor será capturado por Login.jsx.
    console.error("Error en AuthService - login (después de interceptores):", error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || "Error desconocido en el servicio de login.");
  }
};

export const register = async (username, password) => {
  const registerPath = "/api/auth/register";
  console.log(`AuthService: Intentando registro para ${username} en ${registerPath} (usando axiosInstance)`);
  try {
    const response = await axiosInstance.post(registerPath, { // <--- CAMBIO: Usa axiosInstance
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error en AuthService - register (después de interceptores):", error.response?.data || error.message);
    throw error.response?.data || new Error(error.message || "Error desconocido en el servicio de registro.");
  }
};