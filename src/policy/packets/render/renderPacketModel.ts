import type { PacketModel, PacketModelModuleInstance } from '@/policy/packets/contracts';
import { assertAnalysisBeforeForms } from '@/policy/packets/registries/moduleRegistry';
import { getRenderingProfile } from '@/policy/packets/registries/renderingProfiles';

import { renderPacketDocument } from './chrome';
import { getModuleRenderer } from './moduleRendererRegistry';
import { compactPages } from './pagination';

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

  return renderPacketDocument(
    model,
    profile,
    compactPages(renderedPages.map((page) => page.html)),
  );
}

function orderedRenderableModules(
  modules: readonly PacketModelModuleInstance[],
): PacketModelModuleInstance[] {
  return [...modules]
    .filter((module) => module.status !== 'not_applicable')
    .sort((left, right) => left.order - right.order);
}
