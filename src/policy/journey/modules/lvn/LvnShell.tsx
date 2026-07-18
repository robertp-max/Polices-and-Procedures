import React from 'react';
import { 
  Play, Pause, ChevronRight, ChevronLeft, 
  FileText, X
} from 'lucide-react';

// ==================== CANONICAL GLOBAL STYLES (from LVN-005) ====================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* Ambient Background Pattern */
    .bg-dots {
      background-image: radial-gradient(rgba(148, 163, 184, 0.25) 1.5px, transparent 1.5px);
      background-size: 24px 24px;
    }

    /* Flow Animations for SVG Paths */
    @keyframes flow-dash {
      to { stroke-dashoffset: -24; }
    }
    @keyframes flow-dash-reverse {
      to { stroke-dashoffset: 24; }
    }
    .animate-flow-teal {
      stroke-dasharray: 8 8;
      animation: flow-dash 1s linear infinite;
    }
    .animate-flow-orange {
      stroke-dasharray: 8 8;
      animation: flow-dash 1s linear infinite;
    }
    .animate-flow-orange-reverse {
      stroke-dasharray: 8 8;
      animation: flow-dash-reverse 1s linear infinite;
    }

    /* Node & Card Pop-in Animations */
    @keyframes pop-in {
      0% { opacity: 0; transform: scale(0.85) translateY(15px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .node-animate {
      opacity: 0;
      animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    /* Staggered Fade In for Left Panel */
    @keyframes fade-in-up {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .stagger-1 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.1s forwards; }
    .stagger-2 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.2s forwards; }
    .stagger-3 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.3s forwards; }
    .stagger-4 { opacity: 0; animation: fade-in-up 0.6s ease-out 0.4s forwards; }

    /* Button Pulses and Shines */
    @keyframes pulse-soft {
      0%, 100% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.4); }
      50% { box-shadow: 0 0 0 12px rgba(234, 88, 12, 0); }
    }
    .btn-pulse {
      animation: pulse-soft 2.5s infinite;
    }
    
    .btn-shine {
      position: relative;
      overflow: hidden;
    }
    .btn-shine::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
      transform: skewX(-25deg);
      animation: shine 4s infinite;
    }
    @keyframes shine {
      0%, 20% { left: -100%; }
      20%, 100% { left: 200%; }
    }

    /* Compass Rotation */
    @keyframes rotate-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: rotate-slow 40s linear infinite;
    }

    .scroll-hide::-webkit-scrollbar { display: none; }
    .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }

    /* Custom Scrollbar for Nav */
    .nav-scroll::-webkit-scrollbar { height: 6px; }
    .nav-scroll::-webkit-scrollbar-track { background: transparent; }
    .nav-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .nav-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `}</style>
);

// ==================== CANONICAL TOP NAV (generalized) ====================
const TopNav = ({ 
  lessons, 
  activeLesson, 
  setActiveLesson 
}: { 
  lessons: { id: number; title: string }[]; 
  activeLesson: number; 
  setActiveLesson: (id: number) => void;
}) => {
  return (
    <div className="flex items-center justify-between w-full h-[64px] bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 z-30 shrink-0 select-none">
      <div className="flex items-center space-x-1 overflow-x-auto nav-scroll w-full h-full pr-4 pb-1">
        {lessons.map((lesson) => (
          <div 
            key={lesson.id} 
            onClick={() => setActiveLesson(lesson.id)}
            className={`flex items-center space-x-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer duration-300
              ${lesson.id === activeLesson 
                ? 'bg-[#0f766e] text-white shadow-[0_4px_12px_rgba(15,118,110,0.25)]' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${lesson.id === activeLesson ? 'bg-[#f97316]' : 'bg-slate-300'}`}></div>
            <span className="tracking-wide">{lesson.title}</span>
          </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-2 pl-4 border-l border-slate-200 h-full shrink-0 cursor-pointer hover:opacity-70 transition-opacity">
        <div className="w-2 h-2 rounded-full bg-[#0f766e]"></div>
        <span className="text-[#ea580c] text-[11px] font-bold tracking-widest uppercase">Save & Exit</span>
      </div>
    </div>
  );
};

// ==================== CANONICAL BOTTOM NAV (generalized) ====================
const BottomNav = ({ 
  activeLesson, 
  setActiveLesson, 
  lessons,
  isPlaying, 
  setIsPlaying 
}: { 
  activeLesson: number; 
  setActiveLesson: (id: number) => void; 
  lessons: { id: number; title: string }[];
  isPlaying: boolean; 
  setIsPlaying: (playing: boolean) => void;
}) => {
  const total = lessons.length;

  return (
    <div className="h-[96px] w-full bg-white px-10 flex items-center justify-between border-t border-slate-200 relative z-30 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      
      <div className="w-1/4 flex items-center">
        <button 
          onClick={() => activeLesson > 1 && setActiveLesson(activeLesson - 1)} 
          className={`text-[12px] font-extrabold tracking-[0.15em] uppercase transition-colors flex items-center group ${activeLesson === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-700'}`} 
          disabled={activeLesson === 1}
        >
          <ChevronLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Previous Lesson
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center space-x-8">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 
            ${isPlaying ? 'bg-[#0f766e] text-white hover:bg-[#0d9488]' : 'bg-white text-[#0f766e] border-2 border-[#0f766e] hover:bg-teal-50'}`}
        >
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
        </button>
        
        <div className="flex flex-col space-y-2">
          {/* Visual Progress Bar */}
          <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
             <div className="absolute left-0 top-0 bottom-0 w-[58%] bg-[#0f766e] rounded-full relative overflow-hidden">
               <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full animate-[shine_2s_infinite]"></div>
             </div>
          </div>
          
          <div className="flex items-center justify-between w-full">
            <span className="text-[13px] font-bold text-slate-700 tabular-nums tracking-wide">01:10 / 02:00</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-[0.15em] font-extrabold">Lesson {activeLesson} of {total}</span>
          </div>
        </div>
      </div>

      <div className="w-1/4 flex justify-end">
        <button 
          onClick={() => activeLesson < total && setActiveLesson(activeLesson + 1)} 
          className={`px-8 py-4 rounded-full text-[14px] font-extrabold tracking-wider flex items-center space-x-2 transition-all duration-300 ${activeLesson === total ? 'bg-slate-300 text-white cursor-not-allowed shadow-none' : 'bg-[#ea580c] text-white shadow-[0_8px_20px_rgba(234,88,12,0.25)] hover:bg-[#c2410c] hover:shadow-[0_10px_25px_rgba(234,88,12,0.35)] hover:-translate-y-0.5 group'}`} 
          disabled={activeLesson === total}
        >
          <span>NEXT LESSON</span>
          <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};

// ==================== LVN SHELL COMPONENT ====================
interface LvnShellProps {
  lessons: { id: number; title: string }[];
  activeLesson: number;
  setActiveLesson: (id: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  showChallenge: boolean;
  setShowChallenge: (show: boolean) => void;
  renderLeft: (lessonId: number) => React.ReactNode;
  renderRight: (lessonId: number) => React.ReactNode;
  renderChallenge?: (lessonId: number) => React.ReactNode;
  moduleTitle?: string;
}

const LvnShell: React.FC<LvnShellProps> = ({
  lessons,
  activeLesson,
  setActiveLesson,
  isPlaying,
  setIsPlaying,
  showChallenge,
  setShowChallenge,
  renderLeft,
  renderRight,
  renderChallenge,
  moduleTitle
}) => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-white font-sans antialiased flex flex-col z-[9999]">
      <GlobalStyles />
      
      {/* Radial vignette mask for the background */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-radial from-transparent to-slate-200/50 mix-blend-multiply z-0"></div>
      
      {/* Main Window Container */}
      <div className="w-full h-full flex flex-col relative z-10">
        <TopNav lessons={lessons} activeLesson={activeLesson} setActiveLesson={setActiveLesson} />
        
        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {renderLeft(activeLesson)}
          {renderRight(activeLesson)}
          {showChallenge && renderChallenge && renderChallenge(activeLesson)}
        </div>

        <BottomNav 
          activeLesson={activeLesson} 
          setActiveLesson={setActiveLesson} 
          lessons={lessons}
          isPlaying={isPlaying} 
          setIsPlaying={setIsPlaying} 
        />
      </div>
    </div>
  );
};

export default LvnShell;
export { GlobalStyles, TopNav, BottomNav };