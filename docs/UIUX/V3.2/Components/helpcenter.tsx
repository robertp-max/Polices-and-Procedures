import React, { useRef, useState } from 'react';
import {
  Search,
  FileText,
  BookOpen,
  ChevronRight,
  ArrowRight,
  PenTool,
  ClipboardCheck,
  GitMerge,
  File,
  Users,
  UserPlus,
  LayoutDashboard,
  Calendar,
  User,
  FileBox,
  Shield,
  Clock,
  LifeBuoy,
} from 'lucide-react';

type SpotlightCardProps = {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  onClick?: () => void;
};

const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.08)',
  onClick,
}: SpotlightCardProps) => {
  const divRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    divRef.current.style.setProperty('--mouse-x', `${x}px`);
    divRef.current.style.setProperty('--mouse-y', `${y}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`card-spotlight ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="spotlight-outer-glow" />
      <div className="spotlight-glow-wrapper">
        <div className="spotlight-inner-glow" />
      </div>
      {children}
    </div>
  );
};

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    count: 3,
    previews: ['Welcome to CI-App eCIgn', 'Roles, Tiers & Permissions', 'Navigation & Workspace Layout'],
  },
  {
    id: 'policy-lifecycle',
    title: 'Policy Lifecycle',
    icon: FileText,
    count: 5,
    previews: [
      'Policy Lifecycle Workspace - Overview',
      'Tier & Taxonomy Definitions',
      'Required Read/Acknowledgment',
      'Version History & Archiving a Policy',
    ],
  },
  {
    id: 'signing-documents',
    title: 'Signing Documents',
    icon: PenTool,
    count: 4,
    previews: [
      'Step 1: The Disclosure Gateway',
      'Step 2: Identity Verification',
      'Step 3: The Document Review',
      'Step 4: Signature & Lock',
    ],
  },
  {
    id: 'compliance-audit',
    title: 'Compliance & Audit',
    icon: ClipboardCheck,
    count: 4,
    previews: [
      'Audit Mode - Introduction',
      'Verifying the Hash Chain',
      'Third-Party Reports & Data Provision',
      'Compliance Center Metrics',
    ],
  },
  {
    id: 'workflows-events',
    title: 'Workflows & Events',
    icon: GitMerge,
    count: 3,
    previews: ['Schedule Automations (CRON)', 'QAPI Event Triggers', 'Plan of Care Locking (OASIS)'],
  },
  {
    id: 'forms-templates',
    title: 'Forms & Templates',
    icon: File,
    count: 3,
    previews: [
      'Template Preservation Format',
      'Footer Watermark on Signed Templates',
      'Appended Pages on Signed Documents',
    ],
  },
  {
    id: 'delegation',
    title: 'Delegation',
    icon: Users,
    count: 4,
    previews: [
      'CI-App Delegation',
      'Role Assignments',
      'Agency Administrator Delegation',
      'Multi-Agency / Cross-Instance Delegation',
    ],
  },
  {
    id: 'onboarding-v2',
    title: 'Onboarding v2',
    icon: UserPlus,
    count: 4,
    previews: [
      'Onboarding Pipeline',
      'HR Checklists - CI-App eCIgn integration',
      'I-9 and W-4 Form Execution',
      'Clinical Competency Validation Records',
    ],
  },
  {
    id: 'command-center',
    title: 'Command Center Dashboard',
    icon: LayoutDashboard,
    count: 3,
    previews: [
      'Command Center Dashboard - Overview',
      'Understanding Metric Status',
      'Using the Dashboard Swimlanes',
    ],
  },
  {
    id: 'master-calendar',
    title: 'Master Calendar',
    icon: Calendar,
    count: 3,
    previews: ['Master Calendar - Overview', 'Navigating Calendar Views', 'Event Escalation Flow'],
  },
  {
    id: 'brad-administrator',
    title: 'Brad Administrator',
    icon: User,
    count: 2,
    previews: ['Brad Administrator - Overview', 'Connecting Brad to External HRIS'],
  },
  {
    id: 'evidence-center',
    title: 'Evidence Center',
    icon: FileBox,
    count: 2,
    previews: ['Evidence Center - Overview', 'Orphan Evidence Management - Best Practices'],
  },
  {
    id: 'audit-mode',
    title: 'Audit Mode',
    icon: Shield,
    count: 2,
    previews: ['Audit Mode - Overview', 'Data Provisioning to External Surveyors'],
  },
  {
    id: 'hubstaff-controls',
    title: 'Hubstaff controls',
    icon: Clock,
    count: 2,
    previews: ['Hubstaff Time Tracking - Overview', 'Hubstaff Integration with Payroll'],
  },
];

const HELP_ARTICLES = [
  { id: 'welcome', title: 'Welcome to CI-App eCIgn' },
  { id: 'roles', title: 'Roles, Tiers & Permissions' },
  { id: 'navigation', title: 'Navigation & Workspace Layout' },
];

