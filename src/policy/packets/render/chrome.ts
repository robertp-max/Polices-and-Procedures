import {
  PACKET_LIFECYCLE_TO_APPENDIX_D,
  type PacketClassification,
  type PacketModel,
  type PacketModelModuleInstance,
  type PacketModuleId,
  type PacketPageContentBlock,
  type PacketRenderingProfile,
  type RenderedPacketPage,
} from '@/policy/packets/contracts';

export const SYNTHETIC_UAT_WATERMARK = 'SYNTHETIC UAT DATA — NO REAL PHI — NOT FOR PRODUCTION';

const CARE_INDEED_ADDRESS = 'Care Indeed Home Health · 890 Santa Cruz Ave # B, Menlo Park, CA 94025';

type ChromeColors = {
  primary: string;
  secondary: string;
  primarySoft: string;
  primaryRule: string;
};

export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"]/g, (char) => {
    const escaped: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
    };
    return escaped[char] ?? char;
  });
}

export function renderNotice(text: string, tone: 'info' | 'warning' | 'blocker' = 'info'): string {
  return `<div class="notice notice-${tone}">${escapeHtml(text)}</div>`;
}

export function renderRawNotice(innerHtml: string, tone: 'info' | 'warning' | 'blocker' = 'info'): string {
  return `<div class="notice notice-${tone}">${innerHtml}</div>`;
}

export function renderPanel(title: string, innerHtml: string, extraClass = ''): string {
  const className = extraClass ? `panel ${escapeHtml(extraClass)}` : 'panel';
  return `<div class="${className}"><div class="panel-title">${escapeHtml(title)}</div>${innerHtml}</div>`;
}

export function renderKeyValueRow(label: string, value: unknown): string {
  return `<div class="kv-row"><span class="kv-key">${escapeHtml(label)}</span><span class="kv-value">${escapeHtml(value)}</span></div>`;
}

