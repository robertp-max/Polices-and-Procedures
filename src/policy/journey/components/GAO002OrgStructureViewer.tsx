import { useState, useEffect } from 'react';

// === Dedicated premium scene components (one specialized team per scene) ===
import GAO002Scene01GovernanceOrgChart from './GAO002Scene01GovernanceOrgChart';
import GAO002Scene02CoverageOnCall from './GAO002Scene02CoverageOnCall';
import GAO002Scene03ReportingMap from './GAO002Scene03ReportingMap';

interface GAO002OrgStructureViewerProps {
  onComplete?: () => void;
}

/**
 * GAO-002 Premium Orchestrator
 * Thin, tasteful chrome + scene stepper that hosts the three rich dedicated scene implementations.
 * Visual language strictly follows GAO-001 Scene 4 benchmark (deep teal, navy, coral, warm cream, refined motion).
 */
export default function GAO002OrgStructureViewer(_props: GAO002OrgStructureViewerProps) {
  const STORAGE_KEY = 'gao002-interactive-progress';

  // 8 guided objectives integrated from original 8 path items
  const OBJECTIVES = [
    { id: 1, scene: 0, title: 'Why Organizational Structure Matters', desc: 'Surveyors will ask any staff to identify leaders and escalation chain.' },
    { id: 2, scene: 0, title: 'Governing Body', desc: 'Final authority under 42 CFR 484.105(a).' },
    { id: 3, scene: 0, title: 'Administrator Role', desc: 'Day-to-day operations, 484.105(b).' },
    { id: 4, scene: 0, title: 'Director of Nursing', desc: 'Supervises clinical practice, 484.105(c).' },
    { id: 5, scene: 1, title: 'Clinical Staff Structure', desc: 'Understand reporting lines for clinical staff.' },
    { id: 6, scene: 1, title: 'Your Reporting Chain', desc: 'Know who to call and on-call hierarchy.' },
    { id: 7, scene: 2, title: 'Communication Pathways', desc: 'Bypass rules and escalation paths.' },
    { id: 8, scene: 2, title: 'Ready for Post-Test', desc: 'Module summary and readiness.' },
  ];

  const [currentObjective, setCurrentObjective] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        return p.currentObjective ?? 1;
      }
    } catch {}
    return 1;
  });

  const [completedObjectives, setCompletedObjectives] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        return new Set(p.completedObjectives ?? []);
      }
    } catch {}
    return new Set();
  });

  const [isMuted, setIsMuted] = useState(false);
  const [narration, setNarration] = useState('Heidi receives the reporting map from Dana. Follow the guided objectives.');
  const [focusedArtifact, setFocusedArtifact] = useState<string | null>(null);

  // Real drawers state
  const [, setOpenDrawer] = useState<'notebook' | 'reference' | 'transcript' | null>(null);
  const [fieldNotes, setFieldNotes] = useState<Array<{ obj: number; text: string }>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const p = JSON.parse(saved);
        return p.fieldNotes ?? [];
      }
    } catch {}
    return [];
  });

  // Add note when completing objectives (called from complete + scenes)
  const addFieldNote = (obj: number, text: string) => {
    setFieldNotes(prev => {
      if (prev.some(n => n.obj === obj)) return prev;
      const next = [...prev, { obj, text }];
      return next;
    });
  };

  // Persist notes too
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const base = saved ? JSON.parse(saved) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...base,
        currentObjective,
        completedObjectives: Array.from(completedObjectives),
        fieldNotes
      }));
    } catch {}
  }, [currentObjective, completedObjectives, fieldNotes]);

  // (notes persistence handled in add + notes useEffect above for consolidated save)

  const currentObjData = OBJECTIVES.find(o => o.id === currentObjective)!;
  const currentScene = currentObjData.scene;

  const isObjectiveCompleted = (id: number) => completedObjectives.has(id);

  // Next Action callout texts (precise guidance for low-tech users)
  const getNextActionText = (objId: number): string => {
    switch (objId) {
      case 1: return 'Click the brown BRIEFING folder on the desk';
      case 2: return 'Click the GOVERNING BODY box on the big wall chart';
      case 3: return 'Click the ADMINISTRATOR box on the wall chart';
      case 4: return 'Click the DON box, then the red phone for the challenge';
      case 5: return 'Click a roster card or a hierarchy step';
      case 6: return 'Click the phone + answer the question on the right';
      case 7: return 'Click the gray lines to connect the boxes';
      case 8: return 'Complete the 4 practice boards on the right (Match, T/F, Sequence, Type)';
      default: return 'Follow the highlighted item';
    }
  };

  const advanceToNext = () => {
    if (currentObjective < 8 && isObjectiveCompleted(currentObjective)) {
      const next = currentObjective + 1;
      setCurrentObjective(next);
      setFocusedArtifact(null);
      setOpenDrawer(null);
      setNarration(`Objective ${next}: ${OBJECTIVES[next-1].title}`);
    }
  };

  const completeCurrentObjective = () => {
    const obj = currentObjective;
    setCompletedObjectives(prev => {
      const next = new Set([...prev, obj]);
      return next;
    });
    // Add to real Field Notebook
    const noteText = OBJECTIVES.find(o => o.id === obj)?.title || `Objective ${obj} complete`;
    addFieldNote(obj, `Completed: ${noteText}. Key takeaway from scene.`);
    setNarration('Objective complete. Advance to next.');
    // auto advance if possible
    setTimeout(advanceToNext, 800);
  };

  const handleArtifactClick = (artifactId: string, objId: number) => {
    if (objId !== currentObjective && !isObjectiveCompleted(objId)) {
      // Future artifact - gentle lock feedback (scenes can also show)
      setNarration(`Locked: Complete Objective ${currentObjective} first. This belongs to Objective ${objId}.`);
      return;
    }
    setFocusedArtifact(artifactId);
    // point-and-click: move focus/camera framing (subtle transform simulation)
    setNarration(`Focusing on ${artifactId}. ${isObjectiveCompleted(objId) ? 'Review mode.' : 'Review the details.'}`);
    // In real, the scene will handle zoom
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
  };

  const reset = () => {
    setCurrentObjective(1);
    setCompletedObjectives(new Set());
    setFocusedArtifact(null);
    setFieldNotes([]);
    setOpenDrawer(null);
    setNarration('Reset. Begin with Objective 1.');
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('gao002-scene1-progress');
      localStorage.removeItem('gao002-scene2-progress');
      localStorage.removeItem('gao002-scene3-progress');
    } catch {}
  };

  const progress = Math.round((completedObjectives.size / 8) * 100);

  return (
    <div className="h-full w-full overflow-hidden bg-[#F8F4ED] text-[#2C2825]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* The entire screen below the thin header is the workspace image. */}
      <div className="h-full w-full relative">
        {currentScene === 0 && (
          <GAO002Scene01GovernanceOrgChart
            currentObjective={currentObjective}
            completedObjectives={Array.from(completedObjectives)}
            onCompleteObjective={completeCurrentObjective}
            onFocusArtifact={handleArtifactClick}
            focusedArtifact={focusedArtifact}
            isMuted={isMuted}
            onAddNote={addFieldNote}
            onReset={reset}
            onToggleMute={toggleMute}
            nextActionText={getNextActionText(currentObjective)}
            progressPct={progress}
            narrationText={narration}
          />
        )}
        {currentScene === 1 && (
          <GAO002Scene02CoverageOnCall
            currentObjective={currentObjective}
            completedObjectives={Array.from(completedObjectives)}
            onCompleteObjective={completeCurrentObjective}
            onFocusArtifact={handleArtifactClick}
            focusedArtifact={focusedArtifact}
            isMuted={isMuted}
            onAddNote={addFieldNote}
            onReset={reset}
            onToggleMute={toggleMute}
            nextActionText={getNextActionText(currentObjective)}
            progressPct={progress}
            narrationText={narration}
          />
        )}
        {currentScene === 2 && (
          <GAO002Scene03ReportingMap
            currentObjective={currentObjective}
            completedObjectives={Array.from(completedObjectives)}
            onCompleteObjective={completeCurrentObjective}
            onFocusArtifact={handleArtifactClick}
            focusedArtifact={focusedArtifact}
            isMuted={isMuted}
            onAddNote={addFieldNote}
            onReset={reset}
            onToggleMute={toggleMute}
            nextActionText={getNextActionText(currentObjective)}
            progressPct={progress}
            narrationText={narration}
          />
        )}
      </div>
    </div>
  );
}
