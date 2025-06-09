import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { videoProgressService } from '../services/videoProgress';
import {
  PlayIcon as PlaySolidIcon,
  PauseIcon as PauseSolidIcon,
  SpeakerWaveIcon as SpeakerWaveSolidIcon,
  SpeakerXMarkIcon as SpeakerXMarkSolidIcon,
  ArrowsPointingOutIcon as ArrowsPointingOutSolidIcon,
  ArrowsPointingInIcon as ArrowsPointingInSolidIcon,
  BackwardIcon as BackwardSolidIcon,
  ForwardIcon as ForwardSolidIcon,
  Cog6ToothIcon,
  CheckIcon,
} from '@heroicons/react/24/solid';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  return `${mm.toString().padStart(2, '0')}:${ss}`;
};

const useVideoProgress = (itemId) => {
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const saveTimeoutRef = useRef(null);

  // Cargar progreso inicial
  useEffect(() => {
    if (!itemId) return;
    
    const loadProgress = async () => {
      const progress = await videoProgressService.getProgress(itemId);
      if (progress?.lastTime) {
        setLastSavedTime(progress.lastTime);
      }
    };

    loadProgress();
  }, [itemId]);

  const saveProgress = useCallback((currentTime, duration) => {
    if (!itemId || isNaN(currentTime) || isNaN(duration) || duration === 0) return;

    // Limpiar timeout anterior si existe
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Si el tiempo actual es muy cercano al inicio o final, no guardar
    if (currentTime < 5 || currentTime > duration - 15) {
      if (currentTime > duration - 15 && duration > 0) {
        // Marcar como completado si está cerca del final
        videoProgressService.saveProgress(itemId, {
          lastTime: duration,
          completed: true
        });
      }
      return;
    }

    // Solo guardar si han pasado más de 5 segundos desde el último guardado
    if (Math.abs(currentTime - lastSavedTime) >= 5) {
      saveTimeoutRef.current = setTimeout(() => {
        videoProgressService.saveProgress(itemId, {
          lastTime: currentTime,
          completed: false
        });
        setLastSavedTime(currentTime);
      }, 1000); // Esperar 1 segundo antes de guardar para evitar muchas llamadas
    }
  }, [itemId, lastSavedTime]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return { saveProgress, lastSavedTime };
};

export default function VideoPlayer({ url, itemId, startTime = 0, initialAutoplay = true }) {
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const { saveProgress, lastSavedTime } = useVideoProgress(itemId);
  
  // Estados
  const [error, setError] = useState(null);
  const [playing, setPlaying] = useState(initialAutoplay);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(startTime);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [availableAudioTracks, setAvailableAudioTracks] = useState([]);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState(null);
  const [availableTextTracks, setAvailableTextTracks] = useState([]);
  const [selectedTextTrack, setSelectedTextTrack] = useState('off');
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const trackMenuRef = useRef(null);

  // Efecto principal para controlar MPV con debounce para bounds
  useEffect(() => {
    if (!url || !containerRef.current) return;
    console.log('[VideoPlayer] Iniciando setup de MPV con URL:', url);

    let boundsUpdateTimeout = null;
    let lastBoundsUpdate = 0;
    const BOUNDS_UPDATE_DELAY = 100; // ms entre actualizaciones

    const updateBounds = (rect) => {
      const now = Date.now();
      if (now - lastBoundsUpdate < BOUNDS_UPDATE_DELAY) {
        // Si ha pasado poco tiempo desde la última actualización, programar para más tarde
        clearTimeout(boundsUpdateTimeout);
        boundsUpdateTimeout = setTimeout(() => {
          updateBounds(containerRef.current.getBoundingClientRect());
        }, BOUNDS_UPDATE_DELAY);
        return;
      }

      lastBoundsUpdate = now;
      if (typeof window.electronMPV.updateBounds === 'function') {
        window.electronMPV.updateBounds({
          x: Math.floor(rect.x),
          y: Math.floor(rect.y),
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        });
      }
    };

    const setupMPV = async () => {
      try {
        if (typeof window === 'undefined' || !window.electronMPV || typeof window.electronMPV.play !== 'function') {
          throw new Error('MPV no está disponible o no tiene la función play');
        }

        const rect = containerRef.current.getBoundingClientRect();
        console.log('[VideoPlayer] Bounds iniciales:', rect);

        if (rect.width <= 0 || rect.height <= 0) {
          throw new Error('Dimensiones del contenedor inválidas');
        }

        // Iniciar desde el último tiempo guardado si existe
        const startPosition = lastSavedTime > 0 ? lastSavedTime : startTime;
        
        const response = await window.electronMPV.play(url, {
          x: Math.floor(rect.x),
          y: Math.floor(rect.y),
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
          startTime: startPosition
        });

        if (!response || !response.success) throw new Error(response?.error || 'Error desconocido al iniciar MPV');
        console.log('[VideoPlayer] MPV iniciado correctamente');
        setPlaying(true);
        setError(null);

        const removeSync = window.electronMPV.onRequestVideoBoundsSync(() => {
          if (containerRef.current) {
            updateBounds(containerRef.current.getBoundingClientRect());
          }
        });

        return () => {
          console.log('[VideoPlayer] Limpiando recursos');
          clearTimeout(boundsUpdateTimeout);
          removeSync();
        };

      } catch (err) {
        console.error('[VideoPlayer] Error en setupMPV:', err);
        setError(err.message);
        setPlaying(false);
      }
    };

    if (initialAutoplay) {
      console.log('[VideoPlayer] Iniciando reproducción automática');
      setupMPV();
    }

    return () => {
      console.log('[VideoPlayer] Deteniendo MPV en cleanup');
      if (typeof window !== 'undefined' && window.electronMPV && typeof window.electronMPV.stop === 'function') {
        window.electronMPV.stop();
      }
      setPlaying(false);
    };
  }, [url, initialAutoplay, lastSavedTime, startTime]);

  // Efecto para actualizar el tiempo de reproducción y guardar progreso
  useEffect(() => {
    if (!playing || !window.electronMPV) return;

    const updateProgress = () => {
      if (typeof window.electronMPV.getTimePosition === 'function' && 
          typeof window.electronMPV.getDuration === 'function') {
        window.electronMPV.getTimePosition().then(time => {
          if (!isNaN(time)) {
            setPlayedSeconds(time);
          }
        });

        window.electronMPV.getDuration().then(totalDuration => {
          if (!isNaN(totalDuration)) {
            setDuration(totalDuration);
            // Guardar progreso
            saveProgress(playedSeconds, totalDuration);
          }
        });
      }
    };

    // Actualizar cada segundo
    progressIntervalRef.current = setInterval(updateProgress, 1000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [playing, playedSeconds, saveProgress]);

  // Controles
  const handlePlayPause = useCallback(() => {
    console.log('[VideoPlayer] handlePlayPause, playing:', playing);
    if (!playing) {
      const setupMPV = async () => {
        try {
          if (!containerRef.current) {
            throw new Error('Contenedor de video no disponible');
          }

          const rect = containerRef.current.getBoundingClientRect();
          console.log('[VideoPlayer] Iniciando reproducción con bounds:', rect);

          if (rect.width <= 0 || rect.height <= 0) {
            throw new Error('Dimensiones del contenedor inválidas');
          }

          if (typeof window === 'undefined' || !window.electronMPV || typeof window.electronMPV.play !== 'function') {
            throw new Error('MPV no está disponible o no tiene la función play');
          }

          // Iniciar desde el último tiempo guardado si existe
          const startPosition = lastSavedTime > 0 ? lastSavedTime : startTime;
          
          const response = await window.electronMPV.play(url, {
            x: Math.floor(rect.x),
            y: Math.floor(rect.y),
            width: Math.floor(rect.width),
            height: Math.floor(rect.height),
            startTime: startPosition
          });

          if (!response || !response.success) throw new Error(response?.error || 'Error desconocido al iniciar MPV');
          console.log('[VideoPlayer] Reproducción iniciada correctamente');
          setPlaying(true);
          setError(null);
        } catch (err) {
          console.error('[VideoPlayer] Error al iniciar reproducción:', err);
          setError(err.message);
        }
      };
      setupMPV();
    } else {
      console.log('[VideoPlayer] Deteniendo reproducción');
      if (typeof window !== 'undefined' && window.electronMPV && typeof window.electronMPV.stop === 'function') {
        window.electronMPV.stop();
      }
      setPlaying(false);
    }
    setShowTrackMenu(false);
  }, [playing, url, lastSavedTime, startTime]);

  // Nota: MPV maneja el volumen y seek a través de comandos del sistema operativo
  // por lo que estos controles son principalmente visuales por ahora
  const handleVolumeChange = useCallback((e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setMuted(vol === 0);
  }, []);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !muted;
    setMuted(newMuted);
    setVolume(newMuted ? 0 : 0.8);
  }, [muted]);

  const handleSeekMouseUp = useCallback((e) => {
    const seekTime = parseFloat(e.target.value);
    setSeeking(false);
  }, []);

  const handleFastForward = useCallback(() => {
    // MPV no tiene control directo de seek por ahora
    console.log('[VideoPlayer] Fast forward no implementado para MPV');
  }, []);

  const handleRewind = useCallback(() => {
    // MPV no tiene control directo de seek por ahora
    console.log('[VideoPlayer] Rewind no implementado para MPV');
  }, []);

  // MPV maneja pistas de audio y subtítulos a través del sistema operativo
  const handleSelectAudioTrack = useCallback((trackId) => {
    console.log('[VideoPlayer] Selección de pista de audio no implementada para MPV');
    setSelectedAudioTrack(trackId);
    setShowTrackMenu(false);
  }, []);

  const handleSelectTextTrack = useCallback((trackId) => {
    console.log('[VideoPlayer] Selección de subtítulos no implementada para MPV');
    setSelectedTextTrack(trackId);
    setShowTrackMenu(false);
  }, []);

  // UI y otros efectos (mantener tu lógica existente)
  const playedRatio = duration > 0 ? playedSeconds / duration : 0;

  return (
    <div
      ref={containerRef}
      className="player-wrapper w-full aspect-video bg-black rounded-lg relative group select-none"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Mensaje de error */}
      {error && (
        <div className="flex flex-col items-center justify-center w-full h-full bg-black text-red-400 p-4 rounded-lg">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="mt-2 px-3 py-1 bg-red-700 rounded text-xs">
            OK
          </button>
        </div>
      )}

      {/* Controles */}
      <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col gap-2">
          <div className="w-full relative h-1.5 bg-gray-600 rounded-full">
            <div 
              className="absolute h-full bg-red-600 rounded-full" 
              style={{ width: `${playedRatio * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button onClick={handlePlayPause} className="p-1 hover:bg-white/10 rounded-full">
                {playing ? <PauseSolidIcon className="w-5 h-5" /> : <PlaySolidIcon className="w-5 h-5" />}
              </button>
              <button onClick={handleRewind} className="p-1 hover:bg-white/10 rounded-full">
                <BackwardSolidIcon className="w-4 h-4" />
              </button>
              <button onClick={handleFastForward} className="p-1 hover:bg-white/10 rounded-full">
                <ForwardSolidIcon className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button onClick={handleMuteToggle} className="p-1 hover:bg-white/10 rounded-full">
                  {muted ? <SpeakerXMarkSolidIcon className="w-5 h-5" /> : <SpeakerWaveSolidIcon className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-red-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="tabular-nums">
                {formatTime(playedSeconds)} / {formatTime(duration)}
              </span>
              {(availableAudioTracks.length > 0 || availableTextTracks.length > 0) && (
                <div className="relative" ref={trackMenuRef}>
                  <button 
                    onClick={() => setShowTrackMenu(!showTrackMenu)}
                    className="p-1 hover:bg-white/10 rounded-full"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                  </button>
                  {showTrackMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-black/90 border border-gray-700 rounded-lg p-2">
                      {/* Menú de pistas (similar a tu implementación original) */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

VideoPlayer.propTypes = {
  url: PropTypes.string,
  itemId: PropTypes.string,
  startTime: PropTypes.number,
  initialAutoplay: PropTypes.bool
};
