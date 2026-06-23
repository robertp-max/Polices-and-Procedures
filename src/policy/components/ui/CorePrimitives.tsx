/**
 * CorePrimitives.tsx
 * Single-file foundation library of highly reusable, polished React primitive components.
 * Designed for single-file prototypes and as the canonical base for all other templates.
 *
 * Requirements satisfied:
 * - Exact CSS custom property tokens (both dark default #05060A / Veil + warm paper light mode).
 * - No raw hex / literals outside the token definitions in the injected <style>.
 * - Spotlight radial sheen via onMouseMove setting --mouse-x / --mouse-y.
 * - 2px lift, premium layered feel, reduced-motion safe.
 * - Healthcare-appropriate: clean, expensive, modern, calm, high-contrast accessible.
 *
 * Usage: import { SurfaceCard, KpiCard, ... } from './CorePrimitives';
 * Drop-in self-contained for prototypes (injects its own tokens + component CSS on first mount).
 */

import {
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
} from 'react';

// =====================================================
// TOKEN INJECTOR + THEME CONTRACT (Dark default + Light)
// Single source for the exact spec tokens referenced by components.
// All component styles resolve exclusively through these vars.
// =====================================================

export const PRIMITIVE_TOKENS_CSS = `
:root {
  /* === DARK DEFAULT (stabilized V3 veil / production dark) === */
  --ci-bg: #0E1B1C;
  --ci-surface: #15282A;
  --ci-surface-2: #1B3133;
  --ci-surface-elevated: #1F3A3D;
  --ci-surface-glass: rgba(21, 40, 42, 0.78);

  --ci-text-primary: #F1F5F9;
  --ci-text-secondary: #94A3B8;
  --ci-text-tertiary: #64748B;
  --ci-text-muted: #475569;
  --ci-heading-primary: var(--ci-text-primary);

  --ci-border: rgba(241, 245, 249, 0.10);
  --ci-border-strong: rgba(241, 245, 249, 0.18);
  --ci-border-subtle: rgba(241, 245, 249, 0.06);

  --ci-accent-teal: #007970;
  --ci-accent-teal-light: #00D1C1;
  --ci-accent-orange: #E07B2C;
  --ci-accent-orange-light: #FFA059;
  --brand-primary: var(--ci-accent-teal);
  --text-primary: var(--ci-text-primary);
  --text-secondary: var(--ci-text-secondary);
  --ci-success: #10B981;
  --ci-success-bg: rgba(16, 185, 129, 0.12);
  --ci-warning: #F59E0B;
  --ci-error: #EF4444;

  --ci-radius-sm: 6px;
  --ci-radius-md: 10px;
  --ci-radius-lg: 14px;
  --ci-radius-xl: 18px;
  --ci-radius-full: 9999px;

  --ci-spacing-xs: 4px;
  --ci-spacing-sm: 8px;
  --ci-spacing-md: 12px;
  --ci-spacing-lg: 16px;
  --ci-spacing-xl: 24px;
  --ci-spacing-2xl: 32px;

  --ci-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.25);
  --ci-shadow-md: 0 4px 12px rgba(0, 0, 0, 0.35);
  --ci-shadow-lg: 0 12px 32px -4px rgba(0, 0, 0, 0.45);
  --ci-shadow-interactive: 0 10px 24px -2px rgba(0, 0, 0, 0.30);

  --ci-motion-fast: 120ms;
  --ci-motion-base: 200ms;
  --ci-ease: cubic-bezier(0.22, 1, 0.36, 1);

  /* Spotlight default sheen color */
  --ci-spotlight-teal: rgba(0, 121, 112, 0.16);
  --ci-spotlight-orange: rgba(224, 123, 44, 0.15);
}

/* === WARM PAPER LIGHT MODE === */
[data-theme="light"],
html[data-theme="care-indeed-light"],
:root[data-ci-mode="light"] {
  --ci-bg: #FAFBF8;
  --ci-surface: #FFFFFF;
  --ci-surface-2: #FAFBF8;
  --ci-surface-elevated: #FFFFFF;
  --ci-surface-glass: #FFFFFF;

  --ci-text-primary: #1F1C1B;
  --ci-text-secondary: #5F5855;
  --ci-text-tertiary: #74706F;
  --ci-text-muted: #9A9692;
  --ci-heading-primary: #00797D;

  --ci-border: rgba(82, 77, 75, 0.14);
  --ci-border-strong: rgba(0, 121, 125, 0.34);
  --ci-border-subtle: rgba(82, 77, 75, 0.08);

  --ci-accent-teal: #00797D;
  --ci-accent-teal-light: #00797D;
  --ci-accent-orange: #C74601;
  --ci-accent-orange-light: #C74601;
  --brand-primary: #00797D;
  --text-primary: var(--ci-text-primary);
  --text-secondary: var(--ci-text-secondary);
  --ci-success: #15803D;
  --ci-success-bg: rgba(21, 128, 61, 0.10);
  --ci-warning: #B45309;
  --ci-error: #B91C1C;

  --ci-shadow-sm: 0 2px 8px rgba(82, 77, 75, 0.06);
  --ci-shadow-md: 0 10px 28px rgba(82, 77, 75, 0.08);
  --ci-shadow-lg: 0 18px 45px rgba(82, 77, 75, 0.14);
  --ci-shadow-interactive: 0 14px 34px rgba(82, 77, 75, 0.12);
}

/* Reduced motion safety for all primitives */
@media (prefers-reduced-motion: reduce) {
  .ci-surface,
  .ci-kpi-card,
  .ci-drawer,
  .ci-modal,
  .ci-filter-tray,
  .ci-page-header,
  .ci-badge {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
  .ci-spotlight::before,
  .ci-spotlight::after {
    transition: none !important;
    opacity: 0 !important;
  }
}

/* =====================================================
   SURFACE + SPOTLIGHT FOUNDATION
   ===================================================== */
.ci-surface {
  position: relative;
  background: var(--ci-surface);
  border: 1px solid var(--ci-border);
  border-radius: var(--ci-radius-lg);
  color: var(--ci-text-primary);
  box-shadow: var(--ci-shadow-sm);
  transition: 
    transform var(--ci-motion-base) var(--ci-ease),
    box-shadow var(--ci-motion-base) var(--ci-ease),
    border-color var(--ci-motion-fast) var(--ci-ease);
  overflow: hidden;
  isolation: isolate;
}

.ci-surface:hover {
  transform: translateY(-2px);
  box-shadow: var(--ci-shadow-md);
  border-color: var(--ci-border-strong);
}

.ci-surface--lift {
  box-shadow: var(--ci-shadow-md);
}

.ci-surface--glass {
  background: var(--ci-surface-glass);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  border-color: var(--ci-border-strong);
}

/* Premium radial spotlight sheen (mouse-follow) */
.ci-spotlight {
  position: relative;
}

.ci-spotlight::before {
  content: '';
  position: absolute;
  inset: -1px;
  background: radial-gradient(
    380px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    var(--ci-spotlight-color, var(--ci-spotlight-teal)),
    transparent 55%
  );
  opacity: 0;
  pointer-events: none;
  z-index: 1;
  transition: opacity var(--ci-motion-base) var(--ci-ease);
  border-radius: inherit;
}

.ci-spotlight:hover::before {
  opacity: 1;
}

/* =====================================================
   BADGE
   ===================================================== */
.ci-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 3px 10px;
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  border-radius: var(--ci-radius-full);
  border: 1px solid;
  white-space: nowrap;
  transition: all var(--ci-motion-fast) var(--ci-ease);
}

.ci-badge--teal {
  background: rgba(0, 121, 112, 0.12);
  color: var(--ci-accent-teal-light);
  border-color: rgba(0, 121, 112, 0.28);
}

.ci-badge--orange {
  background: rgba(224, 123, 44, 0.12);
  color: var(--ci-accent-orange);
  border-color: rgba(224, 123, 44, 0.28);
}

.ci-badge--success {
  background: var(--ci-success-bg);
  color: var(--ci-success);
  border-color: rgba(16, 185, 129, 0.32);
}

/* =====================================================
   DATA TABLE (clean, hover, sortable mock headers)
   ===================================================== */
.ci-data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  color: var(--ci-text-primary);
}

.ci-data-table th {
  text-align: left;
  padding: 11px 14px;
  font-size: 10px;
  font-weight: 300;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--ci-text-tertiary);
  border-bottom: 1px solid var(--ci-border);
  background: transparent;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  transition: color var(--ci-motion-fast) ease;
}

.ci-data-table th:hover {
  color: var(--ci-text-primary);
}

.ci-data-table th .sort-indicator {
  margin-left: 4px;
  opacity: 0.5;
  font-size: 9px;
}

.ci-data-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--ci-border-subtle);
  vertical-align: middle;
}

.ci-data-table tbody tr {
  transition: background-color var(--ci-motion-fast) var(--ci-ease);
}

.ci-data-table tbody tr:hover {
  background: rgba(0, 121, 112, 0.035);
}

html[data-theme="care-indeed-light"] .ci-data-table tbody tr:hover,
[data-theme="light"] .ci-data-table tbody tr:hover,
:root[data-ci-mode="light"] .ci-data-table tbody tr:hover {
  background: rgba(0, 121, 125, 0.045);
}

/* =====================================================
   FILTER TRAY (collapsible animated)
   ===================================================== */
.ci-filter-tray {
  overflow: hidden;
  transition: 
    max-height var(--ci-motion-base) var(--ci-ease),
    opacity var(--ci-motion-fast) var(--ci-ease),
    transform var(--ci-motion-base) var(--ci-ease);
  border: 1px solid var(--ci-border-subtle);
  border-radius: var(--ci-radius-md);
  background: var(--ci-surface-2);
  margin-top: var(--ci-spacing-sm);
}

.ci-filter-tray--closed {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
}

.ci-filter-tray--open {
  max-height: 420px;
  opacity: 1;
  transform: translateY(0);
}

.ci-filter-tray-inner {
  padding: var(--ci-spacing-lg);
}

.ci-filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ci-spacing-sm);
  align-items: center;
}

.ci-filter-chip {
  padding: 4px 12px;
  border-radius: var(--ci-radius-full);
  font-size: 12px;
  border: 1px solid var(--ci-border);
  background: var(--ci-surface);
  color: var(--ci-text-secondary);
  cursor: pointer;
  transition: all var(--ci-motion-fast) var(--ci-ease);
  user-select: none;
}

.ci-filter-chip:hover {
  border-color: var(--ci-accent-teal);
  color: var(--ci-accent-teal);
}

.ci-filter-chip--active {
  background: var(--ci-accent-teal);
  color: white;
  border-color: var(--ci-accent-teal);
}

.ci-filter-clear {
  font-size: 12px;
  color: var(--ci-text-tertiary);
  cursor: pointer;
  padding: 4px 8px;
  margin-left: auto;
}

.ci-filter-clear:hover {
  color: var(--ci-accent-orange);
}

/* =====================================================
   DRAWER (right premium slide-in)
   ===================================================== */
.ci-drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(5, 6, 10, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 90;
  transition: opacity var(--ci-motion-base) var(--ci-ease);
}

.ci-drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  max-width: 100vw;
  background: var(--ci-surface);
  border-left: 1px solid var(--ci-border-strong);
  box-shadow: var(--ci-shadow-lg);
  z-index: 91;
  display: flex;
  flex-direction: column;
  transform: translateX(0);
  transition: transform var(--ci-motion-base) var(--ci-ease);
  will-change: transform;
}

.ci-drawer-panel--closed {
  transform: translateX(100%);
}

.ci-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--ci-border-subtle);
  flex-shrink: 0;
}

.ci-drawer-title {
  font-family: 'Roboto', system-ui, sans-serif;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--ci-heading-primary);
}

.ci-drawer-body {
  flex: 1;
  overflow: auto;
  padding: 20px 22px;
}

.ci-drawer-footer {
  padding: 16px 22px;
  border-top: 1px solid var(--ci-border-subtle);
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  justify-content: flex-end;
}

/* =====================================================
   MODAL (centered Veil premium)
   ===================================================== */
.ci-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(5, 6, 10, 0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ci-modal-panel {
  position: relative;
  background: var(--ci-surface);
  border: 1px solid var(--ci-border-strong);
  border-radius: var(--ci-radius-xl);
  box-shadow: var(--ci-shadow-lg);
  max-height: calc(100dvh - 48px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-width: 320px;
}

.ci-modal-header {
  padding: 18px 22px;
  border-bottom: 1px solid var(--ci-border-subtle);
  display: flex;
  align-items: center;
  gap: 12px;
}

.ci-modal-title {
  font-family: 'Roboto', system-ui, sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: var(--ci-heading-primary);
}

.ci-modal-body {
  padding: 24px 22px;
  overflow: auto;
  flex: 1;
}

.ci-modal-footer {
  padding: 16px 22px;
  border-top: 1px solid var(--ci-border-subtle);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* =====================================================
   PAGE HEADER + GRID / VIEW CARD
   ===================================================== */
.ci-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: var(--ci-spacing-xl);
}

.ci-page-header-title {
  font-family: 'Roboto', system-ui, sans-serif;
  font-size: 23px;
  font-weight: 500;
  line-height: 1.15;
  letter-spacing: -0.015em;
  color: var(--ci-heading-primary);
  margin: 0;
}

.ci-page-header-subtitle {
  margin-top: 6px;
  color: var(--ci-text-secondary);
  font-size: 14px;
  line-height: 1.4;
}

.ci-page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--ci-spacing-xl);
}

.ci-page-view-card {
  background: var(--ci-surface);
  border: 1px solid var(--ci-border);
  border-radius: var(--ci-radius-lg);
  padding: 18px;
  transition: transform var(--ci-motion-base) var(--ci-ease), box-shadow var(--ci-motion-base) var(--ci-ease), border-color var(--ci-motion-fast);
  cursor: pointer;
}

.ci-page-view-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--ci-shadow-md);
  border-color: var(--ci-border-strong);
}

.ci-page-view-card-title {
  font-family: 'Roboto', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 500;
  color: var(--ci-heading-primary);
  margin-bottom: 4px;
}

.ci-page-view-card-meta {
  font-size: 12px;
  color: var(--ci-text-tertiary);
}

/* =====================================================
   KPI CARD (interactive with Review reveal)
   ===================================================== */
.ci-kpi-card {
  position: relative;
  background: var(--ci-surface);
  border: 1px solid var(--ci-border);
  border-radius: var(--ci-radius-lg);
  padding: var(--ci-spacing-lg);
  color: var(--ci-text-primary);
  box-shadow: var(--ci-shadow-sm);
  min-height: 118px;
  transition: 
    transform var(--ci-motion-base) var(--ci-ease),
    box-shadow var(--ci-motion-base) var(--ci-ease),
    border-color var(--ci-motion-fast) var(--ci-ease);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  overflow: hidden;
}

.ci-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ci-shadow-interactive);
  border-color: var(--ci-border-strong);
}

.ci-kpi-card .kpi-value {
  font-size: 32px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.025em;
  font-family: 'Roboto', system-ui, sans-serif;
  margin-top: 4px;
}

.ci-kpi-card .kpi-label {
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ci-text-tertiary);
}

.ci-kpi-card .kpi-review {
  position: absolute;
  bottom: 12px;
  right: 16px;
  font-size: 11px;
  font-weight: 300;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--ci-accent-teal);
  color: #fff;
  opacity: 0;
  transform: translateY(4px);
  pointer-events: none;
  transition: all var(--ci-motion-fast) var(--ci-ease);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.ci-kpi-card:hover .kpi-review {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
`;

