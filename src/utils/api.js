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
    // response.data ya contiene el JSON parseado.
    // El mapeo que tenías en el frontend para esta función (si lo había) se puede mantener.
    return response.data || []; // Devuelve array vacío si no hay datos
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
  const relativePath = "/api/videos";
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
  const relativePath = "/api/videos";
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
  const relativePath = "/api/videos/sections"; // Asumiendo esta es la ruta correcta
  console.log(`API (fetchMainMovieSections - axios): GET ${relativePath}`);
  // Si esta ruta requiere autenticación, axiosInstance añadirá el token.
  // Si es pública, simplemente no se añadirá.
  try {
    const response = await axiosInstance.get(relativePath);
    return response.data || [];
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al obtener secciones de VOD.";
    console.error(`API Error (fetchMainMovieSections - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

/* =================== DESTACADOS - HOME =================== */

export async function fetchFeaturedChannels() {
  const relativePath = "/api/channels/featured"; // Usando la ruta de tu último api.js
  console.log(`API (fetchFeaturedChannels - axios): GET ${relativePath}`);
  try {
    const response = await axiosInstance.get(relativePath);
    const data = response.data;
    if (!Array.isArray(data)) {
        console.warn(`API (fetchFeaturedChannels - axios): La respuesta no fue un array, fue:`, data);
        return [];
    }
    return data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al cargar canales destacados.";
    console.error(`API Error (fetchFeaturedChannels - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function fetchFeaturedMovies() {
  const relativePath = "/api/videos/featured"; // Usando la ruta de tu último api.js
  const params = { type: "pelicula" };
  console.log(`API (fetchFeaturedMovies - axios): GET ${relativePath} con params:`, params);
  try {
    const response = await axiosInstance.get(relativePath, { params });
    const data = response.data;
    if (!Array.isArray(data)) {
        console.warn(`API (fetchFeaturedMovies - axios): La respuesta no fue un array, fue:`, data);
        return [];
    }
    return data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Error al cargar películas destacadas.";
    console.error(`API Error (fetchFeaturedMovies - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function fetchFeaturedSeries() {
  const relativePath = "/api/videos/featured"; // Usando la ruta de tu último api.js
  const params = { type: "serie" };
  console.log(`API (fetchFeaturedSeries - axios): GET ${relativePath} con params:`, params);
  try {
    const response = await axiosInstance.get(relativePath, { params });
    const data = response.data;
    if (!Array.isArray(data)) {
        console.warn(`API (fetchFeaturedSeries - axios): La respuesta no fue un array, fue:`, data);
        return [];
    }
    return data;
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
// Para las funciones de Admin, axiosInstance añadirá el token automáticamente.
// El backend es quien debe verificar si el token es válido y si el usuario es Admin.

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
  console.log(`API (createAdminChannel - axios): POST ${relativePath}`);
  try {
    const response = await axiosInstance.post(relativePath, channelData); // axios se encarga de JSON.stringify
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al crear canal.";
    console.error(`API Error (createAdminChannel - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function updateAdminChannel(channelId, channelData) {
  const relativePath = `/api/channels/admin/${channelId}`;
  console.log(`API (updateAdminChannel - axios): PUT ${relativePath}`);
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
    // Para DELETE, a veces el backend devuelve 204 No Content (sin cuerpo JSON)
    // o un JSON con { message: "Eliminado" }.
    if (response.status === 204) return { message: "Canal eliminado correctamente." };
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Admin: Error al eliminar canal.";
    console.error(`API Error (deleteAdminChannel - axios): ${errorMsg}`, error.response?.data);
    throw new Error(errorMsg);
  }
}

export async function processM3UForAdmin(formData) {
  // Para FormData, axiosInstance también funciona. No se debe establecer Content-Type manualmente.
  const relativePath = "/api/channels/admin/process-m3u"; // Endpoint de ejemplo
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
  const relativePath = "/api/videos"; // Usando el endpoint que tenías en tu último api.js
  console.log(`API (createAdminVideo - axios): POST ${relativePath}`);
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
  console.log(`API (updateAdminVideo - axios): PUT ${relativePath}`);
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