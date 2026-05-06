# EN Domain — Manual ACHC Tagging Report
## Pass: Corridor Print Crosswalk Pages 7–31 | Surveyor: ACHC Home Health Surveyor Mode

---

## Scope

- **Domain:** EN (Enterprise Governance Infrastructure)
- **Policies:** 4
- **Primary Source:** Corridor print crosswalk pages 7–31
- **Page 756 Used for Tagging?** NO

---

## Key Architectural Finding — EN Is the Platform Governing Itself

The EN domain is categorically unlike every other domain processed. CL, CO, QA, RM, HR, IT, OP, FN all govern **agency operations** — clinical care, compliance, staffing, finance. EN governs the **system that governs all other policies**.

EN policies operate at a meta-governance layer:

| Policy | What It Governs |
|--------|----------------|
| EN-CM-001 | How compliance is measured and reported |
| EN-LC-001 | How policies are created, reviewed, and retired |
| EN-TG-001 | How policies are classified and cross-referenced |
| EN-WF-101 | How policies are enforced and made evidence-traceable |

**No Corridor row governs any of these.** The Corridor requires that clinical policies exist (1-014) and that QAPI monitoring occurs (1-015/1-016). It does not govern the infrastructure for managing, classifying, enforcing, or measuring the compliance system itself.

EN is not a compliance gap. EN is **compliance platform architecture** — the scaffolding that makes all other domains surveyable, auditable, and defensible.

---

## Validation Totals

| Metric | Count |
|--------|-------|
| Total EN policies reviewed | 4 |
| Mapped — DIRECT | 0 |
| Mapped — PARTIAL | 1 |
| Unmapped — NONE | 3 |
| META_GOVERNANCE_LAYER flags | 3 |
| PLATFORM_ENGINEERING_GOVERNANCE flags | 1 |

---

## EN Policies

| Policy ID | Title | Corridor Row | Type | Layer |
|-----------|-------|-------------|------|-------|
| EN-CM-001 | Enterprise Compliance Metrics Program | 1-015; 1-016 (QAPI) | PARTIAL | Modern Operational + QAPI integration |
| EN-LC-001 | Policy Lifecycle Control & Version Management | — | NONE | Meta-Governance Layer |
| EN-TG-001 | Enterprise Policy Taxonomy & Classification Governance | — | NONE | Meta-Governance Layer |
| EN-WF-101 | Policy Execution, Workflow Enforcement & Evidence Traceability | — | NONE | Meta-Governance + Platform Engineering |

---

## EN-CM-001 — The One PARTIAL

EN-CM-001 explicitly cites 42 CFR §484.65 (QAPI) and references QAPI integration as a design requirement. Corridor rows 1-015 (Performance Improvement Program) and 1-016 (QAPI Program) implement this regulation. The QAPI integration component of EN-CM-001 aligns — but the enterprise compliance metrics architecture (KPI definitions, traffic-light corrective action triggers, Compliance Dashboard, semi-annual governing body reporting cadence) extends far beyond the Corridor's QAPI row. PARTIAL with HIGH confidence.

---

## The Meta-Governance Layer — A New Architectural Recognition

Three EN policies carry `META_GOVERNANCE_LAYER` — a flag introduced here to distinguish:

| Flag | Meaning |
|------|---------|
| MODERN_OPERATIONAL_GOVERNANCE_LAYER | Internal governance beyond Corridor scope but governing agency operations |
| META_GOVERNANCE_LAYER | Governing the governance system itself — no accreditation framework addresses this layer |
| PLATFORM_ENGINEERING_GOVERNANCE | The technical infrastructure that implements compliance execution |

**EN-WF-101** combines all three: it is the platform policy for how workflow enforcement and evidence traceability work — the machinery that makes every other policy's survey evidence artifacts surveyable. It is foundationally important to survey defensibility but is itself entirely outside any regulatory crosswalk.

**Implication for surveyor interactions:** A surveyor reviewing EN-WF-101 would not find a Corridor row to cite. But the existence of EN-WF-101 is what enables the surveyor to find evidence for every other policy. The infrastructure makes the evidence; the evidence is what the surveyor validates.

---

## Page 756 Non-Use Confirmation

**CONFIRMED:** Page 756 not used for any tagging decision.

---

## All Policy IDs Processed

EN-CM-001, EN-LC-001, EN-TG-001, EN-WF-101
