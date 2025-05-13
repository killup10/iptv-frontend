// src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Funciones para contenido que REQUIERE autenticación ---

function getAuthHeaders() {
  const token = localStorage.getItem("token"); // Obtener el token MÁS ACTUAL
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  return { 'Content-Type': 'application/json' };
}

export async function fetchUserChannels() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchUserChannels: No hay token, no se pueden cargar canales del usuario.");
    return [];
  }
  // Llamamos a /api/channels/list, que es público pero podría filtrar por plan si detecta token en el futuro
  const response = await fetch(`${API_BASE_URL}/api/channels/list`, { headers });
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar canales del usuario: ${errorText}`);
  }
  // El backend ya devuelve el formato correcto {id, name, thumbnail, url, category}
  return response.json();
}

export async function fetchUserMovies() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchUserMovies: No hay token, no se pueden cargar películas del usuario.");
    return [];
  }
  const response = await fetch(`${API_BASE_URL}/api/videos`, { headers });
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar películas del usuario: ${errorText}`);
  }
  const data = await response.json();
  return data
    .filter(v => v.tipo === "pelicula")
    // Mapear a formato frontend consistente
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
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar series del usuario: ${errorText}`);
  }
  const data = await response.json();
  return data
    .filter(v => v.tipo === "serie")
    // Mapear a formato frontend consistente
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
  // *** CORRECCIÓN AQUÍ: Llamar al endpoint público existente /api/channels/list ***
  const response = await fetch(`${API_BASE_URL}/api/channels/list`); 
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar canales destacados: ${errorText}`);
  }
  // El backend /api/channels/list ya devuelve el formato correcto {id, name, thumbnail, url, category}
  return response.json(); 
}

// *** CORRECCIÓN AQUÍ: Usar una sola función para VOD destacado ***
// Esta función asume que tu backend tiene UN solo endpoint /api/videos/public/featured
// que devuelve un objeto: { movies: [...], series: [...] }
export async function fetchFeaturedPublicContent() { 
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured`); // Llama al endpoint que SÍ creamos
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status}`);
    throw new Error(`Error al cargar contenido VOD destacado: ${errorText}`);
  }
  return response.json(); // Espera { movies: [...], series: [...] }
}

// YA NO NECESITAMOS LAS FUNCIONES SEPARADAS fetchFeaturedMovies y fetchFeaturedSeries si usamos la de arriba
// export async function fetchFeaturedMovies() { ... }
// export async function fetchFeaturedSeries() { ... }