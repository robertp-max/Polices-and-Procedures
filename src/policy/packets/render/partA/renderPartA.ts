/**
 * Part A — Executive Analysis.
 *
 * This is the Brad-style synthesis layer for packet output. It does not create
 * new components, packet contracts, or evidence. It converts the already-rendered
 * Part B packet model into a prose-first executive narrative with selective
 * infographics only where they clarify the story. Every number comes from the
 * model; UNKNOWN stays UNKNOWN.
 */
import type {
  PacketFinding,
  PacketModel,
  PacketModelModuleInstance,
  PacketRenderingProfile,
  QapiActionSnapshot,
} from '@/policy/packets/contracts';
import type { KpiDashboardCard, KpiDashboardModel } from '@/policy/packets/analysis/kpi/dashboardModel';
import type { QapiPacketModelPayload } from '@/policy/packets/qapi/buildQapiPacketModel';

import { escapeHtml, renderNarrativePage } from '../chrome';
import { resolveKpiDashboardModel, resolveQapiRenderPayload } from '../modules/kpiDashboard';

const UNKNOWN = 'UNKNOWN — NOT RECOVERED';

interface PartAContext {
  readonly model: PacketModel;
  readonly qapi: QapiPacketModelPayload | null;
  readonly dashboard: KpiDashboardModel | null;
  readonly sourceModule: PacketModelModuleInstance | null;
}

interface ScoreCounts {
  readonly total: number;
  readonly met: number;
  readonly below: number;
  readonly unknown: number;
  readonly other: number;
}

export function renderPartAPages(model: PacketModel, profile: PacketRenderingProfile): string {
  const ctx = buildContext(model);
  const pageSpecs = partAPageSpecs(ctx);
  const totalPages = pageSpecs.length;
  let pageNumber = 1;
  const page = (title: string, bodyHtml: string) =>
    renderNarrativePage({
      model,
      profile,
      title,
      bodyHtml,
      pageNumber: pageNumber++,
      totalPages,
    });

  return pageSpecs.map((spec) => page(spec.title, spec.bodyHtml)).join('\n');
}

export function renderPartBDividerPage(
  model: PacketModel,
  profile: PacketRenderingProfile,
): string {
  const body = `
    <div class="pa-divider-eyebrow">Part B</div>
    <div class="pa-divider-title">Evidence Appendices</div>
    <p class="pa-divider-sub">The authoritative evidence record follows: source validation, KPI dashboard, findings, trends, workflow triggers, determinations, decisions, approvals, attachments, source registers, and forms.</p>
  `;
  return renderNarrativePage({
    model,
    profile,
    title: '',
    isCover: false,
    bodyHtml: `<div class="pa-divider">${body}</div>`,
    pageNumber: 1,
    totalPages: 1,
  })
    .replace('class="pg pg-partA"', 'class="pg pg-partB pa-divider"')
    .replace('data-part="A"', 'data-part="B"');
}

function buildContext(model: PacketModel): PartAContext {
  const sourceModule = model.modules.find((module) => resolveQapiRenderPayload(module.payload) !== null) ?? null;
  const payload = sourceModule ? resolveQapiRenderPayload(sourceModule.payload) : null;
  const qapi = isRecord(payload?.qapiModel)
    ? (payload.qapiModel as unknown as QapiPacketModelPayload)
    : null;
  return {
    model,
    sourceModule,
    qapi,
    dashboard: sourceModule ? resolveKpiDashboardModel(sourceModule.payload) : null,
  };
}

function partAPageSpecs(ctx: PartAContext): Array<{ title: string; bodyHtml: string }> {
  if (!ctx.qapi || !ctx.dashboard) {
    return [
      { title: 'Part A — Executive Analysis', bodyHtml: genericExecutiveBody(ctx) },
      { title: 'Evidence Story and Connected Risk', bodyHtml: genericEvidenceBody() },
      { title: 'Decisions and Evidence Limits', bodyHtml: genericDecisionsBody(ctx) },
    ];
  }

  return [
    { title: 'Part A — Executive Analysis', bodyHtml: executiveSummaryBody(ctx) },
    { title: 'Accuracy, Missing Values, and Readiness', bodyHtml: accuracyMissingBody(ctx) },
    { title: 'Evidence Story', bodyHtml: evidenceStoryBody(ctx) },
    { title: 'Connected Risk Story', bodyHtml: connectedRiskBody(ctx) },
    { title: 'PIP / CAP / RCA Determinations', bodyHtml: determinationsBody(ctx) },
    { title: 'Decisions and Accountability', bodyHtml: decisionsBody(ctx) },
    { title: 'Evidence Limits and Final Review Notes', bodyHtml: evidenceLimitsBody(ctx) },
  ];
}

