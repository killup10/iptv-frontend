// src/components/TrailerModal.jsx
import React, { useEffect } from 'react';
import VideoPlayer from './VideoPlayer.jsx'; // Ajusta la ruta si es diferente
import { XMarkIcon } from '@heroicons/react/24/solid';

// Helper para extraer el ID de YouTube de varias URL
const getYouTubeId = (url) => {
    if (!url) return null;
    // Expresión regular mejorada para varios formatos de URL de YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2] && match[2].length === 11) ? match[2] : null;
    // console.log(`TrailerModal: getYouTubeId para '${url}' -> '${id}'`);
    return id;
};

const TrailerModal = ({ trailerUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!trailerUrl) {
    console.warn("TrailerModal: No se proporcionó trailerUrl.");
    return null; // No renderizar nada si no hay URL
  }

  const youtubeId = getYouTubeId(trailerUrl);
  // Construir URL de embed de YouTube con autoplay y sin videos relacionados
  const youtubeEmbedUrl = youtubeId ? `https://www.youtube.com/embed/VIDEO_ID${youtubeId}?autoplay=1&rel=0&modestbranding=1` : null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-[100] p-4"
      onClick={onClose} 
    >
      <div 
        className="bg-black p-3 sm:p-4 rounded-xl shadow-2xl w-full max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl relative border border-gray-700"
        onClick={handleContentClick}
      >
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 sm:top-2 sm:right-2 text-gray-300 bg-gray-800 hover:bg-red-600 hover:text-white transition-colors z-20 rounded-full p-1.5 shadow-lg"
          aria-label="Cerrar tráiler"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {youtubeEmbedUrl ? (
            <iframe
              width="100%"
              height="100%"
              src={youtubeEmbedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="block" // Asegurar que el iframe ocupe el espacio
            ></iframe>
          ) : (
            // Asumiendo que tu VideoPlayer puede manejar otras URLs de tráiler (MP4, M3U8)
            <VideoPlayer url={trailerUrl} /> 
          )}
        </div>
         <p className="text-xs text-gray-600 mt-3 text-center">
            Presiona ESC o haz clic fuera para cerrar.
        </p>
      </div>
    </div>
  );
};

export default TrailerModal;