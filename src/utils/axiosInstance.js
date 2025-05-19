// src/utils/axiosInstance.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // Tu URL base del backend
});

// --- Interceptor de Petición (Request) ---
// Se ejecuta ANTES de que cada petición sea enviada.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Si tenemos un token, lo añadimos a la cabecera Authorization
      config.headers.Authorization = `Bearer ${token}`;
      console.log("axiosInstance: Token añadido a la cabecera de la petición.");
    } else {
      console.log("axiosInstance: No hay token en localStorage para añadir a la petición.");
    }
    return config; // Continúa con la petición
  },
  (error) => {
    // Manejar errores de configuración de la petición
    console.error("axiosInstance: Error en la configuración de la petición:", error);
    return Promise.reject(error);
  }
);

// --- Interceptor de Respuesta (Response) ---
// Se ejecuta DESPUÉS de recibir una respuesta del backend.
axiosInstance.interceptors.response.use(
  (response) => {
    // Cualquier código de estado que este dentro del rango de 2xx
    // hace que esta función se active. Simplemente devolvemos la respuesta.
    return response;
  },
  (error) => {
    // Cualquier código de estado que caiga fuera del rango de 2xx
    // hace que esta función se active.
    console.error("axiosInstance: Error en la respuesta del backend:", error.response || error.message);

    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      const { status, data } = error.response;

      if (status === 401 || status === 403) {
        // 401 (No Autorizado) o 403 (Prohibido) usualmente indican
        // que el token no es válido, ha expirado, o el usuario no tiene permisos.
        console.warn(`axiosInstance: Error ${status} detectado. Mensaje:`, data?.error || data?.message);
        console.log("axiosInstance: Deslogueando usuario debido a error de autenticación/autorización.");

        // Limpiar el estado de autenticación
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        // Redirigir a la página de login
        // Es importante evitar bucles si ya estamos en /login o si el error ocurre en /login
        if (!window.location.pathname.startsWith('/login')) {
          // Puedes pasar un parámetro para indicar por qué se redirigió
          window.location.href = '/login?session_expired=true';
        }
        // No es necesario llamar a logout() del AuthContext aquí directamente,
        // ya que la recarga de la página y la limpieza del localStorage
        // harán que AuthContext se inicialice sin usuario.
      }
    } else if (error.request) {
      // La petición se hizo pero no se recibió respuesta (ej. problema de red)
      console.error("axiosInstance: No se recibió respuesta del servidor:", error.request);
    } else {
      // Algo sucedió al configurar la petición que provocó un error
      console.error('axiosInstance: Error al configurar la petición:', error.message);
    }

    // Importante: re-lanzar el error para que la lógica del .catch()
    // en el lugar donde se hizo la llamada original (ej. en AuthService o api.js)
    // también pueda manejarlo si es necesario (mostrar un mensaje al usuario, etc.).
    return Promise.reject(error);
  }
);

export default axiosInstance;