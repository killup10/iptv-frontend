// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NavBar from '../components/NavBar.jsx';
import Carousel from '../components/Carousel.jsx';
import { fetchChannels, fetchMovies, fetchSeries } from '../utils/api.js';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState([]);
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [ch, mv, sr] = await Promise.all([
          fetchChannels(),
          fetchMovies(),
          fetchSeries(),
        ]);
        setChannels(ch);
        setMovies(mv);
        setSeries(sr);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const onChannelClick = (channel) => navigate(`/watch/${channel.id}`);
  const onMovieClick = (movie) => navigate(`/watch/${movie.id}`);
  const onSeriesClick = (serie) => navigate(`/watch/${serie.id}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <div className="w-16 h-16 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hero = channels[0];

  return (
    <div className="min-h-screen bg-[#141414] text-[#e5e5e5]">
      <NavBar />
      <main className="pt-20">
        {/* Hero banner */}
        {hero && (
          <section className="relative h-[60vh] w-full overflow-hidden mb-8">
            <img
              src={hero.thumbnail}
              alt={hero.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
            <div className="relative z-10 container mx-auto px-6 py-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {hero.name}
              </h1>
              <p className="text-lg text-gray-300 max-w-xl mb-6">
                Disfruta de nuestro canal destacado en vivo.
              </p>
              <Link
                to="/tv"
                className="bg-[#E50914] hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium"
              >
                Ver en Vivo
              </Link>
            </div>
          </section>
        )}

        {/* Carousels */}
        {channels.length > 0 && (
          <Carousel title="Canales en Vivo" items={channels} onItemClick={onChannelClick} />
        )}
        {movies.length > 0 && (
          <Carousel title="Películas Destacadas" items={movies} onItemClick={onMovieClick} />
        )}
        {series.length > 0 && (
          <Carousel title="Series Populares" items={series} onItemClick={onSeriesClick} />
        )}
      </main>
    </div>
  );
}

export default Home;