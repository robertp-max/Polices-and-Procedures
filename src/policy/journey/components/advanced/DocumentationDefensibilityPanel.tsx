import React, { useState } from 'react';

interface Props {
  moduleId: string;
  onComplete?: (score: number, passed: boolean, artifact?: any) => void;
}

/**
 * GAO-04: documentation_lab variant
 * Weak vs Defensible note comparison + surveyor lens + timeline + auditorConclusion
 */
export const DocumentationDefensibilityPanel: React.FC<Props> = ({ moduleId, onComplete }) => {
  const [selected, setSelected] = useState<'weak' | 'defensible' | ''>('');
  const [auditorConclusionSeen, setAuditorConclusionSeen] = useState(false);

  const submitScenario = () => {
    const score = selected === 'defensible' && auditorConclusionSeen ? 91 : 62;
    const artifact = {
      policy_id: "CL-CD-001",
      workflow_id: "wf-rn-adv-04-doc",
      event_id: "evt-rn-adv-04-complete",
      module_id: moduleId,
      learner_id: "demo-learner",
      timestamp: new Date().toISOString(),
      assessment_score: score,
      completion_artifact_type: "doc-defensibility-scenarios",
      noPhi: true,
      type: 'doc-defensibility-scenarios',
      scenarioId: 'note-comparison-01',
      choice: selected,
      auditorConclusionSeen,
      moduleId,
      score,
      policyId: "CL-CD-001",
      workflowId: "wf-rn-adv-04-doc",
      eventId: "evt-rn-adv-04-complete",
      learnerId: "demo-learner",
      artifactType: "doc-defensibility-scenarios",
    };
    if (onComplete) onComplete(score, score >= 80, artifact);
  };

  return (
    <div>
      <div style={{ background: '#007970', color: 'white', display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>RN-ADV-04 • Documentation Lab</div>

      {/* Note comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '8px 0' }}>
        <div style={{ border: '2px solid #f87171', padding: 8, borderRadius: 6, fontSize: 12 }}>
          <strong>WEAK:</strong> "Patient doing well. Continue POC."
          <div style={{ color: '#c2410f', fontSize: 11 }}>Vague. No skilled need. No measurable response.</div>
        </div>
        <div style={{ border: '2px solid #007970', padding: 8, borderRadius: 6, fontSize: 12 }}>
          <strong>DEFENSIBLE:</strong> "Patient required skilled SN for wound care and med reconciliation per POC order. BG 186 post insulin. Daughter educated on signs of hypo. Will continue 2x/wk."
          <div style={{ color: '#007970', fontSize: 11 }}>Specific, measurable, linked to orders.</div>
        </div>
      </div>

      <div>
        Select the defensible note: 
        <button onClick={() => setSelected('weak')} style={{ margin: 4, background: selected === 'weak' ? '#fee2e2' : '' }}>Weak</button>
        <button onClick={() => setSelected('defensible')} style={{ margin: 4, background: selected === 'defensible' ? '#e0f2f1' : '' }}>Defensible</button>
      </div>

      <button onClick={() => setAuditorConclusionSeen(true)} style={{ fontSize: 12 }}>View Surveyor Lens / Auditor Conclusion</button>
      {auditorConclusionSeen && <div style={{ fontSize: 11, background: '#fefce8', padding: 4, borderRadius: 4 }}>Auditor would conclude: "Documentation supports skilled need and measurable outcome. Compliant."</div>}

      <button onClick={submitScenario} style={{ display: 'block', marginTop: 8, background: '#C74600', color: 'white', padding: '4px 12px', borderRadius: 4 }}>Submit Defensibility Review</button>

      {/* Timeline */}
      <div style={{ fontSize: 11, marginTop: 8 }}>Encounter → Note → Claim → Audit timeline supported.</div>
    </div>
  );
};
