import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MasterControlsScreen } from '@/v6/screens/pageviews/MasterControlsScreen';
import { MASTER_CONTROL_DOCUMENTATION_RECORDS, MASTER_CONTROL_MISSING_DOCUMENTATION_ROWS } from './masterControlDocumentation.generated';
import { deriveReadinessStatus, loadMasterControlInventorySeed } from './masterControlInventory';

const CTRL001_BATCH1_DOCS = [
  ['MCDOC-CTRL-001-ADMISSION-CONSENT', 'Admission Consent / Agreement / Acknowledgment', /Admission consent confirms that the patient or authorized representative/],
  ['MCDOC-CTRL-001-HIPAA-NPP-ACKNOWLEDGMENT', 'HIPAA Notice of Privacy Practices Acknowledgment', /HIPAA NPP acknowledgment documents that the agency asks the patient/],
  ['MCDOC-CTRL-001-ADVANCE-DIRECTIVE-NOTICE', 'Advance Directive Notice and Acknowledgment', /Advance directive notice and acknowledgment confirms/],
  ['MCDOC-CTRL-001-PHOTO-AUTHORIZATION', 'Permission to Photograph for Care Purposes', /Permission to photograph documents whether the patient/],
  ['MCDOC-CTRL-001-PERSONAL-FUNDS-AUTHORIZATION', 'Personal Funds Authorization / Refusal', /Personal funds authorization\/refusal documents/],
  ['MCDOC-CTRL-001-VEHICLE-AUTHORIZATION', 'Vehicle Use Authorization / Refusal', /Vehicle use authorization\/refusal documents/],
  ['MCDOC-CTRL-001-FINANCIAL-RESPONSIBILITY', 'Consumer Liability for Payment / Financial Responsibility Notice', /Consumer liability for payment\/financial responsibility notice documents/],
] as const;

const REQUIRED_BATCH1_SECTION_HEADINGS = [
  'Purpose',
  'Required Content',
  'Patient/Representative Acknowledgment Requirement',
  'Runtime Evidence Expectations',
  'Surveyor Explanation',
  'Template-only / no-PHI warning',
] as const;

