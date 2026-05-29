/* ═══════════════════════════════════════════════════════════════════
   eCIgn document signature record store

   Stores document-specific signature records and their generated
   certificates. Each click-to-sign action creates exactly ONE record for the
   (taskId, formInstanceId, signatureSlot, signerUserId) tuple.

   Hard rules enforced here:
   - A signature record is created ONLY by an explicit click-to-sign action.
   - Creating a record never creates a form instance or a signer task.
   - Records reference the consent + signature profile that were active at the
     time of signing; historical records are never rewritten when profiles
     later change.
   ═══════════════════════════════════════════════════════════════════ */
import { create } from 'zustand';
import type { ECIgnCertificate, ECIgnSignatureRecord } from './types';

const RECORD_STORAGE_KEY = 'ci_ecign_signature_records_v1';
const CERT_STORAGE_KEY = 'ci_ecign_certificates_v1';

function load<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function persist<T>(key: string, value: T[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function buildSignatureRecordId(input: {
  taskId: string;
  formInstanceId: string;
  signatureSlot?: string;
  signerUserId: string;
}): string {
  const slot = input.signatureSlot ?? 'primary';
  const norm = (v: string) => String(v).replace(/[^A-Za-z0-9_-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return ['ECIGN-SIGREC', norm(input.taskId), norm(input.formInstanceId), norm(slot), norm(input.signerUserId)].join('-');
}

interface RecordStoreState {
  records: ECIgnSignatureRecord[];
  certificates: ECIgnCertificate[];
  upsertSignature: (record: ECIgnSignatureRecord, certificate: ECIgnCertificate) => void;
  getRecordById: (signatureId: string) => ECIgnSignatureRecord | null;
  getCertificateById: (certificateId: string) => ECIgnCertificate | null;
  getRecordForSlot: (taskId: string, formInstanceId: string, signatureSlot: string | undefined, signerUserId: string) => ECIgnSignatureRecord | null;
}

export const useEcignSignatureRecordStore = create<RecordStoreState>((set, get) => ({
  records: load<ECIgnSignatureRecord>(RECORD_STORAGE_KEY),
  certificates: load<ECIgnCertificate>(CERT_STORAGE_KEY),

  upsertSignature: (record, certificate) => {
    // Replace any existing record for the same deterministic id (idempotent),
    // but never create a second record for the same signing slot.
    const records = get().records.filter(r => r.signatureId !== record.signatureId);
    const certificates = get().certificates.filter(c => c.certificateId !== certificate.certificateId);
    const nextRecords = [...records, record];
    const nextCerts = [...certificates, certificate];
    persist(RECORD_STORAGE_KEY, nextRecords);
    persist(CERT_STORAGE_KEY, nextCerts);
    set({ records: nextRecords, certificates: nextCerts });
  },

  getRecordById: (signatureId) => get().records.find(r => r.signatureId === signatureId) ?? null,
  getCertificateById: (certificateId) => get().certificates.find(c => c.certificateId === certificateId) ?? null,
  getRecordForSlot: (taskId, formInstanceId, signatureSlot, signerUserId) => {
    const id = buildSignatureRecordId({ taskId, formInstanceId, signatureSlot, signerUserId });
    return get().records.find(r => r.signatureId === id) ?? null;
  },
}));
