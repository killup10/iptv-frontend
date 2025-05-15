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
  const response = await fetch(`${API_BASE_URL}/api/channels/list`, { headers }); // Asumiendo que /api/channels/list con token devuelve canales del usuario
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar canales de usuario.`);
    console.error(`Error al cargar canales del usuario: ${response.status}`, errorText);
    throw new Error(`Error al cargar canales del usuario: ${response.status} ${errorText}`);
  }
  const data = await response.json();
  console.log("API (fetchUserChannels): Datos CRUDOS de canales de usuario recibidos del backend:", data);

  return data.map(c => {
    console.log("API (fetchUserChannels): Mapeando canal del backend:", c);
    if (!c || (typeof c.id === 'undefined' && typeof c._id === 'undefined')) {
        console.warn("API (fetchUserChannels): Canal del backend SIN id o _id o item nulo:", c);
    }
    return { 
      id: c.id || c._id, 
      name: c.name, 
      thumbnail: c.thumbnail || c.logo || "", 
      url: c.url, 
      category: c.category || "general" 
    };
  });
}

export async function fetchUserMovies() {
  const headers = getAuthHeaders();
  if (!headers.Authorization) {
    console.warn("fetchUserMovies: No hay token, no se pueden cargar películas del usuario.");
    return [];
  }
  // El frontend usa /api/videos para fetchUserMovies, el backend debe filtrar por 'active: true' y opcionalmente por usuario.
  const response = await fetch(`${API_BASE_URL}/api/videos`, { headers }); 
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar películas de usuario.`);
    console.error(`Error al cargar películas del usuario: ${response.status}`, errorText);
    throw new Error(`Error al cargar películas del usuario: ${errorText}`);
  }
  const data = await response.json();
  console.log("API (fetchUserMovies): Datos CRUDOS de videos (todos los tipos) recibidos del backend:", data);

  return data
    .filter(v => v.tipo === "pelicula") // Filtrado en frontend
    .map(v => {
        console.log("API (fetchUserMovies): Mapeando película del backend:", v);
        if (!v || typeof v._id === 'undefined') { // Asumiendo que videos siempre usan _id
            console.warn("API (fetchUserMovies): Película del backend SIN _id o item nulo:", v);
        }
        return { 
            id: v._id, 
            name: v.title, 
            title: v.title, 
            thumbnail: v.logo || v.thumbnail || "", 
            url: v.url, 
            category: v.category || "general",
            description: v.description || "",
            trailerUrl: v.trailerUrl || ""  
        };
    });
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
  console.log("API (fetchUserSeries): Datos CRUDOS de videos (todos los tipos) recibidos del backend:", data);
  
  return data
    .filter(v => v.tipo === "serie") // Filtrado en frontend
    .map(v => {
        console.log("API (fetchUserSeries): Mapeando serie del backend:", v);
        if (!v || typeof v._id === 'undefined') {
            console.warn("API (fetchUserSeries): Serie del backend SIN _id o item nulo:", v);
        }
        return { 
            id: v._id, 
            name: v.title,
            title: v.title,
            thumbnail: v.logo || v.thumbnail || "", 
            url: v.url, 
            category: v.category || "general",
            description: v.description || "",
            trailerUrl: v.trailerUrl || ""  
        };
    });
}

// --- Funciones para contenido destacado PÚBLICO (NO requieren token) ---

