// src/utils/api.js
const API = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

export async function fetchChannels() {
  const res = await fetch(`${API}/api/channels/list`, { headers });
  return res.json(); // ya viene [{id,name,thumbnail,url},...]
}

export async function fetchMovies() {
  const res = await fetch(`${API}/api/videos`, { headers });
  const data = await res.json();
  // filtra solo tipo 'pelicula' y mapea
  return data
    .filter(v => v.tipo === "pelicula")
    .map(v => ({ id: v._id, name: v.title, thumbnail: v.thumbnail, url: v.url }));
}

export async function fetchSeries() {
  const res = await fetch(`${API}/api/videos`, { headers });
  const data = await res.json();
  // filtra solo tipo 'serie' y mapea
  return data
    .filter(v => v.tipo === "serie")
    .map(v => ({ id: v._id, name: v.title, thumbnail: v.thumbnail, url: v.url }));
}
