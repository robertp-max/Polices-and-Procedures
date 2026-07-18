import React, { useState, useEffect } from 'react';
import { Check, HelpCircle, X, FileCheck, ArrowRight, ShieldCheck, Volume2, CheckCircle2 } from 'lucide-react';
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
  fillPanel?: boolean;
  renderCustomModal?: (args: {
    hotspot: Hotspot;
    close: () => void;
    complete: () => void;
  }) => React.ReactNode | null;
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
  fillPanel = false,
  renderCustomModal,
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
  const [showIncorrectFeedback, setShowIncorrectFeedback] = useState(false);

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
    setShowIncorrectFeedback(false);
  };

  const closeDrawer = () => {
    setActiveModalNodeId(null);
    setSelectedChoiceId(null);
    setShowIncorrectFeedback(false);
  };

  const handleSubmit = () => {
    const selectedChoice = activeHotspot?.question?.choices.find((choice) => choice.id === selectedChoiceId);
    if (!selectedChoice) return;
    if (!selectedChoice.isCorrect) {
      setShowIncorrectFeedback(true);
      return;
    }
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
    setShowIncorrectFeedback(false);
  };

  const activeHotspot = activeModalNodeId ? hotspots.find(h => h.id === activeModalNodeId) : null;
  const completeActiveHotspot = () => {
    if (activeModalNodeId) {
      setCompletedNodeIds(prev => new Set(prev).add(activeModalNodeId));
      setRevealedNodeIds(prev => new Set(prev).add(activeModalNodeId));
    }
    setShowSuccessScreen(false);
    setActiveModalNodeId(null);
    setSelectedChoiceId(null);
    setShowIncorrectFeedback(false);
  };
  const customModal = activeHotspot
    ? renderCustomModal?.({
        hotspot: activeHotspot,
        close: closeDrawer,
        complete: completeActiveHotspot,
      }) ?? null
    : null;
  const selectedChoice = activeHotspot?.question?.choices.find((choice) => choice.id === selectedChoiceId);
  const selectedChoiceIsCorrect = Boolean(selectedChoice?.isCorrect);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white font-sans">

      {/* Stage fills either the original 16:13 scene bounds or the full right-side panel. */}
      <div
        className={`relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden ${mounted ? 'animate-scene' : 'opacity-0'}`}
        style={{ containerType: 'size' }}
      >
        <div
          className="relative overflow-hidden"
          style={
            fillPanel
              ? { width: '100%', height: '100%' }
              : {
                  width: 'min(100cqw, calc(100cqh * 16 / 13))',
                  height: 'min(100cqh, calc(100cqw * 13 / 16))',
                  aspectRatio: '16 / 13',
                }
          }
        >
          <img
            src={imageSrc}
            alt={altText}
            className={`pointer-events-none absolute inset-0 z-0 block h-full w-full object-center ${fillPanel ? 'object-cover' : 'object-contain'}`}
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
                aria-label={spot.label}
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
        {activeHotspot && (customModal ?? (
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
                    <div
                        className={`flex h-[min(550px,calc(100dvh-32px))] w-[min(900px,calc(100vw-32px))] overflow-hidden rounded-[1.5rem] bg-white shadow-[0_32px_90px_rgba(15,23,42,0.28)] animate-modal-spring ${
                          activeHotspot.question ? 'flex-col md:flex-row' : 'flex-col'
                        }`}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${activeHotspot.fieldNotes.title} knowledge check`}
                    >
                        <div className={`${activeHotspot.question ? 'md:w-[45%]' : 'w-full'} relative flex min-h-0 flex-col border-r border-[#E5E4E3] bg-[#F8FAFC] p-7 md:p-10`}>
                            <button
                                onClick={closeDrawer}
                                className="absolute left-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white text-[#747470] shadow-sm transition hover:text-[#1F1C1B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007970]"
                                aria-label="Close modal"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>

                            <div className="mt-10 flex items-center gap-3">
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#E5FEFF] text-[#007970]">
                                    <FileCheck size={24} strokeWidth={2} />
                                </div>
                                <div className="min-w-0">
                                    <div className="mb-1 text-[10px] font-montserrat font-bold uppercase tracking-widest text-[#C74601]">
                                        Observation Check
                                    </div>
                                    <h2 className="truncate text-[22px] font-montserrat font-bold leading-tight text-[#004142]">
                                        {activeHotspot.fieldNotes.title}
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-6 min-h-0 flex-1 overflow-y-auto rounded-xl border border-[#E5E4E3] bg-white p-5 shadow-sm">
                                <div className="font-roboto text-[15px] leading-relaxed text-[#524C4B]">
                                    {activeHotspot.fieldNotes.content}
                                </div>
                            </div>

                            <div className="mt-5 shrink-0 space-y-3">
                                {activeHotspot.narration ? (
                                    <SceneNarrationPlayer
                                        key={activeHotspot.id}
                                        src={activeHotspot.narration.src}
                                        transcript={activeHotspot.narration.transcript}
                                        pauseRequested={Boolean(selectedChoiceId) || showSuccessScreen || isSubmitting}
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 text-[12px] font-medium text-[#747470]">
                                        <div className="inline-flex items-center rounded-full bg-[#007970] px-4 py-2 text-white shadow-sm">
                                            <Volume2 size={15} className="mr-2" />
                                            Field note
                                        </div>
                                        <span>Review the note, then answer the check.</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {activeHotspot.question ? (
                            <div className="flex min-h-0 flex-1 flex-col bg-white p-7 md:w-[55%] md:p-10">
                                <div className="min-h-0 flex-1 overflow-y-auto">
                                    <div className="mb-5 text-[11px] font-montserrat font-bold uppercase tracking-widest text-[#007970]">
                                        Knowledge Check
                                    </div>
                                    <h3 className="mb-6 text-[19px] font-montserrat font-semibold leading-snug text-[#1F1C1B]">
                                        {activeHotspot.question.prompt}
                                    </h3>

                                    <div className="space-y-3">
                                        {activeHotspot.question.choices.map((option) => {
                                            const isSelected = selectedChoiceId === option.id;
                                            return (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSubmitting) return;
                                                        setSelectedChoiceId(option.id);
                                                        setShowIncorrectFeedback(false);
                                                    }}
                                                    className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                                                        isSelected
                                                          ? 'border-[#007970] bg-[#E5FEFF] shadow-sm'
                                                          : 'border-[#E5E4E3] bg-[#FAFBF8] hover:border-[#C4F4F5] hover:bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-start">
                                                        <div className={`mr-4 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                                            isSelected ? 'border-[#007970]' : 'border-[#C9C6C5]'
                                                        }`}>
                                                            {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-[#007970]" />}
                                                        </div>
                                                        <span className={`font-roboto text-[14.5px] leading-relaxed ${
                                                            isSelected ? 'font-medium text-[#004142]' : 'text-[#524C4B]'
                                                        }`}>
                                                            {option.text}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {(showIncorrectFeedback || selectedChoiceIsCorrect) && selectedChoice && (
                                        <div className={`mt-4 rounded-xl border px-4 py-3 font-roboto text-sm leading-relaxed ${
                                            selectedChoice.isCorrect
                                              ? 'border-[#8AD6C8] bg-[#E8F5F3] text-[#004142]'
                                              : 'border-[#F4C6AA] bg-[#FFF0E5] text-[#8A3A09]'
                                        }`}>
                                            <div className="mb-1 flex items-center gap-2 font-montserrat text-xs font-bold uppercase tracking-wider">
                                                {selectedChoice.isCorrect ? <CheckCircle2 size={15} /> : <HelpCircle size={15} />}
                                                {selectedChoice.isCorrect ? 'Correct' : 'Review and try again'}
                                            </div>
                                            {selectedChoice.feedback}
                                        </div>
                                    )}
                                </div>

                                <button
                                    disabled={!selectedChoiceId || isSubmitting}
                                    onClick={handleSubmit}
                                    className={`mt-6 flex w-full items-center justify-center rounded-xl py-4 font-montserrat text-[13px] font-bold uppercase tracking-widest transition-all ${
                                        selectedChoiceId
                                          ? 'bg-[#C74601] text-white shadow-[0_10px_24px_rgba(199,70,1,0.22)] hover:bg-[#A63A01]'
                                          : 'cursor-not-allowed bg-[#E5E4E3] text-[#A0A0A0]'
                                    }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-3">
                                            <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Recording...
                                        </span>
                                    ) : selectedChoiceIsCorrect ? (
                                        <span className="flex items-center gap-2">
                                            I understand this point
                                            <ArrowRight size={18} />
                                        </span>
                                    ) : (
                                        'Submit Answer'
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="border-t border-[#E5E4E3] bg-white p-6">
                                <button
                                    type="button"
                                    onClick={completeActiveHotspot}
                                    className="w-full rounded-xl bg-[#C74601] px-6 py-4 font-montserrat text-[13px] font-bold uppercase tracking-widest text-white shadow-[0_10px_24px_rgba(199,70,1,0.22)] hover:bg-[#A63A01]"
                                >
                                    I understand this point
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        ))}

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
