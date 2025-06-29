import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getPlayableUrl } from "@/utils/playerUtils.js";
import axiosInstance from "@/utils/axiosInstance.js";
import SeriesChapters from "@/components/SeriesChapters.jsx";
// --- 1. IMPORTAR EL SERVICIO PARA GUARDAR PROGRESO ---
import { videoProgressService } from '@/services/videoProgress.js';
import { throttle } from 'lodash'; // Se necesita lodash para throttling

export function Watch() {
  const { itemType, itemId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [bounds, setBounds] = useState(null);

  const videoAreaRef = useRef(null);
  const isContinueWatching = location.state?.continueWatching === true;
  const startTimeFromState = location.state?.startTime || 0;
    const [startTime, setStartTime] = useState(startTimeFromState);


  // --- 2. USEREF PARA GUARDAR LA ÚLTIMA POSICIÓN Y EVITAR RE-RENDERS ---
  const lastSavedTimeRef = useRef(0);

  // --- 3. FUNCIÓN PARA GUARDAR PROGRESO CON THROTTLE ---
  // Se usa 'useRef' para que la función no se recree en cada render.
  // throttle(..., 5000) asegura que la función se ejecute como máximo una vez cada 5 segundos.
  const throttledSaveProgress = useRef(
    throttle((currentTime) => {
      if (!itemId || itemType === 'channel') return; // No guardar progreso para canales

      // Solo guardar si el tiempo ha avanzado significativamente (evita guardados innecesarios)
      if (Math.abs(currentTime - lastSavedTimeRef.current) > 4) {
        console.log(`[Watch.jsx] Guardando progreso... Tiempo: ${currentTime}`);
        videoProgressService.saveProgress(itemId, {
          lastTime: currentTime,
          // Aquí puedes añadir lógica para 'lastChapter' si es una serie
          // completed: false (se podría manejar al final del video)
        });
        lastSavedTimeRef.current = currentTime;
      }
    }, 5000) // Guardar progreso cada 5000ms (5 segundos)
  ).current;


  // 1) Fetch de detalles del contenido
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!itemId || !itemType) {
        setError("Falta información para cargar el contenido.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        let endpoint = "";
        if (itemType === "channel") {
          endpoint = `/api/channels/id/${itemId}`;
        } else if (["movie", "serie", "series"].includes(itemType)) {
          endpoint = `/api/videos/${itemId}`;
        } else {
          setError(`Tipo de contenido "${itemType}" no reconocido.`);
          setLoading(false);
          return;
        }
        const response = await axiosInstance.get(endpoint);
        const data = response.data;
        if (!data) {
          throw new Error("No se recibieron datos del backend.");
        }
        const normalizedData = {
          id: data._id || data.id,
          name: data.name || data.title || data.titulo || "Sin título",
          url: data.url,
          description: data.description || data.descripcion || "",
          releaseYear: data.releaseYear,
          tipo: data.tipo || itemType,
          chapters: Array.isArray(data.chapters) ? data.chapters : [],
          watchProgress: data.watchProgress || null
        };
        if (process.env.NODE_ENV === "development") {
          console.log("[Watch.jsx] Datos normalizados:", normalizedData);
        }
        setItemData(normalizedData);
      } catch (err) {
        setError(`No se pudo cargar el contenido. ${err.response?.data?.error || err.message || "Error desconocido."}`);
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [itemId, itemType]);

  // Cargar progreso guardado si no viene desde el estado
  useEffect(() => {
    async function loadSavedProgress() {
      if (startTimeFromState > 0 || !itemId || itemType === 'channel') return;
      try {
        const progress = await videoProgressService.getProgress(itemId);
        if (progress?.lastTime) {
          setStartTime(progress.lastTime);
        }
      } catch (err) {
        console.error('[Watch.jsx] Error cargando progreso:', err);
      }
    }
    loadSavedProgress();
  }, [itemId, itemType, startTimeFromState]);

  // 2) Cuando tenemos itemData, calculamos la URL reproducible
  useEffect(() => {
    if (!itemData) return;
    if (process.env.NODE_ENV === "development") {
      console.log("[Watch.jsx] itemData recibido:", itemData);
    }
    const M3U8_PROXY_BASE_URL = "https://stream.teamg.store";
    let finalUrl = "";
    const typesWithChapters = ["serie", "anime", "dorama", "novela", "documental"];
    if (typesWithChapters.includes(itemData.tipo) && itemData.chapters?.length > 0) {
      const chapterIndex = location.state?.chapterIndex || 0;
      const chapter = itemData.chapters[chapterIndex];
      if (chapter?.url) {
        finalUrl = getPlayableUrl({ ...itemData, url: chapter.url }, M3U8_PROXY_BASE_URL);
      } else {
        setError("El capítulo seleccionado no tiene una URL válida.");
        return;
      }
    } else if (itemData.url) {
      finalUrl = getPlayableUrl(itemData, M3U8_PROXY_BASE_URL);
    }
    setVideoUrl(finalUrl);
  }, [itemData, location.state?.chapterIndex]);

  // 3) Cuando cambie videoUrl, medimos las bounds de videoAreaRef
  useEffect(() => {
    if (videoUrl && videoAreaRef.current) {
      const rect = videoAreaRef.current.getBoundingClientRect();
      if (process.env.NODE_ENV === "development") {
        console.log('[Watch.jsx] getBoundingClientRect →', rect);
      }
      setBounds({
        x: Math.floor(rect.left),
        y: Math.floor(rect.top),
        width: Math.floor(rect.width),
        height: Math.floor(rect.height),
      });
    }
  }, [videoUrl]);

  // 4) Iniciar MPV y SUSCRIBIRSE a eventos de progreso
  useEffect(() => {
    const isElectronEnv = typeof window !== "undefined" && window.electronMPV;
    if (!videoUrl || !bounds || !isElectronEnv) return;

    const initializeMPV = async (retryCount = 0) => {
      try {
        // Primero, asegurar que cualquier instancia anterior de MPV esté detenida
        console.log('[Watch.jsx] Deteniendo MPV anterior antes de iniciar nuevo...');
        await window.electronMPV.stop();
        
        // Pausa más larga para asegurar que MPV se haya cerrado completamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (process.env.NODE_ENV === "development") {
          console.log('[Watch.jsx] Iniciando MPV con URL:', videoUrl);
        }
        
        const result = await window.electronMPV.play(videoUrl, bounds, { startTime });
        if (!result.success) {
          throw new Error(result.error || 'Error desconocido al iniciar MPV');
        }

        // Si llegamos aquí, la reproducción se inició correctamente
        setError(null);
        
      } catch (err) {
        console.error('[Watch.jsx] Error al iniciar MPV:', err);
        
        // Si es un error de código 1 y no hemos excedido los reintentos, intentar de nuevo
        if (err.message.includes('código: 1') && retryCount < 2) {
          console.log(`[Watch.jsx] Reintentando reproducción (intento ${retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return initializeMPV(retryCount + 1);
        }
        
        setError(`Error al iniciar el reproductor: ${err.message}`);
      }
    };

    initializeMPV();

    const handleMpvError = (event, message) => {
      console.error('[Watch.jsx] MPV Error:', message);
      setError(`Error del reproductor: ${message}`);
    };

    // --- LÓGICA PARA ESCUCHAR EL TIEMPO ---
    const handleTimePos = (event, time) => {
        // 'time' es el tiempo actual de reproducción en segundos
        if (time > 0) {
            throttledSaveProgress(time);
        }
    };
    
    if (window.electronAPI) {
      console.log('[Watch.jsx] Suscribiendo a eventos MPV (error y time-pos)...');
      window.electronAPI.on('mpv-error', handleMpvError);
      // Suscribirse al evento que notifica la posición del tiempo
      window.electronAPI.on('mpv-time-pos', handleTimePos); 
    }

    return () => {
      console.log('[Watch.jsx] Limpiando recursos MPV...');
      if (window.electronMPV) {
        window.electronMPV.stop().catch(err => {
          console.error('[Watch.jsx] Error al detener MPV en cleanup:', err);
        });
      }
      if (window.electronAPI) {
        // Limpiar los listeners al desmontar el componente
        window.electronAPI.removeListener('mpv-error', handleMpvError);
        window.electronAPI.removeListener('mpv-time-pos', handleTimePos);
      }
    };
  }, [videoUrl, bounds, startTime, throttledSaveProgress]); // Añadir dependencias

  // 5) Suscribirse a petición de sincronización de bounds
  useEffect(() => {
    const isElectronEnv = typeof window !== "undefined" && window.electronMPV;
    if (!bounds || !isElectronEnv) return;

    if (process.env.NODE_ENV === "development") {
      console.log('[Watch.jsx] Registrando handler onRequestVideoBoundsSync');
    }

    const removeListener = window.electronMPV.onRequestVideoBoundsSync(() => {
      if (process.env.NODE_ENV === "development") {
        console.log('[Watch.jsx] onRequestVideoBoundsSync: reenviando bounds', bounds);
      }
      if (videoAreaRef.current) {
        const r = videoAreaRef.current.getBoundingClientRect();
        window.electronMPV.updateBounds({
          x: Math.floor(r.left),
          y: Math.floor(r.top),
          width: Math.floor(r.width),
          height: Math.floor(r.height),
        });
      }
    });

    return () => {
      if (process.env.NODE_ENV === "development") {
        console.log('[Watch.jsx] Eliminando handler onRequestVideoBoundsSync');
      }
      removeListener();
    };
  }, [bounds]);

  // --- RENDERIZADO (CÓDIGO RESTAURADO) ---
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  // Mostrar error pero mantener el contenido visible
  const showError = error && (
    <div className="w-full max-w-screen-xl mx-auto mb-4">
      <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-lg flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={() => {
            setError(null);
            // Re-intentar reproducción
            if (window.electronMPV && videoUrl && bounds) {
              window.electronMPV.stop()
                .then(() => new Promise(resolve => setTimeout(resolve, 1000)))
                .then(() => window.electronMPV.play(videoUrl, bounds, { startTime }))
                .catch(err => {
                  console.error('[Watch.jsx] Error al reintentar reproducción:', err);
                  setError(`Error al reintentar: ${err.message}`);
                });
            }
          }}
          className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  if (!itemData)
    return (
      <div className="text-white p-10 text-center min-h-screen bg-black pt-20">
        Información del contenido no disponible.
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded"
        >
          Volver
        </button>
      </div>
    );

  const hasValidContent = itemData.url || (itemData.chapters && itemData.chapters.length > 0);
  
  if (!hasValidContent)
    return (
      <div className="text-white p-10 text-center min-h-screen bg-black pt-20">
        No hay contenido disponible para reproducir.
        <div className="mt-4 text-sm text-gray-400">
          Debug info: URL={itemData.url || 'null'}, Chapters={itemData.chapters?.length || 0}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="block mx-auto mt-4 bg-gray-700 px-3 py-1 rounded"
        >
          Volver
        </button>
      </div>
    );

  return (
    <div className="bg-zinc-900 min-h-screen flex flex-col pt-16">
      <div className="container mx-auto px-2 sm:px-4 py-4 flex-grow flex flex-col">
        {showError}
        <div className="mb-4 flex items-center justify-between w-full max-w-screen-xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm transition-colors"
          >
            ← Volver
          </button>
        </div>

        <div className="flex-grow flex flex-col items-center">
          <div className="w-full max-w-screen-xl">
            <h1 className="text-2xl font-bold text-white mb-4">
              {itemData.name}
            </h1>
            
            {itemData.chapters?.length > 0 && location.state?.chapterIndex !== undefined && (
              <p className="text-sm text-gray-400 mb-2">
                Episodio: {itemData.chapters[location.state.chapterIndex]?.title || "Sin título"}
              </p>
            )}
            
            <div
              ref={videoAreaRef}
              className="w-[70%] mx-auto mb-6 bg-black rounded-lg overflow-hidden"
              style={{ position: "relative", aspectRatio: "16/9" }}
            >
              <div className="flex items-center justify-center h-full text-white">
                {!videoUrl && "Cargando video..."}
              </div>
            </div>
          </div>

          <div className="space-y-4 w-full max-w-screen-xl">
            {itemData.description && (
              <div className="p-4 bg-zinc-800 rounded-lg text-gray-300">
                <h3 className="text-xl font-semibold text-white mb-2">Descripción</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {itemData.description}
                </p>
              </div>
            )}

            {(itemData.tipo === "serie" || itemData.tipo === "series") && itemData.chapters?.length > 0 && (
              <SeriesChapters
                chapters={itemData.chapters}
                serieId={itemData.id}
                currentChapter={location.state?.chapterIndex || 0}
                watchProgress={itemData.watchProgress}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Watch;
