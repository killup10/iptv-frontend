// src/components/VideoPlayer.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player/lazy';
import Hls from 'hls.js';
import {
  PlayIcon as PlaySolidIcon,
  PauseIcon as PauseSolidIcon,
  SpeakerWaveIcon as SpeakerWaveSolidIcon,
  SpeakerXMarkIcon as SpeakerXMarkSolidIcon,
  ArrowsPointingOutIcon as ArrowsPointingOutSolidIcon,
  ArrowsPointingInIcon as ArrowsPointingInSolidIcon,
  BackwardIcon as BackwardSolidIcon,
  ForwardIcon as ForwardSolidIcon,
} from '@heroicons/react/24/solid';

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  }
  return `${mm.toString().padStart(2, '0')}:${ss}`;
};

const useVideoProgress = (itemId) => {
  const saveProgress = useCallback((currentTime, duration) => {
    if (!itemId || isNaN(currentTime) || isNaN(duration) || duration === 0) return;
    if (currentTime < 5 || currentTime > duration - 15) {
      if (currentTime > duration - 15 && duration > 0) {
        try {
          const progressData = JSON.parse(localStorage.getItem('videoProgress') || '{}');
          delete progressData[itemId];
          localStorage.setItem('videoProgress', JSON.stringify(progressData));
        } catch (e) { console.error("Error limpiando progreso:", e); }
      }
      return;
    }
    try {
      const progressData = JSON.parse(localStorage.getItem('videoProgress') || '{}');
      progressData[itemId] = { time: currentTime, duration: duration, lastWatched: Date.now() };
      localStorage.setItem('videoProgress', JSON.stringify(progressData));
    } catch (e) {
      console.error("Error guardando progreso:", e);
    }
  }, [itemId]);
  return { saveProgress };
};

