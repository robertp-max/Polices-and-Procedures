import { useState } from 'react';
import type { SceneProps } from './gao001-shared';
import { MANDATORY_REPORTING_SENTENCE } from './gao001-shared';
import { CheckCircle2, ShieldAlert, UserPlus, AlertCircle, Check, ArrowRight } from 'lucide-react';

export default function Scene08EscalationPractice({ onComplete, isCompleted }: SceneProps) {
  const [branch1Passed, setBranch1Passed] = useState(false);
  const [branch2Passed, setBranch2Passed] = useState(false);
  const [showError1, setShowError1] = useState(false);
  const [showError2, setShowError2] = useState(false);

  const handleBranch1 = (isCorrect: boolean) => {
    if (isCorrect) {
      setBranch1Passed(true);
      setShowError1(false);
    } else {
      setShowError1(true);
    }
  };

  const handleBranch2 = (isCorrect: boolean) => {
    if (isCorrect) {
      setBranch2Passed(true);
      setShowError2(false);
      if (!isCompleted && branch1Passed) {
        onComplete();
      }
    } else {
      setShowError2(true);
    }
  };

  // If completing branch 1 after branch 2 is already somehow passed, trigger complete
  if (branch1Passed && branch2Passed && !isCompleted) {
    onComplete();
  }

  return (
    <div className="w-full h-[680px] bg-[#FDF8F3] p-4 md:p-6 flex flex-col items-center justify-start overflow-hidden font-sans">
      
      {/* Top Banner */}
      <div className="w-full max-w-[1000px] mb-4 bg-white p-4 rounded-xl shadow-sm border border-[#E5E4E3] flex justify-between items-center z-10">
        <div>
          <h2 className="text-xl font-bold text-[#0F5B54]">Escalation Practice</h2>
          <p className="text-sm text-[#475569] mt-1">
            Navigate two field boundaries: scope of practice and safety escalation.
          </p>
        </div>
        {(isCompleted || (branch1Passed && branch2Passed)) && (
          <div className="flex items-center text-[#0F5B54] font-semibold">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Boundaries Mastered
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-[1000px] flex gap-6 z-10">
        
        {/* Branch 1: Scope of Practice */}
        <div className={`flex-1 rounded-xl shadow-sm border p-6 flex flex-col transition-all duration-300 relative overflow-hidden ${
          branch1Passed ? 'bg-white border-[#E5E4E3]' : 'bg-white border-[#0F5B54] shadow-md'
        }`}>
          {branch1Passed && (
            <div className="absolute top-0 right-0 bg-[#0F5B54] text-white px-3 py-1 rounded-bl-lg text-xs font-bold uppercase flex items-center">
              <Check size={14} className="mr-1" /> Passed
            </div>
          )}

          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-[#D89E39]/10 flex items-center justify-center mr-3 shrink-0">
              <UserPlus className="text-[#D89E39]" size={20} />
            </div>
            <h3 className="font-bold text-[#1E3A3A]">Boundary 1: Scope of Practice</h3>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg mb-6 flex-1">
            <p className="text-[#475569] text-sm leading-relaxed mb-3">
              Grace (the patient's daughter) asks Alex: <br/><br/>
              <span className="italic font-medium text-[#1E3A3A]">"Alex, can you check my blood pressure really quick? And mom's sugars are high, can we just give her more insulin today?"</span>
            </p>
          </div>

          <div className="space-y-3">
            {!branch1Passed ? (
              <>
                <button
                  onClick={() => handleBranch1(false)}
                  className="w-full text-left p-3 rounded border border-[#E5E4E3] hover:border-[#90A4AE] text-sm text-[#475569]"
                >
                  "Sure, let me check your BP and we'll adjust the dose based on the reading."
                </button>
                <button
                  onClick={() => handleBranch1(true)}
                  className="w-full text-left p-3 rounded border border-[#E5E4E3] hover:border-[#0F5B54] hover:bg-[#0F5B54]/5 text-sm text-[#475569] transition-colors"
                >
                  Decline off-scope request and only treat the mother within physician orders.
                </button>
                {showError1 && (
                  <div className="text-[#E74C3C] text-xs mt-2 flex items-center bg-[#E74C3C]/10 p-2 rounded">
                    <AlertCircle size={14} className="mr-1 shrink-0" /> That crosses scope. Do not treat unassigned patients or change orders.
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[#0F5B54]/10 border border-[#0F5B54]/20 p-4 rounded-lg text-[#0F5B54] text-sm flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <p>Correct. Alex must stay within role. Do not provide assessment for someone who is not the assigned patient.</p>
              </div>
            )}
          </div>
        </div>

        {/* Arrow Connector */}
        <div className="flex items-center justify-center -mx-3 z-20">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${branch1Passed ? 'bg-[#0F5B54] text-white' : 'bg-gray-200 text-gray-400'}`}>
            <ArrowRight size={20} />
          </div>
        </div>

        {/* Branch 2: Safety Escalation */}
        <div className={`flex-1 rounded-xl shadow-sm border p-6 flex flex-col transition-all duration-300 relative overflow-hidden ${
          !branch1Passed ? 'bg-gray-50 border-[#E5E4E3] opacity-50 pointer-events-none' : 
          branch2Passed ? 'bg-white border-[#E5E4E3]' : 'bg-white border-[#0F5B54] shadow-md'
        }`}>
          {branch2Passed && (
            <div className="absolute top-0 right-0 bg-[#0F5B54] text-white px-3 py-1 rounded-bl-lg text-xs font-bold uppercase flex items-center">
              <Check size={14} className="mr-1" /> Passed
            </div>
          )}

          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-[#E74C3C]/10 flex items-center justify-center mr-3 shrink-0">
              <ShieldAlert className="text-[#E74C3C]" size={20} />
            </div>
            <h3 className="font-bold text-[#1E3A3A]">Boundary 2: Safety Issue</h3>
          </div>

          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg mb-6 flex-1">
            <p className="text-[#475569] text-sm leading-relaxed mb-3">
              During the visit, Alex notices <span className="font-semibold text-[#1E3A3A]">unexplained, defensive-style bruising</span> on the patient's arms.
            </p>
          </div>

          <div className="space-y-3">
            {!branch2Passed ? (
              <>
                <button
                  onClick={() => handleBranch2(false)}
                  className="w-full text-left p-3 rounded border border-[#E5E4E3] hover:border-[#90A4AE] text-sm text-[#475569]"
                >
                  Question Grace aggressively until she admits what happened.
                </button>
                <button
                  onClick={() => handleBranch2(true)}
                  className="w-full text-left p-3 rounded border border-[#E5E4E3] hover:border-[#0F5B54] hover:bg-[#0F5B54]/5 text-sm text-[#475569] transition-colors"
                >
                  Document objective observations and report immediately via protocol.
                </button>
                {showError2 && (
                  <div className="text-[#E74C3C] text-xs mt-2 flex items-center bg-[#E74C3C]/10 p-2 rounded">
                    <AlertCircle size={14} className="mr-1 shrink-0" /> Incorrect. Independent investigation is a boundary violation.
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[#0F5B54]/10 border border-[#0F5B54]/20 p-4 rounded-lg text-[#0F5B54] text-sm flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <p>Correct. {MANDATORY_REPORTING_SENTENCE}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
