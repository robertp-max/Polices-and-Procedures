#!/usr/bin/env python3
"""Generate src/policy/data/corridorAlignment.generated.ts.

Produces one CorridorAlignment record per canonical policy ID (read from
tmp-policy-ids.txt at the repo root), composed from:
  1. Subdomain DEFAULTS (ACHC chapter, CoP anchor, Title 22 anchor, evidence
     codes) — derived from docs/corridor-alignment-strategy.md Part 3.
  2. Per-policy OVERRIDES — hand-curated for high-priority/high-risk
     policies (Governing Body, Plan of Care, QAPI, Patient Rights, Billing,
     Emergency Preparedness, Safety, Infection Control, Medication, Comp).

Records that rely solely on subdomain defaults carry requiresReview=True so
a clinical SME can verify before survey use. This guarantees zero policy
IDs are missing alignment metadata while flagging what still needs review.

Run:
    python Builder/Policies/generate_corridor_alignment.py
"""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
IDS_FILE = ROOT / "tmp-policy-ids.txt"
OUT_TS = ROOT / "src" / "policy" / "data" / "corridorAlignment.generated.ts"
OUT_CSV = ROOT / "Builder" / "Policies" / "corridor-crosswalk.csv"

# ─────────────────────────────────────────────────────────────────────────
# Subdomain defaults: { "GV-GB": { ... } }
# ─────────────────────────────────────────────────────────────────────────
SUBDOMAIN_DEFAULTS: dict[str, dict] = {
    # Governance / Administration ─────────────────────
    "GV-GB": dict(achc=["HH1-1A", "HH1-1B", "HH1-2A", "HH1-5A.01"],
                  cop=["§484.105(a)", "§484.105(h)", "§484.65(e)"],
                  title22=["74717", "74721", "74742", "SB 188"],
                  evidence=["P", "D", "I"]),
    "GV-OG": dict(achc=["HH1-5A", "HH1-6A", "HH1-6B", "HH1-7A"],
                  cop=["§484.100", "§484.105(b)", "§484.105(c)", "§484.75"],
                  title22=["74717", "74718", "74661", "74693"],
                  evidence=["P", "D", "I"]),
    "GV-PM": dict(achc=["HH1-1A.01", "HH2-2A", "HH2-5A"],
                  cop=["§484.105(a)"],
                  title22=["74701", "74721", "74742"],
                  evidence=["P", "D"]),
    "GV-EA": dict(achc=["HH1-10A", "HH1-12A.01"],
                  cop=["§484.105(d)", "§484.105(e)", "§484.80(h)"],
                  title22=["74652", "74709", "74719"],
                  evidence=["P", "D", "I"]),
    # Clinical / Provision of Care ────────────────────
    "CL-CP": dict(achc=["HH5-2C.01", "HH5-2C.02", "HH5-11A"],
                  cop=["§484.60(a)", "§484.60(b)", "§484.60(c)", "§484.55(c)"],
                  title22=["74723", "74731"],
                  evidence=["P", "D", "I", "O"]),
    "CL-SD": dict(achc=["HH4-1A", "HH4-2A", "HH4-2C.01", "HH5-11A"],
                  cop=["§484.55", "§484.60", "§484.75", "§484.80"],
                  title22=["74693", "74723"],
                  evidence=["P", "D", "I", "O"]),
    "CL-CA": dict(achc=["HH5-2C.01", "HH5-11A", "HH5-11F"],
                  cop=["§484.55(a)", "§484.55(b)"],
                  title22=["74723", "74731"],
                  evidence=["P", "D", "I", "O"]),
    "CL-CD": dict(achc=["HH5-11A", "HH5-11F"],
                  cop=["§484.110"],
                  title22=["74731", "74743"],
                  evidence=["P", "D", "I"]),
    "CL-PR": dict(achc=["HH2-2A", "HH2-5A", "HH5-2C.01"],
                  cop=["§484.50(a)", "§484.50(b)", "§484.50(c)", "§484.50(e)"],
                  title22=["74701", "74743"],
                  evidence=["P", "D", "I"]),
    "CL-OA": dict(achc=["HH5-2C.01", "HH5-11A"],
                  cop=["§484.45", "§484.55"],
                  title22=["74723", "74731"],
                  evidence=["P", "D", "I"]),
    "CL-CC": dict(achc=["HH5-2C.01", "HH5-2C.02", "HH5-11A"],
                  cop=["§484.60(a)", "§484.60(b)", "§484.55(c)"],
                  title22=["74723", "74731"],
                  evidence=["P", "D", "I", "O"]),
    "CL-DC": dict(achc=["HH5-11A", "HH5-11F"],
                  cop=["§484.110"],
                  title22=["74731", "74743"],
                  evidence=["P", "D", "I"]),
    # QAPI ────────────────────────────────────────────
    "QA-PG": dict(achc=["HH6-1A", "HH6-2A"],
                  cop=["§484.65(a)", "§484.65(b)"],
                  title22=["74721", "74743"],
                  evidence=["P", "D", "I"]),
    "QA-PI": dict(achc=["HH6-1A", "HH6-2A", "HH6-3A"],
                  cop=["§484.65(c)", "§484.65(d)"],
                  title22=["74721", "74743"],
                  evidence=["P", "D", "I", "S"]),
    "QA-AE": dict(achc=["HH6-1A", "HH7-2A.01"],
                  cop=["§484.65(d)(2)"],
                  title22=["74721", "74743"],
                  evidence=["P", "D", "I", "S"]),
    "QA-SM": dict(achc=["HH6-1A", "HH6-2A"],
                  cop=["§484.65(c)"],
                  title22=["74721"],
                  evidence=["P", "D"]),
    # Risk Management — Safety, EP, Surveys ───────────
    "RM-OS": dict(achc=["HH7-2A.01", "HH7-2B.01", "HH7-5A.01", "HH7-6A.01"],
                  cop=["§484.70"],
                  title22=["74693"],
                  evidence=["P", "D", "I", "O"]),
    "RM-EP": dict(achc=["HH7-3A", "HH7-3B", "HH7-3C", "HH7-3D", "HH7-3E"],
                  cop=["§484.102(a)", "§484.102(b)", "§484.102(c)", "§484.102(d)"],
                  title22=["74721"],
                  evidence=["P", "D", "I", "S"]),
    "RM-ER": dict(achc=["HH7-2A.01", "HH7-2B.01", "HH6-1A"],
                  cop=["§484.65(d)(2)", "§484.70"],
                  title22=["74721", "74725"],
                  evidence=["P", "D", "I", "S"]),
    "RM-SS": dict(achc=["HH7-2A.01", "HH7-6A.01", "HH7-6B.01"],
                  cop=["§484.70"],
                  title22=["74725"],
                  evidence=["P", "D", "I", "O"]),
    # Compliance & Regulatory ─────────────────────────
    "CO-CA": dict(achc=["HH1-4A.01", "HH1-9A.01"],
                  cop=["§484.105(f)", "§1128J(d)"],
                  title22=["74665"],
                  evidence=["P", "D", "I"]),
    "CO-CP": dict(achc=["HH1-4A.01"],
                  cop=["42 CFR §420 Subpart C", "§1128J(d)"],
                  title22=["74665"],
                  evidence=["P", "D", "I"]),
    "CO-DC": dict(achc=["HH5-11A", "HH5-11F"],
                  cop=["§484.110"],
                  title22=["74731", "74743"],
                  evidence=["P", "D"]),
    "CO-FA": dict(achc=["HH1-4A.01"],
                  cop=["42 USC §1320a-7b", "31 USC §3729"],
                  title22=["74665"],
                  evidence=["P", "D", "I"]),
    "CO-HP": dict(achc=["HH2-5A", "HH5-11F"],
                  cop=["45 CFR Part 160", "45 CFR Part 164"],
                  title22=["74731"],
                  evidence=["P", "D", "I"]),
    "CO-RA": dict(achc=["HH1-12A.01"],
                  cop=["§484.100"],
                  title22=["74659", "74661", "74663", "74664", "74679", "74681"],
                  evidence=["P", "D"]),
    "CO-AI": dict(achc=["HH1-4A.01", "HH1-9A.01"],
                  cop=["§484.105(f)", "45 CFR Part 164"],
                  title22=["74665", "74743"],
                  evidence=["P", "D", "I"]),
    "CO-BA": dict(achc=["HH2-5A", "HH5-11F"],
                  cop=["45 CFR §164.308(b)", "45 CFR §164.314(a)", "45 CFR Part 160", "45 CFR Part 164"],
                  title22=["74731"],
                  evidence=["P", "D", "I"]),
    "CO-DG": dict(achc=["HH5-11A", "HH5-11F"],
                  cop=["§484.110", "45 CFR Part 164"],
                  title22=["74731", "74743"],
                  evidence=["P", "D", "I"]),
    "CO-FW": dict(achc=["HH1-4A.01"],
                  cop=["42 USC §1320a-7b", "31 USC §3729"],
                  title22=["74665"],
                  evidence=["P", "D", "I"]),
    "CO-IR": dict(achc=["HH1-4A.01", "HH7-2A.01"],
                  cop=["45 CFR §164.400", "45 CFR §164.404", "45 CFR §164.408"],
                  title22=["74731"],
                  evidence=["P", "D", "I", "S"]),
    # Finance / Billing ───────────────────────────────
    "FN-BC": dict(achc=["HH1-9A.01", "HH2-2A"],
                  cop=["§484.50(c)(7)", "§484.110", "42 CFR §411.404", "42 CFR §405.1200"],
                  title22=["74743", "HSC 1727.5"],
                  evidence=["P", "D", "I"]),
    "FN-CM": dict(achc=["HH1-9A.01"],
                  cop=["§484.50(c)(7)"],
                  title22=["74743"],
                  evidence=["P", "D"]),
    "FN-FP": dict(achc=["HH1-9A.01"],
                  cop=["42 CFR Part 420 Subpart C"],
                  title22=["74743"],
                  evidence=["P", "D"]),
    # HR ─────────────────────────────────────────────
    "HR-ER": dict(achc=["HH3-1A", "HH3-2A"],
                  cop=["§484.80(a)", "§484.80(b)", "§484.80(g)", "§484.80(h)"],
                  title22=["74683", "74717"],
                  evidence=["P", "D", "I"]),
    "HR-JD": dict(achc=["HH3-1A", "HH1-5A"],
                  cop=["§484.105", "§484.115"],
                  title22=["74717", "74718"],
                  evidence=["P", "D"]),
    "HR-TA": dict(achc=["HH3-2A"],
                  cop=["§484.80(d)", "§484.80(e)", "§484.80(f)"],
                  title22=["74683"],
                  evidence=["P", "D", "I"]),
    "HR-TD": dict(achc=["HH3-3A"],
                  cop=["§484.80(h)"],
                  title22=["74683"],
                  evidence=["P", "D", "I"]),
    "HR-WM": dict(achc=["HH3-1A"],
                  cop=["§484.80"],
                  title22=["74683"],
                  evidence=["P", "D"]),
    "HR-EH": dict(achc=["HH3-1A", "HH3-2A"],
                  cop=["§484.80(a)", "§484.80(b)", "§484.80(h)"],
                  title22=["74683"],
                  evidence=["P", "D", "I"]),
    "HR-TR": dict(achc=["HH3-2A", "HH3-3A"],
                  cop=["§484.80(d)", "§484.80(e)", "§484.80(f)", "§484.80(h)"],
                  title22=["74683"],
                  evidence=["P", "D", "I"]),
    # Operations ─────────────────────────────────────
    "OP-FM": dict(achc=["HH7-2A.01", "HH7-5A.01"],
                  cop=["§484.70"],
                  title22=["74693"],
                  evidence=["P", "D", "I", "O"]),
    "OP-IM": dict(achc=["HH2-1A.01"],
                  cop=["§484.55(a)", "§484.60(a)"],
                  title22=["74693", "74695"],
                  evidence=["P", "D", "I"]),
    "OP-PA": dict(achc=["HH2-1A.01", "HH2-2A"],
                  cop=["§484.50(a)", "§484.55(a)"],
                  title22=["74701"],
                  evidence=["P", "D", "I"]),
    "OP-SL": dict(achc=["HH4-1A"],
                  cop=["§484.105(c)"],
                  title22=["74693"],
                  evidence=["P", "D", "I"]),
    # IT / Information Security ──────────────────────
    "IT-DR": dict(achc=["HH7-3C"],
                  cop=["§484.102(c)", "45 CFR §164.308(a)(7)"],
                  title22=[],
                  evidence=["P", "D", "I", "S"]),
    "IT-SA": dict(achc=["HH5-11F"],
                  cop=["45 CFR §164.308", "45 CFR §164.312"],
                  title22=[],
                  evidence=["P", "D", "I"]),
    "IT-SC": dict(achc=["HH5-11F"],
                  cop=["45 CFR §164.308", "45 CFR §164.312"],
                  title22=[],
                  evidence=["P", "D", "I", "S"]),
    "IT-UP": dict(achc=["HH5-11F"],
                  cop=["45 CFR §164.308(a)(8)"],
                  title22=[],
                  evidence=["P", "D"]),
    # Enterprise Control ─────────────────────────────
    "EN-CM": dict(achc=["HH1-1A.01"],
                  cop=["§484.105(a)"],
                  title22=["74721"],
                  evidence=["P", "D"]),
    "EN-LC": dict(achc=["HH1-1A.01"],
                  cop=["§484.105(a)"],
                  title22=["74721"],
                  evidence=["P", "D"]),
    "EN-TG": dict(achc=["HH1-1A.01"],
                  cop=["§484.105(a)"],
                  title22=["74721"],
                  evidence=["P", "D"]),
    "EN-WF": dict(achc=["HH1-1A.01"],
                  cop=["§484.105(a)"],
                  title22=["74721"],
                  evidence=["P", "D"]),
}

