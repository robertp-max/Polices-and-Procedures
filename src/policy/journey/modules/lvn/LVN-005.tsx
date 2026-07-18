import { useState } from 'react';
import { 
  Play, Pause, ChevronRight, ChevronLeft, 
  FileText, CheckCircle2, X, AlertCircle, Volume2, ShieldCheck,
  MessageSquare, ClipboardEdit, Compass
, Calendar, Users } from 'lucide-react';

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

const TopNav = ({ activeLesson, setActiveLesson }: { activeLesson: number; setActiveLesson: (id: number) => void }) => {
  const lessons = [
    { id: 1, title: "1. The Plan of Care" },
    { id: 2, title: "2. The CMS-485: Home Health M..." },
    { id: 3, title: "3. Visit Frequency & Scheduling" },
    { id: 4, title: "4. Delegation Chain & LVN" },
    { id: 5, title: "5. Responding to Patient Changes" },
  ].map(l => ({ ...l, active: l.id === activeLesson }));

  return (
    <div className="flex items-center justify-between w-full h-[64px] bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 z-30 shrink-0 select-none">
      <div className="flex items-center space-x-1 overflow-x-auto nav-scroll w-full h-full pr-4 pb-1">
        {lessons.map((lesson) => (
          <div 
            key={lesson.id} 
            onClick={() => setActiveLesson(lesson.id)}
            className={`flex items-center space-x-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer duration-300
              ${lesson.active 
                ? 'bg-[#0f766e] text-white shadow-[0_4px_12px_rgba(15,118,110,0.25)]' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${lesson.active ? 'bg-[#f97316]' : 'bg-slate-300'}`}></div>
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

const LeftContentLesson1 = () => {
  return (
    <div className="w-1/2 flex flex-col h-full overflow-y-auto bg-gradient-to-b from-white to-slate-50 scroll-hide relative z-10 px-8 py-8">
      <div className="max-w-[95%]">
        
        <div className="stagger-1">
          <h3 className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.2em] uppercase mb-4 opacity-80 flex items-center">
            <span className="w-6 h-[2px] bg-[#0f766e] mr-3 rounded-full"></span>
            Module Content
          </h3>
          
          <h1 className="text-[40px] font-extrabold text-[#064e3b] mb-4 tracking-tight leading-[1.1]">
            The Plan of Care —<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f766e] to-[#047857]">Your Clinical Compass</span>
          </h1>
          
          <p className="text-[#ea580c] font-bold text-[17px] mb-8 tracking-wide flex items-center">
            <Compass size={20} className="mr-2 opacity-80" />
            Why the POC governs every LVN action in the home
          </p>
        </div>

        <div className="space-y-6 text-slate-600 text-[16px] leading-[1.8] mb-10 pr-4 stagger-2 font-medium">
          <p>
            As a Licensed Vocational Nurse (LVN), the individual Plan of Care (POC) is the physician-authorized directive specifying every service, visit, and clinical intervention in the patient's home. 
          </p>
          <p className="p-5 bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl text-slate-700">
            Critical Scope of Practice rules mandate that, under RN direction, the LVN must <span className="font-bold text-[#0f766e] bg-teal-50 px-1.5 py-0.5 rounded">only</span> implement authorized directives. The LVN does not create, modify, or independently rewrite the Plan of Care.
          </p>
          <p>
            Every task during a home visit must trace directly back to a specific POC directive. If it is not in the plan (or a valid order updating it), it is not authorized.
          </p>
        </div>

        {/* Info Blocks - Staggered */}
        <div className="space-y-5 mb-8">
          <div className="stagger-3 group">
            <div className="bg-gradient-to-br from-[#f0fdf4] to-white border border-[#bbf7d0] rounded-[1.25rem] p-5 flex items-start space-x-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="bg-white p-2.5 rounded-2xl text-[#16a34a] shadow-[0_4px_10px_rgba(22,163,74,0.15)] shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[#166534] text-[13px] tracking-wider mb-1.5 uppercase">Federal Requirement</h4>
                <p className="text-[14.5px] text-[#15803d] leading-relaxed font-medium">
                  42 CFR § 484.60: Home health services must be furnished in accordance with an individualized plan of care.
                </p>
              </div>
            </div>
          </div>

          <div className="stagger-4 group">
            <div className="bg-gradient-to-br from-[#fff7ed] to-white border border-[#fed7aa] rounded-[1.25rem] p-5 flex items-start space-x-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="bg-white p-2.5 rounded-2xl text-[#ea580c] shadow-[0_4px_10px_rgba(234,88,12,0.15)] shrink-0 group-hover:scale-110 transition-transform duration-300">
                <AlertCircle size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[#9a3412] text-[13px] tracking-wider mb-1.5 uppercase">Key Clinical Rule</h4>
                <p className="text-[14.5px] text-[#c2410c] leading-relaxed font-medium">
                  The LVN works UNDER an existing RN/physician POC. Developing or independently modifying the POC is outside LVN role and is a compliance violation.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const DiagramNode = ({ label, subLabel, icon, gradientClass, size = 'large' }: { label: any; subLabel?: any; icon?: any; gradientClass?: any; size?: string }) => {
  const isLarge = size === 'large';
  const sizeClassOuter = isLarge ? 'w-[124px] h-[124px]' : 'w-[56px] h-[56px]';
  const sizeClassInner = isLarge ? 'w-[96px] h-[96px]' : 'w-[42px] h-[42px]';
  const textClass = isLarge ? 'text-[17px]' : 'text-[20px]';
  
  return (
    <div className={`relative flex items-center justify-center rounded-full bg-white/40 backdrop-blur-sm shadow-[0_15px_35px_rgba(0,0,0,0.08),0_5px_15px_rgba(0,0,0,0.04)] z-10 border border-white/60 p-2 ${sizeClassOuter}`}>
      <div className={`rounded-full flex flex-col items-center justify-center text-white font-bold tracking-wide shadow-[inset_0_-4px_12px_rgba(0,0,0,0.2),inset_0_2px_6px_rgba(255,255,255,0.5)] ${gradientClass} ${sizeClassInner}`}>
        {icon && <div className="mb-1 opacity-95">{icon}</div>}
        <span className={`${textClass} leading-tight drop-shadow-md`}>{label}</span>
        {subLabel && <span className="text-[10px] font-semibold opacity-90 -mt-0.5 mt-1 tracking-wide">{subLabel}</span>}
      </div>
    </div>
  );
};

const RightPanelLesson1 = ({ isPlaying, setShowChallenge }: { isPlaying: boolean; setShowChallenge: any }) => {
  const playState = isPlaying ? 'running' : 'paused';

  return (
    <div className="w-1/2 bg-[#f8fafc] relative overflow-hidden flex flex-col border-l border-slate-200 shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)] group">
      
      {/* Decorative Background Motif - The Clinical Compass */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="relative w-[600px] h-[600px] animate-spin-slow">
          <div className="absolute inset-0 border-[2px] border-dashed border-slate-300 rounded-full"></div>
          <div className="absolute inset-8 border-[1px] border-slate-200 rounded-full"></div>
          <div className="absolute inset-16 border-[4px] border-slate-100 rounded-full"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent"></div>
          <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
        </div>
      </div>
      
      {/* Header Area */}
      <div className="absolute top-6 left-8 z-20">
        <div className="text-[11px] font-extrabold tracking-widest text-[#0f766e] uppercase bg-white/80 backdrop-blur-md px-4 py-2 rounded-full inline-block shadow-sm border border-teal-100">
          Interactive Diagram
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="flex-1 relative flex items-center justify-center z-10 w-full h-full">
        <div className="relative w-[500px] h-[500px] scale-[0.98] origin-center">
          
          {/* Animated SVG Connections */}
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 500 500" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.08))'}}>
            <defs>
              <marker id="arrow-teal" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#0d9488" />
              </marker>
              <marker id="arrow-orange" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#ea580c" />
              </marker>
              
              <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Downward Flow - Authorization */}
            <line x1="250" y1="120" x2="250" y2="190" stroke="#0d9488" strokeWidth="5" className="animate-flow-teal" style={{ animationPlayState: playState }} markerEnd="url(#arrow-teal)" filter={isPlaying ? "url(#glow-teal)" : ""} />
            <line x1="250" y1="290" x2="250" y2="360" stroke="#0d9488" strokeWidth="5" className="animate-flow-teal" style={{ animationPlayState: playState }} markerEnd="url(#arrow-teal)" filter={isPlaying ? "url(#glow-teal)" : ""} />

            
            {/* Feedback / Reporting Loops */}
            <path d="M 290 250 L 380 250" fill="none" stroke="#ea580c" strokeWidth="3" className="animate-flow-orange" style={{ animationPlayState: playState }} markerEnd="url(#arrow-orange)" />
            <line x1="410" y1="276" x2="410" y2="384" stroke="#ea580c" strokeWidth="3" className="animate-flow-orange" style={{ animationPlayState: playState }} markerEnd="url(#arrow-orange)" />
            <line x1="384" y1="410" x2="300" y2="410" stroke="#ea580c" strokeWidth="3" className="animate-flow-orange-reverse" style={{ animationPlayState: playState }} markerEnd="url(#arrow-orange)" />
            
            {/* Reverse loop indication */}
            <path d="M 300 90 C 410 90, 410 160, 410 224" fill="none" stroke="#ea580c" strokeWidth="3" className="animate-flow-orange" style={{ animationPlayState: playState }} markerEnd="url(#arrow-orange)" />
          </svg>

          {/* Nodes */}
          <div className="absolute inset-0 z-10">
            {/* Physician Node */}
            <div className="absolute top-[70px] left-[250px] -translate-x-1/2 -translate-y-1/2 group">
              <div className="node-animate" style={{ animationDelay: '0.1s' }}>
                <DiagramNode label="Physician" subLabel="Orders / Certifies" gradientClass="bg-gradient-to-br from-[#3b82f6] to-[#1e3a8a]" />
              </div>
            </div>
            
            {/* RN Node */}
            <div className="absolute top-[250px] left-[250px] -translate-x-1/2 -translate-y-1/2 group">
               <div className="node-animate" style={{ animationDelay: '0.3s' }}>
                <DiagramNode label="RN" subLabel="Interprets / Directs" gradientClass="bg-gradient-to-br from-[#14b8a6] to-[#0f766e]" />
              </div>
            </div>
            
            {/* LVN Node */}
            <div className="absolute top-[410px] left-[250px] -translate-x-1/2 -translate-y-1/2 group">
               <div className="node-animate" style={{ animationDelay: '0.5s' }}>
                <DiagramNode label="LVN" subLabel="Implements Only" gradientClass="bg-gradient-to-br from-[#f97316] to-[#c2410c]" />
              </div>
            </div>

            {/* Loop Indicators with descriptive icons instead of numbers */}
            <div className="absolute top-[250px] left-[410px] -translate-x-1/2 -translate-y-1/2 group cursor-help z-20">
               <div className="node-animate" style={{ animationDelay: '0.7s' }}>
                <DiagramNode label={<ClipboardEdit size={22} />} size="small" gradientClass="bg-gradient-to-br from-[#fb923c] to-[#ea580c]" />
                
                {/* Tooltip */}
                <div className="absolute left-[50px] top-1/2 -translate-y-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl transform translate-x-2 group-hover:translate-x-0">
                  <div className="font-bold text-[#fdba74] mb-0.5">Step 2: Update</div>
                  RN/Physician update official orders based on reports.
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
            </div>

            <div className="absolute top-[410px] left-[410px] -translate-x-1/2 -translate-y-1/2 group cursor-help z-20">
               <div className="node-animate" style={{ animationDelay: '0.9s' }}>
                <DiagramNode label={<MessageSquare size={22} />} size="small" gradientClass="bg-gradient-to-br from-[#fb923c] to-[#ea580c]" />
                
                {/* Tooltip */}
                <div className="absolute left-[50px] top-1/2 -translate-y-1/2 bg-slate-800 text-white px-3 py-2 rounded-lg text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl transform translate-x-2 group-hover:translate-x-0">
                  <div className="font-bold text-[#fdba74] mb-0.5">Step 1: Report</div>
                  LVN identifies changes and reports to RN immediately.
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Interactive Trigger Area */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center justify-end bg-gradient-to-t from-slate-100 via-slate-50/90 to-transparent pt-24 z-20 pointer-events-none">
        
        <div className="node-animate pointer-events-auto flex flex-col items-center" style={{ animationDelay: '1.2s' }}>
          <p className="text-[#0f766e] font-bold text-[15px] mb-5 bg-white/90 px-6 py-2.5 rounded-full shadow-[0_8px_20px_rgba(15,118,110,0.1)] backdrop-blur-md border border-teal-100/50 flex items-center">
            Physician <ChevronRight size={16} className="mx-1" /> RN <ChevronRight size={16} className="mx-1" /> LVN 
            <span className="text-slate-400 font-semibold ml-2 italic text-[13px]">(No reverse plan writing)</span>
          </p>
          
          <button 
            onClick={() => setShowChallenge(true)}
            className="btn-pulse btn-shine bg-[#ea580c] text-white px-10 py-3.5 rounded-full font-extrabold text-[15px] tracking-wider shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:bg-[#c2410c] hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2.5"
          >
            <FileText size={18} strokeWidth={2.5} />
            <span>CHALLENGE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ChallengeModalLesson1 = ({ onClose }: { onClose: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const answers = [
    { id: 'a', text: 'Independently modify the Plan of Care if you notice a severe change in the patient\'s condition.', correct: false },
    { id: 'b', text: 'Implement authorized directives exactly as written and immediately report condition changes to the supervising RN.', correct: true },
    { id: 'c', text: 'Create a temporary, undocumented care plan to address new symptoms until the physician can be reached.', correct: false },
  ];

  const handleSelect = (id: string) => {
    if (!isSubmitted) setSelectedAnswer(id);
  };

  const handleSubmit = () => {
    if (selectedAnswer) setIsSubmitted(true);
  };

  const isCorrect = selectedAnswer === 'b';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-lg transition-all duration-500 opacity-100">
      
      <div className="w-full max-w-[1050px] flex space-x-6 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-14 right-0 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:rotate-90 border border-white/20"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        {/* Left Card: Context */}
        <div className="flex-1 bg-white rounded-[2rem] p-10 shadow-2xl transform translate-y-2 node-animate border border-slate-100" style={{animationDelay: '0s'}}>
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-teal-50 text-[#0f766e] rounded-2xl flex items-center justify-center shadow-inner">
              <FileText size={24} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-[#ea580c] tracking-[0.15em] uppercase mb-0.5">Clinical Context</div>
              <h2 className="text-[#064e3b] text-[24px] font-bold">Field Application</h2>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 p-8 rounded-[1.5rem] mb-8 relative shadow-sm">
            <div className="absolute -left-3 top-10 w-6 h-6 bg-white border-[3px] border-[#0f766e] rounded-full shadow-md"></div>
            <p className="text-slate-700 text-[17px] leading-relaxed italic font-medium">
              "You arrive at Mr. Smith's home for a routine wound care visit. While there, you notice his blood pressure is significantly elevated and he complains of a new, severe headache. The current Plan of Care only authorizes wound care and standard vitals checking."
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-[#f8fafc] p-4 rounded-2xl border border-slate-200">
             <button className="bg-[#0f766e] text-white px-5 py-2.5 rounded-full text-[14px] font-bold flex items-center shadow-md hover:bg-[#0d9488] transition-colors">
               <Volume2 size={18} className="mr-2.5" />
               Listen to Scenario
             </button>
             <span className="text-slate-500 text-[14px] font-semibold cursor-pointer hover:text-slate-800 transition-colors">View Transcript</span>
          </div>
        </div>

        {/* Right Card: Quiz */}
        <div className="flex-1 bg-white rounded-[2rem] p-10 shadow-2xl flex flex-col node-animate border border-slate-100" style={{animationDelay: '0.1s'}}>
          <div className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase mb-4">
            Knowledge Check
          </div>
          
          <h3 className="text-slate-800 text-[19px] font-bold mb-8 leading-snug">
            Based on Scope of Practice rules and the Plan of Care, what is your required course of action?
          </h3>

          <div className="space-y-4 flex-1">
            {answers.map((answer) => (
              <div 
                key={answer.id}
                onClick={() => handleSelect(answer.id)}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-start space-x-4 relative overflow-hidden
                  ${isSubmitted 
                    ? (answer.correct 
                        ? 'bg-[#ecfdf5] border-[#10b981] text-[#065f46] shadow-[0_4px_15px_rgba(16,185,129,0.15)]' 
                        : (selectedAnswer === answer.id ? 'bg-[#fef2f2] border-[#ef4444] text-[#991b1b]' : 'border-slate-100 opacity-40'))
                    : (selectedAnswer === answer.id 
                        ? 'border-[#0f766e] bg-[#f0fdfa] shadow-[0_4px_15px_rgba(15,118,110,0.1)] transform -translate-y-1' 
                        : 'border-slate-200 hover:border-[#0f766e]/40 hover:bg-slate-50')}
                `}
              >
                {/* Checkbox indicator */}
                <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors duration-300
                  ${isSubmitted
                    ? (answer.correct ? 'border-[#10b981] bg-[#10b981]' : (selectedAnswer === answer.id ? 'border-[#ef4444] bg-[#ef4444]' : 'border-slate-300'))
                    : (selectedAnswer === answer.id ? 'border-[#0f766e] border-[7px]' : 'border-slate-300')}
                `}>
                  {isSubmitted && answer.correct && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
                  {isSubmitted && !answer.correct && selectedAnswer === answer.id && <X size={14} className="text-white" strokeWidth={3} />}
                </div>
                
                <span className="text-[15px] font-semibold leading-relaxed pt-0.5">{answer.text}</span>

                {/* Subtle highlight animation when correct */}
                {isSubmitted && answer.correct && selectedAnswer === answer.id && (
                  <div className="absolute inset-0 bg-white/20 pointer-events-none animate-pulse"></div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-8 mt-4 border-t border-slate-100">
            <button 
              onClick={isSubmitted ? onClose : handleSubmit}
              disabled={!selectedAnswer && !isSubmitted}
              className={`w-full py-4 rounded-2xl font-extrabold text-[15px] tracking-wide transition-all duration-300 shadow-md
                ${!selectedAnswer && !isSubmitted 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : isSubmitted
                    ? (isCorrect ? 'bg-[#10b981] text-white hover:bg-[#059669] hover:shadow-lg hover:-translate-y-0.5' : 'bg-[#0f766e] text-white hover:bg-[#0d9488]')
                    : 'bg-[#ea580c] text-white hover:bg-[#d94a08] hover:shadow-lg hover:-translate-y-0.5'}
              `}
            >
              {isSubmitted 
                ? (isCorrect ? 'CORRECT - CONTINUE LESSON' : 'REVIEW CONCEPT & RETRY') 
                : 'SUBMIT ANSWER'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

const BottomNav = ({ activeLesson, setActiveLesson, isPlaying, setIsPlaying }: { activeLesson: number; setActiveLesson: (id: number) => void; isPlaying: boolean; setIsPlaying: any }) => {
  return (
    <div className="h-[96px] w-full bg-white px-10 flex items-center justify-between border-t border-slate-200 relative z-30 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
      
      <div className="w-1/4 flex items-center">
        <button onClick={() => activeLesson > 1 && setActiveLesson(activeLesson - 1)} className={`text-[12px] font-extrabold tracking-[0.15em] uppercase transition-colors flex items-center group ${activeLesson === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-slate-700'}`} disabled={activeLesson === 1}>
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
               {/* Shine effect on progress bar */}
               <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full animate-[shine_2s_infinite]"></div>
             </div>
          </div>
          
          <div className="flex items-center justify-between w-full">
            <span className="text-[13px] font-bold text-slate-700 tabular-nums tracking-wide">01:10 / 02:00</span>
            <span className="text-[11px] text-slate-400 uppercase tracking-[0.15em] font-extrabold">Lesson {activeLesson} of 5</span>
          </div>
        </div>
      </div>

      <div className="w-1/4 flex justify-end">
        <button onClick={() => activeLesson < 5 && setActiveLesson(activeLesson + 1)} className={`px-8 py-4 rounded-full text-[14px] font-extrabold tracking-wider flex items-center space-x-2 transition-all duration-300 ${activeLesson === 5 ? 'bg-slate-300 text-white cursor-not-allowed shadow-none' : 'bg-[#ea580c] text-white shadow-[0_8px_20px_rgba(234,88,12,0.25)] hover:bg-[#c2410c] hover:shadow-[0_10px_25px_rgba(234,88,12,0.35)] hover:-translate-y-0.5 group'}`} disabled={activeLesson === 5}>
          <span>NEXT LESSON</span>
          <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </div>
  );
};


const LeftContentLesson2 = () => {
  return (
    <div className="w-1/2 flex flex-col h-full overflow-y-auto bg-gradient-to-b from-white to-slate-50 scroll-hide relative z-10 px-8 py-8">
      <div className="max-w-[95%]">
        
        <div className="stagger-1">
          <h3 className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.2em] uppercase mb-4 opacity-80 flex items-center">
            <span className="w-6 h-[2px] bg-[#0f766e] mr-3 rounded-full"></span>
            Module Content
          </h3>
          
          <h1 className="text-[40px] font-extrabold text-[#064e3b] mb-4 tracking-tight leading-[1.1]">
            The CMS-485 —<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f766e] to-[#047857]">Home Health Medical Plan of Care</span>
          </h1>
          
          <p className="text-[#ea580c] font-bold text-[17px] mb-8 tracking-wide flex items-center">
            <FileText size={20} className="mr-2 opacity-80" />
            The official document driving your care
          </p>
        </div>

        <div className="space-y-6 text-slate-600 text-[16px] leading-[1.8] mb-10 pr-4 stagger-2 font-medium">
          <p>
            The <span className="font-bold text-slate-800">CMS-485</span> is the foundational document in home health. It serves as both the physician's medical orders and the certification that the patient qualifies for home health services under Medicare or other insurance guidelines.
          </p>
          <p className="p-5 bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl text-slate-700 relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#0f766e] to-[#0d9488]"></div>
            For the LVN, the CMS-485 is the <span className="font-bold text-[#0f766e]">ultimate authority</span>. It specifies the exact types of services, the frequency of visits, and the specific clinical interventions authorized for the patient's home episode (typically a 60-day certification period).
          </p>
          <p>
            If a patient or family member requests a service that is not explicitly detailed in the CMS-485, the LVN cannot provide it without an updated, physician-signed verbal order processed by the supervising RN.
          </p>
        </div>

        {/* Info Blocks - Staggered */}
        <div className="space-y-5 mb-8">
          <div className="stagger-3 group">
            <div className="bg-gradient-to-br from-[#f0fdf4] to-white border border-[#bbf7d0] rounded-[1.25rem] p-5 flex items-start space-x-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="bg-white p-2.5 rounded-2xl text-[#16a34a] shadow-[0_4px_10px_rgba(22,163,74,0.15)] shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[#166534] text-[13px] tracking-wider mb-1.5 uppercase">Scope Boundary</h4>
                <p className="text-[14.5px] text-[#15803d] leading-relaxed font-medium">
                  The LVN executes the interventions on the CMS-485. The RN is responsible for completing the comprehensive assessment (OASIS) that generates the CMS-485.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const RightPanelLesson2 = ({ isPlaying, setShowChallenge }: { isPlaying: boolean; setShowChallenge: any }) => {
  const playState = isPlaying ? 'running' : 'paused';

  return (
    <div className="w-1/2 bg-[#f8fafc] relative overflow-hidden flex flex-col border-l border-slate-200 shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)] group">
      
      {/* Decorative Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="w-[500px] h-[500px] bg-slate-200/50 rounded-full blur-[80px]"></div>
      </div>
      
      {/* Header Area */}
      <div className="absolute top-6 left-8 z-20">
        <div className="text-[11px] font-extrabold tracking-widest text-[#0f766e] uppercase bg-white/80 backdrop-blur-md px-4 py-2 rounded-full inline-block shadow-sm border border-teal-100">
          Form Lifecycle
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="flex-1 relative flex items-center justify-center z-10 w-full h-full">
        <div className="relative w-[500px] h-[500px] scale-[0.95] origin-center">
          
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 500 500" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.08))'}}>
            <defs>
              <marker id="arrow-teal" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#0d9488" />
              </marker>
              <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Linear Flow */}
            <line x1="150" y1="250" x2="230" y2="250" stroke="#0d9488" strokeWidth="5" className="animate-flow-teal" style={{ animationPlayState: playState }} markerEnd="url(#arrow-teal)" filter={isPlaying ? "url(#glow-teal)" : ""} />
            <line x1="330" y1="250" x2="410" y2="250" stroke="#0d9488" strokeWidth="5" className="animate-flow-teal" style={{ animationPlayState: playState }} markerEnd="url(#arrow-teal)" filter={isPlaying ? "url(#glow-teal)" : ""} />
          </svg>

          <div className="absolute inset-0 z-10 flex items-center justify-center">
            {/* Physician */}
            <div className="absolute left-[100px] top-[250px] -translate-x-1/2 -translate-y-1/2 group">
              <div className="node-animate" style={{ animationDelay: '0.1s' }}>
                <DiagramNode label="Physician" subLabel="Certifies Need" gradientClass="bg-gradient-to-br from-[#3b82f6] to-[#1e3a8a]" />
              </div>
            </div>
            
            {/* CMS 485 Form */}
            <div className="absolute left-[280px] top-[250px] -translate-x-1/2 -translate-y-1/2 group z-20">
               <div className="node-animate bg-white rounded-xl shadow-2xl border-2 border-teal-500 p-4 w-[140px] transform hover:scale-105 transition-transform" style={{ animationDelay: '0.3s' }}>
                 <div className="h-2 bg-teal-100 rounded w-1/2 mb-3"></div>
                 <div className="h-1 bg-slate-100 rounded w-full mb-1.5"></div>
                 <div className="h-1 bg-slate-100 rounded w-3/4 mb-1.5"></div>
                 <div className="h-1 bg-slate-100 rounded w-full mb-4"></div>
                 <div className="text-center font-black text-teal-700 text-lg uppercase tracking-widest">CMS-485</div>
                 <div className="text-center text-[10px] text-teal-600 font-bold uppercase tracking-wide mt-1">Plan of Care</div>
              </div>
            </div>
            
            {/* LVN */}
            <div className="absolute left-[460px] top-[250px] -translate-x-1/2 -translate-y-1/2 group">
               <div className="node-animate" style={{ animationDelay: '0.5s' }}>
                <DiagramNode label="LVN" subLabel="Executes" gradientClass="bg-gradient-to-br from-[#f97316] to-[#c2410c]" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Interactive Trigger Area */}
      <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center justify-end bg-gradient-to-t from-slate-100 via-slate-50/90 to-transparent pt-24 z-20 pointer-events-none">
        <div className="node-animate pointer-events-auto flex flex-col items-center" style={{ animationDelay: '0.8s' }}>
          <button 
            onClick={() => setShowChallenge(true)}
            className="btn-pulse btn-shine bg-[#ea580c] text-white px-10 py-3.5 rounded-full font-extrabold text-[15px] tracking-wider shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:bg-[#c2410c] hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2.5"
          >
            <FileText size={18} strokeWidth={2.5} />
            <span>CHALLENGE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ChallengeModalLesson2 = ({ onClose }: { onClose: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const answers = [
    { id: 'a', text: 'The LVN can add a new service to the 485 if the patient strongly requests it.', correct: false },
    { id: 'b', text: 'The CMS-485 is authorized by the physician and binds the LVN to only perform the listed interventions.', correct: true },
    { id: 'c', text: 'The LVN can independently discharge the patient once the 485 interventions are complete.', correct: false },
  ];

  const handleSelect = (id: string) => { if (!isSubmitted) setSelectedAnswer(id); };
  const handleSubmit = () => { if (selectedAnswer) setIsSubmitted(true); };
  const isCorrect = selectedAnswer === 'b';

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-lg transition-all duration-500">
      <div className="w-full max-w-[900px] bg-white rounded-[2rem] p-10 shadow-2xl relative node-animate">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-colors">
          <X size={20} strokeWidth={2.5} />
        </button>
        
        <div className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase mb-4">Knowledge Check</div>
        <h3 className="text-slate-800 text-[20px] font-bold mb-8">What is the LVN's relationship to the CMS-485 Plan of Care?</h3>

        <div className="space-y-4 mb-8">
          {answers.map((answer) => (
            <div 
              key={answer.id}
              onClick={() => handleSelect(answer.id)}
              className={`p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center space-x-4
                ${isSubmitted ? (answer.correct ? 'bg-[#ecfdf5] border-[#10b981] text-[#065f46]' : (selectedAnswer === answer.id ? 'bg-[#fef2f2] border-[#ef4444] text-[#991b1b]' : 'border-slate-100 opacity-40')) : (selectedAnswer === answer.id ? 'border-[#0f766e] bg-[#f0fdfa]' : 'border-slate-200 hover:bg-slate-50')}
              `}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSubmitted ? (answer.correct ? 'border-[#10b981] bg-[#10b981]' : (selectedAnswer === answer.id ? 'border-[#ef4444] bg-[#ef4444]' : 'border-slate-300')) : (selectedAnswer === answer.id ? 'border-[#0f766e] border-[7px]' : 'border-slate-300')}`}>
                {isSubmitted && answer.correct && <CheckCircle2 size={14} className="text-white" />}
                {isSubmitted && !answer.correct && selectedAnswer === answer.id && <X size={14} className="text-white" />}
              </div>
              <span className="text-[15px] font-semibold">{answer.text}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={isSubmitted ? onClose : handleSubmit}
          disabled={!selectedAnswer && !isSubmitted}
          className={`w-full py-4 rounded-2xl font-extrabold text-[15px] tracking-wide transition-all shadow-md ${!selectedAnswer && !isSubmitted ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : isSubmitted ? (isCorrect ? 'bg-[#10b981] text-white hover:bg-[#059669]' : 'bg-[#0f766e] text-white hover:bg-[#0d9488]') : 'bg-[#ea580c] text-white hover:bg-[#d94a08]'}`}
        >
          {isSubmitted ? (isCorrect ? 'CORRECT - CONTINUE LESSON' : 'REVIEW CONCEPT & RETRY') : 'SUBMIT ANSWER'}
        </button>
      </div>
    </div>
  );
};


// ==================== LESSON 3 ====================

const LeftContentLesson3 = () => {
  return (
    <div className="w-1/2 flex flex-col h-full overflow-y-auto bg-gradient-to-b from-white to-slate-50 scroll-hide relative z-10 px-8 py-8">
      <div className="max-w-[95%]">
        
        <div className="stagger-1">
          <h3 className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.2em] uppercase mb-4 opacity-80 flex items-center">
            <span className="w-6 h-[2px] bg-[#0f766e] mr-3 rounded-full"></span>
            Module Content
          </h3>
          <h1 className="text-[40px] font-extrabold text-[#064e3b] mb-4 tracking-tight leading-[1.1]">
            Visit Frequency <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f766e] to-[#047857]">& Scheduling</span>
          </h1>
          <p className="text-[#ea580c] font-bold text-[17px] mb-8 tracking-wide flex items-center">
            <Calendar size={20} className="mr-2 opacity-80" />
            Adhering strictly to authorized dates
          </p>
        </div>

        <div className="space-y-6 text-slate-600 text-[16px] leading-[1.8] mb-10 pr-4 stagger-2 font-medium">
          <p>
            The Plan of Care dictates not only what you do, but <span className="font-bold text-slate-800">when</span> you do it. Visit frequencies are physician-ordered using shorthand notation (e.g., <span className="font-bold text-[#0f766e] bg-teal-50 px-1.5 py-0.5 rounded">2w9</span> means two visits per week for nine weeks). These frequencies are tied directly to the 60-day certification period on the CMS-485.
          </p>
          <p className="p-5 bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl text-slate-700 relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#0f766e] to-[#0d9488]"></div>
            LVNs are strictly prohibited from altering the visit frequency. If a patient asks you to &quot;skip a visit&quot; or &quot;come an extra day,&quot; you <span className="font-bold text-[#ea580c]">cannot</span> agree to this independently. Any missed visit or added visit requires RN coordination and a physician order.
          </p>
          <p>
            Each visit must be <span className="font-bold text-slate-800">documented on the exact date it occurred</span>. Backdating, pre-dating, or clustering visits into a single week to &quot;catch up&quot; is a federal compliance violation that can trigger audits, payment recoupment, and potential fraud investigations.
          </p>
          <p>
            If a patient is not home for a scheduled visit, the LVN must document the attempted visit, immediately notify the supervising RN, and <span className="font-bold text-slate-800">never</span> independently reschedule to a different day. The RN will determine whether a make-up visit is clinically appropriate and will coordinate a new order if needed.
          </p>
        </div>

        {/* Info Blocks - Staggered */}
        <div className="space-y-5 mb-8">
          <div className="stagger-3 group">
            <div className="bg-gradient-to-br from-[#f0fdf4] to-white border border-[#bbf7d0] rounded-[1.25rem] p-5 flex items-start space-x-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="bg-white p-2.5 rounded-2xl text-[#16a34a] shadow-[0_4px_10px_rgba(22,163,74,0.15)] shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[#166534] text-[13px] tracking-wider mb-1.5 uppercase">CMS Condition of Participation</h4>
                <p className="text-[14.5px] text-[#15803d] leading-relaxed font-medium">
                  42 CFR § 484.60(a): Services must be furnished in accordance with physician orders, including the type, frequency, and duration of each service as specified on the individualized plan of care.
                </p>
              </div>
            </div>
          </div>

          <div className="stagger-4 group">
            <div className="bg-gradient-to-br from-[#fff7ed] to-white border border-[#fed7aa] rounded-[1.25rem] p-5 flex items-start space-x-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="bg-white p-2.5 rounded-2xl text-[#ea580c] shadow-[0_4px_10px_rgba(234,88,12,0.15)] shrink-0 group-hover:scale-110 transition-transform duration-300">
                <AlertCircle size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[#9a3412] text-[13px] tracking-wider mb-1.5 uppercase">Missed Visit Protocol</h4>
                <p className="text-[14.5px] text-[#c2410c] leading-relaxed font-medium">
                  A missed visit is never &quot;made up&quot; without authorization. Document the missed visit in the clinical record, notify the RN Case Manager within the same business day, and await instruction. Unauthorized rescheduling is a compliance violation.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const RightPanelLesson3 = ({ setShowChallenge }: { isPlaying: boolean; setShowChallenge: any }) => {
  return (
    <div className="w-1/2 bg-[#f8fafc] relative overflow-hidden flex flex-col border-l border-slate-200 shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)] group">
      <div className="absolute top-6 left-8 z-20">
        <div className="text-[11px] font-extrabold tracking-widest text-[#0f766e] uppercase bg-white/80 backdrop-blur-md px-4 py-2 rounded-full inline-block shadow-sm border border-teal-100">
          Timeline Protocol
        </div>
      </div>
      <div className="flex-1 relative flex items-center justify-center z-10 w-full h-full">
         <div className="node-animate bg-white rounded-2xl p-6 shadow-xl border border-slate-200 w-[400px]">
           <div className="flex justify-between items-center mb-6">
             <div className="font-bold text-slate-700">Week 1 Schedule</div>
             <div className="text-teal-600 font-bold bg-teal-50 px-2 py-1 rounded">Freq: 2w1</div>
           </div>
           
           <div className="flex items-center space-x-4 mb-4 opacity-100 relative">
             <div className="w-12 h-12 bg-teal-100 text-teal-700 font-bold rounded-lg flex items-center justify-center">Mon</div>
             <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between">
               <span className="font-bold text-slate-700 text-sm">Wound Care Visit</span>
               <CheckCircle2 className="text-teal-500" size={18} />
             </div>
           </div>
           
           <div className="flex items-center space-x-4 opacity-100 relative group">
             <div className="w-12 h-12 bg-orange-100 text-orange-700 font-bold rounded-lg flex items-center justify-center">Thu</div>
             <div className="flex-1 bg-red-50 border border-red-200 p-3 rounded-lg flex items-center justify-between relative overflow-hidden">
               <span className="font-bold text-red-700 text-sm">Patient Not Home</span>
               <X className="text-red-500" size={18} />
             </div>
             
             {/* Alert tooltip */}
             <div className="absolute right-[-140px] top-1/2 -translate-y-1/2 bg-slate-800 text-white p-3 rounded shadow-lg text-xs font-bold w-[130px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
               Must notify RN immediately. Do not just move to Friday.
             </div>
           </div>
         </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center justify-end bg-gradient-to-t from-slate-100 via-slate-50/90 to-transparent pt-24 z-20 pointer-events-none">
        <div className="node-animate pointer-events-auto flex flex-col items-center" style={{ animationDelay: '0.4s' }}>
          <button onClick={() => setShowChallenge(true)} className="btn-pulse btn-shine bg-[#ea580c] text-white px-10 py-3.5 rounded-full font-extrabold text-[15px] tracking-wider shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:bg-[#c2410c] hover:-translate-y-1 transition-all flex items-center space-x-2.5">
            <FileText size={18} strokeWidth={2.5} />
            <span>CHALLENGE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ChallengeModalLesson3 = ({ onClose }: { onClose: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const answers = [
    { id: 'a', text: 'Reschedule the visit for tomorrow since the frequency is 2 times a week anyway.', correct: false },
    { id: 'b', text: 'Document it as missed and notify the supervising RN so they can contact the physician if required.', correct: true },
    { id: 'c', text: 'Just skip it and do an extra visit next week to make up for it.', correct: false },
  ];
  const isCorrect = selectedAnswer === 'b';
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-lg">
      <div className="w-full max-w-[900px] bg-white rounded-[2rem] p-10 shadow-2xl relative node-animate">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center"><X size={20} /></button>
        <div className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase mb-4">Knowledge Check</div>
        <h3 className="text-slate-800 text-[20px] font-bold mb-8">What should you do if a patient refuses a visit?</h3>
        <div className="space-y-4 mb-8">
          {answers.map((a) => (
            <div key={a.id} onClick={() => !isSubmitted && setSelectedAnswer(a.id)} className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center space-x-4 ${isSubmitted ? (a.correct ? 'bg-[#ecfdf5] border-[#10b981]' : (selectedAnswer === a.id ? 'bg-[#fef2f2] border-[#ef4444]' : 'border-slate-100 opacity-40')) : (selectedAnswer === a.id ? 'border-[#0f766e] bg-[#f0fdfa]' : 'border-slate-200')} `}>
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSubmitted ? (a.correct ? 'border-[#10b981] bg-[#10b981]' : (selectedAnswer === a.id ? 'border-[#ef4444] bg-[#ef4444]' : 'border-slate-300')) : (selectedAnswer === a.id ? 'border-[#0f766e] border-[7px]' : 'border-slate-300')}`}>{isSubmitted && a.correct && <CheckCircle2 size={14} className="text-white"/>}{isSubmitted && !a.correct && selectedAnswer === a.id && <X size={14} className="text-white"/>}</div>
              <span className="text-[15px] font-semibold">{a.text}</span>
            </div>
          ))}
        </div>
        <button onClick={isSubmitted ? onClose : () => selectedAnswer && setIsSubmitted(true)} disabled={!selectedAnswer && !isSubmitted} className={`w-full py-4 rounded-2xl font-extrabold shadow-md ${!selectedAnswer && !isSubmitted ? 'bg-slate-100 text-slate-400' : isSubmitted ? (isCorrect ? 'bg-[#10b981] text-white' : 'bg-[#0f766e] text-white') : 'bg-[#ea580c] text-white'}`}>{isSubmitted ? (isCorrect ? 'CORRECT - CONTINUE' : 'RETRY') : 'SUBMIT'}</button>
      </div>
    </div>
  );
};

// ==================== LESSON 4 ====================

const LeftContentLesson4 = () => {
  return (
    <div className="w-1/2 flex flex-col h-full overflow-y-auto bg-gradient-to-b from-white to-slate-50 scroll-hide relative z-10 px-8 py-8">
      <div className="max-w-[95%]">
        <div className="stagger-1">
          <h3 className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.2em] uppercase mb-4 opacity-80 flex items-center">
            <span className="w-6 h-[2px] bg-[#0f766e] mr-3 rounded-full"></span>
            Module Content
          </h3>
          <h1 className="text-[40px] font-extrabold text-[#064e3b] mb-4 tracking-tight leading-[1.1]">
            Delegation Chain <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f766e] to-[#047857]">& The LVN</span>
          </h1>
          <p className="text-[#ea580c] font-bold text-[17px] mb-8 tracking-wide flex items-center">
            <Users size={20} className="mr-2 opacity-80" />
            Who directs your work?
          </p>
        </div>

        <div className="space-y-6 text-slate-600 text-[16px] leading-[1.8] mb-10 pr-4 stagger-2 font-medium">
          <p>
            LVNs practice under the direction of a <span className="font-bold text-slate-800">Registered Nurse (RN) or Physician</span>. In the home health setting, the RN Case Manager is primarily responsible for delegating clinical tasks to the LVN and ensuring that all care provided remains within the authorized Plan of Care.
          </p>
          <p className="p-5 bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl text-slate-700 relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#0f766e] to-[#0d9488]"></div>
            The LVN is responsible for the <span className="font-bold text-[#0f766e] bg-teal-50 px-1.5 py-0.5 rounded">execution</span> of delegated tasks, but the RN retains responsibility for the overall assessment, care planning, and evaluation of the patient&apos;s progress. This is not optional — it is a legal requirement.
          </p>
          <p>
            Key tasks the LVN <span className="font-bold text-[#0f766e]">can</span> perform under delegation include: wound care, medication administration, vital signs collection, catheter care, and patient/caregiver education as specified on the POC. Tasks the LVN <span className="font-bold text-[#ea580c]">cannot</span> perform include: initial patient assessments (OASIS), care plan development or modification, and discharge planning.
          </p>
          <p>
            The delegation chain also means the LVN must <span className="font-bold text-slate-800">communicate upward, never laterally</span>. If a Home Health Aide (HHA) reports a concern to you, you must escalate it to the supervising RN — you cannot independently act on an HHA&apos;s report to change the care plan.
          </p>
        </div>

        {/* Info Blocks - Staggered */}
        <div className="space-y-5 mb-8">
          <div className="stagger-3 group">
            <div className="bg-gradient-to-br from-[#f0fdf4] to-white border border-[#bbf7d0] rounded-[1.25rem] p-5 flex items-start space-x-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="bg-white p-2.5 rounded-2xl text-[#16a34a] shadow-[0_4px_10px_rgba(22,163,74,0.15)] shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[#166534] text-[13px] tracking-wider mb-1.5 uppercase">California BPC § 2859.5</h4>
                <p className="text-[14.5px] text-[#15803d] leading-relaxed font-medium">
                  The LVN/LPN functions under the direction and supervision of a licensed physician, dentist, or registered nurse. The LVN scope does not include independent assessment, diagnosis, or modification of the plan of treatment.
                </p>
              </div>
            </div>
          </div>

          <div className="stagger-4 group">
            <div className="bg-gradient-to-br from-[#fff7ed] to-white border border-[#fed7aa] rounded-[1.25rem] p-5 flex items-start space-x-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="bg-white p-2.5 rounded-2xl text-[#ea580c] shadow-[0_4px_10px_rgba(234,88,12,0.15)] shrink-0 group-hover:scale-110 transition-transform duration-300">
                <AlertCircle size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[#9a3412] text-[13px] tracking-wider mb-1.5 uppercase">Key Clinical Rule</h4>
                <p className="text-[14.5px] text-[#c2410c] leading-relaxed font-medium">
                  If you are unsure whether a task falls within your scope, <span className="font-bold">do not perform it</span>. Contact the supervising RN for clarification. Performing a task outside the delegation chain is a scope-of-practice violation and may result in disciplinary action by the Board of Vocational Nursing.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const RightPanelLesson4 = ({ setShowChallenge }: { isPlaying: boolean; setShowChallenge: any }) => {
  return (
    <div className="w-1/2 bg-[#f8fafc] relative overflow-hidden flex flex-col border-l border-slate-200 shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)] group">
      <div className="absolute top-6 left-8 z-20"><div className="text-[11px] font-extrabold tracking-widest text-[#0f766e] uppercase bg-white/80 backdrop-blur-md px-4 py-2 rounded-full inline-block shadow-sm border border-teal-100">Chain of Command</div></div>
      <div className="flex-1 relative flex items-center justify-center z-10 w-full h-full">
         <div className="relative w-[300px] h-[400px]">
           <div className="absolute inset-x-1/2 top-10 bottom-10 w-1 bg-slate-200"></div>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 node-animate" style={{animationDelay:'0.1s'}}>
             <div className="bg-[#3b82f6] text-white px-6 py-3 rounded-full font-bold shadow-lg text-center w-[180px]">Physician</div>
           </div>
           <div className="absolute top-[130px] left-1/2 -translate-x-1/2 node-animate" style={{animationDelay:'0.3s'}}>
             <div className="bg-[#14b8a6] text-white px-6 py-3 rounded-full font-bold shadow-lg text-center w-[180px]">Supervising RN</div>
           </div>
           <div className="absolute top-[260px] left-1/2 -translate-x-1/2 node-animate" style={{animationDelay:'0.5s'}}>
             <div className="bg-[#ea580c] text-white px-6 py-3 rounded-full font-bold shadow-lg text-center w-[180px]">LVN / LPN</div>
           </div>
         </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center justify-end bg-gradient-to-t from-slate-100 via-slate-50/90 to-transparent pt-24 z-20 pointer-events-none">
        <div className="node-animate pointer-events-auto flex flex-col items-center" style={{ animationDelay: '0.4s' }}><button onClick={() => setShowChallenge(true)} className="btn-pulse btn-shine bg-[#ea580c] text-white px-10 py-3.5 rounded-full font-extrabold text-[15px] tracking-wider shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:bg-[#c2410c] hover:-translate-y-1 transition-all flex items-center space-x-2.5"><FileText size={18} strokeWidth={2.5} /><span>CHALLENGE</span></button></div>
      </div>
    </div>
  );
};

const ChallengeModalLesson4 = ({ onClose }: { onClose: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const answers = [
    { id: 'a', text: 'The LVN functions completely independently in the home.', correct: false },
    { id: 'b', text: 'The LVN practices under the direction of an RN or Physician.', correct: true },
    { id: 'c', text: 'The LVN delegates complex assessments to the Home Health Aide.', correct: false },
  ];
  const isCorrect = selectedAnswer === 'b';
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-lg">
      <div className="w-full max-w-[900px] bg-white rounded-[2rem] p-10 shadow-2xl relative node-animate">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center"><X size={20} /></button>
        <div className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase mb-4">Knowledge Check</div>
        <h3 className="text-slate-800 text-[20px] font-bold mb-8">Who does the LVN practice under?</h3>
        <div className="space-y-4 mb-8">
          {answers.map((a) => (
            <div key={a.id} onClick={() => !isSubmitted && setSelectedAnswer(a.id)} className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center space-x-4 ${isSubmitted ? (a.correct ? 'bg-[#ecfdf5] border-[#10b981]' : (selectedAnswer === a.id ? 'bg-[#fef2f2] border-[#ef4444]' : 'border-slate-100 opacity-40')) : (selectedAnswer === a.id ? 'border-[#0f766e] bg-[#f0fdfa]' : 'border-slate-200')} `}>
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSubmitted ? (a.correct ? 'border-[#10b981] bg-[#10b981]' : (selectedAnswer === a.id ? 'border-[#ef4444] bg-[#ef4444]' : 'border-slate-300')) : (selectedAnswer === a.id ? 'border-[#0f766e] border-[7px]' : 'border-slate-300')}`}>{isSubmitted && a.correct && <CheckCircle2 size={14} className="text-white"/>}{isSubmitted && !a.correct && selectedAnswer === a.id && <X size={14} className="text-white"/>}</div>
              <span className="text-[15px] font-semibold">{a.text}</span>
            </div>
          ))}
        </div>
        <button onClick={isSubmitted ? onClose : () => selectedAnswer && setIsSubmitted(true)} disabled={!selectedAnswer && !isSubmitted} className={`w-full py-4 rounded-2xl font-extrabold shadow-md ${!selectedAnswer && !isSubmitted ? 'bg-slate-100 text-slate-400' : isSubmitted ? (isCorrect ? 'bg-[#10b981] text-white' : 'bg-[#0f766e] text-white') : 'bg-[#ea580c] text-white'}`}>{isSubmitted ? (isCorrect ? 'CORRECT - CONTINUE' : 'RETRY') : 'SUBMIT'}</button>
      </div>
    </div>
  );
};

// ==================== LESSON 5 ====================

const LeftContentLesson5 = () => {
  return (
    <div className="w-1/2 flex flex-col h-full overflow-y-auto bg-gradient-to-b from-white to-slate-50 scroll-hide relative z-10 px-8 py-8">
      <div className="max-w-[95%]">
        <div className="stagger-1">
          <h3 className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.2em] uppercase mb-4 opacity-80 flex items-center">
            <span className="w-6 h-[2px] bg-[#0f766e] mr-3 rounded-full"></span>
            Module Content
          </h3>
          <h1 className="text-[40px] font-extrabold text-[#064e3b] mb-4 tracking-tight leading-[1.1]">
            Responding to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0f766e] to-[#047857]">Patient Changes</span>
          </h1>
          <p className="text-[#ea580c] font-bold text-[17px] mb-8 tracking-wide flex items-center">
            <AlertCircle size={20} className="mr-2 opacity-80" />
            Recognizing, documenting, and escalating
          </p>
        </div>

        <div className="space-y-6 text-slate-600 text-[16px] leading-[1.8] mb-10 pr-4 stagger-2 font-medium">
          <p>
            If you encounter a change in the patient&apos;s condition that falls outside the parameters of the Plan of Care — such as <span className="font-bold text-slate-800">abnormal vitals, new wounds, sudden confusion, increased pain, or signs of infection</span> — you cannot independently change the medical interventions.
          </p>
          <p className="p-5 bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl text-slate-700 relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-[#ea580c] to-[#c2410c]"></div>
            You must <span className="font-bold text-[#ea580c]">report the change immediately</span> to the Supervising RN. The RN will evaluate the clinical significance, coordinate with the physician, and determine whether an updated order or an emergency response is needed.
          </p>
          <p>
            Your documentation of the change must be <span className="font-bold text-slate-800">objective, specific, and time-stamped</span>. Record the exact vital signs, the patient&apos;s verbal complaints, and any observable physical changes. Avoid subjective language like &quot;patient seems worse&quot; — instead, document measurable data: &quot;BP 178/102 at 10:15 AM, patient reports new onset frontal headache rated 7/10.&quot;
          </p>
          <p>
            In a <span className="font-bold text-[#ea580c]">life-threatening emergency</span> (chest pain, stroke symptoms, severe respiratory distress, unresponsive patient), call 911 first, then immediately notify the supervising RN. Do not wait for RN instruction before calling emergency services when a patient&apos;s life is in danger.
          </p>
        </div>

        {/* Info Blocks - Staggered */}
        <div className="space-y-5 mb-8">
          <div className="stagger-3 group">
            <div className="bg-gradient-to-br from-[#f0fdf4] to-white border border-[#bbf7d0] rounded-[1.25rem] p-5 flex items-start space-x-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="bg-white p-2.5 rounded-2xl text-[#16a34a] shadow-[0_4px_10px_rgba(22,163,74,0.15)] shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[#166534] text-[13px] tracking-wider mb-1.5 uppercase">Federal Reporting Requirement</h4>
                <p className="text-[14.5px] text-[#15803d] leading-relaxed font-medium">
                  42 CFR § 484.50(c): The home health agency must promptly alert the physician to any changes that suggest a need to alter the plan of care. Failure to report constitutes a Condition of Participation deficiency.
                </p>
              </div>
            </div>
          </div>

          <div className="stagger-4 group">
            <div className="bg-gradient-to-br from-[#fff7ed] to-white border border-[#fed7aa] rounded-[1.25rem] p-5 flex items-start space-x-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="bg-white p-2.5 rounded-2xl text-[#ea580c] shadow-[0_4px_10px_rgba(234,88,12,0.15)] shrink-0 group-hover:scale-110 transition-transform duration-300">
                <AlertCircle size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="font-bold text-[#9a3412] text-[13px] tracking-wider mb-1.5 uppercase">Clinical Boundary</h4>
                <p className="text-[14.5px] text-[#c2410c] leading-relaxed font-medium">
                  The LVN may <span className="font-bold">never</span> initiate a new medication, discontinue an existing one, or change a treatment protocol based on observed changes. These actions require a physician order communicated through the supervising RN. The LVN&apos;s role is to detect, document, and report.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const RightPanelLesson5 = ({ setShowChallenge }: { isPlaying: boolean; setShowChallenge: any }) => {
  return (
    <div className="w-1/2 bg-[#f8fafc] relative overflow-hidden flex flex-col border-l border-slate-200 shadow-[inset_0_4px_20px_rgba(0,0,0,0.03)] group">
      <div className="absolute top-6 left-8 z-20"><div className="text-[11px] font-extrabold tracking-widest text-[#0f766e] uppercase bg-white/80 backdrop-blur-md px-4 py-2 rounded-full inline-block shadow-sm border border-teal-100">Escalation Path</div></div>
      <div className="flex-1 relative flex items-center justify-center z-10 w-full h-full">
         <div className="node-animate bg-white rounded-2xl p-6 shadow-xl border border-slate-200 w-[400px]">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-red-100 text-red-600 p-4 rounded-full"><AlertCircle size={32} /></div>
              <h3 className="font-bold text-slate-800 text-lg">Abnormal Finding Detected</h3>
              <div className="h-8 w-1 bg-slate-200"></div>
              <div className="bg-orange-100 text-orange-600 font-bold px-6 py-3 rounded-lg border border-orange-200 w-full">Call Supervising RN</div>
              <div className="h-8 w-1 bg-slate-200"></div>
              <div className="bg-teal-100 text-teal-700 font-bold px-6 py-3 rounded-lg border border-teal-200 w-full">RN contacts Physician</div>
            </div>
         </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center justify-end bg-gradient-to-t from-slate-100 via-slate-50/90 to-transparent pt-24 z-20 pointer-events-none">
        <div className="node-animate pointer-events-auto flex flex-col items-center" style={{ animationDelay: '0.4s' }}><button onClick={() => setShowChallenge(true)} className="btn-pulse btn-shine bg-[#ea580c] text-white px-10 py-3.5 rounded-full font-extrabold text-[15px] tracking-wider shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:bg-[#c2410c] hover:-translate-y-1 transition-all flex items-center space-x-2.5"><FileText size={18} strokeWidth={2.5} /><span>CHALLENGE</span></button></div>
      </div>
    </div>
  );
};

const ChallengeModalLesson5 = ({ onClose }: { onClose: () => void }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const answers = [
    { id: 'a', text: 'Give an unprescribed over-the-counter medication to help.', correct: false },
    { id: 'b', text: 'Document it and wait for the next visit to see if it improves.', correct: false },
    { id: 'c', text: 'Immediately notify the supervising RN and wait for further instruction.', correct: true },
  ];
  const isCorrect = selectedAnswer === 'c';
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/60 backdrop-blur-lg">
      <div className="w-full max-w-[900px] bg-white rounded-[2rem] p-10 shadow-2xl relative node-animate">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center"><X size={20} /></button>
        <div className="text-[11px] font-extrabold text-[#0f766e] tracking-[0.15em] uppercase mb-4">Knowledge Check</div>
        <h3 className="text-slate-800 text-[20px] font-bold mb-8">What do you do if a patient has abnormal vitals?</h3>
        <div className="space-y-4 mb-8">
          {answers.map((a) => (
            <div key={a.id} onClick={() => !isSubmitted && setSelectedAnswer(a.id)} className={`p-5 rounded-2xl border-2 cursor-pointer flex items-center space-x-4 ${isSubmitted ? (a.correct ? 'bg-[#ecfdf5] border-[#10b981]' : (selectedAnswer === a.id ? 'bg-[#fef2f2] border-[#ef4444]' : 'border-slate-100 opacity-40')) : (selectedAnswer === a.id ? 'border-[#0f766e] bg-[#f0fdfa]' : 'border-slate-200')} `}>
              <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSubmitted ? (a.correct ? 'border-[#10b981] bg-[#10b981]' : (selectedAnswer === a.id ? 'border-[#ef4444] bg-[#ef4444]' : 'border-slate-300')) : (selectedAnswer === a.id ? 'border-[#0f766e] border-[7px]' : 'border-slate-300')}`}>{isSubmitted && a.correct && <CheckCircle2 size={14} className="text-white"/>}{isSubmitted && !a.correct && selectedAnswer === a.id && <X size={14} className="text-white"/>}</div>
              <span className="text-[15px] font-semibold">{a.text}</span>
            </div>
          ))}
        </div>
        <button onClick={isSubmitted ? onClose : () => selectedAnswer && setIsSubmitted(true)} disabled={!selectedAnswer && !isSubmitted} className={`w-full py-4 rounded-2xl font-extrabold shadow-md ${!selectedAnswer && !isSubmitted ? 'bg-slate-100 text-slate-400' : isSubmitted ? (isCorrect ? 'bg-[#10b981] text-white' : 'bg-[#0f766e] text-white') : 'bg-[#ea580c] text-white'}`}>{isSubmitted ? (isCorrect ? 'CORRECT - CONTINUE' : 'RETRY') : 'SUBMIT'}</button>
      </div>
    </div>
  );
};

export default function LVN005() {
  const [activeLesson, setActiveLesson] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showChallenge, setShowChallenge] = useState(false);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-white font-sans antialiased flex flex-col z-[9999]">
      <GlobalStyles />
      
      {/* Radial vignette mask for the background */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-radial from-transparent to-slate-200/50 mix-blend-multiply z-0"></div>
      
      {/* Main Window Container */}
      <div className="w-full h-full flex flex-col relative z-10">
        
        <TopNav activeLesson={activeLesson} setActiveLesson={setActiveLesson} />
        
        <div className="flex-1 flex overflow-hidden relative min-h-0">
          {activeLesson === 1 && <LeftContentLesson1 />}
          {activeLesson === 2 && <LeftContentLesson2 />}
          {activeLesson === 3 && <LeftContentLesson3 />}
          {activeLesson === 4 && <LeftContentLesson4 />}
          {activeLesson === 5 && <LeftContentLesson5 />}
          {activeLesson === 1 && <RightPanelLesson1 isPlaying={isPlaying} setShowChallenge={setShowChallenge} />}
          {activeLesson === 2 && <RightPanelLesson2 isPlaying={isPlaying} setShowChallenge={setShowChallenge} />}
          {activeLesson === 3 && <RightPanelLesson3 isPlaying={isPlaying} setShowChallenge={setShowChallenge} />}
          {activeLesson === 4 && <RightPanelLesson4 isPlaying={isPlaying} setShowChallenge={setShowChallenge} />}
          {activeLesson === 5 && <RightPanelLesson5 isPlaying={isPlaying} setShowChallenge={setShowChallenge} />}
          {activeLesson === 1 && showChallenge && <ChallengeModalLesson1 onClose={() => setShowChallenge(false)} />}
          {activeLesson === 2 && showChallenge && <ChallengeModalLesson2 onClose={() => setShowChallenge(false)} />}
          {activeLesson === 3 && showChallenge && <ChallengeModalLesson3 onClose={() => setShowChallenge(false)} />}
          {activeLesson === 4 && showChallenge && <ChallengeModalLesson4 onClose={() => setShowChallenge(false)} />}
          {activeLesson === 5 && showChallenge && <ChallengeModalLesson5 onClose={() => setShowChallenge(false)} />}
        </div>

        <BottomNav activeLesson={activeLesson} setActiveLesson={setActiveLesson} isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      </div>
    </div>
  );
}