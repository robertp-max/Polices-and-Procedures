import type { Request } from 'express';
import { isIP } from 'node:net';

export type NetworkLookupStatus = 'resolved' | 'lookup_failed' | 'private_or_local_ip';

export interface NetworkLocationMetadata {
  ip_address: string;
  city: string;
  state_region: string;
  country: string;
  postal: string;
  org_isp: string;
  source: string;
  captured_at: string;
  user_agent: string;
  lookup_status: NetworkLookupStatus;
  failure_reason?: string;
}

export interface RequestNetworkContext {
  ip: string;
  source: string;
  user_agent: string;
}

interface CandidateIp {
  ip: string;
  source: string;
}

interface GeoLookupResult {
  city: string;
  state_region: string;
  country: string;
  postal: string;
  org_isp: string;
  source: string;
  ok: boolean;
  failure_reason?: string;
}

const UNAVAILABLE = 'Unavailable';
const LOOKUP_TIMEOUT_MS = 3500;
const DEV_MODE = process.env.NODE_ENV !== 'production';

function devLog(message: string, details: unknown) {
  if (!DEV_MODE) return;
  // eslint-disable-next-line no-console
  console.info(`[ecign.network] ${message}`, details);
}

function normalizeIp(raw: string): string {
  let v = (raw || '').trim();
  if (!v) return '';

  if (v.toLowerCase() === 'localhost') return '127.0.0.1';

  if (v.startsWith('"') && v.endsWith('"')) {
    v = v.slice(1, -1);
  }

  if (v.startsWith('[') && v.includes(']')) {
    v = v.slice(1, v.indexOf(']'));
  }

  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(v)) {
    v = v.split(':')[0];
  }

  if (v.includes('%')) {
    v = v.split('%')[0];
  }

  if (v === '::1') return '127.0.0.1';
  if (v.startsWith('::ffff:')) {
    const mapped = v.slice('::ffff:'.length);
    if (isIP(mapped) === 4) return mapped;
  }

  return v;
}

function isPrivateOrLocalIpv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return true;

  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;

  return false;
}

function isPrivateOrLocalIpv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === '::1' || v === '::') return true;
  if (v.startsWith('fc') || v.startsWith('fd')) return true;
  if (v.startsWith('fe80:')) return true;
  return false;
}

function isPrivateOrLocalIp(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isPrivateOrLocalIpv4(ip);
  if (family === 6) return isPrivateOrLocalIpv6(ip);
  return true;
}

function splitHeaderIps(headerValue: string | string[] | undefined): string[] {
  if (!headerValue) return [];
  const raw = Array.isArray(headerValue) ? headerValue.join(',') : headerValue;
  return raw
    .split(',')
    .map((v) => normalizeIp(v))
    .filter(Boolean);
}

function collectCandidateIps(req: Request): CandidateIp[] {
  const candidates: CandidateIp[] = [];

  for (const ip of splitHeaderIps(req.headers['x-forwarded-for'])) {
    candidates.push({ ip, source: 'x-forwarded-for' });
  }
  for (const ip of splitHeaderIps(req.headers['cf-connecting-ip'])) {
    candidates.push({ ip, source: 'cf-connecting-ip' });
  }
  for (const ip of splitHeaderIps(req.headers['x-real-ip'])) {
    candidates.push({ ip, source: 'x-real-ip' });
  }

  const remote = normalizeIp(req.socket.remoteAddress || '');
  if (remote) {
    candidates.push({ ip: remote, source: 'request.socket.remoteAddress' });
  }

  const deduped: CandidateIp[] = [];
  const seen = new Set<string>();
  for (const c of candidates) {
    if (seen.has(c.ip)) continue;
    seen.add(c.ip);
    deduped.push(c);
  }
  return deduped;
}

function pickBestIp(candidates: CandidateIp[]): CandidateIp {
  for (const c of candidates) {
    if (isIP(c.ip) !== 0 && !isPrivateOrLocalIp(c.ip)) return c;
  }
  for (const c of candidates) {
    if (isIP(c.ip) !== 0) return c;
  }
  return { ip: '', source: 'unavailable' };
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`http_${res.status}`);
    return await res.json() as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function lookupIpWho(ip: string): Promise<GeoLookupResult> {
  try {
    const body = await fetchJson<{
      success?: boolean;
      city?: string;
      region?: string;
      country?: string;
      postal?: string;
      connection?: { isp?: string };
      message?: string;
    }>(`https://ipwho.is/${encodeURIComponent(ip)}`);

    if (body.success === false) {
      return {
        city: UNAVAILABLE,
        state_region: UNAVAILABLE,
        country: UNAVAILABLE,
        postal: UNAVAILABLE,
        org_isp: UNAVAILABLE,
        source: 'ipwho.is',
        ok: false,
        failure_reason: body.message || 'provider_rejected',
      };
    }

    const city = body.city?.trim() || '';
    const state_region = body.region?.trim() || '';
    const country = body.country?.trim() || '';
    const postal = body.postal?.trim() || '';
    const org_isp = body.connection?.isp?.trim() || '';
    const hasData = Boolean(city || state_region || country || postal || org_isp);

    return {
      city: city || UNAVAILABLE,
      state_region: state_region || UNAVAILABLE,
      country: country || UNAVAILABLE,
      postal: postal || UNAVAILABLE,
      org_isp: org_isp || UNAVAILABLE,
      source: 'ipwho.is',
      ok: hasData,
      failure_reason: hasData ? undefined : 'provider_empty_payload',
    };
  } catch (e) {
    return {
      city: UNAVAILABLE,
      state_region: UNAVAILABLE,
      country: UNAVAILABLE,
      postal: UNAVAILABLE,
      org_isp: UNAVAILABLE,
      source: 'ipwho.is',
      ok: false,
      failure_reason: e instanceof Error ? e.message : 'provider_error',
    };
  }
}

