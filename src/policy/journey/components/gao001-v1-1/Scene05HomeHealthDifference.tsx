import { useState } from 'react';
import type { SceneProps } from './gao001-shared';
import { CheckCircle2, Building, Home, ArrowRight, AlertCircle, Check, ChevronRight } from 'lucide-react';

export default function Scene05HomeHealthDifference({ onComplete, isCompleted }: SceneProps) {
  const [viewedDifferences, setViewedDifferences] = useState<Set<number>>(new Set());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const differences = [
    { 
      topic: 'Environment', 
      facility: 'Controlled, standardized clinical setting.', 
      home: "Patient's personal space. Varied and often uncontrolled." 
    },
    { 
      topic: 'Team Support', 
      facility: 'Immediate clinical backup down the hall.', 
      home: 'High autonomy. Relies on strong communication and proactive escalation.' 
    },
    { 
      topic: 'Boundaries', 
      facility: 'Clear institutional rules dictate the space.', 
      home: 'Clinicians must actively bring professional boundaries into a private setting.' 
    }
  ];

  const options = [
    {
      id: 'skip',
      text: "Skip the assessment to respect the family's schedule.",
      isCorrect: false,
      feedback: 'Respect for the home does not mean skipping ordered care. Alex should explain the need, adapt respectfully, and escalate if care cannot be completed.',
    },
    {
      id: 'adapt',
      text: 'Respect the home, explain the ordered care, complete what can be safely completed, and document any barriers.',
      isCorrect: true,
      feedback: 'Correct. Home health requires flexibility without losing the care standard or ignoring the plan of care.',
    },
    {
      id: 'argue',
      text: 'Tell the family the visit will be reported as noncompliant if they do not cooperate.',
      isCorrect: false,
      feedback: 'That escalates the tone unnecessarily. Educate, document objective facts, and use the agency chain when there is a care barrier.',
    },
  ];

  const handleReveal = (index: number) => {
    setViewedDifferences(prev => new Set(prev).add(index));
  };

  const allDifferencesViewed = viewedDifferences.size === differences.length;

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
          <h2 className="text-xl font-bold text-[#0F5B54]">Home Health Differences</h2>
          <p className="text-sm text-[#475569] mt-1">
            Alex already knows clinical care. What changes in home health is the setting.
          </p>
        </div>
        {isCompleted && (
          <div className="flex items-center text-[#0F5B54] font-semibold">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Differences Understood
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-[1000px] flex gap-6 z-10">
        
        {/* Left: Compare/Contrast */}
        <div className="flex-[1.2] bg-white rounded-xl shadow-sm border border-[#E5E4E3] p-6 flex flex-col">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Building size={24} className="text-gray-500" />
              </div>
              <h3 className="font-bold text-[#1E3A3A]">Facility Care</h3>
            </div>
            <div className="flex items-center text-gray-300">
              <ArrowRight size={24} />
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-[#0F5B54]/10 rounded-full flex items-center justify-center mb-2">
                <Home size={24} className="text-[#0F5B54]" />
              </div>
              <h3 className="font-bold text-[#0F5B54]">Home Health</h3>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {differences.map((diff, idx) => {
              const isRevealed = viewedDifferences.has(idx);
              return (
                <div key={idx} className="relative bg-gray-50 rounded-lg p-1 border border-gray-100">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider rounded-full border border-gray-100">
                    {diff.topic}
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mt-2 px-3 pb-3">
                    <div className="text-sm text-gray-500 text-right py-2 leading-snug">
                      {diff.facility}
                    </div>
                    <div className="flex items-center justify-center w-8">
                      {!isRevealed ? (
                        <button 
                          onClick={() => handleReveal(idx)}
                          className="w-8 h-8 rounded-full bg-[#D89E39] text-white flex items-center justify-center shadow-sm hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D89E39]"
                        >
                          <ChevronRight size={16} />
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#0F5B54] text-white flex items-center justify-center animate-in zoom-in">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                    <div className="text-sm py-2 leading-snug font-medium">
                      {isRevealed ? (
                        <span className="text-[#0F5B54] animate-in fade-in duration-300">{diff.home}</span>
                      ) : (
                        <span className="text-gray-300 blur-[2px] select-none">Tap to reveal home health reality</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interaction Panel (Unlocks after viewing all differences) */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E5E4E3] flex flex-col relative overflow-hidden">
          {!allDifferencesViewed ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#94A3B8]">
              <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
                <Home size={32} className="text-[#CBD5E1]" />
              </div>
              <p className="font-medium text-[#475569]">Reveal all differences to unlock the field scenario.</p>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col overflow-y-auto animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-[#0F5B54]/10 border-l-4 border-[#0F5B54] p-4 rounded-r-lg mb-6">
                <p className="text-[#1E3A3A] font-semibold text-[15px] leading-relaxed">
                  During a visit, the home environment is cluttered and the caregiver asks Alex to skip part of the ordered assessment because the family is busy.
                </p>
              </div>

              <p className="text-[#475569] mb-4 font-medium">What is the best home health response?</p>

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
