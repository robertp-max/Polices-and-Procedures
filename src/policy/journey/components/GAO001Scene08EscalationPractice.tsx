import { useState, useEffect } from 'react';
import { Users, AlertTriangle, ArrowRight, CheckCircle2, XCircle, PhoneCall, } from 'lucide-react';
import GAO001SharedOverlay from './GAO001SharedOverlay';
import { gao001SceneArt } from '../data/gao001SceneArt';

interface GAO001Scene08EscalationPracticeProps {
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
        hotspots={[
          {
            id: 'professionalism', x: 20, y: 50, label: 'Professionalism',
            fieldNotes: {
              title: 'Professionalism',
              content: 'Always wear your badge, maintain a professional appearance, and communicate respectfully.'
            },
            question: {
              prompt: 'Why is wearing your ID badge considered a key part of survey readiness?',
              choices: [
                { id: 'c1', text: 'It proves to surveyors that the agency enforces a dress code.', isCorrect: false, feedback: 'Not quite. While true, the primary reason is rooted in patient rights and safety.' },
                { id: 'c2', text: 'It ensures patients and families always know who is providing their care, which is a fundamental patient right.', isCorrect: true, feedback: 'Correct. Transparency and identification are critical components of patient safety.' },
                { id: 'c3', text: 'It allows the agency to track your location during the day.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because badges are for identification in the home, not GPS tracking.' }
              ]
            }
          },
          {
            id: 'documentation', x: 40, y: 50, label: 'Documentation',
            fieldNotes: {
              title: 'Documentation',
              content: 'Ensure all documentation is accurate, timely, and compliant with regulations.'
            },
            question: {
              prompt: 'What is the most critical element of accurate documentation for survey readiness?',
              choices: [
                { id: 'c1', text: 'Using the most complex medical terminology to impress surveyors.', isCorrect: false, feedback: 'Not quite. Documentation should be clear and concise for any auditor to understand.' },
                { id: 'c2', text: 'Ensuring the record accurately reflects the patient’s status and the care provided at the time of the visit.', isCorrect: true, feedback: 'Correct. Documentation is a legal record of truth; accuracy and timing are vital.' },
                { id: 'c3', text: 'Only recording positive outcomes to avoid scrutiny.', isCorrect: false, feedback: 'Incorrect. You must document the reality of the patient’s condition, even when challenges occur.' }
              ]
            }
          },
          {
            id: 'dignity', x: 60, y: 50, label: 'Patient dignity',
            fieldNotes: {
              title: 'Patient Dignity',
              content: 'Always treat patients with respect, protect their privacy, and honor their choices.'
            },
            question: {
              prompt: 'How do you protect patient privacy during a home visit with family present?',
              choices: [
                { id: 'c1', text: 'Ask the patient privately if they want their family to remain in the room during care or discussion.', isCorrect: true, feedback: 'Correct. This empowers the patient and protects their HIPAA rights.' },
                { id: 'c2', text: 'Assume family members are allowed to hear everything and discuss the care plan openly.', isCorrect: false, feedback: 'Not quite. Never assume consent to share medical information, even with family.' },
                { id: 'c3', text: 'Make all family members leave the house before providing care.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because the home is their space; you must navigate privacy respectfully without making unreasonable demands.' }
              ]
            }
          },
          {
            id: 'reporting', x: 80, y: 30, label: 'Reporting expectations',
            fieldNotes: {
              title: 'Reporting Expectations',
              content: 'Report any incidents or concerns immediately following the escalation protocol.'
            },
            question: {
              prompt: 'Why is following the formal escalation protocol important for survey readiness?',
              choices: [
                { id: 'c1', text: 'It creates a paper trail so the agency can discipline staff quickly.', isCorrect: false, feedback: 'Not quite. The purpose is safety and resolution, not punishment.' },
                { id: 'c2', text: 'It ensures that critical concerns are handled consistently, documented appropriately, and resolved safely for the patient.', isCorrect: true, feedback: 'Correct. Standardized processes minimize risk and ensure regulatory compliance.' },
                { id: 'c3', text: 'It allows you to avoid responsibility by offloading the problem to your manager.', isCorrect: false, feedback: 'Incorrect. Escalation is about team support and expertise, not avoiding personal accountability.' }
              ]
            }
          },
          {
            id: 'checklist', x: 80, y: 70, label: 'Readiness checklist',
            fieldNotes: {
              title: 'Readiness Checklist',
              content: 'Familiarize yourself with the agency\'s survey readiness checklist and your role in it.'
            },
            question: {
              prompt: 'What is the most important concept behind "survey readiness"?',
              choices: [
                { id: 'c1', text: 'Cramming policy knowledge the week before a surveyor arrives.', isCorrect: false, feedback: 'Not quite. True readiness cannot be achieved at the last minute.' },
                { id: 'c2', text: 'Hiding difficult patients from the surveyor\'s schedule.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk and is a serious compliance violation.' },
                { id: 'c3', text: 'Providing high-quality, compliant care every single day as your standard practice.', isCorrect: true, feedback: 'Correct. When everyday practice is compliant, you are always survey-ready.' }
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
