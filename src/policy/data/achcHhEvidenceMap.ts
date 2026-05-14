import evidenceCsvRaw from '@/policy/data/policy_hh_section_map.csv?raw';

export type HhEvidenceConfidence = 'HIGH' | 'MEDIUM' | 'LOW';
export type HhEvidenceMatchType = 'EXACT_HH_TEXT' | 'ACHC_CONTEXT' | 'CORRIDOR_CONTEXT' | 'POLICY_CONTEXT' | 'REVIEW_REQUIRED';

export interface HhEvidenceRow {
  policyId: string;
  policyTitle: string;
  hhStandard: string;
  sectionId: string;
  sectionTitle: string;
  supportingContent: string;
  matchType: HhEvidenceMatchType;
  confidence: HhEvidenceConfidence;
  notes: string;
  governanceDomain: string;
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let i = 0;
  const len = content.length;

  while (i < len) {
    const row: string[] = [];
    while (i < len) {
      if (content[i] === '"') {
        let field = '';
        i += 1;
        while (i < len) {
          if (content[i] === '"' && content[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          if (content[i] === '"') {
            i += 1;
            break;
          }
          field += content[i];
          i += 1;
        }
        row.push(field);
      } else {
        let field = '';
        while (i < len && content[i] !== ',' && content[i] !== '\n' && content[i] !== '\r') {
          field += content[i];
          i += 1;
        }
        row.push(field);
      }

      if (i < len && content[i] === ',') {
        i += 1;
      } else {
        break;
      }
    }

    if (i < len && content[i] === '\r') i += 1;
    if (i < len && content[i] === '\n') i += 1;
    if (row.length > 0) rows.push(row);
  }

  return rows;
}

function toDomain(policyId: string): string {
  return policyId.split('-')[0] ?? 'UNKNOWN';
}

const parsedRows = parseCsv(evidenceCsvRaw);
const [, ...dataRows] = parsedRows;

export const hhEvidenceRows: HhEvidenceRow[] = dataRows.map((row) => ({
  policyId: row[0] ?? '',
  policyTitle: row[1] ?? '',
  hhStandard: row[2] ?? '',
  sectionId: row[3] ?? '',
  sectionTitle: row[4] ?? '',
  supportingContent: row[5] ?? '',
  matchType: (row[6] ?? 'POLICY_CONTEXT') as HhEvidenceMatchType,
  confidence: (row[7] ?? 'LOW') as HhEvidenceConfidence,
  notes: row[8] ?? '',
  governanceDomain: toDomain(row[0] ?? ''),
}));

