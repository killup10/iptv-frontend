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
  
  const [playing, setPlaying] = useState(false); 
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false); 
  const [playedSeconds, setPlayedSeconds] = useState(startTime);
  const [loadedSeconds, setLoadedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isReady, setIsReady] = useState(false); 
  const initialSeekAttemptedRef = useRef(false);

  const playingRef = useRef(playing);
  const seekingRef = useRef(seeking);
  const isFullscreenRef = useRef(isFullscreen);

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { seekingRef.current = seeking; }, [seeking]);
  useEffect(() => { isFullscreenRef.current = isFullscreen; }, [isFullscreen]);

  // Definir hideControls y showAndResetTimeout con useCallback
  // Asegurarse de que las dependencias sean estables o se lean de refs
  const hideControls = useCallback(() => {
    if (playingRef.current && !seekingRef.current) {
      setShowControls(false);
      if (isFullscreenRef.current && playerWrapperRef.current) {
        playerWrapperRef.current.classList.add('player-fullscreen-hide-cursor');
      }
    }
  }, []); // No depende de estados que cambian rápido

  const showAndResetTimeout = useCallback(() => { 
    if (playerWrapperRef.current) {
      playerWrapperRef.current.classList.remove('player-fullscreen-hide-cursor');
    }
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(hideControls, 3000); 
  }, [hideControls]); // hideControls es estable

  useEffect(() => {
    setError(null);
    const newIsHls = url && (url.toLowerCase().includes('.m3u8') || url.toLowerCase().includes('m3u8?'));
    setIsHlsStream(newIsHls);
    setPlaying(false); 
    setPlayedSeconds(startTime);
    setDuration(0);
    setLoadedSeconds(0);
    setIsBuffering(true); 
    setIsReady(false);
    initialSeekAttemptedRef.current = false; 
    showAndResetTimeout(); 
    console.log(`[VideoPlayer.jsx] useEffect [url, startTime] - URL: ${url}, startTime: ${startTime}, isHls: ${newIsHls}`);
  }, [url, startTime, showAndResetTimeout]);

  const handlePlayerReady = useCallback(() => {
    console.log(`[VideoPlayer.jsx] PLAYER IS READY. startTime: ${startTime}, initialSeekAttempted: ${initialSeekAttemptedRef.current}`);
    setIsReady(true);
    setIsBuffering(false); 

    const internalPlayer = playerRef.current?.getInternalPlayer();
    const currentDuration = internalPlayer?.duration || hlsVideoElementRef.current?.duration;
    
    if (currentDuration) {
        console.log(`[VideoPlayer.jsx] Duration set: ${currentDuration}`);
        setDuration(currentDuration);
    }

    if (startTime > 0 && currentDuration && startTime < currentDuration && !initialSeekAttemptedRef.current) {
        console.log(`[VideoPlayer.jsx] handlePlayerReady: Attempting initial seekTo: ${startTime}`);
        setPlaying(false); 
        initialSeekAttemptedRef.current = true; 

        if (playerRef.current && !isHlsStream) {
            playerRef.current.seekTo(startTime, 'seconds');
        } else if (hlsVideoElementRef.current && isHlsStream) {
            hlsVideoElementRef.current.currentTime = startTime;
            console.log(`[VideoPlayer.jsx] HLS: currentTime set to ${startTime}. Player PAUSED.`);
        }
    } else { 
        console.log(`[VideoPlayer.jsx] handlePlayerReady: No initial seek. Player PAUSED.`);
        setPlaying(false); 
        initialSeekAttemptedRef.current = true; 
    }
    showAndResetTimeout(); 
  }, [startTime, isHlsStream, showAndResetTimeout]);

  useEffect(() => {
    if (hlsInstanceRef.current) hlsInstanceRef.current.destroy();
    if (isHlsStream && Hls.isSupported() && hlsVideoElementRef.current && url) {
      const hls = new Hls({ /* ...config... */ });
      hls.loadSource(url);
      hls.attachMedia(hlsVideoElementRef.current);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { handlePlayerReady(); });
      hls.on(Hls.Events.ERROR, (event, data) => { /* ... */ });
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
            return () => hlsVideoElementRef.current?.removeEventListener('loadedmetadata', onLoadedMeta);
        } else { setError("HLS no es soportado."); setIsBuffering(false); }
    }
  }, [isHlsStream, url, handlePlayerReady]);

  const handlePlayPause = useCallback(() => {
    if (!isReady) return;
    setPlaying(prev => !prev);
    showAndResetTimeout(); 
  }, [isReady, showAndResetTimeout]);

  const handleVolumeChange = useCallback((e) => { 
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
    showAndResetTimeout();
  }, [showAndResetTimeout]);

  // CORRECCIÓN: Asegurar que handleMuteToggle esté definido con useCallback y dependencias correctas
  const handleMuteToggle = useCallback(() => { 
    const newMuted = !muted;
    setMuted(newMuted);
    if (newMuted === false && volume === 0) { // Si se desmutea y el volumen era 0
        setVolume(0.5); // Poner un volumen por defecto
    }
    showAndResetTimeout();
   }, [muted, volume, showAndResetTimeout]);

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
    }
  }, [seeking, itemId, duration, saveProgress]);

  const handleSeekChange = useCallback((e) => { 
    const newPlayedSeconds = parseFloat(e.target.value);
    setPlayedSeconds(newPlayedSeconds); 
    if (isHlsStream && hlsVideoElementRef.current) {
        hlsVideoElementRef.current.currentTime = newPlayedSeconds;
    }
    showAndResetTimeout(); 
   }, [isHlsStream, showAndResetTimeout]);

  const handleSeekMouseDown = useCallback(() => {
    setSeeking(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); 
    setShowControls(true); 
  }, []);

  const handleSeekMouseUp = useCallback((e) => { 
    setSeeking(false);
    if (playerRef.current && !isHlsStream) {
        const newPlayedSeconds = parseFloat(e.target.value); 
        playerRef.current.seekTo(newPlayedSeconds, 'seconds');
    }
    showAndResetTimeout(); 
   }, [isHlsStream, showAndResetTimeout]);
  
  const handleSeekComplete = useCallback((secondsSeekedTo) => { 
    console.log(`[VideoPlayer.jsx] ReactPlayer ONSEEK - Seek completo a: ${secondsSeekedTo}`);
    setSeeking(false); 
    if (startTime > 0 && initialSeekAttemptedRef.current && Math.abs(secondsSeekedTo - startTime) < 1.5) {
        console.log("[VideoPlayer.jsx] ReactPlayer: Initial seek to startTime complete. Player PAUSED.");
        setPlaying(false); 
    }
    showAndResetTimeout(); 
  }, [startTime, initialSeekAttemptedRef, showAndResetTimeout]);

  const handleFastForward = useCallback(() => { 
    const current = isHlsStream ? hlsVideoElementRef.current?.currentTime : playedSeconds;
    const newTime = Math.min(current + 10, duration);
    if (playerRef.current) playerRef.current.seekTo(newTime, 'seconds');
    else if (hlsVideoElementRef.current) hlsVideoElementRef.current.currentTime = newTime;
    setPlayedSeconds(newTime);
    showAndResetTimeout(); 
  }, [playedSeconds, duration, isHlsStream, showAndResetTimeout]);

  const handleRewind = useCallback(() => { 
    const current = isHlsStream ? hlsVideoElementRef.current?.currentTime : playedSeconds;
    const newTime = Math.max(current - 10, 0);
    if (playerRef.current) playerRef.current.seekTo(newTime, 'seconds');
    else if (hlsVideoElementRef.current) hlsVideoElementRef.current.currentTime = newTime;
    setPlayedSeconds(newTime);
    showAndResetTimeout(); 
  }, [playedSeconds, isHlsStream, showAndResetTimeout]);

  const toggleFullscreen = useCallback(() => { 
    const elem = playerWrapperRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
    } else {
      document.exitFullscreen();
    }
    showAndResetTimeout(); 
  }, [showAndResetTimeout]);
  
  useEffect(() => { 
    const handleFsChange = () => {
        const currentlyFullscreen = !!document.fullscreenElement;
        setIsFullscreen(currentlyFullscreen);
        showAndResetTimeout(); 
    }
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
   }, [showAndResetTimeout]); 

  useEffect(() => { 
    showAndResetTimeout(); 
    return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); };
  }, [playing, showAndResetTimeout]); 


  if (!url) return <div className="flex items-center justify-center w-full aspect-video bg-black text-orange-400 rounded-lg">No se proporcionó URL.</div>;
  if (error) return <div className="flex flex-col items-center justify-center w-full aspect-video bg-black text-red-400 p-4 rounded-lg"><strong>Error:</strong> {error} <button onClick={() => setError(null)} className="mt-2 px-3 py-1 bg-red-700 rounded text-xs">OK</button></div>;

  const playedRatio = duration > 0 ? playedSeconds / duration : 0;
  const loadedRatio = duration > 0 ? loadedSeconds / duration : 0;

  // ... (El JSX del return es el mismo que en la versión anterior del artefacto) ...
  // ... (Asegúrate de copiarlo completo desde la línea ~230 del artefacto anterior) ...
  return (
    <div
      ref={playerWrapperRef}
      className="player-wrapper w-full aspect-video bg-black rounded-lg relative group select-none"
      onMouseMove={showAndResetTimeout} 
      onMouseLeave={() => { 
        if (playingRef.current && !seekingRef.current) { 
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); 
            controlsTimeoutRef.current = setTimeout(hideControls, 750); 
        }
      }}
      onTouchStart={showAndResetTimeout}
    >
      {isHlsStream ? (
        <video
          ref={hlsVideoElementRef}
          playsInline 
          muted={muted}
          onClick={handlePlayPause}
          onPlay={() => {setPlaying(true); setIsBuffering(false); showAndResetTimeout();}}
          onPause={() => {setPlaying(false); showAndResetTimeout();}} 
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => setIsBuffering(false)}
          onLoadedMetadata={(e) => {
            setDuration(e.target.duration);
          }}
          onTimeUpdate={handleHLSProgress} 
          className="w-full h-full object-contain focus:outline-none"
        />
      ) : (
        <ReactPlayer
          ref={playerRef}
          className="react-player absolute top-0 left-0 pointer-events-none" 
          url={url}
          playing={playing}
          controls={false}
          volume={volume}
          muted={muted}
          width="100%"
          height="100%"
          onReady={handlePlayerReady} 
          onSeek={handleSeekComplete} 
          onProgress={handleReactPlayerProgress}
          onDuration={(d) => { setDuration(d);}}
          onError={e => { console.error('ReactPlayer Error:', e); setError(`Error ReactPlayer`); setIsBuffering(false);}}
          onPlay={() => {setPlaying(true); setIsBuffering(false); showAndResetTimeout();}}
          onPause={() => {setPlaying(false); showAndResetTimeout();}}
          onBuffer={() => { setIsBuffering(true);}}
          onBufferEnd={() => { setIsBuffering(false);}}
          config={{ file: { 
            attributes: { controlsList: 'nodownload', crossOrigin: 'anonymous' },
            forceVideo: true 
          }}}
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
                    ${showControls || !playingRef.current || seekingRef.current ? 'opacity-100' : 'opacity-0'}`}
      >
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
              {/* Asegúrate de que handleMuteToggle se use aquí */}
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
