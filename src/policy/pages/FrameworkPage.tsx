import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Lock,
  Building2,
  Heart,
  BarChart3,
  DollarSign,
  Briefcase,
  Monitor,
  AlertTriangle,
  Cpu,
  Scale,
  Landmark,
  FileCheck,
  Gavel,
  Shield,
} from 'lucide-react';
import {
  V32PageHeader,
  V32SectionHeader,
  V32MetricTile,
  GlassPanel,
} from '@/policy/components/ui';

const REGULATORY_ITEMS = [
  { id: 'title22', name: 'California State Law', shortName: 'TITLE 22', color: '#facc15', icon: Landmark },
  { id: '42cfr', name: '42 CFR Part 484', shortName: '42 CFR §484', color: '#00e59b', icon: Scale },
  { id: 'cms', name: 'CMS State Operations', shortName: 'CMS STATE OPS', color: '#ec4899', icon: FileCheck },
  { id: 'hipaa', name: 'HIPAA Privacy & Security', shortName: 'HIPAA', color: '#3b82f6', icon: Lock },
  { id: 'osha', name: 'OSHA / Cal-OSHA', shortName: 'OSHA', color: '#f59e0b', icon: Shield },
  { id: 'oig', name: 'OIG Compliance Guidance', shortName: 'OIG', color: '#8b5cf6', icon: ShieldCheck },
  { id: 'fca', name: 'False Claims Act', shortName: 'FCA', color: '#a855f7', icon: Gavel },
];

const DOMAINS = [
  { code: 'GV', name: 'GOVERNANCE', icon: Building2, color: '#00e59b', subdomains: ['GB', 'OG', 'PM', 'EA'] },
  { code: 'CL', name: 'CLINICAL OPS', icon: Heart, color: '#ef4444', subdomains: ['PA', 'CP', 'OA', 'SD', 'IC', 'DC', 'CA', 'CD', 'PR'] },
  { code: 'QA', name: 'QAPI', icon: BarChart3, color: '#06b6d4', subdomains: ['PG', 'SM', 'AE', 'PI'] },
  { code: 'HR', name: 'HUMAN RES.', icon: Users, color: '#8b5cf6', subdomains: ['TA', 'TD', 'WM', 'ER', 'JD'] },
  { code: 'CO', name: 'COMPLIANCE', icon: Shield, color: '#3b82f6', subdomains: ['CP', 'HP', 'FA', 'RA', 'DC'] },
  { code: 'FN', name: 'FINANCE', icon: DollarSign, color: '#10b981', subdomains: ['FP', 'RC', 'BL', 'CM'] },
  { code: 'OP', name: 'OPERATIONS', icon: Briefcase, color: '#f97316', subdomains: ['IM', 'SL', 'PA', 'FM'] },
  { code: 'IT', name: 'IT & SECURITY', icon: Monitor, color: '#6366f1', subdomains: ['SC', 'DR', 'SA', 'UP'] },
  { code: 'RM', name: 'RISK MGMT', icon: AlertTriangle, color: '#eab308', subdomains: ['ER', 'SS', 'PS', 'EP'] },
  { code: 'EN', name: 'ENTERPRISE', icon: Cpu, color: '#ec4899', subdomains: ['TG', 'LC', 'CM'] },
];

const REG_DESCRIPTIONS: Record<string, string> = {
  'title22': "California state licensure regulations establishing core administrative and operational mandates.",
  '42cfr': "CMS Conditions of Participation for Home Health Agencies required for Medicare certification.",
  'cms': "Survey protocols, guidelines, and compliance expectations for state operations.",
  'hipaa': "Federal standards for protecting sensitive patient health information from disclosure.",
  'osha': "Occupational safety standards ensuring safe and healthful working conditions for staff.",
  'oig': "Guidelines preventing fraud, waste, and abuse through robust compliance programs.",
  'fca': "Federal law imposing liability for defrauding governmental programs, including whistleblower protections.",
};

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  'GV': "Authority, structure, and oversight of the agency's governing body, administrative leadership, and organizational governance functions.",
  'CL': "Direct patient care delivery, clinical practice standards, care planning, discipline-specific services, and clinical documentation.",
  'QA': "QAPI program governance, performance improvement projects, quality measurement, patient safety, and outcome benchmarking.",
  'HR': "Workforce management including recruitment, credentialing, training, competency, performance management, employee relations.",
  'CO': "Regulatory compliance program, fraud and abuse prevention, HIPAA privacy/security, documentation compliance, and audit readiness.",
  'FN': "Billing, coding, claims management, reimbursement, financial planning, and revenue cycle performance.",
  'OP': "Day-to-day operational processes including intake, scheduling, service delivery logistics, facility management, and patient access.",
  'IT': "Information security program, system administration, data protection, cybersecurity, and technology infrastructure management.",
  'RM': "Enterprise risk management, incident management, staff and patient safety, environmental safety, and emergency response.",
  'EN': "Cross-domain policy governance, taxonomy management, lifecycle control, compliance metrics, and inter-domain coordination.",
};

