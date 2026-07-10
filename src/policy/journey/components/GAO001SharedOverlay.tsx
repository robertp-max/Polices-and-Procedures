import React, { useState, useEffect } from 'react';
import { Check, HelpCircle, X, FileCheck, ArrowRight, ShieldCheck } from 'lucide-react';
import SceneNarrationPlayer from './SceneNarrationPlayer';

export interface HotspotQuestionChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

export interface HotspotQuestion {
  prompt: string;
  choices: HotspotQuestionChoice[];
}

export interface HotspotNarration {
  src: string;
  transcript: string;
}

export interface Hotspot {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  label: string;
  fieldNotes: {
    title: string;
    content: React.ReactNode;
  };
  /** Optional field-notes / overlay narration (manual play). */
  narration?: HotspotNarration;
  question?: HotspotQuestion;
  tooltipPos?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface SceneNarrationConfig {
  src: string;
  transcript: string;
  labels?: {
    listen?: string;
    pause?: string;
    replay?: string;
    transcript?: string;
    mute?: string;
    unmute?: string;
    audioUnavailable?: string;
  };
}

interface GAO001SharedOverlayProps {
  imageSrc: string;
  altText: string;
  objective: string;
  hotspots: Hotspot[];
  narration?: SceneNarrationConfig;
  onComplete?: () => void;
  linear?: boolean;
}

const SHARED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Roboto:wght@300;400;500;700&display=swap');
  .font-montserrat { font-family: 'Montserrat', sans-serif; }
  .font-roboto { font-family: 'Roboto', sans-serif; }