# ─────────────────────────────────────────────────────────────────────────
# Per-policy OVERRIDES — high-priority/high-risk policies get authored
# crosswalks, addendums, and Corridor section pointers.
# Schema: {achc?, cop?, title22?, evidence?, addendums:[{key,label,formId?}],
#          relatedPolicies:[id,...], corridorRef:"section-policy",
#          summary:"one-liner", reviewed:True}
# ─────────────────────────────────────────────────────────────────────────
OVERRIDES: dict[str, dict] = {
    # ── Governance ─────────────────────────────────────
    "GV-GB-001": dict(
        corridorRef="1-002 Governing Body",
        summary="Governing Body authority, composition, oversight of QAPI/finance/compliance.",
        achc=["HH1-1A", "HH1-1B", "HH1-2A", "HH1-2A.03", "HH1-5A.01"],
        cop=["§484.105(a)", "§484.105(h)", "§484.65(e)", "§484.100(b)"],
        title22=["74717", "74721", "74742", "SB 188"],
        evidence=["P", "D", "I"],
        addendums=[
            dict(key="A", label="Governing Body Roster", formId="GV-F-001"),
            dict(key="B", label="Governing Body Orientation Checklist", formId="GV-F-002"),
            dict(key="C", label="Annual Performance Review of Administrator"),
        ],
        relatedPolicies=["CO-CA-001", "QA-PG-001", "RM-EP-001", "EN-CM-001"],
    ),
    "GV-GB-002": dict(corridorRef="1-003 Conflict of Interest",
                      summary="Annual COI attestation for GB, leadership, and contractors.",
                      addendums=[dict(key="A", label="Conflict of Interest Attestation", formId="CO-F-004")]),
    "GV-GB-003": dict(corridorRef="1-005 Public Disclosure Statement",
                      summary="Annual 42 CFR §420 Subpart C ownership/control disclosure."),
    "GV-OG-001": dict(corridorRef="1-006 Administrative Qualifications and Responsibilities",
                      summary="Administrator qualifications, responsibilities, succession."),
    "GV-OG-002": dict(corridorRef="1-007/1-008 Appointment & Designation of Administrator",
                      summary="Administrator appointment and designated alternate."),
    "GV-OG-003": dict(corridorRef="1-009 Home Health Administrator",
                      summary="Administrator scope, reporting line to Governing Body."),
    "GV-OG-004": dict(corridorRef="1-015 Use of Organizational Chart",
                      summary="Current organizational chart, lines of authority."),
    "GV-OG-005": dict(corridorRef="1-025/1-026 Scope and Listing of Services",
                      summary="Defined scope of services and listing of services provided."),
    "GV-PM-001": dict(corridorRef="1-013 Development of Policies and Procedures",
                      summary="P&P lifecycle: development, approval, review, retention."),
    "GV-EA-001": dict(corridorRef="1-022/1-023 Contracted Service Providers",
                      summary="Contracted services governance and review."),
    "GV-EA-002": dict(corridorRef="1-024 Written Agreements for Contracted Services",
                      summary="Required contract terms for all clinical and non-clinical contracts."),
    # ── Clinical / Provision of Care ──────────────────
    "CL-CP-001": dict(
        corridorRef="4-002 / 4-003 Plan of Care & Verification of Orders",
        summary="POC development, physician orders, verbal-order readback and 72h cosign.",
        achc=["HH5-2C.01", "HH5-2C.02", "HH5-11A", "HH5-11F"],
        cop=["§484.60(a)", "§484.60(b)", "§484.60(c)", "§484.55(c)"],
        title22=["74723", "74731"],
        evidence=["P", "D", "I", "O"],
        addendums=[
            dict(key="A", label="POC Template (485-equivalent)", formId="CL-F-001"),
            dict(key="B", label="Verbal Order Log"),
            dict(key="C", label="Inter-disciplinary Case Conference Note"),
        ],
        relatedPolicies=["CL-CA-001", "CL-CA-002", "CL-CD-001", "CL-OA-001"],
    ),
    "CL-CP-002": dict(corridorRef="4-019 Ongoing Assessments",
                      summary="Ongoing assessments and POC revision triggers."),
    "CL-CP-003": dict(corridorRef="4-043 Transfer/Referral Criteria",
                      summary="Transfer/referral process and discharge summary timing."),
    "CL-CA-001": dict(corridorRef="4-018 Initial and Comprehensive Assessment",
                      summary="Initial visit ≤48h, comprehensive ≤5 days; OASIS at SOC.",
                      addendums=[dict(key="A", label="Initial Assessment Worksheet"),
                                 dict(key="B", label="Comprehensive Assessment Tool")]),
    "CL-CA-002": dict(corridorRef="4-018 Comprehensive Assessment", summary="Recertification comprehensive assessment cycle."),
    "CL-CA-005": dict(corridorRef="4-018 Homebound Determination",
                      summary="Homebound status determination per §409.42."),
    "CL-CD-001": dict(corridorRef="5-001 Clinical Record Content",
                      summary="Clinical record content, authentication, timeliness."),
    "CL-PR-001": dict(corridorRef="2-002 Patient Bill of Rights",
                      summary="Patient Bill of Rights, delivery and acknowledgment."),
    "CL-PR-002": dict(corridorRef="2-005 Informed Consent / Refusal of Treatment",
                      summary="Informed consent at SOC and on material POC change."),
    "CL-PR-003": dict(corridorRef="2-038 Ethical Issues",
                      summary="Ethical issues escalation; ethics committee referral."),
    "CL-PR-004": dict(corridorRef="4-009 Advance Directives",
                      summary="Advance directives offered at admission and recert."),
    "CL-PR-005": dict(corridorRef="2-002.E Restraint Prohibition",
                      summary="Restraints prohibited in home health setting."),
    "CL-PR-006": dict(corridorRef="2-002.F Abuse, Neglect & Exploitation",
                      summary="Reporting of suspected abuse/neglect/exploitation; APS notice."),
    "CL-OA-001": dict(corridorRef="4-018 OASIS Data Set",
                      summary="OASIS assessment timing, accuracy, locking."),
    "CL-OA-006": dict(corridorRef="5-001 Documentation Hierarchy",
                      summary="Evidence-source prioritization for OASIS coding."),
    # ── QAPI ──────────────────────────────────────────
    "QA-PG-001": dict(
        corridorRef="6-001 QAPI Program",
        summary="Written, GB-approved, data-driven QAPI program; ≥1 PIP active.",
        achc=["HH6-1A", "HH6-2A", "HH6-3A"],
        cop=["§484.65(a)", "§484.65(b)", "§484.65(c)", "§484.65(d)", "§484.65(e)"],
        title22=["74721", "74743"],
        evidence=["P", "D", "I", "S"],
        addendums=[
            dict(key="A", label="QAPI Plan (current year)"),
            dict(key="B", label="QAPI Meeting Agenda", formId="QA-F-010"),
            dict(key="C", label="QAPI Attendance Log", formId="QA-F-011"),
            dict(key="D", label="QAPI Minutes Template", formId="QA-F-012"),
            dict(key="E", label="QAPI Action Item Tracker", formId="QA-F-013"),
            dict(key="F", label="QAPI Data Dashboard", formId="QA-F-014"),
        ],
        relatedPolicies=["QA-AE-001", "QA-PI-001", "GV-GB-001", "RM-OS-002"],
    ),
    "QA-PI-001": dict(corridorRef="6-001 PIP Charter",
                      summary="At least one Performance Improvement Project active at all times."),
    "QA-AE-001": dict(corridorRef="6-002 Adverse Events / Sentinel",
                      summary="Sentinel-event response: 24h RCA, 30d action plan, 90d closure.",
                      addendums=[dict(key="A", label="RCA Worksheet"),
                                 dict(key="B", label="Sentinel Event Notification")]),
    # ── Infection Control / Safety ────────────────────
    "RM-OS-001": dict(
        corridorRef="6-018/6-020 Environmental Safety & Fire Safety — Office",
        summary="Environment of Care; office fire safety; extinguisher inspection cycle.",
        achc=["HH7-2A.01", "HH7-2B.01", "HH7-5A.01", "HH7-6A.01", "HH7-6B.01"],
        cop=["§484.70"],
        title22=["74693"],
        evidence=["P", "D", "I", "O"],
        addendums=[
            dict(key="A", label="Office EOC Plan"),
            dict(key="B", label="Extinguisher Monthly Inspection Log", formId="RM-F-010"),
            dict(key="C", label="Extinguisher Lifecycle Log (annual / 6yr / 12yr)"),
            dict(key="D", label="Fire Drill After-Action Report", formId="RM-F-011"),
            dict(key="E", label="Utilities Inspection Log"),
            dict(key="F", label="DME Vendor Agreement"),
            dict(key="G", label="SMDA Reportable Events Log"),
            dict(key="H", label="Vehicle Incident Report"),
        ],
        relatedPolicies=["RM-EP-001", "RM-OS-002", "RM-OS-003", "RM-OS-004"],
    ),
    "RM-OS-002": dict(corridorRef="6-002 Incident Reporting & RCA",
                      summary="Incident intake → RCA → QAPI loop; sentinel-event escalation.",
                      relatedPolicies=["QA-AE-001", "QA-PG-001", "RM-OS-001"]),
    "RM-OS-003": dict(corridorRef="6-034/6-035 Personnel Safety / Unsafe Home Visits",
                      summary="Personnel safety in field; unsafe home visit protocol."),
    "RM-OS-004": dict(corridorRef="6-022/6-026 Equipment Management",
                      summary="Agency-owned + DME equipment management; calibration."),
    # ── Emergency Preparedness ────────────────────────
    "RM-EP-001": dict(
        corridorRef="6-037 Emergency Management Plan",
        summary="All-hazards EP: HVA, communication plan, training, ≥2 exercises/yr, AAR.",
        achc=["HH7-3A", "HH7-3B", "HH7-3C", "HH7-3D", "HH7-3E"],
        cop=["§484.102(a)", "§484.102(b)", "§484.102(c)", "§484.102(d)"],
        title22=["74721"],
        evidence=["P", "D", "I", "S"],
        addendums=[
            dict(key="A", label="Hazard Vulnerability Analysis (HVA)"),
            dict(key="B", label="Patient EP Tier Roster"),
            dict(key="C", label="Communication Cascade Test Log"),
            dict(key="D", label="Activation Cascade Worksheet"),
            dict(key="E", label="Patient EP Education Sheet"),
            dict(key="F", label="After-Action Report Template"),
            dict(key="G", label="Cease-Operations Contingency Plan"),
        ],
        relatedPolicies=["RM-OS-001", "QA-PG-001", "RM-ER-001", "IT-DR-001"],
    ),
    # ── Risk / Surveillance — Infection, BBP, TB ──────
    "RM-ER-001": dict(corridorRef="6-009 Infection Control Plan",
                      summary="Annual IPC plan, surveillance, outbreak reporting."),
    "RM-ER-002": dict(corridorRef="6-013 Bag Technique (NEW addendum)",
                      summary="Bag Technique observed competency on every home visit (REQUIRES REVIEW – new content patched via Builder/Policies/extracted_full).",
                      addendums=[dict(key="A", label="Bag Cleaning Log"),
                                 dict(key="B", label="Bag Technique Competency Checklist")]),
    "RM-ER-003": dict(corridorRef="6-029 Bloodborne Pathogens / Hep B",
                      summary="BBP exposure plan; Hep B vaccine offer/declination; post-exposure flow."),
    "RM-ER-004": dict(corridorRef="6-028 TB Exposure Control",
                      summary="Annual TB risk assessment; baseline + role-based testing."),
    "RM-ER-005": dict(corridorRef="6-014/6-015 Patient & Personnel Infection Logs",
                      summary="Surveillance logs (patient + personnel) reviewed monthly by QAPI."),
    "RM-ER-006": dict(corridorRef="6-016 Reporting of Communicable Diseases",
                      summary="CDPH-mandated reportable diseases; outbreak notifications."),
    "RM-SS-001": dict(corridorRef="6-038 Waived Testing",
                      summary="CLIA-waived testing program (e.g., glucose) competencies."),
    "RM-SS-002": dict(corridorRef="6-039 Home Glucose Monitoring",
                      summary="Glucose monitoring competency, QC, lancet/strip safety."),
    # ── Compliance / Patient Rights / HIPAA ───────────
    "CO-CA-001": dict(corridorRef="1-014 Corporate Compliance Program",
                      summary="Compliance Officer, code of conduct, hotline, audits."),
    "CO-CP-001": dict(corridorRef="1-014 Compliance Plan",
                      summary="Written compliance plan and seven-element Compliance Program."),
    "CO-FA-001": dict(corridorRef="1-014.A Fraud / Waste / Abuse",
                      summary="FWA training, reporting, non-retaliation."),
    "CO-HP-001": dict(corridorRef="2-014 HIPAA Privacy",
                      summary="HIPAA Privacy Rule compliance; minimum-necessary."),
    "CO-HP-004": dict(corridorRef="2-016 HIPAA Breach Notification",
                      summary="Breach risk assessment, 60-day notification, OCR reporting."),
    "CO-DC-001": dict(corridorRef="5-002 Documentation Compliance",
                      summary="Documentation timeliness, authentication, late-entry rules."),
    "CO-RA-001": dict(corridorRef="1-010 Regulatory Compliance",
                      summary="Licensure, certification, accreditation maintenance."),
    # ── Finance / Billing — high-risk ─────────────────
    "FN-BC-001": dict(
        corridorRef="2-007 / 1-028 Financial Responsibility & Medicare Notices",
        summary="Billing integrity; ABN, HHCCN, NOMNC/DENC issuance.",
        achc=["HH1-9A.01", "HH2-2A"],
        cop=["§484.50(c)(7)", "§484.110", "42 CFR §411.404", "42 CFR §405.1200", "42 CFR Part 420 Subpart C"],
        title22=["74743", "HSC 1727.5"],
        evidence=["P", "D", "I"],
        addendums=[
            dict(key="A", label="OASIS Submission Tracker"),
            dict(key="B", label="NOMNC Issuance Log", formId="FN-F-002"),
            dict(key="C", label="Annual Disclosure Statement", formId="FN-F-001"),
            dict(key="D", label="ABN/HHCCN Issuance Log", formId="FN-F-003"),
            dict(key="E", label="60-Day Overpayment Tracker", formId="FN-F-004"),
        ],
        relatedPolicies=["CO-CA-001", "OP-IM-001", "CL-OA-001", "GV-GB-001"],
    ),
    "FN-BC-002": dict(corridorRef="2-007 ABN", summary="Advance Beneficiary Notice issuance."),
    "FN-BC-003": dict(corridorRef="1-028.B HHCCN", summary="Home Health Change of Care Notice."),
    "FN-BC-004": dict(corridorRef="1-028.C NOMNC/DENC", summary="Notice of Medicare Non-Coverage; DENC."),
    # ── Operations / Intake & Scheduling ──────────────
    "OP-IM-001": dict(corridorRef="2-003 Admission Criteria and Process",
                      summary="Referral intake, eligibility verification, F2F, payer check.",
                      addendums=[dict(key="A", label="Admission Decision Worksheet", formId="OP-F-001"),
                                 dict(key="B", label="Notice of Rights Acknowledgment"),
                                 dict(key="C", label="Non-Acceptance Letter Template")]),
    "OP-IM-002": dict(corridorRef="2-008 Complaint/Grievance Process",
                      summary="Grievance intake (1d), acknowledgment (5d), closure (30d)."),
    "OP-PA-001": dict(corridorRef="2-001 Availability of Services",
                      summary="Service area, hours of operation, after-hours coverage."),
    "OP-FM-001": dict(corridorRef="6-018 Office Facility Management",
                      summary="Facility access, maintenance, signage."),
    "OP-SL-001": dict(corridorRef="4-001 Scheduling and Visit Management",
                      summary="Visit scheduling, missed-visit reporting."),
    # ── HR — high-priority ───────────────────────────
    "HR-TA-001": dict(corridorRef="3-003 Hiring / Background Check",
                      summary="Pre-employment checks: license, OIG/SAM exclusion, criminal."),
    "HR-TA-002": dict(corridorRef="3-007 Initial Competency",
                      summary="Initial role competency before patient assignment."),
    "HR-TD-001": dict(corridorRef="3-010 Annual Training",
                      summary="Annual mandatory training: HIPAA, IPC, EP, abuse, BBP."),
    "HR-ER-001": dict(corridorRef="3-014 Employee Health",
                      summary="Pre-hire health screen, TB, immunization."),
    # ── IT / Security — high-priority ─────────────────
    "IT-SC-001": dict(corridorRef="2-014.A HIPAA Security",
                      summary="HIPAA Security Rule administrative/technical/physical safeguards."),
    "IT-DR-001": dict(corridorRef="6-037.B IT Disaster Recovery",
                      summary="IT DR/BCP aligned to EP plan; RTO/RPO defined."),
    "IT-UP-001": dict(corridorRef="2-014.B Acceptable Use",
                      summary="Acceptable use of agency systems; BYOD restrictions."),
    # ── Enterprise Control ────────────────────────────
    "EN-CM-001": dict(corridorRef="1-001/1-013 Master Control Inventory",
                      summary="Cross-domain master control catalog."),
    "EN-LC-001": dict(corridorRef="1-013 Lifecycle Control",
                      summary="Cross-domain lifecycle (draft→review→approve→publish→archive)."),
    "EN-TG-001": dict(corridorRef="0 Taxonomy Governance",
                      summary="Domain/subdomain taxonomy governance."),
}


