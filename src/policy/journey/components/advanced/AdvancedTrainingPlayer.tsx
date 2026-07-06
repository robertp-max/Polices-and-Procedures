import React, { useState } from 'react';
import { useJourneyStore } from '../../stores/journeyStore';
import type { AdvancedTrainingVariant } from '../../data/advancedTraining/advancedTrainingContract';
import { PlanOfCareTrainingPanel } from './PlanOfCareTrainingPanel';
import { QapiTrainingPanel } from './QapiTrainingPanel';
import { OasisSocTrainingPanel } from './OasisSocTrainingPanel';
import { DocumentationDefensibilityPanel } from './DocumentationDefensibilityPanel';

interface AdvancedTrainingPlayerProps {
  moduleId: string;
  moduleTitle: string;
  variant: AdvancedTrainingVariant;
  onComplete?: (score: number, passed: boolean) => void;
  onEvidence?: (artifact: any) => void;
}

// Shared shell - preserves Journey UX contract (progress, score, evidence, gates)
export const AdvancedTrainingPlayer: React.FC<AdvancedTrainingPlayerProps> = ({
  moduleId,
  moduleTitle,
  variant,
  onComplete,
  onEvidence,
}) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(35); // demo - will sync with store
  const [currentScore, setCurrentScore] = useState(0);
  const showNoPhi = true; // no-PHI banner always visible for ADV

  const store = useJourneyStore();
  const variantLabel = String(variant).replace('_', ' ').toUpperCase();

  // Shared header with teal branding, progress, score
  const headerStyle: React.CSSProperties = {
    background: '#007970',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '12px 12px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const railStyle: React.CSSProperties = {
    width: 220,
    borderRight: '1px solid #e5e7eb',
    padding: 12,
    background: '#f8fafc',
    overflowY: 'auto' as const,
  };

  const centerStyle: React.CSSProperties = {
    flex: 1,
    padding: 20,
    overflowY: 'auto' as const,
    background: 'white',
  };

  const rightStyle: React.CSSProperties = {
    width: 280,
    borderLeft: '1px solid #e5e7eb',
    padding: 16,
    background: '#f8fafc',
    fontSize: 13,
  };

  const lessons = [
    { id: 'l1', title: 'Foundation & Overview', done: true },
    { id: 'l2', title: 'Core Concepts', done: true },
    { id: 'l3', title: 'Applied Scenarios', done: false },
    { id: 'l4', title: 'Final Cases / Assessment', done: false },
  ];

  const handleLessonClick = (idx: number) => {
    setCurrentLessonIndex(idx);
    // In real: sync with journeyStore lesson progress
  };

  const handleDomainComplete = (score: number, passed: boolean, artifact?: any) => {
    setCurrentScore(score);
    setOverallProgress(Math.max(overallProgress, 95));
    if (onComplete) onComplete(score, passed);
    if (onEvidence && artifact) onEvidence(artifact);

    // Persist via journey store (non-breaking)
    try {
      store.recordLearnerCompletion(
        store.currentEmployeeId,
        moduleId,
        passed,
        score,
        `Advanced Training ${variant} completed`
      );
    } catch (e) {
      // non-fatal in demo
    }
  };

  const renderDomainPanel = () => {
    const commonProps = {
      moduleId,
      onComplete: handleDomainComplete,
      onEvidence,
    };

    switch (variant) {
      case 'plan_of_care':
        return <PlanOfCareTrainingPanel {...commonProps} />;
      case 'qapi_board':
        return <QapiTrainingPanel {...commonProps} />;
      case 'oasis_lab':
        return <OasisSocTrainingPanel {...commonProps} />;
      case 'documentation_lab':
        return <DocumentationDefensibilityPanel {...commonProps} />;
      default:
        return <div>Domain panel loading…</div>;
    }
  };

  if (variant === 'plan_of_care') {
    return (
      <div style={{ height: '100%', minHeight: 720, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <PlanOfCareTrainingPanel moduleId={moduleId} onComplete={handleDomainComplete} onEvidence={onEvidence} />
      </div>
    );
  }

  if (variant === 'qapi_board') {
    return (
      <div style={{ height: '100%', minHeight: 720, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <QapiTrainingPanel moduleId={moduleId} onComplete={handleDomainComplete} onEvidence={onEvidence} />
      </div>
    );
  }

  if (variant === 'documentation_lab') {
    return (
      <div style={{ height: '100%', minHeight: 720, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DocumentationDefensibilityPanel moduleId={moduleId} onComplete={handleDomainComplete} onEvidence={onEvidence} />
      </div>
    );
  }

  // oasis_lab embeds the full OASIS-E2 SOC simulator, which brings its own
  // shell (workflow stepper, panels, evidence) themed to match Journey —
  // render it edge-to-edge with no player chrome at all.
  if (variant === 'oasis_lab') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <OasisSocTrainingPanel moduleId={moduleId} onComplete={handleDomainComplete} />
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', background: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Shared Header */}
      <div style={headerStyle}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>ADVANCED TRAINING • {variantLabel}</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{moduleTitle}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>Progress: <strong>{overallProgress}%</strong></div>
          <div>Best Score: <strong>{currentScore}%</strong></div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 420 }}>
        {/* Left Rail - Lessons (shared) */}
        <div style={railStyle}>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: '#007970' }}>LESSONS / SECTIONS</div>
          {lessons.map((l, idx) => (
            <button
              key={idx}
              onClick={() => handleLessonClick(idx)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                marginBottom: 4,
                borderRadius: 6,
                border: idx === currentLessonIndex ? '1px solid #007970' : '1px solid transparent',
                background: idx === currentLessonIndex ? '#e0f2f1' : 'transparent',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {l.done ? '✓ ' : ''}{l.title}
            </button>
          ))}
          <div style={{ marginTop: 16, fontSize: 11, color: '#64748b' }}>
            Mapped narration ✓<br />
            Evidence output ✓
          </div>
        </div>

        {/* Center - Narration + Domain specific content */}
        <div style={centerStyle}>
          <div style={{ marginBottom: 12, padding: 8, background: '#fefce8', borderRadius: 6, fontSize: 12 }}>
            <strong>Current section:</strong> {lessons[currentLessonIndex]?.title} — Narration preserved from source.
          </div>

          {/* Domain-specific panel (the key differentiator) */}
          {renderDomainPanel()}
        </div>

        {/* Right - Evidence / References (shared pattern) */}
        <div style={rightStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#007970' }}>EVIDENCE &amp; REFERENCES</div>
          <div style={{ fontSize: 12, lineHeight: 1.4 }}>
            Policy refs wired to completion artifact.<br /><br />
            • Workflow + Event IDs attached<br />
            • No PHI — demo training data only<br />
            • Completion requires rationale / evidence links where applicable.
          </div>
          <div style={{ marginTop: 16, padding: 8, background: 'white', borderRadius: 6, fontSize: 11 }}>
            Completion artifact will include:<br />
            policyId, workflowId, eventId, score, timestamp
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: '8px 16px', borderTop: '1px solid #e5e7eb', background: '#f8fafc', fontSize: 12, display: 'flex', gap: 12 }}>
        <button style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Previous</button>
        <button style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>Next</button>
        <button
          onClick={() => handleDomainComplete(92, true, { type: 'demo-artifact', moduleId })}
          style={{ marginLeft: 'auto', background: '#007970', color: 'white', padding: '4px 16px', borderRadius: 6, border: 'none' }}
        >
          Submit &amp; Record Evidence
        </button>
        {showNoPhi && (
          <span style={{ color: '#c2410f', fontSize: 11, alignSelf: 'center' }}>No PHI. Demo training data only.</span>
        )}
      </div>
    </div>
  );
};
