import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';
import { FORMS_DATASET } from '../src/policy/data/formsLibraryDataset';
import { FORM_ID_ALIASES, resolveCanonicalFormId } from '../src/policy/data/formIdAliases';

const formIds = new Set(FORMS_DATASET.map(form => form.id));
const missing = REGULATORY_EVENTS.flatMap(event =>
  event.requiredForms
    .map(form => {
      const requestedId = form.formId || form.id;
      const canonicalId = resolveCanonicalFormId(requestedId);
      return { eventId: event.id, requestedId, canonicalId };
    })
    .filter(form => !form.canonicalId || !formIds.has(form.canonicalId)),
);

const brokenAliases = Object.entries(FORM_ID_ALIASES)
  .filter(([, alias]) => !formIds.has(alias.canonicalId))
  .map(([aliasId, alias]) => `${aliasId}->${alias.canonicalId}`);

if (missing.length > 0 || brokenAliases.length > 0) {
  console.error('[FAIL] required form route resolution');
  for (const form of missing.slice(0, 20)) {
    console.error(`  ${form.eventId}: ${form.requestedId} -> ${form.canonicalId ?? '(missing)'}`);
  }
  for (const alias of brokenAliases.slice(0, 20)) {
    console.error(`  broken alias ${alias}`);
  }
  process.exitCode = 1;
} else {
  console.log(`[PASS] ${REGULATORY_EVENTS.length} events have required forms resolvable to Enterprise Forms Library records`);
  console.log(`[PASS] ${Object.keys(FORM_ID_ALIASES).length} legacy form aliases point to canonical form records`);
}

