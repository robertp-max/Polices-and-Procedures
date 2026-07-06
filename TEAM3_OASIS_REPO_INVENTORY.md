# TEAM 3 — OASIS-E2 SOC REPO INVENTORY.md

**Repo**: C:\AI\Git\training\CI-ION\CI-ION_OASIS-E2_SOC  
**Status**: Accessible.

**Key**:
- src/content/narration/ (OASIS_R2 with GG0170, M0300, B0200, C*, D*, I*, J*, K*, N*, O* items + rationale audio ~165 files; Additional Narrations 298+)
- src/data/ (design docs for SOC simulator, itemRationales.json, evidenceFocusTargets)
- src/components/ (31 files: simulator, ItemCard, EvidencePanel, many fix/patch at root)
- src/store/simulatorStore, pages/SimulatorPage
- Massive audio + OASIS item coding logic, GG functional, wound (M), behavioral, meds, homebound/skilled need.
- Reports, UAT, training-integrity.

**Framework**: Vite React 19, gradflow, lucide.
**Gemini**: heavy (BUILDER screenshots, 10+ patch cjs, design md in CaseContent, demo narrations).
**Narration**: full OASIS-E2 item level + rationale mapping verified in manifests.
**Blockers**: huge asset size; RN-only finalization policy to respect; mixed docs.

**UI specialization seed**: ItemCard + EvidencePanel + rationale selection + trap review (perfect for oasis_lab).
