// src/utils/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL; // Asegúrate que apunte a tu backend

// --- Funciones para obtener Headers de Autenticación ---
function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// --- Funciones para Canales (USUARIO - Para la página de TV en Vivo estilo filtros) ---

// Obtiene canales, puede filtrar por 'section' (categoría)
export async function fetchUserChannels(sectionName = "Todos") {
  const headers = getAuthHeaders();
  // Si tu backend requiere token para /api/channels/list, está bien.
  // Si no, esta llamada podría funcionar incluso sin token para canales públicos.
  let url = `${API_BASE_URL}/api/channels/list`;
  const queryParams = new URLSearchParams();

  if (sectionName && sectionName.toLowerCase() !== 'todos') {
    queryParams.append('section', sectionName);
  }

  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  console.log(`API (fetchUserChannels): Fetching from: ${url}`);
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error ${response.status} - ${response.statusText}` }));
    console.error(`API (fetchUserChannels): Error ${response.status}`, errorData.error || errorData.message);
    throw new Error(errorData.error || errorData.message || "Error al cargar canales.");
  }
  const data = await response.json();
  return data.map(c => ({
    id: c.id || c._id,
    name: c.name,
    thumbnail: c.thumbnail || c.logo || "/img/placeholder-thumbnail.png", // Añade un placeholder si quieres
    // url: c.url, // No es vital para la lista, se obtiene al reproducir
    section: c.section || "General", 
    category: c.section || "General", // Para compatibilidad con tu LiveTVPage si usa 'category'
    description: c.description || "",
    requiresPlan: Array.isArray(c.requiresPlan) ? c.requiresPlan : (c.requiresPlan ? [c.requiresPlan] : ["basico"]),
    isFeatured: c.isFeatured || false,
    isPubliclyVisible: c.isPubliclyVisible === undefined ? true : c.isPubliclyVisible,
  }));
}

// Obtiene la lista de nombres de sección/categoría para los botones de filtro
export async function fetchChannelFilterSections() {
  const url = `${API_BASE_URL}/api/channels/sections`;
  console.log("API (fetchChannelFilterSections): Fetching from:", url);
  const response = await fetch(url); // Esta ruta es pública, no necesita token
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error ${response.status} - ${response.statusText}` }));
    console.error(`API (fetchChannelFilterSections): Error ${response.status}`, errorData.error || errorData.message);
    throw new Error(errorData.error || errorData.message || "Error al cargar categorías de filtro para canales.");
  }
  return response.json(); // Espera un array como ["Todos", "Deportes", "Noticias"]
}

// Obtiene un canal específico para reproducción (el backend validará el plan)
export async function fetchChannelForPlayback(channelId) {
    const headers = getAuthHeaders();
    const url = `${API_BASE_URL}/api/channels/id/${channelId}`;
    console.log(`API (fetchChannelForPlayback): Fetching channel ${channelId} from: ${url}`);
    const response = await fetch(url, { headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status} - ${response.statusText}` }));
        console.error(`API (fetchChannelForPlayback): Error ${response.status} para canal ${channelId}`, errorData.error || errorData.message);
        throw new Error(errorData.error || errorData.message || "Error al obtener datos del canal para reproducción.");
    }
    return response.json(); // Contiene la URL del stream si el acceso es permitido
}

// --- Funciones para VODs (Películas/Series - USUARIO) ---
// ESTAS FUNCIONES SE MANTIENEN COMO LAS TIENES PARA NO AFECTAR TU VOD
export async function fetchUserMovies() {
  const headers = getAuthHeaders();
  // Asumiendo que /api/videos sin ?tipo filtra por plan del usuario logueado
  const response = await fetch(`${API_BASE_URL}/api/videos?tipo=pelicula`, { headers }); 
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error ${response.status} - ${response.statusText}` }));
    throw new Error(errorData.error || errorData.message || "Error al cargar películas.");
  }
  const data = await response.json();
  return data.map(v => ({
      id: v._id, name: v.title, title: v.title,
      thumbnail: v.logo || v.customThumbnail || v.tmdbThumbnail || "/img/placeholder-thumbnail.png", 
      url: v.url,
      description: v.description || "",
      trailerUrl: v.trailerUrl || "", // Importante para tu Home.jsx
      genres: v.genres || [],
      mainSection: v.mainSection, 
      requiresPlan: v.requiresPlan 
  }));
}

export async function fetchUserSeries() {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/api/videos?tipo=serie`, { headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error ${response.status} - ${response.statusText}` }));
    throw new Error(errorData.error || errorData.message || "Error al cargar series.");
  }
  const data = await response.json();
  return data.map(v => ({
    id: v._id, name: v.title, title: v.title,
    thumbnail: v.logo || v.customThumbnail || v.tmdbThumbnail || "/img/placeholder-thumbnail.png", 
    url: v.url,
    description: v.description || "",
    trailerUrl: v.trailerUrl || "", // Importante para tu Home.jsx
    genres: v.genres || [],
    mainSection: v.mainSection,
    requiresPlan: v.requiresPlan
  }));
}

