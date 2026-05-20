import React, { useState } from 'react'
import { V3AuthLayout } from './components/V3AuthLayout'

// ============================================================
// V3ForgotPreview — Updated per ClaudeX2 (X2-05)
// Two-phase flow with v3-subview-animate on success state
// ============================================================

export function V3ForgotPreview() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 800);
  };

  return (
    <V3AuthLayout title="CareIndeed" subtitle="The Heart of Home Health">
      <div className="text-center mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--v3-text-tertiary)]">
          ACCOUNT RECOVERY
        </div>
        <h2 className="text-[18px] font-semibold mt-2">Reset Password</h2>
      </div>

      {!isSubmitted ? (
        <>
          <p className="text-[13px] text-[var(--v3-text-secondary)] text-center mb-6">
            Enter your registered email. We'll send a secure reset link.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--v3-text-tertiary)] mb-1.5">
                Email
              </label>
              <div className="v3-input-wrapper">
                <span>✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@careindeed.com"
                  required
                  className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--v3-text-primary)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="v3-btn-primary mt-2"
            >
              {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>

          <div className="text-center mt-5 text-[12px] text-[var(--v3-text-secondary)]">
            <span className="text-[var(--v3-accent-teal-light)] cursor-pointer">Back to Sign In</span>
          </div>
        </>
      ) : (
        <div className="v3-subview-animate text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-[var(--v3-text-primary)] mb-2">Check your email</h3>
          <p className="text-[var(--v3-text-secondary)]">
            We sent a secure reset link to <strong>{email}</strong>
          </p>
        </div>
      )}
    </V3AuthLayout>
  );
}
