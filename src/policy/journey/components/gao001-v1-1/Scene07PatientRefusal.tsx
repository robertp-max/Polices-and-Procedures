import { useState } from 'react';
import type { SceneProps } from './gao001-shared';
import { CheckCircle2, UserX, AlertCircle, FileSignature, Check } from 'lucide-react';

export default function Scene07PatientRefusal({ onComplete, isCompleted }: SceneProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showError, setShowError] = useState(false);

  const sequence = [
    {
      id: 'step1',
      title: 'Initial Response',
      icon: UserX,
      prompt: 'Mr. Torres is tired and refuses his ordered wound dressing change today. What is Alex\'s first obligation?',
      options: [
        { id: 'force', text: 'Proceed anyway because the dressing change is ordered by the physician.', isCorrect: false },
        { id: 'respect', text: 'Respect his refusal immediately and step back.', isCorrect: true },
      ],
      feedback: 'Ordered care does not override the patient\'s right to refuse (42 CFR §484.50).',
    },
    {
      id: 'step2',
      title: 'Education & Risk',
      icon: AlertCircle,
      prompt: 'Alex respects the refusal. What should Alex say next?',
      options: [
        { id: 'ignore', text: '"Okay, no problem. I\'ll leave you to rest and see you tomorrow."', isCorrect: false },
        { id: 'educate', text: '"I understand you are tired. I do need to explain that skipping this dressing change increases the risk of infection..."', isCorrect: true },
      ],
      feedback: 'Alex must explain the risks and alternatives without coercion, so Mr. Torres makes an informed choice.',
    },
    {
      id: 'step3',
      title: 'Protocol & Documentation',
      icon: FileSignature,
      prompt: 'Mr. Torres still refuses after understanding the risk. What is Alex\'s final step?',
      options: [
        { id: 'secret', text: 'Leave it out of the chart so Mr. Torres isn\'t labeled "noncompliant".', isCorrect: false },
        { id: 'document', text: 'Assess for immediate concern, notify the clinical team per process, and document the refusal and education objectively.', isCorrect: true },
      ],
      feedback: 'The choice belongs to the patient, but the care team still needs notification and objective documentation.',
    }
  ];

  const handleSelect = (option: any) => {
    if (option.isCorrect) {
      setShowError(false);
      if (currentStep < sequence.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else if (!isCompleted) {
        onComplete();
      }
    } else {
      setShowError(true);
    }
  };

  const isSequenceComplete = currentStep === sequence.length - 1 && isCompleted;

  return (
    <div className="w-full h-[680px] bg-[#FDF8F3] p-4 md:p-6 flex flex-col items-center justify-start overflow-hidden font-sans">
      
      {/* Top Banner */}
      <div className="w-full max-w-[1000px] mb-4 bg-white p-4 rounded-xl shadow-sm border border-[#E5E4E3] flex justify-between items-center z-10">
        <div>
          <h2 className="text-xl font-bold text-[#0F5B54]">Patient Refusal</h2>
          <p className="text-sm text-[#475569] mt-1">
            Guide Alex through a decision sequence with Mr. Ray Torres.
          </p>
        </div>
        {(isCompleted || isSequenceComplete) && (
          <div className="flex items-center text-[#0F5B54] font-semibold">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Sequence Complete
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-[1000px] flex gap-6 z-10">
        
        {/* Left: Progress tracking */}
        <div className="flex-[1] bg-white rounded-xl shadow-sm border border-[#E5E4E3] p-6 flex flex-col relative overflow-hidden">
          <h3 className="font-bold text-[#1E3A3A] mb-6 uppercase tracking-wide text-xs text-center border-b pb-2">Interaction Timeline</h3>
          
          <div className="flex-1 flex flex-col justify-center">
            {sequence.map((step, idx) => {
              const isPast = idx < currentStep || isSequenceComplete;
              const isActive = idx === currentStep && !isSequenceComplete;
              const Icon = step.icon;

              return (
                <div key={idx} className="relative flex items-center mb-10 last:mb-0">
                  {/* Vertical Line connecting nodes */}
                  {idx < sequence.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-[-40px] w-0.5 bg-gray-100 -z-10"></div>
                  )}
                  {idx < sequence.length - 1 && isPast && (
                    <div className="absolute left-6 top-12 bottom-[-40px] w-0.5 bg-[#0F5B54] -z-10 animate-in fade-in slide-in-from-top duration-500"></div>
                  )}

                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm transition-colors duration-300 z-10 ${
                    isActive ? 'bg-[#D89E39] text-white' : 
                    isPast ? 'bg-[#0F5B54] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isPast ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  <div className="ml-4">
                    <h4 className={`font-bold ${isActive || isPast ? 'text-[#1E3A3A]' : 'text-[#94A3B8]'}`}>{step.title}</h4>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto bg-[#F8FAFC] p-4 rounded-lg border border-[#E2E8F0] text-xs text-[#475569]">
            <span className="font-bold text-[#1E3A3A]">42 CFR §484.50</span>: Patient rights include the right to participate in, and refuse, care.
          </div>
        </div>

        {/* Right: Interaction Panel */}
        <div className="flex-[1.5] bg-white rounded-xl shadow-sm border border-[#E5E4E3] p-6 flex flex-col relative overflow-hidden">
          
          {isSequenceComplete ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-[#0F5B54]/10 rounded-full flex items-center justify-center mb-6">
                <FileSignature size={40} className="text-[#0F5B54]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A3A] mb-4">Documentation Focus</h3>
              <div className="bg-[#FDF8F3] p-5 rounded-lg border border-[#EADCC7] text-left shadow-sm w-full">
                <p className="text-[#475569] leading-relaxed">
                  Alex's final note must include what was refused, the education provided, Mr. Torres' response, any risk observed, who was notified, and any follow-up instructions given to the patient or caregiver.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep}>
              <div className="bg-[#0F5B54]/5 border-l-4 border-[#0F5B54] p-5 rounded-r-lg mb-6 shadow-sm">
                <p className="text-[#1E3A3A] font-semibold text-[15px] leading-relaxed">
                  {sequence[currentStep].prompt}
                </p>
              </div>

              <div className="space-y-4 flex-1">
                {sequence[currentStep].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className="w-full text-left p-4 rounded-xl border-2 border-[#E5E4E3] hover:border-[#90A4AE] hover:bg-gray-50 transition-all duration-200 focus:outline-none"
                  >
                    <div className="flex items-start">
                      <div className="shrink-0 w-5 h-5 rounded-full border-2 border-[#94A3B8] mr-3 mt-0.5"></div>
                      <span className="text-sm font-medium text-[#1E3A3A]">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Error Feedback */}
              {showError && (
                <div className="mt-4 p-4 rounded-lg bg-[#E74C3C]/10 text-[#C0392B] animate-in slide-in-from-bottom-2">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm mb-1">Not quite right</p>
                      <p className="text-sm">{sequence[currentStep].feedback}</p>
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
