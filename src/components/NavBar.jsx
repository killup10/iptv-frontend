import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#141414] bg-opacity-90 px-6 py-4 flex items-center justify-between">
      <div className="text-2xl font-bold text-white">TeamG Play</div>
      <div className="space-x-6 text-sm">
        <Link to="/tv" className="text-[#e5e5e5] hover:text-white">TV en Vivo</Link>
        <Link to="/movies" className="text-[#e5e5e5] hover:text-white">Películas</Link>
        <Link to="/series" className="text-[#e5e5e5] hover:text-white">Series</Link>
      </div>
    </nav>
  );
}