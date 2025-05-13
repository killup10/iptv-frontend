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
        category: v.category || "general" 
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
        category: v.category || "general"
    }));
}


// --- Funciones para contenido destacado PÚBLICO (NO requieren token) ---

export async function fetchFeaturedChannels() {
  // Llama al endpoint público /api/channels/list
  console.log("API: Fetching featured channels from:", `${API_BASE_URL}/api/channels/list`);
  const response = await fetch(`${API_BASE_URL}/api/channels/list`); 
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

// Esta función asume que tu backend tiene UN solo endpoint /api/videos/public/featured
// que devuelve un objeto: { movies: [...], series: [...] }
export async function fetchFeaturedPublicContent() { 
  console.log("API: Fetching featured VOD content from:", `${API_BASE_URL}/api/videos/public/featured`);
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar contenido VOD destacado.`);
    console.error(`Error al cargar contenido VOD destacado: ${response.status}`, errorText);
    throw new Error(`Error al cargar contenido VOD destacado: ${errorText}`);
  }
  return response.json(); // Espera { movies: [...], series: [...] }
}