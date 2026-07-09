/**
 * GAO-001 v1.1 learner module
 * Route target: /journey/gao-001-v1-1
 *
 * Scene 4 is the signature interactive field visit. Other scenes are simple
 * LMS lesson cards to keep learner momentum high.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  audio,
  SCENE_LABELS,
  SCENE_TITLES,
  MuteToggle,
  ProgressRail,
} from './gao001-shared';
import type { SceneId, SceneProgress } from './gao001-shared';

// Scene imports (real .tsx implementations)
import Scene01WelcomeDesk from './Scene01WelcomeDesk';
import Scene02MissionBriefing from './Scene02MissionBriefing';
import Scene03VisionPillars from './Scene03VisionPillars';
import Scene04CoreValuesFieldPractice from './Scene04CoreValuesFieldPractice';
import Scene05HomeHealthDifference from './Scene05HomeHealthDifference';
import Scene06ReportingEscalation from './Scene06ReportingEscalation';
import Scene07PatientRefusal from './Scene07PatientRefusal';
import Scene08EscalationPractice from './Scene08EscalationPractice';
import Scene09ReadinessMap from './Scene09ReadinessMap';

const STORAGE_KEY = 'gao001-v11-progress';

const ALL_SCENES: SceneId[] = ['s01', 's02', 's03', 's04', 's05', 's06', 's07', 's08', 's09'];

interface SceneCompletionState {
  [key: string]: boolean;
}

// Inject premium scene styles (reduced-motion safe) once
const injectGAOStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('gao001-v11-styles')) return;
  const style = document.createElement('style');
  style.id = 'gao001-v11-styles';
  style.textContent = `
    @keyframes mailBlink { 0%,100%{opacity:1} 50%{opacity:0.25} }
    .mail-blink { animation: mailBlink 1.2s ease-in-out infinite; }
    @keyframes gentlePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.015)} }
    .gentle-pulse { animation: gentlePulse 2.2s ease-in-out infinite; }
    @keyframes gao001Shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
    .gao001-shake { animation: gao001Shake 0.38s ease; }
    @media (prefers-reduced-motion: reduce) {
      .mail-blink, .gentle-pulse, .gao001-shake { animation: none !important; }
    }
    .desk-clickable { cursor: pointer; transition: all 0.15s ease; }
    .desk-clickable:hover { filter: brightness(1.08) drop-shadow(0 2px 6px rgba(15,91,84,0.25)); }
    .desk-clickable:focus-visible { outline: 3px solid #0F5B54; outline-offset: 3px; }
  `;
  document.head.appendChild(style);
};

export default function GAO001V11Viewer() {
  React.useEffect(() => { injectGAOStyles(); }, []);
  const [currentScene, setCurrentScene] = useState<SceneId>('s01');
  const [isMuted, setIsMuted] = useState(false);
  const [completions, setCompletions] = useState<SceneCompletionState>({});
  const [sceneProgress, setSceneProgress] = useState<Record<SceneId, SceneProgress>>({} as any);

  // Load browser progress for this learner route.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.completions) setCompletions(saved.completions);
        if (saved.sceneProgress) setSceneProgress(saved.sceneProgress);
        if (typeof saved.currentScene === 'string') setCurrentScene(saved.currentScene);
      }
    } catch {}
  }, []);

  // Persist browser progress for this learner route.
  const persist = useCallback((nextCompletions: SceneCompletionState, nextProgress?: Record<SceneId, SceneProgress>, nextCurrent?: SceneId) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        completions: nextCompletions,
        sceneProgress: nextProgress ?? sceneProgress,
        currentScene: nextCurrent ?? currentScene,
      }));
    } catch {}
  }, [sceneProgress, currentScene]);

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    audio.setMuted(next);
  };

  const markSceneComplete = (sid: SceneId) => {
    const next = { ...completions, [sid]: true };
    setCompletions(next);
    persist(next);
    // Auto-advance hint (not forced)
    const idx = ALL_SCENES.indexOf(sid);
    if (idx < ALL_SCENES.length - 1) {
      // do not auto-jump; user controls navigation
    }
  };

  const updateSceneProgress = (sid: SceneId, prog: SceneProgress) => {
    const next = { ...sceneProgress, [sid]: prog };
    setSceneProgress(next);
    persist(completions, next);
  };

  const goToScene = (sid: SceneId) => {
    setCurrentScene(sid);
    persist(completions, sceneProgress, sid);
    audio.play('advance');
  };

  const goPrev = () => {
    const idx = ALL_SCENES.indexOf(currentScene);
    if (idx > 0) goToScene(ALL_SCENES[idx - 1]);
  };
  const goNext = () => {
    const idx = ALL_SCENES.indexOf(currentScene);
    if (idx < ALL_SCENES.length - 1) goToScene(ALL_SCENES[idx + 1]);
  };

  const completedCount = Object.keys(completions).filter(k => completions[k as SceneId]).length;

  const renderCurrentScene = () => {
    const commonProps = {
      onComplete: () => markSceneComplete(currentScene),
      initialProgress: sceneProgress[currentScene],
      onProgressChange: (p: SceneProgress) => updateSceneProgress(currentScene, p),
      isMuted,
      onMuteToggle: handleMuteToggle,
    };

    switch (currentScene) {
      case 's01': return <Scene01WelcomeDesk {...commonProps} />;
      case 's02': return <Scene02MissionBriefing {...commonProps} />;
      case 's03': return <Scene03VisionPillars {...commonProps} />;
      case 's04': return <Scene04CoreValuesFieldPractice {...commonProps} />;
      case 's05': return <Scene05HomeHealthDifference {...commonProps} />;
      case 's06': return <Scene06ReportingEscalation {...commonProps} />;
      case 's07': return <Scene07PatientRefusal {...commonProps} />;
      case 's08': return <Scene08EscalationPractice {...commonProps} />;
      case 's09': return <Scene09ReadinessMap {...commonProps} onReadyForPostTest={() => markSceneComplete('s09')} />;
      default: return <div>Scene not found</div>;
    }
  };

  return (
    <div className="bg-[#FDF8F3] text-[#1E3A3A] font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header bar */}
      <div className="sticky top-0 z-50 border-b border-[#E5E4E3] bg-white/95 backdrop-blur">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 rounded bg-[#0F5B54] text-white text-xs font-bold tracking-[1px]">GAO-001</div>
            <div>
              <div className="font-semibold">A New Journey</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="hidden sm:block text-xs px-2 py-0.5 rounded bg-[#E8F5F3] text-[#0F5B54]">
              {completedCount}/9 lessons complete
            </div>
            <MuteToggle isMuted={isMuted} onToggle={handleMuteToggle} />
            <a href="/journey" className="text-xs px-2 py-1 text-[#0F5B54] hover:underline">Back to Journey</a>
          </div>
        </div>

        {/* Scene nav */}
        <div className="border-t border-[#E5E4E3] bg-white">
          <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto text-sm">
            {ALL_SCENES.map((sid, idx) => {
              const isActive = sid === currentScene;
              const isDone = !!completions[sid];
              return (
                <button
                  key={sid}
                  onClick={() => goToScene(sid)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-md transition text-xs font-medium border focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0F5B54] ${
                    isActive
                      ? 'bg-[#0F5B54] text-white border-[#0F5B54]'
                      : isDone
                      ? 'bg-[#E6F4E9] text-[#006B3A] border-[#006B3A]'
                      : 'bg-white hover:bg-[#F8F1E9] border-[#E5E4E3] text-[#475569]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {idx + 1}. {SCENE_LABELS[sid]}
                  {isDone && ' ✓'}
                </button>
              );
            })}
            <div className="ml-auto flex gap-1">
              <button onClick={goPrev} disabled={currentScene === 's01'} className="px-2 py-1 text-xs border rounded disabled:opacity-40">← Prev</button>
              <button onClick={goNext} disabled={currentScene === 's09'} className="px-2 py-1 text-xs border rounded disabled:opacity-40">Next →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[1.5px] text-[#64748B]">{SCENE_TITLES[currentScene]}</div>
            <div className="text-xl font-semibold text-[#0F5B54]">{SCENE_LABELS[currentScene]}</div>
          </div>
          <ProgressRail current={completedCount} total={9} label="Overall module practice progress" />
        </div>

        {/* Scene viewport */}
        <div className="rounded-2xl border border-[#E5E4E3] bg-white shadow-sm overflow-hidden">
          {renderCurrentScene()}
        </div>

        <div className="mt-4 flex items-center justify-end text-xs text-[#64748B]">
          <div className="font-mono text-[10px]">GAO-001</div>
        </div>
      </div>
    </div>
  );
}
