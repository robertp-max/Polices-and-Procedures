/**
 * App-wide V3 shared UI primitives.
 */
export { PageHeader } from './PageHeader';
export { SectionHeader } from './SectionHeader';
export { SurfaceCard } from './SurfaceCard';
export { GlassPanel } from './GlassPanel';
export { ActionButton } from './ActionButton';
export { UtilityButton } from './UtilityButton';
export { CiStatusBadge } from './CiStatusBadge';
export { SearchField } from './SearchField';
export { Tabs } from './Tabs';
export { RightDrawer } from './RightDrawer';
export type { RightDrawerProps } from './RightDrawer';
export { BottomSheetDrawer } from './BottomSheetDrawer';
export type { BottomSheetDrawerProps } from './BottomSheetDrawer';
export { V3StackedDrawerHost } from './V3StackedDrawerHost';
export type { DrawerLayer, V3StackedDrawerHostProps } from './V3StackedDrawerHost';
export { VeilDrawer } from './VeilDrawer';
export type { VeilDrawerProps } from './VeilDrawer';
export { TaskRowMinimal, VeilCriticalText, VeilSection } from './VeilPrimitives';
export type { TaskRowMinimalProps, VeilSectionProps } from './VeilPrimitives';

// Premium V3 Veil Glass expensive modal (new Agent 11 creation)
export { VeilModal } from './VeilModal';
export type { VeilModalProps } from './VeilModal';
export { DataGrid } from './DataGrid';
export { EmptyState } from './EmptyState';
export { SignaturePad, clearSignaturePadDraft } from './SignaturePad';
export type { SignaturePadValue, SignaturePadProps } from './SignaturePad';
export { StalenessBanner } from './StalenessBanner';
export { PhotoEvidenceCapture } from './PhotoEvidenceCapture';
export type { PhotoEvidenceCaptureValue, PhotoEvidenceCaptureProps } from './PhotoEvidenceCapture';
export { LoadingState } from './LoadingState';
export type { LoadingStateProps } from './LoadingState';
export { AriaLiveRegion } from './AriaLiveRegion';
export type { AriaLiveRegionProps } from './AriaLiveRegion';
export { SpotlightCard } from '@/components/ui/SpotlightCard';
export type { SpotlightCardProps } from '@/components/ui/SpotlightCard';

// Phase 2 Canonical Shell Primitives
export { ShellFrame } from './ShellFrame';
export { ShellTopbar } from './ShellTopbar';
export { ShellNavRail } from './ShellNavRail';
export type { NavItem } from './ShellNavRail';
export { ShellContentFrame } from './ShellContentFrame';
export { ShellCommandGroup } from './ShellCommandGroup';
export { ShellMobileDrawer } from './ShellMobileDrawer';
export type { ShellMobileDrawerProps } from './ShellMobileDrawer';
export {
  V32ActionButton,
  V32AppShell,
  V32EmptyState,
  V32MetricTile,
  V32PageHeader,
  V32SectionHeader,
  V32SidebarNav,
  V32SidebarNavGroup,
  V32SidebarNavItem,
  DrawerSurface,
  RightPanel,
  SearchCommandBar,
  StatusPill,
  GlassPanel as V32GlassPanel,
} from './V32DesignSystem';
export type {
  GlassPanelProps as V32GlassPanelProps,
  SearchCommandBarProps,
  StatusPillProps,
  V32ActionButtonProps,
  V32EmptyStateProps,
  V32MetricTileProps,
  V32PageHeaderProps,
  V32SectionHeaderProps,
} from './V32DesignSystem';

// =============================================================================
// CANONICAL CORE PRIMITIVES (single-file high-fidelity foundation library)
// All future templates should prefer composition from these. Self-contained
// token contract + reduced-motion safe + dual light/dark support.
// =============================================================================
export type {
  SurfaceCardProps as CoreSurfaceCardProps,
  KpiCardProps,
  StatusBadgeProps,
  StatusTone,
  DataTableProps,
  DataTableColumn,
  FilterTrayProps,
  DrawerProps,
  ModalProps,
  PageHeaderProps as CorePageHeaderProps,
  PageGridProps,
  PageViewCardProps,
} from './CorePrimitives';

// =============================================================================
// PHASE 0 ONLY — UI Barrel / Exports (Composer 2.5 Agent 14)
// Scope: ONLY this barrel file. Re-export new BorderGlow + surface enhanced Spotlight/Metric/Surface/ToneBadge variants.
// References (read):
// - Plan: AGENT15_MIGRATION_PHASES_RISKS_DEPS_PLAN.md (Phase 0: Component Library First; lists BorderGlow, SpotlightCard, MetricTile, SurfaceCard, ToneBadge)
// - Ownership map (barrel + primitives lead): UI_PRIMITIVE_OWNERSHIP_MAP.md (src/policy/components/ui primitives canonical via barrel)
// - Agent 1 map: Agent_01_Glassmorphism_Layering_4Phase_Plan.md + Analysis.md (layering, Spotlight + BorderGlow integration per plan §)
// - Prior composers 9-13: created/enhanced (see SpotlightCard.tsx comment: "Direct import of BorderGlow (Primitives Lead / Spotlight + BorderGlow)"; variant='border-glow', MetricTile tone, Surface/Tone semantics; no overlap with token/Agent01/Agent04 shell work)
// Plan Phase 0 primitives: barrel index.ts single export surface. No other files/logic edited.
// =============================================================================
export { default as BorderGlow } from './BorderGlow';
export type { BorderGlowProps } from './BorderGlow';

// Enhanced variants (Spotlight 'border-glow', Metric, ToneBadge aliases for clean canonical use; SurfaceCard already at top-level)
export { V32MetricTile as MetricTile } from './V32DesignSystem';
export type { V32MetricTileProps as MetricTileProps } from './V32DesignSystem';
export { StatusPill as ToneBadge } from './V32DesignSystem';
export type { StatusPillProps as ToneBadgeProps } from './V32DesignSystem';
