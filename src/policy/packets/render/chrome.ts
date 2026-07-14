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

const CARE_INDEED_LEGAL_NAME = 'Care Indeed Home Health Care, Inc.';

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
    body{margin:0;background:#f6f8f8;font:12px/1.55 Roboto,Arial,sans-serif;color:#1f2937;}
    .pg{position:relative;width:8.5in;min-height:11in;background:#fff;margin:0 auto 18px;display:flex;flex-direction:column;break-after:page;page-break-after:always;overflow:visible;box-shadow:0 16px 48px rgba(31,41,55,.10);}
    .pg:empty{display:none;}
    .accent-rail{display:none;}
    .pg-in{position:relative;z-index:1;flex:1;padding:.34in .72in .32in;display:flex;flex-direction:column;}
    .pg-cover .pg-in{padding:.72in .72in .32in;}
    .pg-cover-head{display:flex;align-items:flex-start;justify-content:space-between;gap:30px;margin-bottom:1.22in;}
    .ci-mark{display:block;width:202px;height:auto;}
    .ci-mark-page{width:170px;}
    .ci-logo-fallback{display:none;color:${primary};font-size:24px;font-weight:700;line-height:1;}
    .ci-logo-fallback span{color:${secondary};}
    .cover-meta{text-align:right;color:#5d6767;font-family:Roboto,Arial,sans-serif;font-size:13px;font-weight:300;letter-spacing:.14em;line-height:1.45;text-transform:uppercase;}
    .cover-meta strong{display:block;color:${primary};font-size:15px;font-weight:300;letter-spacing:.18em;}
    .pg-topline{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:34px;color:#546161;font-family:Roboto,Arial,sans-serif;font-size:13px;font-weight:300;letter-spacing:.03em;}
    .pg-topline-left{display:flex;align-items:center;gap:14px;min-width:0;}
    .pg-topline-left-text{min-width:0;}
    .pg-topline-left-text strong{display:block;color:${primary};font-size:11px;font-weight:300;letter-spacing:.14em;text-transform:uppercase;}
    .pg-topline-right{text-align:right;}
    .pg-h{font-size:29px;line-height:1.15;color:#043f3f;margin:0 0 0;break-after:avoid;page-break-after:avoid;font-weight:700;max-width:6.8in;}
    .pg-cover .pg-h{font-size:45px;line-height:1.06;letter-spacing:0;text-transform:uppercase;max-width:5.9in;}
    .cover-eyebrow{font-size:13px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:${secondary};margin:0 0 18px;}
    .rule{width:138px;height:4px;background:linear-gradient(90deg,${secondary} 0 50%,${primary} 50% 100%);border-radius:2px;margin:22px 0 28px;}
    .pg-cover .rule{margin:28px 0 30px;}
    .handling{border:0;background:#fff4ed;border-left:5px solid ${secondary};padding:12px 16px;margin-bottom:14px;font-size:11px;color:#5c2d12;}
    .lock-banner{border:0;background:#fff7ed;border-left:5px solid #b35200;padding:10px 14px;margin-bottom:12px;font-size:11px;color:#7c2d12;}
    .lock-banner.pass{background:#f0fdf4;border-color:#bbf7d0;border-left-color:#0f7b34;color:#14532d;}
    .synthetic-banner{border:0;background:#fff7d6;border-left:5px solid #a86a00;padding:10px 14px;margin-bottom:12px;font-size:11px;color:#714d00;}
    .panel{background:#fff;border:1px solid #d7e1e1;border-radius:0;padding:15px 17px;margin-bottom:14px;break-inside:avoid;page-break-inside:avoid;}
    .panel-title{font-size:11px;font-weight:700;color:${secondary};text-transform:uppercase;letter-spacing:.16em;margin-bottom:10px;break-after:avoid;page-break-after:avoid;}
    .kv-row{display:flex;justify-content:space-between;gap:18px;border-bottom:1px solid #e9eeee;padding:6px 0;font-size:11.5px;}
    .kv-key{color:${primary};font-weight:600;}
    .kv-value{color:#111;text-align:right;}
    .data-table{width:100%;border-collapse:collapse;font-size:10.5px;margin:4px 0 8px;break-inside:auto;page-break-inside:auto;table-layout:fixed;}
    .data-table caption{text-align:left;color:#526064;font-size:10px;margin:0 0 6px;}
    .data-table thead{display:table-header-group;}
    .data-table th{background:${escapeHtml(colors.primarySoft)};color:${primary};text-align:left;padding:7px 9px;border-bottom:2px solid ${escapeHtml(colors.primaryRule)};letter-spacing:.04em;text-transform:uppercase;}
    .data-table td{padding:7px 9px;border-bottom:1px solid #e9eeee;vertical-align:top;overflow-wrap:anywhere;word-break:normal;}
    .p{font-size:11.5px;color:#374151;margin:0 0 8px;}
    .muted{color:#7a7470;font-size:10px;}
    .list{margin:0 0 6px 16px;padding:0;font-size:11.5px;}
    .list li{margin-bottom:4px;}
    .notice{border:0;background:#f7fafa;border-left:5px solid ${primary};padding:10px 14px;font-size:11px;color:#335154;margin-bottom:12px;break-inside:avoid;page-break-inside:avoid;}
    .notice-warning{background:#fff7ed;border-color:#f3c4a8;border-left-color:${secondary};color:#9a3412;}
    .notice-blocker{background:#fef2f2;border-color:#fecaca;border-left-color:#b91c1c;color:#7f1d1d;}
    .seal{border-color:#e6b3b3;background:#fff8f8;}
    .signature-block{margin:18px 0;break-inside:avoid;page-break-inside:avoid;}
    .signature-line{height:30px;border-bottom:1px solid #9ca3af;width:70%;}
    .signature-role{font-size:10px;font-weight:700;color:${primary};text-transform:uppercase;margin-top:4px;}
    .pg-foot{margin-top:auto;border-top:0;padding-top:16px;display:flex;justify-content:space-between;gap:18px;font-family:Roboto,Arial,sans-serif;font-size:11px;font-weight:300;color:#697272;}
    .print-running-header,.print-running-footer{display:none;}
    .watermark{position:absolute;z-index:0;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:${profile.chrome.watermark.opacity};font-size:34px;font-weight:800;letter-spacing:.08em;text-align:center;color:#1f2937;transform:rotate(-28deg);padding:50px;text-transform:uppercase;}
    h1,h2,h3,.no-orphan{break-after:avoid;page-break-after:avoid;}
    .form-page{break-before:page;page-break-before:always;}
    /* Part A — executive narrative */
    .pa-sub{font-size:13px;font-weight:300;letter-spacing:.06em;color:#546161;margin:0 0 18px;}
    .pa-lead{font-size:12.5px;line-height:1.62;color:#26343a;margin:0 0 14px;}
    .pa-domain{margin:0 0 18px;break-inside:avoid;page-break-inside:avoid;}
    .pa-domain h3{font-size:13px;font-weight:700;letter-spacing:.02em;color:#043f3f;margin:0 0 6px;}
    .pa-domain p{font-size:11.25px;line-height:1.62;color:#374151;margin:0 0 9px;}
    .pa-verdict{border-left:5px solid ${secondary};background:linear-gradient(90deg,#fff7ed 0,#f7fafa 72%);padding:15px 17px;margin:0 0 16px;box-shadow:0 8px 24px rgba(4,63,63,.06);}
    .pa-verdict p{font-size:12px;line-height:1.6;color:#26343a;margin:0;}
    .pa-infographic{border:1px solid #d7e1e1;background:#fff;border-radius:6px;padding:13px 15px;margin:0 0 16px;break-inside:avoid;page-break-inside:avoid;box-shadow:0 8px 24px rgba(4,63,63,.05);}
    .pa-info-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin:0 0 10px;color:#043f3f;}
    .pa-info-head span{font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;}
    .pa-info-head b{font-size:10px;font-weight:700;color:#697272;text-align:right;text-transform:uppercase;letter-spacing:.08em;}
    .pa-info-grid,.pa-scope-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}
    .pa-info-card,.pa-scope-tile{border-left:4px solid #d7e1e1;background:#f7fafa;padding:9px 10px;min-height:68px;overflow-wrap:anywhere;}
    .pa-info-card b,.pa-scope-tile b{display:block;color:#043f3f;font-size:20px;line-height:1.05;font-weight:800;overflow-wrap:anywhere;}
    .pa-info-card span,.pa-scope-tile span{display:block;color:#26343a;font-size:10px;font-weight:700;line-height:1.25;margin-top:4px;}
    .pa-info-card small,.pa-scope-tile small,.pa-info-note,.pa-flow-step small{display:block;color:#697272;font-size:8.5px;line-height:1.25;margin-top:3px;}
    .pa-info-met{border-color:${primary};}
    .pa-info-below{border-color:${secondary};}
    .pa-info-unknown{border-color:#9ca3af;background:#f8fafc;}
    .pa-info-neutral{border-color:#7aa7a5;}
    .pa-stack{min-height:24px;display:flex;flex-wrap:wrap;overflow:visible;border:1px solid #d7e1e1;background:#f8fafc;margin-top:10px;}
    .pa-stack-seg{display:flex;align-items:center;justify-content:center;min-width:52px;min-height:24px;padding:0 6px;color:#fff;font-size:8px;font-weight:700;white-space:normal;overflow:visible;text-align:center;line-height:1.15;}
    .pa-stack-seg.pa-info-met{background:${primary};}
    .pa-stack-seg.pa-info-below{background:${secondary};}
    .pa-stack-seg.pa-info-unknown{background:#6b7280;}
    .pa-stack-seg.pa-info-neutral{background:#7aa7a5;}
    .pa-scope-grid{grid-template-columns:repeat(3,minmax(0,1fr));}
    .pa-flow{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}
    .pa-flow-step{position:relative;border:1px solid #d7e1e1;background:#f7fafa;padding:9px 10px;min-height:64px;}
    .pa-flow-step:not(:last-child)::after{content:"";position:absolute;right:-8px;top:50%;width:8px;height:1px;background:#b8c7c7;}
    .pa-flow-step span{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#697272;font-weight:700;}
    .pa-flow-step b{display:block;font-size:22px;line-height:1.05;color:#043f3f;margin-top:4px;}
    .pa-stat-strip{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 16px;}
    .pa-stat{flex:1;min-width:120px;border:1px solid #d7e1e1;border-radius:4px;padding:11px 13px;}
    .pa-stat-v{font-size:23px;font-weight:800;line-height:1;}
    .pa-stat-l{font-size:9px;text-transform:uppercase;letter-spacing:.09em;color:#697272;margin-top:5px;}
    .pa-stat-s{font-size:8.5px;color:#9aa3a3;margin-top:3px;}
    .pa-split{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;}
    .pa-split>*{flex:1;min-width:250px;}
    .pa-decisions{list-style:none;padding:0;margin:0 0 12px;}
    .pa-decisions li{border-left:4px solid ${primary};background:#f7fafa;padding:9px 13px;margin:0 0 8px;font-size:11px;line-height:1.5;color:#374151;}
    .pa-decisions li b{color:#043f3f;}
    .pa-attribution{font-size:9px;color:#9aa3a3;font-style:italic;margin-top:10px;}
    .pa-divider .pg-in{justify-content:center;text-align:center;}
    .pa-divider-eyebrow{font-size:13px;font-weight:700;letter-spacing:.3em;text-transform:uppercase;color:${secondary};margin:0 0 10px;}
    .pa-divider-title{font-size:40px;font-weight:800;letter-spacing:.02em;color:#043f3f;margin:0 0 12px;}
    .pa-divider-sub{font-size:12px;color:#546161;max-width:5in;margin:0 auto;line-height:1.6;}
    @media print{@page{size:${profile.pageSize};margin:.5in .72in;}body{background:#fff;}.print-running-footer{display:none;}.pg{width:auto;min-height:0;margin:0;display:block;break-after:page;page-break-after:always;overflow:visible;box-shadow:none;}.pg-in,.pg-cover .pg-in{padding:0;display:block;}.pg-topline{display:flex;margin-bottom:.28in;}.pg-foot{display:none;}.pg-cover-head{margin-bottom:.86in;}.panel,.notice,.signature-block{break-inside:avoid;page-break-inside:avoid;}.kpi-card{break-inside:avoid;page-break-inside:avoid;}.data-table{break-inside:auto;page-break-inside:auto;}.watermark{display:none;}}
  </style></head><body>${renderPrintRunningChrome(model, profile)}${bodyHtml}</body></html>`;
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
  eyebrow?: string | null;
}): string {
  const isCover = isCoverPage(args.moduleId, args.pageNumber);
  const pageClass = [
    'pg',
    args.beginOnNewPage ? 'form-page' : '',
    isCover ? 'pg-cover' : '',
  ].filter(Boolean).join(' ');
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
    <div class="pg-in">
      ${renderPageHeader(args.model, args.profile, args.title, args.pageNumber, isCover)}
      ${args.eyebrow ? `<div class="cover-eyebrow">${escapeHtml(args.eyebrow)}</div>` : ''}
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
  eyebrow?: string | null;
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
      eyebrow: args.eyebrow ?? null,
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

/**
 * Module-agnostic page wrapper for computed front matter (Part A — Executive
 * Narrative). Reuses the same chrome as module pages (logo header, cover title
 * treatment, footer, watermark, print flow) but takes free-form content instead
 * of a typed module instance.
 */
export function renderNarrativePage(args: {
  model: PacketModel;
  profile: PacketRenderingProfile;
  title: string;
  eyebrow?: string | null;
  isCover?: boolean;
  bodyHtml: string;
  pageNumber: number;
  totalPages: number;
}): string {
  const isCover = args.isCover ?? false;
  const pageClass = ['pg', isCover ? 'pg-cover' : '', 'pg-partA'].filter(Boolean).join(' ');
  const watermarkText = watermarkFor(args.model, args.profile);
  return `<section class="${pageClass}" data-part="A" data-page-number="${args.pageNumber}">
    ${renderAccentRail(args.profile)}
    ${watermarkText ? `<div class="watermark">${escapeHtml(watermarkText)}</div>` : ''}
    <div class="pg-in">
      ${renderPageHeader(args.model, args.profile, args.title, args.pageNumber, isCover)}
      ${args.eyebrow ? `<div class="cover-eyebrow">${escapeHtml(args.eyebrow)}</div>` : ''}
      <h2 class="pg-h">${escapeHtml(args.title)}</h2><div class="rule"></div>
      ${args.bodyHtml}
      ${renderFooter(args.model, args.profile, args.pageNumber, args.totalPages)}
    </div>
  </section>`;
}

function renderAccentRail(profile: PacketRenderingProfile): string {
  if (!profile.chrome.accentRail.enabled) {
    return '';
  }
  return '<div class="accent-rail" aria-hidden="true"><span></span><span></span></div>';
}

function renderPageHeader(
  model: PacketModel,
  profile: PacketRenderingProfile,
  pageTitle: string,
  pageNumber: number,
  isCover: boolean,
): string {
  if (!profile.chrome.logo.enabled) {
    return '';
  }
  if (isCover) {
    return `<header class="pg-cover-head">
      ${renderLogoImage('cover', profile)}
      <div class="cover-meta">
        <strong>${escapeHtml(packetFamilyLabel(model))}</strong>
        <div>${CARE_INDEED_LEGAL_NAME}</div>
        <div>${escapeHtml(versionLine(model))}</div>
      </div>
    </header>`;
  }

  return `<header class="pg-topline">
    <div class="pg-topline-left">
      ${renderLogoImage('page', profile)}
      <div class="pg-topline-left-text">
        <strong>${CARE_INDEED_LEGAL_NAME}</strong>
        <div>${escapeHtml(versionLine(model))}</div>
      </div>
    </div>
    <div class="pg-topline-right">${escapeHtml(pageTitle)}<br>Page ${pageNumber}</div>
  </header>`;
}

function renderLogoImage(kind: 'cover' | 'page', profile: PacketRenderingProfile): string {
  const className = kind === 'cover' ? 'ci-mark' : 'ci-mark ci-mark-page';
  const asset = kind === 'cover' ? '/ci-logo-packet-cover.png' : '/ci-logo-packet-page.png';
  return `<div>
    <img class="${className}" alt="${escapeHtml(profile.chrome.logo.altText)}" src="${asset}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
    <div class="ci-logo-fallback">Care<span>Indeed</span></div>
  </div>`;
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
  return `<div class="pg-foot"><span>${escapeHtml(packetFamilyLabel(model))} - ${escapeHtml(versionLine(model))}</span><span>${escapeHtml(pieces.join(' · '))}</span></div>`;
}

function renderPrintRunningChrome(model: PacketModel, profile: PacketRenderingProfile): string {
  const footerPieces: string[] = [];
  if (profile.chrome.footer.showPacketId) {
    footerPieces.push(model.identity.packetId);
  }
  if (profile.chrome.footer.showPeriod) {
    footerPieces.push(periodLabel(model));
  }
  if (profile.chrome.footer.showStatus) {
    footerPieces.push(formatStatus(model));
  }
  if (profile.chrome.footer.showClassification) {
    footerPieces.push(formatClassification(model.classification));
  }
  return `<div class="print-running-footer" aria-hidden="true"><span>${escapeHtml(packetFamilyLabel(model))} - ${escapeHtml(versionLine(model))}</span><span>${escapeHtml(footerPieces.join(' · '))}</span></div>`;
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

function packetFamilyLabel(model: PacketModel): string {
  if (model.identity.packetTemplateId.includes('qapi')) {
    return 'QAPI Committee Packet';
  }
  if (model.identity.packetTemplateId.includes('admission')) {
    return 'Patient Admission Packet';
  }
  return 'Care Indeed Packet';
}

function versionLine(model: PacketModel): string {
  const version = `Version ${model.identity.packetVersion}.0`;
  if (model.identity.status === 'CERTIFIED' || model.identity.status === 'PUBLISHED' || model.identity.status === 'LOCKED') {
    return `${version} Final`;
  }
  if (
    model.identity.status === 'READY_FOR_APPROVAL'
    || model.identity.status === 'APPROVED_FOR_SIGNATURE'
    || model.identity.status === 'FULLY_SIGNED'
  ) {
    return `${version} Pending Approval`;
  }
  return `${version} Draft - Requires Review`;
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

function isCoverPage(moduleId: PacketModuleId, pageNumber: number): boolean {
  return pageNumber === 1 || moduleId === 'qapi-cover-page';
}

function watermarkFor(model: PacketModel, profile: PacketRenderingProfile): string | null {
  if (model.identity.packetTemplateId.includes('qapi')) {
    return null;
  }
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
