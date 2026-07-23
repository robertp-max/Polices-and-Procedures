// React binding for the compliance layer. Derives the GB catalog once, resolves
// views against local drafts + official evidence, and re-renders when either
// changes. Kept deliberately small; all logic lives in the pure selectors.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { deriveGbCatalog, DEFAULT_LEARNER_ID } from './complianceCatalog';
import { refreshOfficialEvidence, subscribe } from './complianceStore';
import {
  courseProgress,
  nextRequirement,
  requiredNow,
  resolveViews,
  summarize,
  type CourseProgress,
} from './complianceSelectors';
import { isEvidenceServiceConnected, getDisconnectedNotice } from './complianceEvidenceAdapter';
import type { ComplianceAssignmentView } from './complianceTypes';

export interface UseComplianceResult {
  learnerId: string;
  views: ComplianceAssignmentView[];
  viewById: Map<string, ComplianceAssignmentView>;
  summary: ReturnType<typeof summarize>;
  next: ComplianceAssignmentView | null;
  requiredNow: ComplianceAssignmentView[];
  courses: CourseProgress[];
  evidenceConnected: boolean;
  disconnectedNotice: string;
  /** Bump after a player writes a draft / commits evidence to re-resolve. */
  refresh: () => void;
}

export function useCompliance(learnerId: string = DEFAULT_LEARNER_ID): UseComplianceResult {
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const catalog = useMemo(() => deriveGbCatalog({ learnerId }), [learnerId]);

  useEffect(() => {
    void refreshOfficialEvidence(learnerId);
    const unsub = subscribe(refresh);
    return () => {
      unsub();
    };
  }, [learnerId, refresh]);

  return useMemo(() => {
    const views = resolveViews(catalog.assignments);
    const viewById = new Map(views.map((v) => [v.assignment.assignmentId, v]));
    return {
      learnerId,
      views,
      viewById,
      summary: summarize(views),
      next: nextRequirement(views),
      requiredNow: requiredNow(views),
      courses: catalog.courseGroups.map((g) => courseProgress(g, viewById)),
      evidenceConnected: isEvidenceServiceConnected(),
      disconnectedNotice: getDisconnectedNotice(),
      refresh,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, learnerId, refresh, tick]);
}
