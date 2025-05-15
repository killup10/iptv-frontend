// src/components/TrailerModal.jsx
import React from 'react';
import VideoPlayer from './VideoPlayer.jsx'; // Reutilizamos tu VideoPlayer

export default function TrailerModal({ trailerUrl, onClose }) {
  if (!trailerUrl) return null;

  // Detener la propagación del clic para que no cierre el modal si se hace clic dentro del video
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Cerrar al hacer clic fuera del contenido del modal
    >
      <div 
        className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-2xl lg:max-w-3xl relative"
        onClick={handleModalContentClick} // Evitar que el clic dentro cierre el modal
      >
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-white bg-gray-800 rounded-full p-1.5"
          aria-label="Cerrar tráiler"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Tráiler</h3>
        <div className="aspect-video"> {/* Para mantener la proporción del video */}
          {/* Usamos tu VideoPlayer. Asumimos que puede manejar URLs directas de tráiler (MP4, YouTube vía ReactPlayer, etc.) */}
          {/* Si el trailerUrl es M3U8 y necesita proxy, la lógica de getPlayableUrl debería aplicarse ANTES de pasar la URL aquí */}
          {/* O VideoPlayer podría tener getPlayableUrl dentro. Por ahora, asumimos URL directa. */}
          <VideoPlayer url={trailerUrl} /> 
        </div>
      </div>
    </div>
  );
}