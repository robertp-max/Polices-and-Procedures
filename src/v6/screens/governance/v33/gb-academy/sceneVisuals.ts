export const LEARNING_PANEL_IDS = [
  'orientation',
  'control-model',
  'worked-example',
  'failure-patterns',
  'field-guide',
] as const;

export type LearningPanelId = (typeof LEARNING_PANEL_IDS)[number];

export type SceneVisual = {
  src: string;
  alt: string;
  positions: Array<[number, number]>;
};

type ModuleSceneIdentity = {
  assetStem: string;
  title: string;
};

export const GB_MODULE_SCENE_IDENTITIES = {
  'GB-001': { assetStem: 'gb-001', title: 'Authority, Accountability & Reserved Powers' },
  'GB-002': { assetStem: 'gb-002', title: 'Structure, Bylaws, Membership & Orientation' },
  'GB-003': { assetStem: 'gb-003', title: 'Meetings That Prove Governance' },
  'GB-004': { assetStem: 'gb-004', title: 'Appoint, Oversee, Replace' },
  'GB-005': { assetStem: 'gb-005', title: 'QAPI as an Executive Duty' },
  'GB-006': { assetStem: 'gb-006', title: 'Compliance Independence & Escalation' },
  'GB-007': { assetStem: 'gb-007', title: 'Fiscal Stewardship Under Regulatory Risk' },
  'GB-008': { assetStem: 'gb-008', title: 'Strategy, Scope & Policy Authority' },
  'GB-009': { assetStem: 'gb-009', title: 'Enterprise Risk, Incidents & Emergency Governance' },
  'GB-010': { assetStem: 'gb-010', title: 'Third-Party Arrangements & Referral Risk' },
  'GB-011': { assetStem: 'gb-011', title: 'Survey, Enforcement & Corrective Governance' },
  'GB-012': { assetStem: 'gb-012', title: 'Ethics, Conflicts & Board Self-Improvement' },
  'GB-CAPSTONE': { assetStem: 'gb-capstone', title: 'Integrated Governance Under Pressure' },
} as const satisfies Record<string, ModuleSceneIdentity>;

export type GbModuleId = keyof typeof GB_MODULE_SCENE_IDENTITIES;

const SCENE_ALT: Record<LearningPanelId, string> = {
  orientation: 'the governing body establishes the decision context and retained duty around a controlled board packet',
  'control-model': 'directors map authority, evidence, bounded action, ownership, and effectiveness controls',
  'worked-example': 'directors compare a polished recommendation with conflicting source evidence before acting',
  'failure-patterns': 'directors identify a broken governance chain and repair omitted controls',
  'field-guide': 'directors use a practical boardroom checklist to verify authority, evidence, action, and follow-through',
};

// Every generated scene deliberately stages four meaningful decision objects in
// these zones. Coordinates vary by lesson so hotspot placement never inherits a
// single module-wide layout.
const SCENE_POSITIONS: Record<LearningPanelId, Array<[number, number]>> = {
  orientation: [[23, 34], [71, 32], [28, 72], [76, 73]],
  'control-model': [[20, 28], [76, 31], [25, 72], [78, 74]],
  'worked-example': [[26, 32], [68, 34], [31, 76], [74, 72]],
  'failure-patterns': [[21, 37], [75, 35], [28, 74], [78, 76]],
  'field-guide': [[25, 30], [72, 30], [24, 73], [73, 74]],
};

