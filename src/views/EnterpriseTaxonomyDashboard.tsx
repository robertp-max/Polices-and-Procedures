
import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, Users, Clock, FileText, Lock, AlertCircle, Briefcase, HeartPulse, CheckCircle, GraduationCap, Scale, DollarSign, Settings, Laptop, ShieldAlert, GitMerge, Database, Folder, Layers
} from 'lucide-react';

// =====================
// V6.0 FRAMEWORK DATA
// =====================
const FRAMEWORK_METADATA = {
  version: "6.0",
  effectiveDate: "2025-07-10",
  totalPolicies: 244,
  totalDomains: 10,
  totalSubdomains: 42,
  ibmAlignmentVersion: "IBM Watson Knowledge Catalog v5.x"
};

const FRAMEWORK_DOMAINS = [
  { code: "GV", name: "Governance & Administration", ownerSteward: "Administrator / Governing Body", description: "Authority, structure, and oversight of the agency's governing body, administrative leadership, and organizational governance functions.", icon: Briefcase, color: "#007970" },
  { code: "CL", name: "Clinical Operations", ownerSteward: "Director of Nursing", description: "Direct patient care delivery, clinical practice standards, care planning, discipline-specific services, and clinical documentation.", icon: HeartPulse, color: "#C74601" },
  { code: "QA", name: "Quality Assurance & PI", ownerSteward: "QAPI Coordinator", description: "QAPI program governance, performance improvement projects, quality measurement, patient safety, and outcome benchmarking.", icon: CheckCircle, color: "#008540" },
  { code: "HR", name: "Human Resources", ownerSteward: "HR Director", description: "Workforce management including recruitment, credentialing, training, competency, performance management, and employee relations.", icon: GraduationCap, color: "#FFC700" },
  { code: "CO", name: "Compliance & Regulatory", ownerSteward: "Compliance Officer", description: "Regulatory compliance program, fraud and abuse prevention, HIPAA privacy/security, documentation compliance, and audit readiness.", icon: Scale, color: "#E4572E" },
  { code: "FN", name: "Finance & Revenue Cycle", ownerSteward: "CFO / Revenue Cycle Director", description: "Billing, coding, claims management, reimbursement, financial planning, and revenue cycle performance.", icon: DollarSign, color: "#007970" },
  { code: "OP", name: "Operations", ownerSteward: "Operations Director", description: "Day-to-day operational processes including intake, scheduling, service delivery logistics, facility management, and patient access.", icon: Settings, color: "#A259FF" },
  { code: "IT", name: "Technology & Security", ownerSteward: "IT Director / CISO", description: "Information security program, system administration, data protection, cybersecurity, and technology infrastructure management.", icon: Laptop, color: "#524048" },
  { code: "RM", name: "Risk Management & Safety", ownerSteward: "Risk Manager", description: "Enterprise risk management, incident management, staff and patient safety, environmental safety, and emergency response.", icon: ShieldAlert, color: "#D70101" },
  { code: "EN", name: "Enterprise Control", ownerSteward: "Compliance Officer", description: "Cross-domain policy governance, taxonomy management, lifecycle control, compliance metrics, and inter-domain coordination.", icon: GitMerge, color: "#008540" }
];

// ... (Insert FRAMEWORK_SUBDOMAINS and generatePolicies helpers from design artifact here) ...

// AccessTierBadge and MetricCard components from design artifact
interface AccessTierBadgeProps {
  tier: string;
  compact?: boolean;
}
const AccessTierBadge = ({ tier, compact = false }: AccessTierBadgeProps) => {
  let bgColor, textColor, icon;
  switch(tier) {
    case "Tier 1 — Public":
      bgColor = "bg-[#E5F4EE]"; textColor = "text-[#008540]"; icon = <Shield size={10} className={compact ? "" : "mr-1"}/>;
      break;
    case "Tier 2 — Restricted":
      bgColor = "bg-[#E5FEFF]"; textColor = "text-[#007970]"; icon = <Users size={10} className={compact ? "" : "mr-1"}/>;
      break;
    case "Tier 3 — Confidential":
      bgColor = "bg-[#FFFOE5]"; textColor = "text-[#C74601]"; icon = <Lock size={10} className={compact ? "" : "mr-1"}/>;
      break;
    case "Tier 4 — Privileged":
      bgColor = "bg-[#FBE6E6]"; textColor = "text-[#D70101]"; icon = <AlertCircle size={10} className={compact ? "" : "mr-1"}/>;
      break;
    default:
      bgColor = "bg-gray-100"; textColor = "text-gray-600"; icon = null;
  }
  const match = tier.match(/\d/);
  const label = compact && match ? `T${match[0]}` : tier.split('—')[0].trim();
  return (
    <span className={`inline-flex items-center justify-center ${compact ? 'px-1.5 py-0.5 text-[9px] gap-1' : 'px-2.5 py-1 text-[10px] md:text-[11px]'} rounded-full font-bold uppercase tracking-wider ${bgColor} ${textColor}`}>
      {icon} {!compact && label}
      {compact && <span className="sr-only">{label}</span>}
    </span>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgIconColor: string;
}
const MetricCard = ({ title, value, subtitle, icon: Icon, color, bgIconColor }: MetricCardProps) => (
  <div 
    className="bg-white p-5 rounded-xl border shadow-sm flex flex-col justify-between"
    style={{ borderTop: `4px solid ${color}`, borderColor: '#E5E4E3', borderTopColor: color }}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-lg ${bgIconColor}`} style={{ color: color }}>
        <Icon size={22} />
      </div>
      <h3 className="font-montserrat text-4xl font-extrabold" style={{ color: color }}>
        {value}
      </h3>
    </div>
    <div>
      <p className="text-[11px] text-[#1F1C1B] font-bold uppercase tracking-widest mb-1">{title}</p>
      <p className="text-xs text-[#747470]">{subtitle}</p>
    </div>
  </div>
);

// ... (Insert FRAMEWORK_SUBDOMAINS and generatePolicies helpers from design artifact here) ...

// (Full implementation from PolicyDesign.html, including tab logic, grid, and all UI)
export default function EnterpriseTaxonomyDashboard() {
  // State for active tabs
  const [activeDomainCode, setActiveDomainCode] = useState("ALL");
  const [activeSubdomainCode, setActiveSubdomainCode] = useState("ALL");

  // Get current active selections
  const activeDomain = useMemo(() => 
    FRAMEWORK_DOMAINS.find(d => d.code === activeDomainCode) || null, 
  [activeDomainCode]);

  // ...existing code for subdomain and policy logic from design artifact...

  // (Insert the full UI and logic from PolicyDesign.html here, as in the design artifact)
  return (
    <div className="bg-[#FAFBF8] font-roboto text-[#1F1C1B] w-full min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap');
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-roboto { font-family: 'Roboto', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {/* ...full dashboard UI as in PolicyDesign.html... */}
    </div>
  );
}
