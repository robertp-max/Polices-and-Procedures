import type { PacketModel, PacketModelModuleInstance, PacketModuleId } from '@/policy/packets/contracts';
import { assertAnalysisBeforeForms } from '@/policy/packets/registries/moduleRegistry';
import { getRenderingProfile } from '@/policy/packets/registries/renderingProfiles';

import { renderPacketDocument } from './chrome';
import { getModuleRenderer } from './moduleRendererRegistry';
import { compactPages } from './pagination';
import { renderPartAPages, renderPartBDividerPage } from './partA/renderPartA';

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

  // Keep the branded packet cover as page 1, then synthesize the executive
  // narrative, then hand off to the existing evidence modules as Part B.
  const coverIndex = renderedPages.findIndex((page) => page.page.moduleId !== null && isCoverModuleId(page.page.moduleId));
  const coverHtml = coverIndex >= 0 ? renderedPages[coverIndex]?.html ?? '' : '';
  const appendixPages = renderedPages
    .filter((_, index) => index !== coverIndex)
    .map((page) => page.html);
  const partA = renderPartAPages(model, profile);
  const partBDivider = renderPartBDividerPage(model, profile);
  const partB = compactPages(appendixPages);

  return renderPacketDocument(model, profile, compactPages([coverHtml, partA, partBDivider, partB]));
}

function orderedRenderableModules(
  modules: readonly PacketModelModuleInstance[],
): PacketModelModuleInstance[] {
  return [...modules]
    .filter((module) => module.status !== 'not_applicable')
    .sort((left, right) => left.order - right.order);
}

function isCoverModuleId(moduleId: PacketModuleId): boolean {
  return moduleId === 'qapi-cover-page' || moduleId.includes('cover');
}
