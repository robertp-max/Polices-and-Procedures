import { useState } from 'react';
import type { SceneProps } from './gao001-shared';
import { CheckCircle2, Map, Award, Check } from 'lucide-react';

interface Props extends SceneProps {
  onReadyForPostTest?: () => void;
}

export default function Scene09ReadinessMap({ onReadyForPostTest, onComplete, isCompleted }: Props) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const journeyPoints = [
    { label: 'Welcome Desk', completed: true },
    { label: 'Mission & Vision', completed: true },
    { label: 'Core Values', completed: true },
    { label: 'Home Health Differences', completed: true },
    { label: 'Reporting & Escalation', completed: true },
    { label: 'Patient Rights', completed: true },
    { label: 'Boundaries', completed: true },
  ];

  const options = [
    {
      id: 'solo',
      text: 'Handle the situation alone in the home so the agency receives a complete story later.',
      isCorrect: false,
      feedback: 'GAO-001 does not reward solo investigation. The safe pattern is objective documentation and timely escalation.',
    },
    {
      id: 'ready',
      text: 'Stay within scope, respect patient rights, document objective facts, communicate changes, and escalate concerns through agency protocol.',
      isCorrect: true,
      feedback: 'Correct. That is the GAO-001 through-line. You are ready for the Post-Test.',
    },
    {
      id: 'task-list',
      text: 'Focus on completing assigned tasks; values and reporting are secondary unless the patient complains.',
      isCorrect: false,
      feedback: 'Values, rights, reporting, and communication are part of the work. They are not optional extras.',
    },
  ];

  const handleSelect = (id: string) => {
    if (isCompleted && isCorrect) return;
    setSelectedOption(id);
    const option = options.find((o) => o.id === id);
    if (option) {
      setShowFeedback(true);
      setIsCorrect(option.isCorrect);
    }
  };

  const handleFinalComplete = () => {
    if (onReadyForPostTest) {
      onReadyForPostTest();
    } else {
      onComplete();
    }
  };

  return (
    <div className="w-full h-[680px] bg-[#FDF8F3] p-4 md:p-6 flex flex-col items-center justify-start overflow-hidden font-sans">
      
      {/* Top Banner */}
      <div className="w-full max-w-[1000px] mb-4 bg-white p-4 rounded-xl shadow-sm border border-[#E5E4E3] flex justify-between items-center z-10">
        <div>
          <h2 className="text-xl font-bold text-[#0F5B54]">Wrap-Up & Post-Test Prep</h2>
          <p className="text-sm text-[#475569] mt-1">
            Alex has navigated the first week. Now it's time to check readiness without the story scaffolding.
          </p>
        </div>
        {isCompleted && (
          <div className="flex items-center text-[#0F5B54] font-semibold">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Ready for Post-Test
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-[1000px] flex gap-6 z-10">
        
        {/* Left: Journey Map */}
        <div className="flex-[1] bg-white rounded-xl shadow-sm border border-[#E5E4E3] p-6 flex flex-col relative overflow-hidden">
          <div className="flex items-center mb-6 border-b pb-4">
            <Map className="text-[#0F5B54] mr-3" size={24} />
            <h3 className="font-bold text-[#1E3A3A] uppercase tracking-wide text-sm">Alex's GAO-001 Journey</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center px-4">
            {journeyPoints.map((point, idx) => (
              <div key={idx} className="relative flex items-center mb-4 last:mb-0">
                {idx < journeyPoints.length - 1 && (
                  <div className="absolute left-3 top-6 bottom-[-16px] w-0.5 bg-[#0F5B54]/20 z-0"></div>
                )}
                <div className="w-6 h-6 rounded-full bg-[#0F5B54] text-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                  <Check size={12} />
                </div>
                <div className="ml-3 text-sm font-medium text-[#1E3A3A]">{point.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] text-xs text-[#475569] text-center">
            <Award className="w-6 h-6 mx-auto mb-2 text-[#D89E39]" />
            <p className="font-semibold text-[#1E3A3A]">Post-test readiness</p>
            <p>The learner is ready when they can choose the safe field behavior without needing a visual scene to prompt it.</p>
          </div>
        </div>

        {/* Right: Final Readiness Check */}
        <div className="flex-[1.5] bg-white rounded-xl shadow-sm border border-[#E5E4E3] p-6 flex flex-col relative overflow-hidden">
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-[#0F5B54]/10 border-l-4 border-[#0F5B54] p-5 rounded-r-lg mb-6 shadow-sm">
              <p className="text-[#1E3A3A] font-semibold text-[15px] leading-relaxed">
                Before the post-test, Dana asks Alex to summarize the safest approach to a difficult home visit.
              </p>
            </div>

            <p className="text-[#475569] mb-4 font-medium">Which summary shows readiness?</p>

            <div className="space-y-3 flex-1">
              {options.map((option) => {
                const isSelected = selectedOption === option.id;
                let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ";
                
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

            {/* Final Action / Feedback */}
            {showFeedback && (
              <div className="mt-4 flex flex-col items-center animate-in slide-in-from-bottom-4">
                {isCorrect ? (
                  <div className="w-full text-center">
                    <p className="text-[#0F5B54] font-bold mb-4">{options.find(o => o.id === selectedOption)?.feedback}</p>
                    {!isCompleted && (
                      <button 
                        onClick={handleFinalComplete}
                        className="w-full bg-[#0F5B54] hover:bg-[#0A423D] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md flex items-center justify-center text-lg"
                      >
                        Start Post-Test <CheckCircle2 className="ml-2" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-full p-4 rounded-lg bg-[#E74C3C]/10 text-[#C0392B] border border-[#E74C3C]/20">
                    <p className="font-bold text-sm mb-1">Incorrect</p>
                    <p className="text-sm">{options.find(o => o.id === selectedOption)?.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
