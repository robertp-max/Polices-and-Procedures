import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, CheckCircle2, Lock, UserCheck, ArrowRight, X } from 'lucide-react';
import GAO001SharedOverlay from './GAO001SharedOverlay';
import { defineGao001Hotspots } from '../data/gaoNodes/gao001HotspotContract';
import { gao001SceneArt } from '../data/gao001SceneArt';

interface GAO001Scene06ReportingEscalationProps {
  onComplete?: () => void;
}

class InteractiveAudioSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.7);
    });
  }

  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.setValueAtTime(180, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }
}

const synth = new InteractiveAudioSynth();

const brandStyles = `
  @keyframes slideInUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-in-up {
    animation: slideInUp 0.4s ease-out forwards;
  }

  @keyframes shakeError {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .animate-shake-error {
    animation: shakeError 0.4s ease-in-out;
  }

  @keyframes pulseSuccess {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(52, 211, 153, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
  }
  .animate-pulse-success {
    animation: pulseSuccess 0.4s ease-out;
  }
`;

type Category = 'oversight' | 'privacy' | 'competency';

interface Scenario {
  id: string;
  text: string;
  category: Category;
}

const REPORTING_SCENARIOS: Scenario[] = [
  { id: '1', text: 'Leaving a patient schedule visible on your tablet in a coffee shop', category: 'privacy' },
  { id: '2', text: 'A surveyor from the Department of Public Health asks for a chart', category: 'oversight' },
  { id: '3', text: 'Being asked to perform a complex wound vac change you haven\'t been checked off on', category: 'competency' }
];

