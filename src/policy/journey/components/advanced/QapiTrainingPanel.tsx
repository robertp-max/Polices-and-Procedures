import React, { useState } from 'react';

interface Props {
  moduleId: string;
  onComplete?: (score: number, passed: boolean, artifact?: any) => void;
}

/**
 * GAO-02: qapi_board variant
 * KPI tiles + PIP lifecycle + RCA/CAPA + committee checklist
 */
export const QapiTrainingPanel: React.FC<Props> = ({ moduleId, onComplete }) => {
  const [kpiScore, setKpiScore] = useState(78);
  const [pipSelected, setPipSelected] = useState(false);
  const [rcaStep, setRcaStep] = useState(0);
  const [committeeChecked, setCommitteeChecked] = useState(0);

  const handlePIP = () => {
    setPipSelected(true);
    setKpiScore(91);
  };

  const handleRCA = () => setRcaStep(s => Math.min(3, s + 1));

  const handleCommittee = () => {
    const next = committeeChecked + 1;
    setCommitteeChecked(next);
    if (next >= 3 && onComplete) {
      const score = 88;
      onComplete(score, true, { 
        policy_id: "QA-PG-001", workflow_id: "wf-rn-adv-02-qapi", event_id: "evt-rn-adv-02-complete",
        module_id: moduleId, learner_id: "demo-learner", timestamp: new Date().toISOString(),
        assessment_score: score, completion_artifact_type: "qapi-pip-evidence", noPhi: true,
        policyId: "QA-PG-001", workflowId: "wf-rn-adv-02-qapi", eventId: "evt-rn-adv-02-complete",
        moduleId, learnerId: "demo-learner", score, artifactType: "qapi-pip-evidence"
      });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ background: '#007970', color: 'white', fontSize: 11, padding: '1px 6px', borderRadius: 3 }}>RN-ADV-02</div>
        <strong>QAPI Command Board</strong>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Hospitalization Rate', val: '12.4%' },
          { label: 'Patient Satisfaction', val: kpiScore + '%' },
          { label: 'Active PIPs', val: pipSelected ? '3' : '2' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#f1f5f9', padding: 8, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 11 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#007970' }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* PIP Lifecycle */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>PIP Lifecycle</div>
        <button onClick={handlePIP} style={{ padding: '4px 10px', background: pipSelected ? '#e0f2f1' : '#007970', color: pipSelected ? '#007970' : 'white', borderRadius: 4 }}>
          {pipSelected ? 'PIP Active ✓' : 'Launch Improvement Project'}
        </button>
      </div>

      {/* RCA/CAPA */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 600 }}>RCA / CAPA Decision Tree</div>
        <div>Step {rcaStep}/3</div>
        <button onClick={handleRCA} style={{ fontSize: 12, padding: '2px 8px' }}>Advance RCA Step</button>
      </div>

      {/* Committee checklist */}
      <div>
        <div style={{ fontWeight: 600 }}>Committee Evidence Checklist</div>
        {[1,2,3].map(i => (
          <div key={i}>
            <label>
              <input type="checkbox" onChange={handleCommittee} /> Minutes + data review #{i}
            </label>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, marginTop: 8, color: '#64748b' }}>From finding → improvement flow complete when all checked. Score tracked.</div>
    </div>
  );
};