function executiveSummaryBody(ctx: PartAContext): string {
  if (!ctx.qapi || !ctx.dashboard) {
    return genericExecutiveBody(ctx);
  }
  const counts = scoreCounts(ctx.dashboard);
  const key = keyEvidence(ctx);
  const lockText = lockStatusText(ctx);
  const below = belowTargetCards(ctx.dashboard).map((card) => card.title);

  return `
    <p class="pa-sub">${escapeHtml(periodLabel(ctx.model))} · Executive analysis synthesized from Part B evidence</p>
    <div class="pa-verdict">
      <p>The packet is a draft analytical record that is strong enough for leadership review but not ready for final lock. The recovered evidence shows ${counts.met} of ${counts.total} KPI indicator(s) met target, ${counts.below} below target, and ${counts.unknown} unverified because source values were not recovered. ${escapeHtml(lockText)}.</p>
    </div>
    ${kpiReadinessInfographic(counts)}
    <div class="pa-domain">
      <h3>Executive Summary</h3>
      <p>The overall QAPI picture is mixed: census and governance attendance are recovered, several patient-safety and performance domains are measurable, and multiple indicators remain provisional because the source did not provide validated numerators or denominators. This should be treated as a review-ready draft, not a final report.</p>
      <p>The most material findings are the below-target indicators and the workflow triggers that require authorized human review. ${below.length > 0 ? `Below-target indicators include ${escapeHtml(joinHuman(below.slice(0, 5)))}${below.length > 5 ? ' and additional items listed in Part B' : ''}.` : 'No below-target KPI indicator was recovered from the KPI dashboard.'} These findings should be read alongside the trigger register and determinations appendix before any final action is taken.</p>
      <p>What appears acceptable is limited to recovered, validated evidence. ${key.attendance ? `Governance attendance is recovered as ${escapeHtml(key.attendance)}.` : 'Governance attendance requires review in Part B.'} ${key.census ? `Population scope is recovered as ${escapeHtml(key.census)}.` : 'Population scope remains incomplete or unavailable.'} Unknown fields are not interpreted as zero, compliant, or not applicable.</p>
      <p>Leadership should use this packet to decide which below-target domains need owner assignment, which triggers should move to authorized review, and which missing source elements must be reconciled before lock. Part B remains the source of truth for each figure, source record, and validation flag.</p>
    </div>
    <p class="pa-attribution">Narrative synthesized from Part B structured evidence. No values were generated; UNKNOWN values remain unrecovered and require source follow-up.</p>
  `;
}

function accuracyMissingBody(ctx: PartAContext): string {
  if (!ctx.qapi || !ctx.dashboard) {
    return genericExecutiveBody(ctx);
  }
  const counts = scoreCounts(ctx.dashboard);
  const unknown = unknownCards(ctx.dashboard);
  const below = belowTargetCards(ctx.dashboard);
  const key = keyEvidence(ctx);

  return `
    <p class="pa-sub">${escapeHtml(periodLabel(ctx.model))} · Accuracy and missing-value review</p>
    <div class="pa-domain">
      <h3>Accuracy Check</h3>
      <p>Brad’s packet narrative treats recovered values as source-backed only when the value survives the structured QAPI model and appears in Part B. Values that are missing, provisional, or human-review-required remain explicitly marked and are not softened into favorable conclusions.</p>
      <p>Current KPI state: ${counts.met} met target, ${counts.below} below target, ${counts.unknown} unrecovered, and ${counts.other} with another status. The below-target set should drive owner assignment; the unrecovered set should drive source reconciliation.</p>
    </div>
    ${summaryTable(ctx)}
    <div class="pa-domain">
      <h3>Missing Values and Review Priorities</h3>
      <p>${unknown.length > 0 ? `The unrecovered indicators are ${escapeHtml(joinHuman(unknown.map((card) => card.title)))}. These should stay UNKNOWN until the source provides a defensible numerator, denominator, or explicit total.` : 'No unrecovered KPI cards were present in the current dashboard model.'}</p>
      <p>${below.length > 0 ? `Below-target indicators requiring review include ${escapeHtml(joinHuman(below.map((card) => card.title)))}.` : 'No below-target KPI cards were present in the current dashboard model.'} Population scope is ${escapeHtml(key.census ?? UNKNOWN)} and active census is ${escapeHtml(key.activeCensus ?? UNKNOWN)}.</p>
    </div>
  `;
}

