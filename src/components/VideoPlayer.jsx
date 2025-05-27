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
  const saveProgress = useCallback((currentTime, duration) => {
    if (!itemId || isNaN(currentTime) || isNaN(duration) || duration === 0) return;
    if (currentTime < 5 || currentTime > duration - 15) {
      if (currentTime > duration - 15 && duration > 0) {
        try {
          const progressData = JSON.parse(localStorage.getItem('videoProgress') || '{}');
          delete progressData[itemId];
          localStorage.setItem('videoProgress', JSON.stringify(progressData));
        } catch (e) { console.error("[VideoProgress] Error limpiando progreso:", e); }
      }
      return;
    }
    try {
      const progressData = JSON.parse(localStorage.getItem('videoProgress') || '{}');
      progressData[itemId] = { time: currentTime, duration: duration, lastWatched: Date.now() };
      localStorage.setItem('videoProgress', JSON.stringify(progressData));
    } catch (e) { console.error("[VideoProgress] Error guardando progreso:", e); }
  }, [itemId]);
  return { saveProgress };
};

export default function VideoPlayer({ url, itemId, startTime = 0, initialAutoplay = true }) {
  const playerRef = useRef(null);
  const playerWrapperRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const hlsVideoElementRef = useRef(null);
  const hlsInstanceRef = useRef(null);
  const { saveProgress } = useVideoProgress(itemId);

  const [error, setError] = useState(null);
  const [isHlsStream, setIsHlsStream] = useState(false);
  const [playing, setPlaying] = useState(startTime > 0 ? false : initialAutoplay);
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
  const tracksLoadedRef = useRef(false); // Para asegurar que loadTracks se llame una vez con éxito

  const [availableAudioTracks, setAvailableAudioTracks] = useState([]);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState(null);
  const [availableTextTracks, setAvailableTextTracks] = useState([]);
  const [selectedTextTrack, setSelectedTextTrack] = useState('off'); // Iniciar en 'off'
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const trackMenuRef = useRef(null);

  const playingRef = useRef(playing);
  useEffect(() => { playingRef.current = playing; }, [playing]);
  const seekingRef = useRef(seeking);
  useEffect(() => { seekingRef.current = seeking; }, [seeking]);
  const isFullscreenRef = useRef(isFullscreen);
  useEffect(() => { isFullscreenRef.current = isFullscreen; }, [isFullscreen]);

  const hideControls = useCallback(() => {
    if (playingRef.current && !seekingRef.current && !trackMenuRef.current?.contains(document.activeElement)) {
      setShowControls(false);
      if (isFullscreenRef.current && playerWrapperRef.current) playerWrapperRef.current.classList.add('player-fullscreen-hide-cursor');
    }
  }, []);

  const showAndResetTimeout = useCallback(() => {
    if (playerWrapperRef.current) playerWrapperRef.current.classList.remove('player-fullscreen-hide-cursor');
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  useEffect(() => {
    console.log(`[VideoPlayer.jsx] Props Init/Change - URL: ${url}, startTime: ${startTime}, initialAutoplay: ${initialAutoplay}`);
    setError(null);
    const newIsHls = url && (url.toLowerCase().includes('.m3u8') || url.toLowerCase().includes('m3u8?'));
    setIsHlsStream(newIsHls);
    setPlaying(startTime > 0 ? false : initialAutoplay);
    setPlayedSeconds(startTime);
    setDuration(0); setLoadedSeconds(0); setIsBuffering(true); setIsReady(false);
    initialSeekAttemptedRef.current = false; tracksLoadedRef.current = false;
    setAvailableAudioTracks([]); setSelectedAudioTrack(null);
    setAvailableTextTracks([]); setSelectedTextTrack('off');
    setShowTrackMenu(false);
    showAndResetTimeout();
  }, [url, startTime, initialAutoplay, showAndResetTimeout]);

  const loadTracks = useCallback(() => {
    if (tracksLoadedRef.current) {
        // console.log("[VideoPlayer.jsx] loadTracks: Pistas ya intentadas cargar.");
        return;
    }
    const videoElement = hlsVideoElementRef.current || playerRef.current?.getInternalPlayer();
    if (videoElement) {
      console.log("[VideoPlayer.jsx] loadTracks: Intentando cargar pistas desde videoElement:", videoElement);

      const newAudioTracks = [];
      if (videoElement.audioTracks && videoElement.audioTracks.length > 0) {
        for (let i = 0; i < videoElement.audioTracks.length; i++) {
          const track = videoElement.audioTracks[i];
          newAudioTracks.push({ id: track.id || `audio-${i}`, label: track.label || `Audio ${i + 1}`, language: track.language || 'unknown', enabled: track.enabled });
          console.log(`[VideoPlayer.jsx] Audio Track ${i}:`, { id: track.id, label: track.label, lang: track.language, enabled: track.enabled });
        }
        setAvailableAudioTracks(newAudioTracks);
        const enabledAudioTrack = newAudioTracks.find(t => t.enabled);
        setSelectedAudioTrack(enabledAudioTrack ? enabledAudioTrack.id : (newAudioTracks[0]?.id || null));
      } else {
        console.log("[VideoPlayer.jsx] loadTracks: No se encontraron audioTracks o está vacío.");
        setAvailableAudioTracks([]);
        setSelectedAudioTrack(null);
      }

      const newTextTracks = [];
      if (videoElement.textTracks && videoElement.textTracks.length > 0) {
        for (let i = 0; i < videoElement.textTracks.length; i++) {
          const track = videoElement.textTracks[i];
          track.mode = 'hidden'; // Ocultar por defecto
          newTextTracks.push({ id: track.id || `text-${i}`, label: track.label || `Subtítulo ${i + 1}`, language: track.language || 'unknown', mode: track.mode });
           console.log(`[VideoPlayer.jsx] Text Track ${i}:`, { id: track.id, label: track.label, lang: track.language, mode: track.mode, kind: track.kind });
        }
        setAvailableTextTracks(newTextTracks);
        // selectedTextTrack ya es 'off' por defecto.
      } else {
        console.log("[VideoPlayer.jsx] loadTracks: No se encontraron textTracks o está vacío.");
        setAvailableTextTracks([]);
      }
      
      if (newAudioTracks.length > 0 || newTextTracks.length > 0) {
          tracksLoadedRef.current = true; // Marcar como cargadas si se encontró alguna
      }
      console.log("[VideoPlayer.jsx] Pistas después de cargar:", { availableAudioTracks: newAudioTracks, availableTextTracks: newTextTracks });
    } else {
        console.log("[VideoPlayer.jsx] loadTracks: videoElement no disponible aún.");
    }
  }, []); // No necesita dependencias que cambien frecuentemente

  const handlePlayerReady = useCallback(() => {
    console.log(`[VideoPlayer.jsx] PLAYER IS READY. startTime: ${startTime}, initialAutoplay: ${initialAutoplay}`);
    setIsReady(true);
    
    // Intentar cargar pistas aquí. Podría ser que para algunos formatos estén disponibles antes de 'onDuration'.
    if (!tracksLoadedRef.current) loadTracks();

    const internalPlayer = playerRef.current?.getInternalPlayer();
    const videoEl = hlsVideoElementRef.current;
    const currentDuration = internalPlayer?.duration || videoEl?.duration;
    
    if (currentDuration && !isNaN(currentDuration) && currentDuration > 0) {
        setDuration(currentDuration);
    }

    if (startTime > 0 && !initialSeekAttemptedRef.current) {
      initialSeekAttemptedRef.current = true;
      const seekDelay = isHlsStream ? 300 : 150; 
      setTimeout(() => {
        if (isReadyRef.current) {
            const targetPlayer = isHlsStream ? hlsVideoElementRef.current : playerRef.current;
            if (targetPlayer) {
                console.log(`[VideoPlayer.jsx] Intentando seek diferido a: ${startTime}`);
                if (isHlsStream) targetPlayer.currentTime = startTime;
                else targetPlayer.seekTo(startTime, 'seconds');
            }
        }
      }, seekDelay);
    } else if (!initialSeekAttemptedRef.current) {
      initialSeekAttemptedRef.current = true;
      if (!initialAutoplay) setIsBuffering(false);
    }
    showAndResetTimeout();
  }, [startTime, isHlsStream, showAndResetTimeout, initialAutoplay, loadTracks]);
  const isReadyRef = useRef(isReady); useEffect(() => { isReadyRef.current = isReady; }, [isReady]);

  useEffect(() => { // Configuración HLS
    if (hlsInstanceRef.current) hlsInstanceRef.current.destroy();
    if (isHlsStream && hlsVideoElementRef.current && url) {
      if (Hls.isSupported()) {
        const hls = new Hls({ capLevelToPlayerSize: true, abrEwmaDefaultEstimate: 500000 });
        hls.loadSource(url);
        hls.attachMedia(hlsVideoElementRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => { handlePlayerReady(); });
        hls.on(Hls.Events.ERROR, (event, data) => { setError(`Error HLS (${data.type}): ${data.details || ''}${data.fatal ? ' (Fatal)' : ''}`); setIsBuffering(false);});
        hlsInstanceRef.current = hls;
        return () => { if (hlsInstanceRef.current) hlsInstanceRef.current.destroy(); };
      } else if (hlsVideoElementRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        hlsVideoElementRef.current.src = url;
        const onLoadedMeta = () => { if (hlsVideoElementRef.current) setDuration(hlsVideoElementRef.current.duration); handlePlayerReady(); };
        hlsVideoElementRef.current.addEventListener('loadedmetadata', onLoadedMeta);
        return () => hlsVideoElementRef.current?.removeEventListener('loadedmetadata', onLoadedMeta);
      } else { setError("HLS no soportado."); setIsBuffering(false); }
    }
  }, [isHlsStream, url, handlePlayerReady]);

  useEffect(() => { // Play/Pause para HLS
    if (isHlsStream && hlsVideoElementRef.current && isReady) {
      if (playing) hlsVideoElementRef.current.play().catch(e => { setPlaying(false); });
      else hlsVideoElementRef.current.pause();
    }
  }, [playing, isHlsStream, isReady]);

  const handleSelectAudioTrack = useCallback((trackId) => { /* Sin cambios */ }, [showAndResetTimeout]);
  const handleSelectTextTrack = useCallback((trackIdOrOff) => { /* Sin cambios */ }, [showAndResetTimeout]);
  useEffect(() => { /* Cierre menú pistas sin cambios */ }, [showTrackMenu]);
  const handlePlayPause = useCallback(() => { if (!isReady) return; setPlaying(p => !p); setShowTrackMenu(false); showAndResetTimeout(); }, [isReady, showAndResetTimeout]);
  const handleVolumeChange = useCallback((e) => { const v = parseFloat(e.target.value); setVolume(v); setMuted(v === 0); setShowTrackMenu(false); showAndResetTimeout(); }, [showAndResetTimeout]);
  const handleMuteToggle = useCallback(() => { const nM = !muted; setMuted(nM); if (!nM && volume === 0) setVolume(0.5); setShowTrackMenu(false); showAndResetTimeout(); }, [muted, volume, showAndResetTimeout]);
  const handleReactPlayerProgress = useCallback((state) => { if (!seekingRef.current) setPlayedSeconds(state.playedSeconds); setLoadedSeconds(state.loadedSeconds); if (itemId && duration > 0 && !seekingRef.current) saveProgress(state.playedSeconds, duration); }, [itemId, duration, saveProgress]);
  const handleHLSProgress = useCallback(() => { if(hlsVideoElementRef.current && !seekingRef.current) { const cT = hlsVideoElementRef.current.currentTime; setPlayedSeconds(cT); if (hlsVideoElementRef.current.buffered.length > 0) setLoadedSeconds(hlsVideoElementRef.current.buffered.end(hlsVideoElementRef.current.buffered.length - 1)); if (itemId && duration > 0) saveProgress(cT, duration); }}, [itemId, duration, saveProgress]);
  const handleSeekChange = useCallback((e) => { const s = parseFloat(e.target.value); setPlayedSeconds(s); if (isHlsStream && hlsVideoElementRef.current && seekingRef.current) hlsVideoElementRef.current.currentTime = s; showAndResetTimeout(); }, [isHlsStream, showAndResetTimeout]);
  const handleSeekMouseDown = useCallback(() => { setSeeking(true); if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); setShowControls(true); setShowTrackMenu(false); }, []);
  const handleSeekMouseUp = useCallback((e) => { const s = parseFloat(e.target.value); setSeeking(false); if (playerRef.current && !isHlsStream) playerRef.current.seekTo(s, 'seconds'); else if (hlsVideoElementRef.current && isHlsStream) hlsVideoElementRef.current.currentTime = s; if (!initialAutoplay) setPlaying(false); showAndResetTimeout(); }, [isHlsStream, showAndResetTimeout, initialAutoplay]);
  const handleSeekCompleteReactPlayer = useCallback((s) => { setIsBuffering(false); if (!initialAutoplay) setPlaying(false); showAndResetTimeout(); }, [initialAutoplay, showAndResetTimeout]);
  const handleReactPlayerError = useCallback((e, data) => { let ed = "Error ReactPlayer."; if (typeof e === 'string') ed = e; else if (e?.type) ed = `Tipo: ${e.type}`; else if (data?.details) ed = data.details; else if (data?.type) ed = `HLS Error: ${data.type}, Fatal: ${data.fatal}`; setError(ed); setIsBuffering(false); setPlaying(false); }, []);
  const handleFastForward = useCallback(() => { if (!isReady) return; const c = isHlsStream ? hlsVideoElementRef.current?.currentTime : playedSeconds; const nT = Math.min(c + 10, duration || Infinity); if (playerRef.current && !isHlsStream) playerRef.current.seekTo(nT, 'seconds'); else if (hlsVideoElementRef.current && isHlsStream) hlsVideoElementRef.current.currentTime = nT; setPlayedSeconds(nT); setShowTrackMenu(false); showAndResetTimeout(); }, [playedSeconds, duration, isHlsStream, showAndResetTimeout, isReady]);
  const handleRewind = useCallback(() => { if (!isReady) return; const c = isHlsStream ? hlsVideoElementRef.current?.currentTime : playedSeconds; const nT = Math.max(c - 10, 0); if (playerRef.current && !isHlsStream) playerRef.current.seekTo(nT, 'seconds'); else if (hlsVideoElementRef.current && isHlsStream) hlsVideoElementRef.current.currentTime = nT; setPlayedSeconds(nT); setShowTrackMenu(false); showAndResetTimeout(); }, [playedSeconds, isHlsStream, showAndResetTimeout, isReady]);
  const toggleFullscreen = useCallback(() => { const el = playerWrapperRef.current; if (!el) return; if (!document.fullscreenElement) el.requestFullscreen().catch(console.error); else document.exitFullscreen().catch(console.error); setShowTrackMenu(false); showAndResetTimeout(); }, [showAndResetTimeout]);
  useEffect(() => { const hFC = () => { setIsFullscreen(!!document.fullscreenElement); showAndResetTimeout(); }; document.addEventListener('fullscreenchange', hFC); return () => document.removeEventListener('fullscreenchange', hFC); }, [showAndResetTimeout]);
  useEffect(() => { showAndResetTimeout(); return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); }; }, [playing, showAndResetTimeout]);

  if (!url) return <div className="flex items-center justify-center w-full aspect-video bg-black text-orange-400 rounded-lg">No se proporcionó URL.</div>;
  if (error) return <div className="flex flex-col items-center justify-center w-full aspect-video bg-black text-red-400 p-4 rounded-lg"><strong>Error:</strong> {error} <button onClick={() => { setError(null); }} className="mt-2 px-3 py-1 bg-red-700 rounded text-xs">OK</button></div>;

  const playedRatio = duration > 0 ? playedSeconds / duration : 0;
  const loadedRatio = duration > 0 ? loadedSeconds / duration : 0;

  return (
    <div
      ref={playerWrapperRef}
      className="player-wrapper w-full aspect-video bg-black rounded-lg relative group select-none"
      onMouseMove={showAndResetTimeout}
      onMouseLeave={() => { if (playingRef.current && !seekingRef.current && !showTrackMenu) { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); controlsTimeoutRef.current = setTimeout(hideControls, 750); }}}
      onTouchStart={showAndResetTimeout}
    >
      <div className="absolute inset-0 z-[5]" onClick={handlePlayPause}></div>
      {isHlsStream ? (
        <video
          ref={hlsVideoElementRef}
          playsInline muted={muted}
          onPlay={() => { setPlaying(true); setIsBuffering(false); showAndResetTimeout(); }}
          onPause={() => { setPlaying(false); showAndResetTimeout(); }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={() => { if (!playingRef.current) setIsBuffering(false); if (!tracksLoadedRef.current) loadTracks(); }}
          onLoadedData={() => { if (hlsVideoElementRef.current && !isReady) { if (hlsVideoElementRef.current.duration && !isNaN(hlsVideoElementRef.current.duration)) setDuration(hlsVideoElementRef.current.duration); handlePlayerReady(); if (!tracksLoadedRef.current) loadTracks(); }}}
          onTimeUpdate={handleHLSProgress}
          onSeeked={() => { setIsBuffering(false); if (!playingRef.current && hlsVideoElementRef.current) hlsVideoElementRef.current.pause(); }}
          className="w-full h-full object-contain focus:outline-none"
        />
      ) : (
        <ReactPlayer
          ref={playerRef}
          className="react-player absolute top-0 left-0 pointer-events-none"
          url={url} playing={playing} controls={false} volume={volume} muted={muted}
          width="100%" height="100%"
          onReady={() => { console.log("[ReactPlayer] Event: onReady"); handlePlayerReady(); if (!tracksLoadedRef.current) loadTracks(); }}
          onStart={() => console.log("[ReactPlayer] Event: onStart")}
          onDuration={(d) => { if (!isNaN(d) && d > 0) setDuration(d); if (!tracksLoadedRef.current && d > 0) loadTracks(); }}
          onSeek={handleSeekCompleteReactPlayer}
          onProgress={handleReactPlayerProgress}
          onError={handleReactPlayerError}
          onPlay={() => { setPlaying(true); setIsBuffering(false); showAndResetTimeout(); }}
          onPause={() => { setPlaying(false); showAndResetTimeout(); }}
          onBuffer={() => setIsBuffering(true)}
          onBufferEnd={() => setIsBuffering(false)}
          config={{ file: { attributes: { controlsList: 'nodownload', crossOrigin: 'anonymous' }, forceVideo: true }}}
        />
      )}
      {isBuffering && ( <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-25 z-20 pointer-events-none"> <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-400 border-t-white rounded-full animate-spin"></div> </div> )}
      <div className={`absolute inset-x-0 bottom-0 px-2 pt-10 pb-2 sm:px-3 sm:pb-3 md:px-4 md:pb-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ease-out z-10 ${showControls || !playingRef.current || seekingRef.current || showTrackMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="w-full relative h-1.5 group/progress cursor-pointer mb-1 sm:mb-1.5" onMouseDown={handleSeekMouseDown} onTouchStart={handleSeekMouseDown} onClick={(e) => { e.stopPropagation(); if (!duration || duration <=0) return; const r = e.currentTarget.getBoundingClientRect(); const x = e.nativeEvent.offsetX; const nps = Math.max(0, Math.min(duration, (x / r.width) * duration)); setPlayedSeconds(nps); if (playerRef.current && !isHlsStream) playerRef.current.seekTo(nps, 'seconds'); else if (hlsVideoElementRef.current && isHlsStream) hlsVideoElementRef.current.currentTime = nps; if (!initialAutoplay) setPlaying(false); showAndResetTimeout(); }}>
            <input type="range" min={0} max={duration || 1} step="any" value={playedSeconds} onChange={handleSeekChange} onMouseUp={handleSeekMouseUp} onTouchEnd={handleSeekMouseUp} onClick={(e) => e.stopPropagation()} className="w-full h-full absolute appearance-none bg-transparent z-20 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:opacity-0 group-hover/progress:[&::-webkit-slider-thumb]:opacity-100 active:[&::-webkit-slider-thumb]:opacity-100 transition-opacity [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-500 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:opacity-0 group-hover/progress:[&::-moz-range-thumb]:opacity-100 active:[&::-moz-range-thumb]:opacity-100 transition-opacity" />
            <div className="w-full h-full absolute bg-white/20 rounded-full overflow-hidden"> <div className="h-full bg-white/30" style={{ width: `${loadedRatio * 100}%` }}></div> <div className="h-full bg-red-600 absolute top-0 left-0" style={{ width: `${playedRatio * 100}%` }}></div> </div>
            <div className="absolute h-3 w-3 bg-red-500 rounded-full -mt-[4.5px] pointer-events-none opacity-0 group-hover/progress:opacity-100 active:opacity-100 transition-opacity" style={{ left: `calc(${playedRatio * 100}% - 6px)` }} ></div>
          </div>
          <div className="flex items-center justify-between text-white text-[11px] sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <button onClick={(e) => { e.stopPropagation(); handlePlayPause(); }} title={playing ? "Pausar" : "Reproducir"} className="p-1 hover:bg-white/10 rounded-full">{playing ? <PauseSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <PlaySolidIcon className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
              <button onClick={(e) => { e.stopPropagation(); handleRewind(); }} title="Retroceder 10s" className="p-1 hover:bg-white/10 rounded-full hidden sm:block"><BackwardSolidIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); handleFastForward(); }} title="Adelantar 10s" className="p-1 hover:bg-white/10 rounded-full hidden sm:block"><ForwardSolidIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
              <button onClick={(e) => { e.stopPropagation(); handleMuteToggle(); }} title={muted || volume === 0 ? "Quitar Silencio" : "Silenciar"} className="p-1 hover:bg-white/10 rounded-full">{muted || volume === 0 ? <SpeakerXMarkSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <SpeakerWaveSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
              <div className="w-12 sm:w-16 md:w-20 group/volume flex items-center" onClick={(e) => e.stopPropagation()}> <input type="range" min="0" max="1" step="any" value={muted ? 0 : volume} onChange={handleVolumeChange} className="w-full h-1 accent-red-600 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-500 [&::-moz-range-thumb]:border-none" /> </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              <span className="tabular-nums">{formatTime(playedSeconds)} / {formatTime(duration)}</span>
              {(availableAudioTracks.length > 0 || availableTextTracks.length > 0) && (
                <div className="relative" ref={trackMenuRef}>
                  <button onClick={(e) => { e.stopPropagation(); setShowTrackMenu(p => !p); showAndResetTimeout(); }} title="Configuración" className="p-1 hover:bg-white/10 rounded-full"> <Cog6ToothIcon className="w-4 h-4 sm:w-5 sm:h-5" /> </button>
                  {showTrackMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-48 sm:w-56 bg-black/90 border border-gray-700 rounded-md shadow-lg p-2 z-20 text-xs sm:text-sm" onClick={(e) => e.stopPropagation()}>
                      {availableAudioTracks.length > 0 && (<div className="mb-2"> <p className="text-gray-400 mb-1 px-1">Audio:</p> {availableAudioTracks.map(t => (<button key={t.id} onClick={() => handleSelectAudioTrack(t.id)} className={`w-full text-left px-2 py-1.5 rounded hover:bg-red-600 flex items-center justify-between ${selectedAudioTrack === t.id ? 'bg-red-700' : ''}`}><span>{t.label} ({t.language})</span>{selectedAudioTrack === t.id && <CheckIcon className="w-4 h-4" />}</button>))} </div>)}
                      {availableTextTracks.length > 0 && (<div> <p className="text-gray-400 mb-1 px-1">Subtítulos:</p> <button onClick={() => handleSelectTextTrack('off')} className={`w-full text-left px-2 py-1.5 rounded hover:bg-red-600 flex items-center justify-between ${selectedTextTrack === 'off' ? 'bg-red-700' : ''}`}><span>Desactivados</span>{selectedTextTrack === 'off' && <CheckIcon className="w-4 h-4" />}</button> {availableTextTracks.map(t => (<button key={t.id} onClick={() => handleSelectTextTrack(t.id)} className={`w-full text-left px-2 py-1.5 rounded hover:bg-red-600 flex items-center justify-between ${selectedTextTrack === t.id ? 'bg-red-700' : ''}`}><span>{t.label} ({t.language})</span>{selectedTextTrack === t.id && <CheckIcon className="w-4 h-4" />}</button>))} </div>)}
                      {availableAudioTracks.length === 0 && availableTextTracks.length === 0 && (<p className="text-gray-400 text-center">No hay pistas adicionales.</p>)}
                    </div>
                  )}
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"} className="p-1 hover:bg-white/10 rounded-full">{isFullscreen ? <ArrowsPointingInSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowsPointingOutSolidIcon className="w-4 h-4 sm:w-5 sm:h-5" />}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
