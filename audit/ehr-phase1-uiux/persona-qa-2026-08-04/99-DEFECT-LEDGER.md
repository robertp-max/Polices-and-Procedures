# Defect ledger — 32-agent persona QA

**Date:** 2026-08-04  
**Branch:** ehr_phase1 @ 7e82f6fc  
**App:** http://127.0.0.1:5194  
**Agents:** 32 (8 CMS Surveyor · 8 Administrator · 8 DON · 8 LVN)

Severity: **P0** false completeness / patient-safety narrative / survey trap · **P1** major workflow/data honesty · **P2** polish

---

## P0 (fix before demo as “survey-ready chart”)

| ID | Title | Surfaces | Personas | Evidence |
|----|-------|----------|----------|----------|
| **P0-01** | Chart meds footer claims **“Medication list reconciled at SOC”** while metoprolol remains `needs-review` (25 vs 50 mg) and integrity marks recon **attention** | `/patients/pt-elena` meds tab · Clinical · Medications | CMS, DON, LVN | A02, C02, D04, D08 |
| **P0-02** | **Emergency prep coverage undercount** — 8 census patients, 6 EMP profiles; Raymond & Samuel missing from “incomplete” counts; integrity can read complete while EMP incomplete | `/emergency` · chart integrity · patients | CMS | A05 |

---

## P1 (high priority for next redesign sprint)

| ID | Title | Surfaces | Personas |
|----|-------|----------|----------|
| **P1-01** | Missed-visit **story break**: work-queue `wq-5` + message `msg-3` escalate Raymond SN miss, but visit registry has **0** `status: 'missed'` (Missed StatCard = 0) | work-queue, field-visits, schedule, messages | DON, LVN, CMS trail |
| **P1-02** | Nav / queue **badge inflation** (e.g. work-queue badge **18** vs **6** items; OASIS badge **7** vs **3** rows) | shell nav | All |
| **P1-03** | Orders / Billing primary CTAs (**New order, Send reminder, Edit, Export 837, Run claim check**) look live without visual-only disabled/title/footnote | orders, billing | CMS, Admin, DON, LVN |
| **P1-04** | Chart CTAs (**Mark reconciled**, Resume assessment, Send reminder) lack visual-only honesty used on domain screens | patient chart | CMS, DON, LVN |
| **P1-05** | Integrity headline **11/13** vs checklist **10 passed / 2 attention / 1 blocked** | chart | CMS, LVN |
| **P1-06** | Cross-patient drawer contamination: Orders drawer always uses **Walter `wq-2`** related; Billing falls back to **Margaret `wq-3`**; Today act-2 Elena POC → wq-2 Walter | orders, billing, today | CMS A08, DON C01/C03 |
| **P1-07** | “My work queue” is multi-owner agency board; no **owner/role filter**; shell persona is **RN CM** not LVN | work-queue, shell | DON, LVN |
| **P1-08** | Chart Documents model ≠ Documents workspace; chart Open dead; no Continue-in to `/documents` | chart, documents | CMS A01 |
| **P1-09** | QAPI **Open active PIP** opens Create drawer; effectiveness checklist shows green checks when not sustained; no package deep-link to PKG-8790 | qapi | CMS A04, DON C07 |
| **P1-10** | Competency **Record evidence** disabled when gate **blocked** (circular) | competency | CMS A07, DON C06 |
| **P1-11** | Aide supervision **14-day sample math** not reconcilable; “Due ≤7” double-counts overdue | aide-supervision | DON C05 |
| **P1-12** | EMP-001 agency programme (risk assessment / plan / drills) almost absent; only patient EMP-002 profiles | emergency | CMS A05 |
| **P1-13** | Dual-control for org master / human revoke is **copy only**, not maker-checker UI | org-master, users-access | Admin B01/B02 |
| **P1-14** | BAA “PHI blocked” is callout-only; no hard gate on Messages/Interop actions | vendors, messages, interop | Admin B03 |
| **P1-15** | SEC-11 **Met** while gap says live restore still due | security | Admin B04 |
| **P1-16** | Reports scorecard does not state **analytics ≠ legal record** (DAT-001) | reports | Admin B06 |
| **P1-17** | Migration progress bar green ≥60% even when not cutover-ready; Interop missing WellSky dual-run adapter | migration, interop | Admin B07 |
| **P1-18** | Messages: unread never clears; no thread body; **topbar** still opens external Connect | messages, shell | LVN D05 |
| **P1-19** | EVV branded without punch/exception board | field-visits | DON, LVN |
| **P1-20** | Schedule lacks day-only / my-caseload / clinician on cards | schedule | LVN D02 |
| **P1-21** | Deep links land on **route** only, not selected item (`?id=`) | work-queue destinations | LVN D07 |
| **P1-22** | Patient rights only in survey package sample, not chart rights artifact with form ID | documents, legal, chart | CMS A01 |
| **P1-23** | Harold **pending-SOC** with sealed discharge package conflict | legal-evidence data | CMS A01 |

---

## P2 (sample of recurring polish)

- RelatedNav is domain-local, not episode-trail continuous (A08)
- Legal-evidence RelatedNav omits data-exports reverse to security
- Void status filter missing on documents
- Status label inconsistency: “Note due” vs “Documentation due”
- Compose honesty hover-only on messages
- Clinical Brad “Draft ready” understates review-not-replace on worklist
- Role filters missing on competency
- Always-green integrity ring color

---

## Persona verdict rollup

| Persona | Agents | PASS | CONDITIONAL | FAIL |
|---------|--------|------|-------------|------|
| CMS Surveyor | A01–A08 | 1 (A06) | 7 | 0 |
| Administrator | B01–B08 | 1 (B08) | 7 | 0 |
| DON | C01–C08 | 0 | 8 | 0 |
| LVN | D01–D08 | 0 | 8 | 0 |
| **Total** | **32** | **2** | **30** | **0** |

**PASS pockets:** Legal evidence (CMS) · AI governance + interoperability (Admin)  
**System verdict:** **CONDITIONAL** — strong prototype honesty on DOC/AIG/seal paths; chart false completeness + data story breaks block surveyor/LVN trust.
