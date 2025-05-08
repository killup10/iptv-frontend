// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const onChannelClick = (channel) => navigate(`/watch/${channel.id}`);
  const onMovieClick = (movie) => navigate(`/watch/${movie.id}`);
  const onSeriesClick = (serie) => navigate(`/watch/${serie.id}`);

  return (
    <div className="min-h-screen relative">
      {/* Fondo blur */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-50 blur-sm"
        style={{ backgroundImage: "url('/bg-login-placeholder.jpg')" }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto pt-24 pb-16 text-center text-white px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Bienvenido a <span className="text-red-600">TeamG Play</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto text-gray-300">
          Descubre los últimos estrenos, canales en vivo, películas y series disponibles en nuestra plataforma.
        </p>
      </div>

      {/* Carouseles siempre visibles */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4">
        <Carousel title="Canales en Vivo" items={channels} onItemClick={onChannelClick} />
        <Carousel title="Películas Destacadas" items={movies} onItemClick={onMovieClick} />
        <Carousel title="Series Populares" items={series} onItemClick={onSeriesClick} />
      </div>
    </div>
  );
}

export default Home;
