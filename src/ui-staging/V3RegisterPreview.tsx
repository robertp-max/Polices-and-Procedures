import React, { useState } from 'react'
import { V3AuthLayout } from './components/V3AuthLayout'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

// ============================================================
// V3RegisterPreview — Updated per ClaudeX2 (X2-05)
// Reworked auth using V3AuthLayout + centralized classes
// ============================================================

export function V3RegisterPreview() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      alert('Registration would succeed (ClaudeX2 V3 auth preview)');
      setIsLoading(false);
    }, 800);
  };

  return (
    <V3AuthLayout title="CareIndeed" subtitle="The Heart of Home Health">
      <div className="text-center mb-6">
        <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-[var(--v3-text-tertiary)]">
          NEW ACCOUNT
        </div>
        <h2 className="text-[18px] font-semibold mt-2">Register</h2>
        <p className="text-[13px] text-[var(--v3-text-secondary)] mt-1.5">
          Only pre-approved personnel may create accounts.
        </p>
      </div>

      {error && (
        <div className="v3-auth-error mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--v3-text-tertiary)] mb-1.5">
            Full Name
          </label>
          <div className="v3-input-wrapper">
            <User size={16} className="text-[var(--v3-text-tertiary)]" />
            <input
              value={form.name}
              onChange={update('name')}
              placeholder="Jane Doe"
              type="text"
              required
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--v3-text-primary)]"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--v3-text-tertiary)] mb-1.5">
            Email
          </label>
          <div className="v3-input-wrapper">
            <Mail size={16} className="text-[var(--v3-text-tertiary)]" />
            <input
              value={form.email}
              onChange={update('email')}
              placeholder="you@careindeed.com"
              type="email"
              required
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--v3-text-primary)]"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--v3-text-tertiary)] mb-1.5">
            Password
          </label>
          <div className="v3-input-wrapper">
            <Lock size={16} className="text-[var(--v3-text-tertiary)]" />
            <input
              value={form.password}
              onChange={update('password')}
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              required
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--v3-text-primary)]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[var(--v3-text-tertiary)] hover:text-[var(--v3-text-primary)]"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.5px] text-[var(--v3-text-tertiary)] mb-1.5">
            Confirm Password
          </label>
          <div className="v3-input-wrapper">
            <Lock size={16} className="text-[var(--v3-text-tertiary)]" />
            <input
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              placeholder="••••••••"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--v3-text-primary)]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-[var(--v3-text-tertiary)] hover:text-[var(--v3-text-primary)]"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="v3-btn-primary mt-2"
        >
          {isLoading ? 'Registering...' : 'CREATE ACCOUNT'}
        </button>
      </form>

      <div className="text-center mt-5 pt-4 border-t border-[var(--v3-border)] text-[13px]">
        <span className="text-[var(--v3-accent-teal-light)]">Already have an account? Sign in</span>
      </div>
    </V3AuthLayout>
  );
}