export async function fetchFeaturedChannels() {
  console.log("API (fetchFeaturedChannels): Fetching featured channels from:", `${API_BASE_URL}/api/channels/list`);
  const response = await fetch(`${API_BASE_URL}/api/channels/list`); // Usa el endpoint público existente
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar canales destacados.`);
    console.error(`Error al cargar canales destacados: ${response.status}`, errorText);
    throw new Error(`Error al cargar canales destacados: ${errorText}`);
  }
  const data = await response.json();
  console.log("API (fetchFeaturedChannels): Datos CRUDOS de canales destacados recibidos del backend:", data);

  return data.map(c => {
    console.log("API (fetchFeaturedChannels): Mapeando canal destacado del backend:", c);
    // Los canales en la respuesta pública de /api/channels/list ya vienen con 'id' y 'thumbnail' según tu backend.
    // Pero verificamos por si acaso la estructura cambia o hay inconsistencias.
    if (!c || (typeof c.id === 'undefined' && typeof c._id === 'undefined')) {
        console.warn("API (fetchFeaturedChannels): Canal destacado del backend SIN id o _id, o item nulo:", c);
    }
    return { 
      id: c.id || c._id, // El backend en /api/channels/list ya mapea _id a id
      name: c.name, 
      thumbnail: c.thumbnail || c.logo || "", // El backend ya debería enviar 'thumbnail'
      url: c.url, 
      category: c.category || "general",
      description: c.description || "",
      trailerUrl: "" // Los canales usualmente no tienen tráiler
    };
  });
}

export async function fetchFeaturedMovies() {
  console.log("API (fetchFeaturedMovies): Fetching featured movies from:", `${API_BASE_URL}/api/videos/public/featured-movies`);
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured-movies`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar películas destacadas.`);
    console.error(`Error al cargar películas destacadas: ${response.status}`, errorText);
    throw new Error(`Error al cargar películas destacadas: ${errorText}`);
  }
  const data = await response.json();
  console.log("API (fetchFeaturedMovies): Datos CRUDOS de películas destacadas recibidos del backend:", data);

  return data.map(v => {
    console.log("API (fetchFeaturedMovies): Mapeando película destacada del backend:", v);
    // El backend en /api/videos/public/featured-movies ya mapea _id a id y otros campos
    // Pero verificamos por si acaso. El error sugiere que v._id (o el 'id' mapeado) es el problema.
    if (!v || (typeof v.id === 'undefined' && typeof v._id === 'undefined')) {
        console.warn("API (fetchFeaturedMovies): Película destacada del backend SIN id o _id, o item nulo:", v);
    }
    return { 
      id: v.id || v._id, // El backend en la ruta pública ya mapea _id a id
      name: v.title, 
      title: v.title,
      thumbnail: v.thumbnail || v.logo || "", // El backend ya debería enviar 'thumbnail'
      url: v.url, 
      category: v.category || "general",
      description: v.description || "",
      trailerUrl: v.trailerUrl || "" 
    };
  });
}

export async function fetchFeaturedSeries() {
  console.log("API (fetchFeaturedSeries): Fetching featured series from:", `${API_BASE_URL}/api/videos/public/featured-series`);
  const response = await fetch(`${API_BASE_URL}/api/videos/public/featured-series`);
  if (!response.ok) {
    const errorText = await response.text().catch(() => `Error ${response.status} al cargar series destacadas.`);
    console.error(`Error al cargar series destacadas: ${response.status}`, errorText);
    throw new Error(`Error al cargar series destacadas: ${errorText}`);
  }
  const data = await response.json();
  console.log("API (fetchFeaturedSeries): Datos CRUDOS de series destacadas recibidas del backend:", data);
  
  return data.map(v => {
    console.log("API (fetchFeaturedSeries): Mapeando serie destacada del backend:", v);
    if (!v || (typeof v.id === 'undefined' && typeof v._id === 'undefined')) {
        console.warn("API (fetchFeaturedSeries): Serie destacada del backend SIN id o _id, o item nulo:", v);
    }
    return { 
      id: v.id || v._id, // El backend en la ruta pública ya mapea _id a id
      name: v.title,
      title: v.title,
      thumbnail: v.thumbnail || v.logo || "", // El backend ya debería enviar 'thumbnail'
      url: v.url, 
      category: v.category || "general",
      description: v.description || "",
      trailerUrl: v.trailerUrl || "" 
    };
  });
}