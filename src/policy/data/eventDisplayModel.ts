/**
 * Display adapter for RegulatoryEvent.
 *
 * All UI surfaces must derive display values from this adapter rather than
 * reading event fields directly. This ensures:
 *   - Only registry-verified policy IDs are ever shown
 *   - Generated/technical IDs (EVT-*) are confined to a collapsed Technical
 *     Details section
 *   - Display logic is defined in exactly one place
 *
 * Source of truth for valid policy IDs: frameworkSeed.generated.ts
 */

import { frameworkPolicies } from './frameworkSeed.generated';
import type { RegulatoryEvent } from './regulatoryEvents';

const _REGISTRY: Set<string> = new Set(frameworkPolicies.map(p => p.id));

export interface EventDisplayModel {
  title: string;
  /** Policy IDs confirmed against the framework registry. Never includes EVT-*, draft IS-*, or month-segment codes. */
  canonicalPolicyRefs: string[];
  /** Required form catalog references for display. */
  requiredForms: Array<{ formId: string; label: string }>;
  /**
   * Technical identifiers for the collapsed Technical Details section only.
   * Never render these in chip titles, policy badges, or summary cards.
   */
  technicalDetails: {
    event_instance_id: string;
    generated_event_id: string;
    sourceOfTruth: string;
  };
}

export function getEventDisplayModel(event: RegulatoryEvent): EventDisplayModel {
  return {
    title: event.title,
    canonicalPolicyRefs: event.policyRefs.filter(id => _REGISTRY.has(id)),
    requiredForms: event.requiredForms.map(f => ({
      formId: f.formId ?? '',
      label: f.label,
    })),
    technicalDetails: {
      event_instance_id: event.id,
      generated_event_id: event.id,
      sourceOfTruth: (event as { sourceOfTruth?: string }).sourceOfTruth ?? 'app',
    },
  };
}
