import { useState, useEffect, useRef } from 'react';
import { Users, AlertTriangle, ArrowRight, CheckCircle2, XCircle, PhoneCall, } from 'lucide-react';
import GAO001SharedOverlay, { type Hotspot } from './GAO001SharedOverlay';
import { defineGao001Hotspots } from '../data/gaoNodes/gao001HotspotContract';
import { gao001SceneArt } from '../data/gao001SceneArt';

interface GAO001Scene08EscalationPracticeProps {
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

const MANDATORY_REPORTING_SENTENCE =
  'Follow agency mandatory reporting protocol immediately; do not investigate or confront; supervisor/Compliance assists with required external reporting, but required reporting must not be delayed.';

type EscalationDecisionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
};

type EscalationDecisionConfig = {
  eyebrow: string;
  title: string;
  scenario: string;
  prompt: string;
  options: EscalationDecisionOption[];
  teachingPoint: string;
  reference: string;
};

const ESCALATION_DECISIONS: Record<string, EscalationDecisionConfig> = {
  professionalism: {
    eyebrow: 'Escalation practice',
    title: 'Urgency Level',
    scenario:
      'Grace, the patient daughter, asks Alex to check her blood pressure and then adjust the patient insulin dose because the sugars are high.',
    prompt: 'What is the safest first decision?',
    options: [
      {
        id: 'off-scope',
        text: '"Sure, let me check your blood pressure and we will adjust the dose based on the reading."',
        isCorrect: false,
        feedback:
          'Not quite. That treats an unassigned person and changes a medication order without authorization.',
      },
      {
        id: 'stay-in-scope',
        text: 'Decline the off-scope request and only treat the assigned patient within physician orders.',
        isCorrect: true,
        feedback:
          'Correct. Alex stays within role and does not independently expand the plan of care.',
      },
    ],
    teachingPoint:
      'Escalation starts by identifying whether the request is routine, urgent, emergent, or outside role. Off-scope care stops at the boundary.',
    reference: 'Scope of practice and physician orders',
  },
  documentation: {
    eyebrow: 'Escalation practice',
    title: 'Chain of Command',
    scenario:
      'The request could affect the patient plan, but Alex cannot independently change orders.',
    prompt: 'What keeps the escalation path safe?',
    options: [
      {
        id: 'independent',
        text: 'Handle it independently because Alex is already in the home.',
        isCorrect: false,
        feedback:
          'Not quite. Being present in the home does not expand clinical authority.',
      },
      {
        id: 'chain',
        text: 'Use the clinical chain of command and contact the supervising clinician or next designated leader.',
        isCorrect: true,
        feedback:
          'Correct. The chain of command keeps the patient plan controlled by authorized clinical leadership.',
      },
    ],
    teachingPoint:
      'When a field decision exceeds role, contact the right person instead of improvising.',
    reference: 'Agency escalation path',
  },
  dignity: {
    eyebrow: 'Escalation practice',
    title: 'Closed Loop',
    scenario:
      'Alex reaches a supervising clinician and receives instructions for the visit.',
    prompt: 'Which response closes the loop?',
    options: [
      {
        id: 'voicemail',
        text: 'Leave a voicemail and assume the message will be handled later.',
        isCorrect: false,
        feedback:
          'Not quite. An urgent or safety-sensitive concern needs confirmed receipt and clear instructions.',
      },
      {
        id: 'closed-loop',
        text: 'Confirm the instructions, repeat back key actions, and follow the agreed next step.',
        isCorrect: true,
        feedback:
          'Correct. Closed-loop communication prevents missed or misunderstood instructions.',
      },
    ],
    teachingPoint:
      'Closed-loop escalation means the concern is received, understood, assigned, and acted on.',
    reference: 'Closed-loop communication',
  },
  reporting: {
    eyebrow: 'Escalation practice',
    title: 'Document Action',
    scenario:
      'During the visit, Alex notices unexplained, defensive-style bruising on the patient arms.',
    prompt: 'What should Alex do?',
    options: [
      {
        id: 'confront',
        text: 'Question Grace aggressively until she admits what happened.',
        isCorrect: false,
        feedback:
          'Not quite. Independent investigation and confrontation can place the patient and staff at risk.',
      },
      {
        id: 'objective-report',
        text: 'Document objective observations and report immediately via protocol.',
        isCorrect: true,
        feedback:
          'Correct. Record objective facts and activate the required reporting process.',
      },
    ],
    teachingPoint:
      'Documentation should record what Alex saw, heard, did, who was notified, and any instructions received.',
    reference: 'Objective documentation',
  },
  checklist: {
    eyebrow: 'Escalation practice',
    title: 'Mandatory Report',
    scenario:
      'The bruising concern may involve abuse, neglect, or exploitation and cannot wait for informal follow-up.',
    prompt: 'Which action is required?',
    options: [
      {
        id: 'delay',
        text: 'Wait until the end of the week and see whether the bruising improves.',
        isCorrect: false,
        feedback:
          'Not quite. Possible abuse, neglect, or exploitation cannot be delayed for convenience.',
      },
      {
        id: 'mandatory-report',
        text: MANDATORY_REPORTING_SENTENCE,
        isCorrect: true,
        feedback:
          'Correct. Required reporting cannot be delayed while someone investigates or confronts the family.',
      },
    ],
    teachingPoint:
      'The safer decision is prompt reporting through the required protocol, paired with objective documentation.',
    reference: 'Agency mandatory reporting protocol',
  },
};

