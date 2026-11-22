import { useState, useEffect, useCallback } from 'react';
import { Volume2, Pause, Play, Square, VolumeX } from 'lucide-react';
import { speechService } from '../services/speechService';
import { useApp, Actions } from '../context/AppContext';
import { t } from '../data/translations';

export function ListenButton({ text, lang, id, className = '', label = null, variant = 'normal' }) {
  const { state, dispatch } = useApp();
  const activeLang = lang || state.language;
  const isSpeakingThis = state.speakingId === id;

  const [paused, setPaused] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  useEffect(() => {
    if (!speechService.isSupported()) {
      setUnsupported(true);
    }
  }, []);

  // Reset local paused state if speech stops or another item plays
  useEffect(() => {
    if (!isSpeakingThis) {
      setPaused(false);
    }
  }, [isSpeakingThis]);

  const handlePlay = useCallback(() => {
    if (!speechService.isSupported() || !text) return;
    dispatch({ type: Actions.SET_SPEAKING_ID, payload: id });
    setPaused(false);

    speechService.speak(
      text,
      activeLang,
      () => {
        dispatch({ type: Actions.SET_SPEAKING_ID, payload: null });
        setPaused(false);
      },
      () => {
        dispatch({ type: Actions.SET_SPEAKING_ID, payload: null });
        setPaused(false);
      }
    );
  }, [text, activeLang, id, dispatch]);

  const handlePause = useCallback(() => {
    speechService.pause();
    setPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    speechService.resume();
    setPaused(false);
  }, []);

  const handleStop = useCallback(() => {
    speechService.stop();
    dispatch({ type: Actions.SET_SPEAKING_ID, payload: null });
    setPaused(false);
  }, [dispatch]);

  if (unsupported) {
    return (
      <div
        className={`inline-flex items-center gap-2 text-slate-warm text-sm ${className}`}
        title="Speech playback not supported in this browser"
      >
        <VolumeX size={18} />
        <span>Audio unavailable</span>
      </div>
    );
  }

  const isSmall = variant === 'small';

  if (!isSpeakingThis) {
    return (
      <button
        onClick={handlePlay}
        className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 border border-brand-teal/20 bg-eucalyptus hover:bg-eucalyptus/80 text-brand-teal active:scale-95 focus:outline-none focus:ring-4 focus:ring-brand-teal/20 ${
          isSmall
            ? 'px-3 py-2 text-sm min-h-[42px]'
            : 'px-4 py-2.5 text-base min-h-[48px]'
        } ${className}`}
        aria-label={label || `Listen to instruction: ${text ? text.slice(0, 40) : ''}`}
      >
        <Volume2 size={isSmall ? 18 : 22} className="text-brand-teal flex-shrink-0 animate-pulse-soft" />
        <span>{label || t(state.language, 'carePlan', 'listenBtn')}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 p-1 bg-white/95 rounded-xl border-2 border-brand-teal shadow-md ${className}`}
      role="group"
      aria-label="Speech playback controls"
    >
      {paused ? (
        <button
          onClick={handleResume}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-teal text-white text-sm font-semibold hover:bg-brand-teal-hover transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal"
          aria-label="Resume listening"
        >
          <Play size={16} fill="currentColor" />
          <span>{t(state.language, 'carePlan', 'resumeBtn')}</span>
        </button>
      ) : (
        <button
          onClick={handlePause}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-warning/10 text-amber-dark border border-amber-warning/30 text-sm font-semibold hover:bg-amber-warning/20 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-warning"
          aria-label="Pause listening"
        >
          <Pause size={16} />
          <span>{t(state.language, 'carePlan', 'pauseBtn')}</span>
        </button>
      )}

      <button
        onClick={handleStop}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-terracotta/10 text-terracotta border border-terracotta/30 text-sm font-semibold hover:bg-terracotta/20 transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta"
        aria-label="Stop listening"
      >
        <Square size={14} fill="currentColor" />
        <span>{t(state.language, 'carePlan', 'stopBtn')}</span>
      </button>
    </div>
  );
}

export default ListenButton;
