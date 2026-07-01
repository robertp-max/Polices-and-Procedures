import React, { useState } from 'react';

interface Props {
  moduleId: string;
  onComplete?: (score: number, passed: boolean, artifact?: any) => void;
}

/**
 * GAO-03: oasis_lab variant
 * SOC timepoint rail + item coding with evidence anchors + rationale
 */
export const OasisSocTrainingPanel: React.FC<Props> = ({ moduleId, onComplete }) => {
  const [selectedItem, setSelectedItem] = useState('GG0170');
  const [response, setResponse] = useState('');
  const [rationale, setRationale] = useState('');
  const [evidenceLinked, setEvidenceLinked] = useState(false);

  const items = ['B0200 Hearing', 'GG0170 Mobility', 'M0300 Wound', 'J0510 Pain', 'N0415 Meds'];

  const submitCoding = () => {
    const score = response && rationale && evidenceLinked ? 87 : 55;
    const passed = score >= 80;
    const artifact = {
      policy_id: "CL-CP-001",
      workflow_id: "wf-rn-adv-03-oasis",
      event_id: "evt-rn-adv-03-complete",
      module_id: moduleId,
      learner_id: "demo-learner",
      timestamp: new Date().toISOString(),
      assessment_score: score,
      completion_artifact_type: "oasis-item-coding",
      noPhi: true,
      type: 'oasis-item-coding',
      item: selectedItem,
      response,
      rationale,
      evidenceLinked,
      score,
      moduleId,
      policyId: "CL-CP-001",
      workflowId: "wf-rn-adv-03-oasis",
      eventId: "evt-rn-adv-03-complete",
      learnerId: "demo-learner",
      artifactType: "oasis-item-coding",
    };
    if (onComplete) onComplete(score, passed, artifact);
  };

  return (
    <div>
      <div style={{ background: '#007970', color: 'white', display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, marginBottom: 8 }}>RN-ADV-03 • OASIS-E2 SOC</div>

      {/* Timepoint rail */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {['SOC', 'ROC', 'Recert', 'DC'].map((t, i) => (
          <div key={i} style={{ padding: '2px 8px', background: i === 0 ? '#007970' : '#e5e7eb', color: i === 0 ? 'white' : '#334155', borderRadius: 4, fontSize: 11 }}>{t}</div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Item Coding Lab</div>
          {items.map(it => (
            <button key={it} onClick={() => setSelectedItem(it)} style={{ display: 'block', width: '100%', textAlign: 'left', margin: '2px 0', padding: 4, background: selectedItem === it ? '#e0f2f1' : 'white', border: '1px solid #cbd5e1', borderRadius: 4 }}>
              {it}
            </button>
          ))}
        </div>

        <div style={{ flex: 2 }}>
          <div>Data source / Observation / Response / Rationale</div>
          <select value={response} onChange={e => setResponse(e.target.value)} style={{ width: '100%', margin: '6px 0' }}>
            <option value="">Select response (GG0170 example: 02 - Substantial/max assist)</option>
            <option value="02">02 - Substantial/max assist</option>
            <option value="03">03 - Partial/moderate assist</option>
            <option value="04">04 - Supervision or touching assist</option>
          </select>
          <textarea placeholder="Rationale + clinical evidence link" value={rationale} onChange={e => setRationale(e.target.value)} style={{ width: '100%', height: 60 }} />
          <button onClick={() => setEvidenceLinked(true)} style={{ fontSize: 12 }}>Link Evidence Anchor</button>
          {evidenceLinked && <span style={{ color: '#007970' }}> ✓ Evidence linked</span>}
          <button onClick={submitCoding} style={{ marginTop: 8, background: '#C74600', color: 'white', padding: '4px 12px', borderRadius: 4 }}>Submit Coding + Rationale</button>
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#64748b' }}>Error-risk badge + guidance drawer would appear here. RN-only finalization enforced upstream.</div>
    </div>
  );
};
