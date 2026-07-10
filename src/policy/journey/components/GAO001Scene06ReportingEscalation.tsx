import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Lock, UserCheck, ArrowRight } from 'lucide-react';
import GAO001SharedOverlay from './GAO001SharedOverlay';
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

export default function GAO001Scene06ReportingEscalation({ onComplete }: GAO001Scene06ReportingEscalationProps) {
  const [scenarios] = useState<Scenario[]>([
    { id: '1', text: 'Leaving a patient schedule visible on your tablet in a coffee shop', category: 'privacy' },
    { id: '2', text: 'A surveyor from the Department of Public Health asks for a chart', category: 'oversight' },
    { id: '3', text: 'Being asked to perform a complex wound vac change you haven\'t been checked off on', category: 'competency' }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedItems, setPlacedItems] = useState<Record<string, Category>>({});
  const [errorCategory, setErrorCategory] = useState<Category | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = brandStyles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  const showLegacyArt = false;
  if (!showLegacyArt) {
    return (
      <GAO001SharedOverlay
        imageSrc={gao001SceneArt['scene-06'].src}
        altText={gao001SceneArt['scene-06'].alt}
        objective="Categorize the reporting scenarios."
        onComplete={onComplete}
        hotspots={[
          {
            id: 'rights', x: 25, y: 35, label: 'Patient rights',
            fieldNotes: {
              title: 'Patient Rights',
              content: 'Every patient has the right to be informed of their care plan and the right to refuse treatment.'
            },
            question: {
              prompt: 'A patient refuses to let you take their blood pressure, saying they are tired. What is their right in this situation?',
              choices: [
                { id: 'c1', text: 'They must comply because the physician ordered the vital signs.', isCorrect: false, feedback: 'Not quite. Physician orders do not override a patient\'s right to refuse care.' },
                { id: 'c2', text: 'They have the absolute right to refuse any part of their treatment at any time.', isCorrect: true, feedback: 'Correct. Patient autonomy is a fundamental right.' },
                { id: 'c3', text: 'They can only refuse if they sign a legal waiver first.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because immediate refusal does not require a waiver to be respected.' }
              ]
            }
          },
          {
            id: 'refusal', x: 75, y: 35, label: 'Respectful refusal',
            fieldNotes: {
              title: 'Respectful Refusal',
              content: 'Do not argue or coerce. Acknowledge their decision respectfully.'
            },
            question: {
              prompt: 'How should you respond verbally to a patient who refuses wound care?',
              choices: [
                { id: 'c1', text: '"If you don\'t let me do this, your wound will get infected and you\'ll go back to the hospital."', isCorrect: false, feedback: 'Not quite. This is coercive and uses fear to force compliance.' },
                { id: 'c2', text: '"I understand you prefer not to have the wound care done right now. Can you tell me more about how you\'re feeling?"', isCorrect: true, feedback: 'Good choice. This is respectful, non-argumentative, and opens a dialogue to understand the barrier.' },
                { id: 'c3', text: '"Okay, I\'ll just skip it. Have a good day."', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because you missed an opportunity to gently explore the reason for refusal before leaving.' }
              ]
            }
          },
          {
            id: 'document', x: 25, y: 65, label: 'Document the refusal',
            fieldNotes: {
              title: 'Document the Refusal',
              content: 'Accurately document what was refused and any reasons provided by the patient.'
            },
            question: {
              prompt: 'What should be included in your documentation of a patient\'s refusal?',
              choices: [
                { id: 'c1', text: 'Only that the visit was not completed.', isCorrect: false, feedback: 'Not quite. That lacks detail and doesn\'t explain why care wasn\'t provided.' },
                { id: 'c2', text: 'The specific task refused, the exact reason the patient gave, and any education you provided about the risks of refusal.', isCorrect: true, feedback: 'Correct. This thoroughly protects both the patient and the agency.' },
                { id: 'c3', text: 'Your opinion on why the patient is being difficult today.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because documentation must remain objective and factual, not opinion-based.' }
              ]
            }
          },
          {
            id: 'responsibilities', x: 75, y: 65, label: 'Responsibilities',
            fieldNotes: {
              title: 'Responsibilities',
              content: 'Notify the physician and clinical manager when a refusal significantly impacts the care plan.'
            },
            question: {
              prompt: 'Who needs to be informed when a patient consistently refuses a critical medication?',
              choices: [
                { id: 'c1', text: 'Only the clinical manager, during the weekly case conference.', isCorrect: false, feedback: 'Not quite. Consistent refusal of critical medication requires more immediate attention.' },
                { id: 'c2', text: 'The patient\'s family members, so they can convince the patient.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because communicating with family without patient consent may violate privacy, and the physician still needs to know.' },
                { id: 'c3', text: 'The clinical manager immediately, who will help coordinate notification to the physician.', isCorrect: true, feedback: 'Good choice. The care team and physician must adjust the care plan if treatments are consistently refused.' }
              ]
            }
          }
        ]}
      />
    );
  }

  const handlePlace = (category: Category) => {
    if (currentIndex >= scenarios.length) return;

    const currentScenario = scenarios[currentIndex];

    if (currentScenario.category === category) {
      synth.playClick();
      setPlacedItems(prev => ({ ...prev, [currentScenario.id]: category }));
      setErrorCategory(null);

      if (currentIndex + 1 === scenarios.length) {
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

  const activeScenario = scenarios[currentIndex];

  const categories: { id: Category; title: string; icon: React.ReactNode; color: string; border: string; bg: string }[] = [
    { id: 'privacy', title: 'PHI & Privacy', icon: <Lock className="w-8 h-8" />, color: 'text-blue-600', border: 'border-blue-600', bg: 'bg-blue-50' },
    { id: 'oversight', title: 'Oversight & Compliance', icon: <ShieldAlert className="w-8 h-8" />, color: 'text-amber-600', border: 'border-amber-600', bg: 'bg-amber-50' },
    { id: 'competency', title: 'Clinical Competency', icon: <UserCheck className="w-8 h-8" />, color: 'text-purple-600', border: 'border-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="h-full w-full bg-[#FAFBF8] flex flex-col p-4 lg:p-8 relative overflow-hidden animate-fade-in">

      <div className="text-center mb-6 z-10 animate-slide-in-up">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FEF3C7] rounded-full mb-3 shadow-sm">
          <ShieldAlert className="w-6 h-6 text-[#D97706]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E3A3A] mb-2">Reporting & Escalation</h2>
        <p className="text-[#524C4B] max-w-2xl mx-auto text-sm lg:text-base">
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
            const itemsInCat = scenarios.filter(s => placedItems[s.id] === cat.id);
            const isJustMatched = itemsInCat.length > 0 && activeScenario && activeScenario.id === itemsInCat[itemsInCat.length-1]?.id ? true : false;

            return (
              <div
                key={cat.id}
                onClick={() => handlePlace(cat.id)}
                className={`
                  relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
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
              </div>
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
                  onComplete?.();
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
  );
}