function ReportingEscalationActivity({
  close,
  complete,
  activeLabel,
}: {
  close: () => void;
  complete: () => void;
  activeLabel: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedItems, setPlacedItems] = useState<Record<string, Category>>({});
  const [errorCategory, setErrorCategory] = useState<Category | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingStyle = document.getElementById('gao001-scene06-custom-styles');
    if (existingStyle) return;
    const styleSheet = document.createElement("style");
    styleSheet.id = 'gao001-scene06-custom-styles';
    styleSheet.type = "text/css";
    styleSheet.innerText = `${brandStyles}
      @media (prefers-reduced-motion: reduce) {
        .animate-slide-in-up,
        .animate-shake-error,
        .animate-pulse-success {
          animation: none !important;
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableSelector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');
    const focusables = () => Array.from(dialog?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
    (focusables()[0] ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;

      const items = focusables();
      if (!items.length) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [close]);

  const handlePlace = (category: Category) => {
    if (currentIndex >= REPORTING_SCENARIOS.length) return;

    const currentScenario = REPORTING_SCENARIOS[currentIndex];

    if (currentScenario.category === category) {
      synth.playClick();
      setPlacedItems(prev => ({ ...prev, [currentScenario.id]: category }));
      setErrorCategory(null);

      if (currentIndex + 1 === REPORTING_SCENARIOS.length) {
        setTimeout(() => {
          synth.playSuccess();
          setShowCompletion(true);
        }, 400);
      }
      setCurrentIndex(prev => prev + 1);
    } else {
      synth.playError();
      setErrorCategory(category);
      setTimeout(() => setErrorCategory(null), 500);
    }
  };

  const activeScenario = REPORTING_SCENARIOS[currentIndex];

  const categories: { id: Category; title: string; icon: React.ReactNode; color: string; border: string; bg: string }[] = [
    { id: 'privacy', title: 'PHI & Privacy', icon: <Lock className="w-8 h-8" />, color: 'text-blue-600', border: 'border-blue-600', bg: 'bg-blue-50' },
    { id: 'oversight', title: 'Oversight & Compliance', icon: <ShieldAlert className="w-8 h-8" />, color: 'text-amber-600', border: 'border-amber-600', bg: 'bg-amber-50' },
    { id: 'competency', title: 'Clinical Competency', icon: <UserCheck className="w-8 h-8" />, color: 'text-purple-600', border: 'border-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-[#FAFBF8]">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gao001-reporting-escalation-title"
        aria-describedby="gao001-reporting-escalation-description"
        tabIndex={-1}
        className="relative flex h-full w-full flex-col overflow-hidden p-4 outline-none lg:p-8"
      >
      <button
        type="button"
        onClick={close}
        aria-label="Close reporting and escalation activity"
        className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1E3A3A] shadow-md transition hover:bg-[#EEFBF6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54]"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="text-center mb-6 z-10 animate-slide-in-up">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FEF3C7] rounded-full mb-3 shadow-sm">
          <ShieldAlert className="w-6 h-6 text-[#D97706]" />
        </div>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F06923]">
          {activeLabel}
        </p>
        <h2 id="gao001-reporting-escalation-title" className="text-2xl font-bold text-[#1E3A3A] mb-2">Reporting & Escalation</h2>
        <p id="gao001-reporting-escalation-description" className="text-[#524C4B] max-w-2xl mx-auto text-sm lg:text-base">
          Categorize the following field scenarios into the correct regulatory or compliance bucket.
        </p>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col items-center justify-center z-10 mb-20 lg:mb-0">

        {/* Active Scenario Card */}
        {!showCompletion && activeScenario && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#E5E7EB] max-w-lg w-full mb-12 text-center animate-slide-in-up relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#0F5B54] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Current Scenario
            </div>
            <p className="text-lg lg:text-xl font-semibold text-[#1E3A3A] mt-4 mb-2 leading-snug">
              "{activeScenario.text}"
            </p>
            <p className="text-sm text-[#6B7280]">
              Tap the correct category below to route this issue.
            </p>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {categories.map((cat, idx) => {
            const isError = errorCategory === cat.id;
            const itemsInCat = REPORTING_SCENARIOS.filter(s => placedItems[s.id] === cat.id);
            const isJustMatched = itemsInCat.length > 0 && activeScenario && activeScenario.id === itemsInCat[itemsInCat.length-1]?.id ? true : false;

            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => handlePlace(cat.id)}
                disabled={showCompletion}
                className={`
                  relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54]
                  ${isError ? 'bg-[#FEF2F2] border-[#F87171] animate-shake-error' :
                    itemsInCat.length > 0 ? `${cat.bg} ${cat.border} shadow-md` :
                    'bg-white border-[#E5E7EB] hover:border-[#0F5B54] hover:shadow-md'}
                  ${!showCompletion && isJustMatched ? 'animate-pulse-success' : ''}
                `}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
                  ${itemsInCat.length > 0 ? `${cat.bg} ${cat.color}` : 'bg-gray-50 text-gray-400'}
                `}>
                  {cat.icon}
                </div>
                <h3 className={`text-lg font-bold text-center mb-2 ${itemsInCat.length > 0 ? cat.color : 'text-gray-600'}`}>
                  {cat.title}
                </h3>

                {/* Solved items badge */}
                <div className="mt-auto">
                  {itemsInCat.length > 0 ? (
                    <div className="flex items-center text-sm font-bold text-[#059669]">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Routed Correctly
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Drop Here
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mandatory Reporting Modal */}
      {showCompletion && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/95 backdrop-blur-md animate-fade-in px-4">
          <div className="bg-white p-6 lg:p-10 rounded-2xl shadow-2xl border-l-8 border-[#0F5B54] max-w-2xl transform animate-slide-in-up">
            <div className="flex items-start mb-6">
              <ShieldAlert className="w-10 h-10 text-[#0F5B54] mr-4 shrink-0 mt-1" />
              <div>
                <h3 className="text-2xl font-bold text-[#1E3A3A] mb-3">Critical Rule: Mandatory Reporting</h3>
                <p className="text-[#0A3D38] font-bold text-lg leading-relaxed bg-[#EEFBF6] p-4 rounded-lg border border-[#34D399]">
                  "Follow agency mandatory reporting protocol immediately; do not investigate or confront; supervisor/Compliance assists with required external reporting, but required reporting must not be delayed."
                </p>
              </div>
            </div>

            <p className="text-[#524C4B] mb-8 leading-relaxed">
              Whether it's a suspected compliance violation, a privacy breach, or an issue of patient safety, your job is to report it immediately. The compliance team and your clinical supervisor will handle the investigation.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  synth.playClick();
                  complete();
                }}
                className="px-8 py-3 bg-[#0F5B54] hover:bg-[#0A3D38] text-white font-bold rounded-xl shadow-md transition-colors uppercase tracking-wider text-sm flex items-center"
              >
                I Understand
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default function GAO001Scene06ReportingEscalation({ onComplete }: GAO001Scene06ReportingEscalationProps) {
  return (
    <GAO001SharedOverlay
      imageSrc={gao001SceneArt['scene-06'].src}
      altText={gao001SceneArt['scene-06'].alt}
      objective="Categorize the reporting scenarios."
      onComplete={onComplete}
      renderCustomModal={({ hotspot, close, complete }) => (
        <ReportingEscalationActivity
          close={close}
          complete={complete}
          activeLabel={hotspot.label}
        />
      )}
      hotspots={defineGao001Hotspots("GAO-001.lesson.l6.delivery", [
        {
          id: 'rights', x: 25, y: 35, label: 'Patient rights',
          fieldNotes: {
            title: 'Patient Rights',
            content: 'Every patient has the right to be informed of their care plan and the right to refuse treatment.'
          },
        },
        {
          id: 'refusal', x: 75, y: 35, label: 'Respectful refusal',
          fieldNotes: {
            title: 'Respectful Refusal',
            content: 'Do not argue or coerce. Acknowledge their decision respectfully.'
          },
        },
        {
          id: 'document', x: 25, y: 65, label: 'Document the refusal',
          fieldNotes: {
            title: 'Document the Refusal',
            content: 'Accurately document what was refused and any reasons provided by the patient.'
          },
        },
        {
          id: 'responsibilities', x: 75, y: 65, label: 'Responsibilities',
          fieldNotes: {
            title: 'Responsibilities',
            content: 'Notify the physician and clinical manager when a refusal significantly impacts the care plan.'
          },
        }
      ])}
    />
  );
}