async function lookupIpApi(ip: string): Promise<GeoLookupResult> {
  try {
    const body = await fetchJson<{
      city?: string;
      region?: string;
      country_name?: string;
      country?: string;
      postal?: string;
      org?: string;
      error?: boolean;
      reason?: string;
    }>(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);

    if (body.error) {
      return {
        city: UNAVAILABLE,
        state_region: UNAVAILABLE,
        country: UNAVAILABLE,
        postal: UNAVAILABLE,
        org_isp: UNAVAILABLE,
        source: 'ipapi.co',
        ok: false,
        failure_reason: body.reason || 'provider_rejected',
      };
    }

    const city = body.city?.trim() || '';
    const state_region = body.region?.trim() || '';
    const country = (body.country_name || body.country || '').trim();
    const postal = body.postal?.trim() || '';
    const org_isp = body.org?.trim() || '';
    const hasData = Boolean(city || state_region || country || postal || org_isp);

    return {
      city: city || UNAVAILABLE,
      state_region: state_region || UNAVAILABLE,
      country: country || UNAVAILABLE,
      postal: postal || UNAVAILABLE,
      org_isp: org_isp || UNAVAILABLE,
      source: 'ipapi.co',
      ok: hasData,
      failure_reason: hasData ? undefined : 'provider_empty_payload',
    };
  } catch (e) {
    return {
      city: UNAVAILABLE,
      state_region: UNAVAILABLE,
      country: UNAVAILABLE,
      postal: UNAVAILABLE,
      org_isp: UNAVAILABLE,
      source: 'ipapi.co',
      ok: false,
      failure_reason: e instanceof Error ? e.message : 'provider_error',
    };
  }
}

async function resolveGeoLookup(ip: string): Promise<GeoLookupResult> {
  const primary = await lookupIpWho(ip);
  if (primary.ok) return primary;

  const secondary = await lookupIpApi(ip);
  if (secondary.ok) return secondary;

  return {
    city: UNAVAILABLE,
    state_region: UNAVAILABLE,
    country: UNAVAILABLE,
    postal: UNAVAILABLE,
    org_isp: UNAVAILABLE,
    source: `${primary.source}|${secondary.source}`,
    ok: false,
    failure_reason: secondary.failure_reason || primary.failure_reason || 'lookup_failed',
  };
}

export function resolveRequestNetworkContext(req: Request): RequestNetworkContext {
  const best = pickBestIp(collectCandidateIps(req));
  return {
    ip: best.ip,
    source: best.source,
    user_agent: req.header('user-agent') ?? '',
  };
}

export async function resolveNetworkLocationMetadata(req: Request): Promise<NetworkLocationMetadata> {
  const captured_at = new Date().toISOString();
  const context = resolveRequestNetworkContext(req);
  devLog('ip_detected', {
    ip: context.ip || 'Unavailable',
    source: context.source,
  });

  if (!context.ip) {
    const missing: NetworkLocationMetadata = {
      ip_address: UNAVAILABLE,
      city: UNAVAILABLE,
      state_region: UNAVAILABLE,
      country: UNAVAILABLE,
      postal: UNAVAILABLE,
      org_isp: UNAVAILABLE,
      source: context.source,
      captured_at,
      user_agent: context.user_agent || UNAVAILABLE,
      lookup_status: 'lookup_failed',
      failure_reason: 'missing_ip',
    };
    devLog('lookup_failed', missing);
    return missing;
  }

  if (isPrivateOrLocalIp(context.ip)) {
    const local: NetworkLocationMetadata = {
      ip_address: context.ip,
      city: UNAVAILABLE,
      state_region: UNAVAILABLE,
      country: UNAVAILABLE,
      postal: UNAVAILABLE,
      org_isp: UNAVAILABLE,
      source: context.source,
      captured_at,
      user_agent: context.user_agent || UNAVAILABLE,
      lookup_status: 'private_or_local_ip',
      failure_reason: 'private_or_local_ip',
    };
    devLog('lookup_skipped', local);
    return local;
  }

  const lookup = await resolveGeoLookup(context.ip);
  if (!lookup.ok) {
    const failed: NetworkLocationMetadata = {
      ip_address: context.ip,
      city: UNAVAILABLE,
      state_region: UNAVAILABLE,
      country: UNAVAILABLE,
      postal: UNAVAILABLE,
      org_isp: UNAVAILABLE,
      source: `${context.source}:${lookup.source}`,
      captured_at,
      user_agent: context.user_agent || UNAVAILABLE,
      lookup_status: 'lookup_failed',
      failure_reason: lookup.failure_reason || 'lookup_failed',
    };
    devLog('lookup_failed', failed);
    return failed;
  }

  const resolved: NetworkLocationMetadata = {
    ip_address: context.ip,
    city: lookup.city,
    state_region: lookup.state_region,
    country: lookup.country,
    postal: lookup.postal,
    org_isp: lookup.org_isp,
    source: `${context.source}:${lookup.source}`,
    captured_at,
    user_agent: context.user_agent || UNAVAILABLE,
    lookup_status: 'resolved',
  };
  devLog('lookup_resolved', {
    ip_address: resolved.ip_address,
    source: resolved.source,
    lookup_status: resolved.lookup_status,
    city: resolved.city,
    state_region: resolved.state_region,
    country: resolved.country,
    postal: resolved.postal,
    org_isp: resolved.org_isp,
  });
  return resolved;
}
