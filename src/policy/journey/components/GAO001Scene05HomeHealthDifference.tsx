import { useState, useEffect, useRef } from 'react';
import { Home, Building2, CheckCircle2, ArrowRight, X } from 'lucide-react';
import GAO001SharedOverlay from './GAO001SharedOverlay';
import { defineGao001Hotspots } from '../data/gaoNodes/gao001HotspotContract';
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

const HOME_HEALTH_ITEMS: Item[] = [
  { id: '1', text: 'Highly controlled, sterile environment', correctCategory: 'facility' },
  { id: '2', text: 'Unpredictable, personalized environment', correctCategory: 'home' },
  { id: '3', text: 'Constant peer support & backup nearby', correctCategory: 'facility' },
  { id: '4', text: 'Independent, autonomous clinical judgment', correctCategory: 'home' },
  { id: '5', text: 'Standardized equipment and layouts', correctCategory: 'facility' },
  { id: '6', text: 'Adapting to the patient\'s unique living situation', correctCategory: 'home' },
];

function HomeHealthDifferenceActivity({
  close,
  complete,
  activeLabel,
}: {
  close: () => void;
  complete: () => void;
  activeLabel: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [placedItems, setPlacedItems] = useState<Record<string, Category>>({});
  const [errorCategory, setErrorCategory] = useState<Category | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingStyle = document.getElementById('gao001-scene05-custom-styles');
    if (existingStyle) return;
    const styleSheet = document.createElement("style");
    styleSheet.id = 'gao001-scene05-custom-styles';
    styleSheet.type = "text/css";
    styleSheet.innerText = `${brandStyles}
      @media (prefers-reduced-motion: reduce) {
        .animate-slide-in-up,
        .animate-shake-error {
          animation: none !important;
          transition: none !important;
        }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

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
    (focusables()[0] ?? dialog)?.focus();

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

  const handlePlace = (category: Category) => {
    if (currentIndex >= HOME_HEALTH_ITEMS.length) return;

    const currentItem = HOME_HEALTH_ITEMS[currentIndex];

    if (currentItem.correctCategory === category) {
      synth.playClick();
      setPlacedItems(prev => ({ ...prev, [currentItem.id]: category }));
      setErrorCategory(null);

      if (currentIndex + 1 === HOME_HEALTH_ITEMS.length) {
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

  const facilityItems = HOME_HEALTH_ITEMS.filter(i => placedItems[i.id] === 'facility');
  const homeItems = HOME_HEALTH_ITEMS.filter(i => placedItems[i.id] === 'home');
  const activeItem = HOME_HEALTH_ITEMS[currentIndex];

  return (
    <div className="absolute inset-0 z-50 overflow-hidden bg-[#FAFBF8]">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gao001-home-health-difference-title"
        aria-describedby="gao001-home-health-difference-description"
        tabIndex={-1}
        className="relative flex h-full w-full flex-col overflow-hidden p-4 outline-none lg:p-8"
      >
      <button
        type="button"
        onClick={close}
        aria-label="Close home health difference activity"
        className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#1E3A3A] shadow-md transition hover:bg-[#EEFBF6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54]"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="text-center mb-6 z-10">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#C2410C]">
          {activeLabel}
        </p>
        <h2 id="gao001-home-health-difference-title" className="text-2xl font-bold text-[#1E3A3A] mb-2">The Home Health Difference</h2>
        <p id="gao001-home-health-difference-description" className="text-[#524C4B] max-w-2xl mx-auto text-sm lg:text-base">
          Working in home health requires a different mindset than working in a facility.
          Sort the following characteristics into their correct setting.
        </p>
      </div>

      <div className="flex-1 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 z-10">

        {/* Left Column: Facility */}
        <button
          type="button"
          onClick={() => handlePlace('facility')}
          disabled={showCompletion}
          className={`
            relative flex flex-col rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden text-left
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54]
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
        </button>

        {/* Right Column: Home Health */}
        <button
          type="button"
          onClick={() => handlePlace('home')}
          disabled={showCompletion}
          className={`
            relative flex flex-col rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden text-left
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F5B54]
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
        </button>
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
                complete();
              }}
              className="w-full py-3 bg-[#0F5B54] hover:bg-[#0A3D38] text-white font-bold rounded-xl shadow-md transition-colors uppercase tracking-wider text-sm"
            >
              Continue
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default function GAO001Scene05HomeHealthDifference({ onComplete }: GAO001Scene05HomeHealthDifferenceProps) {
  return (
    <GAO001SharedOverlay
      imageSrc={gao001SceneArt['scene-05'].src}
      altText={gao001SceneArt['scene-05'].alt}
      objective="Sort the characteristics of care."
      onComplete={onComplete}
      linear
      renderCustomModal={({ hotspot, close, complete }) => (
        <HomeHealthDifferenceActivity
          close={close}
          complete={complete}
          activeLabel={hotspot.label}
        />
      )}
      hotspots={defineGao001Hotspots("GAO-001.lesson.l5.delivery", [
        {
          id: 'observe', x: 20, y: 50, label: 'Observe',
          fieldNotes: {
            title: 'Observe',
            content: 'Notice the environment and the patient\'s condition without bias.'
          },
        },
        {
          id: 'document', x: 40, y: 50, label: 'Document',
          fieldNotes: {
            title: 'Document',
            content: 'Write down exactly what you see and hear. Keep it factual and objective.'
          },
        },
        {
          id: 'report', x: 60, y: 50, label: 'Report',
          fieldNotes: {
            title: 'Report',
            content: 'Communicate your findings clearly to the appropriate team member.'
          },
        },
        {
          id: 'escalate', x: 80, y: 50, label: 'Escalate',
          fieldNotes: {
            title: 'Escalate',
            content: 'If the situation requires immediate attention or is unsafe, escalate to your supervisor.'
          },
        },
        {
          id: 'facts', x: 50, y: 70, label: 'Facts not interpretation',
          fieldNotes: {
            title: 'Facts not Interpretation',
            content: 'Never assume. "Patient has a 2-inch bruise on left arm" is a fact. "Patient fell" is an assumption if you didn\'t see it.'
          },
        }
      ])}
    />
  );
}
