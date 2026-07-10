import { useState, useEffect } from 'react';
import { UserX, CheckCircle2, ArrowRight, MessageSquareWarning, XCircle, FileWarning } from 'lucide-react';
import GAO001SharedOverlay from './GAO001SharedOverlay';
import { gao001SceneArt } from '../data/gao001SceneArt';

interface GAO001Scene07PatientRefusalProps {
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
        hotspots={[
          {
            id: 'assess', x: 20, y: 50, label: 'Assess the situation',
            fieldNotes: {
              title: 'Assess the Situation',
              content: 'Determine the severity and urgency of the issue before escalating.'
            },
            question: {
              prompt: 'Before calling your supervisor about a clinical issue, what should you do first?',
              choices: [
                { id: 'c1', text: 'Tell the patient you are leaving to get help.', isCorrect: false, feedback: 'Not quite. Leaving the patient can create a severe safety risk.' },
                { id: 'c2', text: 'Gather all relevant vital signs, patient complaints, and immediate observations.', isCorrect: true, feedback: 'Correct. A clear assessment allows your supervisor to give you the best guidance.' },
                { id: 'c3', text: 'Wait an hour to see if the problem resolves itself.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because waiting could allow a critical situation to worsen.' }
              ]
            }
          },
          {
            id: 'supervisor', x: 40, y: 50, label: 'Immediate supervisor',
            fieldNotes: {
              title: 'Immediate Supervisor',
              content: 'Your first point of contact for clinical or scheduling issues.'
            },
            question: {
              prompt: 'Who is your primary point of contact for clinical or scheduling issues?',
              choices: [
                { id: 'c1', text: 'The Human Resources department.', isCorrect: false, feedback: 'HR handles employment matters, not daily clinical/scheduling escalations.' },
                { id: 'c2', text: 'My immediate supervisor.', isCorrect: true, feedback: 'Correct. Your immediate supervisor is your primary contact for these issues.' },
                { id: 'c3', text: 'The CEO of the agency.', isCorrect: false, feedback: 'This would not be appropriate for routine clinical or scheduling concerns.' }
              ]
            }
          },
          {
            id: 'manager', x: 60, y: 50, label: 'Clinical manager',
            fieldNotes: {
              title: 'Clinical Manager',
              content: 'Escalate to the clinical manager if the supervisor is unavailable or the issue is severe.'
            },
            question: {
              prompt: 'If you cannot reach your immediate supervisor regarding an urgent patient need, what is your next step?',
              choices: [
                { id: 'c1', text: 'Leave a voicemail and wait for them to call back.', isCorrect: false, feedback: 'Not quite. Urgent needs require immediate contact with someone in the chain of command.' },
                { id: 'c2', text: 'Escalate the issue to the Clinical Manager or the next designated person on the call tree.', isCorrect: true, feedback: 'Correct. Knowing the chain of command ensures patient care is never delayed.' },
                { id: 'c3', text: 'Call 911 immediately, even if it\'s not a life-threatening emergency.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because 911 should only be used for true medical emergencies, not routine escalations.' }
              ]
            }
          },
          {
            id: 'after-hours', x: 80, y: 50, label: 'After hours protocol',
            fieldNotes: {
              title: 'After Hours Protocol',
              content: 'Know who is on call and how to reach them outside of regular business hours.'
            },
            question: {
              prompt: 'How does the escalation path change during a weekend or after hours?',
              choices: [
                { id: 'c1', text: 'It doesn\'t; you should still call your regular supervisor\'s desk phone.', isCorrect: false, feedback: 'Not quite. They may not be working, which would delay necessary care.' },
                { id: 'c2', text: 'You must use the designated on-call roster and protocol to reach the clinician or supervisor covering that shift.', isCorrect: true, feedback: 'Good choice. Our agency provides 24/7 support through the on-call system.' },
                { id: 'c3', text: 'There is no escalation path after hours unless it is a 911 emergency.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because we are required to provide continuous care and support.' }
              ]
            }
          }
        ]}
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