def ts_str_array(items):
    return "[" + ", ".join(json.dumps(s) for s in items) + "]"


def render_record(pid: str, rec: dict) -> str:
    achc = rec.get("achc", [])
    cop = rec.get("cop", [])
    t22 = rec.get("title22", [])
    ev = rec.get("evidence", [])
    addendums = rec.get("addendums", [])
    related = rec.get("relatedPolicies", [])
    summary = rec.get("summary", "Subdomain-default crosswalk applied; awaiting clinical SME review.")
    corridorRef = rec.get("corridorRef")
    requires_review = "false" if rec.get("reviewed") else "true"
    add_lines = []
    for a in addendums:
        parts = [f'key: {json.dumps(a["key"])}', f'label: {json.dumps(a["label"])}']
        if a.get("formId"):
            parts.append(f'formId: {json.dumps(a["formId"])}')
        add_lines.append("    { " + ", ".join(parts) + " }")
    add_block = ",\n".join(add_lines)
    rel_block = ts_str_array(related)
    corridor_line = f"    corridorRef: {json.dumps(corridorRef)}," if corridorRef else "    corridorRef: null,"
    return (
        f'  "{pid}": {{\n'
        f'    policyId: "{pid}",\n'
        f'    summary: {json.dumps(summary)},\n'
        f'{corridor_line}\n'
        f'    crosswalk: {{ achc: {ts_str_array(achc)}, cop: {ts_str_array(cop)}, title22: {ts_str_array(t22)} }},\n'
        f'    evidenceTypes: {ts_str_array(ev)},\n'
        f'    addendums: [\n{add_block}\n    ],\n'
        f'    relatedPolicies: {rel_block},\n'
        f'    requiresReview: {requires_review},\n'
        f'  }},'
    )


