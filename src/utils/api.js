// src/utils/api.js
import axiosInstance from './axiosInstance.js'; // O usa el alias: import axiosInstance from '@/utils/axiosInstance.js';

// La función getAuthHeaders() ya no es necesaria aquí,
// el interceptor en axiosInstance.js se encarga de añadir el token.

/* =================== TV EN VIVO - USUARIO =================== */

// Listar canales filtrados por sección
export async function fetchUserChannels(sectionName = "Todos") {
  const relativePath = "/api/channels/list";
  const params = {};
  if (sectionName && sectionName.toLowerCase() !== 'todos') {
    params.section = sectionName;
  }
  console.log(`API (fetchUserChannels - axios): GET ${relativePath} con params:`, params);
  try {
    const response = await axiosInstance.get(relativePath, { params });
    // El mapeo que tenías para transformar la data de canales se puede mantener aquí si es necesario
    // o hacerlo en el componente que consume esta función. Por simplicidad, devolvemos la data cruda.
    return response.data || [];
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al cargar canales.";
    console.error(`API Error (fetchUserChannels - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

// Obtener secciones/categorías para filtros
export async function fetchChannelFilterSections() {
  const relativePath = "/api/channels/sections";
  console.log(`API (fetchChannelFilterSections - axios): GET ${relativePath}`);
  try {
    const response = await axiosInstance.get(relativePath);
    return response.data || [];
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al cargar categorías de filtro.";
    console.error(`API Error (fetchChannelFilterSections - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

// Obtener canal específico por ID (para reproducir)
export async function fetchChannelForPlayback(channelId) {
  const relativePath = `/api/channels/id/${channelId}`;
  console.log(`API (fetchChannelForPlayback - axios): GET ${relativePath}`);
  try {
    const response = await axiosInstance.get(relativePath);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al obtener datos del canal.";
    console.error(`API Error (fetchChannelForPlayback - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

/* =================== VOD - USUARIO =================== */

export async function fetchUserMovies() {
  const relativePath = "/api/videos"; // Esta ruta en tu backend usa verifyToken
  const params = { tipo: "pelicula" };
  console.log(`API (fetchUserMovies - axios): GET ${relativePath} con params:`, params);
  try {
    const response = await axiosInstance.get(relativePath, { params });
    return response.data || [];
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al obtener películas.";
    console.error(`API Error (fetchUserMovies - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function fetchUserSeries() {
  const relativePath = "/api/videos"; // Esta ruta en tu backend usa verifyToken
  const params = { tipo: "serie" };
  console.log(`API (fetchUserSeries - axios): GET ${relativePath} con params:`, params);
  try {
    const response = await axiosInstance.get(relativePath, { params });
    return response.data || [];
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al obtener series.";
    console.error(`API Error (fetchUserSeries - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function fetchMainMovieSections() {
  const relativePath = "/api/videos/main-sections"; // Esta ruta en tu backend usa verifyToken
  console.log(`API (fetchMainMovieSections - axios): GET ${relativePath}`);
  try {
    const response = await axiosInstance.get(relativePath);
    return response.data || [];
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al obtener secciones de VOD.";
    console.error(`API Error (fetchMainMovieSections - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

/* =================== DESTACADOS - HOME (RUTAS PÚBLICAS CORREGIDAS) =================== */

export async function fetchFeaturedChannels() {
  // Llama a la ruta pública /api/channels/list con el filtro ?featured=true
  // Tu backend en channels.routes.js tiene router.get("/list", getPublicChannels);
  // y getPublicChannels en channel.controller.js debería manejar este query param.
  const relativePath = "/api/channels/list";
  const params = { featured: "true" }; // El backend debe interpretar este 'true'
  console.log(`API (fetchFeaturedChannels - axios): GET ${relativePath} con params:`, params);
  try {
    const response = await axiosInstance.get(relativePath, { params });
    const data = response.data;
    if (!Array.isArray(data)) {
        console.warn(`API (fetchFeaturedChannels - axios): La respuesta no fue un array, fue:`, data);
        return [];
    }
    return data; // Asumimos que el backend ya devuelve el formato necesario o el mapeo se hace en Home.jsx
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al cargar canales destacados.";
    console.error(`API Error (fetchFeaturedChannels - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function fetchFeaturedMovies() {
  // Llama a la ruta pública /api/videos/public/featured-movies
  // Tu backend en videos.routes.js tiene esta ruta definida sin verifyToken.
  const relativePath = "/api/videos/public/featured-movies";
  console.log(`API (fetchFeaturedMovies - axios): GET ${relativePath}`);
  try {
    const response = await axiosInstance.get(relativePath);
    const data = response.data;
    if (!Array.isArray(data)) {
        console.warn(`API (fetchFeaturedMovies - axios): La respuesta no fue un array, fue:`, data);
        return [];
    }
    return data; // Asumimos que el backend ya devuelve el formato necesario o el mapeo se hace en Home.jsx
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al cargar películas destacadas.";
    console.error(`API Error (fetchFeaturedMovies - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function fetchFeaturedSeries() {
  // Llama a la ruta pública /api/videos/public/featured-series
  // Tu backend en videos.routes.js tiene esta ruta definida sin verifyToken.
  const relativePath = "/api/videos/public/featured-series";
  console.log(`API (fetchFeaturedSeries - axios): GET ${relativePath}`);
  try {
    const response = await axiosInstance.get(relativePath);
    const data = response.data;
    if (!Array.isArray(data)) {
        console.warn(`API (fetchFeaturedSeries - axios): La respuesta no fue un array, fue:`, data);
        return [];
    }
    return data; // Asumimos que el backend ya devuelve el formato necesario o el mapeo se hace en Home.jsx
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al cargar series destacadas.";
    console.error(`API Error (fetchFeaturedSeries - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

/* =================== AUTENTICACIÓN =================== */
// Las funciones loginUser y registerUser han sido eliminadas de aquí.
// Por favor, utiliza las funciones 'login' y 'register' de 'src/utils/AuthService.js',
// que ya han sido configuradas para usar axiosInstance.

/* =================== ADMIN - CANALES =================== */

export async function fetchAdminChannels() {
  const relativePath = "/api/channels/admin/list";
  console.log(`API (fetchAdminChannels - axios): GET ${relativePath}`);
  try {
    const response = await axiosInstance.get(relativePath);
    return response.data || [];
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al cargar canales.";
    console.error(`API Error (fetchAdminChannels - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function createAdminChannel(channelData) {
  const relativePath = "/api/channels/admin"; // o /api/channels/admin/create si ese es tu endpoint exacto
  console.log(`API (createAdminChannel - axios): POST ${relativePath} con data:`, channelData);
  try {
    const response = await axiosInstance.post(relativePath, channelData);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al crear canal.";
    console.error(`API Error (createAdminChannel - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function updateAdminChannel(channelId, channelData) {
  const relativePath = `/api/channels/admin/${channelId}`;
  console.log(`API (updateAdminChannel - axios): PUT ${relativePath} con data:`, channelData);
  try {
    const response = await axiosInstance.put(relativePath, channelData);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al actualizar canal.";
    console.error(`API Error (updateAdminChannel - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function deleteAdminChannel(channelId) {
  const relativePath = `/api/channels/admin/${channelId}`;
  console.log(`API (deleteAdminChannel - axios): DELETE ${relativePath}`);
  try {
    const response = await axiosInstance.delete(relativePath);
    if (response.status === 204) return { message: "Canal eliminado correctamente." };
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al eliminar canal.";
    console.error(`API Error (deleteAdminChannel - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function processM3UForAdmin(formData) {
  const relativePath = "/api/channels/admin/process-m3u";
  console.log(`API (processM3UForAdmin - axios): POST ${relativePath}`);
  try {
    const response = await axiosInstance.post(relativePath, formData, {
      headers: {
        // 'Content-Type': 'multipart/form-data' // Axios lo establece automáticamente para FormData
      }
    });
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al procesar M3U.";
    console.error(`API Error (processM3UForAdmin - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

/* =================== ADMIN - VIDEOS (VOD) =================== */

export async function fetchAdminVideos() {
  const relativePath = "/api/videos";
  const params = { view: "admin" };
  console.log(`API (fetchAdminVideos - axios): GET ${relativePath} con params:`, params);
  try {
    const response = await axiosInstance.get(relativePath, { params });
    return response.data || [];
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al cargar VODs.";
    console.error(`API Error (fetchAdminVideos - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function createAdminVideo(videoData) {
  // CORRECCIÓN: Apuntar al endpoint correcto definido en videos.routes.js del backend
  const relativePath = "/api/videos/upload-link"; 
  console.log(`API (createAdminVideo - axios): POST ${relativePath} con data:`, videoData);
  try {
    const response = await axiosInstance.post(relativePath, videoData);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al crear VOD.";
    console.error(`API Error (createAdminVideo - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function updateAdminVideo(videoId, videoData) {
  const relativePath = `/api/videos/${videoId}`;
  console.log(`API (updateAdminVideo - axios): PUT ${relativePath} con data:`, videoData);
  try {
    const response = await axiosInstance.put(relativePath, videoData);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al actualizar VOD.";
    console.error(`API Error (updateAdminVideo - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function deleteAdminVideo(videoId) {
  const relativePath = `/api/videos/${videoId}`;
  console.log(`API (deleteAdminVideo - axios): DELETE ${relativePath}`);
  try {
    const response = await axiosInstance.delete(relativePath);
    if (response.status === 204) return { message: "VOD eliminado correctamente." };
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al eliminar VOD.";
    console.error(`API Error (deleteAdminVideo - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}
