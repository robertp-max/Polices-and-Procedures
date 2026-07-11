/**
 * Renderable packet model + rendering-profile contracts — FR-017, §16.3 extensions.
 * Pure types only. Zero runtime side effects.
 */

import type { PacketModuleId } from './archetype';
import type { PacketLifecycleStatus } from './packetInstance';

/** Classification applied to the packet chrome / handling notice. Closed vocabulary. */
export type PacketClassification =
  | 'public'
  | 'internal'
  | 'confidential'
  | 'restricted-personnel'
  | 'legal-privileged'
  | 'synthetic-uat';

/** Identity slice of the renderable packet model. */
export interface PacketModelIdentity {
  packetInstanceId: string;
  packetId: string;
  packetVersion: number;
  contentHash: string | null;
  agencyId: string;
  eventFamilyId: string;
  eventInstanceId: string;
  workflowId: string;
  workflowInstanceId: string;
  packetTemplateId: string;
  archetypeId: string;
  subtype: string | null;
  reportingPeriodStart: string | null;
  reportingPeriodEnd: string | null;
  dataThroughDate: string | null;
  status: PacketLifecycleStatus;
}

/**
 * Typed module instance for rendering.
 * Payload is a structured record; specific module schemas bind later WPs.
 */
export interface PacketModelModuleInstance {
  moduleInstanceId: string;
  moduleId: PacketModuleId;
  title: string;
  order: number;
  status: 'not_started' | 'in_progress' | 'complete' | 'not_applicable' | 'blocked' | 'stale';
  /** Structured module payload — never silently zero-filled. */
  payload: Record<string, unknown>;
  contentHash: string | null;
}

/**
 * Renderable packet model consumed by the composition engine (FR-017).
 * The renderer must consume a packet model rather than page-specific conditionals.
 */
export interface PacketModel {
  identity: PacketModelIdentity;
  renderingProfileId: string;
  classification: PacketClassification;
  handlingNotice: string | null;
  modules: PacketModelModuleInstance[];
  /** Ordered page plan produced by composition (optional until rendered). */
  pagePlan: RenderedPacketPage[] | null;
}

/** Accent rail chrome slot (teal/orange top rail per FR-017). */
export interface RenderingChromeAccentRail {
  enabled: boolean;
  /** Ordered color tokens (e.g. teal then orange). */
  colors: readonly string[];
  heightPx: number;
}

/** Logo chrome slot. */
export interface RenderingChromeLogo {
  enabled: boolean;
  assetId: string;
  placement: 'header-left' | 'header-center' | 'header-right';
  altText: string;
}

/** Footer chrome slot — repeating packet ID, period, status, classification. */
export interface RenderingChromeFooter {
  enabled: boolean;
  showPacketId: boolean;
  showPeriod: boolean;
  showStatus: boolean;
  showClassification: boolean;
  showPageNumbers: boolean;
  customText: string | null;
}

/** Watermark chrome slot (confidential attachments / synthetic UAT). */
export interface RenderingChromeWatermark {
  enabled: boolean;
  text: string | null;
  /** Classifications that force the watermark on. */
  whenClassification: readonly string[];
  opacity: number;
}

/** Classification / handling notice chrome slot. */
export interface RenderingChromeClassificationNotice {
  enabled: boolean;
  text: string;
  placement: 'header' | 'banner' | 'footer' | 'cover';
}

/** Chrome slots for a rendering profile (FR-017 visual requirements). */
export interface PacketRenderingChrome {
  accentRail: RenderingChromeAccentRail;
  logo: RenderingChromeLogo;
  footer: RenderingChromeFooter;
  watermark: RenderingChromeWatermark;
  classificationNotice: RenderingChromeClassificationNotice;
}

/** Rendering-profile contract bound by archetype.renderingProfileId. */
export interface PacketRenderingProfile {
  profileId: string;
  version: string;
  pageSize: 'letter';
  chrome: PacketRenderingChrome;
  /** Whether forms must begin on new pages. */
  formsBeginOnNewPages: boolean;
  /** Whether table headers repeat across pages. */
  repeatTableHeaders: boolean;
  /** Whether PDF outline/bookmarks follow packet hierarchy. */
  outlineFollowsHierarchy: boolean;
}

/** One rendered page produced from a PacketModel. */
export interface RenderedPacketPage {
  pageNumber: number;
  pageId: string;
  title: string;
  /** Module owning the page content, if any. */
  moduleId: PacketModuleId | null;
  /** Structured content blocks for the page body. */
  contentBlocks: readonly PacketPageContentBlock[];
  footerLabel: string;
  classification: PacketClassification;
  isConfidential: boolean;
  watermarkText: string | null;
}

/** Content block kinds the renderer may emit. */
export type PacketPageContentBlock =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'table'; headers: string[]; rows: string[][]; caption?: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'kpi-card'; kpiId: string; label: string; value: string; unit: string | null }
  | { kind: 'chart'; chartId: string; chartType: string; accessibleTable: { headers: string[]; rows: string[][] } }
  | { kind: 'signature-block'; capacity: string; signerName: string | null; signedAt: string | null }
  | { kind: 'notice'; severity: 'info' | 'warning' | 'blocker'; text: string }
  | { kind: 'spacer'; heightPx: number };