function evidenceStoryBody(ctx: PartAContext): string {
  if (!ctx.qapi || !ctx.dashboard) {
    return genericEvidenceBody();
  }
  const key = keyEvidence(ctx);

  return `
    <p class="pa-sub">${escapeHtml(periodLabel(ctx.model))} · Narrative evidence presentation</p>
    <div class="pa-domain">
      <h3>What the Evidence Shows</h3>
      <p>The reviewed population is ${escapeHtml(key.census ?? UNKNOWN)}, with active census ${escapeHtml(key.activeCensus ?? UNKNOWN)}. Hospitalization/adverse-event evidence is recovered as ${escapeHtml(key.adverseEvents ?? UNKNOWN)}, infections as ${escapeHtml(key.infections ?? UNKNOWN)}, medication-reconciliation evidence as ${escapeHtml(key.medicationReconciliation ?? UNKNOWN)}, complaints as ${escapeHtml(key.complaints ?? UNKNOWN)}, active PIPs as ${escapeHtml(key.activePips ?? UNKNOWN)}, open CAPs or RCAs as ${escapeHtml(key.openCapRca ?? UNKNOWN)}, and PIP trigger count as ${escapeHtml(key.pipTriggers ?? UNKNOWN)}.</p>
      <p>These facts matter because the packet is not merely counting events; it is identifying where leadership can safely act and where it cannot. Recovered below-target indicators identify potential intervention areas. Unverified indicators identify evidence gaps that must be closed before conclusions are certified.</p>
    </div>
    ${evidenceScopeInfographic(ctx)}
    ${recordsTable(ctx)}
  `;
}

function connectedRiskBody(ctx: PartAContext): string {
  if (!ctx.qapi || !ctx.dashboard) {
    return genericEvidenceBody();
  }
  const findings = ctx.qapi.findings;
  const workflows = ctx.qapi.workflowEvaluations;
  const triggerRows = ctx.qapi.triggerRegister;
  const unknown = unknownCards(ctx.dashboard);
  const below = belowTargetCards(ctx.dashboard);

  return `
    <p class="pa-sub">${escapeHtml(periodLabel(ctx.model))} · Connected risk narrative</p>
    <div class="pa-domain">
      <h3>Connected Findings and Risk Story</h3>
      <p>The connected pattern is: ${below.length} below-target KPI indicator(s), ${findings.length} structured finding(s), ${workflows.length} workflow evaluation(s), and ${triggerRows.length} trigger-register row(s). A trigger is not a completed PIP, CAP, RCA, or personnel determination; it is a threshold requiring authorized review.</p>
      <p>${findings.length > 0 ? escapeHtml(findingNarrative(findings)) : 'No structured finding narrative was recovered beyond the KPI and trigger evidence in Part B.'}</p>
      <p>${unknown.length > 0 ? `Evidence limitations are material: ${escapeHtml(joinHuman(unknown.slice(0, 6).map((card) => card.title)))}${unknown.length > 6 ? ' and additional indicators' : ''} are not recovered. Those gaps should be assigned for source reconciliation, not treated as favorable performance.` : 'The KPI dashboard did not identify unrecovered indicators in the current model.'}</p>
    </div>
    <div class="pa-domain">
      <h3>Professional Review Note</h3>
      <p>This section is intentionally narrative rather than chart-heavy. Charts and tables appear only when they clarify the evidence path. The controlling record remains Part B, where each KPI card, trigger row, finding, and validation issue can be reviewed directly.</p>
    </div>
  `;
}

