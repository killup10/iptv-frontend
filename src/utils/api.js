// src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Funciones para obtener Headers de Autenticación ---
function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem("token"); // Obtener el token MÁS ACTUAL
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'; // Default a JSON
  }
  // No poner Content-Type si es FormData, el navegador lo hace con el boundary correcto.

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// --- Funciones para Contenido de USUARIO (Requieren autenticación) ---

export async function fetchUserChannels() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchUserChannels: No hay token, no se pueden cargar canales del usuario.");
    return []; 
  }
  // Este endpoint debe devolver los canales a los que el usuario tiene acceso según su plan
  const response = await fetch(`${API_BASE_URL}/api/channels/list`, { headers }); 
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    console.error(`Error al cargar canales del usuario: ${response.status}`, errorText);
    throw new Error(`Error al cargar canales del usuario: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return data.map(c => ({ 
    id: c.id || c._id, 
    name: c.name, 
    thumbnail: c.thumbnail || c.logo || "", 
    url: c.url, 
    category: c.category || "general",
    description: c.description || "",
    requiresPlan: c.requiresPlan || "gplay" // Es bueno tenerlo para el frontend
  }));
}

export async function fetchUserMovies() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) return [];
  const response = await fetch(`${API_BASE_URL}/api/videos`, { headers }); 
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar películas del usuario: ${errorText}`);
  }
  const data = await response.json();
  return data
    .filter(v => v.tipo === "pelicula")
    .map(v => ({ 
        id: v._id, name: v.title, title: v.title, 
        thumbnail: v.logo || v.thumbnail || "", url: v.url, 
        category: v.category || "general", description: v.description || "",
        trailerUrl: v.trailerUrl || "",
        genres: v.genres || [],
        mainSection: v.mainSection 
    }));
}

export async function fetchUserSeries() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) return [];
  const response = await fetch(`${API_BASE_URL}/api/videos`, { headers }); 
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar series del usuario: ${errorText}`);
  }
  const data = await response.json();
  return data
    .filter(v => v.tipo === "serie")
    .map(v => ({ 
        id: v._id, name: v.title, title: v.title,
        thumbnail: v.logo || v.thumbnail || "", url: v.url, 
        category: v.category || "general", description: v.description || "",
        trailerUrl: v.trailerUrl || "",
        genres: v.genres || [],
        mainSection: v.mainSection 
    }));
}

// --- Funciones para Secciones de Contenido (Requieren autenticación para filtrar por plan) ---

export async function fetchMainMovieSections() {
  const headers = getAuthHeaders(); 
  console.log("API: Fetching main movie sections from:", `${API_BASE_URL}/api/videos/main-sections`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/videos/main-sections`, { headers });
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Error ${response.status}`);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error("API: Fallo en fetchMainMovieSections -", error.message);
    return [{ key: "ERROR_MOVIES", displayName: "GÉNEROS (Error)", thumbnailSample: "/img/placeholders/error.jpg", requiresPlan: "gplay", order: 99 }]; 
  }
}

export async function fetchMainChannelSectionsForUser() {
  const headers = getAuthHeaders(); 
  console.log("API: Fetching main channel sections for user from:", `${API_BASE_URL}/api/channels/main-sections`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/main-sections`, { headers });
    if (!response.ok) {
      const errorText = await response.text().catch(() => `Error ${response.status}`);
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    return response.json();
  } catch (error) {
    console.error("API: Fallo en fetchMainChannelSectionsForUser -", error.message);
    return [{ key: "ERROR_CHANNELS", displayName: "SECCIONES (Error)", thumbnailSample: "/img/placeholders/error.jpg", requiresPlan: "gplay", order: 99, categoriesIncluded: [] }]; 
  }
}

// --- Funciones para Contenido Destacado PÚBLICO (NO requieren token) ---

