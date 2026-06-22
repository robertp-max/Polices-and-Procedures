import { env } from '../env.js';
import { log } from '../logger.js';
import { IaService } from '../ia/service.js';

/* ═══════════════════════════════════════════════════════════════
   CLI: build (or rebuild) the local compliance intelligence index.

   Run:
     npm run ia:index

   Output is written to $IA_INDEX_ROOT (default: .cache/ia-index).
   Embeddings are requested through Ollama; if Ollama is unreachable
   the build still produces a lexical-only index and logs a warning.
   ═══════════════════════════════════════════════════════════════ */

async function main() {
  const svc = new IaService({
    repoRoot: env.iaCorpusRoot,
    indexRoot: env.iaIndexRoot,
    requireEmbeddings: env.iaRequireEmbeddings,
    ollama: {
      baseUrl: env.ollamaBaseUrl,
      chatModel: env.ollamaChatModel,
      embedModel: env.ollamaEmbedModel,
      timeoutMs: env.ollamaTimeoutMs,
    },
  });

  log.info('ia.cli.index.start', {
    corpusRoot: env.iaCorpusRoot,
    indexRoot: env.iaIndexRoot,
    embedModel: env.ollamaEmbedModel,
    ollamaBaseUrl: env.ollamaBaseUrl,
  });

  let lastStage = '';
  let lastPercent = -1;
  const status = await svc.rebuild((stage, done, total) => {
    if (stage !== lastStage) {
      lastStage = stage;
      lastPercent = -1;
      log.info(`ia.cli.stage.${stage}.begin`, { total });
    }
    if (total === 0) return;
    const pct = Math.floor((done / total) * 100);
    // Log every ~10% to keep output manageable for large corpora.
    if (pct >= lastPercent + 10 || done === total) {
      lastPercent = pct;
      log.info(`ia.cli.stage.${stage}.progress`, { done, total, pct });
    }
  });

  log.info('ia.cli.index.done', {
    docCount: status.docCount,
    chunkCount: status.chunkCount,
    embedDim: status.embedDim,
    embedModel: status.embedModel,
    builtAt: status.builtAt,
  });
}

main().catch(err => {
  console.error('[ia:index] failed:', (err as Error)?.message ?? err);
  process.exit(1);
});