function determinationsBody(ctx: PartAContext): string {
  const qapi = ctx.qapi;
  const dashboard = ctx.dashboard;
  if (!qapi || !dashboard) {
    return genericDecisionsBody(ctx);
  }
  const triggerStates = countBy(qapi.triggerRegister.map((row) => row.decisionState));
  const openReviews = qapi.workflowEvaluations.filter((evaluation) =>
    evaluation.decisionState === 'PENDING AUTHORIZED REVIEW'
    || evaluation.decisionState === 'CANDIDATE — NEEDS VALIDATION'
    || evaluation.reviewedAt === null
  );
  const pipsOpened = qapi.trendSnapshot.pips.filter((pip) => pip.status !== null).length;

  return `
    <p class="pa-sub">${escapeHtml(periodLabel(ctx.model))} · Thresholds, determinations, and workflow state</p>
    <div class="pa-domain">
      <h3>PIP / CAP / RCA / Workflow Determinations</h3>
      <p>Part B shows ${qapi.sourceCounts.pipTriggerScenarios.display} PIP trigger scenario(s), ${qapi.triggerRegister.length} trigger-register row(s), ${openReviews.length} review(s) pending or not fully authorized, and ${pipsOpened} PIP record(s) opened in the structured trend snapshot. These are separate facts. A trigger means review is required; it does not by itself prove that a PIP, CAP, RCA, personnel action, or corrective action has been opened.</p>
      <p>Trigger states recovered in Part B: ${escapeHtml(formatCounts(triggerStates))}. Personnel-review evidence is limited to ${escapeHtml(String(qapi.sourceCounts.personnelReviewTriggers.display))}; restricted detail remains in the personnel addendum reference.</p>
    </div>
    ${triggerFlowInfographic(qapi, openReviews.length, pipsOpened)}
  `;
}

function decisionsBody(ctx: PartAContext): string {
  const qapi = ctx.qapi;
  const dashboard = ctx.dashboard;
  if (!qapi || !dashboard) {
    return genericDecisionsBody(ctx);
  }
  const counts = scoreCounts(dashboard);
  const actions = qapi.trendSnapshot.actionItems;

  return `
    <p class="pa-sub">${escapeHtml(periodLabel(ctx.model))} · Actionable decisions</p>
    <div class="pa-domain">
      <h3>Decisions and Accountability</h3>
      <ul class="pa-decisions">
        <li><b>Review the draft QAPI packet for readiness.</b> Basis: ${counts.met}/${counts.total} KPI indicator(s) met, ${counts.below} below target, ${counts.unknown} unverified. Authority: QAPI Committee / Governing Body. Appendix reference: KPI Dashboard and Validation.</li>
        <li><b>Assign owners for below-target indicators and open workflow reviews.</b> Basis: ${qapi.findings.length} finding(s), ${qapi.workflowEvaluations.length} workflow evaluation(s), and ${qapi.triggerRegister.length} trigger row(s). Authority: QAPI Committee. Owner after approval: committee-assigned owner or role listed in Part B.</li>
        <li><b>Approve source follow-up for unrecovered values before final lock.</b> Basis: ${counts.unknown} unverified KPI indicator(s) and source validation limitations. Authority: QA Coordinator / Administrator. Appendix reference: Source Validation and KPI Dashboard.</li>
        ${actions.map((action) => decisionItem(action)).join('')}
      </ul>
    </div>
  `;
}

