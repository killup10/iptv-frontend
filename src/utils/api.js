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

export async function fetchUserChannels() { // Renombrada para claridad
  const headers = getAuthHeaders();
  if (!headers.Authorization) { // Si no hay token, no intentar cargar canales protegidos
    console.warn("fetchUserChannels: No hay token, no se pueden cargar canales del usuario.");
    return []; // O lanzar un error, o manejar según la lógica de tu app
  }
  const response = await fetch(`${API_BASE_URL}/api/channels/list`, { headers });
  if (!response.ok) {
    // Podrías querer leer response.text() para obtener el mensaje de error del backend
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(`Error al cargar canales del usuario: ${response.status} ${errorText}`);
  }
  return response.json(); 
}

export async function fetchUserMovies() { // Renombrada para claridad
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchUserMovies: No hay token, no se pueden cargar películas del usuario.");
    return [];
  }
  const response = await fetch(`${API_BASE_URL}/api/videos`, { headers });
   if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(`Error al cargar películas del usuario: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return data
    .filter(v => v.tipo === "pelicula")
    .map(v => ({ id: v._id, name: v.title, thumbnail: v.thumbnail, url: v.url, category: v.category })); // Añadí category por si es útil
}

export async function fetchUserSeries() { // Renombrada para claridad
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchUserSeries: No hay token, no se pueden cargar series del usuario.");
    return [];
  }
  const response = await fetch(`${API_BASE_URL}/api/videos`, { headers });
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(`Error al cargar series del usuario: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return data
    .filter(v => v.tipo === "serie")
    .map(v => ({ id: v._id, name: v.title, thumbnail: v.thumbnail, url: v.url, category: v.category }));
}


// --- NUEVAS Funciones para contenido destacado PÚBLICO (NO requieren token) ---

export async function fetchFeaturedChannels() {
  // Este endpoint NO debe requerir autenticación en tu backend
  const response = await fetch(`${API_BASE_URL}/api/public/featured-channels`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(`Error al cargar canales destacados: ${response.status} ${errorText}`);
  }
  return response.json();
}

export async function fetchFeaturedMovies() {
  // Este endpoint NO debe requerir autenticación y debería devolver solo películas destacadas
  // Podrías tener un solo endpoint /api/public/featured-videos?tipo=pelicula
  const response = await fetch(`${API_BASE_URL}/api/public/featured-movies`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(`Error al cargar películas destacadas: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  // Asumiendo que el backend ya filtra por tipo 'pelicula' para este endpoint
  return data.map(v => ({ id: v._id, name: v.title, thumbnail: v.thumbnail, url: v.url, category: v.category }));
}

export async function fetchFeaturedSeries() {
  // Similar a fetchFeaturedMovies, para series
  const response = await fetch(`${API_BASE_URL}/api/public/featured-series`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Error desconocido');
    throw new Error(`Error al cargar series destacadas: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  return data.map(v => ({ id: v._id, name: v.title, thumbnail: v.thumbnail, url: v.url, category: v.category }));
}