import React, { useState } from 'react'
import { V3AuthLayout } from './components/V3AuthLayout'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

// ============================================================
// V3LoginPreview — EXACT MATCH to PDF Login screenshot + ClaudeX2 V3 reskin (FILE 4)
// Full-bleed V3AuthLayout canvas, grid bg, 0.33 Q3 watermark, 440px glass auth-card (20px radius),
// CI gradient logo, exact typography/spacing, lucide icons, glass input wrappers, teal SIGN IN btn w/ arrow,
// bottom links bar. NO extra wrapper chrome. Pure visual reference for batch staging comparison.
// ============================================================

export function V3LoginPreview() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      alert('Login would succeed — V3 auth preview (exact ClaudeX2 reskin match to PDF)');
      setIsLoading(false);
    }, 600);
  };

  return (
    <V3AuthLayout>
      {/* Logo + Brand — exact per ClaudeX2 + PDF reference (centered, 56px CI, gradient, 40px mb) */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, var(--v3-teal), rgba(0,121,112,0.5))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: 20, fontWeight: 700, color: '#fff',
        }}>CI</div>
        <h1 style={{
          fontSize: 22, fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.5px',
          background: 'linear-gradient(to bottom, #fff, #A8B0C0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>CareIndeed</h1>
        <p style={{ fontSize: 12, color: 'var(--v3-text-tertiary)', margin: 0 }}>
          The Heart of Home Health
        </p>
      </div>

      {/* Eyebrow header — COMPLIANCE + Sign In (exact tracking, sizes from PDF/ClaudeX2) */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '1.5px', color: 'var(--v3-text-tertiary)',
        }}>COMPLIANCE PLATFORM</span>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: '8px 0 0' }}>Sign In</h2>
      </div>

      {/* Form — gap 16px, labels exact 11px/600/0.5px tracking, mb-6px */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Email */}
        <div>
          <label style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.5px', color: 'var(--v3-text-tertiary)',
            display: 'block', marginBottom: 6,
          }}>Email</label>
          <div className="v3-input-wrapper">
            <Mail size={16} color="var(--v3-text-tertiary)" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@careindeed.com"
              required
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: 14, color: 'var(--v3-text-primary)' }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.5px', color: 'var(--v3-text-tertiary)',
            display: 'block', marginBottom: 6,
          }}>Password</label>
          <div className="v3-input-wrapper">
            <Lock size={16} color="var(--v3-text-tertiary)" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: 14, color: 'var(--v3-text-primary)' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--v3-text-tertiary)' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* SIGN IN button — teal-light bg, 700 weight, includes ArrowRight, mt-4 per spec */}
        <button
          type="submit"
          disabled={isLoading}
          className="v3-btn-primary"
          style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {isLoading ? 'Signing in...' : 'SIGN IN'}
          {!isLoading && <ArrowRight size={16} />}
        </button>
      </form>

      {/* Bottom links bar — exact per ClaudeX2 spec + PDF (flex space-between, border-top, teal for register) */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: 20,
        paddingTop: 16, borderTop: '1px solid var(--v3-border)',
      }}>
        <span style={{ fontSize: 13, color: 'var(--v3-teal-light)', textDecoration: 'none', fontWeight: 500, cursor: 'pointer' }}>
          Register
        </span>
        <span style={{ fontSize: 13, color: 'var(--v3-text-secondary)', textDecoration: 'none', cursor: 'pointer' }}>
          Forgot password?
        </span>
      </div>
    </V3AuthLayout>
  );
}
