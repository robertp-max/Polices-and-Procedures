// One-off: parse Policies_and_Procedures_LMS_Assignment_Matrix.xlsx -> JSON (array-of-arrays,
// preserving the title row) so the deterministic pipeline can consume it. Prints structure.
import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const SRC = 'REVIEW_OUTPUTS/employee-journey-mapping/_sources/Policies_and_Procedures_LMS_Assignment_Matrix.xlsx';
const OUT = 'REVIEW_OUTPUTS/employee-journey-mapping/_sources/matrix';
mkdirSync(OUT, { recursive: true });

const wb = XLSX.read(readFileSync(SRC), { type: 'buffer' });
for (const name of wb.SheetNames) {
  const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: null, blankrows: false });
  const slug = name.replace(/[^a-z0-9]+/gi, '_');
  writeFileSync(path.join(OUT, `${slug}.aoa.json`), JSON.stringify(aoa, null, 2));
  console.log(`\n===== ${name} (${aoa.length} rows) =====`);
  console.log('row0:', JSON.stringify(aoa[0]));
  console.log('row1:', JSON.stringify(aoa[1]));
  console.log('row2:', JSON.stringify(aoa[2]));
}
