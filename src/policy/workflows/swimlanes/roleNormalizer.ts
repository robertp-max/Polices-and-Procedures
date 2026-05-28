const ROLE_ALIASES: Array<[RegExp, string]> = [
  [/administrator|admin/i, 'Administrator'],
  [/clinical\s*(manager|mgr)|don|director of nursing/i, 'Clinical Manager'],
  [/qapi|quality.*chair|committee chair/i, 'QAPI Lead / Chair'],
  [/data|quality source|qa analyst|analyst/i, 'Data Analyst / Quality Source'],
  [/compliance/i, 'Compliance Officer'],
  [/infection|ic lead|prevention/i, 'Infection Preventionist'],
  [/committee|voting|member|quorum/i, 'Committee / Voting Members'],
  [/scribe|minutes/i, 'Scribe'],
  [/governing|board/i, 'Governing Body'],
  [/\bhr\b|human resources|training coordinator/i, 'HR'],
  [/finance|billing|revenue|coder|rcm|cfo/i, 'Finance'],
  [/it|security|privacy|hipaa/i, 'IT / Security'],
  [/risk/i, 'Risk Manager'],
  [/operations|facilities|office manager/i, 'Operations'],
  [/evidence|ecign|system|artifact/i, 'Evidence / eCIgn System'],
  [/qa reviewer|oasis qa|medical records auditor|auditor/i, 'Data Analyst / Quality Source'],
  [/supervisor/i, 'Clinical Manager'],
];

export function normalizeRole(role?: string | null): string {
  const raw = role?.trim();
  if (!raw) return 'Assigned Owner';

  const firstRole = raw
    .replace(/\([^)]*\)/g, '')
    .split(/[;,/]| and /i)
    .map(part => part.trim())
    .find(Boolean) ?? raw;

  const match = ROLE_ALIASES.find(([pattern]) => pattern.test(firstRole));
  return match?.[1] ?? firstRole;
}

export function roleKey(role: string): string {
  return normalizeRole(role).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'assigned-owner';
}