export function renderPacketDocument(
  model: PacketModel,
  profile: PacketRenderingProfile,
  bodyHtml: string,
): string {
  const title = `${model.identity.packetId} ${periodLabel(model)}`.trim();
  const colors = profileChromeColors(profile);
  const primary = escapeHtml(colors.primary);
  const secondary = escapeHtml(colors.secondary);

  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
  <style>
    @page{size:${profile.pageSize};margin:0;}
    *{box-sizing:border-box;}
    body{margin:0;background:#eef2f2;font:12px/1.55 Roboto,Segoe UI,Arial,sans-serif;color:#1f2937;}
    .pg{position:relative;width:8.5in;min-height:11in;background:#fff;margin:0 auto 14px;display:flex;flex-direction:column;break-after:page;page-break-after:always;overflow:hidden;}
    .pg:empty{display:none;}
    .accent-rail{height:${profile.chrome.accentRail.heightPx}px;display:flex;width:100%;}
    .accent-rail span:first-child{background:${primary};flex:3;}
    .accent-rail span:last-child{background:${secondary};flex:1;}
    .pg-banner{background:#f8fbfb;color:#335154;display:flex;justify-content:space-between;gap:18px;padding:10px 36px;border-bottom:1px solid #e3eaea;font-size:10px;letter-spacing:.12em;text-transform:uppercase;}
    .pg-in{position:relative;z-index:1;flex:1;padding:28px 44px 24px;display:flex;flex-direction:column;}
    .ci-mark{width:230px;height:auto;margin-bottom:10px;}
    .pg-h{font-size:22px;line-height:1.2;color:${primary};margin:6px 0 0;break-after:avoid;page-break-after:avoid;}
    .rule{width:54px;height:3px;background:${secondary};margin:10px 0 16px;}
    .handling{border:1px solid #d8e7e7;background:#f8fbfb;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:10.5px;color:#335154;}
    .lock-banner{border:1px solid #e5d0b8;background:#fff7ed;border-left:4px solid #b35200;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:10.5px;color:#7c2d12;}
    .lock-banner.pass{background:#f0fdf4;border-color:#bbf7d0;border-left-color:#0f7b34;color:#14532d;}
    .synthetic-banner{border:1px solid #f4d08b;background:#fff7d6;border-left:4px solid #a86a00;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:10.5px;color:#714d00;}
    .panel{background:#fff;border:1px solid #e3eaea;border-radius:8px;padding:16px 18px;margin-bottom:14px;box-shadow:0 4px 14px rgba(0,65,66,.04);break-inside:avoid;page-break-inside:avoid;}
    .panel-title{font-size:12px;font-weight:700;color:${primary};text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px;break-after:avoid;page-break-after:avoid;}
    .kv-row{display:flex;justify-content:space-between;gap:18px;border-bottom:1px solid #eef2f2;padding:5px 0;font-size:11.5px;}
    .kv-key{color:${primary};font-weight:600;}
    .kv-value{color:#111;text-align:right;}
    .data-table{width:100%;border-collapse:collapse;font-size:10.5px;margin:4px 0 8px;break-inside:auto;page-break-inside:auto;}
    .data-table caption{text-align:left;color:#526064;font-size:10px;margin:0 0 6px;}
    .data-table thead{display:table-header-group;}
    .data-table th{background:${escapeHtml(colors.primarySoft)};color:${primary};text-align:left;padding:7px 9px;border-bottom:2px solid ${escapeHtml(colors.primaryRule)};}
    .data-table td{padding:7px 9px;border-bottom:1px solid #eef2f2;vertical-align:top;}
    .p{font-size:11.5px;color:#374151;margin:0 0 8px;}
    .muted{color:#7a7470;font-size:10px;}
    .list{margin:0 0 6px 16px;padding:0;font-size:11.5px;}
    .list li{margin-bottom:4px;}
    .notice{border:1px solid #d8e7e7;background:#f8fbfb;border-left:4px solid ${primary};border-radius:8px;padding:10px 14px;font-size:11px;color:#335154;margin-bottom:12px;break-inside:avoid;page-break-inside:avoid;}
    .notice-warning{background:#fff7ed;border-color:#f3c4a8;border-left-color:${secondary};color:#9a3412;}
    .notice-blocker{background:#fef2f2;border-color:#fecaca;border-left-color:#b91c1c;color:#7f1d1d;}
    .seal{border-color:#e6b3b3;background:#fff8f8;}
    .signature-block{margin:18px 0;break-inside:avoid;page-break-inside:avoid;}
    .signature-line{height:30px;border-bottom:1px solid #9ca3af;width:70%;}
    .signature-role{font-size:10px;font-weight:700;color:${primary};text-transform:uppercase;margin-top:4px;}
    .pg-foot{margin-top:auto;border-top:1px solid #eef2f2;padding-top:10px;display:flex;justify-content:space-between;gap:18px;font-size:9px;color:#7a7470;}
    .watermark{position:absolute;z-index:0;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:${profile.chrome.watermark.opacity};font-size:34px;font-weight:800;letter-spacing:.08em;text-align:center;color:#1f2937;transform:rotate(-28deg);padding:50px;text-transform:uppercase;}
    h1,h2,h3,.no-orphan{break-after:avoid;page-break-after:avoid;}
    .form-page{break-before:page;page-break-before:always;}
    @media print{body{background:#fff;}.pg{margin:0;box-shadow:none;}}
  </style></head><body>${bodyHtml}</body></html>`;
}

export function renderChromePage(args: {
  model: PacketModel;
  profile: PacketRenderingProfile;
  moduleId: PacketModuleId;
  pageNumber: number;
  totalPages: number;
  banner: string;
  title: string;
  bodyHtml: string;
  lockStatusText: string | null;
  lockPassed: boolean | null;
  beginOnNewPage: boolean;
  syntheticDetail: string | null;
}): string {
  const pageClass = args.beginOnNewPage ? 'pg form-page' : 'pg';
  const watermarkText = watermarkFor(args.model, args.profile);
  const handlingNotice = renderHandlingNotice(args.model, args.profile);
  const lockBanner = args.lockStatusText
    ? `<div class="lock-banner${args.lockPassed ? ' pass' : ''}"><b>${escapeHtml(args.lockStatusText)}</b></div>`
    : '';
  const syntheticBanner = args.model.classification === 'synthetic-uat'
    ? renderSyntheticBanner(args.syntheticDetail, args.model)
    : '';

  return `<section class="${pageClass}" data-module-id="${escapeHtml(args.moduleId)}" data-page-number="${args.pageNumber}">
    ${renderAccentRail(args.profile)}
    ${watermarkText ? `<div class="watermark">${escapeHtml(watermarkText)}</div>` : ''}
    <div class="pg-banner"><span>${escapeHtml(args.banner)}</span><span>${escapeHtml(footerRightLabel(args.model))}</span></div>
    <div class="pg-in">
      ${renderLogo(args.profile)}
      <h2 class="pg-h">${escapeHtml(args.title)}</h2><div class="rule"></div>
      ${handlingNotice}${lockBanner}${syntheticBanner}${args.bodyHtml}
      ${renderFooter(args.model, args.profile, args.pageNumber, args.totalPages)}
    </div>
  </section>`;
}

export function renderModulePage(args: {
  model: PacketModel;
  module: PacketModelModuleInstance;
  profile: PacketRenderingProfile;
  pageNumber: number;
  totalPages: number;
  banner: string;
  title: string;
  bodyHtml: string;
  contentBlocks?: readonly PacketPageContentBlock[];
  lockStatusText?: string | null;
  lockPassed?: boolean | null;
  beginOnNewPage?: boolean;
  syntheticDetail?: string | null;
}): { html: string; page: RenderedPacketPage } {
  const watermarkText = watermarkFor(args.model, args.profile);

  return {
    html: renderChromePage({
      model: args.model,
      profile: args.profile,
      moduleId: args.module.moduleId,
      pageNumber: args.pageNumber,
      totalPages: args.totalPages,
      banner: args.banner,
      title: args.title,
      bodyHtml: args.bodyHtml,
      lockStatusText: args.lockStatusText ?? null,
      lockPassed: args.lockPassed ?? null,
      beginOnNewPage: args.beginOnNewPage ?? false,
      syntheticDetail: args.syntheticDetail ?? null,
    }),
    page: {
      pageNumber: args.pageNumber,
      pageId: `${args.module.moduleId}-${args.pageNumber}`,
      title: args.title,
      moduleId: args.module.moduleId,
      contentBlocks: args.contentBlocks ?? [],
      footerLabel: footerRightLabel(args.model),
      classification: args.model.classification,
      isConfidential: isConfidential(args.model.classification),
      watermarkText,
    },
  };
}

function renderAccentRail(profile: PacketRenderingProfile): string {
  if (!profile.chrome.accentRail.enabled) {
    return '';
  }
  return '<div class="accent-rail"><span></span><span></span></div>';
}

function renderLogo(profile: PacketRenderingProfile): string {
  if (!profile.chrome.logo.enabled) {
    return '';
  }
  const colors = profileChromeColors(profile);
  return `<svg class="ci-mark" viewBox="0 0 360 70" xmlns="http://www.w3.org/2000/svg" aria-label="${escapeHtml(profile.chrome.logo.altText)}"><g fill="none" stroke="${escapeHtml(colors.secondary)}" stroke-width="7" stroke-linecap="round"><circle cx="34" cy="22" r="13"/><path d="M8 56c0-16 12-26 26-26s26 10 26 26"/></g><text x="74" y="34" font-family="Roboto,Segoe UI,sans-serif" font-size="30" font-weight="700" fill="#1f2937">Care</text><text x="150" y="34" font-family="Roboto,Segoe UI,sans-serif" font-size="30" font-weight="700" fill="${escapeHtml(colors.primary)}">Indeed</text><text x="74" y="52" font-family="Roboto,Segoe UI,sans-serif" font-size="11" letter-spacing="2" fill="#7a7470">THE HEART OF HOME HEALTH</text></svg>`;
}

function renderHandlingNotice(model: PacketModel, profile: PacketRenderingProfile): string {
  if (!profile.chrome.classificationNotice.enabled) {
    return '';
  }
  const text = model.handlingNotice
    ? `${profile.chrome.classificationNotice.text} ${model.handlingNotice}`
    : profile.chrome.classificationNotice.text;
  return `<div class="handling">${escapeHtml(text)}</div>`;
}

function renderSyntheticBanner(detail: string | null, model: PacketModel): string {
  const source = detail ? ` ${detail}` : '';
  const agency = model.identity.agencyId ? ` Agency: ${model.identity.agencyId}.` : '';
  return `<div class="synthetic-banner"><b>${escapeHtml(SYNTHETIC_UAT_WATERMARK)}</b>${escapeHtml(source)}${escapeHtml(agency)}</div>`;
}

function renderFooter(
  model: PacketModel,
  profile: PacketRenderingProfile,
  pageNumber: number,
  totalPages: number,
): string {
  if (!profile.chrome.footer.enabled) {
    return '';
  }
  const pieces: string[] = [];
  if (profile.chrome.footer.showPacketId) {
    pieces.push(model.identity.packetId);
  }
  if (profile.chrome.footer.showPeriod) {
    pieces.push(periodLabel(model));
  }
  if (profile.chrome.footer.showStatus) {
    pieces.push(formatStatus(model));
  }
  if (profile.chrome.footer.showClassification) {
    pieces.push(formatClassification(model.classification));
  }
  if (profile.chrome.footer.showPageNumbers) {
    pieces.push(`Page ${pageNumber} of ${totalPages}`);
  }
  return `<div class="pg-foot"><span><b>${escapeHtml(CARE_INDEED_ADDRESS)}</b></span><span>${escapeHtml(pieces.join(' · '))}</span></div>`;
}

function footerRightLabel(model: PacketModel): string {
  return `${model.identity.packetId} · ${formatStatus(model)}`;
}

function periodLabel(model: PacketModel): string {
  const start = model.identity.reportingPeriodStart;
  const end = model.identity.reportingPeriodEnd;
  if (start && end) {
    return `${start} → ${end}`;
  }
  return 'Reporting period not recovered';
}

function formatStatus(model: PacketModel): string {
  return PACKET_LIFECYCLE_TO_APPENDIX_D[model.identity.status] ?? model.identity.status;
}

function formatClassification(classification: PacketClassification): string {
  return classification.replace(/-/g, ' ').toUpperCase();
}

function isConfidential(classification: PacketClassification): boolean {
  return classification === 'confidential'
    || classification === 'restricted-personnel'
    || classification === 'legal-privileged';
}

function watermarkFor(model: PacketModel, profile: PacketRenderingProfile): string | null {
  if (!profile.chrome.watermark.enabled) {
    return null;
  }
  if (!profile.chrome.watermark.whenClassification.includes(model.classification)) {
    return null;
  }
  if (model.classification === 'synthetic-uat') {
    return SYNTHETIC_UAT_WATERMARK;
  }
  return profile.chrome.watermark.text ?? formatClassification(model.classification);
}

function profileChromeColors(profile: PacketRenderingProfile): ChromeColors {
  const [primary, secondary] = profile.chrome.accentRail.colors;
  if (!primary || !secondary) {
    throw new Error(`Rendering profile ${profile.profileId} must define primary and secondary chrome colors`);
  }
  return {
    primary,
    secondary,
    primarySoft: translucentColor(primary, 0.06),
    primaryRule: translucentColor(primary, 0.12),
  };
}

function translucentColor(color: string, alpha: number): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (!hex) {
    return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
  }
  const value = Number.parseInt(hex[1]!, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red},${green},${blue},${alpha})`;
}
