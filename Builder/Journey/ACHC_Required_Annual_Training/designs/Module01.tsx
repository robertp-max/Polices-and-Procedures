import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  ListChecks,
  Info
} from 'lucide-react';

// --- DATA PREPARATION ---
const generateSlideData = () => {
  const slides = [];
  
  // Slide 1: Content
  slides.push({
    id: 1,
    type: 'content',
    title: "Before Sunrise in Quezon City",
    location: "Quezon City family kitchen — pre-dawn",
    narration: "It is 4:45 in the morning in Quezon City. Marites is already awake. This is not unusual. In the Philippines, the day begins before the sun does. She can hear her mother moving in the kitchen — rice cooker clicking, garlic hitting oil — the sounds of a family that has always started early and worked hard. She folds her scrub top, smooths out the sleeve, and lays it across her nursing bag. She is not a new nurse. She has managed post-surgical wounds, administered intravenous medications, and handled difficult family conversations at three in the morning. What is new is the country she is about to work in — and she knows that professional competence and system fluency are two different things.",
    topic: "Cultural awareness; Trust outcomes",
    policy: "ACHC CLAS Domain 1",
  });

  // Generate slides 2 to 49
  for (let i = 2; i <= 49; i++) {
    let type = 'content';
    if (i % 5 === 0) type = 'challenge';
    else if (i % 5 === 1) type = 'debrief';

    slides.push({
      id: i,
      type: type,
      title: type === 'challenge' ? `Knowledge Check` : type === 'debrief' ? `Challenge Debrief` : `Marites's Journey: Scene ${i}`,
      location: type === 'challenge' ? "Interactive Assessment" : type === 'debrief' ? "Performance Review" : "Patient Room 304 - Mr. Henderson",
      
      narration: type === 'content' ? `As the shift progresses, Marites applies her extensive clinical knowledge to the immediate needs of her patients. Every interaction is an opportunity to build trust. She verifies comprehension not just by asking if they understand, but by observing their comfort level.` : '',
      
      challengeQuestion: type === 'challenge' ? `Placeholder Challenge ${i}: Based on the previous scenarios, what is the most defensible immediate action when encountering a cultural barrier to a care plan?` : '',
      options: type === 'challenge' ? [
        "Ignore the barrier and proceed with the standard care plan.",
        "Document the barrier but take no alternative action.",
        "Acknowledge the request, assess clinical urgency, escalate to supervisor, and document.",
        "Ask a family member to override the patient's concern to save time."
      ] : [],
      correctAnswer: 2,
      
      debriefText: type === 'debrief' ? `The correct approach requires you to hold both obligations simultaneously: assess the clinical urgency immediately at the bedside, and escalate to your supervisor for safe accommodation options. This chain of action is what defensible care looks like.` : '',
      
      topic: type === 'challenge' ? "Assessment Linkage" : "Patient Engagement Policy",
      policy: type === 'challenge' ? "Operational Workflow: Mapped" : "CLAS Outcomes Alignment",
    });
  }

  // Slide 50: Content
  slides.push({
    id: 50,
    type: 'content',
    title: "Relief pride closure",
    location: "Residential front doorway",
    narration: "Cultural competence is not a training badge. It is a daily operational commitment. When it is practiced consistently — with documentation, escalation, interpreter workflow, dignity, and verified comprehension — it improves patient safety, builds trust, reduces adverse events, and makes every shift more defensible. This is the work. This is the standard. This is how it is done.",
    topic: "Trust outcomes; Patient-centered care",
    policy: "Patient Engagement Policy",
  });

  return slides;
};

const slidesData = generateSlideData();

