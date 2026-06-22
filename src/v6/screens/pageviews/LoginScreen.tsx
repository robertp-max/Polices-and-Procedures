import { LockKeyhole, Mail, Key } from 'lucide-react';
import { Button, FormField, Input } from '../../primitives';

export function LoginScreen() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-canvas p-lg text-ink"
      data-group="Auth"
      data-hash-id="login-page"
      data-route="/login"
      data-template="login"
    >
      <section className="grid w-full max-w-modal-sm gap-lg rounded-xl border border-card bg-surface-glass p-2xl shadow-rest">
        <div className="flex justify-center mb-2xl">
          <img
            src="/ci-logo-gray.png"
            alt="Care Indeed"
            className="h-10 w-auto object-contain"
          />
        </div>

        <div className="grid gap-xs text-center mb-md">
          <h1 className="text-display font-medium text-ink">Sign In</h1>
          <p className="text-sm text-secondary">Enter your email and password to access the V6 compliance platform.</p>
        </div>

        <form className="grid gap-lg">
          <FormField label="Work Email Address">
            {(fieldProps) => (
              <div className="flex h-control items-center gap-sm rounded-lg border border-card bg-surface px-md text-muted focus-within:shadow-focus">
                <Mail aria-hidden="true" className="h-icon-sm w-icon-sm" />
                <Input {...fieldProps} placeholder="e.g. nurse@careindeed.com" type="email" />
              </div>
            )}
          </FormField>

          <FormField label="Security Password">
            {(fieldProps) => (
              <div className="flex h-control items-center gap-sm rounded-lg border border-card bg-surface px-md text-muted focus-within:shadow-focus">
                <Key aria-hidden="true" className="h-icon-sm w-icon-sm" />
                <Input {...fieldProps} placeholder="••••••••" type="password" />
              </div>
            )}
          </FormField>

          <div className="flex items-center justify-between text-xs text-muted mb-sm">
            <label className="flex items-center gap-xs">
              <input type="checkbox" className="rounded" />
              <span>Remember this device</span>
            </label>
            <a href="#forgot" className="hover:text-brand-teal">Forgot password?</a>
          </div>

          <Button iconLeft={<LockKeyhole aria-hidden="true" className="h-icon-sm w-icon-sm" />} type="submit">
            Sign In with Security Token
          </Button>
        </form>
      </section>
    </main>
  );
}
