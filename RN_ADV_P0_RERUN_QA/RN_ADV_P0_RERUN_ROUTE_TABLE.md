# RN_ADV_P0_RERUN_ROUTE_TABLE.md

| Route | Pass/Fail | Visible Heading/Title | Screenshot Path | Console Path | Console Status | Error Boundary |
|-------|-----------|-----------------------|-----------------|--------------|----------------|----------------|
| /journey | Pass | Advanced Training — RN Clinical (with 4 cards) | RN_ADV_P0_RERUN_QA/screenshots/journey.png | RN_ADV_P0_RERUN_QA/console/journey.console.txt | No ADV errors | No |
| /journey/module/cms-485 | Pass | CMS-485 Plan of Care... | .../module-cms-485.png | .../module-cms-485.console.txt | No errors | No |
| /journey/module/qapi | Pass | Quality Assessment... | .../module-qapi.png | ... | No errors | No |
| /journey/module/oasis-e2-soc | Pass (fixed) | OASIS-E2 Start of Care Assessment | .../module-oasis-e2-soc.png | ... | No "unknown", resolves via getModuleDef | No |
| /journey/module/documentation-matters | Pass (fixed) | CMS Documentation Matters / Documentation Defensibility | .../module-documentation-matters.png | ... | No "unknown" | No |
| /journey/supervisor | Pass | Supervisor | .../journey-supervisor.png | ... | Unaffected | No |
| /journey/admin | Pass | Admin | ... | ... | Unaffected | No |
| /journey/guide | Pass | Guide | ... | ... | Unaffected | No |

All 4 RN-ADV now render without P0 unknown.