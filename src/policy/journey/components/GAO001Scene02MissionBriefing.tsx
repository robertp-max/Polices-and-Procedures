import React, { useEffect, useId, useRef, useState } from 'react';
import { Activity, CheckCircle2, ChevronRight, Heart, HelpCircle, ShieldCheck, Users, X } from 'lucide-react';
import GAO001SharedOverlay, { type Hotspot } from './GAO001SharedOverlay';
import { defineGao001Hotspots } from '../data/gaoNodes/gao001HotspotContract';
import { gao001SceneArt } from '../data/gao001SceneArt';

interface GAO001Scene02MissionBriefingProps {
  onComplete?: () => void;
}

// Web Audio API Synthesizer for self-contained interaction sounds
class InteractiveAudioSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioContextCtor =
        window.AudioContext ??
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C E G
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
    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }
}

const synth = new InteractiveAudioSynth();

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

const brandStyles = `
  @keyframes slideInRight {
    0% { transform: translateX(20px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  .animate-slide-in-right {
    animation: slideInRight 0.4s ease-out forwards;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .animate-shake-error {
    animation: shake 0.4s ease-in-out;
  }

  @keyframes pulseSuccess {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }
  .animate-pulse-success {
    animation: pulseSuccess 1s ease-out;
  }
`;



interface Phrase {
  id: string;
  text: string;
  icon: React.ReactNode;
}

interface Decision {
  id: string;
  phraseId: string;
  text: string;
}

const MISSION_ACTIVITY_BY_HOTSPOT: Record<string, {
  phrase: string;
  fieldDecision: string;
  Icon: typeof ShieldCheck;
}> = {
  mission: {
    phrase: 'Deliver safe, dignified, evidence-based care',
    fieldDecision: 'Protect privacy, follow ordered care, and never shortcut safety for speed.',
    Icon: ShieldCheck,
  },
  vision: {
    phrase: 'Be the standard for compassionate, reliable home health care',
    fieldDecision: 'Arrive prepared, communicate delays, and keep promises the care team can honor.',
    Icon: Heart,
  },
  icons: {
    phrase: 'Restore independence',
    fieldDecision: 'Teach and coach within the plan of care instead of doing every task for the patient.',
    Icon: Activity,
  },
  notes: {
    phrase: 'Support patients, families, and caregivers as partners',
    fieldDecision: 'Listen, document facts, and route questions through the approved care process.',
    Icon: Users,
  },
};

interface MissionBriefingModalProps {
  hotspot: Hotspot;
  close: () => void;
  complete: () => void;
}