function evidenceLimitsBody(ctx: PartAContext): string {
  const dashboard = ctx.dashboard;
  const unknown = dashboard ? unknownCards(dashboard) : [];

  return `
    <p class="pa-sub">${escapeHtml(periodLabel(ctx.model))} · Final review and presentation controls</p>
    <div class="pa-domain">
      <h3>Evidence Limitations</h3>
      <p>Unknown values mean the source did not provide a recoverable value. They are not interpreted as zero, compliant, or not applicable. Provisional or human-review-required values must be resolved in Part B before the packet can be certified or locked.</p>
      <p>Current lifecycle status is ${escapeHtml(formatStatus(ctx.model.identity.status))}; this Part A narrative is therefore a review aid, not a final certification.</p>
    </div>
    <div class="pa-domain">
      <h3>Presentation Review</h3>
      <p>The packet is formatted as a professional leadership packet: each major narrative section starts on a new page, tables wrap instead of truncating, and each visual element is used as an infographic summary rather than as decoration. ${unknown.length > 0 ? `The unresolved items to keep visible during final review are ${escapeHtml(joinHuman(unknown.map((card) => card.title)))}.` : 'No unresolved KPI display items were identified in the current dashboard model.'}</p>
      <p>Before lock, reviewers should confirm that every source-backed value in Part A agrees with the corresponding Part B appendix row and that no UNKNOWN item has been converted into a favorable conclusion.</p>
    </div>
  `;
}

function genericExecutiveBody(ctx: PartAContext): string {
  const activeModules = ctx.model.modules.filter((module) => module.status !== 'not_applicable');
  return `
    <p class="pa-sub">${escapeHtml(periodLabel(ctx.model))} · Executive analysis synthesized from Part B evidence</p>
    <div class="pa-verdict"><p>This packet is assembled for leadership review from ${activeModules.length} evidence section(s). Part B remains the authoritative source record. The narrative below identifies what is complete, what requires review, and what should be assigned before approval or lock.</p></div>
    <div class="pa-domain"><h3>Executive Summary</h3><p>The packet structure is present, but this archetype does not expose QAPI KPI records to the narrative layer. The committee should review section completion, validation status, signatures, and source evidence in Part B before any final determination.</p></div>
    ${moduleStatusTable(ctx.model)}
  `;
}

function genericEvidenceBody(): string {
  return `
    <div class="pa-domain"><h3>What the Evidence Shows</h3><p>The evidence record is organized in the appendices that follow. Each module title, status, and payload remains in Part B; Part A does not create new facts.</p></div>
    <div class="pa-domain"><h3>Connected Findings and Risk Story</h3><p>No archetype-specific finding map was exposed to Part A. Treat this narrative as a routing note and complete the review from the appendices.</p></div>
  `;
}

function genericDecisionsBody(ctx: PartAContext): string {
  return `
    <div class="pa-domain"><h3>Decisions and Accountability</h3><ul class="pa-decisions"><li><b>Review packet readiness.</b> Basis: ${ctx.model.modules.length} module(s) in Part B. Authority: packet owner / approving body.</li></ul></div>
    <div class="pa-domain"><h3>Evidence Limitations</h3><p>Part A has no independent evidence source. Use Part B as the controlling record.</p></div>
  `;
}

function summaryTable(ctx: PartAContext): string {
  const key = keyEvidence(ctx);
  return `<table class="data-table"><caption>Executive evidence snapshot</caption><thead><tr><th>Evidence area</th><th>Recovered value</th><th>Why it matters</th><th>Source</th></tr></thead><tbody>${[
    row('Population reviewed', key.census, 'Defines the denominator and scope for QAPI review.', 'KPI Dashboard / Source Counts'),
    row('Adverse events', key.adverseEvents, 'Signals patient-safety review pressure and potential RCA/CAP needs.', 'Adverse Event Records'),
    row('Infections', key.infections, 'Shows infection-control surveillance volume for the period.', 'Infection Records'),
    row('Documentation findings', key.documentationDefects, 'Identifies chart-audit and care-plan documentation risk.', 'Chart Audit Records'),
    row('Medication reconciliation', key.medicationReconciliation, 'Highlights a high-risk transition-of-care control.', 'Documentation Findings'),
    row('Complaints', key.complaints, 'Frames patient/family grievance and service-recovery workload.', 'Complaint Records'),
    row('PIP triggers', key.pipTriggers, 'Marks thresholds requiring authorized review, not automatic PIP creation.', 'Trigger Register'),
    row('Open CAPs / RCAs', key.openCapRca, 'Shows unresolved corrective-action or root-cause workload.', 'CAP/RCA Records'),
  ].join('')}</tbody></table>`;
}

