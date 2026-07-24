import { useState, useEffect, useRef } from 'react';
import { UserX, CheckCircle2, ArrowRight, MessageSquareWarning, XCircle, FileWarning } from 'lucide-react';
import GAO001SharedOverlay, { type Hotspot } from './GAO001SharedOverlay';
import { defineGao001Hotspots } from '../data/gaoNodes/gao001HotspotContract';
import { gao001SceneArt } from '../data/gao001SceneArt';

interface GAO001Scene07PatientRefusalProps {
  onComplete?: () => void;
}

type WindowWithWebkitAudio = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

class InteractiveAudioSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioContextCtor = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (!AudioContextCtor) return;
      this.ctx = new AudioContextCtor();
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, this.ctx.currentTime);
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
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.6);
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
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
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

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .animate-shake-error {
    animation: shake 0.4s ease-in-out;
  }
`;

type Stage = 'prompt' | 'error' | 'success';

type RefusalDecisionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
};

type RefusalDecisionConfig = {
  eyebrow: string;
  title: string;
  scenario: string;
  prompt: string;
  options: RefusalDecisionOption[];
  teachingPoint: string;
  reference: string;
};

const REFUSAL_DECISIONS: Record<string, RefusalDecisionConfig> = {
  assess: {
    eyebrow: 'Patient refusal',
    title: 'Patient Right',
    scenario:
      'Mr. Torres is tired and refuses his ordered wound dressing change today.',
    prompt: "What is Alex's first obligation?",
    options: [
      {
        id: 'force',
        text: 'Proceed anyway because the dressing change is ordered by the physician.',
        isCorrect: false,
        feedback:
          'Not quite. Ordered care does not override the patient right to refuse care.',
      },
      {
        id: 'respect',
        text: 'Respect his refusal immediately and step back.',
        isCorrect: true,
        feedback:
          'Correct. The patient has the right to refuse care, even when the care is ordered.',
      },
    ],
    teachingPoint:
      'A refusal is not a failure of care. The first safe decision is to acknowledge the choice without arguing, forcing, or pressuring.',
    reference: '42 CFR § 484.50',
  },
  supervisor: {
    eyebrow: 'Patient refusal',
    title: 'Explain Risk',
    scenario:
      'Alex respects the refusal and has a calm moment to explain the clinical risk.',
    prompt: 'What should Alex say next?',
    options: [
      {
        id: 'ignore',
        text: '"Okay, no problem. I will leave you to rest and see you tomorrow."',
        isCorrect: false,
        feedback:
          'Not quite. Leaving without risk education does not support informed refusal.',
      },
      {
        id: 'educate',
        text:
          '"I understand you are tired. I do need to explain that skipping this dressing change increases the risk of infection..."',
        isCorrect: true,
        feedback:
          'Correct. Education should be clear, calm, and non-coercive so the patient can make an informed choice.',
      },
    ],
    teachingPoint:
      'Explain the risk and any practical alternatives without pressure. The patient still decides.',
    reference: 'Patient rights and informed participation',
  },
  manager: {
    eyebrow: 'Patient refusal',
    title: 'Notify Care Team',
    scenario:
      'Mr. Torres still refuses after Alex explains the risk and alternatives.',
    prompt: 'What is the safest next action before leaving the visit?',
    options: [
      {
        id: 'secret',
        text: 'Keep it between Alex and Mr. Torres so the patient does not get labeled difficult.',
        isCorrect: false,
        feedback:
          'Not quite. The refusal can change the care risk, so the care team needs timely notice.',
      },
      {
        id: 'notify',
        text:
          'Assess for immediate concern, notify the clinical team per process, and follow any instructions received.',
        isCorrect: true,
        feedback:
          'Correct. Notification keeps the care team aligned while preserving the patient right to refuse.',
      },
    ],
    teachingPoint:
      'A refusal belongs in the care coordination path. Escalate through the clinical process so follow-up is not delayed.',
    reference: 'Agency escalation process',
  },
  'after-hours': {
    eyebrow: 'Patient refusal',
    title: 'Document Refusal',
    scenario:
      'The patient refusal is unresolved, and Alex must leave a defensible record.',
    prompt: 'What must Alex document?',
    options: [
      {
        id: 'omit',
        text: 'Leave the refusal out of the chart so Mr. Torres is not labeled noncompliant.',
        isCorrect: false,
        feedback:
          'Not quite. Omitting the refusal hides a care risk and weakens continuity of care.',
      },
      {
        id: 'document',
        text:
          'Document the specific care refused, the patient statement, risk education, notification, and follow-up instructions.',
        isCorrect: true,
        feedback:
          'Correct. Objective documentation protects the patient, the team, and the record.',
      },
    ],
    teachingPoint:
      "The final note should include what was refused, the education provided, Mr. Torres' response, who was notified, and any follow-up instructions.",
    reference: '42 CFR § 484.50',
  },
};

function PatientRefusalDecisionModal({
  hotspot,
  close,
  complete,
}: {
  hotspot: Hotspot;
  close: () => void;
  complete: () => void;
}) {
  const decision = REFUSAL_DECISIONS[hotspot.id];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const selectedOption = decision.options.find((option) => option.id === selectedId);
  const safeSelectionMade = selectedOption?.isCorrect === true;

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
    window.setTimeout(() => (focusables()[0] ?? dialog)?.focus(), 20);

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

  const chooseOption = (option: RefusalDecisionOption) => {
    setSelectedId(option.id);
    if (option.isCorrect) {
      synth.playSuccess();
    } else {
      synth.playError();
    }
  };

  if (!decision) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#1F1C1B]/58 p-4 backdrop-blur-[2px]">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`gao001-refusal-${hotspot.id}-title`}
        aria-describedby={`gao001-refusal-${hotspot.id}-description`}
        tabIndex={-1}
        className="relative flex max-h-[min(88cqh,640px)] w-full max-w-[500px] flex-col overflow-hidden rounded-[18px] border border-[#E9E4E0] bg-white shadow-[0_28px_80px_rgba(15,91,84,0.22)] outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E9E4E0] px-6 py-5">
          <div>
            <p className="font-montserrat text-[11px] font-bold uppercase tracking-[0.22em] text-[#C2410C]">
              {decision.eyebrow}
            </p>
            <h2
              id={`gao001-refusal-${hotspot.id}-title`}
              className="mt-2 font-montserrat text-2xl font-bold leading-tight text-[#007970]"
            >
              {decision.title}
            </h2>
            <p
              id={`gao001-refusal-${hotspot.id}-description`}
              className="mt-2 font-roboto text-[15.5px] leading-relaxed text-[#524C4B]"
            >
              {decision.scenario}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="min-h-11 min-w-11 rounded-full border border-[#E9E4E0] bg-[#FAFAF7] px-3 py-2 font-montserrat text-xs font-bold uppercase tracking-[0.16em] text-[#004142] transition hover:border-[#007970]"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="rounded-[16px] border-l-4 border-[#007970] bg-[#F1FBF8] px-4 py-3">
            <p className="font-roboto text-[15.5px] font-semibold leading-relaxed text-[#1E3A3A]">
              {decision.prompt}
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {decision.options.map((option) => {
              const isSelected = selectedId === option.id;
              const selectedClass = option.isCorrect
                ? 'border-[#007970] bg-[#EEF9F6] text-[#0F5B54]'
                : 'border-[#E74C3C] bg-[#FEF2F2] text-[#991B1B]';
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => chooseOption(option)}
                  className={`min-h-12 rounded-[14px] border-2 px-4 py-3 text-left font-roboto text-[15.5px] font-semibold leading-relaxed transition ${
                    isSelected
                      ? selectedClass
                      : 'border-[#E5E4E3] bg-[#FAFAF7] text-[#2D3748] hover:border-[#007970]'
                  }`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>

          {selectedOption ? (
            <div
              role="status"
              className={`mt-5 rounded-[16px] border px-4 py-3 font-roboto text-[15.5px] leading-relaxed ${
                selectedOption.isCorrect
                  ? 'border-[#BFE8DD] bg-[#F1FBF8] text-[#0F5B54]'
                  : 'border-[#F4B7B0] bg-[#FFF7F4] text-[#A64028]'
              }`}
            >
              {selectedOption.feedback}
            </div>
          ) : null}

          <div className="mt-5 rounded-[16px] border border-[#E9E4E0] bg-white px-4 py-3">
            <p className="font-roboto text-[15.5px] leading-relaxed text-[#2D3748]">
              {decision.teachingPoint}
            </p>
            <p className="mt-3 font-montserrat text-[11px] font-bold uppercase tracking-[0.16em] text-[#007970]">
              {decision.reference}
            </p>
          </div>
        </div>

        <div className="border-t border-[#E9E4E0] px-6 py-4">
          <button
            type="button"
            disabled={!safeSelectionMade}
            onClick={() => {
              synth.playClick();
              complete();
            }}
            className="min-h-11 w-full rounded-[12px] bg-[#F06923] px-4 py-3 font-montserrat text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#D95A1A] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
          >
            Complete teaching point
          </button>
        </div>
      </section>
    </div>
  );
}

export default function GAO001Scene07PatientRefusal({ onComplete }: GAO001Scene07PatientRefusalProps) {
  const [stage, setStage] = useState<Stage>('prompt');

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = brandStyles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  const handleDecision = (isCorrect: boolean) => {
    if (isCorrect) {
      synth.playSuccess();
      setStage('success');
    } else {
      synth.playError();
      setStage('error');
    }
  };

  const resetScenario = () => {
    setStage('prompt');
  };

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
        imageSrc={gao001SceneArt['scene-07'].src}
        altText={gao001SceneArt['scene-07'].alt}
        objective="Address the patient refusal."
        onComplete={onComplete}
        linear={true}
        renderCustomModal={({ hotspot, close, complete }) => (
          REFUSAL_DECISIONS[hotspot.id]
            ? (
              <PatientRefusalDecisionModal
                hotspot={hotspot}
                close={close}
                complete={complete}
              />
            )
            : null
        )}
        hotspots={defineGao001Hotspots("GAO-001.lesson.l7.delivery", [
          {
            id: 'assess', x: 20, y: 50, label: 'Patient right',
            fieldNotes: {
              title: 'Patient Right',
              content: 'Ordered care does not override the patient right to refuse care.'
            },
            question: {
              prompt: "Mr. Torres refuses his ordered wound dressing change. What is Alex's first obligation?",
              choices: [
                { id: 'c1', text: 'Proceed anyway because the dressing change is ordered.', isCorrect: false, feedback: 'Not quite. Ordered care does not override refusal rights.' },
                { id: 'c2', text: 'Respect the refusal immediately and step back.', isCorrect: true, feedback: 'Correct. Start by respecting the patient choice.' }
              ]
            }
          },
          {
            id: 'supervisor', x: 40, y: 50, label: 'Explain risk',
            fieldNotes: {
              title: 'Explain Risk',
              content: 'Explain the risk and alternatives without coercion so the refusal is informed.'
            },
            question: {
              prompt: 'After respecting the refusal, what should Alex do next?',
              choices: [
                { id: 'c1', text: 'Leave without discussing risk.', isCorrect: false, feedback: 'Not quite. The patient needs risk education.' },
                { id: 'c2', text: 'Explain the risk and practical alternatives calmly.', isCorrect: true, feedback: 'Correct. This supports informed refusal.' }
              ]
            }
          },
          {
            id: 'manager', x: 60, y: 50, label: 'Notify care team',
            fieldNotes: {
              title: 'Notify Care Team',
              content: 'Notify the clinical team per process when refusal changes the care risk.'
            },
            question: {
              prompt: 'Mr. Torres still refuses after risk education. What is the safest next action?',
              choices: [
                { id: 'c1', text: 'Keep it between Alex and the patient.', isCorrect: false, feedback: 'Not quite. The care team needs timely notice.' },
                { id: 'c2', text: 'Notify the clinical team per process and follow instructions.', isCorrect: true, feedback: 'Correct. Notification preserves continuity of care.' }
              ]
            }
          },
          {
            id: 'after-hours', x: 80, y: 50, label: 'Document refusal',
            fieldNotes: {
              title: 'Document Refusal',
              content: 'Document the refused care, patient statement, education, notification, and follow-up instructions.'
            },
            question: {
              prompt: 'What makes the refusal note defensible?',
              choices: [
                { id: 'c1', text: 'Omit the refusal so the patient is not labeled noncompliant.', isCorrect: false, feedback: 'Not quite. Omitting the refusal hides care risk.' },
                { id: 'c2', text: 'Document refusal, education, response, notification, and follow-up.', isCorrect: true, feedback: 'Correct. That preserves the care record.' }
              ]
            }
          }
        ])}
      />
    );
  }

  return (
    <div className="h-full w-full bg-[#FAFBF8] flex flex-col items-center p-4 lg:p-8 relative overflow-hidden animate-fade-in">

      <div className="text-center mb-8 z-10 animate-slide-in-up" style={{ animationDelay: '0ms' }}>
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FEE2E2] rounded-full mb-3 shadow-sm">
          <UserX className="w-6 h-6 text-[#DC2626]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E3A3A] mb-2">Field Example: Patient Refusal</h2>
        <p className="text-[#524C4B] max-w-2xl mx-auto text-sm lg:text-base">
          Our core value of "Patient-First" means we must protect their health even when they are hesitant.
        </p>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center z-10">

        {/* Scenario Card */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-[#E5E7EB] w-full mb-8 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-start">
            <MessageSquareWarning className="w-8 h-8 text-[#0F5B54] mr-4 shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-[#1E3A3A] mb-3">Mr. Ray Torres</h3>
              <p className="text-[#4B5563] leading-relaxed mb-4">
                You arrive at Mr. Torres's home for a scheduled post-op wound check and dressing change. He greets you at the door but says,
                <span className="font-semibold italic text-[#1E3A3A]"> "I feel fine today, and my daughter is visiting with the grandkids. Can we just skip the dressing change? I don't want to bother with it right now."</span>
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Choices */}
        {stage === 'prompt' && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <button
              onClick={() => handleDecision(false)}
              className="text-left bg-white p-6 rounded-xl border-2 border-[#E5E7EB] hover:border-[#DC2626] hover:bg-[#FEF2F2] transition-all duration-300 shadow-sm group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#4B5563] group-hover:text-[#DC2626]">Option A</span>
                <ArrowRight className="w-5 h-5 text-transparent group-hover:text-[#DC2626] transition-colors" />
              </div>
              <p className="text-[#6B7280] text-sm leading-relaxed group-hover:text-[#991B1B]">
                "Okay, I understand. I will document that you refused the visit today and I'll schedule you for tomorrow instead."
              </p>
            </button>

            <button
              onClick={() => handleDecision(true)}
              className="text-left bg-white p-6 rounded-xl border-2 border-[#E5E7EB] hover:border-[#0F5B54] hover:bg-[#EEFBF6] transition-all duration-300 shadow-sm group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-[#4B5563] group-hover:text-[#0F5B54]">Option B</span>
                <ArrowRight className="w-5 h-5 text-transparent group-hover:text-[#0F5B54] transition-colors" />
              </div>
              <p className="text-[#6B7280] text-sm leading-relaxed group-hover:text-[#065F46]">
                "I understand you have family visiting, but skipping this dressing change increases your risk of infection. We can do it very quickly in your bedroom to give you privacy."
              </p>
            </button>
          </div>
        )}

        {/* Feedback States */}
        {stage === 'error' && (
          <div className="w-full bg-[#FEF2F2] p-6 rounded-2xl border border-[#F87171] shadow-sm animate-shake-error">
            <div className="flex items-start">
              <XCircle className="w-8 h-8 text-[#DC2626] mr-4 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-[#991B1B] mb-2">Incorrect Decision</h3>
                <p className="text-[#7F1D1D] mb-4 text-sm leading-relaxed">
                  Simply accepting a refusal without attempting to educate the patient or mitigate the barrier puts the patient at risk and does not align with our Patient-First value.
                </p>
                <button
                  onClick={resetScenario}
                  className="px-6 py-2 bg-white border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white font-bold rounded-lg transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 'success' && (
          <div className="w-full bg-[#EEFBF6] p-6 rounded-2xl border border-[#34D399] shadow-sm animate-slide-in-up">
            <div className="flex items-start">
              <CheckCircle2 className="w-8 h-8 text-[#059669] mr-4 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-[#065F46] mb-2">Excellent Clinical Judgment</h3>
                <p className="text-[#065F46] mb-4 text-sm leading-relaxed">
                  You successfully identified the patient's barrier (desire for privacy with family) and provided education and a reasonable alternative. We must always document our education and attempts to complete the required care.
                </p>
                <div className="bg-white p-4 rounded-lg border border-[#A7F3D0] mb-6 flex items-start">
                  <FileWarning className="w-5 h-5 text-[#0F5B54] mr-3 shrink-0" />
                  <p className="text-[#0F5B54] text-xs font-bold uppercase tracking-wider mt-0.5">
                    If the patient still refuses after education, you must notify the physician and document both the refusal and the education provided.
                  </p>
                </div>
                <button
                  onClick={() => {
                    synth.playClick();
                    onComplete?.();
                  }}
                  className="px-8 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-xl shadow-md transition-colors uppercase tracking-wider text-sm"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