function EscalationDecisionModal({
  hotspot,
  close,
  complete,
}: {
  hotspot: Hotspot;
  close: () => void;
  complete: () => void;
}) {
  const decision = ESCALATION_DECISIONS[hotspot.id];
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

  const chooseOption = (option: EscalationDecisionOption) => {
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
        aria-labelledby={`gao001-escalation-${hotspot.id}-title`}
        aria-describedby={`gao001-escalation-${hotspot.id}-description`}
        tabIndex={-1}
        className="relative flex max-h-[min(88cqh,640px)] w-full max-w-[500px] flex-col overflow-hidden rounded-[18px] border border-[#E9E4E0] bg-white shadow-[0_28px_80px_rgba(15,91,84,0.22)] outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E9E4E0] px-6 py-5">
          <div>
            <p className="font-montserrat text-[11px] font-bold uppercase tracking-[0.22em] text-[#F06923]">
              {decision.eyebrow}
            </p>
            <h2
              id={`gao001-escalation-${hotspot.id}-title`}
              className="mt-2 font-montserrat text-2xl font-bold leading-tight text-[#007970]"
            >
              {decision.title}
            </h2>
            <p
              id={`gao001-escalation-${hotspot.id}-description`}
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

export default function GAO001Scene08EscalationPractice({ onComplete }: GAO001Scene08EscalationPracticeProps) {
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
        imageSrc={gao001SceneArt['scene-08'].src}
        altText={gao001SceneArt['scene-08'].alt}
        objective="Resolve the escalation scenario."
        onComplete={onComplete}
        linear={true}
        renderCustomModal={({ hotspot, close, complete }) => (
          ESCALATION_DECISIONS[hotspot.id]
            ? (
              <EscalationDecisionModal
                hotspot={hotspot}
                close={close}
                complete={complete}
              />
            )
            : null
        )}
        hotspots={defineGao001Hotspots("GAO-001.lesson.l8.delivery", [
          {
            id: 'professionalism', x: 20, y: 50, label: 'Urgency level',
            fieldNotes: {
              title: 'Urgency Level',
              content: 'Identify whether the issue is routine, urgent, emergent, or outside role before acting.'
            },
            question: {
              prompt: 'Grace asks Alex to check her blood pressure and adjust the patient insulin dose. What is safest?',
              choices: [
                { id: 'c1', text: 'Check Grace and adjust the dose.', isCorrect: false, feedback: 'Not quite. That crosses scope and changes an order.' },
                { id: 'c2', text: 'Decline the off-scope request and stay within physician orders.', isCorrect: true, feedback: 'Correct. Stay within role and orders.' }
              ]
            }
          },
          {
            id: 'documentation', x: 40, y: 50, label: 'Chain command',
            fieldNotes: {
              title: 'Chain of Command',
              content: 'Use the clinical chain of command when a request exceeds your role or authority.'
            },
            question: {
              prompt: 'What keeps the escalation path safe when the request exceeds role?',
              choices: [
                { id: 'c1', text: 'Handle it independently because Alex is already in the home.', isCorrect: false, feedback: 'Not quite. Presence does not expand authority.' },
                { id: 'c2', text: 'Contact the supervising clinician or next designated leader.', isCorrect: true, feedback: 'Correct. Use the chain of command.' }
              ]
            }
          },
          {
            id: 'dignity', x: 60, y: 50, label: 'Closed loop',
            fieldNotes: {
              title: 'Closed Loop',
              content: 'Confirm instructions were received, understood, assigned, and acted on.'
            },
            question: {
              prompt: 'Alex reaches a supervising clinician. Which response closes the loop?',
              choices: [
                { id: 'c1', text: 'Leave a voicemail and assume it will be handled.', isCorrect: false, feedback: 'Not quite. Safety-sensitive concerns need confirmed receipt.' },
                { id: 'c2', text: 'Confirm instructions, repeat back key actions, and follow the plan.', isCorrect: true, feedback: 'Correct. This is closed-loop escalation.' }
              ]
            }
          },
          {
            id: 'reporting', x: 80, y: 30, label: 'Document action',
            fieldNotes: {
              title: 'Document Action',
              content: 'Document objective observations, notifications, instructions, and actions taken.'
            },
            question: {
              prompt: 'Alex notices unexplained, defensive-style bruising. What should Alex do?',
              choices: [
                { id: 'c1', text: 'Question the family aggressively until someone explains.', isCorrect: false, feedback: 'Not quite. Do not independently investigate or confront.' },
                { id: 'c2', text: 'Document objective observations and report immediately via protocol.', isCorrect: true, feedback: 'Correct. Record facts and report.' }
              ]
            }
          },
          {
            id: 'checklist', x: 80, y: 70, label: 'Mandatory report',
            fieldNotes: {
              title: 'Mandatory Report',
              content: MANDATORY_REPORTING_SENTENCE
            },
            question: {
              prompt: 'Which action is required when possible abuse, neglect, or exploitation is suspected?',
              choices: [
                { id: 'c1', text: 'Wait until the end of the week and see if it improves.', isCorrect: false, feedback: 'Not quite. Required reporting must not be delayed.' },
                { id: 'c2', text: MANDATORY_REPORTING_SENTENCE, isCorrect: true, feedback: 'Correct. Reporting must be prompt.' }
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
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#F3F4F6] rounded-full mb-3 shadow-sm border border-[#E5E7EB]">
          <Users className="w-6 h-6 text-[#4B5563]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E3A3A] mb-2">Teamwork: Missed Medication</h2>
        <p className="text-[#524C4B] max-w-2xl mx-auto text-sm lg:text-base">
          Our core value of "Teamwork" means communicating professionally and prioritizing patient safety above blame.
        </p>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col items-center z-10">

        {/* Scenario Card */}
        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg border border-[#E5E7EB] w-full mb-8 animate-slide-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-start">
            <AlertTriangle className="w-8 h-8 text-[#D97706] mr-4 shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-[#1E3A3A] mb-3">The Discovery</h3>
              <p className="text-[#4B5563] leading-relaxed mb-4">
                You arrive at a patient's home at 1:00 PM. While reviewing the medication log, you notice the morning nurse forgot to sign off on the 8:00 AM dose of a critical blood pressure medication, and the pill is still in the daily planner.
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
                Apologize profusely to the patient, explain that the morning nurse is often forgetful, and immediately give the pill so they don't miss it entirely.
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
                Call the morning nurse to clarify if it was given but not signed. If truly missed, notify the physician, follow their orders, and document the incident report without disparaging your colleague to the patient.
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
                <h3 className="text-lg font-bold text-[#991B1B] mb-2">Poor Teamwork & High Risk</h3>
                <p className="text-[#7F1D1D] mb-4 text-sm leading-relaxed">
                  Disparaging colleagues to patients destroys trust in the entire agency. Furthermore, giving a late dose of blood pressure medication without physician approval could cause severe hypotension.
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
                <h3 className="text-lg font-bold text-[#065F46] mb-2">Excellent Professionalism</h3>
                <p className="text-[#065F46] mb-4 text-sm leading-relaxed">
                  You verified the facts first, protected the patient's safety by escalating to the physician, and maintained the agency's professional reputation by not undermining your colleague in front of the patient.
                </p>
                <div className="bg-white p-4 rounded-lg border border-[#A7F3D0] mb-6 flex items-start">
                  <PhoneCall className="w-5 h-5 text-[#0F5B54] mr-3 shrink-0" />
                  <p className="text-[#0F5B54] text-xs font-bold uppercase tracking-wider mt-0.5">
                    Remember: Accountability means we own and fix mistakes as a team. We do not hide them, and we do not use them to attack each other.
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
