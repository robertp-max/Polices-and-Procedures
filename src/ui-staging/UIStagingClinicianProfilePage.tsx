import { V3WorkbenchShell } from './components/V3WorkbenchShell'
import './ui-staging.css'

export function UIStagingClinicianProfilePage() {
  return (
    <V3WorkbenchShell
      title="Amara Okonkwo, RN"
      subtitle="Clinician Intelligence — Full FEHA + Credential Profile"
      searchPlaceholder="Search files..."
    >
      <section className="v3-profile-canvas flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
        
        {/* Profile Header Block */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1c2029] to-[#0f1116] border border-[#2A2F3A] flex items-center justify-center text-3xl font-light text-[#007970] shadow-2xl">
            RS
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-light text-[#f1f3f7]">Amara Okonkwo</h2>
              <span className="px-2 py-0.5 rounded-full border border-[#007970]/30 text-[9px] font-bold text-[#007970] uppercase tracking-widest bg-[#007970]/10">Active</span>
            </div>
            <p className="text-[#a8b0c0] text-sm font-medium mb-4">RN — Wound Care &amp; OASIS Specialist • North Bay • W2 • FEHA Sabbath Observer</p>
            
            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2 text-[11px] text-[#6c7588]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#007970]" />
                  licensed_ca_00293
               </div>
               <div className="flex items-center gap-2 text-[11px] text-[#6c7588]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E07B2C]" />
                  98% Documentation Accuracy
               </div>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-repeating-linear-gradient(to right, rgba(241,243,247,0.05) 0 8px, transparent 8px 12px)" />

        {/* Info Grid - Broken Line Separated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Primary Region', value: 'South Bay Area', detail: 'San Jose, Campbell, Cupertino', color: 'teal' },
            { label: 'Patient Load', value: '14 Active', detail: '2 high-acuity assignments', color: 'teal' },
            { label: 'Next Renewal', value: 'Nov 2026', detail: '3 certifications pending review', color: 'orange' },
          ].map((info, i) => (
            <div key={i} className="v3-surface-card p-6 rounded-2xl border border-[rgba(241,243,247,0.08)] bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
              <span className="text-[9px] uppercase tracking-widest text-[#6c7588] font-bold block mb-2">{info.label}</span>
              <span className="text-lg font-light text-[#f1f3f7] block mb-1">{info.value}</span>
              <span className="text-[11px] text-[#a8b0c0] leading-relaxed">{info.detail}</span>
            </div>
          ))}
        </div>

        {/* Content Tabs / Lower Section */}
        <div className="v3-content-frame rounded-3xl border border-[rgba(241,243,247,0.08)] bg-white/[0.01] overflow-hidden">
           <header className="px-6 py-4 border-b border-[rgba(241,243,247,0.05)] flex items-center justify-between bg-black/10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#6c7588]">Upcoming Schedule</h3>
              <div className="flex gap-4">
                 <button className="text-[10px] font-bold text-[#007970] uppercase hover:underline">View Full Calendar</button>
              </div>
           </header>
           <div className="p-0">
             {[
               { patient: 'Blessing Adeyemi', service: 'Wound Assessment + OASIS', time: '2026-05-19 09:00 AM', status: 'Confirmed' },
               { patient: 'Soren Eriksson', service: 'Personal Care (HHA)', time: '2026-05-20 14:00 PM', status: 'Pending Prep' },
               { patient: 'Tobias Johansson', service: 'Cardiac Vitals + Meds', time: '2026-05-21 10:30 AM', status: 'Confirmed' },
             ].map((visit, i) => (
                <div key={i} className="px-6 py-5 border-b border-[rgba(241,243,247,0.03)] hover:bg-white/[0.02] flex items-center justify-between transition-colors cursor-pointer group">
                   <div className="flex gap-4 items-center">
                      <div className="w-1 h-8 rounded-full bg-[#007970]/40 group-hover:bg-[#007970]" />
                      <div>
                        <span className="text-sm font-medium text-[#f1f3f7] block">{visit.patient}</span>
                        <span className="text-[11px] text-[#6c7588]">{visit.service}</span>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="text-[11px] text-[#a8b0c0] block mb-0.5">{visit.time}</span>
                      <span className="text-[9px] font-bold text-[#007970] uppercase tracking-wider">{visit.status}</span>
                   </div>
                </div>
             ))}
           </div>
        </div>

      </section>
    </V3WorkbenchShell>
  )
}
