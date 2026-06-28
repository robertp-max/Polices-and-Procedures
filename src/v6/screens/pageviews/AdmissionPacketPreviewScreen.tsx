import {
  buildAdmissionPacketPages,
  PatientAdmissionPacket,
  sampleAdmissionPacketData,
} from '@/policy/admission/patientAdmissionPacket';

export function AdmissionPacketPreviewScreen() {
  const pages = buildAdmissionPacketPages(sampleAdmissionPacketData);

  return (
    <section className="grid gap-xl" data-route="/evidence/admission-packet-preview" data-template="evidence">
      <div className="rounded-lg border border-card bg-surface-glass p-lg shadow-rest backdrop-blur-md shadow-glass-inset">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-orange">DefenCIble template preview</p>
        <h1 className="mt-xs text-h2 font-medium text-ink">Patient Admission Packet</h1>
        <p className="mt-sm text-sm text-secondary">
          Fixed multi-page renderer. This preview emits {pages.length} semantic page nodes using
          <code className="mx-xs rounded bg-surface-hover px-xs">.ci-admission-page</code>
          so print/PDF capture can collect every page.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-card bg-surface-glass p-lg shadow-rest backdrop-blur-md shadow-glass-inset">
        <PatientAdmissionPacket data={sampleAdmissionPacketData} />
      </div>
    </section>
  );
}

export default AdmissionPacketPreviewScreen;