def main():
    ids = [ln.strip() for ln in IDS_FILE.read_text(encoding="utf-8").splitlines() if ln.strip()]
    records = []
    csv_rows = ["corridor_ref,our_policy_id,status,summary"]
    for pid in ids:
        sub = pid[:5]  # e.g. "GV-GB"
        defaults = SUBDOMAIN_DEFAULTS.get(sub, dict(achc=[], cop=[], title22=[], evidence=["P", "D"]))
        rec = dict(defaults)
        override = OVERRIDES.get(pid)
        if override:
            for k, v in override.items():
                rec[k] = v
            rec["reviewed"] = True
            status = "COVERED"
        else:
            status = "PARTIAL"  # subdomain-default crosswalk only
        records.append(render_record(pid, rec))
        cref = override.get("corridorRef") if override else ""
        summary = override.get("summary") if override else "Subdomain-default crosswalk; SME review required."
        csv_rows.append(f'"{cref}","{pid}","{status}","{summary}"')

    body = "\n".join(records)
    ts = (
        "/* Auto-generated by Builder/Policies/generate_corridor_alignment.py */\n"
        "/* DO NOT EDIT — re-run the generator to update. */\n"
        "\n"
        "export type EvidenceCode = 'P' | 'D' | 'I' | 'O' | 'S';\n"
        "\n"
        "export interface CorridorAddendum {\n"
        "  key: string;\n"
        "  label: string;\n"
        "  formId?: string;\n"
        "}\n"
        "\n"
        "export interface CorridorCrosswalk {\n"
        "  achc: string[];\n"
        "  cop: string[];\n"
        "  title22: string[];\n"
        "}\n"
        "\n"
        "export interface CorridorAlignment {\n"
        "  policyId: string;\n"
        "  summary: string;\n"
        "  corridorRef: string | null;\n"
        "  crosswalk: CorridorCrosswalk;\n"
        "  evidenceTypes: EvidenceCode[];\n"
        "  addendums: CorridorAddendum[];\n"
        "  relatedPolicies: string[];\n"
        "  /** True until a clinical SME has signed off on the crosswalk + procedure content. */\n"
        "  requiresReview: boolean;\n"
        "}\n"
        "\n"
        "export const corridorAlignment: Record<string, CorridorAlignment> = {\n"
        f"{body}\n"
        "};\n"
        "\n"
        "export function getCorridorAlignment(policyId: string): CorridorAlignment | undefined {\n"
        "  return corridorAlignment[policyId];\n"
        "}\n"
        "\n"
        "export const corridorAlignmentStats = {\n"
        f"  total: {len(ids)},\n"
        f"  reviewed: {sum(1 for pid in ids if pid in OVERRIDES)},\n"
        f"  requiresReview: {sum(1 for pid in ids if pid not in OVERRIDES)},\n"
        "} as const;\n"
    )
    OUT_TS.write_text(ts, encoding="utf-8")
    OUT_CSV.write_text("\n".join(csv_rows), encoding="utf-8")
    print(f"WROTE {OUT_TS.relative_to(ROOT)}  ({len(ids)} records)")
    print(f"WROTE {OUT_CSV.relative_to(ROOT)}")
    print(f"  reviewed: {sum(1 for pid in ids if pid in OVERRIDES)}")
    print(f"  requiresReview: {sum(1 for pid in ids if pid not in OVERRIDES)}")


if __name__ == "__main__":
    main()
