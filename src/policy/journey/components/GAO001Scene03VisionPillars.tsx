import { useEffect, useId, useRef, useState } from 'react';
import { AlertCircle, Building, CheckCircle2, Eye, FileText, Heart, Shield, Star, TrendingUp, Users, X, type LucideIcon } from 'lucide-react';
import GAO001SharedOverlay, { type Hotspot, type HotspotQuestionChoice } from './GAO001SharedOverlay';
import { defineGao001Hotspots } from '../data/gaoNodes/gao001HotspotContract';
import { gao001SceneArt } from '../data/gao001SceneArt';

interface GAO001Scene03VisionPillarsProps {
  onComplete?: () => void;
}

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
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
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
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
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
}

const synth = new InteractiveAudioSynth();

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

const brandStyles = `
  @keyframes slideUpFade {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-up-fade {
    animation: slideUpFade 0.5s ease-out forwards;
  }

  @keyframes pillarGlow {
    0%, 100% { box-shadow: 0 4px 6px -1px rgba(15, 91, 84, 0.1), 0 2px 4px -1px rgba(15, 91, 84, 0.06); }
    50% { box-shadow: 0 10px 15px -3px rgba(15, 91, 84, 0.3), 0 4px 6px -2px rgba(15, 91, 84, 0.1); }
  }
  .pillar-active {
    animation: pillarGlow 2s infinite ease-in-out;
    border-color: #0F5B54 !important;
    background-color: #EEFBF6 !important;
  }
`;

type VisionPillarId = 'compassion' | 'integrity' | 'excellence' | 'teamwork';

interface VisionPillarDefinition {
  id: VisionPillarId;
  title: string;
  shortLabel: string;
  Icon: LucideIcon;
  behavior: string;
  question: string;
  options: HotspotQuestionChoice[];
  fieldNote: string;
}

const VISION_PILLARS: VisionPillarDefinition[] = [
  {
    id: 'compassion',
    title: 'Clinical Excellence',
    shortLabel: 'Clin Excellence',
    Icon: Shield,
    behavior: 'Outcomes above national benchmarks, accurate OASIS coding, evidence-based care plans, and timely interventions.',
    question: 'Which daily behavior belongs to Clinical Excellence?',
    options: [
      { id: 'a', text: 'Ensure documentation is complete today, not next week.', isCorrect: false, feedback: 'Documentation timeliness matters, but in this set it is the Regulatory Leadership behavior.' },
      { id: 'b', text: 'Pursue OASIS coding accuracy and care plans built on evidence, never rushing assessments.', isCorrect: true, feedback: 'Correct. Clinical Excellence is about accurate clinical judgment, evidence, and outcomes.' },
      { id: 'c', text: 'Build trust with referral sources one visit at a time.', isCorrect: false, feedback: 'That belongs to Community Trust. Clinical Excellence focuses on evidence-based care and outcomes.' },
      { id: 'd', text: 'Complete role-specific training and annual refreshers on schedule.', isCorrect: false, feedback: 'That belongs to Workforce Growth. Clinical Excellence is the outcomes-and-accuracy pillar.' },
    ],
    fieldNote: 'Clinical Excellence means outcomes and accuracy. Documentation timeliness is Regulatory Leadership. Referral relationships are Community Trust. Training is Workforce Growth.',
  },
  {
    id: 'integrity',
    title: 'Workforce Growth',
    shortLabel: 'Workforce Growth',
    Icon: Users,
    behavior: 'Role-specific training, annual competency refreshers, cross-training, and internal mentorship programs.',
    question: 'Which behavior belongs to Workforce Growth?',
    options: [
      { id: 'a', text: 'Complete annual competency refreshers and seek role-specific training proactively.', isCorrect: true, feedback: 'Correct. Workforce Growth is about developing people and keeping competency current.' },
      { id: 'b', text: 'Ensure every patient interaction upholds regulatory standards.', isCorrect: false, feedback: 'That belongs to Regulatory Leadership. Workforce Growth focuses on training and competency development.' },
      { id: 'c', text: 'Advocate for the agency with every quality interaction in the community.', isCorrect: false, feedback: 'That belongs to Community Trust. Workforce Growth is about staff development.' },
      { id: 'd', text: 'Document clinical findings accurately and within the required timeframe.', isCorrect: false, feedback: 'That is closer to Clinical Excellence and Regulatory Leadership than Workforce Growth.' },
    ],
    fieldNote: 'Workforce Growth is about developing people. Clinical Excellence is outcomes-driven. Regulatory Leadership is standards-driven. Community Trust is relationship-driven.',
  },
  {
    id: 'excellence',
    title: 'Regulatory Leadership',
    shortLabel: 'Regulatory Lead',
    Icon: FileText,
    behavior: 'Survey-ready every single day. Complete documentation on time. Zero tolerance for compliance gaps.',
    question: 'Which behavior belongs to Regulatory Leadership?',
    options: [
      { id: 'a', text: 'Improve OASIS scoring accuracy by reviewing clinical evidence before each assessment.', isCorrect: false, feedback: 'That supports Clinical Excellence. Regulatory Leadership is the daily survey-ready standard.' },
      { id: 'b', text: 'Stay survey-ready every day, not just when a survey is expected.', isCorrect: true, feedback: 'Correct. Regulatory Leadership means defensible work all the time.' },
      { id: 'c', text: 'Attend internal mentorship sessions and complete annual refresher trainings.', isCorrect: false, feedback: 'That belongs to Workforce Growth. Regulatory Leadership is standards-driven.' },
      { id: 'd', text: 'Represent the agency with professionalism at community health events.', isCorrect: false, feedback: 'That belongs to Community Trust. Regulatory Leadership focuses on survey readiness and compliance.' },
    ],
    fieldNote: '"Survey-ready every single day" is the Regulatory Leadership standard. A surveyor can arrive unannounced, so the work has to be defensible always.',
  },
  {
    id: 'teamwork',
    title: 'Community Trust',
    shortLabel: 'Community Trust',
    Icon: Heart,
    behavior: 'Referral relationships, community presence, reputation built visit by visit, and patient advocacy.',
    question: 'Which behavior belongs to Community Trust?',
    options: [
      { id: 'a', text: 'Build referral relationships and represent Care Indeed with integrity in every community interaction.', isCorrect: true, feedback: 'Correct. Community Trust is built through reliable, professional representation over time.' },
      { id: 'b', text: 'Achieve accurate clinical outcomes through evidence-based care.', isCorrect: false, feedback: 'That belongs to Clinical Excellence. Community Trust focuses on reputation and relationships.' },
      { id: 'c', text: 'Complete competency refreshers before the deadline.', isCorrect: false, feedback: 'That belongs to Workforce Growth. Community Trust is the relationship pillar.' },
      { id: 'd', text: 'Keep survey files current only when a survey is scheduled.', isCorrect: false, feedback: 'That misses Regulatory Leadership. Survey readiness must be continuous, not event-based.' },
    ],
    fieldNote: 'Community Trust is the reputation Care Indeed earns in homes, referral relationships, and community interactions. It is built one defensible action at a time.',
  },
];

