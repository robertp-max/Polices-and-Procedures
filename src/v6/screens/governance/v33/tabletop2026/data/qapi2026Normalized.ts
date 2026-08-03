// Thin re-export/adapter over the normalized 2026 QAPI fixture so tabletop
// case-content files import from within tabletop2026/ rather than reaching
// across the feature boundary directly. No transformation happens here —
// normalization and provenance rules live entirely in ../../qapi/*.

export { QAPI_2026 } from '../../qapi/data/qapi2026.normalized';
export {
  buildGbAnnualArc,
  buildGbDecisionDocket,
  buildGbQuarterPacket,
  buildMaterialSignals,
  buildPacketReadiness,
} from '../../qapi/selectors/qapi2026Selectors';
export type {
  AnnualArc,
  GbDecisionMatter,
  GbMaterialSignal,
  GbQuarterPacket,
  PacketReadiness,
} from '../../qapi/selectors/qapi2026Selectors';
export type {
  AdverseEventSummary,
  ComplaintSummary,
  CorrectiveActionRecord,
  FeederAuditSummary,
  GbEscalationMatter,
  InfectionSummary,
  MeetingControlRecord,
  PipLifecycleRecord,
  PipTrigger,
  PopulationSummary,
  ProvenanceRef,
  QapiAgencyIdentity,
  QapiAnnualSummary,
  QapiDataQualityFinding,
  QapiQuarter,
  QapiYear2026,
  QualityMetricPoint,
  QualityMetricSeries,
  QuarterKey,
  RestrictedPersonnelMatter,
  SourceKind,
  SourceSignoff,
  SyntheticSupplement,
} from '../../qapi/model/qapi2026.types';
