const fallbackData = {
  learners: [
    { id: 'passing', name: 'Passing learner', profile: { legalName: true, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: true, interaction: true, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: true, affidavitComplete: true, certificateFieldsPopulated: true, adminHoldClear: true }, optionalClinical: { hub: true, skills: true, confidence: true, documentation: true, help: true } },
    { id: 'missing-legal-name', name: 'Missing legal name learner', profile: { legalName: false, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: true, interaction: true, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: true, affidavitComplete: true, certificateFieldsPopulated: false, adminHoldClear: true }, optionalClinical: { hub: false, skills: false, confidence: false, documentation: false, help: false } },
    { id: 'missing-cna-number', name: 'Missing CNA number learner', profile: { legalName: true, cnaNumber: false }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: true, interaction: true, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: true, affidavitComplete: true, certificateFieldsPopulated: false, adminHoldClear: true }, optionalClinical: { hub: false, skills: false, confidence: false, documentation: false, help: false } },
    { id: 'skipped-online-cap', name: 'Skipped online cap acknowledgement learner', profile: { legalName: true, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: false, theoryActivity: true, interaction: true, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: true, affidavitComplete: true, certificateFieldsPopulated: true, adminHoldClear: true }, optionalClinical: { hub: false, skills: false, confidence: false, documentation: false, help: false } },
    { id: 'skipped-theory', name: 'Skipped theory activity learner', profile: { legalName: true, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: false, interaction: true, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: true, affidavitComplete: true, certificateFieldsPopulated: true, adminHoldClear: true }, optionalClinical: { hub: true, skills: true, confidence: false, documentation: false, help: false } },
    { id: 'skipped-interaction', name: 'Skipped interaction learner', profile: { legalName: true, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: true, interaction: false, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: true, affidavitComplete: true, certificateFieldsPopulated: true, adminHoldClear: true }, optionalClinical: { hub: false, skills: false, confidence: false, documentation: false, help: false } },
    { id: 'insufficient-active-time', name: 'Insufficient active-time learner', profile: { legalName: true, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: true, interaction: true, activeTimeMet: false, manualReviewHoldCleared: false, finalExamPassed: true, affidavitComplete: true, certificateFieldsPopulated: true, adminHoldClear: true }, optionalClinical: { hub: false, skills: false, confidence: false, documentation: false, help: false } },
    { id: 'failed-exam', name: 'Failed exam learner', profile: { legalName: true, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: true, interaction: true, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: false, affidavitComplete: true, certificateFieldsPopulated: true, adminHoldClear: true }, optionalClinical: { hub: false, skills: false, confidence: false, documentation: false, help: false } },
    { id: 'missing-affidavit', name: 'Missing affidavit learner', profile: { legalName: true, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: true, interaction: true, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: true, affidavitComplete: false, certificateFieldsPopulated: true, adminHoldClear: true }, optionalClinical: { hub: false, skills: false, confidence: false, documentation: false, help: false } },
    { id: 'admin-hold', name: 'Admin hold learner', profile: { legalName: true, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: true, interaction: true, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: true, affidavitComplete: true, certificateFieldsPopulated: true, adminHoldClear: false }, optionalClinical: { hub: true, skills: false, confidence: false, documentation: false, help: false } },
    { id: 'optional-clinical-skipped', name: 'Optional clinical skipped learner', profile: { legalName: true, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: true, interaction: true, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: true, affidavitComplete: true, certificateFieldsPopulated: true, adminHoldClear: true }, optionalClinical: { hub: false, skills: false, confidence: false, documentation: false, help: false } },
    { id: 'mobile-path', name: 'Mobile-path learner', profile: { legalName: true, cnaNumber: true }, gates: { providerOverride: true, onlineCapAcknowledgement: true, theoryActivity: true, interaction: true, activeTimeMet: true, manualReviewHoldCleared: true, finalExamPassed: true, affidavitComplete: true, certificateFieldsPopulated: true, adminHoldClear: true }, optionalClinical: { hub: false, skills: false, confidence: false, documentation: false, help: false } }
  ],
  gates: [
    { key: 'providerOverride', label: 'Provider/course approval metadata or staging override present', source: 'Admin-only staging override placeholder' },
    { key: 'legalName', label: 'Legal name present', source: 'Required user profile field' },
    { key: 'cnaNumber', label: 'CNA certificate number present', source: 'Required user profile field' },
    { key: 'onlineCapAcknowledgement', label: 'Online cap acknowledgement complete', source: 'Quiz/Feedback acknowledgement' },
    { key: 'theoryActivity', label: 'Required theory activity complete', source: 'Activity completion' },
    { key: 'interaction', label: 'Required interaction/check complete', source: 'Attempt or completion record' },
    { key: 'activeTimeOrManualReview', label: 'Active-time met or manual review hold cleared', source: 'Candidate plugin or manual admin review hold' },
    { key: 'finalExamPassed', label: 'Final exam/test passed', source: 'Final quiz placeholder' },
    { key: 'affidavitComplete', label: 'Final signed statement/affidavit complete', source: 'Feedback/Assignment placeholder' },
    { key: 'certificateFieldsPopulated', label: 'Certificate fields populated', source: 'Certificate field map' },
    { key: 'adminHoldClear', label: 'Admin hold clear', source: 'Manual hold gate' }
  ],
  optionalActivities: [
    { id: 'hub', label: 'Optional Clinical Support Hub', note: 'Start page for support only; not online CE certificate progress.' },
    { id: 'skills', label: 'Skills refresh', note: 'Optional learning support; not clinical-hour credit.' },
    { id: 'confidence', label: 'Optional confidence check', note: 'Ungraded support; does not affect certificate availability.' },
    { id: 'documentation', label: 'Optional documentation support', note: 'Non-PHI support only. Do not upload patient or resident identifiers.' },
    { id: 'help', label: 'Help/contact', note: 'Support requests do not lower score or block certificate.' }
  ],
  qaScenarios: [
    { id: 'P1-QA-002', scenario: 'Missing legal name blocks certificate', learnerId: 'missing-legal-name', expected: 'blocked' },
    { id: 'P1-QA-003', scenario: 'Missing CNA number blocks certificate', learnerId: 'missing-cna-number', expected: 'blocked' },
    { id: 'P1-QA-004', scenario: 'Missing online cap acknowledgement blocks certificate', learnerId: 'skipped-online-cap', expected: 'blocked' },
    { id: 'P1-QA-005', scenario: 'Skipped theory blocks certificate', learnerId: 'skipped-theory', expected: 'blocked' },
    { id: 'P1-QA-006', scenario: 'Skipped interaction blocks certificate', learnerId: 'skipped-interaction', expected: 'blocked' },
    { id: 'P1-QA-007', scenario: 'Insufficient active-time blocks certificate', learnerId: 'insufficient-active-time', expected: 'blocked' },
    { id: 'P1-QA-008', scenario: 'Failed final exam blocks certificate', learnerId: 'failed-exam', expected: 'blocked' },
    { id: 'P1-QA-009', scenario: 'Missing affidavit blocks certificate', learnerId: 'missing-affidavit', expected: 'blocked' },
    { id: 'P1-QA-010', scenario: 'Admin hold blocks certificate', learnerId: 'admin-hold', expected: 'blocked' },
    { id: 'P1-QA-011', scenario: 'Direct certificate URL blocked conceptually', learnerId: 'missing-legal-name', expected: 'blocked' },
    { id: 'P1-QA-013', scenario: 'Optional clinical skipped does not block certificate', learnerId: 'optional-clinical-skipped', expected: 'available' }
  ]
};