const VISION_PILLAR_BY_ID = new Map(VISION_PILLARS.map((pillar) => [pillar.id, pillar]));

interface VisionPillarModalProps {
  hotspot: Hotspot;
  close: () => void;
  complete: () => void;
}

function VisionPillarModal({ hotspot, close, complete }: VisionPillarModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [revealedIds, setRevealedIds] = useState<Set<VisionPillarId>>(new Set());
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const activePillar = VISION_PILLAR_BY_ID.get(hotspot.id as VisionPillarId) ?? VISION_PILLARS[0];
  const activeRevealed = revealedIds.has(activePillar.id);
  const selectedChoice = hotspot.question?.choices.find((choice) => choice.id === selectedChoiceId);
  const canComplete = activeRevealed && selectedChoice?.isCorrect === true;

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
        className="max-h-[min(88vh,780px)] w-[min(94vw,980px)] overflow-hidden rounded-[22px] border border-[#E5E4E3] bg-white shadow-[0_24px_72px_rgba(15,91,84,0.2)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#E5E4E3] bg-[#F8FAFC] px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-bold leading-tight text-[#0F5B54]">
              Vision Pillars: {activePillar.title}
            </h2>
            <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C2410C]">
              Reveal the pillar, then apply it to the field decision
            </p>
          </div>
          <button
            type="button"
            className="gao001-custom-close flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#DAD7D4] bg-white text-[#475569] transition hover:border-[#0F5B54] hover:text-[#0F5B54]"
            aria-label="Close vision pillars"
            onClick={close}
          >
            <X size={22} />
          </button>
        </header>

        <div className="max-h-[calc(min(88vh,780px)-76px)] overflow-y-auto p-5">
          <p id={descriptionId} className="max-w-3xl text-[15.5px] font-semibold leading-relaxed text-[#2D3748]">
            Tap the highlighted pillar to reveal the field behavior, then choose the action that matches it.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {VISION_PILLARS.map((pillar) => {
              const isActive = pillar.id === activePillar.id;
              const isRevealed = revealedIds.has(pillar.id);
              const PillarIcon = pillar.Icon;
              return (
                <button
                  key={pillar.id}
                  type="button"
                  className={`min-h-[160px] rounded-[18px] border-2 p-4 text-left transition ${
                    isActive
                      ? 'border-[#0F5B54] bg-[#EEF4F3] shadow-[0_12px_28px_rgba(15,91,84,0.12)]'
                      : 'border-[#E5E4E3] bg-white opacity-70 hover:opacity-100'
                  }`}
                  aria-pressed={isRevealed}
                  onClick={() => {
                    synth.playClick();
                    setRevealedIds((previous) => new Set(previous).add(pillar.id));
                  }}
                >
                  <span className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${
                    isRevealed ? 'bg-[#0F5B54] text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'
                  }`}>
                    <PillarIcon size={22} />
                  </span>
                  <span className="block text-sm font-bold text-[#0F5B54]">{pillar.title}</span>
                  <span className={`mt-3 block text-[13px] font-medium leading-relaxed text-[#475569] transition ${
                    isRevealed ? 'opacity-100' : 'opacity-0'
                  }`}>
                    {pillar.behavior}
                  </span>
                  {!isRevealed ? (
                    <span className="mt-3 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#C2410C]">
                      Tap to reveal
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <section className="rounded-[18px] border border-[#D6E7E4] bg-[#FAFBF8] p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F5B54]">
                Field Note
              </div>
              <h3 className="mt-2 text-lg font-bold text-[#1E3A3A]">{hotspot.fieldNotes.title}</h3>
              <div className="mt-2 text-[15.5px] leading-relaxed text-[#2D3748]">
                {hotspot.fieldNotes.content}
              </div>
              <p className="mt-4 rounded-[14px] bg-[#EEF4F3] p-4 text-[14px] font-semibold leading-relaxed text-[#0F5B54]">
                {activePillar.fieldNote}
              </p>
            </section>

            <section className={`${activeRevealed ? '' : 'opacity-45'}`}>
              <fieldset disabled={!activeRevealed}>
                <legend className="mb-3 text-[15.5px] font-bold text-[#1E3A3A]">
                  {hotspot.question?.prompt ?? activePillar.question}
                </legend>
                <div className="flex flex-col gap-3">
                  {hotspot.question?.choices.map((choice) => {
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
                      {selectedChoice.isCorrect ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      {selectedChoice.isCorrect ? 'Correct pillar match' : 'Try again'}
                    </span>
                    {selectedChoice.feedback}
                  </p>
                ) : null}
              </fieldset>

              {!activeRevealed ? (
                <p className="mt-3 text-[13px] font-semibold text-[#C74601]" role="status">
                  Reveal {activePillar.title} first to unlock the field decision.
                </p>
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
    </div>
  );
}

export default function GAO001Scene03VisionPillars({ onComplete }: GAO001Scene03VisionPillarsProps) {
  const [revealed, setRevealed] = useState<string[]>([]);
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
        imageSrc={gao001SceneArt['scene-03'].src}
        altText={gao001SceneArt['scene-03'].alt}
        objective="Apply the vision pillars to field behavior."
        onComplete={onComplete}
        renderCustomModal={({ hotspot, close, complete }) => (
          <VisionPillarModal hotspot={hotspot} close={close} complete={complete} />
        )}
        hotspots={defineGao001Hotspots("GAO-001.lesson.l3.delivery", [
          {
            id: 'compassion', x: 25, y: 50, label: VISION_PILLARS[0].shortLabel,
            fieldNotes: {
              title: VISION_PILLARS[0].title,
              content: VISION_PILLARS[0].behavior
            },
            question: {
              prompt: VISION_PILLARS[0].question,
              choices: VISION_PILLARS[0].options
            }
          },
          {
            id: 'integrity', x: 45, y: 50, label: VISION_PILLARS[1].shortLabel,
            fieldNotes: {
              title: VISION_PILLARS[1].title,
              content: VISION_PILLARS[1].behavior
            },
            question: {
              prompt: VISION_PILLARS[1].question,
              choices: VISION_PILLARS[1].options
            }
          },
          {
            id: 'excellence', x: 65, y: 50, label: VISION_PILLARS[2].shortLabel,
            fieldNotes: {
              title: VISION_PILLARS[2].title,
              content: VISION_PILLARS[2].behavior
            },
            question: {
              prompt: VISION_PILLARS[2].question,
              choices: VISION_PILLARS[2].options
            }
          },
          {
            id: 'teamwork', x: 85, y: 50, label: VISION_PILLARS[3].shortLabel,
            fieldNotes: {
              title: VISION_PILLARS[3].title,
              content: VISION_PILLARS[3].behavior
            },
            question: {
              prompt: VISION_PILLARS[3].question,
              choices: VISION_PILLARS[3].options
            }
          }
        ])}
      />
    );
  }

  const pillars = [
    {
      id: 'outcomes',
      title: 'Patient Outcomes',
      icon: <TrendingUp className="w-8 h-8" />,
      behavior: 'We actively monitor for subtle changes—like unexpected weight gain in a CHF patient—and intervene before it leads to hospital readmission.',
      delay: '0ms'
    },
    {
      id: 'satisfaction',
      title: 'Satisfaction Scores',
      icon: <Star className="w-8 h-8" />,
      behavior: 'We earn trust by keeping our promises: calling when we say we will, arriving during our promised window, and treating the home with deep respect.',
      delay: '150ms'
    },
    {
      id: 'survey',
      title: 'Survey Results',
      icon: <FileText className="w-8 h-8" />,
      behavior: 'We document in real-time at the point of care, ensuring every note accurately reflects the physician\'s orders and the care we provided.',
      delay: '300ms'
    }
  ];

  const handleReveal = (id: string) => {
    if (revealed.includes(id)) return;
    synth.playClick();
    const newRevealed = [...revealed, id];
    setRevealed(newRevealed);

    if (newRevealed.length === pillars.length) {
      setTimeout(() => {
        synth.playSuccess();
        setShowCompletion(true);
      }, 500);
    }
  };

  return (
    <div className="h-full w-full bg-[#FAFBF8] flex flex-col items-center justify-center p-6 lg:p-8 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute -top-10 -left-10 opacity-[0.03] pointer-events-none">
        <Building className="w-64 h-64" />
      </div>

      <div className="w-full max-w-5xl z-10">
        <div className="text-center mb-10 animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#E8F5F3] rounded-full mb-4 shadow-sm">
            <Eye className="w-6 h-6 text-[#0F5B54]" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1E3A3A] mb-3">Pillars of Our Vision</h2>
          <p className="text-[#524C4B] max-w-2xl mx-auto">
            To be the most trusted home health partner, we must earn trust visit by visit. Tap each pillar to reveal the field behaviors that build this trust.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          {pillars.map((pillar) => {
            const isRevealed = revealed.includes(pillar.id);
            return (
              <div
                key={pillar.id}
                onClick={() => handleReveal(pillar.id)}
                className={`
                  relative flex flex-col items-center p-6 lg:p-8 rounded-2xl border-2 transition-all duration-500 cursor-pointer overflow-hidden animate-slide-up-fade
                  ${isRevealed ? 'pillar-active' : 'bg-white border-[#E5E7EB] hover:border-[#34D399] hover:shadow-lg hover:-translate-y-1'}
                `}
                style={{ animationDelay: pillar.delay, minHeight: '280px' }}
              >
                {/* Decorative header of the pillar */}
                <div className={`w-full h-2 absolute top-0 left-0 ${isRevealed ? 'bg-[#0F5B54]' : 'bg-[#E5E7EB]'}`} />

                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-500
                  ${isRevealed ? 'bg-[#0F5B54] text-white shadow-md' : 'bg-[#F3F4F6] text-[#9CA3AF]'}
                `}>
                  {pillar.icon}
                </div>

                <h3 className={`text-xl font-bold text-center mb-4 ${isRevealed ? 'text-[#0F5B54]' : 'text-[#4B5563]'}`}>
                  {pillar.title}
                </h3>

                <div className="flex-1 w-full flex items-center justify-center">
                  {isRevealed ? (
                    <p className="text-sm lg:text-base text-center text-[#065F46] font-medium leading-relaxed animate-fade-in">
                      {pillar.behavior}
                    </p>
                  ) : (
                    <div className="text-sm font-bold uppercase tracking-wider text-[#9CA3AF] flex items-center">
                      Tap to reveal
                    </div>
                  )}
                </div>

                {/* Pedestal base of the pillar */}
                <div className={`w-3/4 h-3 absolute bottom-0 rounded-t-md ${isRevealed ? 'bg-[#0F5B54]' : 'bg-[#E5E7EB]'}`} />
              </div>
            );
          })}
        </div>

        {/* Completion State */}
        {showCompletion && (
          <div className="flex flex-col items-center justify-center animate-slide-up-fade">
            <div className="bg-[#EEFBF6] px-8 py-6 rounded-2xl shadow-sm border border-[#34D399] flex flex-col sm:flex-row items-center max-w-3xl">
              <Shield className="w-12 h-12 text-[#059669] mb-4 sm:mb-0 sm:mr-6 shrink-0" />
              <div>
                <h4 className="text-lg font-bold text-[#065F46] mb-1">Trust is Earned Every Day</h4>
                <p className="text-[#065F46]/80 text-sm mb-4">
                  These three pillars form the foundation of our reputation. A single failure to act on a patient concern can damage them all.
                </p>
                <button
                  onClick={() => {
                    synth.playClick();
                    onComplete?.();
                  }}
                  className="px-6 py-2 bg-[#059669] hover:bg-[#047857] text-white font-bold rounded-lg shadow-sm transition-colors text-sm uppercase tracking-wider"
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
