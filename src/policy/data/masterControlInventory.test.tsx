import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { MasterControlsScreen } from '@/v6/screens/pageviews/MasterControlsScreen';
import { MASTER_CONTROL_MISSING_DOCUMENTATION_ROWS } from './masterControlDocumentation.generated';
import { deriveReadinessStatus, loadMasterControlInventorySeed } from './masterControlInventory';

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

  it('maintains the missing documentation report entries for created and missing CTRL-001 documents', () => {
    expect(MASTER_CONTROL_MISSING_DOCUMENTATION_ROWS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recommendedDocumentId: 'MCDOC-CTRL-001-PATIENT-BILL-OF-RIGHTS',
          needsClaudeDraft: false,
        }),
        expect.objectContaining({
          recommendedDocumentId: 'MCDOC-CTRL-001-HIPAA-NPP-ACKNOWLEDGMENT',
          needsClaudeDraft: true,
        }),
        expect.objectContaining({
          recommendedDocumentId: 'MCDOC-CTRL-001-ADVANCE-DIRECTIVE-NOTICE',
          needsClaudeDraft: true,
        }),
      ]),
    );
  });

  it('includes CTRL-105 through CTRL-116', async () => {
    const controls = await loadMasterControlInventorySeed();
    for (let i = 105; i <= 116; i += 1) {
      expect(controls.some((control) => control.id === `CTRL-${i}`)).toBe(true);
    }
  });

  it('opens the Control Dossier modal when a row is clicked', async () => {
    render(<MasterControlsScreen />);
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

  it('expands HIPAA NPP and Advance Directive required-document cards inline', async () => {
    render(<MasterControlsScreen />);
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

  it('renders verification and sign-off log support fields without fake completion', async () => {
    render(<MasterControlsScreen />);
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
