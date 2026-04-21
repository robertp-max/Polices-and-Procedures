/* ═══════════════════════════════════════════════════════════════
   IN-APP USER GUIDE / MANUAL
   Audience switcher: New Hire · Supervisor/DON · Admin/HR
   All steps reference the controlling policy/CFR citation.
   ═══════════════════════════════════════════════════════════════ */

import { useState } from 'react';
import { BookOpen, User, Users, ShieldCheck, ChevronRight } from 'lucide-react';

type Persona = 'newhire' | 'supervisor' | 'admin';

export function UserGuidePage() {
  const [p, setP] = useState<Persona>('newhire');

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10">
      <div className="mb-6">
        <div className="text-xs font-montserrat font-bold text-[#FFC107] uppercase tracking-widest mb-2 flex items-center gap-2">
          <BookOpen size={14} /> User Guide
        </div>
        <h1 className="text-2xl font-montserrat font-bold text-white">How to use the Onboarding &amp; Competency Journey</h1>
        <div className="text-sm text-white/55 font-light mt-1">
          Step-by-step procedures, policy citations and survey-ready expectations. Choose your role below.
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Tab icon={<User size={14} />}       label="New Hire"         active={p === 'newhire'}    onClick={() => setP('newhire')} />
        <Tab icon={<Users size={14} />}      label="Supervisor / DON" active={p === 'supervisor'} onClick={() => setP('supervisor')} />
        <Tab icon={<ShieldCheck size={14} />} label="Admin / HR"       active={p === 'admin'}      onClick={() => setP('admin')} />
      </div>

      {p === 'newhire'    && <NewHireGuide />}
      {p === 'supervisor' && <SupervisorGuide />}
      {p === 'admin'      && <AdminGuide />}
    </div>
  );
}

