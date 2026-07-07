import { useState, useEffect } from 'react';

// === Dedicated premium scene components (one specialized team per scene) ===
import GAO002Scene01GovernanceOrgChart from './GAO002Scene01GovernanceOrgChart';
import GAO002Scene02CoverageOnCall from './GAO002Scene02CoverageOnCall';
import GAO002Scene03ReportingMap from './GAO002Scene03ReportingMap';

import { ChevronLeft, ChevronRight, Volume2, VolumeX, RotateCcw, Award } from 'lucide-react';

interface GAO002OrgStructureViewerProps {
  onComplete?: () => void;
}

/**
 * GAO-002 Premium Orchestrator
 * Thin, tasteful chrome + scene stepper that hosts the three rich dedicated scene implementations.
 * Visual language strictly follows GAO-001 Scene 4 benchmark (deep teal, navy, coral, warm cream, refined motion).
 */
export default function GAO002OrgStructureViewer({ onComplete }: GAO002OrgStructureViewerProps) {
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

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentObjective,
        completedObjectives: Array.from(completedObjectives)
      }));
    } catch {}
  }, [currentObjective, completedObjectives]);

  const currentObjData = OBJECTIVES.find(o => o.id === currentObjective)!;
  const currentScene = currentObjData.scene;

  const isObjectiveCompleted = (id: number) => completedObjectives.has(id);

  const advanceToNext = () => {
    if (currentObjective < 8 && isObjectiveCompleted(currentObjective)) {
      const next = currentObjective + 1;
      setCurrentObjective(next);
      setFocusedArtifact(null);
      setNarration(`Objective ${next}: ${OBJECTIVES[next-1].title}`);
    }
  };

  const completeCurrentObjective = () => {
    setCompletedObjectives(prev => new Set([...prev, currentObjective]));
    setNarration('Objective complete. Advance to next.');
    // auto advance if possible
    setTimeout(advanceToNext, 800);
  };

  const handleArtifactClick = (artifactId: string, objId: number) => {
    if (objId !== currentObjective) return;
    setFocusedArtifact(artifactId);
    // point-and-click: move focus/camera framing (subtle transform simulation)
    setNarration(`Focusing on ${artifactId}. Review the details.`);
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
    setNarration('Reset. Begin with Objective 1.');
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('gao002-scene1-progress');
      localStorage.removeItem('gao002-scene2-progress');
      localStorage.removeItem('gao002-scene3-progress');
    } catch {}
  };

  const progress = Math.round((completedObjectives.size / 8) * 100);
  const breadcrumb = `Scene ${currentScene + 1} • Objective ${currentObjective}/8: ${currentObjData.title}`;

  return (
    <div className="h-full w-full flex flex-col bg-[#FAFBF8] overflow-hidden text-[#2C2825]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        .workspace-full { width: 100%; height: 100%; }
        .objective-chip { background: #0F5B54; color: white; }
        .artifact-hotspot { cursor: pointer; }
        .artifact-hotspot.locked { opacity: 0.4; cursor: not-allowed; }
        .camera-focus { transition: transform 400ms ease; }
      `}</style>

      {/* Premium header - keep Save & Exit style, full workspace */}
      <div className="shrink-0 border-b border-[#E5E4E3] bg-white px-5 py-3 flex items-center gap-3">
        <div className="min-w-0">
          <div className="uppercase tracking-[1.5px] text-[10px] font-bold text-[#C74601]">GAO-002 • A NEW JOURNEY</div>
          <div className="font-semibold text-[19px] leading-none tracking-[-0.3px] text-[#004142] mt-1">Organizational Structure &amp; Reporting</div>
        </div>

        {/* Breadcrumb / objective path */}
        <div className="ml-auto text-xs font-mono text-[#5F5A57] px-3 py-1 bg-[#F4F1EA] rounded">
          {breadcrumb}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-[#E5E4E3]">
          <button onClick={toggleMute} className="flex items-center gap-1 px-2.5 py-1 text-xs border rounded-full hover:bg-white" aria-label="Toggle sound">
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />} <span className="hidden md:inline text-[10px]">SOUND</span>
          </button>
          <button onClick={reset} className="p-1.5 rounded hover:bg-white border" title="Reset">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Current Objective chip - in workspace */}
      <div className="shrink-0 px-5 py-2 bg-white border-b flex items-center gap-3">
        <div className="objective-chip px-3 py-1 rounded text-xs font-bold tracking-wider">
          CURRENT OBJECTIVE {currentObjective}/8
        </div>
        <div className="text-sm font-medium">{currentObjData.title}</div>
        <div className="text-xs text-[#5F5A57] ml-2">{currentObjData.desc}</div>
        <div className="ml-auto text-xs font-mono">{progress}% COMPLETE</div>
      </div>

      {/* Full workspace - entire screen for SVG + in-scene UI */}
      <div className="flex-1 min-h-0 relative workspace-full overflow-hidden">
        {/* Scene content with point-and-click */}
        <div className="absolute inset-0">
          {currentScene === 0 && (
            <GAO002Scene01GovernanceOrgChart
              currentObjective={currentObjective}
              onCompleteObjective={completeCurrentObjective}
              onFocusArtifact={handleArtifactClick}
              focusedArtifact={focusedArtifact}
              isMuted={isMuted}
            />
          )}
          {currentScene === 1 && (
            <GAO002Scene02CoverageOnCall
              currentObjective={currentObjective}
              onCompleteObjective={completeCurrentObjective}
              onFocusArtifact={handleArtifactClick}
              focusedArtifact={focusedArtifact}
              isMuted={isMuted}
            />
          )}
          {currentScene === 2 && (
            <GAO002Scene03ReportingMap
              currentObjective={currentObjective}
              onCompleteObjective={completeCurrentObjective}
              onFocusArtifact={handleArtifactClick}
              focusedArtifact={focusedArtifact}
              isMuted={isMuted}
            />
          )}
        </div>

        {/* In-scene drawers / notebook (inside workspace, not left panel) */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 z-10">
          <button className="px-3 py-1 text-xs bg-white border rounded shadow text-[#0F5B54]" onClick={() => setNarration('Field Notebook: [accumulated notes from objectives]')}>Field Notebook</button>
          <button className="px-3 py-1 text-xs bg-white border rounded shadow text-[#0F5B54]" onClick={() => setNarration('Reference Notes: 42 CFR 484.105, GV-OG-001')}>Reference Notes</button>
          <button className="px-3 py-1 text-xs bg-white border rounded shadow text-[#0F5B54]" onClick={() => setNarration(narration)}>Transcript</button>
        </div>
      </div>

      {/* Bottom controls - keep tasteful */}
      <div className="shrink-0 border-t bg-white px-4 py-3 text-sm flex flex-col md:flex-row gap-2 md:items-center">
        <div className="flex-1 text-[#524C4B] pr-3">
          <span className="uppercase tracking-widest text-[9px] font-bold text-[#C74601]">LIVE NARRATION</span>
          <div className="leading-tight mt-0.5">{narration}</div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button onClick={() => { if (currentObjective > 1) setCurrentObjective(currentObjective - 1); }} disabled={currentObjective === 1} className="px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1 disabled:opacity-40">
            <ChevronLeft size={15} /> PREV OBJ
          </button>
          <button onClick={advanceToNext} disabled={!isObjectiveCompleted(currentObjective) || currentObjective === 8} className="px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1 disabled:opacity-40">
            NEXT OBJ <ChevronRight size={15} />
          </button>

          {isObjectiveCompleted(8) && (
            <button onClick={() => { if (onComplete) onComplete(); }} className="px-4 py-1.5 rounded-2xl bg-[#C74601] text-white text-xs font-bold tracking-wider flex items-center gap-1">
              <Award size={15} /> REPORTING LINES PRACTICE COMPLETE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
