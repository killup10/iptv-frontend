// src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Funciones para contenido que REQUIERE autenticación ---

function getAuthHeaders() {
  const token = localStorage.getItem("token"); // Obtener el token MÁS ACTUAL
  const headers = { 
    'Content-Type': 'application/json' // Siempre enviar Content-Type para consistencia
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchUserChannels() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchUserChannels: No hay token, no se pueden cargar canales del usuario.");
    return []; 
  }
  const response = await fetch(`${API_BASE_URL}/api/channels/list`, { headers });
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar canales de usuario.`);
    console.error(`Error al cargar canales del usuario: ${response.status}`, errorText);
    throw new Error(`Error al cargar canales del usuario: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return data.map(c => ({ 
    id: c.id || c._id, 
    name: c.name, 
    thumbnail: c.thumbnail || c.logo || "", 
    url: c.url, 
    category: c.category || "general" 
  }));
}

export async function fetchUserMovies() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchUserMovies: No hay token, no se pueden cargar películas del usuario.");
    return [];
  }
  const response = await fetch(`${API_BASE_URL}/api/videos`, { headers }); 
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar películas de usuario.`);
    console.error(`Error al cargar películas del usuario: ${response.status}`, errorText);
    throw new Error(`Error al cargar películas del usuario: ${errorText}`);
  }
  const data = await response.json();
  return data
    .filter(v => v.tipo === "pelicula")
    .map(v => ({ 
        id: v._id, 
        name: v.title, 
        title: v.title, 
        thumbnail: v.logo || v.thumbnail || "", 
        url: v.url, 
        category: v.category || "general",
        description: v.description || "",
        trailerUrl: v.trailerUrl || ""  
    }));
}

export async function fetchUserSeries() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchUserSeries: No hay token, no se pueden cargar series del usuario.");
    return [];
  }
  const response = await fetch(`${API_BASE_URL}/api/videos`, { headers }); 
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar series de usuario.`);
    console.error(`Error al cargar series del usuario: ${response.status}`, errorText);
    throw new Error(`Error al cargar series del usuario: ${errorText}`);
  }
  const data = await response.json();
  return data
    .filter(v => v.tipo === "serie")
    .map(v => ({ 
        id: v._id, 
        name: v.title,
        title: v.title,
        thumbnail: v.logo || v.thumbnail || "", 
        url: v.url, 
        category: v.category || "general",
        description: v.description || "",
        trailerUrl: v.trailerUrl || ""  
    }));
}


// --- Funciones para contenido destacado PÚBLICO (NO requieren token) ---

export async function fetchFeaturedChannels() {
  console.log("API: Fetching featured channels from:", `${API_BASE_URL}/api/channels/list`);
  const response = await fetch(`${API_BASE_URL}/api/channels/list`); // Usa el endpoint público existente
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar canales destacados.`);
    console.error(`Error al cargar canales destacados: ${response.status}`, errorText);
    throw new Error(`Error al cargar canales destacados: ${errorText}`);
  }
  const data = await response.json();
  return data.map(c => ({ 
    id: c.id || c._id, 
    name: c.name, 
    thumbnail: c.thumbnail || c.logo || "", 
    url: c.url, 
    category: c.category || "general" 
  }));
}

// Funciones separadas para películas y series destacadas
// Asegúrate de que tu backend TENGA estos endpoints públicos separados.
export async function fetchFeaturedMovies() {
  console.log("API: Fetching featured movies from:", `${API_BASE_URL}/api/videos/public/featured-movies`);
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured-movies`); // Endpoint específico para películas destacadas
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar películas destacadas.`);
    console.error(`Error al cargar películas destacadas: ${response.status}`, errorText);
    throw new Error(`Error al cargar películas destacadas: ${errorText}`);
  }
  const data = await response.json(); // Asume que devuelve un array de películas
  return data.map(v => ({ 
    id: v._id, 
    name: v.title, 
    title: v.title,
    thumbnail: v.logo || v.thumbnail || "", 
    url: v.url, 
    category: v.category || "general",
    description: v.description || "",
    trailerUrl: v.trailerUrl || "" 
  }));
}

export async function fetchFeaturedSeries() {
  console.log("API: Fetching featured series from:", `${API_BASE_URL}/api/videos/public/featured-series`);
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured-series`); // Endpoint específico para series destacadas
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar series destacadas.`);
    console.error(`Error al cargar series destacadas: ${response.status}`, errorText);
    throw new Error(`Error al cargar series destacadas: ${errorText}`);
  }
  const data = await response.json(); // Asume que devuelve un array de series
  return data.map(v => ({ 
    id: v._id, 
    name: v.title,
    title: v.title,
    thumbnail: v.logo || v.thumbnail || "", 
    url: v.url, 
    category: v.category || "general",
    description: v.description || "",
    trailerUrl: v.trailerUrl || "" 
  }));
}