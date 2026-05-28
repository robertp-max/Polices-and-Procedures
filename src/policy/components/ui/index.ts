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

// Phase 2 Canonical Shell Primitives
export { ShellFrame } from './ShellFrame';
export { ShellTopbar } from './ShellTopbar';
export { ShellNavRail } from './ShellNavRail';
export type { NavItem } from './ShellNavRail';
export { ShellContentFrame } from './ShellContentFrame';
export { ShellCommandGroup } from './ShellCommandGroup';
export { ShellMobileDrawer } from './ShellMobileDrawer';
export type { ShellMobileDrawerProps } from './ShellMobileDrawer';