// =====================================================
// SURFACECARD
// =====================================================
export interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  spotlight?: boolean;
  /** Optional custom spotlight color (css color / rgba) */
  spotlightColor?: string;
  children: ReactNode;
}

const SURFACE_PADDING: Record<NonNullable<SurfaceCardProps['padding']>, string> = {
  none: '0',
  sm: '10px',
  md: '14px',
  lg: '20px',
};

export function SurfaceCard({
  padding = 'lg',
  spotlight = false,
  spotlightColor,
  className,
  style,
  children,
  onMouseMove,
  ...rest
}: SurfaceCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        if (spotlightColor) {
          el.style.setProperty('--ci-spotlight-color', spotlightColor);
        }
      }
      onMouseMove?.(e);
    },
    [onMouseMove, spotlightColor]
  );

  const classes = [
    'ci-surface',
    spotlight ? 'ci-spotlight' : '',
    className || '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{
        padding: SURFACE_PADDING[padding],
        ...(spotlightColor && { '--ci-spotlight-color': spotlightColor } as React.CSSProperties),
        ...style,
      }}
      onMouseMove={spotlight ? handleMouseMove : onMouseMove}
      {...rest}
    >
      {children}
    </div>
  );
}

// =====================================================
// KPICARD
// =====================================================
export interface KpiCardProps extends HTMLAttributes<HTMLDivElement> {
  label: ReactNode;
  value: ReactNode;
  sublabel?: ReactNode;
  onReview?: () => void;
  spotlightColor?: string;
  children?: ReactNode; // optional trailing content
}

