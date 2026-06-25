import { 
  ShieldCheck, 
  UserCheck, 
  AlertTriangle, 
  GraduationCap, 
  FolderSync, 
  ArrowRight,
  BookOpen,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function NewHireScreen() {
  const gates = [
    {
      id: 1,
      title: "Gate 1: Background & Screening",
      desc: "Criminal background clearance, reference verification, and OIG/GSA checks.",
      status: "Verified",
      statusColor: "text-brand-teal bg-tone-teal-bg border-tone-teal-border",
      icon: ShieldCheck,
    },
    {
      id: 2,
      title: "Gate 2: Credentials & License",
      desc: "Validation of RN/LVN/CNA license, certifications, and clinical qualifications.",
      status: "Verified",
      statusColor: "text-brand-teal bg-tone-teal-bg border-tone-teal-border",
      icon: UserCheck,
    },
    {
      id: 3,
      title: "Gate 3: Health & Safety Screening",
      desc: "TB test results, health clearance, physical exam, and vaccine records.",
      status: "In Progress",
      statusColor: "text-brand-orange bg-tone-orange-bg border-tone-orange-border",
      icon: AlertTriangle,
    },
    {
      id: 4,
      title: "Gate 4: Orientation Coursework",
      desc: "Complete the 12-hour mandatory training modules and role-specific paths.",
      status: "Pending Gate 3",
      statusColor: "text-secondary bg-tone-slate-bg border-hairline",
      icon: GraduationCap,
    },
    {
      id: 5,
      title: "Gate 5: Supervised Visit",
      desc: "First independent patient visit under direct preceptor/supervisor check-off.",
      status: "Locked",
      statusColor: "text-muted bg-tone-slate-bg border-hairline opacity-60",
      icon: FolderSync,
    },
  ];

  return (
    <div className="space-y-6 text-left max-w-5xl ml-0 mr-auto w-full">
      {/* Orange Glassmorphic Welcoming Header */}
      <div 
        className="rounded-2xl p-6 md:p-8 text-white border-2 border-white/80 shadow-glass-inset backdrop-blur-xl"
        style={{
          background: "linear-gradient(135deg, rgba(234, 88, 12, 0.75), rgba(249, 115, 22, 0.65))",
          boxShadow: "0 8px 32px 0 rgba(234, 88, 12, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.25)"
        }}
      >
        <span className="text-[10px] uppercase font-bold tracking-widest text-orange-100 font-mono block mb-1">
          Welcome to Care Indeed Home Health
        </span>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          New Hire Onboarding Portal
        </h1>
        <p className="text-sm text-orange-50/90 max-w-2xl leading-relaxed">
          Welcome to the team! This portal coordinates your compliance checklist, license verifications, health screenings, and regulatory coursework required prior to active patient care.
        </p>
      </div>

      {/* Grid containing checklist & resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Onboarding gates checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface-glass border border-hairline rounded-2xl p-6 shadow-rest backdrop-blur-xl">
            <h2 className="text-base font-bold text-brand-teal-deep mb-2 uppercase tracking-wider">
              Your Onboarding Checklist
            </h2>
            <p className="text-xs text-secondary leading-relaxed mb-6">
              Complete each gate sequentially. License and background clearance must resolve before you are authorized for independent clinical visits.
            </p>

            <div className="space-y-4">
              {gates.map((gate) => {
                const Icon = gate.icon;
                return (
                  <div 
                    key={gate.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/70 border border-hairline rounded-xl shadow-sm hover:bg-white/90 transition-all duration-fast"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 shrink-0 p-2 rounded-lg bg-tone-slate-bg border border-hairline text-brand-teal">
                        <Icon size={18} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-brand-teal-deep">{gate.title}</h3>
                        <p className="text-xs text-secondary mt-0.5 leading-relaxed">{gate.desc}</p>
                      </div>
                    </div>
                    
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold border shrink-0 sm:self-center self-start ${gate.statusColor}`}>
                      {gate.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Resources & Actions */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-surface-glass border border-hairline rounded-2xl p-6 shadow-rest backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-teal-deep font-mono">
              Onboarding Quick Links
            </h3>
            
            <div className="space-y-3">
              <Link 
                to="/journey"
                className="flex items-center justify-between p-3 bg-white border border-hairline rounded-xl shadow-sm hover:border-brand-teal/20 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap size={16} className="text-brand-teal" />
                  <span className="text-xs font-bold text-secondary">Start Coursework</span>
                </div>
                <ArrowRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link 
                to="/journey/appendix-f"
                className="flex items-center justify-between p-3 bg-white border border-hairline rounded-xl shadow-sm hover:border-brand-teal/20 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList size={16} className="text-brand-teal" />
                  <span className="text-xs font-bold text-secondary">Certificate Gates</span>
                </div>
                <ArrowRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link 
                to="/journey/guide"
                className="flex items-center justify-between p-3 bg-white border border-hairline rounded-xl shadow-sm hover:border-brand-teal/20 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen size={16} className="text-brand-teal" />
                  <span className="text-xs font-bold text-secondary">Read User Guide</span>
                </div>
                <ArrowRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Support Panel */}
          <div className="bg-surface-glass border border-hairline rounded-2xl p-6 shadow-rest backdrop-blur-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-teal-deep font-mono mb-2">
              Need Assistance?
            </h3>
            <p className="text-xs text-secondary leading-relaxed mb-4">
              If you have questions regarding your credentials, health check submissions, or supervisor visit locks:
            </p>
            <div className="bg-white/80 border border-hairline rounded-xl p-3 text-[11px] font-mono leading-loose text-secondary">
              <p className="flex justify-between border-b border-hairline pb-1.5 mb-1.5">
                <span className="font-bold text-brand-teal-deep">HR Hotline:</span>
                <span>(650) 555-0182</span>
              </p>
              <p className="flex justify-between">
                <span className="font-bold text-brand-teal-deep">Compliance:</span>
                <span>onboarding@careindeed.com</span>
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default NewHireScreen;
