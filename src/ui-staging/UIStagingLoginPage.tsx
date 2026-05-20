import { V3WorkbenchShell } from './components/V3WorkbenchShell'
import ciLogoWhite from '@/assets/ci-logo-white.png'
import './ui-staging.css'

export function UIStagingLoginPage() {
  return (
    <V3WorkbenchShell
      title="System Access"
      subtitle="Security Gateway"
      searchPlaceholder="Documentation..."
    >
      <section className="v3-login-canvas flex items-center justify-center py-12 animate-in fade-in zoom-in-95 duration-1000">
        <div className="v3-login-container w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-[2.5rem] border border-[rgba(241,243,247,0.08)] bg-white/[0.01] overflow-hidden shadow-2xl">
          
          {/* Hero Side */}
          <div className="relative p-12 flex flex-col justify-center bg-gradient-to-br from-[#1c2029] to-[#0f1116] overflow-hidden">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,_var(--v3-accent-teal)_0%,_transparent_60%)]" />
             <img className="w-48 mb-8 relative z-10 grayscale opacity-80" src={ciLogoWhite} alt="Care Indeed" />
             <h2 className="text-3xl font-light text-[#f1f3f7] leading-tight mb-4 relative z-10">
               Operational Intelligence <br/> 
               <span className="text-[#007970]">Refined.</span>
             </h2>
             <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#6c7588] relative z-10">Care Indeed Home Health V3</p>
          </div>

          {/* Form Side */}
          <div className="p-12 bg-black/20 flex flex-col justify-center relative">
            {/* Broken vertical separator (internal) */}
            <div className="absolute left-0 top-12 bottom-12 w-px bg-dashed-broken opacity-30 hidden md:block" />

            <div className="mb-8">
              <h3 className="text-xl font-light text-[#f1f3f7] mb-1">Welcome back</h3>
              <p className="text-xs text-[#6c7588]">Authorized personnel access only.</p>
            </div>

            <form className="space-y-6" onSubmit={e => e.preventDefault()}>
               <div className="space-y-2">
                  <label className="text-[9px] uppercase tracking-widest font-bold text-[#6c7588]">Identifier</label>
                  <input 
                    type="email" 
                    placeholder="name@careindeed.com" 
                    className="w-full bg-white/[0.03] border border-[rgba(241,243,247,0.08)] rounded-xl py-3 px-4 text-sm text-[#f1f3f7] outline-none focus:border-[#007970] transition-colors"
                  />
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] uppercase tracking-widest font-bold text-[#6c7588]">Credential</label>
                    <button className="text-[9px] uppercase tracking-widest font-bold text-[#007970] hover:underline">Reset</button>
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-white/[0.03] border border-[rgba(241,243,247,0.08)] rounded-xl py-3 px-4 text-sm text-[#f1f3f7] outline-none focus:border-[#007970] transition-colors"
                  />
               </div>

               <button className="w-full bg-gradient-to-r from-[#007970] to-[#00A99D] text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#007970]/10 hover:shadow-[#007970]/30 transition-all active:scale-95">
                 Authenticate
               </button>

               <div className="pt-4 flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E07B2C]" />
                  <span className="text-[10px] text-[#6c7588]">Biometric secondary bypass enabled.</span>
               </div>
            </form>
          </div>
        </div>
      </section>
    </V3WorkbenchShell>
  )
}
