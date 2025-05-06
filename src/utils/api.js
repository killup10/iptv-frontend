export async function fetchChannels() {
    const res = await fetch('/api/live-channels');
    if (!res.ok) throw new Error('Error al cargar canales');
    const data = await res.json();
    return data.map(({ id, name, logoUrl }) => ({
      id,
      name,
      thumbnail: logoUrl,
    }));
  }
  
  export async function fetchMovies() {
    const res = await fetch('/api/movies');
    if (!res.ok) throw new Error('Error al cargar películas');
    const data = await res.json();
    return data.map(({ id, title, posterUrl }) => ({
      id,
      name: title,
      thumbnail: posterUrl,
    }));
  }
  
  export async function fetchSeries() {
    const res = await fetch('/api/series');
    if (!res.ok) throw new Error('Error al cargar series');
    const data = await res.json();
    return data.map(({ id, title, posterUrl }) => ({
      id,
      name: title,
      thumbnail: posterUrl,
    }));
  }