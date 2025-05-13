// src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Funciones para contenido que REQUIERE autenticación ---

function getAuthHeaders() {
  const token = localStorage.getItem("token"); // Obtener el token MÁS ACTUAL
  if (token) {
    return { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json' // Es bueno incluirlo si esperas/envías JSON
    };
  }
  return { 'Content-Type': 'application/json' }; // Headers mínimos si no hay token
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
    throw new Error(`Error al cargar canales del usuario: ${errorText}`);
  }
  const data = await response.json();
   // El backend ya devuelve el formato {id, name, thumbnail, url, category}
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
  const response = await fetch(`${API_BASE_URL}/api/videos`, { headers }); // Asume que este endpoint devuelve todo tipo de videos
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar películas de usuario.`);
    throw new Error(`Error al cargar películas del usuario: ${errorText}`);
  }
  const data = await response.json();
  return data
    .filter(v => v.tipo === "pelicula") // Filtrar por tipo película
    .map(v => ({ 
        id: v._id, 
        name: v.title, // Usa el campo 'title' del backend
        title: v.title, // Mantener por si algún componente lo espera
        thumbnail: v.logo || v.thumbnail || "", // Priorizar logo, luego thumbnail
        url: v.url, 
        category: v.category || "general" // Usa 'category'
    }));
}

export async function fetchUserSeries() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchUserSeries: No hay token, no se pueden cargar series del usuario.");
    return [];
  }
  const response = await fetch(`${API_BASE_URL}/api/videos`, { headers }); // Asume que este endpoint devuelve todo tipo de videos
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar series de usuario.`);
    throw new Error(`Error al cargar series del usuario: ${errorText}`);
  }
  const data = await response.json();
  return data
    .filter(v => v.tipo === "serie") // Filtrar por tipo serie
    .map(v => ({ 
        id: v._id, 
        name: v.title, // Usa el campo 'title'
        title: v.title,
        thumbnail: v.logo || v.thumbnail || "", 
        url: v.url, 
        category: v.category || "general" // Usa 'category'
    }));
}


// --- Funciones para contenido destacado PÚBLICO (NO requieren token) ---

export async function fetchFeaturedChannels() {
  // Llama al endpoint público /api/channels/list
  const response = await fetch(`${API_BASE_URL}/api/channels/list`); 
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar canales destacados.`);
    throw new Error(`Error al cargar canales destacados: ${errorText}`);
  }
  const data = await response.json();
  // El backend ya devuelve el formato {id, name, thumbnail, url, category}
  return data.map(c => ({ 
    id: c.id || c._id, 
    name: c.name, 
    thumbnail: c.thumbnail || c.logo || "", 
    url: c.url, 
    category: c.category || "general" 
  }));
}

// Opción 1: Función combinada para películas y series destacadas
// Si tu backend tiene UN solo endpoint /api/videos/public/featured que devuelve { movies: [...], series: [...] }
/*
export async function fetchFeaturedPublicContent() { 
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => \`Error ${response.status} al cargar contenido VOD destacado.\`);
    throw new Error(\`Error al cargar contenido VOD destacado: ${errorText}\`);
  }
  return response.json(); // Espera { movies: [...], series: [...] }
}
*/

// Opción 2: Funciones separadas para películas y series destacadas
// (Esto es lo que tu Home.jsx actual está intentando importar)
// Asegúrate de que tu backend TENGA estos endpoints públicos separados.
export async function fetchFeaturedMovies() {
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured-movies`); // Endpoint específico para películas destacadas
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar películas destacadas.`);
    throw new Error(`Error al cargar películas destacadas: ${errorText}`);
  }
  const data = await response.json(); // Asume que devuelve un array de películas
  return data.map(v => ({ 
    id: v._id, 
    name: v.title, 
    title: v.title,
    thumbnail: v.logo || v.thumbnail || "", 
    url: v.url, 
    category: v.category || "general" 
  }));
}

export async function fetchFeaturedSeries() {
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured-series`); // Endpoint específico para series destacadas
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar series destacadas.`);
    throw new Error(`Error al cargar series destacadas: ${errorText}`);
  }
  const data = await response.json(); // Asume que devuelve un array de series
  return data.map(v => ({ 
    id: v._id, 
    name: v.title,
    title: v.title,
    thumbnail: v.logo || v.thumbnail || "", 
    url: v.url, 
    category: v.category || "general"
  }));
}