export async function fetchFeaturedChannels() {
  // Este endpoint en el backend debería devolver solo canales marcados como 'isFeatured: true' y 'active: true'
  const response = await fetch(`${API_BASE_URL}/api/channels/list?featured=true`); // Ajusta el endpoint si es necesario
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar canales destacados: ${errorText}`);
  }
  const data = await response.json();
  return data.map(c => ({ 
    id: c.id || c._id, name: c.name, thumbnail: c.thumbnail || c.logo || "", 
    url: c.url, category: c.category || "general", description: c.description || ""
  }));
}

export async function fetchFeaturedMovies() {
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured-movies`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar películas destacadas: ${errorText}`);
  }
  const data = await response.json();
  return data.map(v => ({ 
    id: v.id || v._id, name: v.title, title: v.title, 
    thumbnail: v.thumbnail || v.logo || "", url: v.url, 
    category: v.category || "general", description: v.description || "",
    trailerUrl: v.trailerUrl || "" 
  }));
}

export async function fetchFeaturedSeries() {
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured-series`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar series destacadas: ${errorText}`);
  }
  const data = await response.json();
  return data.map(v => ({ 
    id: v.id || v._id, name: v.title, title: v.title, 
    thumbnail: v.thumbnail || v.logo || "", url: v.url, 
    category: v.category || "general", description: v.description || "",
    trailerUrl: v.trailerUrl || "" 
  }));
}


// --- FUNCIONES PARA ADMIN PANEL (CANALES) ---

export async function fetchAdminChannels() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchAdminChannels: No hay token.");
    throw new Error("No autenticado para cargar canales de admin.");
  }
  // URL Corregida: /api/channels/admin/list (porque channelsRoutes se monta en /api/channels)
  const response = await fetch(`${API_BASE_URL}/api/channels/admin/list`, { headers });
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar canales para admin.`);
    throw new Error(`Error al cargar canales para admin: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  // El backend en /api/channels/admin/list ya debería devolver 'id', '_id', etc.
  return data; // Asumimos que el backend ya mapea si es necesario.
}

export async function createAdminChannel(channelData) {
  const headers = getAuthHeaders();
  if (!headers.Authorization) throw new Error("No autenticado para crear canal.");
  
  // URL Corregida: /api/channels/admin
  const response = await fetch(`${API_BASE_URL}/api/channels/admin`, {
    method: 'POST',
    headers,
    body: JSON.stringify(channelData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error ${response.status} al crear canal.` }));
    throw new Error(errorData.error || `Error ${response.status}`);
  }
  return response.json();
}

export async function updateAdminChannel(channelId, channelData) {
  const headers = getAuthHeaders();
  if (!headers.Authorization) throw new Error("No autenticado para actualizar canal.");

  // URL Corregida: /api/channels/admin/:id
  const response = await fetch(`${API_BASE_URL}/api/channels/admin/${channelId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(channelData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error ${response.status} al actualizar canal.` }));
    throw new Error(errorData.error || `Error ${response.status}`);
  }
  return response.json();
}

export async function deleteAdminChannel(channelId) {
  const headers = getAuthHeaders();
  if (!headers.Authorization) throw new Error("No autenticado para eliminar canal.");

  // URL Corregida: /api/channels/admin/:id
  const response = await fetch(`${API_BASE_URL}/api/channels/admin/${channelId}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error ${response.status} al eliminar canal.` }));
    throw new Error(errorData.error || `Error ${response.status}`);
  }
  return response.json(); 
}

export async function processM3UForAdmin(formData) {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No autenticado para procesar M3U.");

    // Para FormData, no establecemos Content-Type manualmente.
    const headers = { 'Authorization': `Bearer ${token}` };

    // URL Corregida: /api/channels/admin/process-m3u (si defines esta ruta en channels.routes.js)
    // O podría ser /api/m3u/process-admin o similar si usas m3u.routes.js
    const response = await fetch(`${API_BASE_URL}/api/channels/admin/process-m3u`, {
        method: 'POST',
        headers: headers, // Solo Authorization
        body: formData
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Error ${response.status} al procesar M3U.`}));
        throw new Error(errorData.error || `Error ${response.status}`);
    }
    return response.json();
}

// --- FUNCIONES PARA ADMIN PANEL (VOD - Películas/Series) ---
// (Asumiendo que tus rutas VOD para admin están bajo /api/videos y el backend maneja el rol)

export async function fetchAdminVideos() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) throw new Error("No autenticado para cargar VODs de admin.");
  const response = await fetch(`${API_BASE_URL}/api/videos?view=admin`, { headers }); // Asumiendo ?view=admin para obtener todos
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar VODs para admin: ${errorText}`);
  }
  return response.json(); // Asumimos que el backend devuelve el formato necesario
}

export async function createAdminVideo(videoData) {
  const headers = getAuthHeaders();
  if (!headers.Authorization) throw new Error("No autenticado para crear VOD.");
  // Tu backend en /api/videos/upload-link ya maneja esto
  const response = await fetch(`${API_BASE_URL}/api/videos/upload-link`, {
    method: 'POST',
    headers,
    body: JSON.stringify(videoData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error ${response.status}`}));
    throw new Error(errorData.error || `Error ${response.status} al crear VOD.`);
  }
  return response.json();
}

export async function updateAdminVideo(videoId, videoData) {
  const headers = getAuthHeaders();
  if (!headers.Authorization) throw new Error("No autenticado para actualizar VOD.");
  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(videoData)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error ${response.status}`}));
    throw new Error(errorData.error || `Error ${response.status} al actualizar VOD.`);
  }
  return response.json();
}

export async function deleteAdminVideo(videoId) {
  const headers = getAuthHeaders();
  if (!headers.Authorization) throw new Error("No autenticado para eliminar VOD.");
  const response = await fetch(`${API_BASE_URL}/api/videos/${videoId}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `Error ${response.status}`}));
    throw new Error(errorData.error || `Error ${response.status} al eliminar VOD.`);
  }
  return response.json();
}