export default function VideoPlayer({ url, itemId, startTime = 0 }) {
  const playerRef = useRef(null);
  const playerWrapperRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const hlsVideoElementRef = useRef(null);
  const hlsInstanceRef = useRef(null);

  const { saveProgress } = useVideoProgress(itemId);

  const [error, setError] = useState(null);
  const [isHlsStream, setIsHlsStream] = useState(false);
  
  // MODIFICACIÓN: Iniciar pausado, especialmente si hay startTime
  const [playing, setPlaying] = useState(startTime > 0 ? false : true); 
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false); 
  const [playedSeconds, setPlayedSeconds] = useState(startTime);
  const [loadedSeconds, setLoadedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isReady, setIsReady] = useState(false); 
  const initialSeekDoneRef = useRef(false); // Para rastrear si el seek inicial a startTime ya se hizo

  useEffect(() => {
    setError(null);
    const newIsHls = url && (url.toLowerCase().includes('.m3u8') || url.toLowerCase().includes('m3u8?'));
    setIsHlsStream(newIsHls);
    
    // MODIFICACIÓN: Si hay startTime, iniciar pausado. Si no, intentar autoplay.
    setPlaying(startTime > 0 ? false : true); 
    
    setPlayedSeconds(startTime);
    setDuration(0);
    setLoadedSeconds(0);
    setShowControls(true);
    setIsBuffering(true); 
    setIsReady(false);
    initialSeekDoneRef.current = false; // Resetear para la nueva URL
    console.log(`[VideoPlayer.jsx] useEffect [url, startTime] - URL: ${url}, startTime: ${startTime}, isHls: ${newIsHls}, playing: ${startTime > 0 ? false : true}`);
  }, [url, startTime]);

  const handlePlayerReady = useCallback(() => {
    console.log(`[VideoPlayer.jsx] handlePlayerReady - startTime: ${startTime}, initialSeekDone: ${initialSeekDoneRef.current}`);
    setIsReady(true);
    setIsBuffering(false);
    const currentDuration = playerRef.current ? playerRef.current.getDuration() : hlsVideoElementRef.current?.duration;
    if (currentDuration) {
        setDuration(currentDuration);
    }

    if (startTime > 0 && currentDuration && startTime < currentDuration && !initialSeekDoneRef.current) {
      console.log(`[VideoPlayer.jsx] Intentando seekTo INICIAL: ${startTime}`);
      if (playerRef.current) {
        playerRef.current.seekTo(startTime, 'seconds');
      } else if (hlsVideoElementRef.current) {
        hlsVideoElementRef.current.currentTime = startTime;
      }
      // NO establecer playing a true aquí. Se manejará en onSeek o por el usuario.
      // initialSeekDoneRef.current se establecerá a true en onSeek o después de que el seek del video HLS se complete.
    } else if (!initialSeekDoneRef.current) { // Si no hay startTime o ya se hizo el seek inicial
      console.log(`[VideoPlayer.jsx] No se hará seekTo inicial o startTime es 0. Estado de playing: ${playing}`);
      // setPlaying(true); // Se mantiene el estado 'playing' definido en useEffect
    }
  }, [startTime, playing]); // 'playing' se añade por si se decide reanudar el autoplay si no hay startTime

  useEffect(() => {
    if (hlsInstanceRef.current) hlsInstanceRef.current.destroy();
    if (isHlsStream && Hls.isSupported() && hlsVideoElementRef.current && url) {
      const hls = new Hls({ /* ...config... */ });
      hls.loadSource(url);
      hls.attachMedia(hlsVideoElementRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        handlePlayerReady(); 
      });
      hls.on(Hls.Events.ERROR, (event, data) => { /* ... */ });
      // ... otros eventos HLS ...
      hlsInstanceRef.current = hls;
      return () => { if (hlsInstanceRef.current) hlsInstanceRef.current.destroy(); };
    } else if (isHlsStream && hlsVideoElementRef.current) { 
        if (hlsVideoElementRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            hlsVideoElementRef.current.src = url;
             const onLoadedMeta = () => {
                setDuration(hlsVideoElementRef.current.duration);
                handlePlayerReady();
            };
            hlsVideoElementRef.current.addEventListener('loadedmetadata', onLoadedMeta);
            // ... otros listeners para HLS nativo ...
            return () => hlsVideoElementRef.current?.removeEventListener('loadedmetadata', onLoadedMeta);
        } else { setError("HLS no es soportado."); setIsBuffering(false); }
    }
  }, [isHlsStream, url, handlePlayerReady]);

  const handlePlayPause = useCallback(() => {
    setPlaying(prev => !prev);
  }, []);

  const handleVolumeChange = useCallback((e) => { /* ... */ }, []);
  const handleMuteToggle = useCallback(() => { /* ... */ }, [muted, volume]);

  const handleReactPlayerProgress = useCallback((state) => {
    if (!seeking) setPlayedSeconds(state.playedSeconds);
    setLoadedSeconds(state.loadedSeconds);
    if (itemId && duration > 0) saveProgress(state.playedSeconds, duration);
  }, [seeking, itemId, duration, saveProgress]);
  
  const handleHLSProgress = useCallback(() => {
    if(hlsVideoElementRef.current && !seeking) {
        const currentTime = hlsVideoElementRef.current.currentTime;
        setPlayedSeconds(currentTime);
        if (hlsVideoElementRef.current.buffered.length > 0) {
            setLoadedSeconds(hlsVideoElementRef.current.buffered.end(hlsVideoElementRef.current.buffered.length - 1));
        }
        if (itemId && duration > 0) saveProgress(currentTime, duration);
        // Si es el seek inicial de HLS y se completó
        if (startTime > 0 && !initialSeekDoneRef.current && Math.abs(currentTime - startTime) < 0.5) {
            console.log("[VideoPlayer.jsx] HLS seekTo startTime completo.");
            initialSeekDoneRef.current = true;
            setPlaying(false); // Asegurar que esté pausado después del seek inicial
        }
    }
  }, [seeking, itemId, duration, saveProgress, startTime]);

  const handleSeekChange = useCallback((e) => { /* ... */ }, [isHlsStream]);
  const handleSeekMouseDown = useCallback(() => setSeeking(true), []);
  const handleSeekMouseUp = useCallback((e) => { 
    setSeeking(false);
    if (playerRef.current && !isHlsStream) {
        const newPlayedSeconds = parseFloat(e.target.value); 
        playerRef.current.seekTo(newPlayedSeconds, 'seconds');
    }
    // Para HLS, el seek ya ocurrió en onChange.
  }, [isHlsStream]);
  
  // MODIFICACIÓN: Lógica de onSeek para ReactPlayer
  const handleSeekComplete = useCallback((secondsSeekedTo) => {
    console.log(`[VideoPlayer.jsx] ReactPlayer onSeek - Seek completo a: ${secondsSeekedTo}`);
    // Si este fue el seekTo inicial para startTime
    if (startTime > 0 && !initialSeekDoneRef.current && Math.abs(secondsSeekedTo - startTime) < 1.5) {
        console.log("[VideoPlayer.jsx] ReactPlayer seekTo startTime completo. Manteniendo pausado.");
        setPlaying(false); // Asegurar que permanezca pausado
        initialSeekDoneRef.current = true;
    } else if (isReady && initialSeekDoneRef.current) {
        // Si fue un seek manual del usuario DESPUÉS del inicial, y estaba reproduciendo, reanudar.
        // Esto es opcional, podrías querer que siempre se pause después de un seek manual.
        // if (playing) setPlaying(true); 
    }
  }, [isReady, startTime, playing]); // 'playing' podría ser necesario si quieres reanudar tras seek manual

  // ... (resto de funciones y JSX sin cambios significativos respecto a la versión anterior del artefacto) ...
  // ... (handleFastForward, handleRewind, toggleFullscreen, efectos de fullscreen y controles) ...

  // Asegúrate de que el JSX del return use onSeek={handleSeekComplete} para ReactPlayer
  // y que la lógica de HLS maneje el estado 'playing' después del seek inicial a través de initialSeekDoneRef.

  // El resto del código (FastForward, Rewind, Fullscreen, timeouts, JSX) permanece igual que en
  // el artefacto custom_video_player_netflix_style_v2_seekfix
  // ... (copia el resto del código desde la línea ~180 del artefacto anterior) ...

  // --- COPIA EL RESTO DEL CÓDIGO JSX Y FUNCIONES AUXILIARES DESDE AQUÍ ---
  // ... (handleFastForward, handleRewind, toggleFullscreen, useEffect para fullscreenchange) ...
  // ... (hideControls, showAndResetTimeout, useEffect para el timeout de controles) ...
  // ... (verificaciones de !url y error) ...
  // ... (cálculo de playedRatio y loadedRatio) ...
  // ... (el JSX completo del return con el player y los controles) ...

  // --- EJEMPLO DEL RETURN (SOLO PARA MOSTRAR DÓNDE VA onSeek) ---
  return (
    <div
      ref={playerWrapperRef}
      className="player-wrapper w-full aspect-video bg-black rounded-lg relative group select-none"
      onMouseMove={showAndResetTimeout} 
      onMouseLeave={() => { 
        if (playing && !seeking) {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); 
            controlsTimeoutRef.current = setTimeout(hideControls, 750); 
        }
      }}
      onTouchStart={showAndResetTimeout}
    >
      {isHlsStream ? (
        <video
          ref={hlsVideoElementRef}
          // ...otros props...
          onTimeUpdate={handleHLSProgress} // Asegura que esto llame a la lógica de initialSeekDoneRef
          className="w-full h-full object-contain focus:outline-none"
        />
      ) : (
        <ReactPlayer
          ref={playerRef}
          // ...otros props...
          onReady={handlePlayerReady} 
          onSeek={handleSeekComplete} // <--- ASEGÚRATE DE TENER ESTO
          onProgress={handleReactPlayerProgress}
          // ...otros props...
        />
      )}
       <div 
            className="absolute inset-0 z-[5]" 
            onClick={handlePlayPause}
        ></div>

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 z-20 pointer-events-none">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-400 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      
      <div
        className={`absolute inset-x-0 bottom-0 px-2 pt-10 pb-2 sm:px-3 sm:pb-3 md:px-4 md:pb-4 
                    bg-gradient-to-t from-black/80 via-black/40 to-transparent 
                    transition-opacity duration-300 ease-out z-10
                    ${showControls || !playing || seeking ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* ... Controles (barra de progreso, botones, tiempo) ... */}
        {/* El JSX de los controles es el mismo que en la versión anterior del artefacto */}
        {/* Asegúrate de copiarlo completo desde la versión anterior si es necesario */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="w-full relative h-1.5 group/progress cursor-pointer mb-1 sm:mb-1.5" 
               onMouseDown={handleSeekMouseDown} 
               onTouchStart={handleSeekMouseDown} 
               onMouseUp={handleSeekMouseUp}
               onTouchEnd={handleSeekMouseUp} 
          >
            <input type="range" min={0} max={duration || 1} step="any" value={playedSeconds} onChange={handleSeekChange} onTouchMove={(e) => handleSeekChange(e.target)} 
              className="w-full h-full absolute appearance-none bg-transparent z-20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:opacity-0 group-hover/progress:[&::-webkit-slider-thumb]:opacity-100 active:[&::-webkit-slider-thumb]:opacity-100 transition-opacity [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:opacity-0 group-hover/progress:[&::-moz-range-thumb]:opacity-100 active:[&::-moz-range-thumb]:opacity-100 transition-opacity"
            />
            <div className="w-full h-full absolute bg-white/20 rounded-full overflow-hidden"> 
              <div className="h-full bg-white/30" style={{ width: `${loadedRatio * 100}%` }}></div> 
              <div className="h-full bg-red-600 absolute top-0 left-0" style={{ width: `${playedRatio * 100}%` }}></div> 
            </div>
             <div className="absolute h-3 w-3 bg-red-500 rounded-full -mt-[4.5px] pointer-events-none opacity-0 group-hover/progress:opacity-100 active:opacity-100 transition-opacity" style={{ left: `calc(${playedRatio * 100}% - 6px)` }} ></div>
          </div>
          <div className="flex items-center justify-between text-white text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <button onClick={handlePlayPause} title={playing ? "Pausar" : "Reproducir"} className="p-1 hover:bg-white/10 rounded-full"><span className="sr-only">{playing ? "Pause" : "Play"}</span>{playing ? <PauseSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <PlaySolidIcon className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
              <button onClick={handleRewind} title="Retroceder 10s" className="p-1 hover:bg-white/10 rounded-full hidden sm:block"><span className="sr-only">Retroceder 10s</span><BackwardSolidIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
              <button onClick={handleFastForward} title="Adelantar 10s" className="p-1 hover:bg-white/10 rounded-full hidden sm:block"><span className="sr-only">Adelantar 10s</span><ForwardSolidIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
              <button onClick={handleMuteToggle} title={muted || volume === 0 ? "Quitar Silencio" : "Silenciar"} className="p-1 hover:bg-white/10 rounded-full"><span className="sr-only">{muted || volume === 0 ? "Unmute" : "Mute"}</span>{muted || volume === 0 ? <SpeakerXMarkSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <SpeakerWaveSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
              <div className="w-12 sm:w-16 md:w-20 group/volume flex items-center">
                <input type="range" min="0" max="1" step="any" value={muted ? 0 : volume} onChange={handleVolumeChange} className="w-full h-1 accent-red-600 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-500 [&::-moz-range-thumb]:border-none" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <span className="tabular-nums">{formatTime(playedSeconds)} / {formatTime(duration)}</span>
              <button onClick={toggleFullscreen} title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"} className="p-1 hover:bg-white/10 rounded-full"><span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</span>{isFullscreen ? <ArrowsPointingInSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowsPointingOutSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
