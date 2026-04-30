import { access, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const fileName = 'MASTER_CONTROL_INVENTORY_DATA_MODEL.json';
const sourcePath = path.join(projectRoot, 'Builder', 'Documentations', fileName);

const outputPaths = [
  path.join(projectRoot, 'public', 'Builder', 'Documentations', fileName),
  path.join(projectRoot, 'public', 'Documentations', fileName),
  path.join(projectRoot, 'public', fileName),
];

async function ensureSourceExists() {
  try {
    await access(sourcePath);
  } catch {
    throw new Error(`Master Control Inventory dataset source is missing: ${sourcePath}`);
  }
}

async function copyToOutputs() {
  for (const outputPath of outputPaths) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await copyFile(sourcePath, outputPath);
    console.log(`[sync-master-control-inventory] Copied to ${path.relative(projectRoot, outputPath)}`);
  }
}

async function main() {
  await ensureSourceExists();
  await copyToOutputs();
}

main().catch(error => {
  console.error('[sync-master-control-inventory] Failed to sync dataset file.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
