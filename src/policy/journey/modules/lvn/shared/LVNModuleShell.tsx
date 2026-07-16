import { useState } from 'react';
import './LVNModuleShell.css';

export const lvnShellTheme = {
  primary: 'var(--brand-teal, #00797D)',
  primaryDark: 'var(--brand-teal-deep, #004142)',
  primaryLight: 'var(--tone-teal-bg, #F7FEFF)',
  primaryBorder: 'var(--tone-teal-border, #C4F4F5)',
  accent: 'var(--brand-orange, #C74601)',
  bg: '#FAFBF8',
  panel: 'var(--ci-surface-white, #FFFFFF)',
  text: 'var(--text-primary, #1C2422)',
  muted: 'var(--text-muted, #6F7775)',
  secondary: 'var(--text-secondary, #524D4B)',
  border: '#E5E4E3',
  shadow: 'var(--shadow-rest, 0 18px 44px rgba(0, 47, 48, 0.08), 0 2px 12px rgba(0, 47, 48, 0.04))',
};

export interface LVNLessonItem {
  id?: number | string;
  title: string;
}

interface LVNLessonNavigationProps {
  lessons: LVNLessonItem[];
  activeIndex: number;
  onLessonChange: (index: number) => void;
  onSaveExit?: () => void;
  saveExitLabel?: string;
}

export function LVNLessonNavigation({
  lessons,
  activeIndex,
  onLessonChange,
  onSaveExit,
  saveExitLabel = 'Save & Exit',
}: LVNLessonNavigationProps) {
  return (
    <header className="lvn-shared-topbar" aria-label="LVN lesson navigation">
      <div className="lvn-shared-pill-scroller" role="list" aria-label="Lessons">
        {lessons.map((lesson, index) => {
          const active = activeIndex === index;
          const shortTitle = String(lesson.title || `Lesson ${index + 1}`).split(' — ')[0];
          return (
            <button
              key={lesson.id ?? index}
              type="button"
              role="listitem"
              className={`lvn-shared-lesson-pill${active ? ' is-active' : ''}`}
              aria-current={active ? 'step' : undefined}
              title={`${index + 1}. ${lesson.title}`}
              onClick={() => onLessonChange(index)}
            >
              <span className="lvn-shared-pill-marker" aria-hidden />
              <span className="lvn-shared-pill-label">{index + 1}. {shortTitle}</span>
            </button>
          );
        })}
      </div>
      <button type="button" className="lvn-shared-save-exit" onClick={onSaveExit ?? (() => window.history.back())}>
        {saveExitLabel}
      </button>
    </header>
  );
}

interface LVNNarrationFooterProps {
  currentIndex: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  centerLabel?: string;
  timeLabel?: string;
  playing?: boolean;
  onPlayPause?: () => void;
}

export function LVNNarrationFooter({
  currentIndex,
  total,
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
  nextLabel,
  centerLabel,
  timeLabel = '00:00 / 00:00',
  playing,
  onPlayPause,
}: LVNNarrationFooterProps) {
  const [internalPlaying, setInternalPlaying] = useState(false);
  const isPlaying = playing ?? internalPlaying;
  const handlePlayPause = onPlayPause ?? (() => setInternalPlaying((value) => !value));

  return (
    <footer className="lvn-shared-footer" aria-label="LVN lesson player navigation">
      <button
        type="button"
        className="lvn-shared-footer-button lvn-shared-footer-button--previous"
        onClick={onPrevious}
        disabled={previousDisabled}
      >
        Previous Lesson
      </button>

      <div className="lvn-shared-footer-center" aria-live="polite">
        <button
          type="button"
          className="lvn-shared-play-button"
          onClick={handlePlayPause}
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
        >
          {isPlaying ? 'Ⅱ' : '▶'}
        </button>
        <div className="lvn-shared-time-pill">{timeLabel}</div>
        <div className="lvn-shared-lesson-count">
          {centerLabel ?? `Lesson ${Math.min(currentIndex + 1, total)} of ${total}`}
        </div>
      </div>

      <button
        type="button"
        className="lvn-shared-footer-button lvn-shared-footer-button--next"
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel ?? (currentIndex < total - 1 ? 'Next Lesson →' : 'Start Quiz →')}
      </button>
    </footer>
  );
}
