import type { PacketModel, PacketModelModuleInstance } from '@/policy/packets/contracts';
import { assertAnalysisBeforeForms } from '@/policy/packets/registries/moduleRegistry';
import { getRenderingProfile } from '@/policy/packets/registries/renderingProfiles';

import { renderPacketDocument } from './chrome';
import { getModuleRenderer } from './moduleRendererRegistry';
import { compactPages } from './pagination';
import { renderPartAPages } from './partA/renderPartA';

export function renderPacketModel(model: PacketModel): string {
  const profile = getRenderingProfile(model.renderingProfileId);
  const modules = orderedRenderableModules(model.modules);
  assertAnalysisBeforeForms(modules.map((module) => module.moduleId));

  const renderedPages = modules.map((module, index) => {
    const renderer = getModuleRenderer(module.moduleId);
    return renderer({
      model,
      module,
      profile,
      pageNumber: index + 1,
      totalPages: modules.length,
    });
  });

  // Part A — Executive Narrative front matter (synthesized from this model),
  // then the modules as Part B — Evidence Appendices.
  const partA = renderPartAPages(model, profile);
  const partB = compactPages(renderedPages.map((page) => page.html));

  return renderPacketDocument(model, profile, `${partA}\n${partB}`);
}

function orderedRenderableModules(
  modules: readonly PacketModelModuleInstance[],
): PacketModelModuleInstance[] {
  return [...modules]
    .filter((module) => module.status !== 'not_applicable')
    .sort((left, right) => left.order - right.order);
}