  /* Smooth fade up for the whole scene */
  @keyframes sceneReveal {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-scene {
    animation: sceneReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  /* Continuous Sonar Pulse for Hotspots */
  @keyframes sonarPulse {
    0% { box-shadow: 0 0 0 0 rgba(240, 105, 35, 0.7); }
    70% { box-shadow: 0 0 0 15px rgba(240, 105, 35, 0); }
    100% { box-shadow: 0 0 0 0 rgba(240, 105, 35, 0); }
  }
  .animate-sonar-orange {
    animation: sonarPulse 2.5s infinite cubic-bezier(0.66, 0, 0, 1);
  }

  @keyframes sonarPulseTeal {
    0% { box-shadow: 0 0 0 0 rgba(0, 121, 112, 0.6); }
    70% { box-shadow: 0 0 0 15px rgba(0, 121, 112, 0); }
    100% { box-shadow: 0 0 0 0 rgba(0, 121, 112, 0); }
  }
  .animate-sonar-teal {
    animation: sonarPulseTeal 2.5s infinite cubic-bezier(0.66, 0, 0, 1);
  }

  /* Tooltip Spring Animation */
  @keyframes tooltipSpring {
    0% { opacity: 0; transform: scale(0.8) translateY(10px); }
    60% { opacity: 1; transform: scale(1.05) translateY(-2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  .animate-tooltip {
    animation: tooltipSpring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  /* Modal Spring Entrance */
  @keyframes modalSpring {
    0% { opacity: 0; transform: scale(0.9) translateY(20px); }
    60% { opacity: 1; transform: scale(1.02) translateY(-5px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  .animate-modal-spring {
    animation: modalSpring 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }

  /* Staggered Item Slide-In */
  @keyframes slideInRight {
    0% { opacity: 0; transform: translateX(-20px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  .animate-slide-item {
    opacity: 0;
    animation: slideInRight 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }

  /* Pop Animation for Radio Button */
  @keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    70% { transform: scale(1.2); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-pop {
    animation: popIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  }

  /* Continuous Premium Shimmer for CTA */
  @keyframes shimmerGlow {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .animate-shimmer {
    background-size: 200% auto;
    background-image: linear-gradient(90deg, #F06923 0%, #ff8c4a 25%, #F06923 50%);
    animation: shimmerGlow 3s linear infinite;
  }

  .animate-bounce-soft {
    animation: bounceSoft 2s infinite ease-in-out;
  }
  @keyframes bounceSoft {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

export default function GAO001SharedOverlay({
  imageSrc,
  altText,
  objective,
  hotspots,
  onComplete,
  linear = false,
}: GAO001SharedOverlayProps) {
  const [completedNodeIds, setCompletedNodeIds] = useState<Set<string>>(new Set());
  const [revealedNodeIds, setRevealedNodeIds] = useState<Set<string>>(new Set());
  const [activeModalNodeId, setActiveModalNodeId] = useState<string | null>(null);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showCompleteBanner, setShowCompleteBanner] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!document.getElementById('gao001-shared-styles')) {
      const style = document.createElement('style');
      style.id = 'gao001-shared-styles';
      style.innerHTML = SHARED_STYLES;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (hotspots.length > 0 && completedNodeIds.size === hotspots.length && !showCompleteBanner) {
      setShowCompleteBanner(true);
      if (onComplete) {
        onComplete();
      }
    }
  }, [completedNodeIds, hotspots.length, showCompleteBanner, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModalNodeId) {
        // Prevent closing if submitting
        if (!isSubmitting && !showSuccessScreen) {
            setActiveModalNodeId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalNodeId, isSubmitting, showSuccessScreen]);

  const handleHotspotClick = (h: Hotspot, index: number) => {
    if (linear) {
      const expectedIndex = completedNodeIds.size;
      if (index > expectedIndex) {
        setErrorMsg('Start with the highlighted item first.');
        setTimeout(() => setErrorMsg(null), 3000);
        return;
      }
    }
    setActiveModalNodeId(h.id);
    setSelectedChoiceId(null);
    setShowSuccessScreen(false);
  };

  const closeDrawer = () => {
    setActiveModalNodeId(null);
    setSelectedChoiceId(null);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessScreen(true);
    }, 1200);
  };

  const closeSuccessScreen = () => {
    if (activeModalNodeId) {
      setCompletedNodeIds(prev => new Set(prev).add(activeModalNodeId));
      setRevealedNodeIds(prev => new Set(prev).add(activeModalNodeId));
    }
    setShowSuccessScreen(false);
    setActiveModalNodeId(null);
    setSelectedChoiceId(null);
  };

  const activeHotspot = activeModalNodeId ? hotspots.find(h => h.id === activeModalNodeId) : null;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-black font-sans">

      {/* Stage fills player 16:13 bounds. Image uses contain (no stretch). New art is ~16:13 so no bars. */}
      <div
        className={`relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden ${mounted ? 'animate-scene' : 'opacity-0'}`}
        style={{ containerType: 'size' }}
      >
        <div
          className="relative overflow-hidden"
          style={{
            width: 'min(100cqw, calc(100cqh * 16 / 13))',
            height: 'min(100cqh, calc(100cqw * 13 / 16))',
            aspectRatio: '16 / 13',
          }}
        >
          <img
            src={imageSrc}
            alt={altText}
            className="pointer-events-none absolute inset-0 z-0 block h-full w-full object-contain object-center"
            draggable={false}
          />

          {/* Hotspot / UI layer: same bounds as the image stage */}
          <div className="absolute inset-0 z-10">

        {/* ---------------- UI OVERLAYS ---------------- */}

        {/* Top Objective Pill */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/95 backdrop-blur-md px-8 py-3.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/50 flex flex-col items-center">
            <span className="text-[#F06923] font-montserrat font-bold text-[10px] uppercase tracking-widest mb-1">
              Current Objective
            </span>
            <span className="text-[#007970] font-roboto font-bold text-sm">
              {objective}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-red-100 text-red-800 px-4 py-2 rounded-md font-medium text-sm border border-red-200 shadow-sm animate-pulse">
            {errorMsg}
          </div>
        )}



        {/* ---------------- INTERACTIVE HOTSPOTS ---------------- */}
        {hotspots.map((spot, index) => {
          const isComplete = completedNodeIds.has(spot.id);
          const isRevealed = revealedNodeIds.has(spot.id);
          const isPendingLinear = linear && index > completedNodeIds.size;

          // Styling logic based on state
          const colorClass = isComplete ? 'bg-[#007970]' : (isPendingLinear ? 'bg-[#A0A0A0]' : 'bg-[#F06923]');
          const pulseClass = (activeModalNodeId || isPendingLinear) ? '' : (isComplete ? 'animate-sonar-teal' : 'animate-sonar-orange');
          const tooltipPos = spot.tooltipPos || 'bottom-right';

          return (
            <div
              key={spot.id}
              className="absolute z-30"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              {/* The Marker */}
              <button
                onClick={() => handleHotspotClick(spot, index)}
                className={`relative w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center text-white shadow-lg transition-transform duration-300 hover:scale-110 z-40 ${colorClass} ${pulseClass}`}
              >
                {isComplete
                  ? <Check size={24} strokeWidth={3} />
                  : <HelpCircle size={24} strokeWidth={2.5} />
                }
              </button>

              {/* The Revealed Tooltip (Shows after complete instead of old floating label) */}
              {isRevealed && !activeModalNodeId && (
                <div
                  className={`absolute z-30 animate-tooltip w-[280px] pointer-events-none ${
                    tooltipPos === 'bottom-right' ? 'top-8 left-8' :
                    tooltipPos === 'bottom-left' ? 'top-8 right-8' :
                    tooltipPos === 'top-left' ? 'bottom-8 right-8' :
                    'bottom-8 left-8' // top-right
                  }`}
                >
                  <div className="bg-white rounded-[20px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-[#E5E4E3] relative">
                    <div className={`absolute w-4 h-4 bg-white border-[#E5E4E3] transform rotate-45 ${
                      tooltipPos === 'bottom-right' ? '-top-2 -left-2 border-l border-t' :
                      tooltipPos === 'bottom-left' ? '-top-2 -right-2 border-r border-t' :
                      tooltipPos === 'top-left' ? '-bottom-2 -right-2 border-r border-b' :
                      '-bottom-2 -left-2 border-l border-b' // top-right
                    }`}></div>

                    <div className="relative z-10">
                      <h4 className={`font-montserrat font-bold text-[11px] uppercase tracking-widest mb-2 pr-4 text-[#007970]`}>
                        {spot.fieldNotes.title}
                      </h4>
                      <div className="text-sm text-[#52404B] font-roboto leading-relaxed">
                        {spot.fieldNotes.content}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
          </div> {/* End hotspot / UI layer */}
        </div> {/* End image-aspect stage */}

        {/* ---------------- THE NEW MODAL LAYER ---------------- */}
        {activeHotspot && (
            <div className={`fixed inset-0 bg-[#1F1C1B]/50 backdrop-blur-md transition-opacity duration-700 flex items-center justify-center p-4 md:p-6 z-50 opacity-100`}>

                {/* Success Screen */}
                {showSuccessScreen ? (
                    <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-[#E5E4E3] py-20 flex flex-col items-center justify-center animate-modal-spring">
                        <div className="w-20 h-20 bg-[#E5F4EE] rounded-full flex items-center justify-center mb-6 animate-bounce-soft">
                            <ShieldCheck size={40} className="text-[#008540]" />
                        </div>
                        <h2 className="text-2xl font-montserrat font-bold text-[#007970] mb-8">Training Point Recorded</h2>
                        <button
                            onClick={closeSuccessScreen}
                            className="bg-white border-2 border-[#007970] text-[#007970] hover:bg-[#E5FEFF] px-8 py-3.5 rounded-xl font-montserrat font-bold text-sm tracking-widest uppercase transition-all shadow-sm hover:-translate-y-0.5"
                        >
                            Return to Scene
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 relative px-4 md:px-8 max-h-[100dvh] my-auto">
                        {/* Close Button placed outside cards for clear visibility */}
                        <button
                            onClick={closeDrawer}
                            className="absolute -top-12 right-4 lg:right-8 xl:-right-4 text-white hover:text-[#F06923] transition-colors duration-300 p-2 rounded-full bg-black/40 hover:bg-white shadow-sm z-[110]"
                        >
                            <X size={24} strokeWidth={2.5} />
                        </button>

                        {/* LEFT CARD: Field Notes */}
                        <div className="flex-1 bg-white rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-[#E5E4E3] overflow-hidden flex flex-col max-h-[85vh] animate-modal-spring">
                            {/* Card 1 Header */}
                            <div className="px-8 md:px-10 pt-10 pb-6 flex items-start gap-5 shrink-0 border-b border-[#E5E4E3]">
                                <div className="w-16 h-16 rounded-[20px] bg-[#E5FEFF] flex items-center justify-center shrink-0 border border-[#b2f5f7] shadow-[0_8px_16px_rgba(0,121,112,0.12)]">
                                    <FileCheck className="text-[#007970]" size={32} strokeWidth={2} />
                                </div>
                                <div className="pt-1.5">
                                    <span className="text-[#F06923] text-[10px] font-montserrat font-bold uppercase tracking-widest block mb-2">
                                        Field Observation Check
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-[#007970] tracking-tight leading-none">
                                        {activeHotspot.fieldNotes.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Card 1 Body */}
                            <div className="px-8 md:px-10 py-8 overflow-y-auto flex-1 space-y-8 bg-[#FAFAF7]">
                                <div className="bg-white rounded-[24px] p-6 md:p-8 border-l-[6px] border-[#007970] shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E5FEFF] to-transparent opacity-50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                                    <div className="text-lg md:text-xl text-[#52404B] font-roboto leading-relaxed italic z-10">
                                        {activeHotspot.fieldNotes.content}
                                    </div>
                                </div>

                                {activeHotspot.narration && (
                                    <SceneNarrationPlayer
                                        key={activeHotspot.id}
                                        src={activeHotspot.narration.src}
                                        transcript={activeHotspot.narration.transcript}
                                        pauseRequested={Boolean(selectedChoiceId) || showSuccessScreen || isSubmitting}
                                    />
                                )}
                            </div>
                        </div>

                        {/* RIGHT CARD: Knowledge Check */}
                        {activeHotspot.question && (
                            <div className="flex-1 bg-white rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.2)] border border-[#E5E4E3] overflow-hidden flex flex-col max-h-[85vh] animate-modal-spring" style={{ animationDelay: '100ms' }}>
                                {/* Card 2 Body */}
                                <div className="px-8 md:px-10 pt-10 pb-8 overflow-y-auto flex-1 flex flex-col space-y-6">
                                    <div>
                                        <p className="text-[14px] font-montserrat font-bold text-[#007970] tracking-widest uppercase mb-3">
                                            Knowledge Check
                                        </p>
                                        <p className="text-[18px] font-montserrat font-semibold text-[#52404B] leading-relaxed">
                                            {activeHotspot.question.prompt}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-4 mt-2">
                                        {activeHotspot.question.choices.map((option, index) => {
                                            const isSelected = selectedChoiceId === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => !isSubmitting && setSelectedChoiceId(option.id)}
                                                    style={{ animationDelay: `${index * 150}ms` }}
                                                    className={`animate-slide-item w-full text-left p-5 rounded-[20px] border-2 transition-all duration-300 flex items-start gap-5 group relative overflow-hidden ${
                                                        isSelected
                                                        ? 'bg-[#E5FEFF] border-[#007970] shadow-[0_8px_24px_rgba(0,121,112,0.15)] -translate-y-1'
                                                        : 'bg-[#FAFAF7] border-[#E5E4E3] hover:border-[#007970]/40 hover:bg-[#F7FEFF] hover:-translate-y-0.5 hover:shadow-sm'
                                                    }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-full border-2 mt-0.5 flex shrink-0 items-center justify-center transition-colors duration-300 ${
                                                        isSelected ? 'border-[#007970] bg-[#007970]' : 'border-[#D9D6D5] group-hover:border-[#007970]/50'
                                                    }`}>
                                                        {isSelected && <Check size={14} strokeWidth={3} className="text-white animate-pop" />}
                                                    </div>

                                                    <span className={`text-[15px] font-roboto leading-relaxed pt-0.5 transition-colors duration-300 ${
                                                        isSelected ? 'text-[#007970] font-medium' : 'text-[#747470] group-hover:text-[#52404B]'
                                                    }`}>
                                                        {option.text}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Feedback */}
                                    {selectedChoiceId && (
                                        <div className={`mt-2 p-5 rounded-[16px] text-[15px] font-roboto leading-relaxed border-l-4 animate-slide-item ${
                                            activeHotspot.question.choices.find(c => c.id === selectedChoiceId)?.isCorrect
                                            ? 'bg-[#E8F5E9] border-[#4CAF50] text-[#1B5E20]'
                                            : 'bg-[#FFF3E0] border-[#FF9800] text-[#E65100]'
                                        }`}>
                                            {activeHotspot.question.choices.find(c => c.id === selectedChoiceId)?.feedback}
                                        </div>
                                    )}
                                </div>

                                {/* Card 2 Footer */}
                                <div className="px-8 md:px-10 py-6 bg-[#FAFAF7] border-t border-[#E5E4E3] flex flex-col justify-center items-center shrink-0">
                                    <button
                                        disabled={!selectedChoiceId || isSubmitting}
                                        onClick={handleSubmit}
                                        className={`w-full py-4 rounded-[16px] font-montserrat font-bold text-[13px] tracking-widest uppercase transition-all duration-300 flex items-center justify-center group ${
                                        selectedChoiceId
                                            ? 'animate-shimmer text-white shadow-[0_8px_24px_rgba(240,105,35,0.3)] hover:shadow-[0_12px_32px_rgba(240,105,35,0.4)] hover:-translate-y-1'
                                            : 'bg-[#E5E4E3] text-[#A0A0A0] cursor-not-allowed'
                                        }`}
                                    >
                                        {isSubmitting ? (
                                        <span className="flex items-center gap-3">
                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            PROCESSING...
                                        </span>
                                        ) : (
                                        <span className="flex items-center gap-2">
                                            I UNDERSTAND THIS POINT
                                            {selectedChoiceId && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                        </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* Success State Overlay */}
        {hotspots.length > 0 && completedNodeIds.size === hotspots.length && !activeModalNodeId && showCompleteBanner && (
          <div className="absolute inset-0 bg-[#0F5B54]/80 backdrop-blur-md z-30 flex items-center justify-center animate-scene p-8 pointer-events-none">
             <div className="bg-white p-10 rounded-[32px] shadow-2xl border border-[#EEF4F3] text-center max-w-md flex flex-col items-center pointer-events-auto">
                <div className="w-24 h-24 bg-[#E5FEFF] rounded-[24px] border border-[#007970]/20 flex items-center justify-center mb-6 shadow-inner text-[#007970] transform rotate-12">
                  <ShieldCheck size={48} strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-montserrat font-bold text-[#007970] mb-3">Scene Practice Complete</h3>
                <p className="text-[#52404B] font-roboto text-base leading-relaxed mb-8">
                  You have successfully completed all observations in this environment.
                </p>
                <div className="flex items-center justify-center gap-2 text-white font-bold text-[12px] uppercase tracking-widest bg-[#F06923] px-6 py-4 rounded-xl w-full shadow-md animate-shimmer">
                  <Check size={20} strokeWidth={3} />
                  All Items Revealed
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Progress bar overlays the bottom edge — does not shrink the image stage */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1.5 w-full bg-[#E5E4E3]/70">
        <div
          className="h-full bg-[#007970] transition-all duration-500"
          style={{ width: `${hotspots.length ? (completedNodeIds.size / hotspots.length) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
