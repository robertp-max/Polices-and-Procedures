// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { UNKNOWN_NOT_RECOVERED_TEXT } from '@/policy/packets/sources/sourceValidation';

import {
  autoCreatedWorkflowInstanceIds,
  buildQ1ContaminationGuard,
  collectQ2LeakMarkers,
  formInstanceIds,
  malformedPercentageDisplays,
  qapiPayload,
  qapiRenderPayload,
  runQ1EndToEndLifecycle,
  uniqueSorted,
} from './e2eHarness';
import {
  Q1_FIXTURE_EXPECTATIONS as E,
} from './loadQapiFixture';

describe('WP-4.7 Section 24 Q1-2026 end-to-end packet lifecycle', () => {
  it('drives QAPI-Q1-DS-001 through model, forms, validation, signature, local publish, certify, lock, amendment, and regeneration', async () => {
    const lifecycle = await runQ1EndToEndLifecycle();
    const payload = lifecycle.payload;
    const renderPayload = lifecycle.renderPayload;

    expect(payload.selectedSource.datasetId).toBe(E.datasetId);
    expect(payload.selectedSource.period).toBe(E.quarter);
    expect(payload.selectedSource.periodStart).toBe(E.periodStart);
    expect(payload.selectedSource.periodEnd).toBe(E.periodEnd);
    expect(payload.selectedSource.eventDate).toBe(E.meetingDate);
    expect(payload.selectedSource.agency).toBe(E.agency);
    expect(lifecycle.model.identity.workflowId).toBe(E.workflowId);
    expect(lifecycle.model.identity.workflowId.trim()).not.toBe('');
    expect(lifecycle.model.identity.reportingPeriodStart).toBe(E.periodStart);
    expect(lifecycle.model.identity.reportingPeriodEnd).toBe(E.periodEnd);

    expect(payload.sourceCounts.activeCensus.value).toBe(E.activePatientsAtPeriodEnd);
    expect(payload.sourceCounts.episodesTotal.value).toBe(E.episodesTotal);
    expect(payload.sourceCounts.hospitalizations.value).toBe(E.hospitalizations);
    expect(payload.sourceCounts.edVisitsWithoutHospitalization.value).toBe(E.edVisitsWithoutHospitalization);
    expect(payload.sourceCounts.committeeAttendancePresent.value).toBe(E.committeeAttendancePresent);
    expect(payload.sourceCounts.committeeAttendanceTotal.value).toBe(E.committeeAttendanceTotal);
    expect(payload.sourceCounts.governingBodyEscalationItems.value).toBe(E.governingBodyEscalationItems);
    expect(payload.sourceCounts.pipTriggerScenarios.value).toBe(E.pipTriggerScenarios);
    expect(payload.sourceCounts.personnelReviewTriggers.value).toBe(E.personnelReviewTriggers);

    expect(payload.workflowEvaluations).toHaveLength(E.pipTriggerScenarios);
    expect(payload.workflowEvaluations.every((evaluation) => evaluation.decisionState === 'PENDING AUTHORIZED REVIEW')).toBe(true);
    expect(autoCreatedWorkflowInstanceIds(payload)).toEqual([]);
    expect(payload.triggerRegister).toHaveLength(E.pipTriggerScenarios);

    expect(payload.personnelAggregation.summary.thresholdMetCount).toBe(E.personnelReviewTriggers);
    expect(payload.findings.find((finding) => finding.category === 'Personnel-review aggregate')?.description).not.toMatch(
      /\b(termination|written warning|suspension|employee investigation|discipline)\b/i,
    );

    expect(lifecycle.sourceText).toContain(E.syntheticBanner);
    expect(lifecycle.model.handlingNotice).toBe(E.syntheticBanner);
    expect(lifecycle.signedHtml).toContain(E.syntheticBanner);
    expect(malformedPercentageDisplays(payload)).toEqual([]);
    expect(renderPayload.unknownPaths.length).toBeGreaterThan(0);
    expect(lifecycle.signedHtml).toContain('UNKNOWN — SOURCE NOT RECOVERED');
    expect(JSON.stringify(payload.sourceCounts)).not.toContain(`${UNKNOWN_NOT_RECOVERED_TEXT}":0`);

    expect(lifecycle.formInjection.blockers).toEqual([]);
    expect(lifecycle.formInjection.formInstances.some((form) => form.canonicalFormId === 'QA-FM-010')).toBe(false);
    expect(lifecycle.formInjection.excludedForms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          canonicalFormId: 'QA-FM-010',
          reason: 'annual cadence excluded from quarterly packet',
        }),
      ]),
    );
    expect(lifecycle.model.identity.packetTemplateId).toBe('qapi-quarterly');
    expect(lifecycle.model.identity.packetTemplateId).not.toBe('annual-qapi');

    expect(lifecycle.preEnvelopeValidation.approvalEligible).toBe(true);
    expect(lifecycle.initialValidation.findings.filter((finding) => finding.code === 'workflow-review-not-complete')).toHaveLength(
      E.pipTriggerScenarios,
    );
    expect(lifecycle.initialValidation.lockEligible).toBe(false);
    expect(lifecycle.lockValidation.approvalEligible).toBe(true);
    expect(lifecycle.lockValidation.lockEligible).toBe(true);

    expect(lifecycle.envelope.status).toBe('COMPLETED');
    expect(lifecycle.envelope.signerTasks.map((task) => task.requiredCapacity)).toEqual([
      'Administrator',
      'Clinical Manager',
      'QAPI Chair',
    ]);
    expect(lifecycle.signedPackage.pdfFallbackUsed).toBe(true);
    expect(lifecycle.signedPackage.pdfSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(lifecycle.firstPublish.idempotentReplay).toBe(false);
    expect(lifecycle.replayPublish.idempotentReplay).toBe(true);
    expect(lifecycle.firstPublish.pointers).toHaveLength(5);
    expect(lifecycle.drive.listPointers()).toHaveLength(5);
    expect(lifecycle.destination.driveFolderUrl).toMatch(/^https:\/\/local\.drive\.test\/folders\//);

    expect(lifecycle.createdDraft.packetInstanceId).toBe(lifecycle.idempotentDraftReplay.packetInstanceId);
    expect(lifecycle.store.listInstances().filter((instance) => instance.packetInstanceId === lifecycle.createdDraft.packetInstanceId)).toHaveLength(1);
    expect(lifecycle.certifiedInstance.status).toBe('CERTIFIED');
    expect(lifecycle.lockedInstance.status).toBe('LOCKED');
    expect(lifecycle.lockedInstance.lockedAt).toBe('2026-04-09T14:00:00.000Z');
    expect(() => lifecycle.store.attemptPostLockEdit(lifecycle.lockedInstance.packetInstanceId, 'overwrite locked Q1 packet')).toThrow(
      /locked packet .* cannot be overwritten/i,
    );
    expect(lifecycle.amendmentInstance.supersedesPacketInstanceId).toBe(lifecycle.lockedInstance.packetInstanceId);
    expect(lifecycle.amendmentInstance.packetVersion).toBe(2);
    expect(lifecycle.amendmentInstance.status).toBe('EDITING');

    const originalFormIds = formInstanceIds(lifecycle.formInjection);
    const regeneratedFormIds = formInstanceIds(lifecycle.regeneratedFormInjection);
    expect(originalFormIds).toHaveLength(uniqueSorted(originalFormIds).length);
    expect(regeneratedFormIds).toHaveLength(uniqueSorted(regeneratedFormIds).length);
    expect(uniqueSorted(regeneratedFormIds)).toEqual(uniqueSorted(originalFormIds));

    const workflowEvaluationIds = payload.workflowEvaluations.map((evaluation) => evaluation.evaluationId);
    const regeneratedPayload = qapiPayload(lifecycle.regeneratedModel);
    const regeneratedWorkflowEvaluationIds = regeneratedPayload.workflowEvaluations.map((evaluation) => evaluation.evaluationId);
    expect(workflowEvaluationIds).toHaveLength(uniqueSorted(workflowEvaluationIds).length);
    expect(regeneratedWorkflowEvaluationIds).toHaveLength(uniqueSorted(regeneratedWorkflowEvaluationIds).length);
    expect(regeneratedWorkflowEvaluationIds).toEqual(workflowEvaluationIds);
    expect(autoCreatedWorkflowInstanceIds(regeneratedPayload)).toEqual([]);
    expect(qapiRenderPayload(lifecycle.regeneratedModel).packetId).toBe(qapiRenderPayload(lifecycle.model).packetId);
  });

  it('fails closed if Q2 operational, clinical, complaint, infection, metric, CAP, or signoff records enter the Q1 model', () => {
    const contamination = buildQ1ContaminationGuard();
    const payload = contamination.payload;

    expect(payload.selectedSource.datasetId).toBe(E.datasetId);
    expect(payload.excludedSources.map((source) => source.datasetId)).toEqual(
      expect.arrayContaining(['QAPI-Q2-DS-001', 'QAPI-Q3-DS-099']),
    );
    expect(collectQ2LeakMarkers(contamination.selectedText)).toEqual([]);
    expect(payload.sourceCounts.activeCensus.value).toBe(E.activePatientsAtPeriodEnd);
    expect(payload.sourceCounts.activeCensus.value).not.toBe(100);
    expect(payload.sourceCounts.hospitalizations.value).toBe(E.hospitalizations);
    expect(payload.sourceCounts.hospitalizations.value).not.toBe(7);
    expect(payload.sourceCounts.edVisitsWithoutHospitalization.value).toBe(E.edVisitsWithoutHospitalization);
    expect(payload.sourceCounts.edVisitsWithoutHospitalization.value).not.toBe(9);
    expect(payload.sourceCounts.committeeAttendancePresent.value).toBe(E.committeeAttendancePresent);
    expect(payload.sourceCounts.committeeAttendanceTotal.value).toBe(E.committeeAttendanceTotal);
    expect(payload.sourceCounts.committeeAttendancePresent.value).not.toBe(8);
    expect(payload.selectedSource.agency).toBe(E.agency);
    expect(payload.selectedSource.agency).not.toContain('Lakeside Contaminant');
  });
});
