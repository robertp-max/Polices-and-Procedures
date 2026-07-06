import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';

export type NarrationGatePlaybackState =
  | 'not_required'
  | 'missing'
  | 'idle'
  | 'playing'
  | 'paused'
  | 'complete'
  | 'error';

export interface NarrationGateState {
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  narrationRequired: boolean;
  narrationStarted: boolean;
  narrationCompleted: boolean;
  canProceed: boolean;
  playbackState: NarrationGatePlaybackState;
  missingNarrationReason: string | null;
  statusLabel: string;
  helperText: string;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onError: () => void;
  play: () => Promise<void>;
  pause: () => void;
  resetForLesson: (lessonKey?: string) => void;
}

interface UseNarrationGateOptions {
  gateKey: string;
  audioSrc?: string | null;
  required?: boolean;
  missingNarrationReason?: string;
  onCompleted?: () => void;
}

function gateStatusLabel(playbackState: NarrationGatePlaybackState, completed: boolean): string {
  if (completed) return 'Narration complete';
  switch (playbackState) {
    case 'not_required':
      return 'No narration required';
    case 'missing':
      return 'Narration missing';
    case 'playing':
      return 'Playing narration';
    case 'paused':
    case 'idle':
      return 'Narration required';
    case 'error':
      return 'Narration unavailable';
    case 'complete':
      return 'Narration complete';
    default:
      return 'Narration required';
  }
}

function gateHelperText(
  playbackState: NarrationGatePlaybackState,
  completed: boolean,
  missingReason: string | null,
): string {
  if (completed) return 'Narration complete. You may continue.';
  switch (playbackState) {
    case 'not_required':
      return 'No narration is required for this page.';
    case 'missing':
      return missingReason ?? 'Required narration audio is missing for this page.';
    case 'playing':
      return 'Playing narration. Continue unlocks when the audio finishes.';
    case 'paused':
      return 'Finish narration to continue.';
    case 'error':
      return 'The narration file could not be loaded or played. Continue remains locked until the required narration completes.';
    case 'idle':
    case 'complete':
    default:
      return 'Finish narration to continue.';
  }
}

export function useNarrationGate({
  gateKey,
  audioSrc,
  required = true,
  missingNarrationReason,
  onCompleted,
}: UseNarrationGateOptions): NarrationGateState {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [startedByKey, setStartedByKey] = useState<Record<string, boolean>>({});
  const [completedByKey, setCompletedByKey] = useState<Record<string, boolean>>({});
  const [playbackState, setPlaybackState] = useState<NarrationGatePlaybackState>('idle');

  const normalizedGateKey = gateKey || '__advanced_narration__';
  const hasAudio = Boolean(audioSrc);
  const narrationRequired = Boolean(required);
  const narrationStarted = Boolean(startedByKey[normalizedGateKey]);
  const narrationCompleted = !narrationRequired || Boolean(completedByKey[normalizedGateKey]);
  const missingRequiredNarration = narrationRequired && !hasAudio;
  const missingNarration = missingRequiredNarration
    ? missingNarrationReason ?? `Required narration audio is missing for ${normalizedGateKey}.`
    : null;
  const canProceed = !narrationRequired || narrationCompleted;

  useEffect(() => {
    audioRef.current?.pause();

    if (!narrationRequired) {
      setPlaybackState('not_required');
      return;
    }

    if (!hasAudio) {
      setPlaybackState('missing');
      return;
    }

    setPlaybackState(completedByKey[normalizedGateKey] ? 'complete' : 'idle');
  }, [completedByKey, hasAudio, narrationRequired, normalizedGateKey]);

  const onPlay = useCallback(() => {
    if (!hasAudio || !narrationRequired) return;
    setStartedByKey((current) =>
      current[normalizedGateKey] ? current : { ...current, [normalizedGateKey]: true },
    );
    setPlaybackState('playing');
  }, [hasAudio, narrationRequired, normalizedGateKey]);

  const onPause = useCallback(() => {
    if (!narrationRequired) return;
    setPlaybackState(completedByKey[normalizedGateKey] ? 'complete' : 'paused');
  }, [completedByKey, narrationRequired, normalizedGateKey]);

  const onEnded = useCallback(() => {
    if (!narrationRequired) return;
    setCompletedByKey((current) =>
      current[normalizedGateKey] ? current : { ...current, [normalizedGateKey]: true },
    );
    setPlaybackState('complete');
    onCompleted?.();
  }, [narrationRequired, normalizedGateKey, onCompleted]);

  const onError = useCallback(() => {
    if (!narrationRequired) return;
    setPlaybackState(completedByKey[normalizedGateKey] ? 'complete' : 'error');
  }, [completedByKey, narrationRequired, normalizedGateKey]);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !hasAudio) {
      setPlaybackState(narrationRequired ? 'missing' : 'not_required');
      return;
    }

    try {
      await audio.play();
      onPlay();
    } catch {
      onError();
    }
  }, [hasAudio, narrationRequired, onError, onPlay]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    onPause();
  }, [onPause]);

  const resetForLesson = useCallback((lessonKey = normalizedGateKey) => {
    setStartedByKey((current) => {
      const next = { ...current };
      delete next[lessonKey];
      return next;
    });
    setCompletedByKey((current) => {
      const next = { ...current };
      delete next[lessonKey];
      return next;
    });
    setPlaybackState(hasAudio ? 'idle' : narrationRequired ? 'missing' : 'not_required');
  }, [hasAudio, narrationRequired, normalizedGateKey]);

  return {
    audioRef,
    narrationRequired,
    narrationStarted,
    narrationCompleted,
    canProceed,
    playbackState,
    missingNarrationReason: missingNarration,
    statusLabel: gateStatusLabel(playbackState, narrationCompleted),
    helperText: gateHelperText(playbackState, narrationCompleted, missingNarration),
    onPlay,
    onPause,
    onEnded,
    onError,
    play,
    pause,
    resetForLesson,
  };
}