export default function HelpCenterApp() {
  const [currentView, setCurrentView] = useState<'home' | 'list' | 'article'>('home');

  return (
    <div className="flex h-screen w-full bg-[#0B0F15] text-slate-200 font-sans overflow-hidden selection:bg-[#007970]/30 selection:text-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #1C2433; border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2A3441; }

            .card-spotlight {
              position: relative;
              border-radius: 0.75rem;
              border: 1px solid #1C2433;
              background-color: #141A23;
              --mouse-x: 50%;
              --mouse-y: 50%;
              --spotlight-color: rgba(255, 255, 255, 0.08);
              transition: border-color 0.3s ease, transform 0.2s ease;
            }

            .card-spotlight.cursor-pointer:hover {
              border-color: #4A5568;
              transform: translateY(-2px);
            }

            .card-spotlight > :not(.spotlight-outer-glow):not(.spotlight-glow-wrapper) {
              position: relative;
              z-index: 10;
            }

            .spotlight-outer-glow {
              position: absolute;
              inset: -16px;
              border-radius: 1.5rem;
              background: radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 60%);
              opacity: 0;
              transition: opacity 0.5s ease;
              pointer-events: none;
              z-index: -1;
              filter: blur(20px);
            }

            .spotlight-glow-wrapper {
              position: absolute;
              inset: 0;
              border-radius: inherit;
              overflow: hidden;
              pointer-events: none;
              z-index: 0;
            }

            .spotlight-inner-glow {
              position: absolute;
              inset: 0;
              background: radial-gradient(250px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent);
              opacity: 0;
              transition: opacity 0.5s ease;
            }

            .card-spotlight:hover .spotlight-outer-glow,
            .card-spotlight:hover .spotlight-inner-glow {
              opacity: 1;
            }

            @keyframes fadeInSlideUp {
              0% { opacity: 0; transform: translateY(12px) scale(0.995); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }

            .animate-fadeInSlideUp {
              animation: fadeInSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              will-change: transform, opacity;
            }
          `,
        }}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B0F15] relative z-10">
        <header className="h-[72px] flex-shrink-0 border-b border-[#1C2433] bg-[#0F131A] flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4 text-xs font-medium text-[#8A94A6]">
            <span
              className="text-[#C74600] font-bold tracking-wide cursor-pointer hover:text-[#E2E8F0] transition-colors"
              onClick={() => setCurrentView('home')}
            >
              CareIndeed
            </span>
            <div className="w-px h-4 bg-[#1C2433]" />
            <span className="text-[#E2E8F0]">Help Center</span>
          </div>

          <button
            type="button"
            aria-label="User profile"
            className="w-8 h-8 rounded-full bg-[#141A23] border border-[#1C2433] flex items-center justify-center hover:border-[#4A5568] transition-colors"
          >
            <span className="text-xs font-bold text-[#007970]">TP</span>
          </button>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar flex justify-center py-12 px-8">
          <div className="w-full max-w-6xl">
            <div key={currentView} className="animate-fadeInSlideUp">
              {currentView === 'home' ? (
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-3xl mb-12">
                    <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
                      How can we help you today?
                    </h1>
                    <p className="text-xs text-[#8A94A6] mb-6">
                      Search across compliance documentation for the CI-App platform - referencing agency policy, workflows, and tools.
                    </p>

                    <div className="relative w-full max-w-md group">
                      <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5E6A7F] group-focus-within:text-[#007970] transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="Search for articles, guides or policies..."
                        className="w-full bg-[#141A23] border border-[#1C2433] rounded-lg pl-11 pr-4 py-3 text-sm text-white placeholder-[#5E6A7F] focus:outline-none focus:border-[#007970] focus:ring-1 focus:ring-[#007970]/50 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="w-full border-t border-[#1C2433] mb-12" />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-8">
                    {HELP_CATEGORIES.map(category => {
                      const Icon = category.icon;

                      return (
                        <SpotlightCard
                          key={category.id}
                          onClick={() => setCurrentView('list')}
                          className="flex flex-col p-6 group h-full"
                          spotlightColor="rgba(0, 121, 112, 0.15)"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-lg border border-[#1C2433] bg-[#0F131A] flex items-center justify-center text-[#007970] group-hover:border-[#007970]/50 transition-colors shadow-sm">
                              <Icon size={20} strokeWidth={1.5} />
                            </div>
                            <div>
                              <h2 className="text-[15px] font-semibold text-white group-hover:text-[#5EEAD4] transition-colors leading-tight">
                                {category.title}
                              </h2>
                              <span className="text-[11px] font-mono text-[#5E6A7F]">{category.count} Articles</span>
                            </div>
                          </div>

                          <div className="flex-1 space-y-2.5 mb-6">
                            {category.previews.map((preview, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <FileText size={12} className="text-[#5E6A7F] mt-1 flex-shrink-0" />
                                <span className="text-[13px] text-[#8A94A6] leading-snug truncate group-hover:text-[#E2E8F0] transition-colors">
                                  {preview}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-auto border-t border-[#1C2433] pt-4">
                            <span className="text-xs font-semibold text-[#C74600] group-hover:text-[#FDA4AF] transition-colors flex items-center gap-1">
                              View all {category.count} articles <ArrowRight size={12} className="ml-1" />
                            </span>
                          </div>
                        </SpotlightCard>
                      );
                    })}
                  </div>

                  <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SpotlightCard className="p-6 col-span-1" spotlightColor="rgba(199, 70, 0, 0.15)">
                      <div className="w-10 h-10 rounded-lg border border-[#1C2433] bg-[#0F131A] flex items-center justify-center text-[#C74600] mb-4 shadow-sm">
                        <LifeBuoy size={20} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-[15px] font-semibold text-white mb-1">Can&apos;t find what you&apos;re looking for?</h3>
                      <p className="text-xs text-[#8A94A6] mb-6">
                        Our support team is available to help you with specific questions.
                      </p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#C74600] hover:bg-[#A33900] text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-[#C74600]/20 w-fit"
                      >
                        Contact Support
                      </button>
                    </SpotlightCard>
                  </div>
                </div>
              ) : currentView === 'list' ? (
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#5E6A7F] mb-6">
                    <span onClick={() => setCurrentView('home')} className="hover:text-white cursor-pointer transition-colors">
                      Help Center
                    </span>
                    <ChevronRight size={14} />
                    <span className="text-white">Getting Started</span>
                  </div>

                  <div className="flex items-center gap-6 mb-10 pb-8 border-b border-[#1C2433]">
                    <div className="w-16 h-16 rounded-2xl border border-[#1C2433] bg-[#141A23] shadow-lg flex items-center justify-center text-[#007970]">
                      <BookOpen size={28} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-semibold text-white tracking-tight mb-1">Getting Started</h1>
                      <p className="text-sm text-[#8A94A6]">3 Articles available in this category.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {HELP_ARTICLES.map(article => (
                      <SpotlightCard
                        key={article.id}
                        onClick={() => setCurrentView('article')}
                        className="px-6 py-5 flex items-center justify-between group"
                        spotlightColor="rgba(0, 121, 112, 0.1)"
                      >
                        <div className="flex items-center gap-4">
                          <FileText size={18} className="text-[#5E6A7F] group-hover:text-[#007970] transition-colors" />
                          <h3 className="text-sm font-medium text-[#E2E8F0] group-hover:text-white transition-colors">
                            {article.title}
                          </h3>
                        </div>
                        <ArrowRight size={16} className="text-[#5E6A7F] group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </SpotlightCard>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#5E6A7F] mb-12">
                    <span onClick={() => setCurrentView('home')} className="hover:text-white cursor-pointer transition-colors">
                      Help Center
                    </span>
                    <ChevronRight size={14} />
                    <span onClick={() => setCurrentView('list')} className="hover:text-white cursor-pointer transition-colors">
                      Getting Started
                    </span>
                    <ChevronRight size={14} />
                    <span className="text-white">Welcome to CI-App eCIgn</span>
                  </div>

                  <div className="mb-10">
                    <div className="text-[10px] font-bold text-[#C74600] uppercase tracking-widest mb-3">GETTING STARTED</div>
                    <h1 className="text-4xl font-semibold text-white tracking-tight">Welcome to CI-App eCIgn</h1>
                  </div>

                  <div className="space-y-12">
                    <section>
                      <h2 className="text-[11px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-3">PURPOSE</h2>
                      <p className="text-[15px] text-[#E2E8F0] leading-relaxed">
                        CI-App eCIgn is the legally enforceable, audit-ready electronic signature subsystem of CI-App for Care Indeed Home Health Care, Inc.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-[11px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-3">WHEN TO USE IT</h2>
                      <p className="text-[15px] text-[#E2E8F0] leading-relaxed">
                        Any time a Care Indeed document requires a signature: Plans of Care, physician orders, policy acknowledgments, QAPI minutes, HR onboarding records, or mandatory event reports.
                      </p>
                    </section>

                    <section>
                      <h2 className="text-[11px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-3">SYSTEM BEHAVIOR</h2>
                      <div className="p-6 border border-[#1C2433] rounded-xl bg-[#141A23] shadow-inner">
                        <p className="font-mono text-xs text-[#8A94A6] leading-relaxed">
                          eCIgn enforces a six-step workflow (Disclosure - Identity - Review - Signature - Attestation - Lock) at the server boundary. Templates are byte-preserved; evidence is added via a footer watermark and four appended pages (Certificate, Identity &amp; Device, Audit Trail, Hash Manifest).
                        </p>
                      </div>
                    </section>

                    <section>
                      <h2 className="text-[11px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-3">COMPLIANCE IMPACT</h2>
                      <p className="text-[15px] text-[#E2E8F0] leading-relaxed">
                        Aligns with ESIGN Act (15 U.S.C. SS 7001-7031), UETA, HIPAA (45 CFR SS 164.308 / 164.312), and CMS Home Health Conditions of Participation (42 CFR Part 484).
                      </p>
                    </section>

                    <section>
                      <h2 className="text-[11px] font-bold text-[#5E6A7F] uppercase tracking-widest mb-3">EVIDENCE GENERATED</h2>
                      <p className="text-[15px] text-[#E2E8F0] leading-relaxed">
                        Every signing event produces: signed PDF (template + watermark + appended pages), audit trail report, signature certificate page, and a survey packet ZIP.
                      </p>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}