export function KpiCard({
  label,
  value,
  sublabel,
  onReview,
  spotlightColor,
  className,
  children,
  onMouseMove,
  ...rest
}: KpiCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        if (spotlightColor) el.style.setProperty('--ci-spotlight-color', spotlightColor);
      }
      onMouseMove?.(e);
    },
    [onMouseMove, spotlightColor]
  );

  const classes = ['ci-kpi-card', 'ci-spotlight', className || ''].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      className={classes}
      style={spotlightColor ? ({ '--ci-spotlight-color': spotlightColor } as React.CSSProperties) : undefined}
      onMouseMove={handleMouseMove}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onReview) {
          e.preventDefault();
          onReview();
        }
      }}
      {...rest}
    >
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: 'var(--ci-text-primary)' }}>{value}</div>
      {sublabel && (
        <div style={{ fontSize: 12, color: 'var(--ci-text-secondary)', marginTop: 4 }}>{sublabel}</div>
      )}
      {children}

      {onReview && (
        <div
          className="kpi-review"
          onClick={(e) => {
            e.stopPropagation();
            onReview();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          Review
        </div>
      )}
    </div>
  );
}

// =====================================================
// STATUSBADGE — teal / orange / success semantic mapping
// =====================================================
export type StatusTone = 'teal' | 'orange' | 'success' | 'neutral';