describe('master control dossiers', () => {
  beforeAll(() => {
    const payload = readFileSync(path.resolve(process.cwd(), 'public/data/MASTER_CONTROL_INVENTORY_DATA_MODEL.json'), 'utf8');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(payload, { status: 200, headers: { 'content-type': 'application/json' } })));
  });

  it('has no duplicate control, document, evidence, or signoff IDs', async () => {
    const controls = await loadMasterControlInventorySeed();
    const ids = controls.map((control) => control.id);
    const docIds = controls.flatMap((control) => control.documentRefs.map((doc) => doc.documentId));
    const documentationIds = controls.flatMap((control) => control.documentationRecords.map((doc) => doc.documentId));
    const evidenceIds = controls.flatMap((control) => control.evidenceRequirements.map((evidence) => evidence.evidenceId));
    const signoffIds = controls.flatMap((control) => control.signoffRequirements.map((signoff) => signoff.signoffId));
    const logIds = controls.flatMap((control) => control.verificationLogs.map((log) => log.logId));

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(docIds).size).toBe(docIds.length);
    expect(new Set(documentationIds).size).toBe(documentationIds.length);
    expect(new Set(evidenceIds).size).toBe(evidenceIds.length);
    expect(new Set(signoffIds).size).toBe(signoffIds.length);
    expect(new Set(logIds).size).toBe(logIds.length);
  });

  it('has no HIGH risk control without a required signoff', async () => {
    const controls = await loadMasterControlInventorySeed();
    const offenders = controls.filter((control) => control.riskTier === 'HIGH' && !control.signoffRequirements.some((signoff) => signoff.requiredForReadiness));
    expect(offenders).toEqual([]);
  });

  it('does not mark seeded controls OK without runtime evidence/signoff completion', async () => {
    const controls = await loadMasterControlInventorySeed();
    expect(controls.some((control) => control.readinessStatus === 'OK')).toBe(false);
  });

  it('blocks readiness when required documentation body is missing', async () => {
    const controls = await loadMasterControlInventorySeed();
    const ctrl001 = controls.find((control) => control.id === 'CTRL-001');
    expect(ctrl001).toBeTruthy();
    if (!ctrl001) return;

    const documentationRecords = ctrl001.documentationRecords.map((record) =>
      record.documentId === 'MCDOC-CTRL-001-PATIENT-BILL-OF-RIGHTS' ? { ...record, body: [] } : record,
    );

    expect(deriveReadinessStatus({
      documentRefs: ctrl001.documentRefs,
      documentationRecords,
      evidenceRequirements: ctrl001.evidenceRequirements,
      signoffRequirements: ctrl001.signoffRequirements,
      sourceStatus: 'COMPLIANT',
    })).toBe('DOCUMENTATION_MISSING');
  });

  it('includes the CTRL-001 Patient Bill of Rights admission packet template reference', async () => {
    const controls = await loadMasterControlInventorySeed();
    const ctrl001 = controls.find((control) => control.id === 'CTRL-001');
    expect(ctrl001?.documentRefs.some((doc) => doc.documentId === 'MCDOC-CTRL-001-PATIENT-BILL-OF-RIGHTS' && doc.templateOnly)).toBe(true);
    expect(ctrl001?.documentationRecords.some((doc) => doc.documentId === 'MCDOC-CTRL-001-PATIENT-BILL-OF-RIGHTS' && doc.body.length > 0)).toBe(true);
  });

  it('includes created Batch 1 CTRL-001 admission packet documentation records', async () => {
    const controls = await loadMasterControlInventorySeed();
    const ctrl001 = controls.find((control) => control.id === 'CTRL-001');
    expect(ctrl001).toBeTruthy();
    if (!ctrl001) return;

    for (const [documentId, title] of CTRL001_BATCH1_DOCS) {
      expect(ctrl001.documentRefs).toEqual(expect.arrayContaining([
        expect.objectContaining({ documentId, title, required: true, templateOnly: true }),
      ]));
      const record = MASTER_CONTROL_DOCUMENTATION_RECORDS.find((entry) => entry.documentId === documentId);
      expect(record).toEqual(expect.objectContaining({
        documentId,
        controlId: 'CTRL-001',
        title,
        templateOnly: true,
      }));
      expect(record?.body.map((section) => section.heading)).toEqual(REQUIRED_BATCH1_SECTION_HEADINGS);
      expect(record?.body.every((section) => section.body.length > 0)).toBe(true);
    }
  });

  it('has documentation bodies and verification log required fields', async () => {
    const controls = await loadMasterControlInventorySeed();
    for (const control of controls) {
      for (const docRef of control.documentRefs) {
        const record = control.documentationRecords.find((doc) => doc.documentId === docRef.documentId);
        expect(record).toBeTruthy();
        expect(record?.body.length).toBeGreaterThan(0);
        expect(record?.body.every((section) => section.heading || section.body)).toBe(true);
      }
      for (const log of control.verificationLogs) {
        expect(log.performedByName).toBeTruthy();
        expect(log.performedByRole).toBeTruthy();
        expect(log.performedAt).toBeTruthy();
        expect(log.evidenceReviewed.length).toBeGreaterThan(0);
        expect(log.nextDueDate).toBeTruthy();
        expect(log.auditTrailId).toBeTruthy();
      }
    }
  });

  it('does not seed fake completed evidence reviews or signed signoffs', async () => {
    const controls = await loadMasterControlInventorySeed();
    const logs = controls.flatMap((control) => control.verificationLogs);
    expect(logs.some((log) => log.signatureStatus === 'signed' || log.signedAt || log.signedByName)).toBe(false);
    expect(logs.flatMap((log) => log.evidenceReviewed).some((evidence) => evidence.status === 'accepted')).toBe(false);
  });

  it('maintains the missing documentation report entries after Batch 1 drafting', () => {
    const createdCtrl001Ids = [
      'MCDOC-CTRL-001-PATIENT-BILL-OF-RIGHTS',
      ...CTRL001_BATCH1_DOCS.map(([documentId]) => documentId),
    ];

    for (const documentId of createdCtrl001Ids) {
      expect(MASTER_CONTROL_MISSING_DOCUMENTATION_ROWS).toEqual(expect.arrayContaining([
        expect.objectContaining({
          recommendedDocumentId: documentId,
          requiredDocumentationMissing: 'Created',
          draftingPriority: 'created',
          needsClaudeDraft: false,
        }),
      ]));
    }

    const unresolved = MASTER_CONTROL_MISSING_DOCUMENTATION_ROWS.filter((row) => row.needsClaudeDraft);
    expect(unresolved.some((row) => row.controlId === 'CTRL-001')).toBe(false);
    expect(unresolved.every((row) => row.requiredDocumentationMissing === 'NEEDS_DRAFT')).toBe(true);
    expect(unresolved.map((row) => row.controlId)).toEqual([
      'CTRL-002',
      'CTRL-003',
      'CTRL-004',
      'CTRL-005',
      'CTRL-015',
      'CTRL-019',
      'CTRL-105',
      'CTRL-106',
      'CTRL-107',
      'CTRL-108',
      'CTRL-109',
      'CTRL-110',
      'CTRL-111',
      'CTRL-112',
      'CTRL-113',
      'CTRL-114',
      'CTRL-115',
      'CTRL-116',
    ]);
  });

  it('includes CTRL-105 through CTRL-116', async () => {
    const controls = await loadMasterControlInventorySeed();
    for (let i = 105; i <= 116; i += 1) {
      expect(controls.some((control) => control.id === `CTRL-${i}`)).toBe(true);
    }
  });

  it('opens the Control Dossier modal when a row is clicked', async () => {
    render(<MemoryRouter initialEntries={['/compliance/master-controls']}><MasterControlsScreen /></MemoryRouter>);
    const rowControl = await screen.findByText('CTRL-001');
    fireEvent.click(rowControl);
    await waitFor(() => expect(screen.getByRole('dialog', { name: /CTRL-001 control dossier/i })).toBeTruthy());
    fireEvent.click(screen.getByText('Required Documents'));
    fireEvent.click(screen.getByText('Patient Bill of Rights / Client Rights & Responsibilities'));
    expect(screen.getByText('Patient / Client Rights')).toBeTruthy();
    expect(screen.getByText('Required Acknowledgment Evidence')).toBeTruthy();
    expect(screen.getByText('Runtime Evidence ID')).toBeTruthy();
    expect(screen.getByText('Template-only / no-PHI warning')).toBeTruthy();
    fireEvent.click(screen.getByText('Documentation'));
    expect(screen.getByText('Template/control documentation only. Do not store PHI in seed data. Completed patient copies attach later as runtime evidence only.')).toBeTruthy();
  });

  it('opens the requested vendor BAA dossier from a control deep link', async () => {
    render(
      <MemoryRouter initialEntries={['/compliance/master-controls?control=CTRL-042&source=ehr-mvp']}>
        <MasterControlsScreen />
      </MemoryRouter>,
    );

    const dossier = await screen.findByRole('dialog', { name: /CTRL-042 control dossier/i });
    expect(dossier).toBeTruthy();
    expect(within(dossier).getByText('Business Associate Agreement (BAA) Inventory & Lifecycle')).toBeTruthy();
  });

  it('expands HIPAA NPP and Advance Directive required-document cards inline', async () => {
    render(<MemoryRouter initialEntries={['/compliance/master-controls']}><MasterControlsScreen /></MemoryRouter>);
    fireEvent.click(await screen.findByText('CTRL-001'));
    await waitFor(() => expect(screen.getByRole('dialog', { name: /CTRL-001 control dossier/i })).toBeTruthy());
    fireEvent.click(screen.getByText('Required Documents'));

    fireEvent.click(screen.getByText('HIPAA Notice of Privacy Practices'));
    expect(screen.getByText('Notice Delivery Expectation')).toBeTruthy();
    expect(screen.getByText('Acknowledgment and Refusal')).toBeTruthy();

    fireEvent.click(screen.getByText('Advance Directive Information Notice'));
    expect(screen.getByText('Patient Choice Options')).toBeTruthy();
    expect(screen.getAllByText('Runtime Evidence Expectations').length).toBeGreaterThanOrEqual(2);
  });

  it('expands every Batch 1 CTRL-001 required-document card inline with body copy', async () => {
    render(<MemoryRouter initialEntries={['/compliance/master-controls']}><MasterControlsScreen /></MemoryRouter>);
    fireEvent.click(await screen.findByText('CTRL-001'));
    await waitFor(() => expect(screen.getByRole('dialog', { name: /CTRL-001 control dossier/i })).toBeTruthy());
    fireEvent.click(screen.getByText('Required Documents'));

    for (const [, title, bodyPattern] of CTRL001_BATCH1_DOCS) {
      fireEvent.click(screen.getByText(title));
      expect(screen.getByText(bodyPattern)).toBeTruthy();
    }

    expect(screen.queryByText('DOCUMENTATION MISSING')).toBeNull();
    fireEvent.click(screen.getByText('Documentation'));
    expect(screen.getByText('MCDOC-CTRL-001-ADMISSION-CONSENT')).toBeTruthy();
    expect(screen.getByText('MCDOC-CTRL-001-FINANCIAL-RESPONSIBILITY')).toBeTruthy();
  });

  it('renders verification and sign-off log support fields without fake completion', async () => {
    render(<MemoryRouter initialEntries={['/compliance/master-controls']}><MasterControlsScreen /></MemoryRouter>);
    fireEvent.click(await screen.findByText('CTRL-001'));
    await waitFor(() => expect(screen.getByRole('dialog', { name: /CTRL-001 control dossier/i })).toBeTruthy());
    fireEvent.click(screen.getByText('Sign-Off'));

    expect(screen.getByText('Verification / Sign-Off Log')).toBeTruthy();
    expect(screen.getByText('Verifier name')).toBeTruthy();
    expect(screen.getByText('Role / title')).toBeTruthy();
    expect(screen.getByText('Verification period')).toBeTruthy();
    expect(screen.getByText('Performed date/time')).toBeTruthy();
    expect(screen.getByText('Evidence reviewed')).toBeTruthy();
    expect(screen.getByText('Findings')).toBeTruthy();
    expect(screen.getByText('Deficiencies')).toBeTruthy();
    expect(screen.getByText('Corrective action required')).toBeTruthy();
    expect(screen.getByText('Next due date')).toBeTruthy();
    expect(screen.getByText('Signature/eCIgn status')).toBeTruthy();
    expect(screen.getByText('Audit trail ID')).toBeTruthy();
    expect(screen.getAllByText('No completed sign-off seeded').length).toBeGreaterThanOrEqual(1);
  });
});