const ORIENTATION_POSITIONS: Record<GbModuleId, Array<[number, number]>> = {
  'GB-001': [[35, 66], [55, 83], [72, 73], [90, 67]],
  'GB-002': [[77, 50], [64, 63], [94, 69], [57, 80]],
  'GB-003': [[52, 60], [67, 60], [85, 62], [68, 84]],
  'GB-004': [[20, 67], [44, 54], [51, 81], [78, 72]],
  'GB-005': [[14, 65], [45, 67], [65, 65], [79, 78]],
  'GB-006': [[16, 78], [40, 79], [64, 75], [86, 77]],
  'GB-007': [[15, 78], [37, 78], [63, 78], [86, 77]],
  'GB-008': [[28, 51], [60, 50], [43, 78], [69, 80]],
  'GB-009': [[32, 56], [62, 50], [39, 79], [73, 70]],
  'GB-010': [[30, 63], [48, 60], [65, 71], [83, 70]],
  'GB-011': [[15, 73], [41, 72], [65, 55], [78, 75]],
  'GB-012': [[25, 75], [43, 70], [64, 75], [86, 76]],
  'GB-CAPSTONE': [[31, 52], [65, 51], [28, 78], [73, 78]],
};

const POSITION_OVERRIDES: Partial<Record<`${GbModuleId}/${LearningPanelId}`, Array<[number, number]>>> = {
  'GB-001/control-model': [[25, 78], [46, 72], [62, 72], [79, 78]],
  'GB-001/worked-example': [[20, 79], [53, 62], [83, 59], [70, 83]],
  'GB-001/failure-patterns': [[23, 80], [57, 78], [88, 67], [88, 24]],
  'GB-001/field-guide': [[22, 61], [79, 67], [32, 83], [63, 83]],
  'GB-002/control-model': [[65, 28], [39, 55], [30, 72], [60, 78]],
  'GB-002/worked-example': [[33, 86], [43, 50], [31, 67], [70, 80]],
  'GB-002/failure-patterns': [[32, 52], [66, 54], [18, 79], [82, 80]],
  'GB-002/field-guide': [[41, 52], [53, 65], [29, 80], [72, 80]],
  'GB-003/control-model': [[33, 18], [74, 20], [54, 61], [55, 83]],
  'GB-003/worked-example': [[31, 55], [49, 60], [68, 61], [72, 78]],
  'GB-003/failure-patterns': [[39, 62], [66, 59], [25, 82], [67, 82]],
  'GB-003/field-guide': [[47, 56], [76, 60], [23, 82], [59, 82]],
  'GB-004/control-model': [[35, 23], [70, 24], [45, 63], [68, 65]],
  'GB-004/worked-example': [[37, 53], [62, 55], [27, 80], [72, 80]],
  'GB-004/failure-patterns': [[20, 78], [58, 80], [74, 22], [83, 72]],
  'GB-004/field-guide': [[17, 56], [72, 57], [18, 82], [67, 82]],
  'GB-005/control-model': [[29, 51], [59, 65], [17, 78], [79, 81]],
  'GB-005/worked-example': [[27, 73], [69, 79], [31, 55], [62, 45]],
  'GB-005/failure-patterns': [[15, 21], [79, 63], [29, 62], [82, 84]],
  'GB-005/field-guide': [[16, 38], [47, 59], [19, 80], [73, 80]],
  'GB-006/control-model': [[20, 50], [55, 45], [20, 84], [78, 84]],
  'GB-006/worked-example': [[20, 77], [73, 82], [36, 56], [65, 55]],
  'GB-006/failure-patterns': [[18, 21], [78, 49], [25, 81], [70, 80]],
  'GB-006/field-guide': [[23, 50], [74, 49], [25, 80], [74, 80]],
  'GB-007/control-model': [[28, 18], [56, 59], [29, 79], [68, 79]],
  'GB-007/worked-example': [[25, 79], [50, 53], [75, 73], [77, 34]],
  'GB-007/failure-patterns': [[22, 87], [77, 20], [45, 69], [80, 82]],
  'GB-007/field-guide': [[21, 40], [72, 50], [25, 80], [73, 80]],
  'GB-008/control-model': [[49, 19], [71, 19], [50, 43], [71, 43]],
  'GB-008/worked-example': [[34, 60], [50, 42], [20, 79], [80, 80]],
  'GB-008/failure-patterns': [[22, 82], [74, 61], [79, 17], [82, 75]],
  'GB-008/field-guide': [[16, 60], [42, 48], [72, 50], [51, 80]],
  'GB-009/control-model': [[15, 77], [54, 76], [58, 18], [83, 20]],
  'GB-009/worked-example': [[27, 66], [56, 44], [73, 65], [55, 82]],
  'GB-009/failure-patterns': [[23, 67], [43, 82], [69, 71], [86, 66]],
  'GB-009/field-guide': [[48, 39], [35, 62], [70, 57], [75, 74]],
  'GB-010/control-model': [[52, 48], [22, 70], [50, 70], [79, 72]],
  'GB-010/worked-example': [[36, 52], [65, 52], [31, 76], [70, 75]],
  'GB-010/failure-patterns': [[17, 63], [36, 75], [76, 18], [84, 76]],
  'GB-010/field-guide': [[48, 24], [31, 61], [66, 64], [76, 82]],
  'GB-011/control-model': [[20, 75], [47, 27], [61, 72], [89, 67]],
  'GB-011/worked-example': [[19, 74], [49, 44], [79, 70], [80, 51]],
  'GB-011/failure-patterns': [[27, 20], [19, 70], [60, 72], [89, 78]],
  'GB-011/field-guide': [[15, 76], [49, 55], [55, 78], [86, 70]],
  'GB-012/control-model': [[20, 64], [50, 24], [68, 34], [72, 76]],
  'GB-012/worked-example': [[22, 65], [42, 77], [59, 49], [85, 74]],
  'GB-012/failure-patterns': [[18, 78], [52, 24], [76, 55], [62, 79]],
  'GB-012/field-guide': [[15, 75], [40, 50], [70, 43], [82, 77]],
  'GB-CAPSTONE/control-model': [[20, 66], [52, 37], [73, 56], [79, 82]],
  'GB-CAPSTONE/worked-example': [[48, 70], [18, 55], [65, 39], [80, 77]],
  'GB-CAPSTONE/failure-patterns': [[22, 68], [51, 19], [82, 63], [57, 82]],
  'GB-CAPSTONE/field-guide': [[28, 75], [37, 40], [68, 43], [70, 75]],
};

