import React, { useState } from 'react';
import {
  X, Shield, Search, CheckCircle, BookOpen, FileText, CheckSquare,
  Archive, Settings, Info, List, AlertTriangle, ChevronRight
} from 'lucide-react';
import type { Policy } from '../types/policy';
import {
  SAMPLE_DEFINITIONS, SAMPLE_PURPOSE, SAMPLE_SCOPE, SAMPLE_SCOPE_EXCLUSION,
  SAMPLE_POLICY_STATEMENTS, SAMPLE_PROCEDURES, SAMPLE_DOCS, SAMPLE_COMPLIANCE
} from '../data/samplePolicy';

interface PolicyPopupProps {
  policy: Policy;
  onClose: () => void;
  embedded?: boolean;
}

const SimpleTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto rounded-xl bg-white border border-gray-200 shadow-sm mb-6">
    <table className="w-full text-left border-collapse min-w-max">
      <thead>
        <tr className="bg-[#007970] text-white">
          {headers.map((h, i) => (
            <th key={i} className="p-4 font-bold text-sm tracking-wide border-b border-[#006059]">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 transition-colors even:bg-gray-50/30">
            {row.map((cell, j) => (
              <td key={j} className="p-4 text-gray-700 text-sm align-top leading-relaxed whitespace-pre-line">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function PolicyPopup({ policy, onClose, embedded }: PolicyPopupProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const isSample = policy.policyId === 'GV-GA-001';

  const tabs = [
    { id: 'overview', label: 'Overview & Definitions', icon: Info },
    { id: 'policy', label: 'Policy Statements', icon: Shield },
    { id: 'procedures', label: 'Procedures', icon: Settings },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'compliance', label: 'Compliance & Audit', icon: CheckSquare },
    { id: 'references', label: 'References & Admin', icon: Archive },
  ];

  const meta = {
    domain: policy.domain,
    tier: policy.tier,
    approvedBy: policy.approvedBy || 'Governing Body Chair / Designee',
    supersedes: 'N/A (Initial Version)',
    effective: policy.approvedAt || 'Pending',
    lastReviewed: policy.reviewedAt || 'Pending',
    nextReview: 'Pending',
  };

  const renderContent = () => (
    <>
            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Header Card */}
                <div className="bg-[#007970] text-white rounded-xl p-6 shadow-md">
                  <h2 className="text-3xl font-extrabold mb-1 leading-tight">{policy.title}</h2>
                  <span className="text-[#007970] bg-white px-3 py-1 rounded-full text-xs font-bold inline-block mb-3 mt-1">
                    ID: {policy.policyId}
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 text-sm mt-4 border-t border-white/20 pt-4">
                    <div><span className="text-white/70 block text-xs uppercase">Domain</span><strong>{meta.domain}</strong></div>
                    <div><span className="text-white/70 block text-xs uppercase">Tier</span><strong>{meta.tier}</strong></div>
                    <div><span className="text-white/70 block text-xs uppercase">Approved By</span><strong>{meta.approvedBy}</strong></div>
                    <div><span className="text-white/70 block text-xs uppercase">Supersedes</span><strong>{meta.supersedes}</strong></div>
                    <div><span className="text-white/70 block text-xs uppercase">Effective Date</span><strong>{meta.effective}</strong></div>
                    <div><span className="text-white/70 block text-xs uppercase">Last Reviewed</span><strong>{meta.lastReviewed}</strong></div>
                    <div><span className="text-white/70 block text-xs uppercase">Next Review Date</span><strong>{meta.nextReview}</strong></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Purpose */}
                  <div className="bg-white shadow-sm rounded-xl p-6">
                    <h3 className="text-2xl font-bold flex items-center mb-4 text-[#007970]">
                      <Shield className="mr-3" size={24} /> 2. Purpose
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-[15px]">
                      {isSample ? SAMPLE_PURPOSE : (policy.policyBody || policy.briefDescription)}
                    </p>
                  </div>

                  {/* Scope */}
                  <div className="bg-white shadow-sm rounded-xl p-6">
                    <h3 className="text-2xl font-bold flex items-center mb-4 text-[#007970]">
                      <Search className="mr-3" size={24} /> 3. Scope
                    </h3>
                    {isSample ? (
                      <>
                        <p className="text-gray-700 mb-4 font-bold">This policy applies to:</p>
                        <ul className="space-y-3">
                          {SAMPLE_SCOPE.map((item, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle className="text-[#007970] mr-3 mt-0.5 shrink-0" size={18} />
                              <span className="text-gray-700 text-[15px]">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-5 p-4 bg-[#C74600]/10 border border-[#C74600]/20 text-[#C74600] rounded-lg text-sm font-medium leading-relaxed">
                          {SAMPLE_SCOPE_EXCLUSION}
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-700 leading-relaxed text-[15px]">
                        This policy applies to all staff, leadership, and contracted entities within the scope of {policy.domain}.
                      </p>
                    )}
                  </div>
                </div>

                {/* Definitions */}
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold flex items-center mb-6 text-[#007970]">
                    <BookOpen className="mr-3" size={24} /> 5. Definitions
                  </h3>
                  {isSample ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {SAMPLE_DEFINITIONS.map((def, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <h4 className="font-extrabold text-[#007970] mb-2">{def.term}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{def.definition}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Definitions will be populated upon policy authoring.</p>
                  )}
                </div>
              </div>
            )}

            {/* ===== POLICY STATEMENTS TAB ===== */}
            {activeTab === 'policy' && (
              <div className="bg-white shadow-sm rounded-xl p-6">
                <h3 className="text-2xl font-bold flex items-center mb-6 text-[#007970]">
                  <List className="mr-3" size={24} /> 4. Policy Statement
                </h3>
                {isSample ? (
                  <div className="space-y-4">
                    {SAMPLE_POLICY_STATEMENTS.map((stmt, i) => (
                      <div key={i} className="flex items-start bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm">
                        <div className="bg-[#007970] text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shrink-0 mr-5 shadow-inner text-sm">
                          4.{i + 1}
                        </div>
                        <p className="text-gray-800 leading-relaxed pt-2 text-[15px] whitespace-pre-line">{stmt}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 leading-relaxed">{policy.policyBody}</p>
                )}
              </div>
            )}

            {/* ===== PROCEDURES TAB ===== */}
            {activeTab === 'procedures' && (
              <div className="space-y-6">
                {isSample ? (
                  <>
                    <div className="bg-white shadow-sm rounded-xl p-6">
                      <h3 className="text-2xl font-bold flex items-center mb-6 text-[#007970]">
                        <Settings className="mr-3" size={24} /> 6. Procedures
                      </h3>
                    </div>
                    {/* 6.1 */}
                    <div className="bg-white shadow-sm rounded-xl p-6">
                      <h4 className="font-bold text-xl text-gray-800 mb-4">{SAMPLE_PROCEDURES["6.1"].title}</h4>
                      <SimpleTable headers={["Step", "Responsible Party", "Action", "Timeframe"]} rows={SAMPLE_PROCEDURES["6.1"].rows} />
                    </div>
                    {/* 6.2 */}
                    <div className="bg-[#C74600]/10 border border-[#C74600]/20 text-[#C74600] p-5 rounded-xl text-[15px] font-medium flex items-start shadow-sm">
                      <AlertTriangle className="mr-3 shrink-0" size={24} />
                      <p>The Governing Body shall fulfill the following responsibilities directly and shall <strong>not delegate ultimate accountability</strong> for any of these functions.</p>
                    </div>
                    {SAMPLE_PROCEDURES["6.2"].sections.map((section, idx) => (
                      <div key={idx} className="bg-white shadow-sm rounded-xl p-6">
                        <h4 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">{section.title}</h4>
                        <SimpleTable headers={["Step", "Responsible Party", "Action", "Timeframe"]} rows={section.rows} />
                      </div>
                    ))}
                    {/* 6.3 */}
                    <div className="bg-white shadow-sm rounded-xl p-6">
                      <h4 className="font-bold text-xl text-gray-800 mb-4">{SAMPLE_PROCEDURES["6.3"].title}</h4>
                      <SimpleTable headers={["Step", "Responsible Party", "Action", "Timeframe"]} rows={SAMPLE_PROCEDURES["6.3"].rows} />
                    </div>
                  </>
                ) : (
                  <div className="bg-white shadow-sm rounded-xl p-6">
                    <h3 className="text-2xl font-bold flex items-center mb-6 text-[#007970]">
                      <Settings className="mr-3" size={24} /> Procedures
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{policy.procedureBody}</p>
                  </div>
                )}
              </div>
            )}

            {/* ===== DOCUMENTATION TAB ===== */}
            {activeTab === 'documentation' && (
              <div className="bg-white shadow-sm rounded-xl p-6">
                <h3 className="text-2xl font-bold flex items-center mb-6 text-[#007970]">
                  <FileText className="mr-3" size={24} /> 7. Documentation Requirements
                </h3>
                {isSample ? (
                  <SimpleTable
                    headers={["Requirement", "Document / Record", "Responsible Party", "Location", "Timeframe"]}
                    rows={SAMPLE_DOCS}
                  />
                ) : (
                  <p className="text-gray-500 italic">Documentation requirements will be defined during policy authoring.</p>
                )}
              </div>
            )}

            {/* ===== COMPLIANCE TAB ===== */}
            {activeTab === 'compliance' && (
              <div className="space-y-6">
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold flex items-center mb-6 text-[#007970]">
                    <CheckSquare className="mr-3" size={24} /> 8.1 How Compliance Is Measured
                  </h3>
                  {isSample ? (
                    <SimpleTable
                      headers={["Compliance Indicator", "Measurement Method", "Acceptable Standard"]}
                      rows={SAMPLE_COMPLIANCE}
                    />
                  ) : (
                    <p className="text-gray-500 italic">Compliance metrics will be defined during policy authoring.</p>
                  )}
                </div>

                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold flex items-center mb-6 text-[#C74600]">
                    <AlertTriangle className="mr-3" size={24} /> 8.2 Common Failure Points
                  </h3>
                  {isSample ? (
                    <div className="space-y-3">
                      {[
                        { point: "No documented evidence that a Governing Body exists or functions.", risk: "Condition-level deficiency. Potential termination of Medicare certification.", mitigation: "Maintain establishing documents, current roster, and quarterly minutes on file." },
                        { point: "Governing Body meetings held but not documented.", risk: "Surveyor will treat undocumented meetings as not having occurred.", mitigation: "Use Appendix D template; complete draft minutes within 14 calendar days." },
                        { point: "Key leadership vacancies unfilled for extended periods.", risk: "Failure to ensure adequate management.", mitigation: "Fill or designate interim within 14 calendar days." },
                      ].map((item, i) => (
                        <div key={i} className="bg-red-50 border border-red-100 p-4 rounded-xl shadow-sm">
                          <p className="font-bold text-red-900 text-[15px] mb-2">{item.point}</p>
                          <p className="text-sm text-red-700 mb-2"><strong>Risk:</strong> {item.risk}</p>
                          <p className="text-sm text-gray-800 bg-white p-2 rounded-lg border border-red-100"><strong>Mitigation:</strong> {item.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Failure points will be documented during policy development.</p>
                  )}
                </div>
              </div>
            )}

            {/* ===== REFERENCES TAB ===== */}
            {activeTab === 'references' && (
              <div className="space-y-6">
                <div className="bg-white shadow-sm rounded-xl p-6">
                  <h3 className="text-2xl font-bold flex items-center mb-6 text-[#007970]">
                    <Archive className="mr-3" size={24} /> 9. References
                  </h3>
                  {isSample ? (
                    <>
                      <h4 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">9.1 Federal Regulations</h4>
                      <SimpleTable headers={["Citation", "Title", "Relevance"]} rows={[
                        ["42 CFR § 484.105", "Organization and Administration of Services", "Primary regulatory basis for this policy."],
                        ["42 CFR § 484.105(a)", "Standard: Governing body", "Mandates governing body and administrator responsibility."],
                        ["42 CFR § 484.105(b)", "Standard: Administrator", "Requires qualified administrator appointment."],
                        ["42 CFR § 484.105(c)", "Standard: Clinical manager", "Requires clinical manager designation."],
                        ["42 CFR § 484.65", "QAPI", "Governing body must ensure effective QAPI program."],
                        ["42 CFR § 484.102", "Emergency preparedness", "Governing body approves emergency plan."],
                      ]} />

                      <h4 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200 mt-6">9.4 Cross-Referenced Policies</h4>
                      <SimpleTable headers={["Policy ID", "Title", "Relationship"]} rows={[
                        ["GV-OG-001", "Organizational Structure & Reporting", "GB approves structure."],
                        ["GV-OG-002", "Administrator Qualifications", "GB appoints Administrator."],
                        ["GV-PM-001", "Policy Development & Approval", "GB approves policies."],
                        ["GV-GB-002", "Board Meeting & Minutes", "Meeting documentation standards."],
                        ["GV-GB-003", "Conflict of Interest Disclosure", "Member conflict disclosures."],
                        ["QA-PG-002", "QAPI Plan Development", "GB approves QAPI plan."],
                        ["CO-CP-001", "Corporate Compliance Program", "GB oversees compliance."],
                      ]} />
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-4">{policy.trainingContent}</p>
                      <p className="text-gray-500 italic">Full references will be populated during policy authoring.</p>
                    </>
                  )}
                </div>
              </div>
            )}

    </>
  );

  if (embedded) {
    return (
      <div className="bg-[#f1f5f9] w-full rounded-xl shadow-sm overflow-hidden">
        <nav className="bg-white border-b border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-2 px-4 py-3 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#007970] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={16} className={activeTab === tab.id ? 'text-white' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6 px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#f1f5f9] w-full max-w-6xl rounded-xl shadow-2xl overflow-hidden relative animate-in"
        onClick={e => e.stopPropagation()}
      >
        <nav className="bg-white border-b border-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-2 px-4 py-3 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#007970] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={16} className={activeTab === tab.id ? 'text-white' : 'text-gray-400'} />
                {tab.label}
              </button>
            );
          })}
          <button
            onClick={onClose}
            className="ml-auto p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </nav>
        <div className="p-6 lg:p-10 max-h-[80vh] overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
