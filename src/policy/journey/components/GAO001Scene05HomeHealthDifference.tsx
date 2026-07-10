import { useState, useEffect } from 'react';
import { Home, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import GAO001SharedOverlay from './GAO001SharedOverlay';
import { gao001SceneArt } from '../data/gao001SceneArt';

interface GAO001Scene05HomeHealthDifferenceProps {
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
`;

type Category = 'facility' | 'home';

interface Item {
  id: string;
  text: string;
  correctCategory: Category;
}

export default function GAO001Scene05HomeHealthDifference({ onComplete }: GAO001Scene05HomeHealthDifferenceProps) {
  const [items] = useState<Item[]>([
    { id: '1', text: 'Highly controlled, sterile environment', correctCategory: 'facility' },
    { id: '2', text: 'Unpredictable, personalized environment', correctCategory: 'home' },
    { id: '3', text: 'Constant peer support & backup nearby', correctCategory: 'facility' },
    { id: '4', text: 'Independent, autonomous clinical judgment', correctCategory: 'home' },
    { id: '5', text: 'Standardized equipment and layouts', correctCategory: 'facility' },
    { id: '6', text: 'Adapting to the patient\'s unique living situation', correctCategory: 'home' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedItems, setPlacedItems] = useState<Record<string, Category>>({});
  const [errorCategory, setErrorCategory] = useState<Category | null>(null);

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
        imageSrc={gao001SceneArt['scene-05'].src}
        altText={gao001SceneArt['scene-05'].alt}
        objective="Sort the characteristics of care."
        onComplete={onComplete}
        linear={true}
        hotspots={[
          {
            id: 'observe', x: 20, y: 50, label: 'Observe',
            fieldNotes: {
              title: 'Observe',
              content: 'Notice the environment and the patient\'s condition without bias.'
            },
            question: {
              prompt: 'When entering a patient\'s home, what should you observe first?',
              choices: [
                { id: 'c1', text: 'The patient\'s overall safety and any immediate environmental hazards.', isCorrect: true, feedback: 'Correct. Safety is always the first priority upon entry.' },
                { id: 'c2', text: 'Whether the home is messy so you can report it to social services.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because a messy home isn\'t necessarily a safety hazard unless it impacts care or poses a risk to the patient.' },
                { id: 'c3', text: 'Where you can sit comfortably.', isCorrect: false, feedback: 'Not quite. The safer answer is to scan for patient and clinician safety before settling in.' }
              ]
            }
          },
          {
            id: 'document', x: 40, y: 50, label: 'Document',
            fieldNotes: {
              title: 'Document',
              content: 'Write down exactly what you see and hear. Keep it factual and objective.'
            },
            question: {
              prompt: 'Which documentation is the most objective?',
              choices: [
                { id: 'c1', text: '"Patient is non-compliant with their medication regimen again."', isCorrect: false, feedback: 'Not quite. "Non-compliant" is an assumption. Document what you actually observed.' },
                { id: 'c2', text: '"Found 4 missed doses of Lisinopril in the pill box for Monday through Thursday."', isCorrect: true, feedback: 'Good choice. This is a clear, factual observation without judgment.' },
                { id: 'c3', text: '"Patient is confusing their medications because they are getting older."', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because it makes an unsupported medical diagnosis regarding their cognitive state.' }
              ]
            }
          },
          {
            id: 'report', x: 60, y: 50, label: 'Report',
            fieldNotes: {
              title: 'Report',
              content: 'Communicate your findings clearly to the appropriate team member.'
            },
            question: {
              prompt: 'If you notice a new, non-emergency symptom, when should you report it?',
              choices: [
                { id: 'c1', text: 'Wait until the next scheduled visit to see if it resolves.', isCorrect: false, feedback: 'Not quite. Delayed reporting can lead to a worsening condition.' },
                { id: 'c2', text: 'Document it in the EHR and inform the clinical supervisor or physician according to protocol.', isCorrect: true, feedback: 'Correct. Timely communication ensures the care team can adjust the plan of care.' },
                { id: 'c3', text: 'Tell the patient to call their doctor if it gets worse.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because you are responsible for reporting clinical findings while you are there.' }
              ]
            }
          },
          {
            id: 'escalate', x: 80, y: 50, label: 'Escalate',
            fieldNotes: {
              title: 'Escalate',
              content: 'If the situation requires immediate attention or is unsafe, escalate to your supervisor.'
            },
            question: {
              prompt: 'You arrive at a home and find the patient unresponsive. What is the escalation path?',
              choices: [
                { id: 'c1', text: 'Call the agency supervisor first for permission to act.', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because emergency medical care takes precedence.' },
                { id: 'c2', text: 'Call 911 immediately, begin emergency procedures if qualified, and notify the agency as soon as it is safe.', isCorrect: true, feedback: 'Good choice. In an emergency, life-saving measures and 911 are the immediate priority.' },
                { id: 'c3', text: 'Call the patient\'s emergency contact to ask what they want you to do.', isCorrect: false, feedback: 'Not quite. The safer answer is to call 911 first for an unresponsive patient.' }
              ]
            }
          },
          {
            id: 'facts', x: 50, y: 70, label: 'Facts not interpretation',
            fieldNotes: {
              title: 'Facts not Interpretation',
              content: 'Never assume. "Patient has a 2-inch bruise on left arm" is a fact. "Patient fell" is an assumption if you didn\'t see it.'
            },
            question: {
              prompt: 'A patient complains of a headache and you notice they are slurring their words. How do you document this?',
              choices: [
                { id: 'c1', text: '"Patient is having a stroke; reported headache and slurred speech."', isCorrect: false, feedback: 'Not quite. Diagnosing a stroke is outside the scope of home health observation; stick to the symptoms.' },
                { id: 'c2', text: '"Patient stated \'I have a headache\' and exhibited slurred speech during the visit."', isCorrect: true, feedback: 'Correct. This documents exactly what you heard and observed without making a medical diagnosis.' },
                { id: 'c3', text: '"Patient seems intoxicated because their speech is slurred."', isCorrect: false, feedback: 'That answer sounds helpful, but it creates risk because it makes a dangerous assumption about the cause of the slurred speech.' }
              ]
            }
          }
        ]}
      />
    );
  }
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = brandStyles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  const handlePlace = (category: Category) => {
    if (currentIndex >= items.length) return;

    const currentItem = items[currentIndex];

    if (currentItem.correctCategory === category) {
      synth.playClick();
      setPlacedItems(prev => ({ ...prev, [currentItem.id]: category }));
      setErrorCategory(null);

      if (currentIndex + 1 === items.length) {
        setTimeout(() => {
          synth.playSuccess();
          setShowCompletion(true);
        }, 300);
      }
      setCurrentIndex(prev => prev + 1);
    } else {
      synth.playError();
      setErrorCategory(category);
      setTimeout(() => setErrorCategory(null), 500);
    }
  };

  const facilityItems = items.filter(i => placedItems[i.id] === 'facility');
  const homeItems = items.filter(i => placedItems[i.id] === 'home');
  const activeItem = items[currentIndex];

  return (
    <div className="h-full w-full bg-[#FAFBF8] flex flex-col p-4 lg:p-8 relative overflow-hidden animate-fade-in">

      <div className="text-center mb-6 z-10">
        <h2 className="text-2xl font-bold text-[#1E3A3A] mb-2">The Home Health Difference</h2>
        <p className="text-[#524C4B] max-w-2xl mx-auto text-sm lg:text-base">
          Working in home health requires a different mindset than working in a facility.
          Sort the following characteristics into their correct setting.
        </p>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 z-10">

        {/* Left Column: Facility */}
        <div
          onClick={() => handlePlace('facility')}
          className={`
            relative flex flex-col rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
            ${errorCategory === 'facility' ? 'bg-[#FEF2F2] border-[#F87171] animate-shake-error' : 'bg-white border-[#E5E7EB] hover:border-[#0F5B54] hover:shadow-md'}
          `}
        >
          <div className="bg-[#E5E7EB] p-4 flex items-center justify-center border-b border-[#D1D5DB]">
            <Building2 className="w-6 h-6 text-[#4B5563] mr-3" />
            <h3 className="text-lg font-bold text-[#374151]">Facility Setting</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col space-y-3 bg-[#F9FAFB]">
            {facilityItems.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-lg border border-[#E5E7EB] shadow-sm animate-slide-in-up flex items-center text-sm text-[#4B5563]">
                <CheckCircle2 className="w-4 h-4 text-[#9CA3AF] mr-2 shrink-0" />
                {item.text}
              </div>
            ))}
            {facilityItems.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-[#9CA3AF] text-sm italic">
                Tap here to assign characteristics
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Home Health */}
        <div
          onClick={() => handlePlace('home')}
          className={`
            relative flex flex-col rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
            ${errorCategory === 'home' ? 'bg-[#FEF2F2] border-[#F87171] animate-shake-error' : 'bg-white border-[#E5E7EB] hover:border-[#0F5B54] hover:shadow-md'}
          `}
        >
          <div className="bg-[#0F5B54] p-4 flex items-center justify-center border-b border-[#0A3D38]">
            <Home className="w-6 h-6 text-white mr-3" />
            <h3 className="text-lg font-bold text-white">Home Health Setting</h3>
          </div>
          <div className="p-4 flex-1 flex flex-col space-y-3 bg-[#EEFBF6]">
            {homeItems.map(item => (
              <div key={item.id} className="bg-white p-3 rounded-lg border border-[#34D399] shadow-sm animate-slide-in-up flex items-center text-sm text-[#065F46] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#059669] mr-2 shrink-0" />
                {item.text}
              </div>
            ))}
            {homeItems.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-[#9CA3AF] text-sm italic">
                Tap here to assign characteristics
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Active Item */}
      {!showCompletion && activeItem && (
        <div className="fixed lg:absolute bottom-6 left-0 right-0 z-20 flex justify-center px-4 animate-slide-in-up">
          <div className="bg-[#1E3A3A] text-white p-4 lg:p-6 rounded-2xl shadow-2xl max-w-md w-full flex items-center justify-between border border-[#0A3D38]">
            <div className="flex-1">
              <span className="text-[#34D399] text-xs font-bold uppercase tracking-wider mb-1 block">Current Characteristic</span>
              <p className="text-base lg:text-lg font-medium leading-snug">{activeItem.text}</p>
            </div>
            <ArrowRight className="w-6 h-6 text-[#9CA3AF] ml-4 animate-pulse" />
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletion && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-[#E5E4E3] max-w-md text-center transform animate-pop-in">
            <div className="w-16 h-16 bg-[#EEFBF6] rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-[#059669]" />
            </div>
            <h3 className="text-2xl font-bold text-[#1E3A3A] mb-2">You Know the Difference</h3>
            <p className="text-[#524C4B] mb-6">
              Home health requires clinical autonomy and deep respect for the patient's personal environment. That is why our core values are so vital in the field.
            </p>
            <button
              onClick={() => {
                synth.playClick();
                onComplete?.();
              }}
              className="w-full py-3 bg-[#0F5B54] hover:bg-[#0A3D38] text-white font-bold rounded-xl shadow-md transition-colors uppercase tracking-wider text-sm"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
