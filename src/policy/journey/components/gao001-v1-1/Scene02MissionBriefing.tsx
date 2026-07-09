import { useState } from 'react';
import type { SceneProps } from './gao001-shared';
import { CheckCircle2, AlertCircle, Target } from 'lucide-react';

export default function Scene02MissionBriefing({ onComplete, isCompleted }: SceneProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const options = [
    {
      id: 'task-only',
      text: 'Finish the assigned tasks quickly so the schedule stays on time.',
      isCorrect: false,
      feedback: 'Efficiency matters, but the mission is broader than speed. The visit must still protect the patient, support goals, and meet care standards.',
    },
    {
      id: 'patient-centered',
      text: 'Connect ordered care to patient safety, dignity, independence, and clear documentation.',
      isCorrect: true,
      feedback: 'Correct. Mission-aligned care is practical, documented, and centered on the patient.',
    },
    {
      id: 'family-promises',
      text: 'Do whatever the family requests so they feel fully supported.',
      isCorrect: false,
      feedback: 'Family support matters, but staff must stay within the plan of care, scope, and agency protocol.',
    },
  ];

  const handleSelect = (id: string) => {
    if (isCompleted && isCorrect) return; // don't change if already completed correctly
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
          <h2 className="text-xl font-bold text-[#0F5B54]">Mission Briefing</h2>
          <p className="text-sm text-[#475569] mt-1">
            Dana frames the mission in practical terms for the field.
          </p>
        </div>
        {isCompleted && (
          <div className="flex items-center text-[#0F5B54] font-semibold">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Mission Understood
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-[1000px] flex gap-6 z-10">
        
        {/* Left: Mission Board SVG */}
        <div className="flex-[1.2] bg-[#EADCC7] rounded-xl shadow-inner border-[8px] border-[#8D6E63] relative overflow-hidden flex flex-col items-center justify-center p-6">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#5C3A21 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>
          
          {/* Corkboard Paper 1 */}
          <div className="relative bg-[#FDF8F3] w-[80%] max-w-[400px] p-6 rounded shadow-md transform -rotate-2 mb-6">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#E74C3C] shadow-sm"></div>
            <div className="flex items-center justify-center mb-4 text-[#0F5B54]">
              <Target size={32} />
            </div>
            <h3 className="text-center font-bold text-xl text-[#1E3A3A] mb-2 uppercase tracking-wider">Our Mission</h3>
            <p className="text-center text-[#475569] italic">
              "To provide exceptional, patient-centered care in the home, protecting dignity and supporting independence."
            </p>
          </div>

          {/* Corkboard Paper 2 */}
          <div className="relative bg-[#FFF9C4] w-[70%] max-w-[350px] p-4 rounded shadow-md transform rotate-3">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#3498DB] shadow-sm"></div>
            <h4 className="font-bold text-[#1E3A3A] mb-2 text-sm">Field Translation:</h4>
            <ul className="text-sm text-[#475569] space-y-2">
              <li className="flex items-start"><CheckCircle2 size={16} className="mr-2 text-[#0F5B54] shrink-0 mt-0.5"/> Reliable, ordered care</li>
              <li className="flex items-start"><CheckCircle2 size={16} className="mr-2 text-[#0F5B54] shrink-0 mt-0.5"/> Clear documentation</li>
              <li className="flex items-start"><CheckCircle2 size={16} className="mr-2 text-[#0F5B54] shrink-0 mt-0.5"/> Compassion with boundaries</li>
            </ul>
          </div>
        </div>

        {/* Right: Interaction Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E5E4E3] p-6 flex flex-col relative overflow-y-auto">
          <div className="bg-[#0F5B54]/10 border-l-4 border-[#0F5B54] p-4 rounded-r-lg mb-6">
            <p className="text-[#1E3A3A] font-semibold text-lg">
              "Alex, what does our mission actually change about a routine skilled visit?"
            </p>
            <p className="text-sm text-[#0F5B54] mt-2 font-medium">— Dana, Supervisor</p>
          </div>

          <p className="text-[#475569] mb-4 font-medium">Which answer best reflects the mission in the field?</p>

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
      </div>
    </div>
  );
}