export function FrameworkPage() {
  const navigate = useNavigate();

  // Premium corporate stats — using actual seeded framework numbers
  const stats = [
    { label: 'TAXONOMY DOMAINS', value: '10', trend: 'Top-level strategic pillars' },
    { label: 'SUBDOMAINS', value: '46', trend: 'Structural pillars' },
    { label: 'TOTAL POLICIES', value: '269+', trend: 'Managed artifacts' },
    { label: 'FRAMEWORK ALIGNMENT', value: '100%', trend: 'Governance coverage' },
  ];

  return (
    <div className="min-h-full w-full bg-transparent text-[var(--v3-text-primary)] p-6 md:p-8 font-roboto overflow-y-auto">
      <div className="w-full">
        <V32PageHeader
          eyebrow="GOVERNANCE ARCHITECTURE"
          title="Taxonomy Framework"
          description="Authoritative enterprise mapping of regulatory, clinical, and operational domains. All policies and forms are classified under this living structure."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/library')}
                title="Go to Policy Library"
                className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest hover:bg-white/5 transition-colors"
              >
                Browse Policies
              </button>
              <button
                onClick={() => navigate('/forms')}
                title="Go to Forms Library"
                className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest hover:bg-white/5 transition-colors"
              >
                Browse Forms
              </button>
              <button
                onClick={() => navigate('/framework/achc-survey')}
                title="Open ACHC Survey Alignment view"
                className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest bg-[var(--v3-orange)]/10 text-[var(--v3-orange)] hover:bg-[var(--v3-orange)]/20 transition-colors"
              >
                ACHC Survey View
              </button>
              <button
                onClick={() => navigate('/framework/achc-survey?view=crosswalk')}
                title="Open ACHC Crosswalk table"
                className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest bg-[var(--v3-teal)]/10 text-[var(--v3-teal)] hover:bg-[var(--v3-teal)]/20 transition-colors"
              >
                ACHC Crosswalk
              </button>
            </div>
          }
        />

        {/* Premium KPI Row — clean corporate metrics */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <V32MetricTile
              key={i}
              label={s.label}
              value={s.value}
              trend={s.trend}
              tone={i === 3 ? 'teal' : 'neutral'}
            />
          ))}
        </div>

        {/* Regulatory Board — clean horizontal corporate row */}
        <V32SectionHeader
          title="Regulatory Board"
          description="Foundational external mandates that drive domain taxonomy and cross-references."
          className="mb-4"
        />
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {REGULATORY_ITEMS.map((reg) => {
            const Icon = reg.icon;
            return (
              <GlassPanel key={reg.id} className="p-4 flex flex-col gap-2 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-white/10 p-2 text-[var(--v3-teal-light)]">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-montserrat font-bold uppercase tracking-[0.18em] text-[var(--v3-text-tertiary)]">{reg.shortName}</div>
                    <div className="text-sm font-medium leading-tight">{reg.name}</div>
                  </div>
                </div>
                <div className="text-[11px] text-[var(--v3-text-secondary)] leading-snug mt-1">
                  {REG_DESCRIPTIONS[reg.id]}
                </div>
              </GlassPanel>
            );
          })}
        </div>

        {/* Strategic Domains — clean corporate grid */}
        <V32SectionHeader
          title="Strategic Domains"
          description="10 primary domains organizing all policy, form, and evidence artifacts."
          className="mb-4"
        />
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            return (
              <GlassPanel
                key={domain.code}
                className="group p-5 cursor-pointer transition-all"
                onClick={() => navigate('/library')}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="mt-0.5 rounded-xl border border-white/10 p-3 text-[var(--v3-teal)]"
                    style={{ color: domain.color }}
                  >
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-xs font-semibold tracking-[1px] text-[var(--v3-text-tertiary)] mb-1">
                      {domain.code}
                    </div>
                    <div className="font-montserrat text-[15px] font-semibold leading-snug mb-1 group-hover:text-[var(--v3-teal-light)] transition-colors">
                      {domain.name}
                    </div>
                    <div className="text-[11px] text-[var(--v3-text-secondary)] line-clamp-2">
                      {DOMAIN_DESCRIPTIONS[domain.code]}
                    </div>
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--v3-text-tertiary)]">
                      {domain.subdomains.length} SUBDOMAINS
                    </div>
                  </div>
                </div>
              </GlassPanel>
            );
          })}
        </div>

        {/* Subdomain Pillars — clean intuitive grid */}
        <V32SectionHeader
          title="Subdomain Pillars"
          description="46 structural subdomains. Navigate to Library for policies."
          className="mb-4"
        />
        <GlassPanel className="p-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 text-sm">
            {DOMAINS.flatMap((d) =>
              d.subdomains.map((sub) => (
                <button
                  key={`${d.code}-${sub}`}
                  onClick={() => navigate('/library')}
                  className="flex items-center justify-between rounded-lg px-3 py-1.5 text-left hover:bg-white/5 text-[var(--v3-text-secondary)] hover:text-[var(--v3-text-primary)] transition-colors"
                >
                  <span className="font-mono text-[10px] tracking-widest text-[var(--v3-text-tertiary)]">
                    {d.code}-{sub}
                  </span>
                  <span className="text-xs font-medium ml-2 truncate">{sub}</span>
                </button>
              ))
            )}
          </div>
        </GlassPanel>

        <div className="h-10" />
      </div>
    </div>
  );
}
