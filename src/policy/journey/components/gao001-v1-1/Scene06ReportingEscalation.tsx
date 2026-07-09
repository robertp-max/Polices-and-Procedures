import { useState } from 'react';
import type { SceneProps } from './gao001-shared';
import { MANDATORY_REPORTING_SENTENCE } from './gao001-shared';
import { CheckCircle2, AlertTriangle, FileText, PhoneCall, ShieldCheck, XCircle } from 'lucide-react';

export default function Scene06ReportingEscalation({ onComplete, isCompleted }: SceneProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showError, setShowError] = useState(false);

  // The interactive flow steps
  const steps = [
    {
      title: '1. Observe',
      icon: AlertTriangle,
      color: '#D89E39',
      prompt: 'Alex observes unexplained bruising and hears a caregiver answer sharply for the patient. What is the immediate next step?',
      options: [
        { id: 'investigate', text: 'Question the caregiver until you know exactly what happened.', isCorrect: false },
        { id: 'document', text: 'Document objective facts without confrontation.', isCorrect: true },
      ],
      feedback: 'Alex does not investigate or confront. Just observe and document.',
    },
    {
      title: '2. Document',
      icon: FileText,
      color: '#475569',
      prompt: 'Objective facts are documented. What is the trigger for escalation?',
      options: [
        { id: 'proof', text: 'Wait until you have absolute proof of abuse.', isCorrect: false },
        { id: 'suspicion', text: 'Reasonable suspicion is enough to trigger reporting.', isCorrect: true },
      ],
      feedback: 'Waiting for proof delays required escalation. Reasonable suspicion is enough.',
    },
    {
      title: '3. Escalate',
      icon: PhoneCall,
      color: '#0F5B54',
      prompt: 'How should the escalation happen?',
      options: [
        { id: 'report', text: 'Report through the agency protocol immediately.', isCorrect: true },
        { id: 'wait', text: 'Wait for the next visit to see if it happens again.', isCorrect: false },
      ],
      feedback: 'Reporting must happen immediately.',
    },
    {
      title: '4. Support',
      icon: ShieldCheck,
      color: '#1E3A3A',
      prompt: 'Who handles the external reporting?',
      options: [
        { id: 'supervisor', text: 'Supervisor/Compliance assists with required external reporting.', isCorrect: true },
        { id: 'solo', text: 'The clinician must figure out the state forms alone.', isCorrect: false },
      ],
      feedback: 'The agency supports the clinician in fulfilling legal requirements.',
    }
  ];

  const handleSelect = (option: any) => {
    if (option.isCorrect) {
      setShowError(false);
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else if (!isCompleted) {
        onComplete();
      }
    } else {
      setShowError(true);
    }
  };

  const isFlowComplete = currentStep === steps.length - 1 && isCompleted;

  return (
    <div className="w-full h-[680px] bg-[#FDF8F3] p-4 md:p-6 flex flex-col items-center justify-start overflow-hidden font-sans">
      
      {/* Top Banner */}
      <div className="w-full max-w-[1000px] mb-4 bg-white p-4 rounded-xl shadow-sm border border-[#E5E4E3] flex justify-between items-center z-10">
        <div>
          <h2 className="text-xl font-bold text-[#0F5B54]">Reporting & Escalation</h2>
          <p className="text-sm text-[#475569] mt-1">
            Dana gives Alex the reporting boundary before a crisis happens.
          </p>
        </div>
        {(isCompleted || isFlowComplete) && (
          <div className="flex items-center text-[#0F5B54] font-semibold">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Protocol Mastered
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-[1000px] flex gap-6 z-10">
        
        {/* Left: Flowchart Progression */}
        <div className="flex-[1.2] bg-white rounded-xl shadow-sm border border-[#E5E4E3] p-8 flex flex-col relative overflow-hidden">
          <h3 className="font-bold text-[#1E3A3A] mb-8 uppercase tracking-wide text-sm border-b pb-2">Escalation Protocol</h3>
          
          <div className="flex flex-col gap-2 relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-6 bottom-6 w-1 bg-gray-100 rounded-full z-0"></div>
            <div 
              className="absolute left-6 top-6 w-1 bg-[#0F5B54] rounded-full z-0 transition-all duration-500 ease-in-out"
              style={{ height: `${(Math.min(currentStep, steps.length - 1) / Math.max(1, steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((step, idx) => {
              const isPast = idx < currentStep;
              const isActive = idx === currentStep;
              const Icon = step.icon;

              return (
                <div key={idx} className={`relative z-10 flex items-start gap-4 p-4 rounded-lg transition-all duration-300 ${
                  isActive ? 'bg-[#0F5B54]/5 border border-[#0F5B54]/20 shadow-sm' : 
                  isPast ? 'opacity-80' : 'opacity-40 grayscale'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm transition-colors duration-300 ${
                    isPast || isActive ? 'text-white' : 'bg-gray-200 text-gray-400'
                  }`} style={{ backgroundColor: isPast || isActive ? step.color : undefined }}>
                    {isPast && isCompleted ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                  </div>
                  <div className="pt-2 flex-1">
                    <h4 className={`font-bold ${isActive ? 'text-[#1E3A3A]' : 'text-[#475569]'}`}>{step.title}</h4>
                    {(isPast || (isActive && isCompleted)) && (
                      <p className="text-sm text-[#0F5B54] mt-1 font-medium animate-in fade-in">
                        {step.options.find(o => o.isCorrect)?.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interaction Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E5E4E3] p-6 flex flex-col relative overflow-hidden">
          
          {isFlowComplete ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-[#0F5B54]/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck size={40} className="text-[#0F5B54]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A3A] mb-4">Protocol Complete</h3>
              <div className="bg-[#FDF8F3] p-5 rounded-lg border border-[#EADCC7] text-left shadow-sm">
                <p className="font-semibold text-[#0F5B54] mb-2 uppercase text-xs tracking-wider">Mandatory Reporting Policy</p>
                <p className="text-[#1E3A3A] font-medium leading-relaxed italic">
                  "{MANDATORY_REPORTING_SENTENCE}"
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300" key={currentStep}>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6">
                <p className="text-[#1E3A3A] font-semibold text-[15px] leading-relaxed">
                  {steps[currentStep].prompt}
                </p>
              </div>

              <p className="text-[#475569] mb-4 font-medium">Select the correct action:</p>

              <div className="space-y-3 flex-1">
                {steps[currentStep].options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    className="w-full text-left p-4 rounded-lg border-2 border-[#E5E4E3] hover:border-[#90A4AE] hover:bg-gray-50 transition-all duration-200 focus:outline-none"
                  >
                    <div className="flex items-start">
                      <div className="shrink-0 w-5 h-5 rounded-full border-2 border-[#94A3B8] mr-3 mt-0.5"></div>
                      <span className="text-sm text-[#475569]">{option.text}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Error Feedback */}
              {showError && (
                <div className="mt-6 p-4 rounded-lg bg-[#E74C3C]/10 text-[#C0392B] animate-in slide-in-from-bottom-2">
                  <div className="flex items-start">
                    <XCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm mb-1">Incorrect</p>
                      <p className="text-sm">{steps[currentStep].feedback}</p>
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