// Only the rejected blank-card / game-board scenes are replaced. Versioned
// filenames prevent browsers from reusing those rejected images from cache.
const CORRECTED_SCENE_SOURCES: Partial<Record<`${GbModuleId}/${LearningPanelId}`, string>> = {
};

export const GB_SCENE_VISUALS: Record<GbModuleId, Record<LearningPanelId, SceneVisual>> = Object.fromEntries(
  Object.entries(GB_MODULE_SCENE_IDENTITIES).map(([moduleId, identity]) => [
    moduleId,
    Object.fromEntries(LEARNING_PANEL_IDS.map((panelId) => [
      panelId,
      {
        src: CORRECTED_SCENE_SOURCES[`${moduleId as GbModuleId}/${panelId}`]
          ?? `/gb-visuals/scenes/${identity.assetStem}/${panelId}.png`,
        alt: `${identity.title}: ${SCENE_ALT[panelId]}.`,
        positions: (
          panelId === 'orientation'
            ? ORIENTATION_POSITIONS[moduleId as GbModuleId]
            : POSITION_OVERRIDES[`${moduleId as GbModuleId}/${panelId}`] ?? SCENE_POSITIONS[panelId]
        ).map(([x, y]) => [x, y]),
      },
    ])),
  ]),
) as Record<GbModuleId, Record<LearningPanelId, SceneVisual>>;

export function sceneVisualFor(moduleId: string, panelId: LearningPanelId): SceneVisual {
  const moduleScenes = GB_SCENE_VISUALS[moduleId as GbModuleId];
  if (!moduleScenes) throw new Error(`Missing Governing Body scene manifest for ${moduleId}.`);
  const scene = moduleScenes[panelId];
  if (!scene) throw new Error(`Missing Governing Body scene manifest for ${moduleId}/${panelId}.`);
  return scene;
}
