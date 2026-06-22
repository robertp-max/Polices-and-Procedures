import { UserPlus, AlertCircle } from 'lucide-react';
import { FormField, Input, Select, ToneBadge } from '../../primitives';

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
      className="grid gap-lg"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-activate"
      data-route="/onboarding-v2/activate"
      data-template="detail"
    >
      <div className="grid gap-lg desktop:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="grid content-start gap-md">
          <form className="grid gap-md rounded-lg border border-card bg-surface p-lg shadow-rest">
            <h3 className="flex items-center gap-sm border-b border-hairline pb-sm text-h3 font-medium text-ink">
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

        <aside className="grid content-start gap-md" aria-label="Reconciliation preview">
          <section className="rounded-lg border border-card bg-surface p-lg shadow-rest">
            <h3 className="mb-md flex items-center gap-sm text-h3 font-medium text-ink">
              <AlertCircle aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-orange-text" />
              Reconciliation Preview
            </h3>
            <p className="mb-md text-sm text-secondary">
              Verification locks and gate prerequisites that will be established immediately upon activation.
            </p>
            <div className="grid gap-sm">
              <div className="flex items-center justify-between rounded-md bg-tone-slate-bg p-sm">
                <span className="text-sm text-secondary">Gate 1: Background</span>
                <ToneBadge size="sm" status="pending" />
              </div>
              <div className="flex items-center justify-between rounded-md bg-tone-slate-bg p-sm">
                <span className="text-sm text-secondary">Gate 2: Credentials</span>
                <ToneBadge size="sm" status="locked" />
              </div>
              <div className="flex items-center justify-between rounded-md bg-tone-slate-bg p-sm">
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

export default OnboardingV2ActivateScreen;