function recordsTable(ctx: PartAContext): string {
  const qapi = ctx.qapi;
  if (!qapi) return '';
  const rows = [
    row('Structured findings', String(qapi.findings.length), findingSources(qapi.findings), 'Findings'),
    row('Workflow evaluations', String(qapi.workflowEvaluations.length), 'Trigger evaluations requiring validation or authorization review.', 'Workflow Evaluations'),
    row('Trigger register rows', String(qapi.triggerRegister.length), 'Operational bridge from evidence threshold to review state.', 'Trigger Register'),
    row('Action items', String(qapi.trendSnapshot.actionItems.length), 'Leadership follow-up items recovered from the source.', 'Action Register'),
    row('Personnel review triggers', String(qapi.sourceCounts.personnelReviewTriggers.display), 'Restricted personnel-review threshold count; details remain sealed.', 'Personnel Addendum Reference'),
  ].join('');
  return `<table class="data-table"><caption>Structured record grounding used by Part A</caption><thead><tr><th>Record family</th><th>Count / value</th><th>Interpretation</th><th>Appendix</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function kpiReadinessInfographic(counts: ScoreCounts): string {
  if (counts.total === 0) return '';
  const recovered = counts.total - counts.unknown;
  const cards = [
    infographicMetric('Met target', counts.met, 'Recovered indicators meeting target', 'met'),
    infographicMetric('Below target', counts.below, 'Requires review or owner assignment', 'below'),
    infographicMetric('Unverified', counts.unknown, 'Source value not recovered', 'unknown'),
    infographicMetric('Recovered', recovered, `${formatPercent(recovered, counts.total)} of KPI set`, 'neutral'),
  ].join('');
  const bar = [
    barSegment('Met', counts.met, counts.total, 'met'),
    barSegment('Below', counts.below, counts.total, 'below'),
    barSegment('Unverified', counts.unknown, counts.total, 'unknown'),
    barSegment('Other', counts.other, counts.total, 'neutral'),
  ].join('');
  return `
    <div class="pa-infographic pa-score-infographic" role="group" aria-label="KPI readiness at a glance">
      <div class="pa-info-head"><span>KPI readiness at a glance</span><b>${escapeHtml(String(counts.total))} indicators</b></div>
      <div class="pa-info-grid">${cards}</div>
      <div class="pa-stack" aria-label="KPI status distribution">${bar}</div>
      <div class="pa-info-note">Infographic is descriptive only; Part B remains the source record for each indicator and validation flag.</div>
    </div>
  `;
}

function evidenceScopeInfographic(ctx: PartAContext): string {
  const key = keyEvidence(ctx);
  const items = [
    scopeTile('Population', key.census, 'reviewed'),
    scopeTile('Active census', key.activeCensus, 'current scope'),
    scopeTile('Adverse events', key.adverseEvents, 'safety signal'),
    scopeTile('Infections', key.infections, 'surveillance'),
    scopeTile('Complaints', key.complaints, 'service recovery'),
    scopeTile('PIP triggers', key.pipTriggers, 'review threshold'),
  ].join('');
  return `
    <div class="pa-infographic pa-scope-infographic" role="group" aria-label="Evidence scope snapshot">
      <div class="pa-info-head"><span>Evidence scope snapshot</span><b>Recovered fields only</b></div>
      <div class="pa-scope-grid">${items}</div>
    </div>
  `;
}

function triggerFlowInfographic(
  qapi: QapiPacketModelPayload,
  openReviews: number,
  pipsOpened: number,
): string {
  const steps = [
    flowStep('Triggers', qapi.triggerRegister.length, 'threshold rows'),
    flowStep('Review', openReviews, 'pending / not fully authorized'),
    flowStep('PIPs opened', pipsOpened, 'structured records'),
    flowStep('Actions', qapi.trendSnapshot.actionItems.length, 'follow-up items'),
  ].join('');
  return `
    <div class="pa-infographic pa-flow-infographic" role="group" aria-label="Trigger to action map">
      <div class="pa-info-head"><span>Trigger-to-action map</span><b>Do not collapse these steps</b></div>
      <div class="pa-flow">${steps}</div>
      <div class="pa-info-note">A trigger is a review threshold. It becomes a PIP, CAP, RCA, personnel action, or action item only after authorized review in Part B.</div>
    </div>
  `;
}

function infographicMetric(
  label: string,
  value: number,
  note: string,
  tone: 'met' | 'below' | 'unknown' | 'neutral',
): string {
  return `<div class="pa-info-card pa-info-${tone}"><b>${escapeHtml(value)}</b><span>${escapeHtml(label)}</span><small>${escapeHtml(note)}</small></div>`;
}

function scopeTile(label: string, value: string | null, note: string): string {
  const isUnknownValue = value === null || /unknown|not recovered/i.test(value);
  const tone = isUnknownValue ? 'unknown' : 'neutral';
  return `<div class="pa-scope-tile pa-info-${tone}"><span>${escapeHtml(label)}</span><b>${escapeHtml(value ?? UNKNOWN)}</b><small>${escapeHtml(note)}</small></div>`;
}

function flowStep(label: string, value: number, note: string): string {
  return `<div class="pa-flow-step"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b><small>${escapeHtml(note)}</small></div>`;
}

function barSegment(
  label: string,
  value: number,
  total: number,
  tone: 'met' | 'below' | 'unknown' | 'neutral',
): string {
  if (value <= 0 || total <= 0) return '';
  return `<span class="pa-stack-seg pa-info-${tone}" style="width:${formatPercent(value, total)}" title="${escapeHtml(label)}: ${escapeHtml(value)}">${escapeHtml(label)} ${escapeHtml(value)}</span>`;
}

function formatPercent(value: number, total: number): string {
  if (total <= 0) return '0%';
  return `${String(Math.max(0, Math.min(100, Math.round((value / total) * 100))))}%`;
}

function moduleStatusTable(model: PacketModel): string {
  const rows = model.modules
    .filter((module) => module.status !== 'not_applicable')
    .map((module) => row(module.title, module.status, 'Review the corresponding appendix section.', module.moduleId))
    .join('');
  return `<table class="data-table"><caption>Part B module status</caption><thead><tr><th>Section</th><th>Status</th><th>Review note</th><th>Module</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function keyEvidence(ctx: PartAContext): Record<string, string | null> {
  const dashboard = ctx.dashboard;
  const qapi = ctx.qapi;
  return {
    census: cardDisplay(dashboard, /patients|episodes|scope/i) ?? displayRecovered(qapi?.sourceCounts.episodesTotal.display),
    activeCensus: cardDisplay(dashboard, /active census/i) ?? displayRecovered(qapi?.sourceCounts.activeCensus.display),
    adverseEvents: cardDisplay(dashboard, /adverse event/i) ?? displayRecovered(qapi?.sourceCounts.hospitalizations.display),
    infections: cardDisplay(dashboard, /infection/i),
    documentationDefects: cardDisplay(dashboard, /documentation defect/i),
    medicationReconciliation: cardDisplay(dashboard, /medication[- ]reconciliation/i),
    complaints: cardDisplay(dashboard, /complaint/i),
    activePips: cardDisplay(dashboard, /active pips/i),
    openCapRca: cardDisplay(dashboard, /open caps|rcas/i),
    pipTriggers: cardDisplay(dashboard, /pip trigger/i) ?? displayRecovered(qapi?.sourceCounts.pipTriggerScenarios.display),
    attendance: cardDisplay(dashboard, /attendance/i) ?? attendanceDisplay(qapi),
  };
}

function scoreCounts(dashboard: KpiDashboardModel): ScoreCounts {
  const cards = dashboard.cards;
  const met = cards.filter((card) => isMet(card)).length;
  const below = cards.filter((card) => isBelow(card)).length;
  const unknown = cards.filter((card) => isUnknown(card)).length;
  return {
    total: cards.length,
    met,
    below,
    unknown,
    other: cards.length - met - below - unknown,
  };
}

function isMet(card: KpiDashboardCard): boolean {
  return card.currentValue.value !== null && /met|pass|exceed|within/i.test(String(card.status)) && !/not/i.test(String(card.status));
}

function isBelow(card: KpiDashboardCard): boolean {
  return /not[_ ]?met|below|missed|fail|breach/i.test(String(card.status));
}

function isUnknown(card: KpiDashboardCard): boolean {
  return card.currentValue.value === null || /unknown|not recovered/i.test(card.validationStatus);
}

function belowTargetCards(dashboard: KpiDashboardModel): KpiDashboardCard[] {
  return dashboard.cards.filter(isBelow);
}

function unknownCards(dashboard: KpiDashboardModel): KpiDashboardCard[] {
  return dashboard.cards.filter(isUnknown);
}

function cardDisplay(dashboard: KpiDashboardModel | null, pattern: RegExp): string | null {
  const card = dashboard?.cards.find((candidate) => pattern.test(candidate.title));
  if (!card) return null;
  return card.currentValue.display;
}

function displayRecovered(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function attendanceDisplay(qapi: QapiPacketModelPayload | null): string | null {
  if (!qapi) return null;
  const present = qapi.sourceCounts.committeeAttendancePresent.display;
  const total = qapi.sourceCounts.committeeAttendanceTotal.display;
  return `${String(present)} of ${String(total)}`;
}

function findingNarrative(findings: readonly PacketFinding[]): string {
  const first = findings.slice(0, 3).map((finding) =>
    `${finding.findingId}: ${finding.description} (${finding.currentState ?? 'state not recovered'})`,
  );
  return `${joinHuman(first)}. Each finding must be read with its source record IDs and required reviewer in Part B.`;
}

function findingSources(findings: readonly PacketFinding[]): string {
  const ids = findings.flatMap((finding) => finding.sourceRecordIds).filter(Boolean);
  if (ids.length === 0) return 'Source record IDs not recovered for all findings.';
  return `Source record IDs include ${joinHuman(ids.slice(0, 5))}${ids.length > 5 ? ' and additional records' : ''}.`;
}

function decisionItem(action: QapiActionSnapshot): string {
  return `<li><b>${escapeHtml(action.description)}</b> Basis: recovered action item ${escapeHtml(action.actionId)}. Owner: ${escapeHtml(action.ownerRole ?? 'to be assigned')}. Due date: ${escapeHtml(action.dueDate ?? 'not recovered')}.</li>`;
}

function lockStatusText(ctx: PartAContext): string {
  const payload = ctx.sourceModule ? resolveQapiRenderPayload(ctx.sourceModule.payload) : null;
  return payload?.lock?.statusText ?? formatStatus(ctx.model.identity.status);
}

function formatCounts(countsMap: ReadonlyMap<string, number>): string {
  if (countsMap.size === 0) return 'none recovered';
  return [...countsMap.entries()].map(([label, count]) => `${label}: ${String(count)}`).join('; ');
}

function countBy(values: readonly string[]): Map<string, number> {
  const countsMap = new Map<string, number>();
  for (const value of values) {
    countsMap.set(value, (countsMap.get(value) ?? 0) + 1);
  }
  return countsMap;
}

function row(first: string, second: string | number | null | undefined, third: string, fourth: string): string {
  return `<tr><td>${escapeHtml(first)}</td><td>${escapeHtml(second ?? UNKNOWN)}</td><td>${escapeHtml(third)}</td><td>${escapeHtml(fourth)}</td></tr>`;
}

function joinHuman(items: readonly string[]): string {
  if (items.length === 0) return 'none recovered';
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function periodLabel(model: PacketModel): string {
  const start = model.identity.reportingPeriodStart;
  const end = model.identity.reportingPeriodEnd;
  if (start && end) {
    const quarter = quarterOf(start);
    return quarter ? `${quarter} (${start} through ${end})` : `${start} through ${end}`;
  }
  return 'Reporting period not recovered';
}

function quarterOf(iso: string): string | null {
  const match = /^(\d{4})-(\d{2})/u.exec(iso);
  if (!match) return null;
  const year = match[1];
  const month = Number(match[2]);
  if (!year || !Number.isFinite(month)) return null;
  return `Q${String(Math.floor((month - 1) / 3) + 1)} ${year}`;
}

function formatStatus(status: string): string {
  return status.replace(/_/gu, ' ').toLowerCase().replace(/\b\w/gu, (letter) => letter.toUpperCase());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
