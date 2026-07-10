import { useState, useEffect } from 'react';
import { Eye, TrendingUp, Star, FileText, Building, Shield } from 'lucide-react';
import GAO001SharedOverlay from './GAO001SharedOverlay';
import { gao001SceneArt } from '../data/gao001SceneArt';

interface GAO001Scene03VisionPillarsProps {
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
        objective="Reveal the 3 pillars of excellence."
        onComplete={onComplete}
        hotspots={[
          {
            id: 'compassion', x: 25, y: 50, label: 'Compassion',
            fieldNotes: {
              title: 'Compassion',
              content: 'Treating patients with empathy, understanding their challenges in the home environment.'
            },
            question: {
              prompt: 'How is compassion best demonstrated during a home visit?',
              choices: [
                { id: 'c1', text: 'By feeling sorry for the patient and doing tasks they can do themselves.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because doing tasks the patient can do reduces their independence.' },
                { id: 'c2', text: 'By actively listening to their concerns and adjusting care within safe boundaries.', isCorrect: true, feedback: 'Correct. Compassion means understanding their perspective while maintaining clinical safety.' },
                { id: 'c3', text: 'By sharing your own personal problems to build a connection.', isCorrect: false, feedback: 'Not quite. The safer answer is to maintain professional boundaries while showing empathy for their situation.' }
              ]
            }
          },
          {
            id: 'integrity', x: 45, y: 50, label: 'Integrity',
            fieldNotes: {
              title: 'Integrity',
              content: 'Documenting accurately, maintaining confidentiality, and doing what is right even when unsupervised.'
            },
            question: {
              prompt: 'Which scenario best demonstrates integrity in home health?',
              choices: [
                { id: 'c1', text: 'Documenting a visit as 45 minutes long when you were only there for 15 minutes.', isCorrect: false, feedback: 'Not quite. Falsifying documentation is fraud and a severe violation of integrity and law.' },
                { id: 'c2', text: 'Reporting a medication error you made immediately to the physician and supervisor.', isCorrect: true, feedback: 'Good choice. Integrity means owning mistakes and prioritizing patient safety over avoiding discipline.' },
                { id: 'c3', text: 'Discussing a patient\'s condition with your friends to get their advice.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because it violates HIPAA privacy rules.' }
              ]
            }
          },
          {
            id: 'excellence', x: 65, y: 50, label: 'Excellence',
            fieldNotes: {
              title: 'Excellence',
              content: 'Striving for the best clinical outcomes and continually updating your skills.'
            },
            question: {
              prompt: 'How do you pursue excellence when faced with an unfamiliar clinical procedure?',
              choices: [
                { id: 'c1', text: 'Perform the procedure anyway so the patient doesn\'t lose confidence in you.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because performing unfamiliar procedures can harm the patient.' },
                { id: 'c2', text: 'Refuse to see the patient ever again.', isCorrect: false, feedback: 'Not quite. The safer answer is to seek guidance and training to handle the patient\'s needs.' },
                { id: 'c3', text: 'Review the policy manual, consult with your supervisor, and request training before proceeding.', isCorrect: true, feedback: 'Correct. Excellence involves recognizing limits and actively improving your skills.' }
              ]
            }
          },
          {
            id: 'teamwork', x: 85, y: 50, label: 'Teamwork',
            fieldNotes: {
              title: 'Teamwork',
              content: 'Collaborating seamlessly with supervisors, physicians, and families to support the patient.'
            },
            question: {
              prompt: 'A patient asks you to change their wound care schedule to a different day, which affects the physical therapist\'s schedule. What is the best teamwork approach?',
              choices: [
                { id: 'c1', text: 'Change the schedule immediately and let the PT find out when they arrive.', isCorrect: false, feedback: 'Not quite. Failing to communicate disrupts care and undermines teamwork.' },
                { id: 'c2', text: 'Tell the patient that the schedule cannot be changed under any circumstances.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because patient needs may warrant a schedule change if coordinated properly.' },
                { id: 'c3', text: 'Coordinate with the physical therapist and the clinical manager to adjust the schedule safely.', isCorrect: true, feedback: 'Good choice. Teamwork means proactive communication to ensure all disciplines are aligned.' }
              ]
            }
          }
        ]}
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
