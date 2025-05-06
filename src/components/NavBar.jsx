import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-netflixbg bg-opacity-90 px-6 py-4 flex items-center justify-between">
      <div className="text-2xl font-bold text-white">TeamG Play</div>
      <div className="space-x-6 text-sm">
        <Link to="/tv" className="text-netflixgray hover:text-white">TV en Vivo</Link>
        <Link to="/movies" className="text-netflixgray hover:text-white">Películas</Link>
        <Link to="/series" className="text-netflixgray hover:text-white">Series</Link>
      </div>
    </nav>
  );
}