// Para las secciones de VOD (Películas/Series)
export async function fetchMainMovieSections() {
  const headers = getAuthHeaders();
  const url = `${API_BASE_URL}/api/videos/main-sections`; // Esta ruta es para VOD y debe existir en tu backend
  console.log("API (fetchMainMovieSections): Fetching from:", url);
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Error ${response.status} - ${response.statusText}` }));
      throw new Error(errorData.error || errorData.message || `Error ${response.status} al cargar secciones de VOD.`);
    }
    return response.json();
  } catch (error) {
    console.error("API (fetchMainMovieSections): Fallo -", error);
    // Fallback por si la UI lo necesita
    return [{ key: "ERROR_VOD_SECTIONS", displayName: "SECCIONES VOD (Error)", thumbnailSample: "/img/placeholders/error.jpg", requiresPlan: "basico", order: 99 }];
  }
}

// --- Funciones para Contenido Destacado PÚBLICO (Home.jsx) ---
// ESTAS SON LAS FUNCIONES QUE TU Home.jsx NECESITA Y QUE CAUSABAN EL ERROR DE IMPORTACIÓN

export async function fetchFeaturedChannels() {
  const url = `${API_BASE_URL}/api/channels/list?featured=true`; // El backend filtra por featured y active
  console.log("API (fetchFeaturedChannels): Fetching from:", url);
  const response = await fetch(url); // No necesita token por ser público
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error ${response.status} - ${response.statusText}` }));
    throw new Error(errorData.error || errorData.message || "Error al cargar canales destacados.");
  }
  const data = await response.json();
  // Mapeo para tu componente Carousel/Card
  return data.map(c => ({
    id: c.id || c._id, 
    name: c.name, 
    title: c.name, // Para consistencia con VOD
    thumbnail: c.thumbnail || c.logo || "/img/placeholder-thumbnail.png",
    // No necesitas más datos para el carrusel de destacados, a menos que tu Card los use
  }));
}

export async function fetchFeaturedMovies() {
  const url = `${API_BASE_URL}/api/videos/public/featured-movies`; // Ruta pública del backend para VOD destacados
  console.log("API (fetchFeaturedMovies): Fetching from:", url);
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error ${response.status} - ${response.statusText}` }));
    throw new Error(errorData.error || errorData.message || `Error al cargar películas destacadas`);
  }
  const data = await response.json();
  // Mapeo para tu componente Carousel/Card
  return data.map(v => ({ 
    id: v.id || v._id, 
    name: v.title, 
    title: v.title, 
    thumbnail: v.thumbnail || v.logo || "/img/placeholder-thumbnail.png", 
    trailerUrl: v.trailerUrl || "" // Para el modal de tráiler
  }));
}

export async function fetchFeaturedSeries() {
  const url = `${API_BASE_URL}/api/videos/public/featured-series`; // Ruta pública del backend para VOD destacados
  console.log("API (fetchFeaturedSeries): Fetching from:", url);
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Error ${response.status} - ${response.statusText}` }));
    throw new Error(errorData.error || errorData.message || `Error al cargar series destacadas`);
  }
  const data = await response.json();
  // Mapeo para tu componente Carousel/Card
  return data.map(v => ({ 
    id: v.id || v._id, 
    name: v.title, 
    title: v.title, 
    thumbnail: v.thumbnail || v.logo || "/img/placeholder-thumbnail.png",
    trailerUrl: v.trailerUrl || "" // Para el modal de tráiler
  }));
}

// --- FUNCIONES PARA LOGIN/REGISTRO ---
// (Se mantienen como estaban)
export async function loginUser(credentials) { /* ...tu código... */ }
export async function registerUser(userData) { /* ...tu código... */ }

// --- FUNCIONES PARA ADMIN PANEL (CANALES) ---
// (Se mantienen como estaban, asegúrate que las URLs sean correctas: /api/channels/admin/...)
export async function fetchAdminChannels() { /* ...tu código... */ }
export async function createAdminChannel(channelData) { /* ...tu código... */ }
export async function updateAdminChannel(channelId, channelData) { /* ...tu código... */ }
export async function deleteAdminChannel(channelId) { /* ...tu código... */ }
export async function processM3UForAdmin(formData) { /* ...tu código... */ }

// --- FUNCIONES PARA ADMIN PANEL (VOD) ---
// (Se mantienen como estaban, asegúrate que las URLs sean correctas: /api/videos/...)
export async function fetchAdminVideos() { /* ...tu código... */ }
export async function createAdminVideo(videoData) { /* ...tu código... */ }
export async function updateAdminVideo(videoId, videoData) { /* ...tu código... */ }
export async function deleteAdminVideo(videoId) { /* ...tu código... */ }