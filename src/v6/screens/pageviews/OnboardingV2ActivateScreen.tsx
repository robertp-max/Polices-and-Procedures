import { UserPlus, Save, AlertCircle } from 'lucide-react';
import { ToneTag } from '../../components';
import { Button, FormField, Input, Select, ToneBadge } from '../../primitives';

const triggerOptions = [
  { value: 'offer', label: 'Offer Letter Signed' },
  { value: 'transfer', label: 'Inter-agency Transfer' },
  { value: 'rehire', label: 'Rehire Activation' },
];

const roleOptions = [
  { value: 'rn', label: 'Registered Nurse (RN)' },
  { value: 'lvn', label: 'Licensed Vocational Nurse (LVN)' },
  { value: 'hha', label: 'Home Health Aide (HHA)' },
  { value: 'pt', label: 'Physical Therapist (PT)' },
];

export function OnboardingV2ActivateScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-activate"
      data-route="/onboarding-v2/activate"
      data-template="detail"
    >
      <section className="flex flex-wrap items-start justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
        <div className="grid gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <ToneTag>/onboarding-v2/activate</ToneTag>
            <ToneTag tone="slate">onboarding-v2-activate</ToneTag>
            <ToneTag tone="slate">detail</ToneTag>
            <ToneTag tone="teal">Onboarding v2</ToneTag>
          </div>
          <div className="grid gap-xs">
            <h2 className="text-h2 font-medium text-ink">Onboarding Activation Form</h2>
            <p className="max-w-content text-sm text-secondary">
              Activate subject with pre-creation reconciliation and role gating configurations.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <Button iconLeft={<Save aria-hidden="true" className="h-icon-sm w-icon-sm" />}>
            Activate Subject
          </Button>
        </div>
      </section>

      <div className="grid gap-xl desktop:grid-cols-3">
        <div className="grid gap-lg desktop:col-span-2">
          <form className="grid gap-lg rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink border-b border-hairline pb-sm flex items-center gap-sm">
              <UserPlus aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Activation Details
            </h3>

            <div className="grid gap-md tablet-l:grid-cols-2">
              <FormField label="Subject Full Name">
                {(props) => <Input {...props} placeholder="e.g. John Doe" />}
              </FormField>
              <FormField label="Email Address">
                {(props) => <Input {...props} placeholder="e.g. john.doe@agency.com" type="email" />}
              </FormField>
            </div>

            <div className="grid gap-md tablet-l:grid-cols-2">
              <FormField label="Activation Trigger">
                {(props) => <Select {...props} options={triggerOptions} />}
              </FormField>
              <FormField label="Assigned Role Track">
                {(props) => <Select {...props} options={roleOptions} />}
              </FormField>
            </div>

            <div className="grid gap-md">
              <FormField label="Reconciliation Notes / Override Rationale">
                {(props) => <Input {...props} placeholder="Provide override or activation context details..." />}
              </FormField>
            </div>
          </form>
        </div>

        <aside className="grid content-start gap-lg" aria-label="Reconciliation preview">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <AlertCircle aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-orange-text" />
              Reconciliation Preview
            </h3>
            <p className="text-sm text-secondary mb-md">
              Verification locks and gate prerequisites that will be established immediately upon activation.
            </p>
            <div className="grid gap-sm">
              <div className="rounded-md bg-tone-slate-bg p-md flex items-center justify-between">
                <span className="text-sm text-secondary">Gate 1: Background</span>
                <ToneBadge size="sm" status="pending" />
              </div>
              <div className="rounded-md bg-tone-slate-bg p-md flex items-center justify-between">
                <span className="text-sm text-secondary">Gate 2: Credentials</span>
                <ToneBadge size="sm" status="locked" />
              </div>
              <div className="rounded-md bg-tone-slate-bg p-md flex items-center justify-between">
                <span className="text-sm text-secondary">Gate 3: Health Screening</span>
                <ToneBadge size="sm" status="locked" />
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
