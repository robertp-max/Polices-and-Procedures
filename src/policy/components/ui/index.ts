/**
 * Care Indeed shared UI primitives.
 *
 * All primitives consume the `--ci-*` semantic tokens defined in
 * src/index.css so that they work across:
 *   • CI-ION dark
 *   • Care Indeed light
 *   • Care Indeed dark (NEW)
 *
 * Components MUST NOT hardcode brand hex colours; use these primitives
 * or token classes (.ci-card, .ci-glass-panel, .ci-link, .ci-badge--*).
 */
export { ThemeModeToggle } from './ThemeModeToggle';
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
export { BottomSheetDrawer } from './BottomSheetDrawer';
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

// Phase 2 Canonical Shell Primitives
export { ShellFrame } from './ShellFrame';
export { ShellTopbar } from './ShellTopbar';
export { ShellNavRail } from './ShellNavRail';
export type { NavItem } from './ShellNavRail';
export { ShellContentFrame } from './ShellContentFrame';
export { ShellCommandGroup } from './ShellCommandGroup';
export { ShellMobileDrawer } from './ShellMobileDrawer';
export type { ShellMobileDrawerProps } from './ShellMobileDrawer';
