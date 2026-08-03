// Entry point for the 2026 QAPI Tabletop (§5): two plain-language paths,
// Solo or Facilitated group, both same-device. This is the ONE component the
// orchestrator wires into MyJourneyApp; it owns navigation between the mode
// picker and the two players internally so callers only ever see one onExit.

import { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Users, UserRound } from 'lucide-react';
import { QAPI2026_TABLETOP } from './qapi2026TabletopCase';
import SoloQapiTabletopPlayer from './SoloQapiTabletopPlayer';
import FacilitatedQapiTabletopPlayer from './FacilitatedQapiTabletopPlayer';
import './tabletop2026.css';

type EntryMode = 'choose' | 'solo' | 'facilitated';

export default function Qapi2026TabletopEntry({ onExit }: { onExit: () => void }) {
  const [mode, setMode] = useState<EntryMode>('choose');
  const c = QAPI2026_TABLETOP;

  if (mode === 'solo') return <SoloQapiTabletopPlayer onExit={onExit} />;
  if (mode === 'facilitated') return <FacilitatedQapiTabletopPlayer onExit={onExit} />;

  return (
    <div className="tabletop-shell">
      <header className="assessment-bar">
        <button className="assessment-back" onClick={onExit} aria-label="Save & exit to My Compliance">
          <ArrowLeft size={17} /> Save &amp; exit
        </button>
        <div className="assessment-bar-title">
          <span>2026 QAPI TABLETOP · {c.minutes} MIN</span>
          <strong>{c.title}</strong>
        </div>
      </header>

      <div className="q26tt-entry">
        <div className="q26tt-entry-head">
          <span className="q26tt-entry-kicker"><ShieldCheck size={13} /> Assessment-grade · no answers revealed until scoring</span>
          <h1>Choose how you&rsquo;ll run this year&rsquo;s tabletop</h1>
          <p>{c.context}</p>
        </div>

        <div className="q26tt-cards">
          <button className="q26tt-card" onClick={() => setMode('solo')}>
            <span className="q26tt-card-icon"><UserRound size={22} /></span>
            <h2>Solo</h2>
            <p>Work the full year-arc case yourself: pre-read the packet, decide each quarter&rsquo;s judgment calls, defend it to a surveyor, and transfer the rule to changed facts.</p>
            <ul>
              <li>11-step guided flow, one sitting or resume later</li>
              <li>Your own attestation and evidence record</li>
              <li>Best for individual director preparation</li>
            </ul>
            <span className="q26tt-card-cta">Start solo <ArrowRight size={14} /></span>
          </button>

          <button className="q26tt-card" onClick={() => setMode('facilitated')}>
            <span className="q26tt-card-icon"><Users size={22} /></span>
            <h2>Facilitated group</h2>
            <p>Run this as an actual Board tabletop on one shared screen: assign roles, disclose conflicts, debate, vote by motion, and record dissent — then each required participant completes their own transfer and attestation.</p>
            <ul>
              <li>Same-device: Chair, Recorder, and named committee roles</li>
              <li>Quorum, recusal, and per-motion voting</li>
              <li>A group score never substitutes for an individual&rsquo;s own completion</li>
            </ul>
            <span className="q26tt-card-cta">Set up the room <ArrowRight size={14} /></span>
          </button>
        </div>
      </div>
    </div>
  );
}