export interface StatusBadgeProps {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}

const TONE_MAP: Record<StatusTone, string> = {
  teal: 'ci-badge--teal',
  orange: 'ci-badge--orange',
  success: 'ci-badge--success',
  neutral: '',
};

export function StatusBadge({ tone = 'teal', children, className }: StatusBadgeProps) {
  const toneClass = TONE_MAP[tone] || '';
  return (
    <span className={`ci-badge ${toneClass} ${className || ''}`.trim()}>
      {children}
    </span>
  );
}

// =====================================================
// DATATABLE (primitive table with hover + sortable header mock)
// =====================================================
export interface DataTableColumn {
  key: string;
  label: ReactNode;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  rows: Array<Record<string, ReactNode>>;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  className?: string;
}

export function DataTable({
  columns,
  rows,
  onSort,
  sortKey,
  sortDir,
  className,
}: DataTableProps) {
  return (
    <table className={`ci-data-table ${className || ''}`.trim()}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              style={{ textAlign: col.align || 'left' }}
              onClick={() => col.sortable && onSort?.(col.key)}
            >
              {col.label}
              {col.sortable && sortKey === col.key && (
                <span className="sort-indicator">{sortDir === 'asc' ? '↑' : '↓'}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {columns.map((col) => (
              <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// =====================================================
// FILTERTRAY
// =====================================================
export interface FilterTrayProps {
  open: boolean;
  onClear?: () => void;
  children?: ReactNode; // custom filter controls
  // Convenience sample filters
  sampleFilters?: Array<{ label: string; active?: boolean; onToggle?: () => void }>;
}

export function FilterTray({ open, onClear, children, sampleFilters }: FilterTrayProps) {
  return (
    <div
      className={`ci-filter-tray ${open ? 'ci-filter-tray--open' : 'ci-filter-tray--closed'}`}
      aria-hidden={!open}
    >
      <div className="ci-filter-tray-inner">
        {children || (
          <div className="ci-filter-row">
            {sampleFilters?.map((f, i) => (
              <button
                key={i}
                type="button"
                className={`ci-filter-chip ${f.active ? 'ci-filter-chip--active' : ''}`}
                onClick={f.onToggle}
              >
                {f.label}
              </button>
            ))}
            {onClear && (
              <button type="button" className="ci-filter-clear" onClick={onClear}>
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// DRAWER
// =====================================================
export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  width?: number | string; // e.g. 520 or '520px'
}

export function Drawer({ open, onClose, title, children, actions, width = 520 }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape + trap focus
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKey);

    // Focus first focusable
    const t = setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    }, 40);

    return () => {
      document.removeEventListener('keydown', handleKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  // Click outside
  const handleBackdropClick = (e: ReactMouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!open) return null;

  const w = typeof width === 'number' ? `${width}px` : width;

  return (
    <>
      <div className="ci-drawer-backdrop" onClick={handleBackdropClick} />
      <div
        ref={panelRef}
        className="ci-drawer-panel"
        style={{ width: w }}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Drawer'}
      >
        {(title || actions) && (
          <div className="ci-drawer-header">
            <div>
              {title && <div className="ci-drawer-title">{title}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {actions}
              <button
                onClick={onClose}
                aria-label="Close drawer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ci-text-secondary)',
                  fontSize: 20,
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}
        <div className="ci-drawer-body">{children}</div>
        {actions && <div className="ci-drawer-footer">{actions}</div>}
      </div>
    </>
  );
}

// =====================================================
// MODAL (centered Veil-style)
// =====================================================
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const MODAL_SIZES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: '420px',
  md: '560px',
  lg: '760px',
};

export function Modal({ open, onClose, title, children, actions, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const maxW = MODAL_SIZES[size];

  const handleBackdrop = (e: ReactMouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="ci-modal-backdrop" onClick={handleBackdrop} role="presentation">
      <div
        className="ci-modal-panel"
        style={{ width: '100%', maxWidth: maxW }}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="ci-modal-header">
            <div className="ci-modal-title">{title}</div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                fontSize: 22,
                color: 'var(--ci-text-tertiary)',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        )}
        <div className="ci-modal-body">{children}</div>
        {actions && <div className="ci-modal-footer">{actions}</div>}
      </div>
    </div>
  );
}

// =====================================================
// PAGEHEADER
// =====================================================
export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  /** Controlled filter open state for convenience toggle */
  filterOpen?: boolean;
  onFilterToggle?: () => void;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  filterOpen,
  onFilterToggle,
  className,
}: PageHeaderProps) {
  return (
    <div className={`ci-page-header ${className || ''}`.trim()}>
      <div className="min-w-0 flex-1">
        <h1 className="ci-page-header-title">{title}</h1>
        {subtitle && <div className="ci-page-header-subtitle">{subtitle}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {onFilterToggle && (
          <button
            type="button"
            onClick={onFilterToggle}
            aria-expanded={!!filterOpen}
            style={{
              fontSize: 12,
              padding: '6px 13px',
              borderRadius: 999,
              border: '1px solid var(--ci-border)',
              background: filterOpen ? 'var(--ci-accent-teal)' : 'var(--ci-surface)',
              color: filterOpen ? '#fff' : 'var(--ci-text-secondary)',
              cursor: 'pointer',
              transition: 'all 120ms var(--ci-ease)',
            }}
          >
            {filterOpen ? 'Hide filters' : 'Filters'}
          </button>
        )}
        {actions}
      </div>
    </div>
  );
}

// =====================================================
// PAGEGRID + PAGEVIEWCARD (directory style)
// =====================================================
export interface PageGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function PageGrid({ children, className, ...rest }: PageGridProps) {
  return (
    <div className={`ci-page-grid ${className || ''}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export interface PageViewCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}

export function PageViewCard({
  title,
  meta,
  icon,
  children,
  className,
  ...rest
}: PageViewCardProps) {
  return (
    <div className={`ci-page-view-card ${className || ''}`.trim()} {...rest}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {icon && <div style={{ flexShrink: 0, opacity: 0.85, marginTop: 2 }}>{icon}</div>}
        <div className="min-w-0 flex-1">
          <div className="ci-page-view-card-title">{title}</div>
          {meta && <div className="ci-page-view-card-meta">{meta}</div>}
          {children && <div style={{ marginTop: 10 }}>{children}</div>}
        </div>
      </div>
    </div>
  );
}

export default {
  SurfaceCard,
  KpiCard,
  StatusBadge,
  DataTable,
  FilterTray,
  Drawer,
  Modal,
  PageHeader,
  PageGrid,
  PageViewCard,
};
