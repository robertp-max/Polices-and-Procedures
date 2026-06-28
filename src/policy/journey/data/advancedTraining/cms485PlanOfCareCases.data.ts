export interface CaseVitals {
  label: string;
  value: string;
  alert?: boolean;
}

export interface CaseSafetyRisk {
  description: string;
  severity: string;
}

export interface CaseMedication {
  name: string;
  dose: string;
  route: string;
  frequency: string;
  indication: string;
  reconciliationNote: string;
}

export interface CaseOasisFinding {
  item: string;
  response: string;
  conflictNote: string;
}

export interface CaseOption {
  id: string;
  label: string;
  isCorrect: boolean;
  rationale: string;
  whyTempting?: string;
  failureReason?: string;
  realWorldConsequence?: string;
  trapTags?: string[];
}


export interface CaseField {
  id: string;
  formBoxNumber: string;
  label: string;
  type: "single-select" | "multi-select";
  domain: string;
  correctAnswerIds: string[];
  auditNote: string;
  options: CaseOption[];
}

export interface ClinicalCase {
  id: string;
  title: string;
  subtitle: string;
  evidence: {
    patientName: string;
    age: number;
    gender: string;
    patientHIC: string;
    socDate: string;
    certPeriod: string;
    medicalRecordNumber: string;
    providerNumber: string;
    dischargeSummary: string;
    physicianOrders: string;
    socNarrative: string;
    vitals: CaseVitals[];
    safetyRisks: CaseSafetyRisk[];
    medications: CaseMedication[];
    oasisFindings: CaseOasisFinding[];
    physicianCollaboration: string;
    socialEnvironmental?: string;
    functionalStatus?: string;
    woundAssessment?: string;
    mentalStatus?: string;
    hiddenClues: string[];
  };
  fields: CaseField[];
}


