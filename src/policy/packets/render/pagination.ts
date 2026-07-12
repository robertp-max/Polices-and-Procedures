import type { PacketModuleId, PacketRenderingProfile } from '@/policy/packets/contracts';

import { escapeHtml } from './chrome';

export const UNKNOWN_SOURCE_NOT_RECOVERED = 'UNKNOWN — SOURCE NOT RECOVERED';

const FORM_MODULE_IDS = [
  'qapi-completed-source-forms',
  'qapi-generated-pip-cap-rca-forms',
  'qapi-triggered-workflow-execution-packages',
  'supporting-forms-and-evidence',
] as const satisfies readonly PacketModuleId[];

export function renderDataTable(args: {
  headers: readonly string[];
  rows: readonly (readonly unknown[])[];
  caption?: string;
  emptyText?: string;
}): string {
  const bodyRows = args.rows.length
    ? args.rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${args.headers.length}">${escapeHtml(args.emptyText ?? 'None')}</td></tr>`;
  const caption = args.caption ? `<caption>${escapeHtml(args.caption)}</caption>` : '';

  return `<table class="data-table">${caption}<thead><tr>${args.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

export function renderHtmlDataTable(args: {
  headers: readonly string[];
  rows: readonly (readonly string[])[];
  caption?: string;
  emptyText?: string;
}): string {
  const bodyRows = args.rows.length
    ? args.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${args.headers.length}">${escapeHtml(args.emptyText ?? 'None')}</td></tr>`;
  const caption = args.caption ? `<caption>${escapeHtml(args.caption)}</caption>` : '';

  return `<table class="data-table">${caption}<thead><tr>${args.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

export function renderList(items: readonly string[], ordered = false): string {
  const tag = ordered ? 'ol' : 'ul';
  const rows = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `<${tag} class="list">${rows}</${tag}>`;
}

export function renderHtmlList(items: readonly string[], ordered = false): string {
  const tag = ordered ? 'ol' : 'ul';
  const rows = items.map((item) => `<li>${item}</li>`).join('');
  return `<${tag} class="list">${rows}</${tag}>`;
}

export function shouldBeginOnNewPage(
  moduleId: PacketModuleId,
  profile: PacketRenderingProfile,
): boolean {
  return profile.formsBeginOnNewPages && (FORM_MODULE_IDS as readonly PacketModuleId[]).includes(moduleId);
}

export function compactPages(pages: readonly string[]): string {
  return pages.filter((page) => page.trim().length > 0).join('');
}

export function valueWithUnknown(
  unknownPaths: ReadonlySet<string>,
  path: string,
  value: string | number,
): string | number {
  return unknownPaths.has(path) ? UNKNOWN_SOURCE_NOT_RECOVERED : value;
}

export function statusWithUnknown(
  unknownPaths: ReadonlySet<string>,
  path: string,
  value: string,
): string {
  return unknownPaths.has(path) ? UNKNOWN_SOURCE_NOT_RECOVERED : value;
}
