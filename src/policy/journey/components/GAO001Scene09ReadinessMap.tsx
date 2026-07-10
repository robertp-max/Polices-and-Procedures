import { useState, useEffect } from 'react';
import { Map, ArrowRight, CheckCircle2, ShieldAlert, Lock, BookOpen, Star, ShieldCheck, HeartPulse } from 'lucide-react';
import GAO001SharedOverlay from './GAO001SharedOverlay';
import { gao001SceneArt } from '../data/gao001SceneArt';

interface GAO001Scene09ReadinessMapProps {
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

  playUnlock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.05, now + i * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 1.0);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 1.1);
    });
  }
}

const synth = new InteractiveAudioSynth();

const brandStyles = `
  @keyframes slideInLeft {
    0% { transform: translateX(-30px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  .animate-slide-in-left {
    animation: slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes unlockPulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
    50% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(52, 211, 153, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
  }
  .animate-unlock-pulse {
    animation: unlockPulse 1.5s infinite;
  }

  @keyframes mapDraw {
    0% { height: 0; opacity: 0; }
    100% { height: 100%; opacity: 1; }
  }
  .animate-map-draw {
    animation: mapDraw 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

export default function GAO001Scene09ReadinessMap({ onComplete }: GAO001Scene09ReadinessMapProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      synth.playUnlock();
      setIsUnlocked(true);
    }, 2800);

    return () => {
      clearTimeout(timer);
    };
  }, []);

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
        imageSrc={gao001SceneArt['scene-09'].src}
        altText={gao001SceneArt['scene-09'].alt}
        objective="Review Alex’s first-week learning map."
        onComplete={onComplete}
        linear={true}
        hotspots={[
          {
            id: 'mission', x: 20, y: 30, label: 'Mission',
            fieldNotes: {
              title: 'Mission',
              content: 'To help people thrive at home by providing compassionate and innovative care.'
            },
            question: {
              prompt: 'How does the agency mission apply to your daily work?',
              choices: [
                { id: 'c1', text: 'It\'s just a phrase for the website; my job is strictly clinical.', isCorrect: false, feedback: 'Not quite. The mission is the foundation of how we deliver care.' },
                { id: 'c2', text: 'It guides me to provide compassionate, innovative care that helps patients thrive at home.', isCorrect: true, feedback: 'Correct. The mission should be evident in every patient interaction.' },
                { id: 'c3', text: 'It means I should innovate by trying new medical procedures on patients.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because innovation must always remain within your scope of practice and the established care plan.' }
              ]
            }
          },
          {
            id: 'vision', x: 40, y: 30, label: 'Vision',
            fieldNotes: {
              title: 'Vision',
              content: 'To be the most trusted and sought-after home health agency in the community.'
            },
            question: {
              prompt: 'What is the vision of the agency?',
              choices: [
                { id: 'c1', text: 'To be the most trusted and sought-after home health agency in the community.', isCorrect: true, feedback: 'Correct.' },
                { id: 'c2', text: 'To make the most profit in the industry.', isCorrect: false, feedback: 'Not quite.' },
                { id: 'c3', text: 'To provide care only when it is convenient.', isCorrect: false, feedback: 'Not quite.' }
              ]
            }
          },
          {
            id: 'core-values', x: 60, y: 30, label: 'Core values',
            fieldNotes: {
              title: 'Core Values',
              content: 'Compassion, Integrity, Excellence, Innovation, and Teamwork.'
            },
            question: {
              prompt: 'If you discover a mistake in your own documentation, which core value guides your next action?',
              choices: [
                { id: 'c1', text: 'Teamwork; I should ask a coworker to fix it for me.', isCorrect: false, feedback: 'Not quite. Only the clinician who provided the care can document it.' },
                { id: 'c2', text: 'Innovation; I should create a new way to document so it doesn\'t look like a mistake.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because altering records deceptively is fraud.' },
                { id: 'c3', text: 'Integrity; I should promptly follow the policy to enter a late entry or addendum correcting the error.', isCorrect: true, feedback: 'Correct. Integrity means owning and transparently correcting mistakes.' }
              ]
            }
          },
          {
            id: 'home-health-diff', x: 80, y: 30, label: 'Home health difference',
            fieldNotes: {
              title: 'Home Health Difference',
              content: 'Delivering care in the patient\'s environment requires adaptability and holistic thinking.'
            },
            question: {
              prompt: 'Why is home health different?',
              choices: [
                { id: 'c1', text: 'It requires adaptability and holistic thinking in the patient\'s own environment.', isCorrect: true, feedback: 'Correct.' },
                { id: 'c2', text: 'It is always easier than hospital work.', isCorrect: false, feedback: 'Not quite.' },
                { id: 'c3', text: 'It is the same as hospital work, just in a different place.', isCorrect: false, feedback: 'Not quite.' }
              ]
            }
          },
          {
            id: 'reporting', x: 20, y: 70, label: 'Reporting protocol',
            fieldNotes: {
              title: 'Reporting Protocol',
              content: 'Report facts objectively and escalate concerns promptly to ensure patient safety.'
            },
            question: {
              prompt: 'When reporting an incident to your clinical manager, you should provide:',
              choices: [
                { id: 'c1', text: 'Your personal opinion on whose fault the incident was.', isCorrect: false, feedback: 'Not quite. Assigning blame does not help assess the clinical situation.' },
                { id: 'c2', text: 'Objective facts, vital signs, what you observed, and what interventions you performed.', isCorrect: true, feedback: 'Correct. Clear, factual reporting allows the manager to provide the best guidance.' },
                { id: 'c3', text: 'Only the information that won\'t get the patient in trouble.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because withholding facts can compromise the patient\'s safety and care plan.' }
              ]
            }
          },
          {
            id: 'rights', x: 40, y: 70, label: 'Patient rights/refusal',
            fieldNotes: {
              title: 'Patient Rights & Refusal',
              content: 'Respect the patient\'s autonomy and document their decisions accurately.'
            },
            question: {
              prompt: 'If a patient refuses a medication, you should:',
              choices: [
                { id: 'c1', text: 'Force them to take it for their own good.', isCorrect: false, feedback: 'Not quite.' },
                { id: 'c2', text: 'Respect their autonomy, educate them on the risks of refusal, and document the refusal.', isCorrect: true, feedback: 'Correct.' },
                { id: 'c3', text: 'Ignore it and tell them it\'s mandatory.', isCorrect: false, feedback: 'Not quite.' }
              ]
            }
          },
          {
            id: 'escalation', x: 60, y: 70, label: 'Escalation practice',
            fieldNotes: {
              title: 'Escalation Practice',
              content: 'Know your chain of command and how to navigate it in critical situations.'
            },
            question: {
              prompt: 'Why is it important to know the chain of command (Supervisor → Manager → Director)?',
              choices: [
                { id: 'c1', text: 'So you know who to complain to about your coworkers.', isCorrect: false, feedback: 'Not quite. The primary purpose of the clinical chain of command is patient safety.' },
                { id: 'c2', text: 'To ensure that if one person is unavailable during a critical patient need, you know exactly who to call next without delay.', isCorrect: true, feedback: 'Correct. The chain of command ensures continuous support for patient care.' },
                { id: 'c3', text: 'So you can skip the supervisor and go straight to the Director to get things done faster.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because skipping levels can lead to miscommunication and delayed local action.' }
              ]
            }
          },
          {
            id: 'survey', x: 80, y: 70, label: 'Survey readiness',
            fieldNotes: {
              title: 'Survey Readiness',
              content: 'Maintain high standards every day so we are always prepared for regulatory review.'
            },
            question: {
              prompt: 'Which of the following describes a "survey ready" clinician?',
              choices: [
                { id: 'c1', text: 'A clinician who memorizes the policy manual but cuts corners in the home to save time.', isCorrect: false, feedback: 'Not quite. Knowledge without compliant practice is not survey readiness.' },
                { id: 'c2', text: 'A clinician who consistently follows policies, maintains accurate documentation, and prioritizes patient safety every day.', isCorrect: true, feedback: 'Good choice. Survey readiness is a byproduct of consistent, quality care.' },
                { id: 'c3', text: 'A clinician who only wears their badge when the supervisor is riding along with them.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because policy compliance must be maintained at all times.' }
              ]
            }
          }
        ]}
      />
    );
  }

  const steps = [
    { id: 1, title: 'Mission & Vision', icon: <Star className="w-5 h-5" />, delay: '400ms' },
    { id: 2, title: 'The Five Core Values', icon: <ShieldCheck className="w-5 h-5" />, delay: '1000ms' },
    { id: 3, title: 'The Home Health Difference', icon: <HeartPulse className="w-5 h-5" />, delay: '1600ms' },
    { id: 4, title: 'Reporting & Escalation', icon: <ShieldAlert className="w-5 h-5" />, delay: '2200ms' },
  ];

  return (
    <div className="h-full w-full bg-[#FAFBF8] flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden animate-fade-in">

      <div className="text-center mb-10 z-10 animate-slide-in-up">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#E8F5F3] rounded-full mb-3 shadow-sm border border-[#A7F3D0]">
          <Map className="w-6 h-6 text-[#0F5B54]" />
        </div>
        <h2 className="text-3xl font-bold text-[#1E3A3A] mb-2">Orientation Complete</h2>
        <p className="text-[#524C4B] max-w-2xl mx-auto text-sm lg:text-base">
          You have successfully completed the General Agency Orientation content. Let's review your journey before the final assessment.
        </p>
      </div>

      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col z-10 relative pl-4 lg:pl-12 py-4">

        {/* Connecting Line */}
        <div
          className="absolute left-9 lg:left-17 top-8 bottom-28 w-1 bg-[#34D399] rounded-full transform origin-top animate-map-draw"
        />

        {/* Steps */}
        {steps.map((step) => (
          <div
            key={step.id}
            className="flex items-center mb-10 relative animate-slide-in-left opacity-0"
            style={{ animationDelay: step.delay }}
          >
            <div className="w-10 h-10 rounded-full bg-[#34D399] flex items-center justify-center text-white shrink-0 shadow-md border-4 border-[#FAFBF8] z-10">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="ml-6 bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-sm flex-1 flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#EEFBF6] flex items-center justify-center mr-4 shrink-0 text-[#059669]">
                {step.icon}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#9CA3AF] uppercase tracking-wider mb-0.5">Module {step.id}</h4>
                <p className="font-bold text-[#1E3A3A] text-lg">{step.title}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Final Assessment Lock/Unlock */}
        <div
          className={`flex items-center relative animate-slide-in-left opacity-0 transition-all duration-700 ${isUnlocked ? 'scale-100' : 'scale-95'}`}
          style={{ animationDelay: '2800ms' }}
        >
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 z-10 border-4 border-[#FAFBF8] transition-all duration-700
            ${isUnlocked ? 'bg-[#0F5B54] shadow-lg animate-unlock-pulse' : 'bg-[#D1D5DB] shadow-sm'}
          `}>
            {isUnlocked ? <BookOpen className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div className={`
            ml-5 p-5 rounded-2xl flex-1 flex items-center justify-between transition-all duration-700
            ${isUnlocked ? 'bg-[#0F5B54] border-[#0A3D38] shadow-xl translate-x-1' : 'bg-white border-[#E5E7EB] shadow-sm'}
          `}>
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-1 ${isUnlocked ? 'text-[#34D399]' : 'text-[#9CA3AF]'}`}>
                Final Step
              </h4>
              <p className={`font-bold text-xl ${isUnlocked ? 'text-white' : 'text-[#6B7280]'}`}>
                GAO-001 Post-Test
              </p>
            </div>

            <button
              disabled={!isUnlocked}
              onClick={() => {
                if (isUnlocked) {
                  synth.playClick();
                  onComplete?.();
                }
              }}
              className={`
                px-6 py-3 font-bold rounded-xl shadow-md transition-all uppercase tracking-wider text-sm flex items-center
                ${isUnlocked
                  ? 'bg-[#34D399] hover:bg-[#10B981] text-[#064E3B] cursor-pointer'
                  : 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed opacity-50'}
              `}
            >
              Take Test
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
