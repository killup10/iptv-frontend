import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

const SeriesChapters = ({ chapters, serieId, currentChapter, watchProgress }) => {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(watchProgress || {});


  console.log("[SeriesChapters] Props recibidos:", {
    chapters,
    serieId,
    currentChapter,
    watchProgress,
    chaptersIsArray: Array.isArray(chapters),
    chaptersLength: chapters?.length
  });


  const handleChapterClick = async (chapterIndex) => {
    console.log("[SeriesChapters] Navegando a capítulo:", {
      serieId,
      chapterIndex,
      chapterTitle: chapters[chapterIndex]?.title
    });
    
    // Detener MPV antes de navegar si estamos en Electron
    if (typeof window !== 'undefined' && window.electronMPV) {
      try {
        console.log('[SeriesChapters] Deteniendo MPV antes de cambiar capítulo...');
        await window.electronMPV.stop();
        // Pequeña pausa para asegurar que MPV se haya cerrado
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error('[SeriesChapters] Error al detener MPV:', err);
      }
    }
    
    navigate(`/watch/serie/${serieId}`, {
      state: { chapterIndex }
    });
  };

  // Validar que chapters sea un array válido
  if (!Array.isArray(chapters) || chapters.length === 0) {
    console.log('[SeriesChapters] No hay capítulos válidos:', {
      chapters,
      isArray: Array.isArray(chapters),
      length: chapters?.length
    });
    return (
      <div className="bg-zinc-800 rounded-lg p-4 mt-4">
        <h3 className="text-xl font-semibold text-white mb-4">Capítulos</h3>
        <p className="text-gray-400">No hay capítulos disponibles para esta serie.</p>
      </div>
    );
  }

  console.log('[SeriesChapters] Renderizando capítulos:', {
    chaptersCount: chapters.length,
    currentChapter,
    serieId
  });

  return (
    <div className="bg-zinc-800 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">
          Capítulos ({chapters.length})
        </h3>
        {currentChapter !== undefined && currentChapter < chapters.length - 1 && (
          <button
            onClick={() => handleChapterClick(currentChapter + 1)}
            className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            Siguiente Capítulo
          </button>
        )}
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {chapters.map((chapter, index) => {
          // Validar que cada capítulo tenga los campos necesarios
          if (!chapter || !chapter.title || !chapter.url) {
            console.warn('[SeriesChapters] Capítulo inválido en índice:', index, chapter);
            return (
              <div key={index} className="w-full text-left p-3 rounded bg-zinc-700 opacity-50">
                <span className="text-gray-400">
                  Capítulo {index + 1}: Datos incompletos
                </span>
              </div>
            );
          }

          return (
            <button
              key={index}
              onClick={() => handleChapterClick(index)}
              className={`w-full text-left p-3 rounded transition-colors ${
                currentChapter === index
                  ? 'bg-pink-600 text-white'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className="font-medium block">
                  Capítulo {index + 1}: {chapter.title}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {chapter.duration && (
                    <span className="text-xs text-gray-400">
                      Duración: {chapter.duration}
                    </span>
                  )}
                  {progressData[index]?.progress && (
                    <span className="text-xs text-green-400">
                      {Math.round(progressData[index].progress * 100)}% visto
                    </span>
                  )}
                </div>
              </div>

                {currentChapter === index && (
                  <span className="text-sm bg-pink-700 px-2 py-1 rounded ml-2 flex-shrink-0">
                    Reproduciendo
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Botón para continuar viendo desde el último capítulo */}
      {currentChapter !== undefined && currentChapter >= 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <button
            onClick={() => handleChapterClick(currentChapter)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors relative overflow-hidden"
          >
            {progressData[currentChapter]?.progress && (
              <div 
                className="absolute bottom-0 left-0 h-1 bg-green-500"
                style={{ width: `${progressData[currentChapter].progress * 100}%` }}
              />
            )}
            Continuar viendo - Capítulo {currentChapter + 1}
          </button>

        </div>
      )}
    </div>
  );
};

export default SeriesChapters;
