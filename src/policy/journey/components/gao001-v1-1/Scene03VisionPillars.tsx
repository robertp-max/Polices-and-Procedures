import { useState } from 'react';
import type { SceneProps } from './gao001-shared';
import { CheckCircle2, Shield, Users, ArrowUpRight, AlertCircle } from 'lucide-react';

export default function Scene03VisionPillars({ onComplete, isCompleted }: SceneProps) {
  const [viewedPillars, setViewedPillars] = useState<Set<string>>(new Set());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const pillars = [
    { 
      id: 'care', 
      title: 'Excellent Care', 
      icon: Shield, 
      text: 'Vision pillars are decision filters, not decorative statements. They guide what we accept as good care.' 
    },
    { 
      id: 'partner', 
      title: 'Trusted Partner', 
      icon: Users, 
      text: 'A trusted partner communicates early when care facts change, protecting the team and the patient.' 
    },
    { 
      id: 'improve', 
      title: 'Continuous Improvement', 
      icon: ArrowUpRight, 
      text: 'Starts with noticing gaps and closing the loop, rather than assuming someone else will fix it.' 
    }
  ];

  const options = [
    {
      id: 'ignore',
      text: "Ignore the mismatch because Alex is responsible only for today's visit.",
      isCorrect: false,
      feedback: 'That misses the trusted-partner behavior. A mismatch can affect safety, plan-of-care decisions, and team coordination.',
    },
    {
      id: 'coordinate',
      text: "Document today's observation and communicate with the appropriate team member to clarify the discrepancy.",
      isCorrect: true,
      feedback: 'Correct. The vision becomes real when Alex notices, documents, and coordinates instead of leaving the next person to guess.',
    },
    {
      id: 'rewrite',
      text: 'Change the prior note so the chart looks consistent.',
      isCorrect: false,
      feedback: "Never alter another clinician's record to make the chart look cleaner. Clarify through the team and document truthfully.",
    },
  ];

  const handlePillarClick = (id: string) => {
    setViewedPillars(prev => new Set(prev).add(id));
  };

  const allPillarsViewed = viewedPillars.size === pillars.length;

  const handleSelect = (id: string) => {
    if (isCompleted && isCorrect) return;
    setSelectedOption(id);
    const option = options.find((o) => o.id === id);
    if (option) {
      setShowFeedback(true);
      setIsCorrect(option.isCorrect);
      if (option.isCorrect && !isCompleted) {
        onComplete();
      }
    }
  };

  return (
    <div className="w-full h-[680px] bg-[#FDF8F3] p-4 md:p-6 flex flex-col items-center justify-start overflow-hidden font-sans">
      
      {/* Top Banner */}
      <div className="w-full max-w-[1000px] mb-4 bg-white p-4 rounded-xl shadow-sm border border-[#E5E4E3] flex justify-between items-center z-10">
        <div>
          <h2 className="text-xl font-bold text-[#0F5B54]">Vision Pillars</h2>
          <p className="text-sm text-[#475569] mt-1">
            Tap each pillar to reveal how it translates to field behavior ({viewedPillars.size}/{pillars.length} viewed).
          </p>
        </div>
        {isCompleted && (
          <div className="flex items-center text-[#0F5B54] font-semibold">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Vision Applied
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-[1000px] flex gap-6 z-10">
        
        {/* Left: The 3 Pillars */}
        <div className="flex-[1.2] bg-white rounded-xl shadow-sm border border-[#E5E4E3] relative overflow-hidden p-6 flex flex-col justify-center">
          
          <div className="flex justify-between items-end h-[300px] gap-4 mb-8 px-8">
            {pillars.map((pillar) => {
              const isViewed = viewedPillars.has(pillar.id);
              const Icon = pillar.icon;
              return (
                <div key={pillar.id} className="relative flex flex-col items-center group w-1/3">
                  {/* Pillar Graphic */}
                  <button 
                    onClick={() => handlePillarClick(pillar.id)}
                    className="w-full relative transition-transform duration-300 transform group-hover:-translate-y-2 focus:outline-none"
                  >
                    {/* SVG Pillar */}
                    <svg viewBox="0 0 100 200" className={`w-full drop-shadow-md transition-all duration-300 ${isViewed ? 'opacity-100' : 'opacity-80'}`}>
                      {/* Base */}
                      <rect x="10" y="180" width="80" height="20" fill="#E5E4E3" rx="2" />
                      <rect x="20" y="170" width="60" height="10" fill="#D1D5DB" />
                      {/* Shaft */}
                      <rect x="30" y="30" width="40" height="140" fill={isViewed ? '#0F5B54' : '#94A3B8'} className="transition-colors duration-500"/>
                      <rect x="35" y="30" width="5" height="140" fill="#FFFFFF" opacity="0.15" />
                      <rect x="50" y="30" width="5" height="140" fill="#000000" opacity="0.15" />
                      {/* Capital/Top */}
                      <rect x="20" y="20" width="60" height="10" fill="#D1D5DB" />
                      <rect x="10" y="0" width="80" height="20" fill="#E5E4E3" rx="2" />
                      {/* Status dot */}
                      {isViewed && (
                        <circle cx="50" cy="100" r="12" fill="#FFFFFF" opacity="0.2" />
                      )}
                    </svg>
                    
                    {/* Floating Icon */}
                    <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 ${isViewed ? 'bg-[#0F5B54] text-white' : 'bg-white text-[#94A3B8] border-2 border-[#E5E4E3]'}`}>
                      <Icon size={20} />
                    </div>
                  </button>

                  {/* Title */}
                  <div className={`mt-4 text-center font-bold text-sm ${isViewed ? 'text-[#1E3A3A]' : 'text-[#94A3B8]'}`}>
                    {pillar.title}
                  </div>
                  
                  {/* Revealed Text Tooltip style */}
                  <div className={`absolute top-[220px] w-[180%] bg-[#F8FAFC] p-3 rounded shadow text-xs text-[#475569] text-center transition-all duration-300 z-20 border border-[#E2E8F0] ${isViewed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {pillar.text}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right: Interaction Panel (Unlocks after viewing all pillars) */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E5E4E3] flex flex-col relative overflow-hidden">
          {!allPillarsViewed ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#94A3B8]">
              <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
                <Shield size={32} className="text-[#CBD5E1]" />
              </div>
              <p className="font-medium text-[#475569]">Tap all 3 pillars to unlock the field scenario.</p>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col overflow-y-auto animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-[#0F5B54]/10 border-l-4 border-[#0F5B54] p-4 rounded-r-lg mb-6">
                <p className="text-[#1E3A3A] font-semibold text-[15px] leading-relaxed">
                  Alex notices that yesterday's note and today's observation do not match. The patient seems more mobile than the prior note described.
                </p>
              </div>

              <p className="text-[#475569] mb-4 font-medium">Applying the Vision Pillars, what should Alex do?</p>

              <div className="space-y-3 flex-1">
                {options.map((option) => {
                  const isSelected = selectedOption === option.id;
                  let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ";
                  
                  if (isSelected) {
                    if (option.isCorrect) {
                      btnClass += "border-[#0F5B54] bg-[#0F5B54]/5";
                    } else {
                      btnClass += "border-[#E74C3C] bg-[#E74C3C]/5";
                    }
                  } else {
                    btnClass += "border-[#E5E4E3] hover:border-[#90A4AE] hover:bg-gray-50";
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      className={btnClass}
                      disabled={isCompleted && isCorrect && !isSelected}
                    >
                      <div className="flex items-start">
                        <div className={`shrink-0 w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center mt-0.5
                          ${isSelected ? (option.isCorrect ? 'border-[#0F5B54] bg-[#0F5B54]' : 'border-[#E74C3C] bg-[#E74C3C]') : 'border-[#94A3B8]'}
                        `}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-[#1E3A3A] font-medium' : 'text-[#475569]'}`}>
                          {option.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Area */}
              {showFeedback && selectedOption && (
                <div className={`mt-6 p-4 rounded-lg animate-in slide-in-from-bottom-4 fade-in ${
                  isCorrect ? 'bg-[#0F5B54]/10 text-[#0F5B54]' : 'bg-[#E74C3C]/10 text-[#C0392B]'
                }`}>
                  <div className="flex items-start">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold text-sm mb-1">{isCorrect ? 'Correct' : 'Not quite'}</p>
                      <p className="text-sm">
                        {options.find(o => o.id === selectedOption)?.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