// --- MAIN COMPONENT ---
export default function LMSCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Challenge State
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  
  const playIntervalRef = useRef(null);
  const activeItem = slidesData[currentSlide];
  
  // CareIndeed Primary Brand Color
  const brandPrimary = "#C74601";

  // Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      // Pause auto-play if we are on a challenge slide and it hasn't been answered
      if (activeItem.type === 'challenge' && !isAnswerRevealed) {
        setIsPlaying(false);
        return;
      }

      playIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev >= slidesData.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, activeItem.type === 'content' ? 12000 : 8000); // Give more time for reading content
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, activeItem.type, isAnswerRevealed]);

  // Reset challenge state when slide changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswerRevealed(false);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide < slidesData.length - 1) setCurrentSlide(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const submitChallenge = () => {
    if (selectedAnswer !== null) {
      setIsAnswerRevealed(true);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050505] text-slate-100 font-sans overflow-hidden relative selection:bg-[#C74601] selection:text-white">
      
      {/* Cinematic Ambient Background Glows */}
      <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] bg-[#C74601] rounded-full mix-blend-screen filter blur-[250px] opacity-[0.08] pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[50vw] h-[50vw] bg-blue-800 rounded-full mix-blend-screen filter blur-[300px] opacity-[0.08] pointer-events-none"></div>

      {/* Floating Top-Left Image & Policy References */}
      <div className="absolute top-8 left-10 z-50 pointer-events-none drop-shadow-lg flex flex-col gap-5">
        <img src="image_09f860.png" alt="Brand Logo" className="h-10 w-auto object-contain opacity-90" />
        <div>
          <p className="text-xs font-bold text-[#C74601] uppercase tracking-[0.2em] mb-1">
            {activeItem.topic}
          </p>
          <p className="text-sm font-medium text-slate-300 border-l-2 border-[#C74601] pl-3 py-0.5">
            {activeItem.policy}
          </p>
        </div>
      </div>

      {/* Slide Counter (Top Right) */}
      <div className="absolute top-8 right-10 z-50 pointer-events-none">
        <p className="text-sm font-medium text-slate-500 tracking-widest drop-shadow-md">
          {String(currentSlide + 1).padStart(2, '0')} / {slidesData.length}
        </p>
      </div>

      {/* Floating Left/Right Controls */}
      <button 
        onClick={handlePrev} 
        disabled={currentSlide === 0}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:scale-110 disabled:opacity-0 transition-all duration-300"
      >
        <ChevronLeft size={32} strokeWidth={1.5} />
      </button>

      <button 
        onClick={handleNext} 
        disabled={currentSlide === slidesData.length - 1}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:scale-110 disabled:opacity-0 transition-all duration-300"
      >
        <ChevronRight size={32} strokeWidth={1.5} />
      </button>

      {/* Main 3D Coverflow Area (Full Screen Focus) */}
      <main className="absolute inset-0 flex items-center justify-center z-10 w-full h-full perspective-[2000px]">
        {slidesData.map((item, index) => {
          const offset = index - currentSlide;
          const absOffset = Math.abs(offset);
          
          // Performance optimization: only render slides close to the current one
          if (absOffset > 2) return null;

          const isActive = offset === 0;
          // Calculate 3D transforms for cinematic fullscreen feel
          const translateX = offset * 45; // vw separation
          const translateZ = isActive ? 0 : -500; // push side items way back
          const rotateY = -offset * 35; // aggressive tilt for side items
          const scale = isActive ? 1 : 0.8;
          const opacity = isActive ? 1 : absOffset === 1 ? 0.3 : 0;
          const zIndex = 20 - absOffset;

          return (
            <div
              key={item.id}
              className="absolute transition-all duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{
                transform: `translateX(${translateX}vw) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity,
                zIndex,
              }}
            >
              {/* Slide Card Container - Almost Full Screen */}
              <div 
                className={`relative w-[88vw] h-[85vh] rounded-[2rem] overflow-hidden transition-all duration-1000
                  ${isActive ? 'shadow-[0_0_80px_-20px_rgba(0,0,0,1)] border border-white/10' : 'shadow-2xl border border-transparent'}
                `}
              >
                {/* Background Image */}
                <img 
                  src={`https://picsum.photos/seed/careindeed${item.id}/1920/1080`}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] ease-linear hover:scale-105"
                  style={{ transform: isActive ? 'scale(1.02)' : 'scale(1)' }}
                />
                
                {/* Unified Dark Gradient for Readability (Reduced for minimalism) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

                {/* --- SLIDE CONTENT MODES --- */}
                
                {/* MODE 1: CONTENT (Ultra-Minimal) */}
                {isActive && item.type === 'content' && (
                  <div className="absolute inset-x-0 bottom-12 p-8 flex flex-col items-center justify-end animate-in fade-in slide-in-from-bottom-8 duration-1000 text-center">
                    <span className="inline-block px-5 py-2 mb-5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-slate-200 text-xs font-medium tracking-widest uppercase shadow-lg">
                      {item.location}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-light text-white drop-shadow-2xl max-w-4xl tracking-wide">
                      {item.title}
                    </h2>
                  </div>
                )}

                {/* MODE 2: CHALLENGE */}
                {isActive && item.type === 'challenge' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-8 animate-in zoom-in-95 duration-700">
                    <div className="max-w-3xl w-full p-10 rounded-3xl bg-black/50 backdrop-blur-2xl border border-white/10 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#C74601]/20 border border-[#C74601]/50 text-[#C74601]">
                          <ListChecks size={20} />
                        </div>
                        <h3 className="text-xl font-bold tracking-widest uppercase text-[#C74601]">Knowledge Check</h3>
                      </div>
                      
                      <h4 className="text-3xl font-medium text-white mb-10 leading-tight drop-shadow-md">
                        {item.challengeQuestion}
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-4">
                        {item.options.map((option, idx) => {
                          const isSelected = selectedAnswer === idx;
                          const isCorrect = idx === item.correctAnswer;
                          
                          let btnStyle = "border-white/10 bg-white/5 hover:bg-white/10 text-slate-300";
                          if (isSelected && !isAnswerRevealed) btnStyle = `border-[${brandPrimary}] bg-[${brandPrimary}]/20 text-white shadow-[0_0_20px_rgba(199,70,1,0.2)]`;
                          else if (isAnswerRevealed) {
                            if (isCorrect) btnStyle = "border-emerald-500/50 bg-emerald-500/20 text-emerald-100";
                            else if (isSelected && !isCorrect) btnStyle = "border-red-500/50 bg-red-500/20 text-red-100";
                            else btnStyle = "border-white/5 bg-white/5 opacity-30 text-slate-500";
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => !isAnswerRevealed && setSelectedAnswer(idx)}
                              disabled={isAnswerRevealed}
                              className={`text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-5 ${btnStyle}`}
                            >
                              <div className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors
                                ${isSelected && !isAnswerRevealed ? `border-[${brandPrimary}]` : 'border-white/20'}
                                ${isAnswerRevealed && isCorrect ? 'border-emerald-400 bg-emerald-500/20' : ''}
                                ${isAnswerRevealed && isSelected && !isCorrect ? 'border-red-400 bg-red-500/20' : ''}
                              `}
                              style={isSelected && !isAnswerRevealed ? { borderColor: brandPrimary } : {}}
                              >
                                {isSelected && !isAnswerRevealed && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandPrimary }} />}
                                {isAnswerRevealed && isCorrect && <CheckCircle2 size={16} className="text-emerald-400" />}
                              </div>
                              <span className="text-lg font-light">{option}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-10 flex justify-end">
                        <button
                          onClick={submitChallenge}
                          disabled={selectedAnswer === null || isAnswerRevealed}
                          className={`px-10 py-4 rounded-full font-bold tracking-wide transition-all duration-300 
                            ${selectedAnswer === null || isAnswerRevealed 
                              ? 'bg-white/5 text-slate-500 cursor-not-allowed' 
                              : 'text-white hover:scale-105 shadow-[0_0_30px_rgba(199,70,1,0.4)]'}`}
                          style={selectedAnswer !== null && !isAnswerRevealed ? { backgroundColor: brandPrimary } : {}}
                        >
                          {isAnswerRevealed 
                            ? (selectedAnswer === item.correctAnswer ? 'Correct - Proceed' : 'Incorrect - Proceed') 
                            : 'Submit Answer'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODE 3: DEBRIEF */}
                {isActive && item.type === 'debrief' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-8 animate-in zoom-in-95 duration-700">
                    <div className="max-w-3xl w-full p-12 rounded-3xl bg-black/50 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/20 border border-emerald-500/50 text-emerald-400">
                          <Info size={24} />
                        </div>
                        <h3 className="text-2xl font-bold tracking-widest uppercase text-emerald-400">Operational Debrief</h3>
                      </div>
                      
                      <p className="text-2xl md:text-3xl text-white font-light leading-relaxed mb-12">
                        {item.debriefText}
                      </p>

                      <div className="flex justify-end">
                        <button
                          onClick={handleNext}
                          className="px-10 py-4 rounded-full font-bold tracking-wide transition-all duration-300 bg-white text-black hover:bg-slate-200 hover:scale-105 shadow-xl"
                        >
                          Continue Journey
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          );
        })}
      </main>

      {/* Minimalist Floating Play/Pause Button (Bottom Center) */}
      <footer className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 shadow-[0_10px_40px_rgba(199,70,1,0.5)] border border-white/10 backdrop-blur-xl"
          style={{ backgroundColor: `${brandPrimary}E6` }} // E6 is 90% opacity
        >
          {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1.5" />}
        </button>
      </footer>
      
    </div>
  );
}