export const cms485Cases: ClinicalCase[] = [
  {
    "id": "case-1-henderson",
    "title": "HENDERSON CLINICAL CHALLENGE",
    "subtitle": "George Henderson — Post-Acute Cardiac + Wound + DM",
    "evidence": {
      "patientName": "George Henderson",
      "age": 74,
      "gender": "Male",
      "patientHIC": "XXX-XX-XXXX-A",
      "socDate": "03/12/2026",
      "certPeriod": "03/12/2026 – 05/11/2026",
      "medicalRecordNumber": "CI-MR-00H1",
      "providerNumber": "10-7654",
      "dischargeSummary": "Discharged from Valley Medical Center 03/10/2026 after 4-day admission for acute decompensated heart failure (HFrEF, EF 25%) with new-onset atrial fibrillation. Course complicated by hyperglycemic episode (BG 486) requiring insulin drip. Incidental finding: Wagner Grade 2 ulcer right heel, present on admission per ED notes. Wound culture: MRSA-positive. Discharge diagnoses: CHF exacerbation, A-fib new onset, Type 2 DM uncontrolled, MRSA wound right heel, hypertension, CKD Stage 3a, peripheral vascular disease. Patient discharged on warfarin bridge to apixaban, carvedilol uptitration, furosemide 80mg BID, insulin glargine 28u HS with sliding scale lispro.",
      "physicianOrders": "Dr. Marcus Aris — Home Health Orders (03/11/2026):\nDX: R00.1 (Bradycardia), I50.9 (Heart failure, unspecified), E11.9 (Type 2 DM without complications), I73.9 (PVD unspecified), L97.419 (Non-pressure chronic ulcer right heel with unspecified severity)\nSN: 3W1 x 2 weeks, 2W3 x 2 weeks, 1W4 x 4 weeks → assess cardiac status, wound care, DM management, med management\nPT: Evaluate and treat for deconditioning — hold 48 hours post-SOC\nHHA: 3x/week for ADL assistance\nDME: Hospital bed, wound care supplies\nMedications per discharge summary. Monitor INR weekly during warfarin-to-apixaban bridge.\nLabs: BMP, CBC weekly x 4 weeks; INR per protocol\nHomebound: Patient is homebound due to cardiac condition.",
      "socNarrative": "Arrived at home 03/12/2026 for SOC. Patient appeared ashen, diaphoretic, resting in hospital bed. Bilateral 3+ pitting edema to knees. Lungs with bilateral basilar crackles, non-productive cough. HR 48, irregular. BP 158/92. SpO2 88% on room air, improved to 93% on 2L NC (patient's home O2 was NOT ordered — using borrowed concentrator from neighbor). BG 342 mg/dL via glucometer. Patient reports he has not taken any medications since discharge because \"the pharmacy was supposed to deliver and never did.\" Right heel wound: full-thickness ulcer with undermining noted at 6 o'clock position, depth 0.8cm, slough covering 60% of wound bed, periwound erythema extending 3cm, malodorous. This clinician assessed wound as Wagner Grade 3 based on presence of undermining and depth — inconsistent with discharge note of Grade 2. Left lower extremity: absent dorsalis pedis pulse, skin cool and mottled. Patient lives alone in single-story home. Unsecured firearm on nightstand. Power intermittently out — generator available but patient unable to operate independently. Daughter lives 2 hours away, visits monthly.",
      "vitals": [
        {
          "label": "Blood Glucose",
          "value": "342 mg/dL",
          "alert": true
        },
        {
          "label": "Heart Rate",
          "value": "48 bpm, irregular",
          "alert": true
        },
        {
          "label": "Blood Pressure",
          "value": "158/92 mmHg",
          "alert": true
        },
        {
          "label": "SpO2",
          "value": "88% RA → 93% on 2L NC",
          "alert": true
        },
        {
          "label": "Temperature",
          "value": "99.1°F"
        },
        {
          "label": "Respirations",
          "value": "24/min"
        },
        {
          "label": "Weight",
          "value": "218 lbs (pre-admit weight 196 lbs per chart)",
          "alert": true
        },
        {
          "label": "L DP Pulse",
          "value": "Absent — ischemic signs",
          "alert": true
        }
      ],
      "safetyRisks": [
        {
          "description": "Unsecured firearm on nightstand",
          "severity": "critical"
        },
        {
          "description": "Intermittent power outage — cannot operate generator independently",
          "severity": "critical"
        },
        {
          "description": "No medications filled since discharge (2 days)",
          "severity": "critical"
        },
        {
          "description": "Using borrowed O2 concentrator — O2 not ordered",
          "severity": "moderate"
        },
        {
          "description": "Lives alone, daughter 2 hours away",
          "severity": "moderate"
        },
        {
          "description": "Fall risk — bilateral LE edema, deconditioning, bradycardia",
          "severity": "moderate"
        }
      ],
      "medications": [
        {
          "name": "Carvedilol",
          "dose": "12.5mg",
          "route": "PO",
          "frequency": "BID",
          "indication": "HFrEF / Rate control",
          "reconciliationNote": "NOT FILLED — pharmacy never delivered"
        },
        {
          "name": "Furosemide",
          "dose": "80mg",
          "route": "PO",
          "frequency": "BID",
          "indication": "Volume overload",
          "reconciliationNote": "NOT FILLED"
        },
        {
          "name": "Warfarin",
          "dose": "5mg",
          "route": "PO",
          "frequency": "Daily",
          "indication": "A-fib bridge to apixaban",
          "reconciliationNote": "NOT FILLED — INR monitoring ordered but no baseline drawn"
        },
        {
          "name": "Apixaban",
          "dose": "5mg",
          "route": "PO",
          "frequency": "BID (start after warfarin bridge)",
          "indication": "A-fib anticoagulation",
          "reconciliationNote": "NOT FILLED"
        },
        {
          "name": "Insulin Glargine",
          "dose": "28 units",
          "route": "SubQ",
          "frequency": "At bedtime",
          "indication": "DM2 basal coverage",
          "reconciliationNote": "NOT FILLED"
        },
        {
          "name": "Insulin Lispro",
          "dose": "Per sliding scale",
          "route": "SubQ",
          "frequency": "AC",
          "indication": "DM2 prandial/correction",
          "reconciliationNote": "NOT FILLED"
        },
        {
          "name": "Lisinopril",
          "dose": "10mg",
          "route": "PO",
          "frequency": "Daily",
          "indication": "HTN / CKD",
          "reconciliationNote": "Pre-admit med — status unclear if continued"
        },
        {
          "name": "Atorvastatin",
          "dose": "40mg",
          "route": "PO",
          "frequency": "Daily",
          "indication": "Hyperlipidemia/CV risk",
          "reconciliationNote": "Pre-admit med — not on discharge list"
        }
      ],
      "oasisFindings": [
        {
          "item": "M1033 – Risk for Hospitalization",
          "response": "Multiple risk factors identified",
          "conflictNote": "OASIS risk is high; MD orders do not reflect urgency of cardiac instability at SOC"
        },
        {
          "item": "M1800 – Grooming",
          "response": "1 – Able to groom self with setup help",
          "conflictNote": "Narrative describes patient as ashen, diaphoretic, unable to get out of bed independently — scoring seems inconsistent with presentation"
        },
        {
          "item": "M1810 – Upper Body Dressing",
          "response": "1 – Able to dress upper body with setup",
          "conflictNote": "No documentation of upper body dressing assessment in narrative"
        },
        {
          "item": "M1820 – Lower Body Dressing",
          "response": "2 – Someone must help",
          "conflictNote": "Consistent with bilateral 3+ edema and deconditioning"
        },
        {
          "item": "M1242 – Frequency of Pain",
          "response": "2 – Daily but not constantly",
          "conflictNote": "SOC narrative does not address pain assessment specifically — OASIS completed without documented pain evaluation"
        },
        {
          "item": "M1311 – Current Number of Unhealed PU/Stasis Ulcers",
          "response": "1 pressure ulcer Stage 2",
          "conflictNote": "SOC narrative describes undermining and 0.8cm depth — more consistent with Stage 3 or unstageable. Also: this is a non-pressure diabetic/vascular ulcer, not a pressure ulcer"
        },
        {
          "item": "M1340 – Surgical Wound Status",
          "response": "No surgical wound",
          "conflictNote": "Correct — no surgical wound present"
        },
        {
          "item": "M2030 – Injectable Drug Management",
          "response": "0 – Able to independently manage",
          "conflictNote": "Patient has taken ZERO medications since discharge — unable to verify self-administration capability"
        }
      ],
      "physicianCollaboration": "Dr. Marcus Aris contacted 03/12/2026 at 1430. Notified of: HR 48, BG 342, SpO2 88% RA, wound assessment discrepancy (Grade 3 vs Grade 2), no medications filled. Dr. Aris response: \"Stabilization over 72 hours. SN: 3W1, 2W3, 1W4. PT hold 48h. Get pharmacy to deliver meds stat. Recheck vitals in AM. If HR below 45 or SpO2 below 85%, send to ER.\" Dr. Aris did NOT address: wound care orders for MRSA wound, O2 order, updated diagnosis codes, or Wagner grade discrepancy.",
      "socialEnvironmental": "Lives alone in single-story ranch home. Nearest family: daughter (Linda, 2 hours away, works full-time, visits monthly). No local support system. Patient is retired electrician, Medicare FFS. Home is cluttered but navigable with walker. Bathroom has grab bars installed from prior episode. Patient resistant to accepting help — states \"I've always managed on my own.\" Adequate food supply per patient report. Generator present for power outages but patient cannot start it alone (requires pull-cord, patient is deconditioned). Unsecured firearm on nightstand — patient states \"for protection, lives alone.\" No evidence of cognitive impairment but judgment questionable given medication non-compliance since discharge.",
      "functionalStatus": "Patient bedbound at SOC. Unable to ambulate independently — stood with max assist x1, immediately dyspneic and dizzy after 3 steps. Uses walker (had prior to admission). Prior level of function: independent with ambulation, drove own car, managed all IADLs. Currently requires max assist for transfers, toileting (using bedside commode), bathing. OASIS grooming score of 1 conflicts with observed inability to sit upright without support for more than 2 minutes.",
      "woundAssessment": "Right heel wound: Location: plantar aspect, right heel. Size: 3.2cm x 2.8cm x 0.8cm depth. Undermining: present at 5-7 o'clock, extending 1.2cm. Wound bed: 60% slough (yellow-gray), 30% granulation (pale/dusky), 10% necrotic tissue. Periwound: erythema 3cm circumferentially, indurated, warm to touch. Drainage: moderate, serosanguinous, malodorous. Pulses: right DP 1+/diminished, right PT 1+/diminished. Left DP absent, left PT non-palpable. MRSA positive per discharge culture. Clinician assessment: Wagner Grade 3 (contradicts discharge Grade 2 — undermining and depth support Grade 3). No current wound care orders from physician.",
      "mentalStatus": "A&Ox4, cooperative but minimizing symptoms. Judgment: questionable — declined ER transport despite critical vitals. Affect: flat. PHQ-2: denies depressive symptoms but presentation suggests otherwise.",
      "hiddenClues": [
        "Bradycardia at 48 with carvedilol ordered but NOT taken — the bradycardia is intrinsic, not medication-induced. This changes the clinical picture.",
        "Discharge says Wagner 2, SOC assessment says Wagner 3 — the SOC clinician documented undermining which definitionally upgrades the staging.",
        "OASIS M1311 categorizes this as a pressure ulcer Stage 2 — but the wound is a non-pressure diabetic/vascular ulcer on the heel. Wrong wound classification entirely.",
        "O2 being used is borrowed — no order exists. This is an immediate compliance/billing problem.",
        "Dr. Aris ordered R00.1 (Bradycardia) — this is a symptom code. The underlying cause is the new-onset A-fib, which is I48.91.",
        "I50.9 is unspecified heart failure — documented EF 25% supports I50.22 (chronic systolic, HFrEF) at minimum, or I50.23 if this episode is acute-on-chronic.",
        "E11.9 is DM2 without complications — but patient has diabetic foot ulcer (E11.621) and CKD (E11.22). Using E11.9 is fundamentally incorrect.",
        "L97.419 uses unspecified severity — SOC assessment documents Grade 3 with undermining. Should be L97.414 (with bone involvement) or at minimum L97.413 (with necrosis of muscle).",
        "Weight gain of 22 lbs (218 vs 196) in what appears to be days/weeks — significant fluid retention not addressed in orders.",
        "Warfarin-to-apixaban bridge with no baseline INR and no medications filled = high stroke risk in new-onset A-fib patient."
      ]
    },
    "fields": [
      {
        "id": "h-principal-dx",
        "formBoxNumber": "BOX 11",
        "label": "Principal Diagnosis",
        "type": "single-select",
        "domain": "principal-diagnosis",
        "correctAnswerIds": [
          "h-pdx-d"
        ],
        "auditNote": "The principal diagnosis must reflect the primary reason for home health services and be the most specific code supported by documentation. CHF with reduced EF is documented and is the primary driver of the SOC. I50.22 captures chronic systolic HF. The acute exacerbation supports skilled nursing need.",
        "options": [
          {
            "id": "h-pdx-a",
            "label": "R00.1 — Bradycardia",
            "isCorrect": false,
            "rationale": "R00.1 is a symptom code (R-code). CMS requires coding to the highest level of specificity for the underlying condition. Bradycardia is a symptom of the underlying A-fib and/or cardiac condition.",
            "whyTempting": "Physician order lists R00.1 first. HR 48 is a dramatic finding at SOC. Clinicians who copy MD diagnosis order will select this.",
            "failureReason": "R-codes should not be used as principal diagnosis when the underlying condition is documented. Fails ICD-10 coding guidelines, CMS specificity requirements, and would trigger audit flags.",
            "realWorldConsequence": "Using a symptom R-code as the principal diagnosis triggers automatic CMS edit flags, causes claim rejection or ADR denial, and forces costly rebilling — while the patient's true cardiac acuity goes unreported, reducing PDGM reimbursement.",
            "trapTags": [
              "copy-md-order",
              "r-code-symptom"
            ]
          },
          {
            "id": "h-pdx-b",
            "label": "I50.9 — Heart failure, unspecified",
            "isCorrect": false,
            "rationale": "While heart failure is the correct diagnostic category, I50.9 is unspecified. The discharge summary documents HFrEF with EF 25%, providing the specificity required for I50.22 or I50.23.",
            "whyTempting": "This is exactly what the physician wrote on the orders. It feels safe to match the MD order. Many experienced clinicians will select this because \"the doctor ordered it.\"",
            "failureReason": "Using I50.9 when EF and systolic dysfunction are documented fails specificity requirements. Under PDGM, unspecified codes may map to lower-acuity clinical groupings, reducing reimbursement and triggering ADR review.",
            "realWorldConsequence": "Unspecified heart failure (I50.9) when EF 25% is documented maps to a lower PDGM clinical group, directly reducing episode reimbursement by hundreds of dollars and flagging the agency for coding specificity review.",
            "trapTags": [
              "copy-md-order",
              "unspecified-code"
            ]
          },
          {
            "id": "h-pdx-c",
            "label": "I50.23 — Acute on chronic systolic (HFrEF) heart failure",
            "isCorrect": false,
            "rationale": "While clinically this may be the most accurate code given the acute exacerbation, the discharge summary says \"acute decompensated heart failure\" during the hospitalization. At the time of SOC, the patient is post-acute — the acute phase was the inpatient stay. The 485 captures the current certification period condition.",
            "whyTempting": "Clinicians with strong coding knowledge may select this because the patient clearly had an acute exacerbation. It is more specific than I50.9 and feels like the \"smartest\" answer.",
            "failureReason": "The acute component (I50.23) applies to the inpatient episode. At SOC for home health, the patient is in the chronic management phase post-discharge. Using acute-on-chronic without active acute decompensation documentation at the time of home health assessment is not defensible. Should be I50.22 for the chronic systolic phase.",
            "realWorldConsequence": "Using an acute-on-chronic code for a post-acute home health episode creates a timing documentation mismatch that auditors will exploit — if the patient is not in active acute decompensation at SOC, this code is indefensible and the claim may be denied.",
            "trapTags": [
              "timing-problem",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "h-pdx-d",
            "label": "I50.22 — Chronic systolic (congestive) heart failure",
            "isCorrect": true,
            "rationale": "Documented HFrEF with EF 25%. Patient is post-acute (discharged from hospital). The home health episode manages the chronic condition. I50.22 is the highest level of specificity supported by the current documentation for the home health certification period. It is the primary driver of skilled nursing need.",
            "whyTempting": "N/A — this is the correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-pdx-e",
            "label": "E11.621 — Type 2 DM with foot ulcer",
            "isCorrect": false,
            "rationale": "While the diabetic foot ulcer is clinically significant and requires skilled wound care, the primary reason for home health admission is CHF management post-discharge. The wound is a comorbidity driving secondary skilled interventions.",
            "whyTempting": "The wound is dramatic and requires hands-on skilled care. The BG of 342 adds urgency. Clinicians focused on the most \"visible\" problem will select this. Also, the wound has MRSA and is arguably life-threatening.",
            "failureReason": "The primary driver for home health is the cardiac condition that caused hospitalization. While the wound requires skilled care, it should be listed as secondary. Selecting the wound as primary misaligns with the referral source and reason for admission.",
            "realWorldConsequence": "Listing the wound as principal diagnosis misaligns with the referral source and admission reason, triggering an audit flag for diagnosis sequencing error that could result in episode denial and recoupment of all payments.",
            "trapTags": [
              "wrong-primary-focus"
            ]
          },
          {
            "id": "h-pdx-f",
            "label": "I48.91 — Unspecified atrial fibrillation",
            "isCorrect": false,
            "rationale": "A-fib is a new diagnosis and a significant comorbidity. However, it is secondary to the CHF which drove the hospitalization and home health referral. Also, I48.91 is unspecified — if A-fib were primary, it should be coded more specifically (I48.0 paroxysmal, I48.11 persistent, etc.).",
            "whyTempting": "New-onset A-fib with warfarin bridge is dangerous. The bradycardia at SOC and anticoagulation management create urgency. Clinicians who focus on the \"newest\" and \"most dangerous\" finding may select this.",
            "failureReason": "A-fib is a complication of the CHF, not the primary admission diagnosis. Also uses unspecified code. CHF remains the principal diagnosis as the driver of the home health episode.",
            "realWorldConsequence": "Using A-fib as the principal diagnosis misrepresents the admission driver (CHF) and uses an unspecified code, creating both a sequencing error and a specificity failure — each independently sufficient to trigger audit denial.",
            "trapTags": [
              "wrong-primary-focus",
              "unspecified-code"
            ]
          },
          {
            "id": "h-pdx-g",
            "label": "I73.9 — Peripheral vascular disease, unspecified",
            "isCorrect": false,
            "rationale": "PVD is documented (absent left DP pulse, ischemic signs). However, it is a chronic comorbidity contributing to wound healing issues, not the primary reason for home health services.",
            "whyTempting": "The left leg ischemic findings are alarming. PVD appears on the physician order. Clinicians copying the MD order or reacting to the dramatic left leg finding may select this.",
            "failureReason": "PVD is a comorbidity. Unspecified code when specific documentation exists. Not the driver of home health services.",
            "realWorldConsequence": "PVD as principal diagnosis misrepresents the home health episode entirely, using an unspecified code for a comorbidity rather than the primary admission condition — this fundamental sequencing error would result in episode denial on any targeted review.",
            "trapTags": [
              "copy-md-order",
              "unspecified-code",
              "wrong-primary-focus"
            ]
          }
        ]
      },
      {
        "id": "h-secondary-dx",
        "formBoxNumber": "BOX 12",
        "label": "Other Pertinent Diagnoses",
        "type": "multi-select",
        "domain": "secondary-diagnoses",
        "correctAnswerIds": [
          "h-sdx-b",
          "h-sdx-d",
          "h-sdx-e",
          "h-sdx-g",
          "h-sdx-h"
        ],
        "auditNote": "Secondary diagnoses must be documented, supported by the clinical record, coded to highest specificity, and relevant to the plan of care. They should justify services, explain clinical complexity, and support PDGM clinical grouping.",
        "options": [
          {
            "id": "h-sdx-a",
            "label": "E11.9 — Type 2 DM without complications",
            "isCorrect": false,
            "rationale": "Patient has documented diabetic foot ulcer and CKD — E11.9 (without complications) is factually incorrect. The correct code must capture DM with complications.",
            "whyTempting": "This is what the physician wrote. It feels safe to copy the MD order. E11.9 is probably the most commonly used DM code in home health.",
            "failureReason": "Using \"without complications\" when the patient has a diabetic foot ulcer and CKD is a coding error that will fail audit. It also reduces PDGM acuity weighting.",
            "realWorldConsequence": "Coding DM \"without complications\" when the patient has a documented diabetic foot ulcer is a factual coding error that understates clinical severity, reduces PDGM acuity weighting, and fails audit review for specificity.",
            "trapTags": [
              "copy-md-order",
              "unspecified-code"
            ]
          },
          {
            "id": "h-sdx-b",
            "label": "E11.621 — Type 2 DM with foot ulcer",
            "isCorrect": true,
            "rationale": "Patient has documented diabetic foot ulcer on right heel. This code correctly captures the DM with its manifestation and supports wound care as a skilled service.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-sdx-c",
            "label": "L97.419 — Non-pressure chronic ulcer of right heel, unspecified severity",
            "isCorrect": false,
            "rationale": "While an L97 code is needed to describe the wound, L97.419 uses unspecified severity. The SOC assessment documents necrotic tissue and undermining — severity is documented and should be coded specifically.",
            "whyTempting": "This is the exact code the physician ordered. It captures the correct body site. Clinicians who copy MD orders will use this.",
            "failureReason": "Unspecified severity when documentation supports specific staging. Fails specificity rules. Should use L97.412 (with fat layer exposed) or L97.413 (with necrosis of muscle) based on Grade 3 assessment.",
            "realWorldConsequence": "Using unspecified severity for a wound with documented depth, undermining, and necrotic tissue fails ICD-10 specificity requirements — an auditor can see the clinical detail in the SOC narrative and will deny for incorrect code selection.",
            "trapTags": [
              "copy-md-order",
              "unspecified-code"
            ]
          },
          {
            "id": "h-sdx-d",
            "label": "L97.413 — Non-pressure chronic ulcer of right heel with necrosis of muscle",
            "isCorrect": true,
            "rationale": "SOC documents Wagner Grade 3 with undermining, 0.8cm depth, necrotic tissue, and slough. Grade 3 corresponds to necrosis of muscle. This is the highest level of specificity supported by documentation.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-sdx-e",
            "label": "I48.91 — Unspecified atrial fibrillation",
            "isCorrect": true,
            "rationale": "New-onset A-fib is documented and requires anticoagulation management — a skilled nursing need. While unspecified, there is no documentation in the record to specify the type (paroxysmal, persistent, permanent). I48.91 is appropriate when type is not documented.",
            "whyTempting": "N/A — correct answer. Note: this is correctly unspecified here because unlike the other diagnoses, the A-fib type is genuinely not documented.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-sdx-f",
            "label": "I10 — Essential hypertension",
            "isCorrect": false,
            "rationale": "While hypertension is documented, it does not add clinical value to the 485 when CHF, CKD, and DM are already listed. Hypertension is assumed in the context of these conditions and does not independently drive any skilled service not already captured.",
            "whyTempting": "BP is 158/92 at SOC. Hypertension is in the discharge summary. It feels like it should be listed. Many clinicians reflexively add I10 to every 485.",
            "failureReason": "Listing I10 when it does not independently drive a service or explain clinical complexity adds clutter without value. Under PDGM, it does not change clinical grouping when CHF and CKD are present. An auditor may question why it is listed if it does not affect the plan of care.",
            "realWorldConsequence": "Including hypertension when it does not independently drive any service clutters the diagnosis list without benefit — auditors may flag habitual I10 coding as a pattern, triggering broader review of agency coding practices.",
            "trapTags": [
              "clinically-true-unsupported"
            ]
          },
          {
            "id": "h-sdx-g",
            "label": "N18.31 — Chronic kidney disease, Stage 3a",
            "isCorrect": true,
            "rationale": "CKD Stage 3a is documented in discharge summary. It directly affects medication selection (renal dosing), explains clinical complexity, and supports lab monitoring as a skilled service.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-sdx-h",
            "label": "I73.9 — Peripheral vascular disease, unspecified",
            "isCorrect": true,
            "rationale": "PVD is documented and directly relevant to wound healing prognosis and lower extremity assessment. While unspecified, the record does not document a specific PVD type beyond the general diagnosis.",
            "whyTempting": "N/A — correct answer. Note: unlike other \"unspecified\" traps, PVD is genuinely unspecified in the documentation — there is no additional detail to code more specifically.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-sdx-i",
            "label": "B95.62 — MRSA as cause of disease classified elsewhere",
            "isCorrect": false,
            "rationale": "While MRSA is documented in the wound culture, B95.62 is an additional code used to identify the organism — it cannot be used as a standalone secondary diagnosis without the primary infection code being listed. Additionally, there is no systemic MRSA infection documented — it is a wound colonization/infection.",
            "whyTempting": "MRSA is a significant finding. Clinicians want to capture it. It sounds like it adds acuity and justifies wound care intensity.",
            "failureReason": "B95.62 is a supplementary code that must be sequenced after the infection code (which would be captured in the L97 code + wound infection code). Using it standalone is a coding error. Also, wound care orders have not been obtained yet — listing MRSA without corresponding treatment orders creates a documentation gap.",
            "realWorldConsequence": "B95.62 as a standalone code without the primary infection code is a sequencing error that will be rejected at the MAC level, and listing MRSA without corresponding treatment orders creates a compliance gap suggesting billing inflation.",
            "trapTags": [
              "billing-without-documentation",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "h-sdx-j",
            "label": "F32.9 — Major depressive disorder, single episode, unspecified",
            "isCorrect": false,
            "rationale": "The SOC narrative notes \"PHQ-2 denies depressive symptoms but presentation suggests otherwise\" and \"affect: flat.\" This is a clinical observation, not a diagnosis. No provider has diagnosed depression. No PHQ-9 has been completed. No treatment has been ordered.",
            "whyTempting": "The clinical picture (flat affect, lives alone, minimizing symptoms, declining help) strongly suggests depression. Experienced clinicians may want to capture this. It also adds PDGM complexity.",
            "failureReason": "Coding a diagnosis that has not been made by a qualified provider, regardless of clinical suspicion, is a compliance violation. \"If it is not diagnosed, it does not go on the 485.\" This is a billing-without-documentation trap.",
            "realWorldConsequence": "Coding an undiagnosed psychiatric condition based on clinical suspicion alone is a compliance violation that could trigger OIG fraud investigation for billing-without-documentation — regardless of how clinically obvious the depression may appear.",
            "trapTags": [
              "clinically-true-unsupported",
              "billing-without-documentation"
            ]
          }
        ]
      },
      {
        "id": "h-homebound",
        "formBoxNumber": "BOX 13",
        "label": "Homebound Status Narrative",
        "type": "single-select",
        "domain": "homebound-status",
        "correctAnswerIds": [
          "h-hb-e"
        ],
        "auditNote": "Homebound status must document that leaving home requires considerable and taxing effort due to a medical condition. It must be specific, tied to the patient's documented conditions, and describe the functional impact — not just state conclusions.",
        "options": [
          {
            "id": "h-hb-a",
            "label": "Patient is homebound due to cardiac condition.",
            "isCorrect": false,
            "rationale": "This is exactly what the physician wrote. It states a conclusion without supporting evidence. It does not describe what \"cardiac condition\" means functionally, does not use CMS-required language about effort, and would fail audit review.",
            "whyTempting": "It is the physician's own language. It mentions the correct condition. It is brief and seems sufficient. Many clinicians copy this directly from the order.",
            "failureReason": "Fails CMS homebound criteria language requirements. Does not describe \"considerable and taxing effort.\" No functional detail. No description of what happens when the patient attempts to leave. Would fail ADR review.",
            "realWorldConsequence": "A one-sentence homebound statement without functional detail or CMS-required language fails homebound review entirely — the entire home health episode will be denied, potentially resulting in tens of thousands in recoupment for all visits.",
            "trapTags": [
              "copy-md-order",
              "homebound-language-fail"
            ]
          },
          {
            "id": "h-hb-b",
            "label": "Patient is homebound due to CHF, DM, wound on right heel, atrial fibrillation, and deconditioning. Patient requires assistance with all ADLs and cannot leave home safely.",
            "isCorrect": false,
            "rationale": "Lists diagnoses but does not describe the functional impact. \"Cannot leave home safely\" is a conclusion, not an observation. Does not include the CMS-required language about \"considerable and taxing effort.\"",
            "whyTempting": "Comprehensive diagnosis listing. Mentions ADL dependency. Sounds thorough. Many experienced clinicians write homebound narratives exactly like this.",
            "failureReason": "Diagnosis lists do not satisfy homebound requirements. CMS requires description of what happens when the patient attempts to leave — the effort, the functional limitations observed, and why leaving is taxing. This narrative would fail targeted probe review.",
            "realWorldConsequence": "Diagnosis-only homebound naratives without functional observations or \"considerable and taxing effort\" language are the most common reason for homebound denials on ADR review, resulting in full episode recoupment.",
            "trapTags": [
              "homebound-language-fail"
            ]
          },
          {
            "id": "h-hb-c",
            "label": "Patient rarely leaves home. When he does, it is only for medical appointments and it requires the assistance of another person and a wheelchair. He has shortness of breath with minimal exertion.",
            "isCorrect": false,
            "rationale": "Uses good functional language (\"shortness of breath with minimal exertion\") but is generic and not tied to the specific clinical findings documented at SOC. Does not mention the specific vitals, edema, or deconditioning level observed. Also uses \"rarely\" which CMS does not require — homebound does not mean \"never leaves.\"",
            "whyTempting": "This sounds like a \"textbook\" homebound statement. It includes functional description, mentions assistance needs, and references dyspnea. This is what many training programs teach.",
            "failureReason": "Generic template language not individualized to the patient. Does not reference the specific SOC assessment findings. An auditor comparing this to the SOC narrative would note the disconnect between the dramatic clinical picture and this bland generic statement.",
            "realWorldConsequence": "Generic template language disconnected from the actual SOC findings creates an audit vulnerability — the disconnect between a dramatic clinical picture and a bland statement will lead the auditor to question all documentation quality.",
            "trapTags": [
              "homebound-language-fail",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "h-hb-d",
            "label": "Patient is bedbound. Unable to leave home for any reason. Requires maximum assistance for all mobility. Lives alone with no local support.",
            "isCorrect": false,
            "rationale": "\"Bedbound\" and \"unable to leave for any reason\" are overstatements that create compliance risk. If the patient is ever documented leaving (even for an ER visit), this statement is invalidated. CMS homebound status does not require inability to leave — it requires that leaving is a considerable and taxing effort.",
            "whyTempting": "The patient IS essentially bedbound at SOC. This feels like the strongest possible homebound statement. Clinicians may think \"more restrictive = more defensible.\"",
            "failureReason": "Overstating homebound status is as dangerous as understating it. If any documentation shows the patient leaving home (ambulance transport, ER visit), an auditor can use this absolute language to deny the claim. Also does not describe effort — just states inability.",
            "realWorldConsequence": "Absolute statements like \"bedbound\" or \"cannot leave for any reason\" create a compliance trap — any documentation of the patient leaving home (even via ambulance for an ER visit) invalidates the entire homebound claim for the episode.",
            "trapTags": [
              "homebound-language-fail",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "h-hb-e",
            "label": "Leaving home requires considerable and taxing effort due to severe dyspnea on minimal exertion (SpO2 88% on RA, RR 24), bilateral 3+ pitting edema to knees limiting safe weight-bearing, symptomatic bradycardia (HR 48) causing dizziness with positional changes, and significant deconditioning (max assist x1 for stand, tolerated 3 steps only before onset of dyspnea and dizziness). Patient requires human assistance and assistive device for any mobility. Absences from home are infrequent, short in duration, and attributable to medical necessity.",
            "isCorrect": true,
            "rationale": "Uses CMS-required language (\"considerable and taxing effort\"). Ties homebound status to specific, documented clinical findings from the SOC assessment. Includes objective measures (SpO2, HR, RR, edema grade, functional testing). Does not overstate (acknowledges patient may leave for medical necessity). Audit-proof.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-hb-f",
            "label": "Patient meets homebound criteria due to high fall risk (bilateral edema, deconditioning, dizziness) and requires continuous supplemental oxygen limiting mobility outside the home. Leaving home poses a safety risk.",
            "isCorrect": false,
            "rationale": "References fall risk and oxygen dependency — but oxygen is NOT ordered. The patient is using a borrowed concentrator without a physician order. Basing homebound status on an unordered treatment creates a compliance problem. If audited, the O2 use has no supporting order.",
            "whyTempting": "The patient IS on oxygen at SOC. Fall risk is real and well-documented. This sounds clinically accurate and defensible.",
            "failureReason": "Citing oxygen dependency for homebound status when O2 is not ordered creates a documentation gap. An auditor would note no O2 order exists, undermining the homebound justification. Also does not use \"considerable and taxing effort\" language.",
            "realWorldConsequence": "Citing oxygen dependency for homebound status when O2 is not ordered creates an immediately auditable documentation gap, and omitting the CMS-required \"considerable and taxing effort\" language ensures denial on targeted review.",
            "trapTags": [
              "homebound-language-fail",
              "documentation-inconsistency",
              "billing-without-documentation"
            ]
          },
          {
            "id": "h-hb-g",
            "label": "Patient requires considerable and taxing effort to leave home. He has heart failure and a wound that limits his ability to ambulate. He needs help getting around his house and cannot drive.",
            "isCorrect": false,
            "rationale": "Includes the magic phrase \"considerable and taxing effort\" but does not connect it to specific clinical evidence. \"Heart failure and a wound\" is vague. \"Cannot drive\" is not a homebound criterion. The narrative is individualized but lacks the objective clinical detail that makes it audit-proof.",
            "whyTempting": "Has the CMS key phrase. Mentions real conditions. Feels individualized. Many clinicians who know the \"magic words\" but not the full standard will choose this.",
            "failureReason": "The CMS phrase alone is insufficient without supporting clinical evidence. An auditor would note this is a conclusion without documentation. Lacks objective measures, specific functional observations, and the level of detail that survives targeted review.",
            "realWorldConsequence": "Including the CMS key phrase without supporting clinical evidence is insufficient — auditors recognize \"magic word\" statements lacking objective data and will deny the homebound claim for inadequate supporting documentation.",
            "trapTags": [
              "homebound-language-fail"
            ]
          }
        ]
      },
      {
        "id": "h-skilled-need",
        "formBoxNumber": "BOX 18",
        "label": "Skilled Nursing Orders / Skilled Need",
        "type": "single-select",
        "domain": "skilled-need",
        "correctAnswerIds": [
          "h-sn-d"
        ],
        "auditNote": "Skilled need must describe services that require the skills of a licensed nurse, are reasonable and necessary, and are tied to specific, documented conditions. Each skilled service must be defensible independently.",
        "options": [
          {
            "id": "h-sn-a",
            "label": "SN for assessment of cardiac status, wound care, DM management, and medication management per physician order.",
            "isCorrect": false,
            "rationale": "This is a near-direct copy of the physician order. \"Assessment\" alone is not a skilled service — it must describe WHAT about the assessment requires nursing skill. \"DM management\" is vague. \"Per physician order\" defers clinical judgment to the MD without demonstrating nursing assessment of need.",
            "whyTempting": "Matches the physician order exactly. Covers all the major clinical areas. Feels comprehensive. \"Per physician order\" seems like the safest possible language.",
            "failureReason": "Assessment without specificity is not inherently skilled. \"Per physician order\" does not satisfy the skilled need requirement — the 485 must independently demonstrate why a skilled nurse is needed, not just that a doctor said so.",
            "realWorldConsequence": "Boilerplate skilled need language copied from physician orders fails to demonstrate why a licensed nurse is required — every SN visit billed under this vague justification is vulnerable to denial and recoupment on audit.",
            "trapTags": [
              "copy-md-order",
              "skilled-illusion"
            ]
          },
          {
            "id": "h-sn-b",
            "label": "SN for: observation and assessment of cardiovascular status; patient education on heart failure self-management including daily weights, sodium restriction, and fluid management; wound observation and dressing changes; medication reminders and refill coordination; blood glucose monitoring and insulin education.",
            "isCorrect": false,
            "rationale": "Several items listed are NOT skilled: \"medication reminders and refill coordination\" is not a skilled nursing task. \"Wound observation\" alone is not skilled. \"Blood glucose monitoring\" can be performed by the patient or HHA. \"Patient education\" without assessment complexity is not sufficient to justify skilled visits.",
            "whyTempting": "Very detailed and specific. Covers every clinical area. Sounds comprehensive and professional. Each item seems reasonable on the surface. This is the kind of care plan many agencies write.",
            "failureReason": "Multiple non-skilled items dressed up as skilled need. An auditor would identify medication reminders, wound observation without treatment, and routine BG monitoring as non-skilled. Education alone does not justify the frequency ordered.",
            "realWorldConsequence": "Multiple non-skilled items (medication reminders, wound observation, routine BG monitoring) disguised as skilled need would be identified on audit, resulting in denial of SN visits and potential findings of habitual upcoding.",
            "trapTags": [
              "skilled-illusion",
              "intervention-not-skilled"
            ]
          },
          {
            "id": "h-sn-c",
            "label": "SN for complex post-acute cardiac monitoring and wound management. Patient recently hospitalized for CHF and requires ongoing nursing assessment to prevent re-hospitalization. Multiple comorbidities increase clinical complexity.",
            "isCorrect": false,
            "rationale": "Uses impressive-sounding language (\"complex post-acute cardiac monitoring\") but is vague. Does not describe SPECIFIC skilled tasks. \"Prevent re-hospitalization\" is a goal, not a skilled service. \"Multiple comorbidities increase clinical complexity\" is a conclusion without evidence.",
            "whyTempting": "Sounds sophisticated and clinical. Mentions re-hospitalization prevention (a CMS priority). Emphasizes complexity. This reads like a well-written justification.",
            "failureReason": "Vague language without specific skilled interventions fails the reasonable and necessary test. An auditor needs to see WHAT the nurse will DO, not generalized statements about complexity. This would not survive ZPIC/UPIC review.",
            "realWorldConsequence": "Vague, impressive-sounding language without specific skilled interventions fails the CMS reasonable-and-necessary test — this would not survive ZPIC/UPIC review, resulting in full denial and potential fraud referral.",
            "trapTags": [
              "skilled-illusion",
              "homebound-language-fail"
            ]
          },
          {
            "id": "h-sn-d",
            "label": "SN for: (1) Cardiopulmonary assessment including auscultation, edema monitoring, daily weight trending, and titration teaching for new cardiac medications (carvedilol, furosemide, warfarin/apixaban bridge) in a patient with HFrEF EF 25% and new-onset A-fib requiring anticoagulation management with INR monitoring; (2) Skilled wound assessment and treatment of MRSA-positive Wagner Grade 3 diabetic/vascular ulcer right heel with undermining requiring measurement, debridement assessment, wound bed preparation, and infection monitoring — wound care orders to be obtained from physician; (3) Complex medication management and reconciliation for 8+ medications across 4 disease processes in a patient who has taken zero medications since discharge, with high-risk drug interactions (warfarin + insulin + carvedilol) requiring skilled assessment of therapeutic response, adverse effects, and adherence barriers; (4) Venipuncture for BMP, CBC, INR per protocol.",
            "isCorrect": true,
            "rationale": "Each skilled service is specific, tied to documented findings, clearly requires nursing skill, and is reasonable/necessary. Identifies specific medications, specific clinical findings, specific wound characteristics, and specific lab needs. Notes the wound care order gap transparently. Audit-proof.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-sn-e",
            "label": "SN for: comprehensive cardiovascular assessment with telemetry correlation; wound VAC therapy management; insulin pump titration and continuous glucose monitoring oversight; anticoagulation clinic coordination and INR self-testing education.",
            "isCorrect": false,
            "rationale": "Lists services that are NOT documented or ordered: there is no telemetry, no wound VAC, no insulin pump, no CGM, and no anticoagulation clinic referral. These are real skilled services but they do not apply to THIS patient.",
            "whyTempting": "Every item listed IS a genuinely skilled nursing service. Clinicians who think \"skilled = good\" without checking against the actual documentation may select this. It sounds like premium, high-acuity care.",
            "failureReason": "Every service listed is either not ordered or not applicable to this patient. Listing services not supported by the clinical documentation is a compliance violation. An auditor would immediately identify the mismatch.",
            "realWorldConsequence": "Listing services not ordered or applicable to the patient (telemetry, wound VAC, insulin pump, CGM) is a compliance violation — the mismatch between documented care and listed interventions could trigger fraud investigation.",
            "trapTags": [
              "intervention-not-ordered",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "h-sn-f",
            "label": "SN for: teaching patient CHF self-management including when to call the doctor; ensuring patient understands medication schedule; checking wound weekly for signs of infection; monitoring blood sugar levels and adjusting diet.",
            "isCorrect": false,
            "rationale": "Every item is either not skilled or significantly understates the clinical acuity. \"Teaching when to call the doctor\" is basic education. \"Ensuring patient understands medication schedule\" is a reminder/verification task. \"Checking wound weekly\" drastically underestimates wound care needs for a MRSA-positive Wagner 3 ulcer. \"Monitoring blood sugar and adjusting diet\" is not a skilled nursing action.",
            "whyTempting": "These are real things a nurse would do for this patient. They sound helpful and patient-centered. This is what many nurses describe when asked what they do in the home.",
            "failureReason": "None of these rise to the level of skilled nursing as defined by CMS. Teaching alone is not sufficient when the patient needs hands-on assessment and treatment. This skilled need statement would not support a single billable visit.",
            "realWorldConsequence": "Every listed activity (teaching when to call doctor, medication reminders, wound checking, diet monitoring) fails to meet CMS skilled nursing definitions — no billable SN visit could be justified, resulting in total SN payment recoupment.",
            "trapTags": [
              "skilled-illusion",
              "intervention-not-skilled"
            ]
          },
          {
            "id": "h-sn-g",
            "label": "SN for: (1) Assessment and management of acute heart failure decompensation with hemodynamic instability; (2) Emergency wound intervention for gangrenous heel ulcer; (3) Acute hypoglycemia management protocol; (4) Crisis intervention for medication non-compliance and psychosocial barriers.",
            "isCorrect": false,
            "rationale": "Dramatically overstates the clinical situation. The patient is NOT in acute decompensation (that was the inpatient stay). The wound is NOT gangrenous (slough and necrosis documented, not gangrene). The patient has HYPERglycemia, not HYPOglycemia. \"Crisis intervention\" is a mental health term not applicable here.",
            "whyTempting": "Sounds extremely clinical and urgent. Uses dramatic medical language. Clinicians who want to \"maximize acuity\" may inflate the clinical picture.",
            "failureReason": "Overstating clinical findings is as dangerous as understating them. Each incorrect descriptor (acute decompensation, gangrenous, hypoglycemia) would be caught by an auditor comparing the 485 to the clinical record, potentially triggering fraud investigation.",
            "realWorldConsequence": "Overstating findings (acute decompensation, gangrene, hypoglycemia) when the record shows otherwise would be caught by any auditor comparing the 485 to the clinical record, potentially triggering a fraud investigation for falsified documentation.",
            "trapTags": [
              "documentation-inconsistency",
              "billing-without-documentation"
            ]
          }
        ]
      },
      {
        "id": "h-visit-freq",
        "formBoxNumber": "BOX 21",
        "label": "Visit Frequency",
        "type": "single-select",
        "domain": "visit-frequency",
        "correctAnswerIds": [
          "h-vf-c"
        ],
        "auditNote": "Visit frequency must be tied to patient acuity, clinical need, and expected progression. It must be front-loaded for post-acute patients and taper as the patient stabilizes. The frequency must be defensible against the clinical picture — neither over-treating nor under-treating.",
        "options": [
          {
            "id": "h-vf-a",
            "label": "SN 3W1 x 2 wks, 2W3 x 2 wks, 1W4 x 4 wks. PT eval + treat 2W1 x 2 wks, 1W2 x 6 wks. HHA 3x/wk x 8 wks.",
            "isCorrect": false,
            "rationale": "This is a direct copy of the physician order. However, the physician order was written BEFORE the SOC assessment revealed critical findings (no meds filled, SpO2 88%, HR 48, wound worse than expected). The frequency does not reflect the acuity discovered at SOC. Also, PT is ordered to start immediately but physician said \"hold 48 hours.\" The SN frequency is also inconsistent — \"2W3\" would mean 2 visits in weeks 3 through what endpoint? This notation is ambiguous.",
            "whyTempting": "Matches the doctor's order exactly. Includes appropriate taper. Has all three disciplines. Copying the MD frequency is the most common practice.",
            "failureReason": "The physician order predates the SOC findings that dramatically change the acuity picture. Frequency must be updated based on SOC assessment. PT timing conflicts with hold order. This is the \"copy the doctor\" trap.",
            "realWorldConsequence": "Copying pre-SOC physician frequency when the SOC revealed critically worsened acuity constitutes clinical negligence — if the patient decompensates between visits because frequency was not escalated, the agency faces malpractice liability.",
            "trapTags": [
              "copy-md-order",
              "frequency-mismatch",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "h-vf-b",
            "label": "SN 5W1 x 1 wk, 3W2 x 3 wks, 2W3 x 2 wks, 1W4 x 2 wks. PT eval + treat 3W1 x 1 wk, 2W2 x 3 wks, 1W3 x 4 wks. HHA 5x/wk x 8 wks.",
            "isCorrect": false,
            "rationale": "While this reflects higher acuity than the MD order, SN 5x/week in week 1 is excessive for home health (this approaches daily which is rarely defensible outside HHVBP or wound VAC scenarios). PT 3x in week 1 directly contradicts the 48-hour hold. HHA 5x/week without documented need for daily ADL assistance at that level is over-utilization.",
            "whyTempting": "The clinical picture IS severe. Clinicians who think \"sicker patient = more visits\" will choose the highest frequency available. Front-loading seems appropriate given the critical SOC findings.",
            "failureReason": "Over-utilization triggers audit. SN 5x/wk in home health is an outlier that requires exceptional justification. PT contradicts the hold order. HHA 5x/wk exceeds documented ADL need. This pattern flags for UPIC review.",
            "realWorldConsequence": "SN at 5x/week and PT starting immediately violate the physician hold order and exceed defensible home health utilization, triggering automatic UPIC review and potential pre-payment audit for over-utilization.",
            "trapTags": [
              "frequency-mismatch",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "h-vf-c",
            "label": "SN 4W1 x 1 wk, 3W2 x 1 wk, 2W3 x 2 wks, 2W4 x 2 wks, 1W5-8 x 4 wks (wound care may require continued 2x/wk frequency pending wound progress and physician wound care orders). PT eval after 48hr hold, then 2W1 x 2 wks, 1W2 x 6 wks. HHA 3x/wk x 8 wks.",
            "isCorrect": true,
            "rationale": "Front-loaded to address critical SOC findings (medication reconciliation, cardiac instability, wound assessment). Tapers appropriately but maintains wound care frequency with clinical justification. Respects the 48-hour PT hold. HHA matches documented ADL needs. Includes a clinical rationale note for the sustained wound care frequency. Audit-defensible.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-vf-d",
            "label": "SN 2W1 x 2 wks, 1W3 x 6 wks. PT eval + treat 1W1 x 8 wks. HHA 2x/wk x 8 wks.",
            "isCorrect": false,
            "rationale": "Drastically undertreats the patient. SN 2x/week in week 1 for a patient with SpO2 88%, HR 48, BG 342, no medications filled, and a MRSA-positive wound is indefensible. The rapid taper to 1x/week ignores the wound care needs and medication titration complexity.",
            "whyTempting": "Conservative frequencies avoid over-utilization flags. Some clinicians fear high-frequency plans. This looks \"efficient\" and \"sustainable.\"",
            "failureReason": "Under-treatment creates patient safety risk and clinical negligence liability. The acuity at SOC demands higher frequency. An auditor reviewing this against the SOC findings would question whether the agency provided adequate care.",
            "realWorldConsequence": "Under-treatment with SN 2x/week for a patient with SpO2 88%, HR 48, BG 342, and zero medications creates direct patient safety risk — a resulting adverse event would constitute clinical negligence with clear liability.",
            "trapTags": [
              "frequency-mismatch"
            ]
          },
          {
            "id": "h-vf-e",
            "label": "SN 3W1 x 2 wks, 2W3 x 2 wks, 1W5 x 4 wks. PT eval + treat per PT assessment. MSW 1x for psychosocial assessment. HHA 3x/wk x 8 wks.",
            "isCorrect": false,
            "rationale": "SN frequency is reasonable but identical to the pre-SOC MD order and does not reflect the escalated acuity. Adding MSW is not wrong clinically but there is no MSW order from the physician and no specific documented need beyond clinical suspicion. \"PT per PT assessment\" is vague and not a frequency.",
            "whyTempting": "Adds MSW which seems thoughtful given the psychosocial concerns. SN frequency seems reasonable. PT language defers to the specialist which seems respectful.",
            "failureReason": "MSW was not ordered and would need a physician order and documented need. PT must have a specific frequency. SN frequency doesn't account for the worsened SOC findings. Multiple issues that individually seem minor but collectively demonstrate fragmented planning.",
            "realWorldConsequence": "Adding MSW without a physician order is non-compliant, \"PT per PT assessment\" is not a valid frequency, and the unchanged SN frequency ignores worsened SOC findings — multiple compliance and clinical gaps.",
            "trapTags": [
              "copy-md-order",
              "intervention-not-ordered",
              "discipline-not-justified"
            ]
          },
          {
            "id": "h-vf-f",
            "label": "SN daily x 3 days, then 3W1 x 1 wk, 2W2 x 2 wks, 1W3 x 5 wks. PT eval at day 3, then 2W1 x 2 wks, 1W2 x 5 wks. HHA 3x/wk x 8 wks.",
            "isCorrect": false,
            "rationale": "SN daily for 3 days sounds appropriate given critical SOC findings but \"daily\" in home health typically means 7 days/week — this implies weekend visits on days 1-3. While clinically justifiable for this patient, most home health agencies cannot operationally support true daily SN, and this frequency pattern is unusual enough to require strong clinical justification that addresses why daily is needed vs. 4x/week. Additionally, PT at day 3 ignores the 48-hour hold (day 3 might be within the hold period depending on SOC time).",
            "whyTempting": "Daily SN for the first 3 days addresses the urgency. The taper is logical. This shows clinical judgment about the severity. PT timing seems close enough to the hold.",
            "failureReason": "Daily SN without clear documentation of why 4x/week is insufficient creates audit risk. PT timing may violate the 48-hour hold. The overall pattern is clinically reasonable but not operationally standard, requiring justification that is not provided.",
            "realWorldConsequence": "Daily SN without documented justification for why 4x/week is insufficient creates audit risk, and PT timing may violate the 48-hour hold — a clinically reasonable pattern with compliance vulnerabilities.",
            "trapTags": [
              "frequency-mismatch",
              "timing-problem"
            ]
          },
          {
            "id": "h-vf-g",
            "label": "SN 4W1 x 2 wks, 3W3 x 2 wks, 2W5 x 4 wks. No PT — patient too unstable. HHA 4x/wk x 8 wks.",
            "isCorrect": false,
            "rationale": "Eliminating PT entirely is not defensible — the physician ordered PT, and the patient has documented deconditioning requiring rehabilitation. \"Too unstable\" at SOC does not mean PT should never start — the 48-hour hold exists precisely to allow stabilization before PT eval. HHA 4x/week exceeds documented need. SN frequency maintains high level throughout without appropriate taper.",
            "whyTempting": "The patient IS unstable at SOC. Deferring PT until the patient is stable seems clinically safe. Higher HHA frequency seems caring. Maintaining SN visits seems protective.",
            "failureReason": "Failing to include an ordered discipline without documented clinical justification and physician agreement is non-compliant. Sustained high SN frequency without taper suggests lack of discharge planning. HHA over-utilization.",
            "realWorldConsequence": "Eliminating a physician-ordered discipline (PT) without documented justification is non-compliant, sustained high SN frequency without taper suggests poor discharge planning, and HHA 4x/week exceeds documented need.",
            "trapTags": [
              "discipline-not-justified",
              "frequency-mismatch",
              "documentation-inconsistency"
            ]
          }
        ]
      },
      {
        "id": "h-goals",
        "formBoxNumber": "BOX 22",
        "label": "Goals / Rehabilitation Potential",
        "type": "single-select",
        "domain": "goals",
        "correctAnswerIds": [
          "h-gl-f"
        ],
        "auditNote": "Goals must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound), tied to skilled interventions, and reflect the clinical picture. They must be patient-centered and clinically meaningful — not task-based or vague.",
        "options": [
          {
            "id": "h-gl-a",
            "label": "Patient will improve cardiac status, wound healing, and diabetes management within the certification period. Rehab potential: Good.",
            "isCorrect": false,
            "rationale": "Completely non-measurable. \"Improve\" is not defined. No metrics, no timeframes, no functional targets. \"Good rehab potential\" without justification is meaningless.",
            "whyTempting": "Covers all clinical areas. Sounds optimistic. \"Good rehab potential\" is the most common selection. This is what many 485s actually say.",
            "failureReason": "Fails every SMART criterion. An auditor cannot determine if goals were met or not. Non-measurable goals make outcomes assessment impossible and weaken the entire plan of care.",
            "realWorldConsequence": "Non-measurable goals make it impossible to demonstrate progress or determine if services should continue — auditors cannot evaluate outcomes, and recertification requests will be denied for lack of measurable improvement.",
            "trapTags": [
              "vague-goal",
              "non-measurable-goal"
            ]
          },
          {
            "id": "h-gl-b",
            "label": "Goals: (1) SN will perform wound care per protocol. (2) SN will monitor cardiac status each visit. (3) SN will draw labs as ordered. (4) PT will improve strength and endurance. Rehab potential: Fair.",
            "isCorrect": false,
            "rationale": "These are nursing TASKS, not patient goals. \"SN will perform wound care\" describes what the nurse does, not what the patient will achieve. Goals must be patient-centered outcomes, not staff activities.",
            "whyTempting": "Very specific about what will happen. Lists concrete nursing actions. Seems actionable and measurable. Many clinicians confuse interventions with goals.",
            "failureReason": "Task-based goals are a red flag for auditors. They demonstrate a fundamental misunderstanding of patient-centered care planning. None of these describe a patient outcome.",
            "realWorldConsequence": "Task-based goals describing what the nurse does rather than what the patient achieves are an audit red flag demonstrating fundamental misunderstanding of patient-centered care planning — claims are vulnerable to denial.",
            "trapTags": [
              "task-based-goal",
              "non-measurable-goal"
            ]
          },
          {
            "id": "h-gl-c",
            "label": "Goals: (1) Patient will have no ER visits or re-hospitalizations in 60 days. (2) Wound will be healed within certification period. (3) Patient will achieve A1C below 7.0. (4) Patient will be medication compliant. Rehab potential: Good.",
            "isCorrect": false,
            "rationale": "\"No re-hospitalizations\" is not a patient goal — it is an agency metric. \"Wound healed\" is unrealistic for a MRSA-positive Wagner 3 ulcer in 60 days with PVD and uncontrolled DM. A1C below 7.0 is a long-term goal inappropriate for a 60-day cert period. \"Medication compliant\" is vague and unmeasurable.",
            "whyTempting": "These sound ambitious and quality-focused. Re-hospitalization prevention is a CMS priority. Wound healing seems like the obvious goal. A1C targets are evidence-based. Compliance is something everyone documents.",
            "failureReason": "Unrealistic goals are as problematic as vague ones. An auditor would note the MRSA Wagner 3 ulcer cannot heal in 60 days, making the goal non-achievable. A1C is a 3-month marker, not a 60-day cert metric. Re-hospitalization rate is an agency outcome measure, not a patient goal.",
            "realWorldConsequence": "Unrealistic goals (wound healed in 60 days for MRSA Wagner 3, A1C below 7.0 in 60 days) create documented failure that weakens the entire plan of care and makes recertification indefensible.",
            "trapTags": [
              "non-measurable-goal",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "h-gl-d",
            "label": "Goals: (1) Patient will demonstrate understanding of CHF self-management including daily weights, fluid restriction, and when to call the agency by week 4. (2) Patient will verbalize understanding of all medications by week 3. (3) Wound will show reduction in slough by week 6. (4) Patient will ambulate 150 feet with rolling walker independently by week 8. Rehab potential: Fair to good with compliance.",
            "isCorrect": false,
            "rationale": "Several issues: \"Demonstrate understanding\" and \"verbalize understanding\" are teach-back metrics that measure education retention, not clinical outcomes. They are appropriate as teaching goals but not as the primary plan of care goals. Wound goal (reduction in slough) has no measurable percentage. Ambulation goal (150 feet) is not tied to current baseline. \"With compliance\" conditions the rehab potential on patient behavior, which is not appropriate.",
            "whyTempting": "Has time frames. Has specific activities. Includes a functional goal. Addresses teaching. Seems SMART-compliant on the surface. This is better than most real-world 485 goals.",
            "failureReason": "Education-based goals alone do not support continued skilled services. If the patient \"verbalizes understanding\" but clinical status does not improve, the education goal is met but the patient still needs care — creating a documentation paradox. Functional baseline is missing for the ambulation goal.",
            "realWorldConsequence": "Education-only goals create a documentation paradox — once the patient \"verbalizes understanding\" the goal is met regardless of clinical status, making continued skilled services indefensible to auditors.",
            "trapTags": [
              "non-measurable-goal",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "h-gl-e",
            "label": "Goals: (1) SpO2 maintained ≥92% on RA by week 4 with optimization of cardiac medications. (2) BG fasting levels 100-180 mg/dL within 2 weeks of medication initiation. (3) Weight loss of ≥10 lbs (fluid) within 2 weeks via diuretic therapy. (4) Wound bed slough reduced from 60% to <30%, wound size reduced by 25%, and no signs of systemic infection by week 8. (5) Independent with safe transfers and ambulation 100 feet with walker by week 8 (baseline: max assist for stand, 3 steps). Rehab potential: Fair — multiple barriers including non-adherence risk, social isolation, and vascular compromise affecting wound healing.",
            "isCorrect": false,
            "rationale": "Close but has a critical flaw: Goal (1) targets SpO2 ≥92% on room air by week 4 — but the patient's O2 is not ordered. If O2 is never ordered, achieving 92% on RA with EF 25% and bilateral crackles may be unrealistic. Also, Goal (3) specifies \"≥10 lbs\" which is overly prescriptive — fluid loss depends on diuretic response and renal function (CKD Stage 3a limits diuresis). Weight loss goal should be trending, not a fixed target.",
            "whyTempting": "Extremely specific. Has baselines. Has timeframes. Has measurable targets. Has functional goals. Rehab potential is nuanced. This looks like the \"perfect\" answer.",
            "failureReason": "Setting specific physiologic targets that depend on unordered treatments (O2) or that ignore documented limitations (CKD affecting diuresis) creates goals that cannot be met due to factors outside the care plan. An auditor noting unmet goals would question care adequacy.",
            "realWorldConsequence": "Goals dependent on unordered treatments (SpO2 on RA without O2 order) or ignoring documented limitations (CKD affecting diuresis) create targets that cannot be met, documenting predictable failure.",
            "trapTags": [
              "documentation-inconsistency",
              "billing-without-documentation"
            ]
          },
          {
            "id": "h-gl-f",
            "label": "Goals: (1) Cardiac: Patient will demonstrate stable VS (HR 60-100, BP <140/90, SpO2 ≥90% on current support, weight trending toward pre-admit baseline of 196 lbs) by week 4 through medication optimization and volume management. (2) Wound: Right heel wound will show progression toward healing (slough reduced from 60% to <30% of wound bed, wound dimensions decreased, periwound erythema reduced, no systemic infection signs) by week 8 — healing timeline extended due to MRSA, PVD, and uncontrolled DM. (3) DM: Fasting BG consistently 100-200 mg/dL within 2 weeks of medication initiation; patient will demonstrate correct insulin administration technique and verbalize hypoglycemia/hyperglycemia action plan by week 3. (4) Functional: Patient will progress from max assist x1 for standing to min assist for transfers and ambulation ≥50 feet with rolling walker by week 8. (5) Safety/Self-Management: Patient will independently manage medication regimen with ≤1 error per week by week 6 and correctly identify 3 warning signs requiring MD notification. Rehab potential: Fair — significant barriers (PVD, MRSA, CKD, social isolation, adherence history) but achievable with sustained skilled intervention and care coordination.",
            "isCorrect": true,
            "rationale": "Each goal is SMART with specific baselines from SOC assessment, measurable targets, realistic timeframes acknowledging barriers, relevant to the skilled interventions ordered, and time-bound within the cert period. Wound goal explicitly acknowledges factors slowing healing. Functional goal uses SOC baseline. DM goal combines clinical metric with functional self-management. Rehab potential is honest and specific. Audit-proof.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-gl-g",
            "label": "Goals: Patient will be discharged from home health services within the 60-day certification period with stable cardiac status, healing wound, controlled blood sugars, and ability to manage own care. Rehab potential: Good — patient was previously independent.",
            "isCorrect": false,
            "rationale": "Discharge is not a goal — it is an outcome of met goals. \"Stable,\" \"healing,\" \"controlled,\" and \"ability to manage\" are all undefined. Previous independence does not predict current rehab potential when the patient has HFrEF EF 25%, new A-fib, a Wagner 3 MRSA ulcer, and CKD.",
            "whyTempting": "Discharge within the cert period sounds efficient. Acknowledges prior functional level. Uses clinical-sounding descriptors. Many agencies frame goals around discharge.",
            "failureReason": "No measurable criteria for any goal. An auditor cannot determine if goals were met. Overly optimistic rehab potential ignores documented barriers. Discharge-focused goals prioritize agency efficiency over patient outcomes.",
            "realWorldConsequence": "Discharge-focused goals without measurable criteria prioritize agency efficiency over patient outcomes — auditors cannot determine if goals were met, and overly optimistic rehab potential ignores documented barriers.",
            "trapTags": [
              "vague-goal",
              "non-measurable-goal"
            ]
          }
        ]
      },
      {
        "id": "h-interventions",
        "formBoxNumber": "BOX 18/21",
        "label": "Interventions / Orders",
        "type": "multi-select",
        "domain": "interventions",
        "correctAnswerIds": [
          "h-int-a",
          "h-int-c",
          "h-int-f",
          "h-int-g",
          "h-int-j"
        ],
        "auditNote": "Interventions must be ordered, skilled, supported by documentation, matched to goals, and within scope. Every intervention on the 485 must have a corresponding order, a corresponding goal, and a documented clinical need.",
        "options": [
          {
            "id": "h-int-a",
            "label": "SN to perform comprehensive cardiovascular assessment each visit: auscultation, edema grading, daily weight review, I&O trending, VS with orthostatics, SpO2 monitoring. Teach patient CHF self-management (daily weights, sodium <2g/day, fluid restriction per MD, symptom recognition). Coordinate with MD for medication titration based on clinical response.",
            "isCorrect": true,
            "rationale": "Specific, skilled, ordered, supported by documentation, tied to cardiac goals. Includes assessment, teaching, and care coordination — all skilled nursing functions.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-int-b",
            "label": "SN to administer IV furosemide 80mg as needed for acute volume overload unresponsive to oral diuretics.",
            "isCorrect": false,
            "rationale": "IV furosemide is NOT ordered. The patient is on oral furosemide 80mg BID. Home health IV infusion requires specific physician orders, pharmacy coordination, and often a different reimbursement pathway. This intervention is fabricated.",
            "whyTempting": "The patient has severe volume overload (22 lb weight gain, 3+ edema, crackles, SpO2 88%). IV diuresis seems clinically appropriate. Clinicians focused on \"what the patient needs\" rather than \"what is ordered\" may select this.",
            "failureReason": "Listing an intervention that is not ordered is a compliance violation. Even if clinically indicated, the 485 cannot include treatments without physician orders. This must go through a separate order process.",
            "realWorldConsequence": "Listing IV furosemide when only oral is ordered is fabricating an intervention — this compliance violation could trigger fraud investigation and creates liability if the unauthorized treatment were actually administered.",
            "trapTags": [
              "intervention-not-ordered"
            ]
          },
          {
            "id": "h-int-c",
            "label": "SN to perform skilled wound assessment and treatment of right heel wound: measure wound dimensions, depth, and undermining each visit; assess wound bed, periwound skin, drainage characteristics, and signs of infection; cleanse wound per physician wound care orders (TO BE OBTAINED — no current wound care orders on file); apply appropriate dressing; photograph wound weekly for documentation; educate patient on offloading, nutrition for wound healing, and infection signs. Notify MD of wound status changes.",
            "isCorrect": true,
            "rationale": "Correctly identifies that wound care orders are not yet on file and flags this transparently. Describes specific skilled wound care components. Includes education and MD notification. This is defensible because it acknowledges the order gap while describing the skilled assessment and planned treatment.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-int-d",
            "label": "SN to apply silver alginate dressing to right heel wound, cover with foam secondary dressing, change every 72 hours. Administer oral doxycycline 100mg BID for MRSA wound infection.",
            "isCorrect": false,
            "rationale": "Specific wound care products and antibiotics are NOT ordered by the physician. While silver alginate may be appropriate for an MRSA wound and doxycycline is a reasonable MRSA antibiotic, these have not been prescribed. The 485 cannot include specific treatments without corresponding orders.",
            "whyTempting": "These are clinically appropriate interventions for an MRSA wound. The nurse is \"thinking ahead\" and planning appropriate care. This seems proactive and knowledgeable.",
            "failureReason": "Listing specific medications and dressing types not ordered by the physician is practicing outside the plan of care. The nurse should obtain orders for these specific interventions before listing them on the 485.",
            "realWorldConsequence": "Listing specific wound products and antibiotics not ordered by the physician constitutes practicing outside the plan of care — the nurse cannot prescribe treatments, and billing for unordered interventions is a compliance violation.",
            "trapTags": [
              "intervention-not-ordered",
              "scope-mismatch"
            ]
          },
          {
            "id": "h-int-e",
            "label": "HHA to perform daily blood glucose monitoring, assist with insulin administration, and perform wound dressing changes under SN supervision.",
            "isCorrect": false,
            "rationale": "HHA scope issues: HHAs cannot administer insulin (medication administration), and wound dressing changes on a MRSA-positive Wagner 3 wound require skilled nursing, not HHA. BG monitoring by HHA may be acceptable in some states but must be within state practice act and CL-CP-001 (Plan of Care Development & Approval).",
            "whyTempting": "Seems efficient — HHA provides daily support while SN visits less frequently. Daily BG monitoring makes clinical sense. \"Under SN supervision\" sounds like proper oversight.",
            "failureReason": "HHA performing wound care on a complex MRSA wound and administering insulin violates scope of practice in most states. \"Under SN supervision\" does not change scope limitations. This would be a survey citation.",
            "realWorldConsequence": "HHA administering insulin and performing complex wound care on a MRSA-positive wound violates scope of practice — a resulting patient injury would constitute negligent delegation, exposing the agency to malpractice and survey citation.",
            "trapTags": [
              "scope-mismatch",
              "intervention-not-skilled"
            ]
          },
          {
            "id": "h-int-f",
            "label": "SN to perform medication reconciliation and complex medication management: verify all discharge medications obtained and correctly dosed; assess for drug interactions (warfarin + NSAIDs, carvedilol + insulin masking hypoglycemia symptoms); monitor therapeutic response to new medications; coordinate warfarin/apixaban bridge per protocol with INR monitoring; teach patient medication purposes, administration, side effects, and adherence strategies. Pill box setup with backup system for patient living alone.",
            "isCorrect": true,
            "rationale": "Addresses the critical medication issue (no meds filled). Identifies specific drug interaction concerns documented in the clinical picture. Includes skilled assessment components beyond just \"giving pills.\" Practical adherence strategy for a patient living alone.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-int-g",
            "label": "SN venipuncture for: BMP and CBC weekly x 4 weeks (renal function monitoring for CKD + furosemide, electrolytes for cardiac medications); INR per anticoagulation protocol during warfarin bridge; fasting lipid panel at week 4. Report critical values to MD immediately.",
            "isCorrect": true,
            "rationale": "Lab monitoring is ordered, skilled, and clinically necessary. BMP for renal function with CKD and high-dose furosemide. INR for warfarin bridge. Specific rationale for each lab. Critical value protocol included.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-int-h",
            "label": "SN to arrange removal of firearm from nightstand. Coordinate with social services for power restoration. Contact daughter to arrange daily check-in calls. Set up Meals on Wheels.",
            "isCorrect": false,
            "rationale": "While these are legitimate safety and social concerns, they are not skilled nursing interventions. Firearm safety is an environmental assessment finding that should be documented and discussed but removal cannot be mandated. Social services coordination, family contact, and meal programs are case management/MSW functions, not SN interventions.",
            "whyTempting": "These address real, documented safety and social concerns. The firearm and power issues are critical safety risks. This seems like comprehensive, holistic care.",
            "failureReason": "Social coordination is not skilled nursing. Mandating firearm removal raises legal and ethical issues. These activities do not justify SN visits. If social services are needed, an MSW order should be obtained. Listing non-skilled activities as SN interventions inflates the care plan.",
            "realWorldConsequence": "Social coordination activities are not skilled nursing interventions and cannot justify SN visits — billing SN rates for non-skilled activities constitutes waste under the Medicare program, and mandating firearm removal raises legal issues.",
            "trapTags": [
              "intervention-not-skilled",
              "scope-mismatch"
            ]
          },
          {
            "id": "h-int-i",
            "label": "PT to evaluate and treat for deconditioning: therapeutic exercise, gait training with rolling walker, transfer training, balance activities, fall prevention education. Establish home exercise program. Collaborate with SN on activity tolerance given cardiac limitations.",
            "isCorrect": false,
            "rationale": "Clinically appropriate PT interventions BUT timing is critical — the physician ordered a 48-hour hold on PT. This intervention as written does not acknowledge the hold. If PT begins before the hold period, it violates the physician order. The intervention should specify \"initiate after 48-hour hold post-SOC per physician order\" and note that PT eval timing is contingent on cardiac stabilization.",
            "whyTempting": "Everything listed is a legitimate PT intervention for this patient. The collaboration with SN is appropriate. The interventions match the PT goals. This seems like a complete PT plan.",
            "failureReason": "Missing the 48-hour hold acknowledgment means PT could start before physician-directed timing. While the content is correct, the timing omission is a compliance gap. The 485 must reflect all physician instructions including holds and timing restrictions.",
            "realWorldConsequence": "Omitting the 48-hour PT hold means PT could start before the physician-directed timing — this compliance gap violates the physician order and creates liability if the patient decompensates during premature PT activity.",
            "trapTags": [
              "timing-problem",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "h-int-j",
            "label": "PT to evaluate and treat after 48-hour post-SOC hold per Dr. Aris order (cardiac stabilization): therapeutic exercise for progressive strengthening and endurance; gait training with rolling walker progressing from max assist to supervised to independent as tolerated; transfer training bed-to-chair, chair-to-stand; balance assessment and training; fall prevention education and home safety assessment; establish progressive home exercise program with cardiac precautions (monitor HR, BP, SpO2 during activity, stop if symptomatic). Coordinate with SN on cardiac medication effects on exercise tolerance.",
            "isCorrect": true,
            "rationale": "Acknowledges the 48-hour hold with physician attribution. Includes specific, skilled PT interventions. Progression plan from current baseline. Cardiac precautions appropriate for this patient. Collaboration with SN documented.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          }
        ]
      },
      {
        "id": "h-disciplines",
        "formBoxNumber": "BOX 20",
        "label": "Disciplines / Services Required",
        "type": "multi-select",
        "domain": "disciplines",
        "correctAnswerIds": [
          "h-disc-a",
          "h-disc-c",
          "h-disc-e"
        ],
        "auditNote": "Each discipline must be ordered, have documented need, have corresponding goals and interventions, and be defensible under audit. Adding disciplines without justification is over-utilization; omitting needed disciplines is a care quality issue.",
        "options": [
          {
            "id": "h-disc-a",
            "label": "Skilled Nursing (SN)",
            "isCorrect": true,
            "rationale": "SN is the primary discipline. Cardiac management, wound care, medication management, lab draws, and teaching all require skilled nursing. Extensively documented need.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-disc-b",
            "label": "Medical Social Worker (MSW)",
            "isCorrect": false,
            "rationale": "While the patient has significant psychosocial needs (lives alone, social isolation, depression signs, safety concerns, medication access barriers), MSW was NOT ordered by the physician. Adding MSW requires a physician order. The SN should make a referral recommendation to the MD, but cannot unilaterally add MSW to the 485.",
            "whyTempting": "The social concerns are glaring: firearm, power outages, lives alone, non-compliant, possible depression, pharmacy access issues. MSW seems urgently needed. Experienced clinicians know MSW should be involved.",
            "failureReason": "MSW is not ordered. While the SN should absolutely recommend MSW to the physician, including it on the 485 without an order is non-compliant. The correct action is to document the recommendation and obtain the order.",
            "realWorldConsequence": "Including MSW without a physician order makes the 485 non-compliant — the physician may refuse to sign, delaying plan certification, and any MSW visits provided without an order are unbillable.",
            "trapTags": [
              "discipline-not-justified",
              "intervention-not-ordered"
            ]
          },
          {
            "id": "h-disc-c",
            "label": "Physical Therapy (PT)",
            "isCorrect": true,
            "rationale": "PT is ordered for deconditioning. Patient has documented functional decline (max assist for transfers, 3 steps only). PT evaluation and treatment are medically necessary with the 48-hour hold accommodated.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-disc-d",
            "label": "Occupational Therapy (OT)",
            "isCorrect": false,
            "rationale": "OT was not ordered. While the patient has ADL deficits that OT could address, there is no physician order for OT. The PT evaluation may reveal OT needs, which would be the appropriate pathway for adding OT.",
            "whyTempting": "Patient has documented ADL limitations — needs help with grooming, dressing, bathing, toileting. OT is the ADL discipline. It seems obvious to add OT.",
            "failureReason": "No physician order for OT. ADL assistance is currently being provided by HHA. OT would need to be recommended through PT evaluation and ordered by the physician before inclusion on the 485.",
            "realWorldConsequence": "Adding OT without a physician order is non-compliant, and any OT visits provided before the order is obtained are unbillable — the correct pathway is recommendation through PT evaluation.",
            "trapTags": [
              "discipline-not-justified",
              "intervention-not-ordered"
            ]
          },
          {
            "id": "h-disc-e",
            "label": "Home Health Aide (HHA)",
            "isCorrect": true,
            "rationale": "HHA is ordered for ADL assistance 3x/week. Patient has documented need for assistance with bathing, toileting, and transfers. HHA must be tied to a skilled service (SN and PT qualify).",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "h-disc-f",
            "label": "Speech-Language Pathology (SLP)",
            "isCorrect": false,
            "rationale": "There is no documentation of dysphagia, communication deficit, or cognitive-linguistic impairment requiring SLP. While the patient is 74 with possible depression, there is no clinical basis for SLP on this case.",
            "whyTempting": "Some clinicians add SLP for \"cognitive assessment\" in elderly patients or for swallow evaluation in cardiac patients. This seems like thoroughness.",
            "failureReason": "No documented need, no physician order, no clinical indication. Adding SLP would be over-utilization without justification.",
            "realWorldConsequence": "Adding SLP without documented need or a physician order would result in denial of all SLP visits and demonstrates a pattern of adding unjustified disciplines that triggers broader audit review.",
            "trapTags": [
              "discipline-not-justified"
            ]
          },
          {
            "id": "h-disc-g",
            "label": "Dietary/Nutrition Counseling",
            "isCorrect": false,
            "rationale": "While the patient needs dietary guidance (sodium restriction for CHF, diabetic diet, renal diet for CKD), nutrition counseling is not a separately billable home health discipline under Medicare. Dietary teaching is incorporated into SN interventions.",
            "whyTempting": "The patient has multiple dietary requirements (CHF, DM, CKD). A dietitian referral seems clinically appropriate. \"Nutrition counseling\" appears on some care plan templates.",
            "failureReason": "Dietary/nutrition is not a home health discipline under Medicare PPS/PDGM. Dietary teaching is part of SN scope. Listing it as a separate discipline demonstrates misunderstanding of the home health benefit structure.",
            "realWorldConsequence": "Dietitian is not a Medicare home health discipline — including it demonstrates benefit structure misunderstanding and will prevent the physician from signing the 485 as written.",
            "trapTags": [
              "discipline-not-justified",
              "billing-without-documentation"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "case-2-alvarez",
    "title": "ALVAREZ CLINICAL CHALLENGE",
    "subtitle": "Maria Alvarez — Post-Surgical Orthopedic + Pain + Cognitive",
    "evidence": {
      "patientName": "Maria Alvarez",
      "age": 81,
      "gender": "Female",
      "patientHIC": "XXX-XX-XXXX-B",
      "socDate": "03/18/2026",
      "certPeriod": "03/18/2026 – 05/17/2026",
      "medicalRecordNumber": "CI-MR-00A2",
      "providerNumber": "10-7654",
      "dischargeSummary": "Discharged from St. Catherine's Medical Center 03/16/2026 after right total knee arthroplasty (TKA). Surgical course uncomplicated. Post-op day 2 patient had episode of confusion and agitation — attributed to anesthesia and resolved with reorientation. CXR negative, UA negative, no evidence of stroke. Discharge diagnoses: Status post right TKA for primary osteoarthritis, hypertension, osteoporosis, history of TIA (2024), mild cognitive impairment per PCP notes. Discharge on: oxycodone 10mg q4h PRN pain (qty 60), acetaminophen 1000mg q6h scheduled, enoxaparin 40mg SubQ daily x 14 days (DVT prophylaxis), amlodipine 5mg daily, alendronate 70mg weekly, calcium/Vitamin D. Patient lives with elderly husband (age 84, mild dementia per discharge planner). SNF recommended but patient refused — insisted on going home.",
      "physicianOrders": "Dr. Vanessa Chen — Home Health Orders (03/17/2026):\nDX: M17.11 (Primary OA right knee), Z96.651 (Presence of right artificial knee joint), M81.0 (Age-related osteoporosis without fracture), I10 (Essential HTN), G31.84 (Mild cognitive impairment)\nSN: 3W1 x 1 week, 2W2 x 3 weeks, 1W3 x 4 weeks → wound assessment, medication management, DVT monitoring, pain management\nPT: 3W1 x 2 weeks, 2W3 x 3 weeks, 1W4 x 3 weeks → progressive mobility, ROM, strengthening, stair training\nOT: 2W1 x 2 weeks, 1W3 x 6 weeks → ADL training, home safety, adaptive equipment\nHHA: 3x/week x 4 weeks → ADL assistance during recovery\nLabs: PT/INR (ERROR — patient is on enoxaparin, not warfarin)\nHomebound: Patient is homebound due to recent surgery.",
      "socNarrative": "Arrived 03/18/2026 for SOC visit. Patient sitting in recliner, right knee in immobilizer with ice. Daughter (Ana, age 55) present — took time off work for first week only. Husband (Ernesto, 84) wandering the kitchen, could not recall what day it was or why a nurse was visiting. Patient pleasant but slow to respond to questions — had to repeat orientation questions twice before correctly answering. Oriented x3 (person, place, time — could not recall current date but knew the month). Right knee surgical incision: 18cm vertical midline, staples x 24 intact, incision well-approximated, mild erythema along superior 4cm of incision, no drainage, no warmth beyond expected post-surgical. Right knee ROM: 10-55 degrees (flex/ext). Left knee ROM: 5-105 degrees. Bilateral lower extremity: no calf tenderness, negative Homan's (aware this test is unreliable), no asymmetric swelling noted but right knee diffusely swollen as expected post-op. Patient reports pain 8/10 at rest, 10/10 with movement. Taking oxycodone 10mg every 4 hours around the clock (\"Ana gives it to me on schedule\"). Patient appears sedated — drowsy, slurred speech, difficulty tracking conversation. When asked about bowels, reports no BM in 5 days. Abdomen firm, distended, diminished bowel sounds. Patient attempted stand-pivot transfer from recliner — required max assist of 2 (myself and Ana). Ambulated 8 feet to bedside commode with rolling walker, max assist x1, with prolonged rest break. Unable to navigate the 3 steps from front door to ground level. Home has narrow hallways, throw rugs throughout (Ana states she will remove them), bathroom has tub/shower combination with no grab bars, toilet standard height. Kitchen has gas stove that Ernesto has left on twice in the past month per Ana.",
      "vitals": [
        {
          "label": "Blood Pressure",
          "value": "142/78 mmHg"
        },
        {
          "label": "Heart Rate",
          "value": "68 bpm, regular"
        },
        {
          "label": "SpO2",
          "value": "96% on RA"
        },
        {
          "label": "Temperature",
          "value": "98.8°F"
        },
        {
          "label": "Respirations",
          "value": "16/min"
        },
        {
          "label": "Pain Level",
          "value": "8/10 rest, 10/10 movement",
          "alert": true
        },
        {
          "label": "Right Knee ROM",
          "value": "10-55° (goal: 0-120°)",
          "alert": true
        },
        {
          "label": "Last BM",
          "value": "5 days ago — abdomen distended",
          "alert": true
        }
      ],
      "safetyRisks": [
        {
          "description": "Husband (84, dementia) left gas stove on twice — fire risk",
          "severity": "critical"
        },
        {
          "description": "Patient appears over-sedated on oxycodone 10mg q4h ATC",
          "severity": "critical"
        },
        {
          "description": "No bowel movement x 5 days on scheduled opioid — bowel obstruction risk",
          "severity": "critical"
        },
        {
          "description": "3 steps at front door — patient cannot navigate",
          "severity": "moderate"
        },
        {
          "description": "Bathroom has no grab bars, standard toilet height, tub/shower combo",
          "severity": "moderate"
        },
        {
          "description": "Throw rugs throughout home (daughter will remove)",
          "severity": "moderate"
        },
        {
          "description": "Primary caregiver (daughter) available only 1 week",
          "severity": "moderate"
        },
        {
          "description": "Husband unable to provide reliable assistance or emergency response",
          "severity": "moderate"
        }
      ],
      "medications": [
        {
          "name": "Oxycodone",
          "dose": "10mg",
          "route": "PO",
          "frequency": "q4h PRN",
          "indication": "Post-op pain",
          "reconciliationNote": "Patient taking ATC, not PRN. Appears over-sedated. 60 tablets dispensed = 10-day supply at current use rate. No bowel protocol ordered."
        },
        {
          "name": "Acetaminophen",
          "dose": "1000mg",
          "route": "PO",
          "frequency": "q6h scheduled",
          "indication": "Pain/inflammation",
          "reconciliationNote": "Combined with oxycodone: check total daily acetaminophen if combo products used. Currently 4g/day — at max."
        },
        {
          "name": "Enoxaparin",
          "dose": "40mg",
          "route": "SubQ",
          "frequency": "Daily x 14 days",
          "indication": "DVT prophylaxis",
          "reconciliationNote": "MD ordered PT/INR labs — WRONG LAB for enoxaparin. Enoxaparin does not require INR monitoring. Should monitor anti-Xa if needed, CBC for HIT."
        },
        {
          "name": "Amlodipine",
          "dose": "5mg",
          "route": "PO",
          "frequency": "Daily",
          "indication": "HTN",
          "reconciliationNote": "BP 142/78 — borderline. Monitor."
        },
        {
          "name": "Alendronate",
          "dose": "70mg",
          "route": "PO",
          "frequency": "Weekly",
          "indication": "Osteoporosis",
          "reconciliationNote": "Must be taken upright with full glass of water, 30 min before other meds/food. Assess if patient can sit upright given knee immobilizer."
        },
        {
          "name": "Calcium + Vitamin D",
          "dose": "600mg/400IU",
          "route": "PO",
          "frequency": "BID",
          "indication": "Osteoporosis supplement",
          "reconciliationNote": "Cannot be taken within 2 hours of alendronate."
        }
      ],
      "oasisFindings": [
        {
          "item": "M1700 – Cognitive Functioning",
          "response": "1 – Requires prompting",
          "conflictNote": "Discharge attributed confusion to anesthesia. SOC shows Ox3 with date difficulty, slow responses, requires repeat questions. MCI diagnosis in orders. Cognitive presentation may be more significant than \"requires prompting.\""
        },
        {
          "item": "M1800 – Grooming",
          "response": "0 – Able to groom self independently",
          "conflictNote": "Patient is on max assist for transfers, requires 2-person assist. How is she grooming independently? OASIS appears scored based on what patient CAN do, not what she IS doing safely."
        },
        {
          "item": "M1810 – Upper Body Dressing",
          "response": "0 – Able to dress independently",
          "conflictNote": "Same conflict as grooming — patient is sedated, slow to respond, on opioids ATC. Independence scoring seems inflated."
        },
        {
          "item": "M1860 – Ambulation",
          "response": "4 – Bedfast",
          "conflictNote": "Patient DID ambulate 8 feet with max assist. \"Bedfast\" may be overscored. OASIS definition requires inability to ambulate — she did ambulate, albeit minimally."
        },
        {
          "item": "M1033 – Risk for Hospitalization",
          "response": "Two or more risk factors",
          "conflictNote": "Accurate but underscores the actual risk level — opioid sedation + constipation + age + dementia husband as caregiver + MCI = very high risk."
        },
        {
          "item": "M1242 – Frequency of Pain",
          "response": "3 – All the time",
          "conflictNote": "Consistent with patient report of 8-10/10. However, patient is also over-sedated — pain may be partially controlled but at the cost of safety."
        }
      ],
      "physicianCollaboration": "Dr. Vanessa Chen contacted 03/18/2026 at 1145. Notified of: patient taking oxycodone ATC not PRN (appears over-sedated), no BM x 5 days on scheduled opioids, cognitive findings at SOC exceeding discharge description, concerns about caregiver capacity (husband with dementia), and lab order discrepancy (PT/INR ordered but patient on enoxaparin). Dr. Chen response: \"Reduce oxycodone to 5mg q6h PRN. Start docusate 100mg BID + senna 8.6mg BID. If no BM by day 3, add MiraLAX. Correct the lab — cancel PT/INR, order CBC at day 7 and day 14 of enoxaparin. I'm aware of the MCI — it's documented in her PCP records. Keep the current plan.\"",
      "socialEnvironmental": "Lives with husband Ernesto (84) in a two-story home (bedroom is upstairs but patient set up in first-floor den during recovery). Ernesto has mild-to-moderate dementia — can perform basic self-care but cannot reliably manage medications, cooking, or emergency situations. Daughter Ana (55) is primary support — took 1 week off work (returns 03/25/2026). After Ana returns to work, patient will be home with Ernesto only during business hours. No other local family. Patient is Spanish-speaking preferred, English conversational. Medicare FFS. Retired seamstress. Active parish member — Father Miguel calls weekly. Patient refused SNF because \"I don't want to die in a facility\" — strong cultural preference for home-based care. Financial concerns: Ana reports parents are on fixed income, worried about medication costs.",
      "functionalStatus": "Prior to hospitalization: independent with all ADLs and IADLs, drove to church and grocery store weekly, managed own medications, cooked meals for herself and Ernesto. Current: requires max assist x2 for transfers, max assist x1 for ambulation with walker (8 feet only), unable to navigate 3 steps, unable to toilet independently (using bedside commode), unable to bathe, requires assistance with lower body dressing. Sedation from opioids further limits functional capacity. Right knee ROM significantly limited (10-55°) — must achieve 90° for functional sit-to-stand and 120° for normal gait pattern.",
      "mentalStatus": "Oriented x3 (could not recall date). Slow processing speed. Required repetition of questions. Pleasant, cooperative. Judgment: refused SNF, taking opioids ATC without questioning. PHQ-2: positive screening (score 3/6) — reports feeling \"useless\" and \"like a burden.\" BIMS equivalent score: approximately 11-12 (moderate impairment range). History of TIA 2024 — cognitive baseline unclear.",
      "hiddenClues": [
        "Post-op confusion attributed to anesthesia in discharge summary — but patient has pre-existing MCI diagnosis and TIA history. The confusion may not have been transient.",
        "Oxycodone 10mg q4h PRN is being taken ATC by the daughter. At 81 with MCI, this dose/frequency is excessive and contributing to sedation, fall risk, and constipation.",
        "PT/INR ordered by the physician is the WRONG lab for enoxaparin — this tests for warfarin response. Enoxaparin monitoring requires anti-Xa levels or CBC for HIT.",
        "Z96.651 (presence of artificial knee joint) cannot be used as a diagnosis — it is a status code. The current episode is surgical aftercare, which should be coded differently.",
        "OASIS M1860 scores patient as \"bedfast\" but SOC documents ambulation of 8 feet with max assist — these are contradictory.",
        "OASIS grooming and dressing scored as independent — but patient requires 2-person assist for transfers and is sedated. Independence scoring appears inflated.",
        "Alendronate must be taken sitting upright for 30 minutes — patient is in a recliner with knee immobilizer. Is she able to sit upright properly for this?",
        "PHQ-2 positive with score 3/6 — this warrants PHQ-9 follow-up but is not documented as planned.",
        "Husband left gas stove on twice — this is a safety emergency but no plan is documented for addressing it.",
        "The primary diagnosis should reflect WHY the patient is receiving home health, not just the status of the implant."
      ]
    },
    "fields": [
      {
        "id": "a-principal-dx",
        "formBoxNumber": "BOX 11",
        "label": "Principal Diagnosis",
        "type": "single-select",
        "domain": "principal-diagnosis",
        "correctAnswerIds": [
          "a-pdx-e"
        ],
        "auditNote": "For post-surgical patients, the principal diagnosis should reflect the reason for the surgery (the condition being treated) and/or surgical aftercare, NOT the presence of the implant or the status code.",
        "options": [
          {
            "id": "a-pdx-a",
            "label": "Z96.651 — Presence of right artificial knee joint",
            "isCorrect": false,
            "rationale": "Z96.651 is a status code indicating the patient HAS an artificial joint. It does not describe the current clinical condition or the reason for home health services. Status codes should not be used as the principal diagnosis for an active episode of care.",
            "whyTempting": "This is listed on the physician order. It is specific to the right knee. It clearly identifies what happened to the patient. Many clinicians see \"knee replacement\" and grab this code.",
            "failureReason": "Status codes (Z96.x) indicate a past procedure, not a current condition requiring services. Using this as the principal diagnosis would fail coding guidelines and reduce PDGM acuity classification.",
            "realWorldConsequence": "Using a status code as the principal diagnosis downgrades the PDGM clinical group, directly reducing Medicare reimbursement and triggering OASIS validation flags that may result in denial or costly documentation requests.",
            "trapTags": [
              "copy-md-order",
              "wrong-primary-focus"
            ]
          },
          {
            "id": "a-pdx-b",
            "label": "M17.11 — Primary osteoarthritis, right knee",
            "isCorrect": false,
            "rationale": "While M17.11 was the reason for the surgery, the knee has been replaced — the osteoarthritis has been surgically treated. The current home health episode is for post-surgical recovery and aftercare, not ongoing OA treatment. Using M17.11 post-TKA is inaccurate.",
            "whyTempting": "This was the surgical diagnosis. It is on the physician order. It explains why the patient had the surgery. It seems like the root cause. Many experienced clinicians use the pre-surgical diagnosis.",
            "failureReason": "The osteoarthritis in the right knee has been surgically addressed. The current episode manages the post-surgical state, not the pre-existing OA. ICD-10 coding guidelines direct coders to use aftercare codes when the surgery has been performed.",
            "realWorldConsequence": "Coding a surgically resolved pre-existing condition as current misrepresents the clinical episode — on audit, this sequencing error indicates coding non-compliance, triggering focused review and potential recoupment of the entire episode payment.",
            "trapTags": [
              "copy-md-order",
              "timing-problem"
            ]
          },
          {
            "id": "a-pdx-c",
            "label": "Z87.39 — Aftercare following other surgery on musculoskeletal system (with M17.11 as secondary explaining the reason for the surgery)",
            "isCorrect": false,
            "rationale": "Close but incorrect code. Z87.39 is for personal history, not active aftercare. The correct aftercare code for joint replacement follow-up is Z47.1 (aftercare following joint replacement surgery).",
            "whyTempting": "This answer correctly identifies that aftercare coding is needed and tries to pair it with the pre-surgical diagnosis as secondary. The logic is right — the code selection is wrong.",
            "failureReason": "Wrong Z-code. Z87 is personal history; Z47 is aftercare. This would cause claim processing issues and demonstrates coding knowledge gaps.",
            "realWorldConsequence": "Z87.39 is a personal history code, not an active aftercare code — claims submitted with this incorrect code category would be denied or rejected at the MAC level, and repeated misuse triggers targeted probe audits of the agency's coding practices.",
            "trapTags": [
              "documentation-inconsistency"
            ]
          },
          {
            "id": "a-pdx-d",
            "label": "Z47.1 — Aftercare following joint replacement surgery",
            "isCorrect": false,
            "rationale": "Z47.1 is an aftercare code appropriate for this clinical scenario. However, CMS-485 coding guidelines generally prefer the condition that most closely represents the reason for home health services. For a post-TKA patient with active wound management, pain management, and functional rehabilitation, Z47.33 (aftercare following explantation of joint prosthesis) is sometimes confused with this. Actually, the most defensible primary is the combination approach.",
            "whyTempting": "This is the correct aftercare code for joint replacement. It seems like the most technically accurate option.",
            "failureReason": "While Z47.1 is a valid aftercare code, standing alone it does not capture the full clinical picture. Best practice for PDGM is to use the surgical aftercare code but this must be paired correctly. See correct answer.",
            "realWorldConsequence": "Using Z47.1 alone without the underlying condition results in suboptimal PDGM grouping and lower reimbursement — the claim is technically payable but undervalues the episode, costing the agency revenue while failing to reflect musculoskeletal complexity.",
            "trapTags": []
          },
          {
            "id": "a-pdx-e",
            "label": "M17.11 — Primary osteoarthritis right knee, as the condition treated by the surgery, with Z47.1 as secondary aftercare code",
            "isCorrect": true,
            "rationale": "Per ICD-10 coding guidelines and CMS HH PPS guidance, for post-surgical patients, the principal diagnosis can be the underlying condition (M17.11) with the aftercare code (Z47.1) as secondary, OR vice versa — depending on the focus of care. For this patient where the home health episode is managing post-surgical recovery (wound, pain, mobility), using M17.11 as principal with Z47.1 as secondary is defensible because M17.11 maps to a better PDGM clinical group and reflects the musculoskeletal condition driving PT, the primary service. The key is that BOTH codes appear on the 485.",
            "whyTempting": "N/A — correct answer. Note: this requires understanding that post-surgical coding in home health follows specific sequencing rules where the underlying condition often remains primary.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-pdx-f",
            "label": "G31.84 — Mild cognitive impairment",
            "isCorrect": false,
            "rationale": "MCI is documented but is not the reason for home health admission. The patient was referred for post-TKA recovery. MCI is a comorbidity that complicates the episode, not the primary reason for services.",
            "whyTempting": "The cognitive findings at SOC are concerning and could be argued as the patient's most significant barrier to recovery. Clinicians who focus on the \"biggest problem\" rather than the \"reason for admission\" may select this.",
            "failureReason": "MCI is a comorbidity. The referral source and reason for admission is the TKA. Using MCI as the primary diagnosis misrepresents the episode and would not align with the surgical history driving the current services.",
            "realWorldConsequence": "Listing MCI as the principal diagnosis misrepresents the reason for home health admission — an auditor would find the referral was for post-TKA recovery, creating a mismatch that could result in episode denial and potential OIG referral for upcoding.",
            "trapTags": [
              "wrong-primary-focus"
            ]
          },
          {
            "id": "a-pdx-g",
            "label": "T81.4XXA — Infection following a procedure, initial encounter",
            "isCorrect": false,
            "rationale": "There is NO documented infection. The SOC describes \"mild erythema along superior 4cm of incision\" which is expected post-surgical inflammation, not infection. Coding infection without documentation of infection (culture, clinical diagnosis, antibiotic treatment) is fraudulent.",
            "whyTempting": "The erythema along the incision could be interpreted as early infection. Some clinicians over-code to \"capture acuity.\" Post-surgical wound complications add complexity.",
            "failureReason": "Coding an infection that is not diagnosed is a compliance violation that could trigger fraud investigation. Erythema alone does not constitute infection. This is a billing-without-documentation trap.",
            "realWorldConsequence": "Coding a surgical infection that is not diagnosed constitutes billing fraud — this triggers immediate compliance review, potential False Claims Act liability, civil monetary penalties, and possible exclusion from Medicare programs.",
            "trapTags": [
              "clinically-true-unsupported",
              "billing-without-documentation"
            ]
          }
        ]
      },
      {
        "id": "a-secondary-dx",
        "formBoxNumber": "BOX 12",
        "label": "Other Pertinent Diagnoses",
        "type": "multi-select",
        "domain": "secondary-diagnoses",
        "correctAnswerIds": [
          "a-sdx-a",
          "a-sdx-c",
          "a-sdx-d",
          "a-sdx-f"
        ],
        "auditNote": "Secondary diagnoses must be documented, relevant to the plan of care, and coded correctly.",
        "options": [
          {
            "id": "a-sdx-a",
            "label": "Z47.1 — Aftercare following joint replacement surgery",
            "isCorrect": true,
            "rationale": "Paired with M17.11 as principal, Z47.1 captures the post-surgical nature of the episode.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-sdx-b",
            "label": "Z96.651 — Presence of right artificial knee joint",
            "isCorrect": false,
            "rationale": "Status code that adds no clinical value when Z47.1 aftercare is already listed. Redundant and does not drive any service or explain complexity.",
            "whyTempting": "It is on the physician order. Seems informative. Many clinicians reflexively include it.",
            "failureReason": "Redundant with Z47.1. Status codes do not explain clinical complexity or drive services. Clutters the 485 without benefit.",
            "realWorldConsequence": "Listing a redundant status code alongside the aftercare code adds no value and signals copy-paste coding habits — auditors will scrutinize the entire 485 more closely when they see unnecessary code duplication.",
            "trapTags": [
              "copy-md-order",
              "clinically-true-unsupported"
            ]
          },
          {
            "id": "a-sdx-c",
            "label": "G31.84 — Mild cognitive impairment, so stated",
            "isCorrect": true,
            "rationale": "MCI is documented by the PCP, confirmed by SOC assessment findings (Ox3 not x4, slow processing, requires repetition). It directly impacts safety, medication management, and recovery capacity. Relevant to the plan of care.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-sdx-d",
            "label": "M81.0 — Age-related osteoporosis without current pathological fracture",
            "isCorrect": true,
            "rationale": "Documented, relevant (fall risk, explains alendronate order, impacts PT progression and weight-bearing decisions).",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-sdx-e",
            "label": "F32.A — Depression, unspecified (based on positive PHQ-2)",
            "isCorrect": false,
            "rationale": "PHQ-2 is a screening tool, not a diagnostic instrument. A positive PHQ-2 screen warrants PHQ-9 follow-up and physician evaluation. No provider has diagnosed depression. Coding depression based on a screening score alone is non-compliant.",
            "whyTempting": "PHQ-2 score of 3/6 is positive. Patient says she feels \"useless\" and \"like a burden.\" It seems compassionate and accurate to capture depression.",
            "failureReason": "Screening is not diagnosis. If the PHQ-9 confirms and a provider diagnoses depression, THEN it can be coded. Premature coding of undiagnosed conditions is a compliance violation.",
            "realWorldConsequence": "Coding depression from a screening tool alone violates ICD-10 guidelines requiring provider-confirmed diagnosis — this compliance violation could result in claim denial, recoupment, and evidence of a pattern of coding unconfirmed diagnoses.",
            "trapTags": [
              "clinically-true-unsupported",
              "billing-without-documentation"
            ]
          },
          {
            "id": "a-sdx-f",
            "label": "I10 — Essential hypertension",
            "isCorrect": true,
            "rationale": "Documented, on antihypertensive medication, BP 142/78 at SOC (borderline). Relevant to medication management and monitoring. In this case, unlike Henderson (where CHF/CKD/DM already captured the cardiovascular picture), HTN here adds unique clinical information — it is the patient's only cardiovascular diagnosis and explains the amlodipine order.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-sdx-g",
            "label": "Z86.73 — Personal history of TIA",
            "isCorrect": false,
            "rationale": "While TIA history is documented and clinically relevant (especially given the cognitive findings), Z86.73 is a personal history code. History codes are generally not listed on the 485 unless they directly impact the current plan of care. The MCI diagnosis (G31.84) already captures the cognitive concern.",
            "whyTempting": "TIA history is important context. It explains the cognitive baseline concern. It seems medically relevant. Many clinicians include history codes reflexively.",
            "failureReason": "History codes add length without driving services or explaining current clinical needs. MCI already captures the relevant cognitive impact. An auditor would question what service or clinical decision is driven by the TIA history code that is not already covered by MCI.",
            "realWorldConsequence": "Including unnecessary history codes inflates the diagnosis list without supporting medical necessity — auditors will question whether the agency habitually pads diagnosis lists to appear more complex, a hallmark of upcoding.",
            "trapTags": [
              "clinically-true-unsupported"
            ]
          },
          {
            "id": "a-sdx-h",
            "label": "K59.00 — Constipation, unspecified",
            "isCorrect": false,
            "rationale": "While the patient has not had a BM in 5 days and has clinical signs of constipation, this is a secondary effect of opioid use — not a diagnosed condition on the medical record. The physician has ordered a bowel protocol in response to the SN notification. Opioid-induced constipation could be coded if diagnosed, but at the time of 485 completion, no provider has made this diagnosis.",
            "whyTempting": "The constipation is real, documented, and dangerous. It seems important to capture. The physician even ordered treatment for it.",
            "failureReason": "The physician ordered treatment but did not add a diagnosis. At the time of 485 completion, constipation is a clinical finding being managed, not a coded diagnosis. The bowel management is captured in SN interventions, not in the diagnosis list.",
            "realWorldConsequence": "Coding a condition the physician has not formally diagnosed violates coding principles — absence of a physician-documented diagnosis results in claim adjustment and potential compliance action on audit.",
            "trapTags": [
              "clinically-true-unsupported",
              "billing-without-documentation"
            ]
          }
        ]
      },
      {
        "id": "a-homebound",
        "formBoxNumber": "BOX 13",
        "label": "Homebound Status Narrative",
        "type": "single-select",
        "domain": "homebound-status",
        "correctAnswerIds": [
          "a-hb-d"
        ],
        "auditNote": "Post-surgical homebound status must describe why leaving home requires considerable and taxing effort, tied to the specific surgical and medical limitations observed at the time of assessment.",
        "options": [
          {
            "id": "a-hb-a",
            "label": "Patient is homebound due to recent surgery.",
            "isCorrect": false,
            "rationale": "Copy of physician order language. No functional detail. No CMS-required language. Would fail any audit.",
            "whyTempting": "Physician said it. Surgery just happened. It seems obvious.",
            "failureReason": "Does not meet CMS homebound documentation standards. No description of effort, functional limitation, or specific impact of the surgical recovery on mobility.",
            "realWorldConsequence": "This one-sentence statement fails CMS homebound criteria entirely — the entire episode would be denied because homebound status is a prerequisite for Medicare home health eligibility, potentially resulting in tens of thousands in recoupment.",
            "trapTags": [
              "copy-md-order",
              "homebound-language-fail"
            ]
          },
          {
            "id": "a-hb-b",
            "label": "Patient is homebound due to right TKA with limited ROM, pain, and need for assistive device. Patient cannot drive and requires assistance to leave home. Absences are for medical appointments only.",
            "isCorrect": false,
            "rationale": "Better than the physician copy but still lacks specific clinical evidence from the SOC assessment. Does not describe WHAT happens when the patient attempts to leave. No mention of the 3 steps at the front door which is a critical barrier. \"Cannot drive\" is not a homebound criterion.",
            "whyTempting": "Mentions the surgery, ROM limitation, pain, and assistive device. Includes the medical appointments caveat. Sounds individualized.",
            "failureReason": "Lacks specificity from the actual SOC assessment. Does not describe \"considerable and taxing effort\" with supporting evidence. Missing critical barrier (steps). An auditor would find this generic.",
            "realWorldConsequence": "Generic homebound documentation without specific SOC findings is the leading cause of homebound denials on audit — the claim would be denied for insufficient documentation, and the agency has no clinical specifics to cite on appeal.",
            "trapTags": [
              "homebound-language-fail"
            ]
          },
          {
            "id": "a-hb-c",
            "label": "Patient is essentially bedfast following right TKA. Cannot leave bed without maximum assistance of two people. Unable to leave the home under any circumstances. Will remain homebound throughout the certification period.",
            "isCorrect": false,
            "rationale": "The patient is NOT bedfast — she ambulated 8 feet with max assist x1. \"Cannot leave bed without max assist of two\" overstates (the SOC narrative documents max assist x2 for stand-pivot from recliner, not from bed). \"Unable to leave under any circumstances\" and \"will remain homebound throughout certification\" are absolute statements that create audit risk.",
            "whyTempting": "The strongest possible homebound statement. Seems like it would convince any auditor. Clinicians who believe \"more restrictive = more defensible\" will select this.",
            "failureReason": "Overstating homebound status is a compliance risk. If any documentation contradicts (the patient DID ambulate 8 feet), the entire homebound claim is weakened. Also inaccurately claims the patient will be homebound the ENTIRE cert period — she is expected to improve with PT.",
            "realWorldConsequence": "Overstated homebound documentation that contradicts the clinical record (patient ambulated 8 feet but documented as \"bedfast\") destroys chart credibility — an auditor would flag this as fraudulent documentation, triggering a full agency audit.",
            "trapTags": [
              "homebound-language-fail",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "a-hb-d",
            "label": "Leaving home requires considerable and taxing effort. Patient is 2 days post right TKA with right knee ROM 10-55°, right knee immobilizer in place, requiring max assist x2 for stand-pivot transfer and max assist x1 for ambulation (8 feet only with rolling walker before requiring rest). Unable to navigate the 3 exterior steps from front door to ground level. Pain 8-10/10 significantly limits activity tolerance and endurance. Additionally, mild cognitive impairment affects safe independent community navigation. Absences from home are infrequent, short duration, and require considerable and taxing effort.",
            "isCorrect": true,
            "rationale": "Uses CMS-required language with specific clinical evidence from SOC. ROM measurements, assist levels, distance, and barriers are all documented findings. Acknowledges cognitive factor. Does not overstate. Audit-proof.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-hb-e",
            "label": "Leaving home requires considerable and taxing effort due to post-operative pain, limited mobility requiring assistive device, fall risk due to opioid sedation, and inability to safely navigate home exit. Patient has dementia and cannot leave home independently. Primary caregiver is only available 1 week.",
            "isCorrect": false,
            "rationale": "Contains errors: the patient has MCI, not dementia — overstating cognitive impairment creates documentation inconsistency. Caregiver availability is not a homebound criterion. Opioid sedation as a homebound factor implies the medication itself causes the limitation — but if the opioid is adjusted (which it was), this factor disappears, potentially invalidating the homebound status.",
            "whyTempting": "Includes the CMS language. Mentions multiple real factors. Seems comprehensive. Addresses safety concerns.",
            "failureReason": "Mischaracterizes MCI as dementia (documentation inconsistency). Uses temporary factors (opioid sedation, caregiver availability) that weaken long-term homebound justification. An auditor would note the dementia claim contradicts the documented G31.84 MCI diagnosis.",
            "realWorldConsequence": "Mischaracterizing MCI as \"dementia\" is a material documentation inconsistency that could have legal consequences in malpractice or guardianship proceedings, and using temporary factors weakens long-term homebound justification.",
            "trapTags": [
              "homebound-language-fail",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "a-hb-f",
            "label": "Patient meets homebound criteria. She had knee replacement surgery two days ago and requires physical therapy at home because she cannot travel to outpatient PT. She uses a walker and needs help from her daughter to move around the house.",
            "isCorrect": false,
            "rationale": "Frames homebound status around the inability to attend outpatient PT — this is a convenience/service delivery argument, not a homebound status documentation. CMS homebound criteria are about the effort to leave home, not about where therapy is delivered. Also does not use required \"considerable and taxing effort\" language.",
            "whyTempting": "Sounds practical and true. The patient genuinely cannot get to outpatient. Connecting homebound to the need for home-based services seems logical.",
            "failureReason": "CMS homebound criteria are independent of service delivery. A patient could be homebound and still attend outpatient. A patient could be non-homebound and still choose home health. Framing homebound around \"cannot travel to outpatient\" is a fundamental misunderstanding of the criteria and fails audit.",
            "realWorldConsequence": "Framing homebound status around inability to access outpatient services demonstrates a fundamental misunderstanding of Medicare criteria — CMS explicitly states homebound is about the effort to leave home, not service delivery location.",
            "trapTags": [
              "homebound-language-fail"
            ]
          },
          {
            "id": "a-hb-g",
            "label": "Leaving home requires considerable and taxing effort due to right knee immobilizer limiting safe weight-bearing and gait, post-operative pain 8-10/10, and severe deconditioning. Patient was assessed as needing max assist of two persons for transfer and max assist of one for ambulation of only 8 feet. She has difficulty with balance and endurance. Patient uses a rolling walker. Home has 3 exterior steps she cannot currently negotiate. Her husband has dementia and cannot assist with mobility. Absences from home are infrequent and of short duration.",
            "isCorrect": false,
            "rationale": "Very close to the correct answer and well-written. However, it states the husband \"has dementia\" — the documented diagnosis is mild-to-moderate dementia per the discharge planner's report, but the PATIENT's diagnosis is MCI, not dementia. More critically, this option omits the patient's own cognitive factor (MCI) as a homebound contributor while mentioning the husband's dementia. The husband's condition is relevant to caregiver capacity but is not a direct factor in the PATIENT's homebound status. Also, \"difficulty with balance\" is not specifically documented in the SOC narrative — the documented finding is deconditioning and dyspnea/dizziness were NOT noted for this patient (those were Henderson's findings).",
            "whyTempting": "Extremely well-crafted. Uses CMS language. Has specific measurements. Mentions the steps barrier. Seems comprehensive and defensible. Would fool most clinicians.",
            "failureReason": "Attributes the husband's condition to the patient's homebound justification (caregiver limitations are not homebound criteria for the PATIENT). Claims \"difficulty with balance\" not documented in this SOC. Omits the patient's own MCI as a homebound factor. Under very close audit scrutiny, the imprecision matters.",
            "realWorldConsequence": "Including undocumented clinical findings and conflating the husband's condition with the patient's homebound status creates audit-vulnerable documentation — unsupported claims result in partial or full denial under ADR review.",
            "trapTags": [
              "documentation-inconsistency",
              "homebound-language-fail"
            ]
          }
        ]
      },
      {
        "id": "a-skilled-need",
        "formBoxNumber": "BOX 18",
        "label": "Skilled Nursing Orders / Skilled Need",
        "type": "single-select",
        "domain": "skilled-need",
        "correctAnswerIds": [
          "a-sn-e"
        ],
        "auditNote": "For a post-surgical patient, skilled need must address wound monitoring, medication management (especially high-risk medications), safety assessment in the context of cognitive and caregiver limitations, and care coordination. Each service must independently require the skills of a licensed nurse.",
        "options": [
          {
            "id": "a-sn-a",
            "label": "SN for wound assessment, medication management, DVT monitoring, and pain management per physician order.",
            "isCorrect": false,
            "rationale": "Direct copy of the physician order. Does not describe what makes these services skilled or what specific clinical findings drive them. \"Per physician order\" defers to the MD without independent nursing assessment.",
            "whyTempting": "Matches the MD order word-for-word. Covers all major areas. Seems comprehensive.",
            "failureReason": "Lacks specificity required for skilled need documentation. \"Wound assessment\" — what about the wound requires skilled assessment? \"DVT monitoring\" — what specifically? \"Pain management\" — what makes it skilled? An auditor would find this boilerplate.",
            "realWorldConsequence": "Boilerplate skilled need documentation without specifics fails to establish medical necessity — SN visit claims would be denied because the documentation does not demonstrate why a licensed nurse was required.",
            "trapTags": [
              "copy-md-order",
              "skilled-illusion"
            ]
          },
          {
            "id": "a-sn-b",
            "label": "SN for: surgical site monitoring and staple removal; teaching patient self-injection technique for enoxaparin; monitoring for DVT signs and symptoms; pain medication titration coordination with MD; bowel management protocol; medication management for 6+ medications; safety assessment of home environment given cognitive limitations of patient and spouse.",
            "isCorrect": false,
            "rationale": "Contains a critical error: \"teaching patient self-injection technique for enoxaparin.\" The patient has MCI, slow processing speed, and requires repetition of questions. Teaching an 81-year-old with MCI to self-inject is unrealistic — the daughter is administering medications. Additionally, the daughter leaves in one week. Who will give the enoxaparin injections after that? This skilled need fails to address the real enoxaparin administration challenge.",
            "whyTempting": "Detailed and specific. Covers wound, DVT, pain, bowels, meds, and safety. Teaching self-injection sounds like an appropriate skilled nursing goal. Most of the content is correct.",
            "failureReason": "The self-injection teaching plan is not realistic given the documented MCI. The plan does not address the actual barrier: who will administer enoxaparin after the daughter returns to work in 5 days? This demonstrates planning that looks thorough but fails under clinical scrutiny.",
            "realWorldConsequence": "Planning self-injection teaching for a patient with documented MCI who cannot reliably answer orientation questions is a patient safety failure — if the patient self-injects incorrectly, the agency faces malpractice liability.",
            "trapTags": [
              "skilled-illusion",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "a-sn-c",
            "label": "SN for: observation of surgical incision weekly; reminding patient to take medications on time; checking legs for swelling; making sure patient is doing PT exercises; assessing pain level each visit; reporting findings to physician.",
            "isCorrect": false,
            "rationale": "Almost entirely non-skilled tasks: \"observation\" without assessment criteria, \"reminding\" is not skilled, \"checking legs for swelling\" without skilled assessment criteria, \"making sure patient is doing exercises\" is supervision not skilled care, \"assessing pain level\" at this basic level does not require a nurse. \"Reporting findings\" is a task, not a service.",
            "whyTempting": "These are real things nurses do. They sound helpful and patient-focused. Each item seems reasonable.",
            "failureReason": "None of these rise to the level of skilled nursing. An HHA or family member could remind about medications, check for visible swelling, observe a wound, and ask about pain. Skilled nursing requires tasks that only a licensed nurse can perform.",
            "realWorldConsequence": "Billing skilled nursing rates for non-skilled tasks (observation, reminders, checking for swelling) constitutes Medicare waste — every SN visit billed under this justification would be denied and recouped with potential penalties.",
            "trapTags": [
              "skilled-illusion",
              "intervention-not-skilled"
            ]
          },
          {
            "id": "a-sn-d",
            "label": "SN for: post-operative wound assessment and management including surgical site monitoring for infection signs (erythema progression, drainage, warmth, dehiscence), staple care and timeline for removal coordination with surgeon; complex medication management including opioid conversion from oxycodone 10mg ATC to reduced PRN regimen, bowel protocol initiation and monitoring, enoxaparin administration and DVT assessment (Homan's sign, calf circumference measurement, bilateral LE comparison), and high-risk medication interactions; patient and caregiver education on post-surgical recovery, fall prevention, DVT signs, and when to seek emergency care.",
            "isCorrect": false,
            "rationale": "Clinically strong content but includes \"Homan's sign\" as a skilled assessment — the SOC narrative explicitly notes Homan's test is unreliable. Including an unreliable assessment tool as a skilled intervention demonstrates non-evidence-based practice. Also, this plan does not address the critical issue of who administers enoxaparin SubQ injections after the daughter returns to work, and does not address the cognitive and safety assessment needs.",
            "whyTempting": "Very detailed, clinically specific, addresses the medication changes from the physician callback. Sounds like excellent nursing care.",
            "failureReason": "Reliance on an unreliable assessment tool (Homan's) as a documented skilled intervention is defensible as a criticism under current evidence. More critically, fails to address the enoxaparin administration gap and the cognitive/safety components that are heavily documented in the SOC.",
            "realWorldConsequence": "Relying on clinically unreliable Homan's sign and failing to plan for enoxaparin administration after caregiver leaves creates preventable DVT/PE risk — a resulting thromboembolic event would be considered negligent care.",
            "trapTags": [
              "documentation-inconsistency",
              "missing-critical-intervention"
            ]
          },
          {
            "id": "a-sn-e",
            "label": "SN for: (1) Post-operative surgical wound assessment — monitor 18cm TKA incision with 24 staples for signs of infection (currently: mild erythema superior 4cm to be trended), healing progression, and staple removal per surgeon timeline; (2) Complex medication management including opioid titration (transition from oxycodone 10mg q4h ATC to physician-ordered 5mg q6h PRN with monitoring for withdrawal, pain control adequacy, and sedation resolution), bowel protocol management (docusate + senna, escalation to MiraLAX if no BM by day 3), enoxaparin 40mg SubQ daily administration and/or teaching reliable caregiver (assess daughter's ability, develop plan for post-week-1 administration including potential daily SN visit for injection or caregiver identification), and medication reconciliation for 6 medications with attention to alendronate administration requirements; (3) DVT surveillance — bilateral lower extremity assessment including calf circumference measurement, skin color/temperature comparison, and symptom monitoring; labs: CBC day 7 and day 14 of enoxaparin per MD; (4) Cognitive and safety assessment — ongoing monitoring of MCI status, functional impact assessment, PHQ-9 completion for positive PHQ-2 screening, caregiver capacity evaluation (husband with dementia as sole caregiver after week 1), and home safety follow-up (gas stove safety plan).",
            "isCorrect": true,
            "rationale": "Addresses every documented clinical need with specificity. Identifies the enoxaparin administration gap and proposes a realistic plan. Correctly identifies the opioid transition protocol. Includes bowel management. Addresses cognitive assessment need. Notes the safety concerns. Uses evidence-based DVT assessment (calf circumference, not Homan's). Identifies the correct labs (CBC, not INR). Comprehensively defensible under audit.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-sn-f",
            "label": "SN for post-surgical assessment and care coordination. Patient is complex with multiple comorbidities including cognitive impairment. Skilled nursing is needed to monitor recovery, manage medications, and prevent complications. Coordination with PT, OT, and physician required.",
            "isCorrect": false,
            "rationale": "Pure generality. No specific skilled tasks described. No specific clinical findings referenced. \"Post-surgical assessment and care coordination\" could describe any post-surgical patient. An auditor cannot determine what the nurse will actually DO.",
            "whyTempting": "Sounds professional and appropriately broad. Mentions complexity and multiple comorbidities. Highlights coordination role.",
            "failureReason": "Fails the specificity test entirely. CMS requires description of specific skilled services, not general statements about complexity. This would not support billable visits.",
            "realWorldConsequence": "Completely generic skilled need statements fail CMS medical necessity requirements — all SN visits would be denied on audit, potentially meaning $3,000-$5,000+ in recouped payments per patient.",
            "trapTags": [
              "skilled-illusion",
              "vague-goal"
            ]
          },
          {
            "id": "a-sn-g",
            "label": "SN for: administration of IV antibiotics for suspected surgical wound infection; daily wound packing and negative pressure wound therapy management; administration of enoxaparin via indwelling catheter; cognitive behavioral therapy for post-surgical depression.",
            "isCorrect": false,
            "rationale": "Every item is fabricated: there is no wound infection (only mild erythema), no wound packing needed (incision is closed with staples), no NPWT ordered, enoxaparin is SubQ not IV, and there is no diagnosed depression or CBT order. This represents clinical exaggeration or fabrication.",
            "whyTempting": "Every item IS a genuinely skilled service. Clinicians who think about what COULD be needed rather than what IS documented and ordered may be attracted to the intensity of this plan.",
            "failureReason": "None of these services are ordered, indicated, or supported by the documentation. Listing them is a compliance violation that could trigger fraud review.",
            "realWorldConsequence": "Documenting and billing for fabricated services (no infection, no wound packing, no NPWT, no IV access, no depression diagnosis) constitutes healthcare fraud under the False Claims Act, with potential criminal prosecution and program exclusion.",
            "trapTags": [
              "intervention-not-ordered",
              "billing-without-documentation",
              "documentation-inconsistency"
            ]
          }
        ]
      },
      {
        "id": "a-visit-freq",
        "formBoxNumber": "BOX 21",
        "label": "Visit Frequency",
        "type": "single-select",
        "domain": "visit-frequency",
        "correctAnswerIds": [
          "a-vf-d"
        ],
        "auditNote": "Post-surgical visit frequency must reflect the staged recovery: higher frequency early (wound monitoring, medication transitions, complication risk) tapering as the patient stabilizes and gains independence. Each discipline's frequency must be independently defensible.",
        "options": [
          {
            "id": "a-vf-a",
            "label": "SN 3W1 x 1 wk, 2W2 x 3 wks, 1W3 x 4 wks. PT 3W1 x 2 wks, 2W3 x 3 wks, 1W4 x 3 wks. OT 2W1 x 2 wks, 1W3 x 6 wks. HHA 3x/wk x 4 wks.",
            "isCorrect": false,
            "rationale": "This is a direct copy of the physician order. However, it does not account for the SOC findings that change the picture: the opioid issue requiring more frequent SN monitoring during titration, the enoxaparin injection need after daughter leaves (may require daily SN), and the cognitive/safety concerns requiring closer follow-up.",
            "whyTempting": "Matches the doctor's order exactly. Has appropriate taper. Covers all four disciplines. Seems reasonable for a post-TKA patient.",
            "failureReason": "Does not reflect the escalated acuity found at SOC. The opioid transition, enoxaparin gap, and cognitive concerns discovered at SOC warrant frequency adjustment. Copying the pre-SOC order when the SOC reveals new information is clinically negligent.",
            "realWorldConsequence": "Using pre-SOC frequencies when the SOC revealed critical new findings constitutes clinical negligence — if the patient suffers a preventable complication during a visit gap, the agency is liable for failing to adjust the care plan.",
            "trapTags": [
              "copy-md-order",
              "frequency-mismatch"
            ]
          },
          {
            "id": "a-vf-b",
            "label": "SN daily x 14 days (for enoxaparin administration), then 2W3 x 2 wks, 1W4 x 4 wks. PT 3W1 x 2 wks, 2W3 x 3 wks, 1W4 x 3 wks. OT 2W1 x 2 wks, 1W3 x 6 wks. HHA 3x/wk x 4 wks.",
            "isCorrect": false,
            "rationale": "SN daily x 14 days solely for enoxaparin injection is excessive and single-purpose. While the enoxaparin administration gap is real, the solution should not be 14 daily SN visits just for an injection. The cost-effective and clinically appropriate approach is to assess whether a reliable caregiver can be taught (daughter for week 1, then identify alternate), and only add daily SN if no caregiver is available. Also, this plan assumes the daughter cannot learn to give injections during week 1.",
            "whyTempting": "Directly addresses the enoxaparin gap. Daily visits seem necessary if no one else can give the injection. Shows clinical awareness of the problem.",
            "failureReason": "Over-utilization. Medicare would question 14 daily SN visits when caregiver teaching is a standard alternative. The plan should first attempt to train a caregiver and only default to daily SN as the last resort. Also, this frequency would not be approved without strong justification for why teaching failed.",
            "realWorldConsequence": "Fourteen consecutive daily SN visits solely for injection administration would be flagged as over-utilization, triggering Targeted Probe and Educate review, claim denials, and potential UPIC fraud referral.",
            "trapTags": [
              "frequency-mismatch"
            ]
          },
          {
            "id": "a-vf-c",
            "label": "SN 2W1 x 2 wks, 1W3 x 6 wks. PT 2W1 x 2 wks, 1W3 x 6 wks. OT 1W1 x 8 wks. HHA 2x/wk x 4 wks.",
            "isCorrect": false,
            "rationale": "Significantly undertreats across all disciplines. SN 2x/week in week 1 for a patient transitioning off high-dose opioids, needing daily enoxaparin management, and with cognitive/safety concerns is insufficient. PT 2x/week after TKA is below standard of care for early post-op rehab. OT 1x/week will not achieve ADL independence goals.",
            "whyTempting": "Conservative, avoids over-utilization flags. Seems sustainable. Some clinicians practice \"less is more\" to avoid audit scrutiny.",
            "failureReason": "Under-treatment creates clinical negligence risk. Post-TKA standard of care requires more intensive PT in early weeks. SN frequency does not support the medication management complexity at SOC.",
            "realWorldConsequence": "Under-treating a complex post-surgical patient creates direct patient safety risk — if ROM is lost due to insufficient PT or DVT develops between infrequent SN visits, the agency faces malpractice claims for failing to meet standard of care.",
            "trapTags": [
              "frequency-mismatch"
            ]
          },
          {
            "id": "a-vf-d",
            "label": "SN 4W1 x 1 wk (medication transition, bowel protocol, wound monitoring, enoxaparin teaching/administration, safety assessment), 3W2 x 1 wk (continued enoxaparin management — assess if caregiver trained or if daily SN needed through day 14), 2W3 x 2 wks, 1W4 x 4 wks. PT 3W1 x 2 wks, 2W3 x 3 wks, 1W4 x 3 wks. OT 2W1 x 2 wks, 1W3 x 4 wks, then reassess. HHA 3x/wk x 4 wks, reassess based on functional progress.",
            "isCorrect": true,
            "rationale": "Front-loaded SN to address all SOC findings: opioid transition monitoring, bowel management, enoxaparin administration/teaching, wound care, and safety assessment. Week 2 SN at 3x/wk addresses the enoxaparin gap with a decision point (teach caregiver vs. add daily SN). Appropriate taper. PT matches standard of care for post-TKA. OT includes reassessment point. HHA tied to functional progress. Clinical rationale embedded in the frequency description. Audit-defensible.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-vf-e",
            "label": "SN 3W1 x 2 wks, 2W3 x 2 wks, 1W5 x 4 wks. PT 5W1 x 1 wk, 3W2 x 2 wks, 2W3 x 2 wks, 1W4 x 3 wks. OT 3W1 x 1 wk, 2W2 x 2 wks, 1W3 x 5 wks. HHA 5x/wk x 2 wks, 3x/wk x 6 wks.",
            "isCorrect": false,
            "rationale": "PT at 5x/week in week 1 is aggressive for a patient 2 days post-TKA who is on opioids and showed sedation at SOC. Standard of care is 3x/week post-TKA for home health. OT 3x/week in week 1 exceeds typical need. HHA 5x/week without documented daily ADL need is over-utilization. SN frequency does not reflect the escalated acuity at SOC — it matches the original MD order.",
            "whyTempting": "Intensive PT seems appropriate for TKA recovery. High initial frequencies show urgency. Comprehensive coverage across disciplines.",
            "failureReason": "PT 5x/wk would trigger utilization review. OT 3x/wk is excessive. HHA 5x/wk not supported. Meanwhile SN is NOT increased despite the SOC findings — the clinical prioritization is inverted.",
            "realWorldConsequence": "PT at 5x/week triggers automatic utilization review and likely denial, while failing to increase SN despite opioid toxicity and constipation demonstrates inverted clinical priorities with direct patient safety implications.",
            "trapTags": [
              "frequency-mismatch",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "a-vf-f",
            "label": "SN 3W1 x 2 wks, 2W3 x 2 wks, 1W5 x 4 wks. PT 3W1 x 2 wks, 2W3 x 3 wks, 1W4 x 3 wks. No OT — PT will address ADLs. HHA 3x/wk x 4 wks.",
            "isCorrect": false,
            "rationale": "Eliminates OT and states \"PT will address ADLs.\" PT and OT have distinct scopes: PT addresses mobility, strength, and gait; OT addresses functional independence in ADLs, adaptive equipment, and home modification. Stating \"PT will address ADLs\" reflects a misunderstanding of discipline scope. OT is ordered and has documented need.",
            "whyTempting": "Seems efficient — why have two rehab disciplines when one can do it? PT and OT overlap in many agencies. Eliminates a discipline to simplify.",
            "failureReason": "Removing an ordered discipline without clinical justification and physician agreement is non-compliant. PT cannot replace OT scope. The patient has documented ADL needs that OT specifically addresses.",
            "realWorldConsequence": "Unilaterally removing a physician-ordered discipline is a compliance violation — the physician may refuse to sign, and the patient is denied medically necessary OT services, creating liability for deviating from the ordered plan.",
            "trapTags": [
              "discipline-not-justified",
              "scope-mismatch"
            ]
          },
          {
            "id": "a-vf-g",
            "label": "SN PRN for wound checks and medication issues. PT 3W1 x 2 wks, 2W3 x 3 wks, 1W4 x 3 wks. OT 2W1 x 2 wks, 1W3 x 6 wks. HHA 3x/wk x 4 wks.",
            "isCorrect": false,
            "rationale": "\"SN PRN\" is not an acceptable frequency for a home health plan of care. CMS requires specific visit frequency. PRN visits cannot be the primary SN frequency — they can only supplement a scheduled frequency. This would not be certifiable.",
            "whyTempting": "Allows flexibility. Some clinicians think PRN is more efficient. PT and OT frequencies are reasonable.",
            "failureReason": "The 485 requires specific SN visit frequency. PRN alone is not certifiable. This plan of care would be denied at face-to-face certification.",
            "realWorldConsequence": "\"SN PRN\" is not a certifiable frequency — the 485 will be rejected, no services can be billed, and the face-to-face encounter requirement cannot be met, resulting in administrative denial of the entire episode.",
            "trapTags": [
              "frequency-mismatch",
              "documentation-inconsistency"
            ]
          }
        ]
      },
      {
        "id": "a-goals",
        "formBoxNumber": "BOX 22",
        "label": "Goals / Rehabilitation Potential",
        "type": "single-select",
        "domain": "goals",
        "correctAnswerIds": [
          "a-gl-d"
        ],
        "auditNote": "Post-surgical goals must reflect realistic, measurable outcomes tied to the surgical recovery, comorbidities, and documented barriers. ROM targets, functional milestones, and safety benchmarks should be specific and time-bound.",
        "options": [
          {
            "id": "a-gl-a",
            "label": "Patient will recover from knee surgery and return to prior level of function within the certification period. Rehab potential: Excellent — patient was previously independent.",
            "isCorrect": false,
            "rationale": "\"Return to prior level of function\" is unrealistic at 81 with MCI. \"Excellent\" rehab potential ignores documented barriers (MCI, opioid issues, caregiver limitations, pain). Non-measurable.",
            "whyTempting": "Sounds optimistic and patient-centered. Prior independence is documented. \"Full recovery\" is what families want to hear.",
            "failureReason": "Unrealistic goal + non-measurable + overly optimistic rehab potential. An auditor would find no way to assess whether this goal was met.",
            "realWorldConsequence": "Non-measurable goals make it impossible to demonstrate patient progress for recertification — the agency cannot show measurable improvement, resulting in denial of the next certification period and abrupt service termination.",
            "trapTags": [
              "vague-goal",
              "non-measurable-goal"
            ]
          },
          {
            "id": "a-gl-b",
            "label": "Goals: (1) SN will monitor wound until staples are removed. (2) SN will manage medications until patient is stable. (3) PT will improve ROM and strength. (4) OT will train patient in ADLs. Rehab potential: Good.",
            "isCorrect": false,
            "rationale": "Task-based goals describing what STAFF will do, not what the PATIENT will achieve. No measurable targets. No timeframes.",
            "whyTempting": "Concrete and specific about activities. Covers all disciplines. Seems actionable.",
            "failureReason": "Task-based, staff-centered, non-measurable. Fundamental misunderstanding of patient goal documentation.",
            "realWorldConsequence": "Staff-centered goals (\"SN will...\") fail CMS requirements for patient-centered, measurable outcomes — every visit billed against these goals is vulnerable to denial because patient benefit cannot be demonstrated.",
            "trapTags": [
              "task-based-goal",
              "non-measurable-goal"
            ]
          },
          {
            "id": "a-gl-c",
            "label": "Goals: (1) Right knee ROM 0-120° by week 8. (2) Independent ambulation 500 feet with walker by week 8. (3) Pain reduced to 2/10 by week 4. (4) Independent with all ADLs by week 6. (5) Surgical wound fully healed by week 4. (6) Patient will self-administer all medications independently by week 3. Rehab potential: Good.",
            "isCorrect": false,
            "rationale": "Multiple unrealistic targets: ROM 0-120° by week 8 post-TKA is aggressive (typical 12-week goal). Pain 2/10 by week 4 is unrealistic. Independent with ALL ADLs by week 6 ignores MCI. Self-medication by week 3 is unrealistic with MCI. Full wound healing by week 4 is standard but the erythema finding may extend this.",
            "whyTempting": "Specific, measurable, time-bound. Covers every clinical area. Has ROM numbers. Addresses pain. Seems SMART-compliant.",
            "failureReason": "Unrealistic targets that ignore documented barriers. Goals that cannot be met make the entire plan of care appear poorly constructed. An auditor would question clinical judgment.",
            "realWorldConsequence": "Unrealistic targets that ignore documented barriers create a record that appears either clinically incompetent or deliberately set up to fail — damaging in both audit and litigation contexts.",
            "trapTags": [
              "non-measurable-goal",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "a-gl-d",
            "label": "Goals: (1) Surgical wound: Incision well-approximated with no signs of infection, staples removed per surgeon timeline (typically 10-14 days post-op), incision area erythema resolved by week 4. (2) Pain: Patient will report pain ≤4/10 at rest and ≤6/10 with activity by week 4 using multimodal pain management (reduced opioid + acetaminophen + ice + positioning); opioid use discontinued or reduced to ≤1-2 doses/day PRN by week 4. (3) Mobility: Right knee ROM 0-90° by week 4, 0-110° by week 8 (baseline: 10-55°); patient will progress from max assist x2 transfers to min assist x1 by week 4 and supervised by week 8; ambulate 150 feet with walker independently by week 8 (baseline: 8 feet max assist). (4) ADL: Patient will perform upper body ADLs independently and lower body ADLs with min assist and adaptive equipment by week 6; safe toilet transfer independently by week 5. (5) Safety: Bowel function restored within 72 hours of protocol initiation; enoxaparin course completed 14 days without complications; cognitive status stable or improved as opioids reduced. Rehab potential: Fair to good — strong pre-surgical baseline supports recovery; barriers include MCI, limited caregiver support after week 1, and opioid transition challenges.",
            "isCorrect": true,
            "rationale": "Every goal has a baseline from SOC, a measurable target, a realistic timeframe, and connection to documented findings. ROM targets are evidence-based for TKA recovery. Pain goals account for multimodal approach. Functional progression is staged. Safety goals address the acute bowel and DVT prophylaxis issues. Rehab potential is honest about barriers while acknowledging strengths. Audit-proof.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-gl-e",
            "label": "Goals: (1) Patient will attend all PT and OT sessions. (2) Patient will comply with medication regimen. (3) Patient will use walker for all ambulation. (4) Patient will demonstrate understanding of DVT signs. (5) Patient will not fall during the certification period. Rehab potential: Fair.",
            "isCorrect": false,
            "rationale": "Compliance and attendance are not clinical goals. \"Will not fall\" is an outcome metric, not a patient goal. \"Demonstrate understanding\" is education-based, not functional. \"Use walker\" is a safety instruction, not a goal.",
            "whyTempting": "Practical, common-sense goals. Each seems reasonable. \"No falls\" is a priority for every home health patient.",
            "failureReason": "None of these are measurable patient outcomes. Attendance, compliance, and \"no falls\" are agency quality metrics masquerading as patient goals. An auditor would find zero functional outcome measurement.",
            "realWorldConsequence": "Compliance-based goals (attendance, medication compliance, \"no falls\") do not demonstrate skilled need or patient progress — Medicare requires functional outcome goals to justify continued home health services.",
            "trapTags": [
              "non-measurable-goal",
              "task-based-goal"
            ]
          },
          {
            "id": "a-gl-f",
            "label": "Goals: (1) Patient will achieve right knee flexion of 90° within 3 weeks. (2) Patient will ambulate independently with walker within 2 weeks. (3) Surgical wound will be healed and staples removed by day 10. (4) Patient will transition completely off opioids by week 2. (5) Patient will independently manage all medications including enoxaparin self-injection by week 2. Rehab potential: Excellent — motivated patient with good family support.",
            "isCorrect": false,
            "rationale": "Aggressive timelines across the board: 90° flexion at 3 weeks is ahead of typical TKA progression. Independent ambulation by week 2 from a max assist x2 baseline is unrealistic. Staple removal by day 10 is the earliest end of the typical 10-14 day range. Complete opioid discontinuation by week 2 is aggressive given 8-10/10 pain. Self-injection by week 2 is unrealistic with MCI. \"Excellent\" rehab potential ignores MCI and caregiver limitations. \"Good family support\" — the daughter leaves in a week and the husband has dementia.",
            "whyTempting": "Ambitious goals seem to show clinical confidence. Specific metrics. Time-bound. Appears SMART-compliant. \"Excellent rehab potential\" sounds optimistic.",
            "failureReason": "Unrealistic timelines set the plan up for failure. Calling rehab potential \"excellent\" when the patient has MCI and will have a dementia patient as sole caregiver contradicts the documented evidence. An auditor would question clinical judgment.",
            "realWorldConsequence": "Aggressively unrealistic timelines with documented MCI and impaired caregiver create a record of clinical incompetence — when goals inevitably fail, the agency must either falsify progress or document failure, both creating audit exposure.",
            "trapTags": [
              "non-measurable-goal",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "a-gl-g",
            "label": "Goals: (1) Prevent post-surgical complications (infection, DVT, fall). (2) Manage pain effectively. (3) Improve mobility. (4) Enhance ADL independence. (5) Ensure medication safety. Rehab potential: Good with therapy services.",
            "isCorrect": false,
            "rationale": "Every goal is a general category, not a measurable outcome. \"Prevent complications\" — how measured? \"Manage pain effectively\" — what is effective? \"Improve mobility\" — from what to what? This is a list of care plan themes, not goals.",
            "whyTempting": "Comprehensive coverage. Sounds clinical. Covers all the bases. This is how many agencies actually write goals.",
            "failureReason": "Completely non-measurable. An auditor has no way to determine if any goal was met. This represents the most common real-world failure pattern in goal documentation.",
            "realWorldConsequence": "Completely non-measurable goals provide no basis for demonstrating skilled need — per OIG reports, agencies with patterns of non-measurable goals face 30-50% denial rates on ADR review, the highest-volume financial risk.",
            "trapTags": [
              "vague-goal",
              "non-measurable-goal"
            ]
          }
        ]
      },
      {
        "id": "a-interventions",
        "formBoxNumber": "BOX 18/21",
        "label": "Interventions / Orders",
        "type": "multi-select",
        "domain": "interventions",
        "correctAnswerIds": [
          "a-int-b",
          "a-int-d",
          "a-int-f",
          "a-int-h"
        ],
        "auditNote": "Every intervention must be ordered, skilled, tied to documented clinical findings, matched to a goal, and within the discipline's scope of practice.",
        "options": [
          {
            "id": "a-int-a",
            "label": "SN to draw PT/INR weekly as ordered by physician to monitor anticoagulation therapy.",
            "isCorrect": false,
            "rationale": "PT/INR is the WRONG lab for enoxaparin. The physician ordered this in error. The correct monitoring for enoxaparin is CBC (for HIT screening) at days 7 and 14. The physician corrected this during the callback. Performing the wrong lab is both clinically inappropriate and wastes resources.",
            "whyTempting": "The physician ordered it. \"Drawing labs as ordered\" seems like the safest possible practice. Many clinicians do not question lab orders.",
            "failureReason": "Performing incorrect labs that the physician already corrected demonstrates failure to update the plan based on new information. This is the \"copy the original order\" trap.",
            "realWorldConsequence": "Drawing PT/INR for a patient on enoxaparin (not warfarin) wastes resources, subjects the patient to unnecessary venipuncture, and demonstrates failure to implement corrected orders — if HIT goes unmonitored, the agency faces malpractice liability.",
            "trapTags": [
              "copy-md-order",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "a-int-b",
            "label": "SN to assess surgical incision each visit: monitor 18cm midline incision with 24 staples for healing progression, signs of infection (track superior erythema trend), staple integrity, and wound approximation. Coordinate with surgeon for staple removal timeline. Teach patient/caregiver wound monitoring and when to report changes.",
            "isCorrect": true,
            "rationale": "Specific wound assessment tied to documented SOC findings. Identifies the erythema to trend. Includes surgeon coordination and patient/caregiver education. All skilled activities.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-int-c",
            "label": "SN to administer enoxaparin 40mg SubQ daily, educate patient on self-injection technique, and monitor injection sites for complications.",
            "isCorrect": false,
            "rationale": "The enoxaparin administration component is correct, but \"educate patient on self-injection technique\" is unrealistic given the documented MCI. The realistic plan should focus on caregiver training (daughter during week 1, alternative plan for weeks 2-3) rather than patient self-administration. This intervention does not address the week 2+ gap.",
            "whyTempting": "Covers the enoxaparin need. Self-injection teaching is standard nursing practice. Seems comprehensive.",
            "failureReason": "Fails to account for MCI — teaching self-injection to a patient with documented cognitive impairment who requires repetition of simple questions is not a realistic plan. The intervention must address the caregiver transition realistically.",
            "realWorldConsequence": "Teaching self-injection to a cognitively impaired patient without a realistic caregiver backup plan creates a foreseeable patient safety crisis — missed doses increase DVT/PE risk, and incorrect administration could cause bleeding complications.",
            "trapTags": [
              "documentation-inconsistency",
              "skilled-illusion"
            ]
          },
          {
            "id": "a-int-d",
            "label": "SN to manage enoxaparin 40mg SubQ daily x 14 days: administer injection during SN visits; teach daughter (Ana) injection technique during week 1 with return demonstration competency validation; develop post-week-1 enoxaparin plan (if Ana competent: supervised self-administration with phone check-in; if teaching unsuccessful: coordinate with MD for daily SN injection visits or alternative anticoagulation). Monitor for HIT: CBC at day 7 and day 14 per MD. Assess injection sites for bruising, hematoma, and complications.",
            "isCorrect": true,
            "rationale": "Comprehensively addresses the enoxaparin challenge. Realistic about the caregiver situation. Includes a contingency plan. Uses the correct lab (CBC, not INR). Teaches with competency validation. Audit-proof.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-int-e",
            "label": "PT to perform passive range of motion exercises to right knee, apply ice for 20 minutes post-exercise, and assist patient with transfers using Hoyer lift.",
            "isCorrect": false,
            "rationale": "Issues: PT for TKA should be active-assisted and active ROM, not just passive. There is no Hoyer lift documented — patient uses rolling walker and has max assist transfers, not mechanical lift transfers. Applying ice is not a skilled PT activity.",
            "whyTempting": "ROM exercises and ice are standard post-TKA. Hoyer lift seems like a safety measure for a max-assist patient.",
            "failureReason": "Passive ROM alone is insufficient for TKA rehab. Hoyer lift is not documented, ordered, or indicated. Ice application is not a skilled PT service. Demonstrates misunderstanding of post-TKA rehabilitation protocols.",
            "realWorldConsequence": "Passive ROM only after TKA violates rehabilitation standard of care, potentially requiring manipulation under anesthesia — using unordered equipment (Hoyer lift) introduces liability, and billing PT for ice application is fraudulent.",
            "trapTags": [
              "intervention-not-ordered",
              "intervention-not-skilled"
            ]
          },
          {
            "id": "a-int-f",
            "label": "PT: Progressive TKA rehabilitation program — active-assisted ROM exercises progressing to active ROM targeting 0-90° by week 4, 0-110° by week 8 (baseline 10-55°); progressive strengthening exercises (quad sets, SLR, mini-squats as tolerated); gait training with rolling walker progressing weight-bearing per surgeon protocol; transfer training bed/chair/commode; balance and proprioception exercises; stair training when ROM and strength allow (3 exterior steps for community access); home exercise program with daily ROM and strengthening components; coordinate with SN on cardiac precautions and pain management timing for optimal PT participation.",
            "isCorrect": true,
            "rationale": "Evidence-based TKA rehabilitation progression. Specific ROM targets with baselines. Progressive strengthening sequence. Functional goals (transfers, gait, stairs) tied to documented barriers. HEP included. SN coordination for pain timing is clinically astute. Audit-defensible.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-int-g",
            "label": "OT to assess home safety and recommend grab bars for bathroom; order raised toilet seat; recommend shower bench; educate on hip precautions; train in adaptive dressing techniques.",
            "isCorrect": false,
            "rationale": "Contains a critical clinical error: \"hip precautions\" are for total hip arthroplasty (THA), NOT total knee arthroplasty (TKA). TKA patients do not have hip precautions. This demonstrates confusion between THA and TKA protocols. The equipment recommendations and adaptive training are appropriate.",
            "whyTempting": "Grab bars, raised toilet seat, shower bench — all appropriate for this patient. Adaptive dressing for post-surgical patients is standard OT. Hip precautions sound like standard post-surgical precautions.",
            "failureReason": "Hip precautions after TKA is a clinical knowledge error that would be caught in any chart review. While the rest of the intervention is appropriate, this fundamental protocol error undermines the credibility of the entire plan.",
            "realWorldConsequence": "Teaching hip precautions to a TKA patient restricts movements needed for knee rehabilitation, delays recovery, limits PT progress, and documents clinical incompetence in the chart — a liability in any legal review.",
            "trapTags": [
              "documentation-inconsistency",
              "scope-mismatch"
            ]
          },
          {
            "id": "a-int-h",
            "label": "OT: Functional ADL training program — assess current ADL performance and identify barriers (MCI impact, pain, ROM limitations, knee immobilizer); train in adaptive lower body dressing using reacher, sock aid, long-handled shoehorn; toilet transfer training with equipment recommendations (raised toilet seat, grab bars for bathroom — to be installed); bathing assessment and adaptive equipment training (tub bench, handheld shower); kitchen safety assessment (gas stove safety given husband's cognitive status — coordinate with SN and family on safety plan); progressive IADLs as functional capacity improves. Cognitive screening ongoing — adjust teaching strategies to accommodate MCI (simple instructions, repetition, written aids in Spanish and English).",
            "isCorrect": true,
            "rationale": "Addresses specific ADL needs tied to documented findings. Includes adaptive equipment appropriate for TKA (NOT hip precautions). Addresses the gas stove safety issue. Acknowledges MCI in teaching approach. Bilingual considerations for Spanish-preferred patient. Comprehensively addresses the documented barriers. Audit-defensible.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-int-i",
            "label": "SN to administer oxycodone 10mg every 4 hours as previously ordered and assess pain control. Continue current medication regimen without changes pending physician follow-up appointment.",
            "isCorrect": false,
            "rationale": "The physician already changed the order: reduce oxycodone to 5mg q6h PRN. This intervention uses the ORIGINAL order, not the updated one. Continuing the original dose when the physician has reduced it is a medication error and a compliance violation.",
            "whyTempting": "SN doesn't usually \"administer\" oral medications in home health anyway, but the dose and frequency match the original discharge order. Some clinicians may not have caught the physician callback update.",
            "failureReason": "Uses outdated orders. Physician explicitly changed the medication. Continuing the original order is a medication error.",
            "realWorldConsequence": "Administering oxycodone at the original dose after the physician reduced it constitutes a medication error — doubling opioid exposure for an 81-year-old with MCI risks respiratory depression, falls, aspiration, and death.",
            "trapTags": [
              "copy-md-order",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "a-int-j",
            "label": "SN to coordinate SNF placement given caregiver limitations and patient safety concerns. Patient's husband cannot provide adequate supervision, and daughter is only available one week.",
            "isCorrect": false,
            "rationale": "The patient explicitly refused SNF placement. While caregiver concerns are real, overriding patient preference for facility placement is not within the home health scope. The 485 should address how to manage care AT HOME given the limitations, not redirect to a care setting the patient refused.",
            "whyTempting": "The caregiver situation IS concerning. From a safety perspective, SNF might be more appropriate. This seems like responsible advocacy.",
            "failureReason": "Overriding patient preference without documented safety emergency. The role of home health is to develop a plan that supports the patient in the chosen setting. Care coordination to address barriers AT HOME is the appropriate intervention.",
            "realWorldConsequence": "Overriding patient autonomy and cultural preferences to pursue unwanted facility placement violates patient rights under Medicare Conditions of Participation — could trigger a patient rights violation complaint and state survey.",
            "trapTags": [
              "scope-mismatch"
            ]
          }
        ]
      },
      {
        "id": "a-disciplines",
        "formBoxNumber": "BOX 20",
        "label": "Disciplines / Services Required",
        "type": "multi-select",
        "domain": "disciplines",
        "correctAnswerIds": [
          "a-disc-a",
          "a-disc-b",
          "a-disc-c",
          "a-disc-d"
        ],
        "auditNote": "All ordered and clinically justified disciplines should be included. Each must have documented need, physician order, corresponding goals, and interventions.",
        "options": [
          {
            "id": "a-disc-a",
            "label": "Skilled Nursing (SN)",
            "isCorrect": true,
            "rationale": "Ordered. Documented need for wound assessment, medication management, enoxaparin administration, safety assessment. Extensively justified.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-disc-b",
            "label": "Physical Therapy (PT)",
            "isCorrect": true,
            "rationale": "Ordered. Post-TKA rehabilitation is standard of care. Documented functional deficits requiring skilled PT.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-disc-c",
            "label": "Occupational Therapy (OT)",
            "isCorrect": true,
            "rationale": "Ordered. ADL limitations documented. Adaptive equipment needs identified. Home safety assessment needed (bathroom, gas stove). MCI impacts ADL training approach.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-disc-d",
            "label": "Home Health Aide (HHA)",
            "isCorrect": true,
            "rationale": "Ordered. ADL assistance documented as needed. Tied to SN/PT/OT skilled services.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "a-disc-e",
            "label": "Medical Social Worker (MSW)",
            "isCorrect": false,
            "rationale": "Not ordered. While psychosocial needs exist (caregiver stress, financial concerns, positive PHQ-2, cultural considerations), MSW requires a physician order. SN should recommend MSW but cannot add it to the 485 unilaterally.",
            "whyTempting": "The psychosocial picture is compelling. PHQ-2 positive. Financial concerns. Cultural factors. Caregiver limitations. MSW seems essential.",
            "failureReason": "Not ordered. Must be recommended and ordered before inclusion on the 485.",
            "realWorldConsequence": "Including an unordered discipline means the physician is asked to sign orders they did not write — if they refuse, the 485 is returned, delaying certification and creating a billing gap for all disciplines.",
            "trapTags": [
              "discipline-not-justified",
              "intervention-not-ordered"
            ]
          },
          {
            "id": "a-disc-f",
            "label": "Speech-Language Pathology (SLP)",
            "isCorrect": false,
            "rationale": "Not ordered. Patient has MCI but no documented speech, language, or swallowing disorder. SLP is not indicated for MCI monitoring alone in this context.",
            "whyTempting": "Patient has MCI and slow processing speed. Some clinicians equate cognitive impairment with SLP need.",
            "failureReason": "No documented speech/language/swallowing deficit. No physician order. SLP for cognitive assessment in home health requires specific documented need beyond a general MCI diagnosis.",
            "realWorldConsequence": "Adding SLP without documented speech, language, or swallowing deficits would result in denial of all SLP visits — billing SLP based solely on MCI is a known OIG audit target that has resulted in multi-million dollar settlements.",
            "trapTags": [
              "discipline-not-justified"
            ]
          },
          {
            "id": "a-disc-g",
            "label": "Physical Therapy (PT) + Occupational Therapy (OT) — combined as one discipline selection",
            "isCorrect": false,
            "rationale": "PT and OT are separate disciplines with separate scopes. They cannot be combined as a single discipline selection. This option tests whether clinicians understand discipline differentiation.",
            "whyTempting": "Some agencies informally combine PT/OT. Both are rehab disciplines. Selecting them together seems efficient.",
            "failureReason": "Each discipline must be separately identified, ordered, and justified. Combining them demonstrates a misunderstanding of discipline-specific scope and documentation requirements.",
            "realWorldConsequence": "Combining PT and OT as a single discipline makes the plan non-certifiable — neither discipline's scope, goals, or frequency can be delineated, and Medicare cannot process claims without discipline-specific billing codes.",
            "trapTags": [
              "scope-mismatch"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": "case-3-okafor",
    "title": "OKAFOR CLINICAL CHALLENGE",
    "subtitle": "Emmanuel Okafor — COPD + Psychiatric + Medication Complexity",
    "evidence": {
      "patientName": "Emmanuel Okafor",
      "age": 62,
      "gender": "Male",
      "patientHIC": "XXX-XX-XXXX-C",
      "socDate": "03/22/2026",
      "certPeriod": "03/22/2026 – 05/21/2026",
      "medicalRecordNumber": "CI-MR-00E3",
      "providerNumber": "10-7654",
      "dischargeSummary": "Discharged from Regional Medical Center 03/20/2026 after 6-day admission for acute exacerbation of COPD with respiratory failure requiring 48-hour BiPAP. Admission triggered by medication non-adherence — patient stopped all inhalers 3 weeks prior stating \"they weren't helping.\" Complicating factors: uncontrolled type 2 DM (A1C 10.2%), bipolar disorder with recent medication change (lithium discontinued, started valproic acid 2 weeks prior to admission — levels not yet therapeutic), hypertension, obesity (BMI 38.4), and obstructive sleep apnea (CPAP non-compliant — \"can't tolerate the mask\"). Discharge on: prednisone taper 40mg x 5 days then 20mg x 5 days then 10mg x 5 days, albuterol/ipratropium nebulizer q4h, fluticasone/salmeterol 250/50 1 puff BID, tiotropium 18mcg 1 cap daily, azithromycin 250mg daily x 4 days remaining, metformin 1000mg BID, glipizide 10mg BID, lisinopril 20mg daily, valproic acid 500mg BID (psychiatry following — Dr. Rowan), home O2 2-4L NC continuous, home nebulizer. Hospital psychiatry consult note: \"Patient with bipolar I, most recent manic episode in remission. Lithium discontinued due to renal concerns. Valproic acid initiated. Patient reports intermittent medication adherence with all medications, not just psychiatric. Limited insight. Lives alone. Strongly recommend intensive outpatient follow-up.\"",
      "physicianOrders": "Dr. Patricia Holt — Home Health Orders (03/21/2026):\nDX: J44.1 (COPD with acute exacerbation), J96.00 (Acute respiratory failure, unspecified), E11.65 (Type 2 DM with hyperglycemia), F31.73 (Bipolar I, in partial remission), I10 (Essential HTN), E66.01 (Morbid obesity due to excess calories), G47.33 (OSA)\nSN: 2W1 x 2 wks, 1W3 x 6 wks → respiratory assessment, O2 management, medication management, DM monitoring\nPT: Evaluate and treat for deconditioning — 2W1 x 2 wks, 1W3 x 6 wks\nHHA: 2x/wk x 4 wks\nLabs: BMP weekly x 4 wks, VPA level at week 2, A1C at week 8\nHomebound: Patient is homebound due to shortness of breath.",
      "socNarrative": "Arrived 03/22/2026 for SOC. Patient sitting in recliner with O2 at 3L NC via portable concentrator. Appears anxious, speaking in rapid, pressured speech, jumping between topics. Home is a studio apartment — cluttered with newspapers, takeout containers, and medication bottles scattered across kitchen counter. Multiple empty inhaler canisters found. Patient reports he \"feels great, better than ever\" and questions why he needs home health. When asked about medications, patient states he took \"most of them this morning\" but cannot recall which ones specifically. Pill count reveals prednisone taper is 2 days behind schedule — patient took 40mg for 7 days instead of 5. Medication bottles show azithromycin bottle full (has not started 4-day course). Nebulizer set up but filter dirty and tubing has visible mold. Patient becomes irritable when questioned about medication adherence — \"I'm not a child.\" Lungs: diminished bilateral bases, scattered expiratory wheezes throughout, prolonged expiratory phase. SpO2 89% on 3L NC, drops to 82% with ambulation to bathroom (12 feet). RR 24. HR 98. BP 168/96. BG 287 mg/dL (non-fasting, 2 hours post-meal). Weight 284 lbs. Patient ambulated to bathroom using no assistive device — unsteady gait, grabbed furniture for balance, visibly dyspneic, required 3-minute rest upon returning to chair. Recovery SpO2 to 91% after 5 minutes rest. Patient reports he has not used CPAP since before admission. CPAP machine found in closet, unplugged. Patient has a 14-year-old cat — litter box in bathroom adjacent to where patient sleeps (studio). No smoke detectors visible. Patient is a former 2-pack/day smoker, quit 3 years ago. No local family — brother in Nigeria. Has a case manager from psychiatric outpatient clinic (last contact 2 months ago). Nearest pharmacy is 2 blocks away — patient states he walks there \"when I feel like it.\"",
      "vitals": [
        {
          "label": "SpO2",
          "value": "89% on 3L NC; 82% with exertion",
          "alert": true
        },
        {
          "label": "Heart Rate",
          "value": "98 bpm",
          "alert": true
        },
        {
          "label": "Blood Pressure",
          "value": "168/96 mmHg",
          "alert": true
        },
        {
          "label": "Respirations",
          "value": "24/min with prolonged expiratory phase",
          "alert": true
        },
        {
          "label": "Blood Glucose",
          "value": "287 mg/dL (non-fasting)",
          "alert": true
        },
        {
          "label": "Weight",
          "value": "284 lbs (BMI 38.4)"
        },
        {
          "label": "Temperature",
          "value": "98.4°F"
        },
        {
          "label": "Exertional SpO2 Recovery",
          "value": "91% after 5 min rest",
          "alert": true
        }
      ],
      "safetyRisks": [
        {
          "description": "Prednisone taper behind schedule — took 40mg x 7 days instead of 5",
          "severity": "critical"
        },
        {
          "description": "Azithromycin not started — full bottle found",
          "severity": "critical"
        },
        {
          "description": "Nebulizer filter dirty, tubing has visible mold",
          "severity": "critical"
        },
        {
          "description": "SpO2 82% with minimal exertion",
          "severity": "critical"
        },
        {
          "description": "Pressured speech, grandiosity, irritability — possible manic features",
          "severity": "critical"
        },
        {
          "description": "No smoke detectors in home",
          "severity": "moderate"
        },
        {
          "description": "Cat litter in sleeping area — respiratory irritant",
          "severity": "moderate"
        },
        {
          "description": "CPAP non-compliant — OSA untreated",
          "severity": "moderate"
        },
        {
          "description": "Lives alone, no local support system",
          "severity": "moderate"
        },
        {
          "description": "Cluttered environment — fall risk",
          "severity": "moderate"
        },
        {
          "description": "States he walks to pharmacy \"when I feel like it\" — may leave home",
          "severity": "low"
        }
      ],
      "medications": [
        {
          "name": "Prednisone",
          "dose": "40/20/10mg taper",
          "route": "PO",
          "frequency": "Daily taper",
          "indication": "COPD exacerbation",
          "reconciliationNote": "TAPER BEHIND SCHEDULE — took 40mg x 7 days instead of 5. Remaining taper needs recalculation with MD."
        },
        {
          "name": "Albuterol/Ipratropium",
          "dose": "Nebulizer",
          "route": "INH",
          "frequency": "q4h",
          "indication": "COPD bronchodilation",
          "reconciliationNote": "Nebulizer contaminated (dirty filter, mold in tubing). Equipment needs replacement/deep cleaning."
        },
        {
          "name": "Fluticasone/Salmeterol",
          "dose": "250/50",
          "route": "INH",
          "frequency": "1 puff BID",
          "indication": "COPD maintenance",
          "reconciliationNote": "Empty canisters found — unclear if patient has current refill."
        },
        {
          "name": "Tiotropium",
          "dose": "18mcg",
          "route": "INH",
          "frequency": "1 cap daily",
          "indication": "COPD maintenance",
          "reconciliationNote": "Unclear if patient has been taking consistently."
        },
        {
          "name": "Azithromycin",
          "dose": "250mg",
          "route": "PO",
          "frequency": "Daily x 4 days",
          "indication": "Infection — COPD exacerbation",
          "reconciliationNote": "HAS NOT STARTED — full bottle found at SOC."
        },
        {
          "name": "Metformin",
          "dose": "1000mg",
          "route": "PO",
          "frequency": "BID",
          "indication": "DM2",
          "reconciliationNote": "BG 287 suggests poor adherence or inadequate control."
        },
        {
          "name": "Glipizide",
          "dose": "10mg",
          "route": "PO",
          "frequency": "BID",
          "indication": "DM2",
          "reconciliationNote": "Glipizide + prednisone = significant hyperglycemia risk. BG 287 likely multifactorial."
        },
        {
          "name": "Lisinopril",
          "dose": "20mg",
          "route": "PO",
          "frequency": "Daily",
          "indication": "HTN",
          "reconciliationNote": "BP 168/96 — uncontrolled. Adherence questioned."
        },
        {
          "name": "Valproic Acid",
          "dose": "500mg",
          "route": "PO",
          "frequency": "BID",
          "indication": "Bipolar I",
          "reconciliationNote": "Started 2 weeks pre-admission. Level not yet checked. Therapeutic range 50-125 mcg/mL. Drug interaction: VPA can affect glucose metabolism."
        }
      ],
      "oasisFindings": [
        {
          "item": "M1700 – Cognitive Functioning",
          "response": "0 – Alert/oriented, able to independently make decisions",
          "conflictNote": "OASIS scores cognition as intact. SOC narrative describes pressured speech, grandiosity (\"feels great, better than ever\"), irritability, inability to recall which meds taken, poor judgment (stopped all inhalers, prednisone taper error). Psychiatric presentation may impact decision-making capacity."
        },
        {
          "item": "M1033 – Risk for Hospitalization",
          "response": "Two or more risk factors",
          "conflictNote": "Underscored. Patient has: medication non-adherence history, psychiatric comorbidity, lives alone, no local support, COPD with recent respiratory failure, uncontrolled DM, obesity, OSA non-compliance."
        },
        {
          "item": "M1800 – Grooming",
          "response": "0 – Able to groom independently",
          "conflictNote": "May be accurate for physical capability but does not capture self-care neglect patterns associated with psychiatric status."
        },
        {
          "item": "M1860 – Ambulation",
          "response": "1 – Able to walk independently with supervision",
          "conflictNote": "SOC describes unsteady gait, furniture grabbing, severe dyspnea with 12 feet. \"Independent with supervision\" understates the impairment."
        },
        {
          "item": "M2020 – Oral Medication Management",
          "response": "1 – Able to take oral meds with reminders",
          "conflictNote": "Patient has demonstrated inability to manage medications independently: wrong prednisone taper, azithromycin not started, cannot recall which meds taken. \"Reminders\" may be insufficient — may need daily pill setup and monitoring."
        },
        {
          "item": "M1400 – Dyspnea",
          "response": "3 – At rest",
          "conflictNote": "Patient was actually conversational at rest (though tachypneic at 24). Dyspnea was most notable with exertion. Score of 3 may be overrated — or the conversational ability at rest may mask true resting dyspnea."
        }
      ],
      "physicianCollaboration": "Dr. Patricia Holt contacted 03/22/2026 at 1530. Notified of: prednisone taper error (40mg x 7 days), azithromycin not started, contaminated nebulizer, SpO2 82% with exertion, BG 287, behavioral observations suggesting possible manic symptoms, BP 168/96, CPAP non-compliance, and environmental concerns. Dr. Holt response: \"Recalculate prednisone — extend the taper: 20mg x 5 days, then 10mg x 5 days starting tomorrow. Start azithromycin immediately. Clean the nebulizer — if tubing is molded, replace it. BG — I expected steroid-induced hyperglycemia, monitor BG BID, if consistently above 300 call me. BP — continue lisinopril, may need dose increase. For the psychiatric concerns, contact Dr. Rowan (psychiatry). I want SN to increase to 3x/week for first 2 weeks given all of this.\" Dr. Holt did NOT address: CPAP, O2 titration parameters, cat litter/environmental issues, smoke detectors, or update SN frequency on a formal order (verbal only).",
      "socialEnvironmental": "Lives alone in studio apartment in urban area. Brother lives in Nigeria — weekly phone calls. Former case manager from psychiatric outpatient clinic — last contact 2 months ago (patient \"stopped going\"). No local friends or support system identified. Patient is a retired bus driver on SSDI. Medicare FFS + Medicaid. Apartment is cluttered but structurally sound. Building has elevator. Pharmacy 2 blocks away — patient walks when \"feeling up to it.\" Former 2-pack/day smoker x 30 years, quit 3 years ago. Drinks \"occasionally\" — unclear frequency. No illicit drug use per patient report. 14-year-old cat is patient's primary companion — patient refuses to discuss rehoming or litter relocation. Patient expresses strong preference for independence: \"I don't need people telling me what to do.\" Cultural background: Nigerian, Christian. No advance directives.",
      "functionalStatus": "Prior to admission: independent with all ADLs and IADLs with frequent rest breaks. Ambulated in community short distances. Did not drive (license expired). Managed own medications \"sort of\" per patient. Cooked simple meals. Current at SOC: ambulates 12 feet with no assistive device but unsteady gait, dyspnea, furniture grabbing, and prolonged recovery. Requires 3-minute rest after 12 feet. SpO2 drops to 82% with this minimal exertion. Transfers independently but slowly. Manages grooming/feeding independently. Needs assistance with bathing (cannot stand in shower long enough due to dyspnea), heavy housekeeping, laundry, grocery shopping.",
      "mentalStatus": "Oriented x4 per direct questioning. Pressured speech — speaks rapidly, jumps between topics. Affect: expansive, intermittently irritable when challenged. Grandiose statements (\"I feel great, better than ever\" despite SpO2 82% with walking). Poor insight into severity of medical conditions. Judgment: stopped all inhalers 3 weeks ago, prednisone taper error, has not started antibiotics, CPAP non-compliant. Per psychiatry consult: bipolar I, manic episode in remission — but current presentation (pressured speech, grandiosity, irritability, decreased need for adherence/sleep per patient) raises concern for emerging hypomania. VPA level not yet therapeutic. Dr. Rowan (psychiatry) to be contacted.",
      "hiddenClues": [
        "J44.1 (COPD with acute exacerbation) is an acute code. At home health SOC, the patient is post-acute. The correct COPD code for the home health episode depends on current status — if still symptomatic (wheezes, dyspnea), J44.1 may still apply; if stabilized, J44.0 or J44.9.",
        "J96.00 (acute respiratory failure) was an inpatient diagnosis. The patient is no longer in respiratory failure at SOC — SpO2 89% on 3L is poor but not respiratory failure. Using J96.00 on the 485 is inappropriate.",
        "E11.65 (DM with hyperglycemia) — BUT the hyperglycemia is largely steroid-induced. The underlying DM code should capture the chronic complications. Is E11.65 the right secondary code, or should it be the chronic DM code with the steroid hyperglycemia coded separately?",
        "F31.73 (Bipolar I, in partial remission) — but SOC narrative describes pressured speech, grandiosity, and irritability suggesting possible hypomania/mania, not \"partial remission.\" The code from the physician may not match the current presentation.",
        "Patient states he walks to the pharmacy \"when I feel like it\" — this raises homebound status concerns. If the patient is walking 2 blocks to the pharmacy, is he truly homebound?",
        "The verbal order from Dr. Holt to increase SN to 3x/week was not formalized — verbal orders must be authenticated. The 485 needs the updated frequency, but the order process matters.",
        "Prednisone + glipizide = significant hyperglycemia risk. The BG 287 is multifactorial: underlying uncontrolled DM + steroid effect + medication non-adherence.",
        "The psychiatric symptoms (pressured speech, grandiosity, irritability) suggest possible VPA subtherapeutic level — the level has not been checked yet. This is a medication safety issue.",
        "OASIS M1700 scores cognition as fully intact — but the psychiatric presentation suggests impaired judgment and decision-making that may not be captured by standard cognitive screening.",
        "Cat litter adjacent to sleeping area in a patient with COPD = environmental respiratory irritant that worsens outcomes.",
        "Contaminated nebulizer (mold) could be a source of respiratory infection."
      ]
    },
    "fields": [
      {
        "id": "o-principal-dx",
        "formBoxNumber": "BOX 11",
        "label": "Principal Diagnosis",
        "type": "single-select",
        "domain": "principal-diagnosis",
        "correctAnswerIds": [
          "o-pdx-e"
        ],
        "auditNote": "The principal diagnosis must reflect the condition driving the home health episode. For COPD patients post-exacerbation, the code depends on whether the exacerbation has resolved or is ongoing at the time of home health assessment.",
        "options": [
          {
            "id": "o-pdx-a",
            "label": "J44.1 — COPD with (acute) exacerbation",
            "isCorrect": false,
            "rationale": "J44.1 captures an acute exacerbation. At SOC, the patient is 2 days post-discharge. While he is still symptomatic (wheezes, dyspnea, SpO2 89%), the acute exacerbation was managed inpatient. The question is whether the current home health episode manages an ongoing acute exacerbation or the chronic disease with residual symptoms post-exacerbation. Given that the patient is no longer on acute interventions (BiPAP d/c'd, antibiotics for post-acute infection, steroid taper in progress), this is more accurately a post-exacerbation chronic management episode.",
            "whyTempting": "This is the physician order diagnosis. The patient IS still symptomatic. \"Acute exacerbation\" captures the severity. Feels like the most accurate description of what happened.",
            "failureReason": "Using an acute code for a post-acute home health episode may be defensible in the first days post-discharge, but the ICD-10 convention for home health is to code the chronic condition being managed. J44.1 is appropriate for the inpatient stay; the home health episode is managing chronic COPD post-exacerbation.",
            "realWorldConsequence": "Using an acute exacerbation code for a post-acute episode misaligns the PDGM clinical grouping, potentially triggering a targeted ADR review and forcing retroactive reclassification under a lower reimbursement tier.",
            "trapTags": [
              "copy-md-order",
              "timing-problem"
            ]
          },
          {
            "id": "o-pdx-b",
            "label": "J96.00 — Acute respiratory failure, unspecified whether with hypoxia or hypercapnia",
            "isCorrect": false,
            "rationale": "The patient is NOT in respiratory failure at SOC. SpO2 89% on 3L NC is suboptimal but does not meet the criteria for respiratory failure (typically SpO2 <88% on supplemental O2 with clinical context, or PaO2 <60mmHg, or PaCO2 >50mmHg). The respiratory failure was an inpatient diagnosis that resolved with BiPAP and treatment.",
            "whyTempting": "SpO2 89% sounds like respiratory failure. It is on the physician order. The patient was recently on BiPAP. This code captures severity.",
            "failureReason": "Coding a resolved inpatient condition as the principal diagnosis for home health is a compliance violation. The patient is no longer in respiratory failure. Using this code would trigger an immediate ADR denial.",
            "realWorldConsequence": "Listing active respiratory failure for a patient no longer in failure is a false claim — Medicare will issue an immediate ADR denial, recoup all episode payments, and flag the agency for a pattern-of-billing audit.",
            "trapTags": [
              "copy-md-order",
              "timing-problem",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "o-pdx-c",
            "label": "J44.9 — Chronic obstructive pulmonary disease, unspecified",
            "isCorrect": false,
            "rationale": "While COPD is the correct diagnostic category, J44.9 is the unspecified code. The clinical record documents the COPD with enough detail to code more specifically. At minimum, the current lower respiratory infection/post-exacerbation status should be captured.",
            "whyTempting": "COPD is clearly the primary condition. J44.9 is the \"safe\" general code. It is commonly used.",
            "failureReason": "Unspecified code when more specific documentation exists. Under PDGM, unspecified codes map to lower acuity groupings. An auditor would expect more specific coding.",
            "realWorldConsequence": "An unspecified code downgrades the PDGM clinical group, reducing reimbursement by hundreds of dollars per episode and signaling to auditors that the clinician did not review the medical record.",
            "trapTags": [
              "unspecified-code"
            ]
          },
          {
            "id": "o-pdx-d",
            "label": "F31.73 — Bipolar disorder, current episode manic, in partial remission",
            "isCorrect": false,
            "rationale": "While the psychiatric condition significantly complicates this case, the patient was referred for home health due to COPD exacerbation and respiratory management, not psychiatric management. Bipolar is a critical secondary diagnosis but not the principal reason for home health services.",
            "whyTempting": "The psychiatric symptoms are arguably the most dangerous aspect of this case (driving non-adherence, affecting judgment). Clinicians who focus on the root cause of the patient's problems may select this.",
            "failureReason": "The referral and admission reason is respiratory/COPD. While bipolar disorder drives the non-adherence, the skilled nursing services focus on respiratory management, not psychiatric treatment. Using F31.73 as principal misaligns with the reason for home health admission.",
            "realWorldConsequence": "A psychiatric principal diagnosis on a respiratory referral creates a mismatch flagged by ZPIC/MAC auditors as unsupported by the referral source, resulting in claim denial and potential fraud referral for upcoding.",
            "trapTags": [
              "wrong-primary-focus"
            ]
          },
          {
            "id": "o-pdx-e",
            "label": "J44.0 — COPD with acute lower respiratory infection",
            "isCorrect": true,
            "rationale": "The patient has an active lower respiratory infection (azithromycin prescribed and not yet started, infection was part of the exacerbation trigger). J44.0 captures COPD with an active infection component, which is the current clinical picture at SOC. The exacerbation was the inpatient diagnosis; the home health episode manages the chronic COPD with the residual/ongoing infection. This code appropriately captures the clinical complexity without overusing the acute exacerbation code and correctly reflects the antibiotic need.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-pdx-f",
            "label": "E11.65 — Type 2 DM with hyperglycemia",
            "isCorrect": false,
            "rationale": "DM with hyperglycemia is present but the hyperglycemia is largely steroid-induced and the patient was admitted for COPD, not DM. DM is a comorbidity complicating the COPD management, not the principal reason for home health.",
            "whyTempting": "BG 287 is dangerous. A1C 10.2% indicates chronic poor control. DM complications could be argued as the most medically dangerous finding.",
            "failureReason": "DM is not the reason for home health referral. Using DM as principal when the patient was admitted for COPD exacerbation misrepresents the episode.",
            "realWorldConsequence": "Listing DM as the principal diagnosis when the patient was admitted for COPD misrepresents the episode, causing a PDGM clinical group mismatch that will be denied on audit.",
            "trapTags": [
              "wrong-primary-focus"
            ]
          },
          {
            "id": "o-pdx-g",
            "label": "J44.1 — COPD with acute exacerbation, plus J96.00 — Acute respiratory failure as dual principal diagnoses",
            "isCorrect": false,
            "rationale": "There can only be ONE principal diagnosis on the CMS-485. Additionally, J96.00 is no longer active. \"Dual principal\" is not a valid concept for Box 11.",
            "whyTempting": "Captures both the COPD and the severity of the recent episode. Seems maximally specific. Some clinicians think they can list two primary diagnoses.",
            "failureReason": "Only one principal diagnosis is allowed. J96.00 is a resolved inpatient condition. Fundamental coding structure error.",
            "realWorldConsequence": "Submitting two principal diagnoses is a structural claim error — the claim will be auto-rejected by the MAC processing system, delaying payment and requiring a corrected claim submission.",
            "trapTags": [
              "documentation-inconsistency"
            ]
          }
        ]
      },
      {
        "id": "o-secondary-dx",
        "formBoxNumber": "BOX 12",
        "label": "Other Pertinent Diagnoses",
        "type": "multi-select",
        "domain": "secondary-diagnoses",
        "correctAnswerIds": [
          "o-sdx-a",
          "o-sdx-c",
          "o-sdx-e",
          "o-sdx-f",
          "o-sdx-g"
        ],
        "auditNote": "Each secondary diagnosis must be documented, currently active, relevant to the plan of care, and coded at the highest level of specificity supported by documentation.",
        "options": [
          {
            "id": "o-sdx-a",
            "label": "E11.65 — Type 2 DM with hyperglycemia",
            "isCorrect": true,
            "rationale": "Documented DM with active hyperglycemia (BG 287, A1C 10.2%). Drives skilled monitoring, medication management, and interacts with steroid taper. Relevant to plan of care.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-sdx-b",
            "label": "E11.9 — Type 2 DM without complications",
            "isCorrect": false,
            "rationale": "Patient has hyperglycemia (BG 287, A1C 10.2%) — this IS a complication. Using \"without complications\" when hyperglycemia is documented is factually incorrect.",
            "whyTempting": "E11.9 is the most commonly used DM code. It feels like the \"standard\" choice.",
            "failureReason": "Inaccurate coding. Patient has documented hyperglycemia which requires the E11.65 code. E11.9 under-captures the clinical picture.",
            "realWorldConsequence": "Coding DM \"without complications\" when BG is 287 and A1C is 10.2% understates clinical severity, reducing the case-mix weight and creating an audit trail showing the clinician ignored documented lab values.",
            "trapTags": [
              "unspecified-code"
            ]
          },
          {
            "id": "o-sdx-c",
            "label": "F31.73 — Bipolar I disorder, current episode manic, in partial remission",
            "isCorrect": true,
            "rationale": "Diagnosed, documented, on active psychiatric medication (VPA), directly impacts medication adherence, decision-making, and safety. While the SOC presentation suggests possible hypomania, the current diagnosis on record is F31.73. The nurse should document the behavioral observations and contact psychiatry, but cannot change the psychiatric diagnosis.",
            "whyTempting": "N/A — correct. Note: the presentation at SOC suggests the \"partial remission\" may be inaccurate, but the nurse documents observations and reports to the psychiatrist — the nurse does not change the psychiatric diagnosis code.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-sdx-d",
            "label": "F31.10 — Bipolar I disorder, current episode manic without psychotic features",
            "isCorrect": false,
            "rationale": "While the SOC presentation (pressured speech, grandiosity, irritability) suggests possible active manic features, changing the psychiatric diagnosis code from \"partial remission\" to \"current manic episode\" requires psychiatric assessment and diagnosis. The SN should document observations and report to Dr. Rowan but cannot recode the psychiatric diagnosis.",
            "whyTempting": "The clinical presentation at SOC IS consistent with mania. Clinicians with psychiatric assessment skills may recognize the presentation and want to update the code. This seems clinically astute.",
            "failureReason": "Psychiatric diagnosis changes require psychiatric evaluation. The SN should DOCUMENT the behavioral observations and REPORT to psychiatry, but the 485 must use the current diagnosed code until psychiatry updates it. This is a scope-of-practice issue.",
            "realWorldConsequence": "Changing a psychiatric diagnosis code without a psychiatrist's evaluation constitutes practicing outside scope of licensure — exposing the nurse to board discipline and the agency to liability if treatment decisions are based on an unauthorized diagnosis change.",
            "trapTags": [
              "scope-mismatch",
              "clinically-true-unsupported"
            ]
          },
          {
            "id": "o-sdx-e",
            "label": "I10 — Essential hypertension",
            "isCorrect": true,
            "rationale": "Documented, actively treated, BP uncontrolled at SOC (168/96). Relevant to medication management. No other cardiovascular diagnosis explains the amlodipine/lisinopril orders.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-sdx-f",
            "label": "E66.01 — Morbid (severe) obesity due to excess calories",
            "isCorrect": true,
            "rationale": "BMI 38.4 documented. Directly impacts respiratory function (already compromised by COPD), mobility, fall risk, and complicates OSA. Relevant to understanding clinical complexity and functional limitations.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-sdx-g",
            "label": "G47.33 — Obstructive sleep apnea",
            "isCorrect": true,
            "rationale": "Documented, directly impacts respiratory status (CPAP non-compliance worsens hypoxemia), and is relevant to the respiratory management plan. The SN needs to address CPAP non-compliance as part of the overall respiratory care plan.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-sdx-h",
            "label": "J96.00 — Acute respiratory failure, unspecified",
            "isCorrect": false,
            "rationale": "Resolved inpatient condition. Patient is not in respiratory failure at SOC. Using a resolved acute diagnosis as a secondary diagnosis on the 485 is inaccurate.",
            "whyTempting": "It is on the physician order. It explains the severity of the recent episode. It adds acuity to the clinical picture.",
            "failureReason": "Coding a resolved condition inflates the clinical picture. Under audit, the reviewer would note the patient is not in respiratory failure at the time of the 485.",
            "realWorldConsequence": "Carrying a resolved inpatient diagnosis onto the 485 inflates clinical acuity — auditors will flag this as upcoding, triggering payment recoupment and potential OIG referral for False Claims Act violations.",
            "trapTags": [
              "copy-md-order",
              "timing-problem"
            ]
          },
          {
            "id": "o-sdx-i",
            "label": "F17.210 — Nicotine dependence, cigarettes, uncomplicated",
            "isCorrect": false,
            "rationale": "Patient quit smoking 3 years ago. Former smoker status does not support a current nicotine dependence code. The appropriate code would be Z87.891 (personal history of nicotine dependence) if it were clinically relevant to list.",
            "whyTempting": "Smoking history is critical context for COPD. 30 pack-year history is significant. Nicotine dependence seems relevant.",
            "failureReason": "Patient is a former smoker. Coding current dependence for a patient who quit 3 years ago is inaccurate. History codes are different from current condition codes.",
            "realWorldConsequence": "Coding active nicotine dependence for a patient who quit 3 years ago misrepresents current conditions, could affect insurance underwriting, and signals sloppy coding practices that invite broader record audits.",
            "trapTags": [
              "documentation-inconsistency"
            ]
          },
          {
            "id": "o-sdx-j",
            "label": "R41.840 — Attention and concentration deficit",
            "isCorrect": false,
            "rationale": "While the patient demonstrates difficulty tracking conversation and poor focus, these are symptoms of his bipolar disorder, not a separate cognitive diagnosis. The psychiatric diagnosis (F31.73) already explains the behavioral/cognitive symptoms. R-codes should not be used when the underlying condition is documented.",
            "whyTempting": "The patient genuinely has attention/concentration issues observed at SOC. It seems like a separate finding worth coding.",
            "failureReason": "R-code used when the underlying condition (bipolar) is documented and explains the symptom. Double-coding symptoms and their underlying cause is a coding error.",
            "realWorldConsequence": "Double-coding a symptom separately from its documented underlying cause violates ICD-10 conventions, resulting in claim edits, potential denials, and auditor flags for inflating the diagnosis list.",
            "trapTags": [
              "r-code-symptom",
              "clinically-true-unsupported"
            ]
          }
        ]
      },
      {
        "id": "o-homebound",
        "formBoxNumber": "BOX 13",
        "label": "Homebound Status Narrative",
        "type": "single-select",
        "domain": "homebound-status",
        "correctAnswerIds": [
          "o-hb-d"
        ],
        "auditNote": "This case has a specific homebound challenge: the patient reports walking to the pharmacy 2 blocks away. The homebound narrative must be carefully crafted to address this while documenting that leaving IS a considerable and taxing effort.",
        "options": [
          {
            "id": "o-hb-a",
            "label": "Patient is homebound due to shortness of breath.",
            "isCorrect": false,
            "rationale": "Physician order copy. No clinical evidence. No CMS language. Would fail immediately.",
            "whyTempting": "MD wrote it. SOB is real.",
            "failureReason": "Fails all CMS homebound documentation standards.",
            "realWorldConsequence": "A vague one-line homebound statement provides zero audit defense — the entire home health episode will be denied on review, requiring refund of all payments for every visit in the certification period.",
            "trapTags": [
              "copy-md-order",
              "homebound-language-fail"
            ]
          },
          {
            "id": "o-hb-b",
            "label": "Patient is homebound due to COPD requiring supplemental oxygen, DM, bipolar disorder, obesity, and deconditioning. Patient uses O2 continuously and has limited endurance. He cannot leave home safely without assistance.",
            "isCorrect": false,
            "rationale": "Lists diagnoses without functional description. \"Cannot leave home safely without assistance\" is a conclusion. Does not use CMS \"considerable and taxing effort\" language. Does not address the pharmacy walk issue.",
            "whyTempting": "Comprehensive diagnosis list. Mentions O2 dependency. Addresses safety. Sounds thorough.",
            "failureReason": "Diagnosis lists do not satisfy homebound requirements. Does not describe WHAT happens when the patient attempts to leave. Does not address the documented pharmacy walks which an auditor could use to challenge homebound status.",
            "realWorldConsequence": "Listing diagnoses without functional evidence and failing to address the documented pharmacy walk gives the auditor a ready-made basis for homebound denial and potential fraud investigation for billing a non-homebound patient.",
            "trapTags": [
              "homebound-language-fail"
            ]
          },
          {
            "id": "o-hb-c",
            "label": "Patient is NOT homebound — patient reports walking to pharmacy 2 blocks away when he feels like it. Home health services may not be covered. Recommend outpatient services instead.",
            "isCorrect": false,
            "rationale": "The pharmacy walk does NOT automatically disqualify homebound status. CMS criteria allow for infrequent, short-duration absences that require considerable and taxing effort. The patient's walk to the pharmacy is documented as desaturation to 82% with 12 feet of ambulation — walking 2 blocks would be extremely taxing and medically risky. The homebound determination must be based on the clinical assessment, not the patient's self-report alone.",
            "whyTempting": "Seems like the \"honest\" answer. If the patient walks to the pharmacy, how can he be homebound? Some clinicians fear fraud and over-correct by denying homebound status.",
            "failureReason": "Incorrectly interprets homebound criteria. The patient CAN leave — but CMS does not require inability to leave. The assessment demonstrates that leaving requires considerable and taxing effort (SpO2 82% after 12 feet). The pharmacy walk, if it occurs, IS with considerable and taxing effort.",
            "realWorldConsequence": "Incorrectly denying homebound status terminates all home health services for a patient with SpO2 of 82% on exertion and multiple medication emergencies — creating immediate patient safety risk and liability for harm from premature service termination.",
            "trapTags": [
              "homebound-language-fail",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "o-hb-d",
            "label": "Leaving home requires considerable and taxing effort due to severe exercise intolerance secondary to COPD (SpO2 drops from 89% to 82% with ambulation of only 12 feet on 3L NC, requiring 3-minute rest and 5 minutes to recover to 91%), continuous supplemental oxygen requirement (3L NC), severe dyspnea with prolonged expiratory phase (RR 24 at rest), morbid obesity (BMI 38.4) limiting mobility and endurance, and unsteady gait requiring furniture support for balance during ambulation. Patient reports occasional walk to pharmacy 2 blocks away — based on observed exertional desaturation and recovery time, any such trip constitutes a considerable and taxing effort with significant medical risk and would be infrequent, short in duration, and attributable to the medical necessity of obtaining medications. Absences from home are infrequent, short, and require considerable and taxing effort.",
            "isCorrect": true,
            "rationale": "Uses CMS language with specific clinical evidence. Directly addresses the pharmacy walk issue by reframing it as evidence of considerable and taxing effort rather than evidence against homebound status. Includes objective measurements (SpO2, RR, BMI, distance, recovery time). Does not overstate or understate. Proactively addresses the most likely audit challenge. Audit-proof.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-hb-e",
            "label": "Leaving home requires considerable and taxing effort. Patient has COPD and is on oxygen. He desaturates with ambulation and has shortness of breath. He is obese and has difficulty with mobility. Patient stays home most of the time.",
            "isCorrect": false,
            "rationale": "Has the CMS key phrase but lacks specific clinical measurements. \"On oxygen,\" \"desaturates,\" \"has difficulty\" are all vague. Does not address the pharmacy walk. \"Stays home most of the time\" is not a criterion.",
            "whyTempting": "Includes the magic phrase. Mentions relevant conditions. Sounds individualized.",
            "failureReason": "Lacks the objective clinical data that makes it defensible. An auditor comparing this to the rich SOC assessment would note the disconnect. Does not proactively address the pharmacy walk — leaving an audit vulnerability.",
            "realWorldConsequence": "An auditor will compare this vague narrative against the detailed SOC assessment and find the unaddressed pharmacy walk — this omission becomes the basis for homebound denial and recoupment of the full episode.",
            "trapTags": [
              "homebound-language-fail"
            ]
          },
          {
            "id": "o-hb-f",
            "label": "Patient is homebound due to psychiatric condition (bipolar disorder) that impairs his judgment and prevents safe community navigation. Patient demonstrates grandiosity and poor insight that puts him at risk when leaving home.",
            "isCorrect": false,
            "rationale": "Basing homebound status solely on a psychiatric condition is problematic: (1) the psychiatric symptoms described are not homebound criteria — poor judgment does not make someone homebound; (2) the respiratory and physical findings are far stronger homebound justifications; (3) using psychiatric symptoms as the primary homebound rationale could be challenged as discriminatory.",
            "whyTempting": "The psychiatric symptoms ARE concerning. Poor judgment IS a safety risk. This seems like an innovative approach to homebound justification.",
            "failureReason": "Psychiatric symptoms alone rarely satisfy homebound criteria unless they directly prevent the patient from leaving (e.g., severe agoraphobia). The physical findings (COPD, O2 dependency, desaturation, obesity) provide a much stronger homebound case. This approach is both clinically and legally weak.",
            "realWorldConsequence": "Basing homebound status solely on a psychiatric diagnosis provides weak audit defense compared to available respiratory evidence, and risks a civil rights complaint if the justification is perceived as stigmatizing mental illness.",
            "trapTags": [
              "homebound-language-fail",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "o-hb-g",
            "label": "Leaving home requires considerable and taxing effort. Patient requires continuous supplemental O2 at 3L NC. Ambulation causes severe desaturation (SpO2 82% after 12 feet) with prolonged recovery period. Patient has COPD with recent respiratory failure requiring BiPAP. He is morbidly obese with a BMI of 38.4. He can only ambulate short distances before becoming severely dyspneic. The portable concentrator limits his range. Patient is unable to leave home except for medical appointments, and such absences are infrequent and of short duration.",
            "isCorrect": false,
            "rationale": "Strong clinical content but references \"recent respiratory failure requiring BiPAP\" — this was an inpatient finding and is no longer current. Including resolved inpatient conditions in the homebound narrative creates audit risk if a reviewer questions whether you are inflating the current status with historical findings. More critically, this option does NOT address the pharmacy walk disclosure, leaving a major audit vulnerability unaddressed.",
            "whyTempting": "Excellent clinical detail. Specific measurements. Mentions the portable concentrator limitation. Uses CMS language. Seems comprehensive.",
            "failureReason": "References a resolved inpatient condition. Fails to address the documented pharmacy walk — an auditor will find this information and question why the homebound narrative ignored it. The correct answer must proactively address it.",
            "realWorldConsequence": "Including resolved inpatient findings inflates the current clinical picture, and the unaddressed pharmacy walk gives the auditor a ready-made basis for denial — resulting in full episode recoupment and a documentation integrity flag.",
            "trapTags": [
              "homebound-language-fail",
              "timing-problem"
            ]
          }
        ]
      },
      {
        "id": "o-skilled-need",
        "formBoxNumber": "BOX 18",
        "label": "Skilled Nursing Orders / Skilled Need",
        "type": "single-select",
        "domain": "skilled-need",
        "correctAnswerIds": [
          "o-sn-d"
        ],
        "auditNote": "For a complex respiratory + psychiatric + metabolic patient, skilled need must address the intersection of conditions, not just list individual disease management tasks.",
        "options": [
          {
            "id": "o-sn-a",
            "label": "SN for respiratory assessment, O2 management, medication management, and DM monitoring per physician order.",
            "isCorrect": false,
            "rationale": "Copy of physician order. Vague. Does not describe what makes these services skilled.",
            "whyTempting": "Matches the order exactly.",
            "failureReason": "Boilerplate. Not defensible under audit.",
            "realWorldConsequence": "A boilerplate skilled need statement copied from the physician order provides no evidence that a registered nurse is required — every SN visit billed under this order becomes a recoverable overpayment on audit.",
            "trapTags": [
              "copy-md-order",
              "skilled-illusion"
            ]
          },
          {
            "id": "o-sn-b",
            "label": "SN for: (1) Patient education on COPD self-management including inhaler technique, O2 safety, trigger avoidance, and action plan for exacerbation symptoms; (2) Teaching patient importance of medication adherence; (3) BG monitoring and DM education including diet, exercise, and sick-day management; (4) Monitoring psychiatric status and reporting to psychiatrist.",
            "isCorrect": false,
            "rationale": "Almost entirely education-focused. \"Teaching importance of medication adherence\" is not skilled when the barrier to adherence is psychiatric (bipolar), not lack of knowledge. \"Monitoring psychiatric status\" without skilled assessment parameters is vague. Education alone does not justify the level of SN frequency needed.",
            "whyTempting": "Education is a core SN function. Each topic IS important. COPD self-management education is evidence-based. This covers all clinical areas.",
            "failureReason": "Education-only skilled need fails to justify SN visits when the patient's primary barrier is psychiatric non-adherence, not knowledge deficit. The patient knows WHAT to do — he chooses not to. Teaching alone will not resolve the adherence problem.",
            "realWorldConsequence": "An education-only skilled need for a patient whose non-adherence is driven by bipolar disorder — not lack of knowledge — will fail medical necessity review because teaching cannot resolve a psychiatric barrier.",
            "trapTags": [
              "skilled-illusion",
              "intervention-not-skilled"
            ]
          },
          {
            "id": "o-sn-c",
            "label": "SN for: comprehensive respiratory assessment including auscultation, SpO2 trending, O2 titration, and nebulizer treatment supervision; medication management for complex multi-system regimen; blood glucose monitoring and insulin initiation if ordered; psychiatric medication monitoring; lab coordination.",
            "isCorrect": false,
            "rationale": "Contains a critical assumption error: \"insulin initiation if ordered\" — insulin has NOT been ordered. The patient is on oral hypoglycemics (metformin + glipizide). Planning for a medication that has not been ordered does not belong on the 485. Also, \"nebulizer treatment supervision\" is not skilled — the patient can self-administer nebulizer treatments.",
            "whyTempting": "Sounds comprehensive and anticipatory. Mentioning insulin seems proactive given the A1C 10.2%. Most items are legitimate skilled services.",
            "failureReason": "Cannot include services/medications not ordered. Anticipatory planning does not go on the 485 — it goes in care coordination notes. Nebulizer supervision is not inherently skilled.",
            "realWorldConsequence": "Including unordered medications on the 485 creates a discrepancy caught during order reconciliation — the physician may refuse to sign, and billing for unordered services constitutes fraud.",
            "trapTags": [
              "intervention-not-ordered",
              "skilled-illusion"
            ]
          },
          {
            "id": "o-sn-d",
            "label": "SN for: (1) Respiratory assessment and management — auscultation, SpO2 trending at rest and with activity, O2 titration within ordered parameters (2-4L NC), nebulizer equipment assessment and maintenance education (current equipment contaminated with mold requiring replacement), inhaler technique assessment and retraining, assessment of environmental respiratory triggers (cat litter adjacent to sleeping area, cluttered space), and COPD action plan development with exacerbation recognition; (2) Complex medication reconciliation and management — immediate priorities: verify azithromycin initiated (currently not started), recalculate and supervise corrected prednisone taper per Dr. Holt (20mg x 5d → 10mg x 5d), assess steroid-induced hyperglycemia impact on DM regimen (prednisone + glipizide interaction), ongoing: 9-medication regimen management across 4 disease processes with documented non-adherence patterns complicated by psychiatric status, VPA level monitoring at week 2 and assessment of therapeutic response; (3) DM monitoring — BG assessment (fasting and post-prandial), correlation of BG trends with prednisone taper, medication effectiveness assessment, physician notification protocol if BG consistently >300; (4) Psychiatric-medical interface — documented behavioral observations at SOC (pressured speech, grandiosity, irritability) communicated to Dr. Rowan (psychiatry); ongoing psychiatric status monitoring within SN scope (behavioral observations, medication adherence patterns, VPA side effects, safety risk assessment); coordination between medical and psychiatric providers; (5) Labs: BMP weekly x 4 weeks, VPA level week 2, A1C week 8.",
            "isCorrect": true,
            "rationale": "Addresses every documented clinical finding. Identifies the contaminated nebulizer, the azithromycin gap, the prednisone taper correction, the steroid-DM interaction, and the psychiatric concerns — all within SN scope. Correctly positions psychiatric monitoring as \"behavioral observations within SN scope\" rather than claiming psychiatric treatment. Uses objective findings from SOC. Audit-proof.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-sn-e",
            "label": "SN for: psychiatric stabilization and behavioral health management. Patient requires skilled psychiatric nursing for bipolar disorder with active manic features. SN to implement behavioral interventions, medication compliance strategies, and crisis intervention protocols. Coordinate with psychiatry for medication adjustments.",
            "isCorrect": false,
            "rationale": "Frames the SN role as psychiatric nursing — this is a scope issue. Home health SN can observe, document, and report psychiatric symptoms, but \"psychiatric stabilization\" and \"behavioral interventions\" are psychiatric specialty functions. The referral is for COPD management, not psychiatric treatment. Also, \"medication compliance strategies\" for a patient whose non-adherence is driven by bipolar symptoms requires psychiatric intervention, not general SN education.",
            "whyTempting": "The psychiatric component IS arguably the most dangerous aspect of this case. Addressing it directly seems critical. \"Psychiatric nursing\" sounds like the right level of care.",
            "failureReason": "Scope mismatch. Home health SN is not psychiatric nursing. The SN role is to monitor, document, report, and coordinate — not to provide psychiatric treatment. This skilled need statement misrepresents the scope of home health SN services.",
            "realWorldConsequence": "Billing Medicare for psychiatric stabilization and behavioral interventions under home health SN constitutes billing for services outside the scope of the benefit — claims will be denied and the agency may face sanctions.",
            "trapTags": [
              "scope-mismatch",
              "skilled-illusion"
            ]
          },
          {
            "id": "o-sn-f",
            "label": "SN for monitoring patient and making sure he takes his medications correctly. Will check breathing and blood sugar each visit. Will teach patient about his diseases and how to manage them. Will report any concerns to the doctor.",
            "isCorrect": false,
            "rationale": "Written at a non-professional level. \"Making sure he takes medications\" is not a skilled service. \"Check breathing and blood sugar\" lacks skilled assessment specificity. \"Teach about diseases\" is generic. \"Report concerns\" is a task. None of these descriptions independently require the skills of a licensed nurse.",
            "whyTempting": "These ARE things the nurse will do for this patient. The simplicity seems honest. It describes real activities.",
            "failureReason": "No item described requires skilled nursing as defined by CMS. An HHA or family member could remind about medications, observe breathing difficulty, check BG with a glucometer, and call the doctor. This skilled need would not support a single billable SN visit.",
            "realWorldConsequence": "None of these activities meet CMS skilled nursing definitions — every visit billed under this order is a non-covered service, exposing the agency to full SN payment recoupment and potential Medicare participation exclusion.",
            "trapTags": [
              "skilled-illusion",
              "intervention-not-skilled"
            ]
          },
          {
            "id": "o-sn-g",
            "label": "SN for: (1) Administration of IV bronchodilators and steroids for acute COPD management; (2) CPAP titration and management; (3) Psychiatric assessment using standardized tools (PHQ-9, GAD-7, BIMS, MDQ) with treatment plan development; (4) Nutritional counseling for obesity management; (5) Smoking cessation counseling.",
            "isCorrect": false,
            "rationale": "Multiple errors: IV bronchodilators are not ordered (patient has nebulizer). CPAP titration is a sleep medicine/respiratory therapy function, not SN. Psychiatric assessment with treatment plan development is outside SN scope. Nutritional counseling is not a skilled nursing service. Smoking cessation counseling — the patient quit 3 years ago.",
            "whyTempting": "Each item addresses a real clinical concern. They all sound like they require professional expertise. This seems like the most \"comprehensive\" option.",
            "failureReason": "Nearly every item is either not ordered, not within SN scope, or not applicable to this patient. This option tests whether the clinician distinguishes between \"things that should happen\" and \"things SN does within the plan of care.\"",
            "realWorldConsequence": "Listing IV medications not ordered, CPAP titration outside SN scope, and smoking cessation for a 3-year ex-smoker demonstrates fundamental clinical incompetence — the physician will likely refuse to sign the 485.",
            "trapTags": [
              "intervention-not-ordered",
              "scope-mismatch",
              "documentation-inconsistency"
            ]
          }
        ]
      },
      {
        "id": "o-visit-freq",
        "formBoxNumber": "BOX 21",
        "label": "Visit Frequency",
        "type": "single-select",
        "domain": "visit-frequency",
        "correctAnswerIds": [
          "o-vf-c"
        ],
        "auditNote": "Frequency must reflect the high acuity at SOC (medication emergencies, psychiatric concerns, respiratory instability) while tapering appropriately. The verbal order from Dr. Holt for increased frequency must be reconciled.",
        "options": [
          {
            "id": "o-vf-a",
            "label": "SN 2W1 x 2 wks, 1W3 x 6 wks. PT 2W1 x 2 wks, 1W3 x 6 wks. HHA 2x/wk x 4 wks.",
            "isCorrect": false,
            "rationale": "This is the original physician order, written BEFORE the SOC findings. The physician verbally increased SN to 3x/week for the first 2 weeks. Using the pre-SOC frequency ignores both the SOC findings and the verbal order update.",
            "whyTempting": "Matches the written order. Seems standard for COPD management.",
            "failureReason": "Does not reflect the SOC assessment or the physician's verbal order for increased frequency. Undertreats the immediate clinical urgency.",
            "realWorldConsequence": "Using pre-SOC frequency ignores multiple medication emergencies — the patient remains on a contaminated nebulizer and incorrect steroid dose between visits, risking respiratory decompensation and readmission within days.",
            "trapTags": [
              "copy-md-order",
              "frequency-mismatch"
            ]
          },
          {
            "id": "o-vf-b",
            "label": "SN 5W1 x 2 wks, 3W3 x 2 wks, 2W5 x 4 wks. PT 3W1 x 2 wks, 2W3 x 2 wks, 1W5 x 4 wks. HHA 3x/wk x 4 wks.",
            "isCorrect": false,
            "rationale": "SN 5x/week is excessive. While the clinical picture is complex, the patient does not require near-daily SN visits. The respiratory condition is stable (not in acute failure), medications can be set up with pill organization, and the primary adherence barrier (psychiatric) will not be resolved by more frequent nursing visits. Over-utilization flags.",
            "whyTempting": "The clinical picture IS severe. More visits seem safer. The medication issues and psychiatric concerns create urgency.",
            "failureReason": "Over-utilization. The adherence problem is psychiatric, not frequency-dependent. Adding more SN visits will not fix a bipolar-driven non-adherence pattern. Medicare would deny this frequency.",
            "realWorldConsequence": "Five SN visits per week for a stable patient will be flagged as over-utilization, triggering a Targeted Probe and Educate review that could place the entire agency under pre-payment review for all claims.",
            "trapTags": [
              "frequency-mismatch"
            ]
          },
          {
            "id": "o-vf-c",
            "label": "SN 3W1 x 2 wks (per Dr. Holt verbal order — to be authenticated; address medication emergencies: azithromycin initiation, prednisone taper correction, nebulizer replacement, BG monitoring, psychiatric observation and report to Dr. Rowan), 2W3 x 2 wks, 1W5 x 4 wks. PT 2W1 x 2 wks, 2W3 x 2 wks, 1W5 x 4 wks. HHA 2x/wk x 4 wks, reassess.",
            "isCorrect": true,
            "rationale": "Reflects the physician's verbal order with notation about authentication. Front-loads SN to address the medication emergencies discovered at SOC. Tapers as medication issues resolve and respiratory status stabilizes. PT frequency is appropriate for deconditioning in a COPD patient. HHA meets documented ADL need. Clinical rationale embedded. Audit-defensible.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-vf-d",
            "label": "SN 3W1 x 2 wks, 2W3 x 2 wks, 1W5 x 4 wks. PT 2W1 x 2 wks, 1W3 x 6 wks. HHA 2x/wk x 4 wks. MSW 1x for psychosocial assessment and resource connection.",
            "isCorrect": false,
            "rationale": "SN frequency is correct. However, MSW was not ordered. While MSW referral is clinically appropriate (psychiatric case management gap, social isolation, resource needs), adding MSW to the 485 without a physician order is non-compliant. Also does not reference the verbal order authentication.",
            "whyTempting": "MSW seems essential for this patient. SN frequency is right. Adding MSW shows clinical awareness.",
            "failureReason": "MSW not ordered. Verbal order for SN increase not documented as needing authentication. The correct action is to recommend MSW to the physician and obtain an order.",
            "realWorldConsequence": "Adding an unordered discipline (MSW) means the physician cannot legally sign the plan — delaying start of care, and any MSW visits provided before the order is obtained are unbillable and constitute unauthorized services.",
            "trapTags": [
              "discipline-not-justified",
              "intervention-not-ordered"
            ]
          },
          {
            "id": "o-vf-e",
            "label": "SN 3W1 x 2 wks, 2W3 x 2 wks, 1W5 x 4 wks. PT 3W1 x 2 wks, 2W3 x 2 wks, 1W5 x 4 wks. RT (Respiratory Therapy) 2W1 x 2 wks, 1W3 x 6 wks. HHA 2x/wk x 4 wks.",
            "isCorrect": false,
            "rationale": "Respiratory Therapy (RT) is not a separately billable discipline under Medicare home health. Respiratory assessment and nebulizer management are SN functions in home health. Adding RT as a discipline demonstrates misunderstanding of the home health benefit structure.",
            "whyTempting": "The patient has severe COPD and needs respiratory management. RT is a real profession. RT involvement seems appropriate for a patient on nebulizers and O2.",
            "failureReason": "RT is not a Medicare home health discipline. All respiratory management falls under SN scope in home health. This is a benefit structure knowledge gap.",
            "realWorldConsequence": "Respiratory Therapy is not a Medicare home health discipline — repeated submissions will flag the agency for coding education mandates or compliance action.",
            "trapTags": [
              "discipline-not-justified",
              "scope-mismatch"
            ]
          },
          {
            "id": "o-vf-f",
            "label": "SN 1W1 x 8 wks. PT 1W1 x 8 wks. No HHA — patient is independent with ADLs.",
            "isCorrect": false,
            "rationale": "Drastically undertreats. SN 1x/week when the patient has multiple medication emergencies at SOC. PT 1x/week for COPD deconditioning is below standard. Eliminating HHA ignores documented bathing assistance need. \"Independent with ADLs\" is only partially true — patient cannot bathe independently.",
            "whyTempting": "Minimalist approach avoids over-utilization concerns. Patient IS relatively independent for ADLs compared to the other cases.",
            "failureReason": "Under-treatment creates patient safety risk. The medication emergencies alone justify higher SN frequency. Eliminating HHA when bathing assistance is documented is non-compliant with the assessment.",
            "realWorldConsequence": "Weekly SN visits leave a patient with multiple medication emergencies without adequate monitoring — the patient is at high risk for respiratory failure and readmission, creating agency liability for adverse events during coverage gaps.",
            "trapTags": [
              "frequency-mismatch",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "o-vf-g",
            "label": "SN PRN — patient is non-adherent and unlikely to benefit from scheduled visits. PT PRN. HHA PRN. Recommend discharge if patient refuses to participate in care.",
            "isCorrect": false,
            "rationale": "PRN-only frequency is not certifiable. A patient's non-adherence history does not justify withholding scheduled care — it justifies more intensive intervention. Recommending discharge for non-participation at SOC is premature; the plan should include adherence strategies. This approach is discriminatory and clinically inappropriate.",
            "whyTempting": "Seems realistic — \"why schedule visits if he won't comply?\" Some clinicians feel frustrated by non-adherent patients and may select this.",
            "failureReason": "PRN is not a valid frequency for the 485. Non-adherence is a clinical challenge to be managed, not a reason to deny services. This would be a compliance violation and potential discrimination issue.",
            "realWorldConsequence": "PRN-only frequency is not certifiable under Medicare — the 485 will be rejected, and documenting \"unlikely to benefit\" based on psychiatric non-adherence could constitute disability discrimination with civil liability.",
            "trapTags": [
              "frequency-mismatch",
              "documentation-inconsistency"
            ]
          }
        ]
      },
      {
        "id": "o-goals",
        "formBoxNumber": "BOX 22",
        "label": "Goals / Rehabilitation Potential",
        "type": "single-select",
        "domain": "goals",
        "correctAnswerIds": [
          "o-gl-e"
        ],
        "auditNote": "Goals for non-adherent patients with psychiatric comorbidities must be realistic about barriers while remaining measurable. Goals should not assume the patient will suddenly become compliant.",
        "options": [
          {
            "id": "o-gl-a",
            "label": "Patient will comply with all medications as prescribed and maintain SpO2 above 92% and BG below 200 within 2 weeks. Rehab potential: Good if compliant.",
            "isCorrect": false,
            "rationale": "\"Comply with all medications\" is not realistic for a patient with bipolar disorder and documented lifelong non-adherence. SpO2 >92% on room air is unrealistic for severe COPD. BG <200 within 2 weeks while on prednisone taper is unrealistic. \"Good if compliant\" conditions the prognosis on something unlikely to happen.",
            "whyTempting": "Addresses the main issues (adherence, oxygenation, glucose). Seems outcome-focused. Compliance IS the critical factor.",
            "failureReason": "Unrealistic targets that do not account for documented barriers. Conditioning rehab potential on compliance demonstrates lack of understanding of psychiatric impact on medical management.",
            "realWorldConsequence": "Setting goals the patient cannot physiologically or psychiatrically achieve guarantees documented \"failure\" at every reassessment — this pattern becomes audit evidence that services were not effective, justifying denial of recertification.",
            "trapTags": [
              "non-measurable-goal",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "o-gl-b",
            "label": "Goals: (1) SN will manage medications. (2) SN will monitor breathing. (3) PT will improve endurance. (4) Patient will learn about his conditions. Rehab potential: Fair.",
            "isCorrect": false,
            "rationale": "Task-based, staff-centered, non-measurable. No targets, no timeframes, no baselines.",
            "whyTempting": "Concise. Covers the key areas. Seems practical.",
            "failureReason": "Fails all SMART criteria. Task-based goals. No measurable outcomes.",
            "realWorldConsequence": "Non-measurable, staff-centered goals make it impossible to demonstrate patient progress — without documented improvement, the MAC will deny recertification and may retroactively recoup the initial episode.",
            "trapTags": [
              "task-based-goal",
              "vague-goal",
              "non-measurable-goal"
            ]
          },
          {
            "id": "o-gl-c",
            "label": "Goals: (1) SpO2 maintained ≥88% at rest on 2-3L NC consistently by week 4. (2) Complete prednisone taper and azithromycin course without complication. (3) BG below 150 consistently by week 4. (4) Patient will ambulate 200 feet with O2 without desaturation below 85% by week 8. (5) Patient will demonstrate correct inhaler technique. (6) Psychiatric symptoms will resolve with medication optimization. Rehab potential: Fair.",
            "isCorrect": false,
            "rationale": "Several issues: BG <150 consistently by week 4 is unrealistic during prednisone taper + glipizide + A1C 10.2% + psychiatric non-adherence. \"Psychiatric symptoms will resolve\" is not within the scope of home health to treat and is not a realistic goal. \"Demonstrate correct inhaler technique\" is a teaching metric, not a clinical outcome. SpO2 goal is reasonable but should be \"on current O2 support\" not specify L/min.",
            "whyTempting": "Mostly specific and measurable. Addresses respiratory, medication, DM, functional, and psychiatric components. Has timeframes.",
            "failureReason": "BG target unrealistic during steroid taper. Psychiatric symptom resolution is out of scope. Inhaler technique is a teaching metric, not an outcome goal.",
            "realWorldConsequence": "Promising psychiatric symptom resolution outside SN scope creates false expectations — when symptoms don't resolve, it appears as treatment failure rather than a scope limitation, undermining the case for continued services.",
            "trapTags": [
              "non-measurable-goal",
              "scope-mismatch",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "o-gl-d",
            "label": "Goals: Patient will not be re-hospitalized during the certification period. Patient will achieve A1C below 8.0 by end of certification. Patient will attend all psychiatric follow-up appointments. Patient will quit using oxygen by week 6. Rehab potential: Good.",
            "isCorrect": false,
            "rationale": "\"No re-hospitalization\" is an agency metric. A1C below 8.0 in 60 days from 10.2% is unrealistic. \"Attend psychiatric appointments\" is an attendance metric. \"Quit using oxygen\" is medically inappropriate — the patient needs continuous O2. \"Good\" rehab potential ignores all documented barriers.",
            "whyTempting": "Re-hospitalization prevention is a CMS priority. A1C is an evidence-based metric. Psychiatric follow-up is important. Reducing O2 dependency seems like a reasonable goal.",
            "failureReason": "Multiple unrealistic/inappropriate goals. Discontinuing O2 could cause harm. A1C target is not achievable in 60 days from 10.2%. Rehab potential overestimates.",
            "realWorldConsequence": "A goal to discontinue oxygen for a patient requiring continuous O2 is medically dangerous — if acted upon, the patient could suffer severe hypoxemia, cognitive impairment, cardiac arrhythmia, or death, creating catastrophic liability.",
            "trapTags": [
              "non-measurable-goal",
              "documentation-inconsistency"
            ]
          },
          {
            "id": "o-gl-e",
            "label": "Goals: (1) Respiratory: SpO2 maintained ≥88% at rest on current O2 support, exertional SpO2 nadir improves from 82% to ≥85% with 12-foot ambulation on current O2 by week 4; respiratory rate ≤20 at rest by week 4; correct inhaler and nebulizer technique with clean, functional equipment maintained by week 2. (2) Medication safety: Prednisone taper completed correctly per recalculated schedule; azithromycin course completed; ≤2 medication errors per week by week 4 as verified by pill count (baseline: unable to identify medications taken, prednisone taper error, azithromycin not started). (3) DM: Fasting BG trending toward <250 during prednisone taper, then <200 post-taper (week 3+); patient demonstrates ability to check BG and records results ≥80% of the time by week 4. (4) Functional: Ambulate 50 feet with O2 and rolling walker, maintaining SpO2 ≥85%, with ≤2 minute rest needed, by week 8 (baseline: 12 feet, SpO2 82%, 3-min rest). (5) Safety/Psych: Psychiatric medication (VPA) at therapeutic level by week 2 (lab pending); patient engages with psychiatric follow-up (SN to coordinate with Dr. Rowan); home safety issues addressed (smoke detector, nebulizer replacement, clutter reduction) by week 3. Rehab potential: Fair — significant barriers include psychiatric non-adherence pattern, limited insight, no local support system, BMI 38.4, and OSA non-compliance. Achievable goals are condition stabilization and improved self-management, not full disease resolution.",
            "isCorrect": true,
            "rationale": "Every goal is based on SOC baselines, has realistic measurable targets, accounts for documented barriers (prednisone effect on BG, psychiatric non-adherence), and is tied to skilled interventions. Medication goal uses pill count as an objective measure. DM goals adjust for steroid taper timeline. Functional goal is progressive with safety parameters. Psychiatric goals stay within SN scope (coordination, lab monitoring) without claiming psychiatric treatment outcomes. Rehab potential is realistic and specific about barriers. Audit-proof.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-gl-f",
            "label": "Goals: (1) Patient will manage all respiratory equipment independently. (2) Patient will maintain medication adherence ≥90% verified by self-report. (3) BG will normalize. (4) Patient will accept psychiatric treatment. (5) Patient will participate in pulmonary rehab program. Rehab potential: Good with adherence.",
            "isCorrect": false,
            "rationale": "\"Manage equipment independently\" — needs specificity. \"Adherence ≥90% by self-report\" — self-report is unreliable in this patient (he said he took \"most\" medications but had not started azithromycin). \"BG will normalize\" — not defined. \"Accept psychiatric treatment\" — not a measurable clinical goal. \"Participate in pulmonary rehab\" — not ordered and patient is homebound. \"Good with adherence\" — circular.",
            "whyTempting": "Addresses key concerns. Independence is desirable. 90% adherence seems like a reasonable target. Pulmonary rehab is evidence-based for COPD.",
            "failureReason": "Self-report adherence measurement in a non-adherent patient is unreliable. Goals that depend on patient acceptance of treatment they have historically rejected are not achievable. Pulmonary rehab is not part of the home health plan.",
            "realWorldConsequence": "Using self-reported adherence as the measurement tool for a patient who claimed compliance while medications sat unopened produces fraudulently optimistic progress notes — auditors will compare against pill counts and lab values.",
            "trapTags": [
              "non-measurable-goal",
              "vague-goal",
              "intervention-not-ordered"
            ]
          },
          {
            "id": "o-gl-g",
            "label": "Goals: Stabilize respiratory status, optimize medications, and prevent readmission. Long-term: improve quality of life and functional independence. Rehab potential: Guarded.",
            "isCorrect": false,
            "rationale": "Entirely non-measurable. \"Stabilize,\" \"optimize,\" \"prevent,\" \"improve\" — none defined. An auditor cannot assess whether any goal was met.",
            "whyTempting": "Covers the right themes. \"Guarded\" rehab potential seems appropriate. Reads professionally.",
            "failureReason": "Zero measurable criteria. This is a care plan theme statement, not a goals section.",
            "realWorldConsequence": "Completely non-measurable goals provide no basis for demonstrating skilled need or patient progress — every visit billed under this plan is vulnerable to denial on the grounds that outcomes cannot be evaluated.",
            "trapTags": [
              "vague-goal",
              "non-measurable-goal"
            ]
          }
        ]
      },
      {
        "id": "o-interventions",
        "formBoxNumber": "BOX 18/21",
        "label": "Interventions / Orders",
        "type": "multi-select",
        "domain": "interventions",
        "correctAnswerIds": [
          "o-int-a",
          "o-int-d",
          "o-int-f",
          "o-int-h"
        ],
        "auditNote": "Interventions must address the immediate medication emergencies, the ongoing respiratory management, the psychiatric-medical interface, and the environmental safety concerns — all within appropriate scope.",
        "options": [
          {
            "id": "o-int-a",
            "label": "SN comprehensive respiratory assessment each visit: auscultation, SpO2 at rest and with standardized exertion test (document distance, O2 rate, nadir SpO2, recovery time), RR and work of breathing assessment, O2 titration within 2-4L parameters, nebulizer equipment inspection (replace contaminated tubing/filter immediately), inhaler technique assessment with return demonstration, COPD action plan education (zone system: green/yellow/red), environmental trigger assessment and modification plan (cat litter relocation discussion, clutter reduction for airflow and safety, smoke detector installation coordination).",
            "isCorrect": true,
            "rationale": "Comprehensive, specific, skilled, and tied to documented findings. Addresses the contaminated nebulizer as an immediate safety issue. Environmental assessment is documented and relevant. COPD action plan education is evidence-based. Each component independently requires nursing skill.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-int-b",
            "label": "SN to initiate CPAP therapy and titrate settings for OSA management. Educate patient on CPAP use and compliance. Coordinate with sleep medicine for follow-up.",
            "isCorrect": false,
            "rationale": "CPAP initiation and titration is a respiratory therapy/sleep medicine function, not SN scope. The patient has a CPAP but is non-compliant — the SN role is to assess barriers to CPAP use, educate on the importance of compliance, and coordinate with the prescribing provider. Initiating and titrating CPAP settings is outside SN scope.",
            "whyTempting": "The patient HAS a CPAP and IS non-compliant. OSA worsens his respiratory status. Addressing CPAP seems critical.",
            "failureReason": "Scope mismatch. SN can educate and encourage CPAP use but cannot initiate or titrate settings. The correct intervention is to assess CPAP barriers and coordinate with the provider.",
            "realWorldConsequence": "A nurse titrating CPAP settings without respiratory therapy credentials or a physician titration order is practicing outside scope — adverse effects (barotrauma, aspiration) create personal malpractice and negligent supervision liability.",
            "trapTags": [
              "scope-mismatch"
            ]
          },
          {
            "id": "o-int-c",
            "label": "SN to set up weekly pill organizer, call patient daily to remind about medications, and visit pharmacy to pick up refills.",
            "isCorrect": false,
            "rationale": "Pill organizer setup can be a component of skilled medication management if part of a comprehensive assessment. However, daily phone calls for medication reminders are not a skilled service. Pharmacy pickup is not a nursing function.",
            "whyTempting": "Addresses the medication adherence problem directly. Pill organizers are practical. Daily check-ins seem caring.",
            "failureReason": "Medication reminders and pharmacy errands are not skilled nursing. If daily medication reminders are needed, this suggests the patient needs a different level of service (personal care, structured care setting) rather than skilled nursing.",
            "realWorldConsequence": "Billing skilled nursing rates for medication reminders and pharmacy errands constitutes waste under the False Claims Act — OIG audits specifically target this pattern, with findings resulting in treble damages and per-claim penalties.",
            "trapTags": [
              "intervention-not-skilled"
            ]
          },
          {
            "id": "o-int-d",
            "label": "SN complex medication reconciliation and management: (1) IMMEDIATE — verify azithromycin started today; recalculate remaining prednisone taper per Dr. Holt (20mg x 5d → 10mg x 5d), create written taper schedule with large print and daily check-off; assess and document all current medication bottles vs. discharge orders (reconciliation); (2) ONGOING — pill organizer setup with weekly verification by pill count; assess steroid-hyperglycemia interaction (prednisone + glipizide); BG monitoring per protocol with MD notification if >300; medication education using teach-back method adapted for patient's communication style; assess VPA adherence and side effects (GI, tremor, sedation); coordinate VPA level draw at week 2; assess barriers to adherence (psychiatric symptoms vs. knowledge vs. access vs. cost) and develop individualized adherence strategies; (3) LABS — BMP weekly x 4 wks (renal function, electrolytes), VPA level week 2, A1C week 8.",
            "isCorrect": true,
            "rationale": "Addresses every medication issue documented at SOC. Immediate priorities are correct (azithromycin, prednisone taper). Ongoing management includes the steroid-DM interaction, VPA monitoring, and adherence assessment. Uses objective verification (pill count, not self-report). Acknowledges that adherence barriers may be multifactorial. Labs are correct. Audit-proof.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-int-e",
            "label": "SN to perform psychiatric assessment using PHQ-9, GAD-7, and Columbia Suicide Scale at each visit. Develop behavioral health treatment plan. Initiate cognitive behavioral therapy for medication adherence. Contact psychiatrist if patient becomes non-compliant.",
            "isCorrect": false,
            "rationale": "Multiple scope issues: standardized psychiatric screening at every visit is excessive and inappropriate for SN. CBT is a psychotherapy modality requiring specific training and is outside SN scope. \"Behavioral health treatment plan\" development is psychiatric/psychology scope. The role of SN is to observe, document, report, and coordinate — not to provide psychiatric treatment.",
            "whyTempting": "The psychiatric component IS critical. Using standardized tools seems evidence-based. CBT for adherence is supported in literature. This seems thorough.",
            "failureReason": "Scope mismatch throughout. SN performing CBT, developing psychiatric treatment plans, and administering psychiatric screening batteries at every visit is outside home health SN scope and would not be reimbursable.",
            "realWorldConsequence": "Billing SN visits for CBT and psychiatric treatment plan development constitutes billing for services requiring separate licensure — this is both a scope violation and a false claim with exposure to professional and federal penalties.",
            "trapTags": [
              "scope-mismatch",
              "intervention-not-ordered"
            ]
          },
          {
            "id": "o-int-f",
            "label": "SN psychiatric-medical interface monitoring: document behavioral observations each visit (speech patterns, affect, mood, sleep, grandiosity, irritability, insight, judgment) using consistent language for psychiatric provider communication; assess impact of psychiatric status on medical management (adherence, safety decisions, self-care); communicate SOC behavioral findings to Dr. Rowan (psychiatry) and coordinate follow-up plan; monitor VPA therapeutic response and side effects within SN scope; assess for psychiatric medication-medical medication interactions; if psychiatric status deteriorates (safety risk to self or others), activate crisis protocol. Coordinate care between Dr. Holt (medical) and Dr. Rowan (psychiatry).",
            "isCorrect": true,
            "rationale": "Correctly positions SN role at the psychiatric-medical interface: observe, document, report, coordinate. Does not claim psychiatric treatment. Uses behavioral observation language appropriate for SN scope. Identifies the specific psychiatrist for communication. Includes safety protocol. Addresses VPA monitoring within SN scope (side effects, therapeutic response). Audit-defensible.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-int-g",
            "label": "PT to initiate aggressive conditioning program: treadmill training progressing to 30 minutes, resistance training with weights, balance exercises on unstable surfaces, and community ambulation training for pharmacy trips.",
            "isCorrect": false,
            "rationale": "Wildly inappropriate for this patient. There is no treadmill in the home (this is home health PT). Resistance training with weights for a patient who desaturates to 82% after 12 feet is dangerous. Unstable surface balance training is a fall risk. \"Community ambulation for pharmacy trips\" contradicts homebound status.",
            "whyTempting": "Aggressive therapy sounds like it would produce the best outcomes. Each exercise type IS evidence-based for deconditioning. Community ambulation is a real functional goal.",
            "failureReason": "Completely inappropriate for the clinical presentation. Dangerous exercise intensity for a severe COPD patient. Community ambulation training undermines homebound status. No home health patient has a treadmill prescribed as part of PT.",
            "realWorldConsequence": "Prescribing treadmill training for a patient who desaturates to 82% after 12 feet risks exercise-induced respiratory arrest — and documenting \"community ambulation\" provides written evidence against homebound status, enabling retroactive episode denial.",
            "trapTags": [
              "intervention-not-ordered",
              "documentation-inconsistency",
              "homebound-language-fail"
            ]
          },
          {
            "id": "o-int-h",
            "label": "PT: Progressive respiratory and functional conditioning program — graded activity with continuous SpO2 and HR monitoring; breathing retraining (pursed lip breathing, diaphragmatic breathing) coordinated with activity; seated strengthening exercises progressing to standing as tolerated (monitor SpO2 ≥85% during activity); transfer training with energy conservation techniques; progressive ambulation with O2 (baseline: 12 feet → goal: 50 feet with maintenance of SpO2 ≥85%); home exercise program with respiratory precautions (activity diary, rest periods, when to stop); coordinate with SN on medication timing for optimal exercise tolerance; educate on energy conservation for daily activities.",
            "isCorrect": true,
            "rationale": "Appropriate for a severe COPD patient — starts seated, progresses based on physiologic tolerance. SpO2 monitoring during activity is essential. Breathing retraining is evidence-based. Energy conservation is a key COPD PT intervention. Progressive ambulation with safety parameters. SN coordination for medication timing. Audit-defensible.",
            "whyTempting": "N/A — correct answer.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-int-i",
            "label": "HHA to perform daily nebulizer treatments, administer medications, and monitor SpO2 levels between SN visits.",
            "isCorrect": false,
            "rationale": "HHA scope violations: HHAs cannot administer nebulizer treatments (medication administration), cannot administer medications, and SpO2 monitoring with clinical interpretation is outside HHA scope. The patient can self-administer nebulizer treatments.",
            "whyTempting": "Seems like good use of the HHA to extend SN-level monitoring. Daily nebulizer support sounds helpful.",
            "failureReason": "Multiple scope violations. HHA role is personal care assistance (bathing, grooming, etc.), not medication administration or clinical monitoring.",
            "realWorldConsequence": "An HHA administering nebulizer treatments and medications is practicing outside their certification — resulting adverse events create negligent delegation liability, potential criminal charges, and denial of all HHA visits.",
            "trapTags": [
              "scope-mismatch",
              "intervention-not-skilled"
            ]
          },
          {
            "id": "o-int-j",
            "label": "SN to coordinate home health psychiatric nursing referral for bipolar disorder management and medication monitoring. Separate psychiatric home health agency to provide concurrent services.",
            "isCorrect": false,
            "rationale": "Concurrent home health services from two agencies is not a standard Medicare benefit model. Psychiatric home health nursing is not a separately billable service. The psychiatric management component is integrated into the SN role (observation, coordination) with the patient's outpatient psychiatrist providing psychiatric treatment.",
            "whyTempting": "The patient clearly needs psychiatric management. A specialized psychiatric nurse seems appropriate. Concurrent services would address both medical and psychiatric needs.",
            "failureReason": "This is not how Medicare home health works. Psychiatric management for this patient is handled by outpatient psychiatry (Dr. Rowan) with SN coordinating. Creating a parallel home health episode for psychiatric care is not compliant.",
            "realWorldConsequence": "Attempting concurrent home health episodes will be automatically denied by Medicare claims processing — only one agency can bill per episode, wasting clinical resources while delaying psychiatric monitoring integration.",
            "trapTags": [
              "scope-mismatch",
              "billing-without-documentation"
            ]
          }
        ]
      },
      {
        "id": "o-disciplines",
        "formBoxNumber": "BOX 20",
        "label": "Disciplines / Services Required",
        "type": "multi-select",
        "domain": "disciplines",
        "correctAnswerIds": [
          "o-disc-a",
          "o-disc-b",
          "o-disc-d"
        ],
        "auditNote": "Only ordered, clinically justified disciplines should be included. Each must have documented need.",
        "options": [
          {
            "id": "o-disc-a",
            "label": "Skilled Nursing (SN)",
            "isCorrect": true,
            "rationale": "Ordered. Extensively documented need for respiratory management, medication management, DM monitoring, psychiatric-medical coordination.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-disc-b",
            "label": "Physical Therapy (PT)",
            "isCorrect": true,
            "rationale": "Ordered. Documented deconditioning, exercise intolerance, unsteady gait, desaturation with minimal activity. PT for COPD conditioning and functional mobility is evidence-based and medically necessary.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-disc-c",
            "label": "Occupational Therapy (OT)",
            "isCorrect": false,
            "rationale": "Not ordered. While the patient needs bathing assistance and energy conservation training for daily activities, OT was not ordered by the physician. The PT evaluation may identify OT needs for energy conservation and ADL training, which would be the appropriate pathway.",
            "whyTempting": "Energy conservation is an OT specialty. The patient needs ADL assistance. OT seems complementary to PT.",
            "failureReason": "Not ordered. Must be recommended and ordered before inclusion.",
            "realWorldConsequence": "Including unordered OT on the 485 means the physician cannot sign — the resulting delay leaves the patient without authorized services, and any OT visits provided before the order is obtained are unbillable.",
            "trapTags": [
              "discipline-not-justified",
              "intervention-not-ordered"
            ]
          },
          {
            "id": "o-disc-d",
            "label": "Home Health Aide (HHA)",
            "isCorrect": true,
            "rationale": "Ordered. Patient needs bathing assistance (cannot stand in shower due to dyspnea). Tied to SN and PT skilled services.",
            "whyTempting": "N/A — correct.",
            "failureReason": "N/A",
            "trapTags": []
          },
          {
            "id": "o-disc-e",
            "label": "Medical Social Worker (MSW)",
            "isCorrect": false,
            "rationale": "Not ordered. While strongly indicated (social isolation, psychiatric case management gap, resource needs, no local support), MSW requires a physician order.",
            "whyTempting": "The social needs are profound. MSW seems essential.",
            "failureReason": "Not ordered. Must be recommended and ordered.",
            "realWorldConsequence": "Adding MSW without a physician order creates an unsigned plan of care — no disciplines can bill until resolved, and MSW visits provided without an order are the agency's full financial liability.",
            "trapTags": [
              "discipline-not-justified",
              "intervention-not-ordered"
            ]
          },
          {
            "id": "o-disc-f",
            "label": "Respiratory Therapy (RT)",
            "isCorrect": false,
            "rationale": "Not a Medicare home health discipline. Respiratory management is SN scope in home health.",
            "whyTempting": "COPD patient on nebulizer + O2 seems like an obvious RT case.",
            "failureReason": "RT is not a home health discipline under Medicare. Demonstrates benefit structure misunderstanding.",
            "realWorldConsequence": "Listing RT as a home health discipline will cause the physician to question the clinician's competency, delay plan signing, and if billed, the claim will be rejected with an error code flagging the agency for compliance review.",
            "trapTags": [
              "discipline-not-justified",
              "scope-mismatch"
            ]
          },
          {
            "id": "o-disc-g",
            "label": "Psychiatric Nursing",
            "isCorrect": false,
            "rationale": "Not a separately billable home health discipline. Psychiatric monitoring is integrated into SN function. Psychiatric treatment is provided by the outpatient psychiatrist.",
            "whyTempting": "The patient has a serious psychiatric condition. Specialized psychiatric nursing seems ideal.",
            "failureReason": "Not a home health discipline. Psychiatric monitoring is within SN scope; psychiatric treatment is outpatient.",
            "realWorldConsequence": "Listing a non-existent Medicare home health discipline prevents plan certification — the physician cannot sign orders for a service that does not exist in the benefit structure, halting all care delivery.",
            "trapTags": [
              "discipline-not-justified",
              "scope-mismatch"
            ]
          }
        ]
      }
    ]
  }
];