function MissionBriefingModal({ hotspot, close, complete }: MissionBriefingModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const activity = MISSION_ACTIVITY_BY_HOTSPOT[hotspot.id] ?? MISSION_ACTIVITY_BY_HOTSPOT.mission;
  const ActivityIcon = activity.Icon;
  const selectedChoice = hotspot.question?.choices.find((choice) => choice.id === selectedChoiceId);
  const canComplete = !hotspot.question || selectedChoice?.isCorrect === true;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector<HTMLButtonElement>('.gao001-custom-close')?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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

  return (
    <div
      className="gao-node-drawer-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        className="max-h-[min(88vh,760px)] w-[min(94vw,920px)] overflow-hidden rounded-[22px] border border-[#E5E4E3] bg-white shadow-[0_24px_72px_rgba(15,91,84,0.2)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#E5E4E3] bg-[#F8FAFC] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F5B54] text-white shadow-sm" aria-hidden="true">
              <ActivityIcon size={22} />
            </span>
            <div>
              <h2 id={titleId} className="text-lg font-bold leading-tight text-[#0F5B54]">
                Mission Briefing: {hotspot.label}
              </h2>
              <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.16em] text-[#F06923]">
                Connect the mission to a field decision
              </p>
            </div>
          </div>
          <button
            type="button"
            className="gao001-custom-close flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#DAD7D4] bg-white text-[#475569] transition hover:border-[#0F5B54] hover:text-[#0F5B54]"
            aria-label="Close mission briefing"
            onClick={close}
          >
            <X size={22} />
          </button>
        </header>

        <div className="grid max-h-[calc(min(88vh,760px)-76px)] overflow-y-auto bg-white md:grid-cols-[0.9fr_1.1fr]">
          <section className="border-b border-[#E5E4E3] bg-[#FFF8F3] p-5 md:border-b-0 md:border-r">
            <p id={descriptionId} className="text-[15.5px] font-semibold leading-relaxed text-[#2D3748]">
              Review the mission phrase, then choose the safest field decision.
            </p>

            <div className="mt-5 rounded-[18px] border border-[#F4D3C2] bg-white p-5 shadow-sm">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C74601]">
                Mission Phrase
              </div>
              <p className="text-xl font-bold leading-snug text-[#0F5B54]">
                {activity.phrase}
              </p>
            </div>

            <div className="mt-4 rounded-[18px] border border-[#D6E7E4] bg-[#EEF4F3] p-5">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0F5B54]">
                Field Translation
              </div>
              <p className="text-[15.5px] font-semibold leading-relaxed text-[#2D3748]">
                {activity.fieldDecision}
              </p>
            </div>
          </section>

          <section className="p-5">
            <div className="rounded-[16px] border border-[#E5E4E3] bg-[#FAFBF8] p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F5B54]">
                Why it matters
              </div>
              <h3 className="mt-2 text-base font-bold text-[#1E3A3A]">{hotspot.fieldNotes.title}</h3>
              <div className="mt-2 text-[15.5px] leading-relaxed text-[#2D3748]">
                {hotspot.fieldNotes.content}
              </div>
            </div>

            {hotspot.question ? (
              <fieldset className="mt-5">
                <legend className="mb-3 text-[15.5px] font-bold text-[#1E3A3A]">
                  {hotspot.question.prompt}
                </legend>
                <div className="flex flex-col gap-3">
                  {hotspot.question.choices.map((choice) => {
                    const isSelected = selectedChoiceId === choice.id;
                    const isCorrectSelection = isSelected && choice.isCorrect;
                    const isIncorrectSelection = isSelected && !choice.isCorrect;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        className={`min-h-12 rounded-[14px] border-2 px-4 py-3 text-left text-[15px] font-semibold leading-relaxed transition ${
                          isCorrectSelection
                            ? 'border-[#0F5B54] bg-[#EEF4F3] text-[#0F5B54]'
                            : isIncorrectSelection
                              ? 'border-[#E45A27] bg-[#FFF3EC] text-[#C74601]'
                              : 'border-[#E5E4E3] bg-white text-[#334155] hover:border-[#0F5B54]'
                        }`}
                        aria-pressed={isSelected}
                        onClick={() => {
                          synth.playClick();
                          setSelectedChoiceId(choice.id);
                          if (choice.isCorrect) synth.playSuccess();
                          else synth.playError();
                        }}
                      >
                        {choice.text}
                      </button>
                    );
                  })}
                </div>
                {selectedChoice ? (
                  <p
                    className={`mt-4 rounded-[14px] border p-4 text-[15px] leading-relaxed ${
                      selectedChoice.isCorrect
                        ? 'border-[#C8DFDC] bg-[#EEF4F3] text-[#0F5B54]'
                        : 'border-[#F4D3C2] bg-[#FFF8F3] text-[#C74601]'
                    }`}
                    role="status"
                  >
                    <span className="mb-1 flex items-center gap-2 font-bold">
                      {selectedChoice.isCorrect ? <CheckCircle2 size={18} /> : <HelpCircle size={18} />}
                      {selectedChoice.isCorrect ? 'Correct mission alignment' : 'Try again'}
                    </span>
                    {selectedChoice.feedback}
                  </p>
                ) : null}
              </fieldset>
            ) : null}

            <button
              type="button"
              className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#F06923] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-[0_12px_28px_rgba(240,105,35,0.26)] transition hover:bg-[#d95a1a] disabled:cursor-not-allowed disabled:opacity-45"
              disabled={!canComplete}
              onClick={complete}
            >
              <CheckCircle2 size={18} />
              Complete teaching point
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function GAO001Scene02MissionBriefing({ onComplete }: GAO001Scene02MissionBriefingProps) {
  const [activePhrase, setActivePhrase] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [errorPair, setErrorPair] = useState<{phrase: string, decision: string} | null>(null);
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
        imageSrc={gao001SceneArt['scene-02'].src}
        altText={gao001SceneArt['scene-02'].alt}
        objective="Connect the mission to field decisions."
        onComplete={onComplete}
        renderCustomModal={({ hotspot, close, complete }) => (
          <MissionBriefingModal hotspot={hotspot} close={close} complete={complete} />
        )}
        hotspots={defineGao001Hotspots("GAO-001.lesson.l2.delivery", [
          {
            id: 'mission', x: 25, y: 35, label: 'Mission card',
            fieldNotes: {
              title: 'Agency Mission',
              content: 'Deliver safe, dignified, evidence-based care to patients in their homes.'
            },
            question: {
              prompt: 'Which of the following best demonstrates the agency mission in daily practice?',
              choices: [
                { id: 'c1', text: 'Completing visits as quickly as possible to maximize agency revenue.', isCorrect: false, feedback: 'Not quite. The safer answer focuses on the quality of care, not the speed of the visit.' },
                { id: 'c2', text: 'Washing your hands before patient contact and ensuring the patient\'s privacy during a dressing change.', isCorrect: true, feedback: 'Correct. This protects the patient and demonstrates safe, dignified care.' },
                { id: 'c3', text: 'Telling the patient what to do without asking for their input.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because dignified care requires respecting the patient\'s autonomy.' }
              ]
            }
          },
          {
            id: 'vision', x: 75, y: 35, label: 'Vision card',
            fieldNotes: {
              title: 'Agency Vision',
              content: 'Be the standard for compassionate, reliable home health care in the community.'
            },
            question: {
              prompt: 'How does a clinician contribute to the agency\'s vision of being "reliable"?',
              choices: [
                { id: 'c1', text: 'By arriving on time for scheduled visits and communicating delays.', isCorrect: true, feedback: 'Good choice. Reliability builds trust with patients and their families.' },
                { id: 'c2', text: 'By promising patients that they will be completely cured.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because we cannot guarantee outcomes, only reliable, evidence-based care.' },
                { id: 'c3', text: 'By skipping difficult visits when the weather is bad.', isCorrect: false, feedback: 'Not quite. The safer answer is to follow agency protocols for weather emergencies while ensuring patient needs are met.' }
              ]
            }
          },
          {
            id: 'icons', x: 50, y: 60, label: 'Commitment icons',
            fieldNotes: {
              title: 'Commitment to Quality',
              content: 'Quality care means restoring independence and supporting families as partners.'
            },
            question: {
              prompt: 'Why is it important to support families as partners in care?',
              choices: [
                { id: 'c1', text: 'Because families are ultimately liable for the patient\'s health outcomes.', isCorrect: false, feedback: 'Not quite. The agency and clinician are responsible for the care provided.' },
                { id: 'c2', text: 'Because the family will take over care when we discharge the patient, and they need to be prepared.', isCorrect: true, feedback: 'Correct. Restoring independence means empowering the patient\'s support system.' },
                { id: 'c3', text: 'Because families can perform skilled nursing tasks to save the agency time.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because families cannot perform skilled tasks unless properly trained and documented according to the care plan.' }
              ]
            }
          },
          {
            id: 'notes', x: 60, y: 75, label: 'Alex notes',
            fieldNotes: {
              title: 'Notes',
              content: 'Alex is taking notes to remember how the mission applies to everyday tasks.'
            },
            question: {
              prompt: 'Taking notes during orientation helps align personal practice with agency standards. What should you do if an agency standard conflicts with your personal preference?',
              choices: [
                { id: 'c1', text: 'Follow your personal preference, as long as the patient is happy.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because agency standards are designed to comply with Medicare regulations and ensure safety.' },
                { id: 'c2', text: 'Always follow the agency standard, as it reflects evidence-based and compliant practice.', isCorrect: true, feedback: 'Good choice. Our policies protect both you and the patient.' },
                { id: 'c3', text: 'Ask the patient which way they prefer.', isCorrect: false, feedback: 'Not quite. The safer answer is to follow policy; while patient preference is important, it cannot override safety and compliance standards.' }
              ]
            }
          }
        ])}
      />
    );
  }

  const phrases: Phrase[] = [
    { id: 'p1', text: "Deliver safe, dignified, evidence-based care", icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'p2', text: "Restore independence", icon: <Activity className="w-5 h-5" /> },
    { id: 'p3', text: "Support patients, families, and caregivers as partners", icon: <Heart className="w-5 h-5" /> },
  ];

  const decisions: Decision[] = [
    { id: 'd2', phraseId: 'p2', text: "Teaching a stroke patient how to safely manage their medication instead of just doing it for them." },
    { id: 'd1', phraseId: 'p1', text: "Refusing to take a shortcut on a sterile dressing change despite being behind schedule." },
    { id: 'd3', phraseId: 'p3', text: "Taking the time to answer a daughter's questions about her father's prognosis instead of rushing out." },
  ];

  const handlePhraseClick = (id: string) => {
    if (matchedPairs.includes(id)) return;
    synth.playClick();
    setActivePhrase(id);
    setErrorPair(null);
  };

  const handleDecisionClick = (id: string, phraseId: string) => {
    if (!activePhrase || matchedPairs.includes(phraseId)) return;

    if (activePhrase === phraseId) {
      synth.playSuccess();
      setMatchedPairs(prev => {
        const next = [...prev, activePhrase];
        if (next.length === phrases.length) {
          setTimeout(() => {
            setTimeout(() => setShowCompletion(true), 300);
          }, 600);
        }
        return next;
      });
      setActivePhrase(null);
    } else {
      synth.playError();
      setErrorPair({ phrase: activePhrase, decision: id });
      setTimeout(() => setErrorPair(null), 800);
    }
  };

  return (
    <div className="h-full w-full bg-[#FAFBF8] flex flex-col items-center justify-center p-6 lg:p-8 animate-fade-in relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <Users className="w-64 h-64" />
      </div>

      <div className="w-full max-w-4xl z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#E8F5F3] rounded-full mb-4 shadow-sm">
            <Heart className="w-6 h-6 text-[#0F5B54]" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1E3A3A] mb-3">Our Mission in Action</h2>
          <p className="text-[#524C4B] max-w-2xl mx-auto">
            Every visit, note, and decision must trace back to our mission. Connect each phrase from our mission statement to the correct field decision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column: Mission Phrases */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F5B54] mb-2 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Mission Phrase
            </h3>
            {phrases.map((phrase, idx) => {
              const isMatched = matchedPairs.includes(phrase.id);
              const isSelected = activePhrase === phrase.id;
              const isError = errorPair?.phrase === phrase.id;

              return (
                <div
                  key={phrase.id}
                  onClick={() => handlePhraseClick(phrase.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-300 flex items-center cursor-pointer
                    ${isMatched ? 'bg-[#EEFBF6] border-[#34D399] text-[#065F46] animate-pulse-success cursor-default' :
                      isSelected ? 'bg-white border-[#0F5B54] shadow-md transform scale-[1.02]' :
                      isError ? 'bg-[#FEF2F2] border-[#F87171] animate-shake-error' :
                      'bg-white border-[#E5E7EB] hover:border-[#0F5B54] hover:shadow-sm text-[#4B5563]'}
                  `}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center mr-4 shrink-0
                    ${isMatched ? 'bg-[#D1FAE5] text-[#059669]' :
                      isSelected ? 'bg-[#0F5B54] text-white' :
                      'bg-[#F3F4F6] text-[#6B7280]'}
                  `}>
                    {isMatched ? <CheckCircle2 className="w-5 h-5" /> : phrase.icon}
                  </div>
                  <span className="font-semibold text-sm lg:text-base leading-snug">{phrase.text}</span>
                  {isSelected && <ChevronRight className="w-5 h-5 ml-auto text-[#0F5B54] animate-pulse" />}
                </div>
              );
            })}
          </div>

          {/* Right Column: Field Decisions */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F5B54] mb-2 flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Field Decision
            </h3>
            {decisions.map((decision, idx) => {
              const isMatched = matchedPairs.includes(decision.phraseId);
              const isError = errorPair?.decision === decision.id;

              return (
                <div
                  key={decision.id}
                  onClick={() => handleDecisionClick(decision.id, decision.phraseId)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-300 flex items-start
                    ${isMatched ? 'bg-[#EEFBF6] border-[#34D399] opacity-80 cursor-default' :
                      activePhrase && !isMatched ? 'bg-white border-[#E5E7EB] hover:border-[#0F5B54] hover:shadow-md cursor-pointer animate-slide-in-right' :
                      isError ? 'bg-[#FEF2F2] border-[#F87171] animate-shake-error' :
                      'bg-white border-[#E5E7EB] opacity-50 cursor-not-allowed'}
                  `}
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center mr-4 shrink-0 mt-0.5
                    ${isMatched ? 'bg-[#34D399] text-white' : 'bg-gray-200 text-transparent'}
                  `}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <p className={`text-sm lg:text-base leading-relaxed ${isMatched ? 'text-[#065F46] font-medium' : 'text-[#4B5563]'}`}>
                    {decision.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completion Modal / State */}
        {showCompletion && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#E5E4E3] max-w-md text-center transform animate-pop-in">
              <div className="w-16 h-16 bg-[#EEFBF6] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#059669]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1E3A3A] mb-2">Mission Accomplished</h3>
              <p className="text-[#524C4B] mb-6">
                You successfully connected our core mission to the everyday decisions that make it a reality.
              </p>
              <button
                onClick={() => {
                  synth.playClick();
                  onComplete?.();
                }}
                className="w-full py-3 bg-[#0F5B54] hover:bg-[#0A3D38] text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Continue Training
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