const auditItems = [
  'Learner profile fields',
  'Online cap acknowledgement',
  'Theory completion',
  'Interaction record',
  'Active-time report/manual review note',
  'Final exam/test record',
  'Affidavit record',
  'Certificate issue/lock status',
  'Optional clinical support status separately labeled'
];

let appData = fallbackData;

async function loadJson(path, fallbackValue) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Unable to load ${path}`);
    return await response.json();
  } catch {
    return fallbackValue;
  }
}

function gateValue(learner, key) {
  if (key === 'legalName') return learner.profile.legalName;
  if (key === 'cnaNumber') return learner.profile.cnaNumber;
  if (key === 'activeTimeOrManualReview') return learner.gates.activeTimeMet || learner.gates.manualReviewHoldCleared;
  return Boolean(learner.gates[key]);
}

function evaluateCertificateGate(learner, gates) {
  const blockers = gates
    .filter(gate => !gateValue(learner, gate.key))
    .map(gate => ({ code: gate.key, label: gate.label, source: gate.source }));
  return {
    available: blockers.length === 0,
    blockers
  };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function renderLearnerOptions() {
  const select = document.getElementById('learnerSelect');
  select.innerHTML = '';
  appData.learners.forEach(learner => {
    const option = document.createElement('option');
    option.value = learner.id;
    option.textContent = learner.name;
    select.appendChild(option);
  });
  select.addEventListener('change', () => renderLearner(select.value));
}

function renderLearner(learnerId) {
  const learner = appData.learners.find(item => item.id === learnerId) || appData.learners[0];
  const result = evaluateCertificateGate(learner, appData.gates);
  const requiredGateList = document.getElementById('requiredGateList');
  const blockerList = document.getElementById('blockerList');
  const certificateStatus = document.getElementById('certificateStatus');
  const certificateBadge = document.getElementById('certificateBadge');
  const learnerSummary = document.getElementById('learnerSummary');

  learnerSummary.innerHTML = `<strong>${learner.name}</strong><br>Synthetic test learner only. Optional clinical support is excluded from certificate gate evaluation.`;
  requiredGateList.innerHTML = '';
  appData.gates.forEach(gate => {
    const passed = gateValue(learner, gate.key);
    const row = el('div', 'gate-row');
    const text = el('div');
    text.innerHTML = `<strong>${gate.label}</strong><small>${gate.source}</small>`;
    row.appendChild(text);
    row.appendChild(el('span', `state ${passed ? 'pass' : 'block'}`, passed ? 'PASS' : 'BLOCK'));
    requiredGateList.appendChild(row);
  });

  certificateBadge.className = `badge ${result.available ? 'safe' : 'block'}`;
  certificateBadge.textContent = result.available ? 'Available - sandbox only' : 'Blocked';
  certificateStatus.className = `certificate-status ${result.available ? 'status-pass' : 'status-block'}`;
  certificateStatus.textContent = result.available
    ? 'Certificate available - sandbox only. This is not a real certificate and does not issue production credit.'
    : 'Certificate unavailable. Required gate blockers are listed below.';

  blockerList.innerHTML = '';
  if (result.blockers.length === 0) {
    blockerList.appendChild(el('div', 'notice', 'No required-gate blockers. Optional clinical support was not evaluated as a gate.'));
  } else {
    result.blockers.forEach(blocker => {
      const row = el('div', 'blocker-row');
      row.innerHTML = `<strong>${blocker.label}</strong><small>Blocker code: ${blocker.code}. Source: ${blocker.source}.</small>`;
      blockerList.appendChild(row);
    });
  }

  renderOptionalActivities(learner);
}

function renderOptionalActivities(learner) {
  const container = document.getElementById('optionalActivities');
  container.innerHTML = '';
  appData.optionalActivities.forEach(activity => {
    const status = learner.optionalClinical[activity.id] ? 'Viewed' : 'Skipped';
    const row = el('div', 'activity-row');
    row.innerHTML = `<div><strong>${activity.label}</strong><small>${activity.note}</small></div><span class="state info">${status}</span>`;
    container.appendChild(row);
  });
}

function renderQaScenarios() {
  const container = document.getElementById('qaScenarioList');
  container.innerHTML = '';
  appData.qaScenarios.forEach(item => {
    const learner = appData.learners.find(candidate => candidate.id === item.learnerId);
    const result = evaluateCertificateGate(learner, appData.gates);
    const actual = result.available ? 'available' : 'blocked';
    const passed = actual === item.expected;
    const row = el('div', 'scenario-row');
    row.innerHTML = `<div><strong>${item.id}: ${item.scenario}</strong><small>Expected: ${item.expected}. Actual: ${actual}.</small></div><span class="state ${passed ? 'pass' : 'block'}">${passed ? 'PASS' : 'CHECK'}</span>`;
    container.appendChild(row);
  });
}

function renderAuditChecklist() {
  const container = document.getElementById('auditChecklist');
  container.innerHTML = '';
  auditItems.forEach(item => {
    const row = el('div', 'audit-row');
    row.innerHTML = `<div><strong>${item}</strong><small>Mock checklist item only. No evidence file is generated.</small></div><span class="state info">Mock</span>`;
    container.appendChild(row);
  });
}

async function init() {
  const [learners, gates, optionalActivities, qaScenarios] = await Promise.all([
    loadJson('data/prototypeLearners.json', fallbackData.learners),
    loadJson('data/certificateGates.json', fallbackData.gates),
    loadJson('data/requiredOptionalActivities.json', fallbackData.optionalActivities),
    loadJson('data/qaScenarios.json', fallbackData.qaScenarios)
  ]);
  appData = { learners, gates, optionalActivities, qaScenarios };
  document.getElementById('globalStatus').textContent = 'Sandbox data loaded';
  renderLearnerOptions();
  renderLearner(appData.learners[0].id);
  renderQaScenarios();
  renderAuditChecklist();
}

init();
