export type TabletopPacketStatus =
  | 'not_generated'
  | 'generating'
  | 'review_required'
  | 'approved_for_uat'
  | 'failed'
  | 'superseded';

export interface TabletopPacketArtifact {
  packetId: string;
  caseId: string;
  period: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual';
  version: string;
  status: TabletopPacketStatus;
  sourceCutoff: string;
  sourceHash: string;
  generatedAt: string;
  generatedBy: 'Fable';
  pdfHash: string;
  pageCount: number;
  protectedOpenUrl: string;
  supersedesPacketId?: string;
  reviewFindings: string[];
}

export interface TabletopPacketManifestResponse {
  connected: boolean;
  classification: string;
  artifacts: TabletopPacketArtifact[];
  notice?: string;
}

export async function fetchTabletopPacketArtifacts(
  signal?: AbortSignal,
): Promise<TabletopPacketManifestResponse> {
  const response = await fetch('/api/governance/tabletop-packets', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = (await response.json()) as TabletopPacketManifestResponse;
  if (!response.ok) {
    throw new Error(payload.notice ?? 'Tabletop packet artifacts are unavailable.');
  }
  return payload;
}

export function formatPacketGeneratedAt(value: string): string {
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return value;
  return timestamp.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function openProtectedPacket(artifact: TabletopPacketArtifact): void {
  window.open(artifact.protectedOpenUrl, '_blank', 'noopener,noreferrer');
}
