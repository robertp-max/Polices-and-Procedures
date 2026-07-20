import type {
  PacketModel,
  PacketModelModuleInstance,
  PacketModuleId,
  PacketRenderingProfile,
  RenderedPacketPage,
} from '@/policy/packets/contracts';

import { renderActionRegisterModule } from './modules/actionRegister';
import { renderApprovalsLockModule } from './modules/approvalsLock';
import { renderAttachmentManifestModule } from './modules/attachmentManifest';
import { renderCoverModule } from './modules/cover';
import { renderDecisionsRequestedModule } from './modules/decisionsRequested';
import { renderDerivationAppendixModule } from './modules/derivationAppendix';
import { renderDeterminationsModule } from './modules/determinations';
import { renderExcludedSourceRegisterModule } from './modules/excludedSourceRegister';
import { renderExecutiveAnalysisModule } from './modules/executiveAnalysis';
import {
  renderCompletedSourceFormsModule,
  renderGeneratedPipCapRcaFormsModule,
  renderTriggeredWorkflowExecutionPackagesModule,
} from './modules/formPages';
import { renderFindingsTrendsModule } from './modules/findingsTrends';
import { renderKpiDashboardModule } from './modules/kpiDashboard';
import { renderPacketControlModule } from './modules/packetControl';
import { renderSourceUtilizationModule } from './modules/sourceUtilization';
import { renderTriggerRegisterModule } from './modules/triggerRegister';

export interface ModuleRenderContext {
  model: PacketModel;
  module: PacketModelModuleInstance;
  profile: PacketRenderingProfile;
  pageNumber: number;
  totalPages: number;
}

export interface ModuleRenderResult {
  html: string;
  page: RenderedPacketPage;
}

export type ModuleRenderer = (context: ModuleRenderContext) => ModuleRenderResult;

export const moduleRendererRegistry = new Map<PacketModuleId, ModuleRenderer>([
  ['qapi-cover-page', renderCoverModule],
  ['qapi-packet-control-source-validation-readiness', renderPacketControlModule],
  ['qapi-executive-analysis', renderExecutiveAnalysisModule],
  ['qapi-rich-kpi-dashboard', renderKpiDashboardModule],
  ['qapi-source-feeder-workflow-form-utilization', renderSourceUtilizationModule],
  ['qapi-detailed-findings-and-trend-analysis', renderFindingsTrendsModule],
  ['qapi-pip-cap-rca-personnel-review-determinations', renderDeterminationsModule],
  ['qapi-triggered-workflow-and-dependency-register', renderTriggerRegisterModule],
  ['qapi-committee-and-governing-body-decisions', renderDecisionsRequestedModule],
  ['qapi-action-item-workflow-accountability-register', renderActionRegisterModule],
  ['qapi-approvals-ecign-lock-readiness', renderApprovalsLockModule],
  ['qapi-attachment-manifest', renderAttachmentManifestModule],
  ['qapi-completed-source-forms', renderCompletedSourceFormsModule],
  ['qapi-generated-pip-cap-rca-forms', renderGeneratedPipCapRcaFormsModule],
  ['qapi-triggered-workflow-execution-packages', renderTriggeredWorkflowExecutionPackagesModule],
  ['qapi-confidential-personnel-review-addendum-reference', renderAttachmentManifestModule],
  ['qapi-source-derivation-reconciliation-provenance', renderDerivationAppendixModule],
  ['qapi-superseded-or-excluded-source-register', renderExcludedSourceRegisterModule],
]);

export function getModuleRenderer(moduleId: PacketModuleId): ModuleRenderer {
  const renderer = moduleRendererRegistry.get(moduleId);
  if (!renderer) {
    throw new Error(`No module renderer registered for packet module id: ${moduleId}`);
  }
  return renderer;
}