function Tab({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`glass-interactive flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest ${
        active ? 'border-[#FFC107]/60 text-[#FFC107] bg-[#FFC107]/5' : 'border-white/10 text-white/60 hover:text-white'
      }`}>
      {icon} {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 rounded-2xl p-5 mb-4">
      <div className="text-[10px] uppercase tracking-widest font-bold text-[#FFC107] mb-2">{title}</div>
      <div className="text-sm text-white/75 font-light leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Step({ n, title, children }: { n: number | string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-[#FFC107]/10 border border-[#FFC107]/30 text-[#FFC107] text-xs font-bold flex items-center justify-center">{n}</div>
      <div className="flex-1">
        <div className="text-sm font-bold text-white mb-0.5">{title}</div>
        <div className="text-xs text-white/70 font-light leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function NewHireGuide() {
  return (
    <>
      <Section title="Day 0 — Pre-Day-1 screening (hard stop)">
        <Step n={1} title="Your HR Director completes Appendix F">
          You cannot begin any work — including orientation — until every line of HR-TA-001 Appendix F is
          marked <b>PASS</b> or <b>N/A</b> and signed by the HR Director (HR-TA-001 §4.3).
        </Step>
        <Step n={2} title="Verify your Journey dashboard is unlocked">
          Go to <span className="text-[#FFC107]">Onboarding → Journey</span>. If the red "Hard Stop" banner
          appears, Appendix F is incomplete — contact HR.
        </Step>
      </Section>

      <Section title="Week 1 — General Agency Orientation (GAO)">
        <Step n={1} title="Open each GAO module in order">
          27 modules cover mission, compliance, HIPAA, patient rights, infection control and more
          (HR-TA-005 §6.2).
        </Step>
        <Step n={2} title="Pass quizzes at ≥ 80%">
          Quizzes auto-record your SCORM score. Save & resume is supported (cmi.suspend_data).
        </Step>
        <Step n={3} title="Pass the GAO-EXAM (HR-TA-005 Appendix D)">
          16/20 required. If you score &lt; 80%, you have 3 business days to remediate and retake
          (HR-TA-005 §8.2). The trainer and you both sign the exam.
        </Step>
      </Section>

      <Section title="Weeks 1-4 — Role-specific modules">
        <Step n={1} title="Complete every ROLE module for your JD">
          The dashboard shows only what applies to your role (RN, LVN, PT, PTA, OT, COTA, SLP, MSW, HHA,
          DON, Administrator).
        </Step>
        <Step n={2} title="Complete skills check-offs with your supervisor">
          For Return Demo / Skills Check-off / Case Study / Scenario the supervisor rates you and
          both signatures are captured.
        </Step>
        <Step n={3} title="Complete minimum supervised visits">
          RN: 2 (new grads: 5). LVN: 3 (new-to-HH: 5). PT/OT/SLP/MSW: 2. PTA/COTA: 3.
          HHA: RN supervised visit every 14 days for first 60 days, then every 60 days (42 CFR §484.80(h)).
        </Step>
      </Section>

      <Section title="Clearance for independent practice">
        <Step n={1} title="Your DON signs HR-TA-005 Appendix B = SATISFACTORY">
          This is the final gate. Until signed, you may not perform visits independently.
        </Step>
      </Section>

      <Section title="What happens if you fail">
        <ul className="list-disc ml-5 space-y-1">
          <li>GAO quiz fail: remedial review + retake within 3 business days (HR-TA-005 §8.2).</li>
          <li>Competency failure: 7-day remediation plan (HR-TD-003 Appendix C), 60-day max to resolve.</li>
          <li>Competency fail after remediation: employment action per HR-ER-002.</li>
          <li>Annual training 30 / 45 / 60 days overdue: reminders → supervisor meeting → clinical suspension (HR-TD-001 §4.6).</li>
        </ul>
      </Section>
    </>
  );
}

function SupervisorGuide() {
  return (
    <>
      <Section title="Your responsibilities">
        <ul className="list-disc ml-5 space-y-1">
          <li>Preceptor assignment and orientation sign-off (HR-TA-005 §6.1).</li>
          <li>Return demos, skills check-offs, competency validation with dual signature.</li>
          <li>Supervised visit logs on HR-TA-005 Appendix E / HR-TD-003 Appendix E.</li>
          <li>HHA 14-day / 60-day cycle visits (42 CFR §484.80(h)).</li>
          <li>Final clearance (HR-TA-005 Appendix B) before independent practice.</li>
        </ul>
      </Section>

      <Section title="Day-to-day">
        <Step n={1} title="Open the Supervisor view">
          Navigation → Onboarding → Supervisor. Select the employee from the roster on the left.
        </Step>
        <Step n={2} title="Validate competencies in the Journey flow">
          As the employee opens a Return Demo / Skills Check-off / Case Study / Scenario / Observation
          module, the Evidence Capture pane appears. Rate performance, enter observation notes, then
          capture both signatures (yours + employee's).
        </Step>
        <Step n={3} title="Log supervised visits">
          Supervisor view → Quick actions → <b>Log Supervised Visit</b>. Choose the visit type (INITIAL,
          HHA 14-day, HHA 60-day, Competency Validation), rating, and notes.
        </Step>
        <Step n={4} title="Open remediation plans for failures">
          Supervisor view → Quick actions → <b>Open Remediation Plan</b>. 60-day maximum (HR-TD-003 §6.3).
        </Step>
        <Step n={5} title="Sign clearance when all gates are green">
          Clearance panel is inert until every gate is satisfied. When ready, sign with your DON credential
          to release the employee for independent practice.
        </Step>
      </Section>

      <Section title="Escalations you will see">
        <ul className="list-disc ml-5 space-y-1">
          <li><b>OVERDUE_30/45/60</b> — Reminders → meeting → suspension (HR-TD-001 §4.6).</li>
          <li><b>COMPETENCY_FAIL</b> — Open remediation within 7 days.</li>
          <li><b>MISSING_SUPERVISED_VISIT</b> — Log the visit or justify.</li>
        </ul>
      </Section>
    </>
  );
}

function AdminGuide() {
  return (
    <>
      <Section title="Your dashboard">
        <Step n={1} title="Open Onboarding → Admin">
          KPI strip at the top: total employees, cleared, open escalations, CRITICAL, Appendix-F missing,
          annual overdue.
        </Step>
        <Step n={2} title="Work the escalation queue">
          Acknowledge and resolve escalations. Each ticket is bound to a policy reference and to a
          specific employee/module — click through to audit.
        </Step>
        <Step n={3} title="Validate the Evidence Map daily">
          Counts update live. During a survey, surveyors pull 5-10 personnel files — this table shows
          which appendices you have ready for each audit query (HR-TA-001 §8.2).
        </Step>
      </Section>

      <Section title="Monthly / annual tasks">
        <ul className="list-disc ml-5 space-y-1">
          <li>Monthly: OIG LEIE + SAM screening for all staff by the 15th; Compliance Officer co-sign by the 20th (HR-TA-003 §6.2).</li>
          <li>Annual: Feb 1 – Oct 31 competency re-evaluation cycle (HR-TD-003).</li>
          <li>Annual: Q2 &amp; Q4 emergency drills — capture AAR on HR-TD-005 Appendix B.</li>
          <li>Quarterly: Anti-harassment (2hr CA law), HIPAA refresh, infection prevention.</li>
        </ul>
      </Section>

      <Section title="During a CMS survey">
        <Step n={1} title="Enable Auditor Mode">Read-only lockdown prevents any writes during review.</Step>
        <Step n={2} title="Export by employee">Each employee profile has a full SCORM + evidence dossier exportable as PDF.</Step>
        <Step n={3} title="Reference the Evidence Map">Every surveyor question maps to a stored appendix count.</Step>
      </Section>

      <div className="border border-[#FFC107]/20 rounded-2xl p-5 text-xs text-white/65">
        <div className="text-[10px] uppercase tracking-widest font-bold text-[#FFC107] mb-1">Tip</div>
        The system will NEVER let you clear an employee whose Appendix F is incomplete, whose GAO-EXAM is
        unpassed, whose supervised visits are under the minimum, or whose license has expired. These are
        hard stops, not warnings. <ChevronRight size={12} className="inline" /> HR-TA-001 §4.3.
      </div>
    </>
  );
}
