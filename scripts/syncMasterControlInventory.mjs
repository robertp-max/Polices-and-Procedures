import { access, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const fileName = 'MASTER_CONTROL_INVENTORY_DATA_MODEL.json';

const candidateSources = [
  path.join(projectRoot, 'public', 'data', fileName),
  path.join(projectRoot, 'Builder', 'Documentations', fileName),
];

const outputPaths = [
  path.join(projectRoot, 'public', 'data', fileName),
  path.join(projectRoot, 'public', 'Builder', 'Documentations', fileName),
  path.join(projectRoot, 'public', 'Documentations', fileName),
  path.join(projectRoot, 'public', fileName),
];

async function resolveSource() {
  for (const candidate of candidateSources) {
    try {
      await access(candidate);
      return candidate;
    } catch { /* try next */ }
  }
  return null;
}

async function copyToOutputs(source) {
  let copied = 0;
  for (const outputPath of outputPaths) {
    if (path.resolve(outputPath) === path.resolve(source)) continue;
    await mkdir(path.dirname(outputPath), { recursive: true });
    await copyFile(source, outputPath);
    console.log(`[sync-master-control-inventory] Copied to ${path.relative(projectRoot, outputPath)}`);
    copied++;
  }
  return copied;
}

async function main() {
  const source = await resolveSource();
  if (!source) {
    console.warn('[sync-master-control-inventory] Dataset source not found in any candidate path. Skipping sync.');
    console.warn('  Searched:', candidateSources.map(p => path.relative(projectRoot, p)).join(', '));
    return;
  }
  console.log(`[sync-master-control-inventory] Source: ${path.relative(projectRoot, source)}`);
  await copyToOutputs(source);
}

main().catch(error => {
  console.error('[sync-master-control-inventory] Failed to sync dataset file.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
