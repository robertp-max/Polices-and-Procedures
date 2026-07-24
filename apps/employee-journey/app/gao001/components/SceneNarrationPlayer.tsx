/**
 * Lightweight scene narration player.
 * - Manual play only (no autoplay)
 * - Play / pause / restart / mute
 * - Transcript always available (authoritative)
 * - Falls back to transcript if audio fails
 * - Pauses when pauseRequested (e.g. field-notes modal open)
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface SceneNarrationPlayerProps {
  src: string;
  transcript: string;
  /** When true, pause playback (modal/field notes open). */
  pauseRequested?: boolean;
  labels?: {
    listen?: string;
    pause?: string;
    replay?: string;
    transcript?: string;
    mute?: string;
    unmute?: string;
    audioUnavailable?: string;
  };
  className?: string;
}

type PlayState = 'idle' | 'playing' | 'paused' | 'ended' | 'error';

const DEFAULT_LABELS = {
  listen: 'Listen to narration',
  pause: 'Pause narration',
  replay: 'Replay narration',
  transcript: 'Transcript',
  mute: 'Mute',
  unmute: 'Unmute',
  audioUnavailable: 'Audio unavailable. Read the transcript below.',
};

export default function SceneNarrationPlayer({
  src,
  transcript,
  pauseRequested = false,
  labels: labelsProp,
  className = '',
}: SceneNarrationPlayerProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wasPlayingBeforePause = useRef(false);

  const [playState, setPlayState] = useState<PlayState>('idle');
  const [muted, setMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [audioFailed, setAudioFailed] = useState(false);

  // Keep muted in sync with element
  useEffect(() => {
    const el = audioRef.current;
    if (el) el.muted = muted;
  }, [muted]);

  // Pause when a modal/interaction requests it; do not auto-resume
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (pauseRequested) {
      if (!el.paused) {
        wasPlayingBeforePause.current = true;
        el.pause();
        setPlayState('paused');
      }
    } else {
      wasPlayingBeforePause.current = false;
    }
  }, [pauseRequested]);

  const safePlay = useCallback(async () => {
    const el = audioRef.current;
    if (!el || audioFailed) {
      setShowTranscript(true);
      setPlayState('error');
      return;
    }
    try {
      await el.play();
      setPlayState('playing');
    } catch {
      setAudioFailed(true);
      setShowTranscript(true);
      setPlayState('error');
    }
  }, [audioFailed]);

  const handlePlayPause = () => {
    const el = audioRef.current;
    if (!el || audioFailed) {
      setShowTranscript(true);
      return;
    }
    if (playState === 'playing') {
      el.pause();
      setPlayState('paused');
      return;
    }
    void safePlay();
  };

  const handleRestart = () => {
    const el = audioRef.current;
    if (!el || audioFailed) {
      setShowTranscript(true);
      return;
    }
    el.currentTime = 0;
    void safePlay();
  };

  const handleToggleMute = () => {
    setMuted((m) => !m);
  };

  const primaryLabel =
    playState === 'playing'
      ? labels.pause
      : playState === 'ended' || playState === 'paused'
        ? labels.replay
        : labels.listen;

  // After end, primary becomes Replay; still show Listen wording on first idle
  const showReplaySecondary = playState === 'playing' || playState === 'paused';

  return (
    <div
      className={`rounded-lg border border-[#E5E4E3] bg-white/95 backdrop-blur-sm shadow-sm ${className}`}
      role="region"
      aria-label="Scene narration"
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlayState('playing')}
        onPause={() => {
          // Distinguish user/modal pause vs natural end
          const el = audioRef.current;
          if (el && el.ended) return;
          setPlayState((s) => (s === 'playing' ? 'paused' : s));
        }}
        onEnded={() => setPlayState('ended')}
        onError={() => {
          setAudioFailed(true);
          setShowTranscript(true);
          setPlayState('error');
        }}
      />

      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={handlePlayPause}
          className="text-xs font-semibold px-3 py-1.5 rounded-md bg-[#0F5B54] text-white hover:bg-[#007970] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54] disabled:opacity-60"
          aria-label={primaryLabel}
          disabled={audioFailed && playState === 'error'}
        >
          {playState === 'playing' ? labels.pause : playState === 'idle' ? labels.listen : labels.replay}
        </button>

        {showReplaySecondary && !audioFailed && (
          <button
            type="button"
            onClick={handleRestart}
            className="text-xs font-semibold px-3 py-1.5 rounded-md border border-[#E5E4E3] text-[#0F5B54] hover:bg-[#EEF4F3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54]"
            aria-label={labels.replay}
          >
            {labels.replay}
          </button>
        )}

        <button
          type="button"
          onClick={handleToggleMute}
          className="text-xs font-semibold px-3 py-1.5 rounded-md border border-[#E5E4E3] text-[#475569] hover:bg-[#F8F1E9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54]"
          aria-label={muted ? labels.unmute : labels.mute}
          aria-pressed={muted}
        >
          {muted ? labels.unmute : labels.mute}
        </button>

        <button
          type="button"
          onClick={() => setShowTranscript((v) => !v)}
          className="text-xs font-semibold px-3 py-1.5 rounded-md border border-[#E5E4E3] text-[#475569] hover:bg-[#F8F1E9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54]"
          aria-expanded={showTranscript}
          aria-controls="scene-narration-transcript"
        >
          {labels.transcript}
        </button>

        {audioFailed && (
          <span className="text-[11px] text-[#8A5C00] font-medium" role="status">
            {labels.audioUnavailable}
          </span>
        )}
      </div>

      {showTranscript && (
        <div
          id="scene-narration-transcript"
          className="border-t border-[#E5E4E3] px-3 py-2 max-h-28 overflow-y-auto"
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#C74601] mb-1">
            {labels.transcript}
          </div>
          <p className="text-xs leading-relaxed text-[#1E3A3A] whitespace-pre-line">
            {transcript}
          </p>
        </div>
      )}
    </div>
  );
}

