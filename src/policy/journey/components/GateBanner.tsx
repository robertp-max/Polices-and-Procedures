import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface Props {
  tone: 'critical' | 'warn' | 'ok';
  title: string;
  body: string;
  cta?: { label: string; onClick: () => void };
}

export function GateBanner({ tone, title, body, cta }: Props) {
  const cfg = {
    critical: { color: '#DC2626', icon: <ShieldAlert size={22} /> },
    warn:     { color: '#ff8e52', icon: <ShieldAlert size={22} /> },
    ok:       { color: '#34D399', icon: <ShieldCheck  size={22} /> },
  }[tone];

  return (
    <div
      className="border rounded-2xl p-5 relative overflow-hidden mb-6"
      style={{
        borderColor: `${cfg.color}44`,
        background: `linear-gradient(145deg, ${cfg.color}12, transparent 60%)`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: `${cfg.color}22`, color: cfg.color }}>
          {cfg.icon ?? <Shield size={22} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-montserrat font-bold uppercase tracking-[0.3em] mb-1" style={{ color: cfg.color }}>
            {tone === 'critical' ? 'Hard Stop' : tone === 'warn' ? 'Action Required' : 'Cleared'}
          </div>
          <div className="font-montserrat font-bold text-white text-base mb-1">{title}</div>
          <div className="text-sm text-white/65 font-light leading-relaxed">{body}</div>
        </div>
        {cta && (
          <button
            onClick={cta.onClick}
            className="gradient-gold rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest shrink-0">
            {cta.label}
          </button>
        )}
      </div>
    </div>
  );
}
