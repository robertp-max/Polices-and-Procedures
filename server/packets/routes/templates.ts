import { Router, type NextFunction, type Request, type Response } from 'express';
import { ApiError } from '../../errors.js';
import {
  getTemplate,
  PACKET_TEMPLATES,
  templatesByCategory,
  templatesForEventFamily,
  toSelectionOutput,
} from '@/policy/packets/registries/templateRegistry';
import {
  getEventPacketDefinition,
  listMappedEventFamilyIds,
} from '@/policy/packets/registries/eventPacketMap';

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<void>;

function asyncH(fn: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

function queryString(req: Request, key: string): string | undefined {
  const value = req.query[key];
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  return undefined;
}

export function createPacketTemplatesRouter(): Router {
  const router = Router();

  router.get('/', asyncH(async (req, res) => {
    const eventFamilyId = queryString(req, 'eventFamilyId');
    const category = queryString(req, 'category');
    const availability = queryString(req, 'availability');
    let templates = eventFamilyId
      ? [...templatesForEventFamily(eventFamilyId)]
      : [...PACKET_TEMPLATES];

    if (category) {
      const categoryMatches = new Set(templatesByCategory(category).map((template) => template.packet_template_id));
      templates = templates.filter((template) => categoryMatches.has(template.packet_template_id));
    }
    if (availability) {
      templates = templates.filter((template) => template.availability === availability);
    }

    res.json({
      status: 'ok',
      templates,
      selectionOutputs: templates.map(toSelectionOutput),
      eventFamilyIds: listMappedEventFamilyIds(),
      count: templates.length,
    });
  }));

  router.get('/:templateId', asyncH(async (req, res) => {
    const templateId = req.params.templateId;
    const template = getTemplate(templateId);
    if (!template) {
      throw new ApiError('event_not_found', `Packet template not found: ${templateId}`, 404, {
        templateId,
      });
    }

    res.json({
      status: 'ok',
      template,
      selectionOutput: toSelectionOutput(template),
      compatibleEventFamilies: template.compatible_event_family_ids.map((eventFamilyId) => ({
        eventFamilyId,
        definition: getEventPacketDefinition(eventFamilyId) ?? null,
      })),
    });
  }));

  return router;
}

export const packetTemplatesRouter: Router = createPacketTemplatesRouter();
