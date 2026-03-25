export const SAMPLE_DEFINITIONS = [
  { term: "Governing Body", definition: "The individual(s), board of directors, trustees, partnership, corporation, or other legally constituted authority that has ultimate responsibility for the management and operation of the home health agency, as defined by 42 CFR § 484.2 and § 484.105." },
  { term: "Administrator", definition: "The individual appointed by the Governing Body who is responsible for managing the agency's day-to-day operations and who meets all qualifications specified in agency policy GV-OG-002 and applicable state law." },
  { term: "Clinical Manager", definition: "The registered nurse (or qualified individual per state law) designated by the Governing Body to oversee clinical services including patient care delivery, clinical staff supervision, and OASIS compliance. Also referred to as Director of Nursing (DON)." },
  { term: "Fiduciary Duty", definition: "The legal obligation of Governing Body members to act in good faith, with due diligence, and in the best interest of the agency and the patients it serves." },
  { term: "Quorum", definition: "The minimum number of Governing Body members required to be present (physically or via approved teleconference) to conduct official business, as defined in the agency's bylaws or operating agreement." },
  { term: "QAPI", definition: "Quality Assessment and Performance Improvement — the structured program required by 42 CFR § 484.65 for ongoing quality monitoring and improvement." }
];

export const SAMPLE_PURPOSE = "This policy establishes the authority, composition, functions, and oversight responsibilities of the Governing Body of the agency. The Governing Body is the ultimate authority accountable for the operation, management, fiscal viability, and regulatory compliance of the home health agency. This policy ensures the agency satisfies the requirements set forth in 42 CFR § 484.105 — Condition of Participation: Organization and Administration of Services, which mandates that a home health agency must have a governing body that assumes full legal authority and responsibility for the agency's overall operation and management.";

export const SAMPLE_SCOPE = [
  "All members of the Governing Body (including voting and non-voting members)",
  "The Agency Administrator",
  "The Director of Nursing / Clinical Manager",
  "The Compliance Officer",
  "All senior leadership personnel who report directly to the Governing Body or Administrator",
  "All contracted management entities performing governing body functions on behalf of the agency"
];

export const SAMPLE_SCOPE_EXCLUSION = "This policy does not apply to day-to-day clinical or operational staff except to the extent that Governing Body decisions establish requirements, standards, or directives that govern their work.";

export const SAMPLE_POLICY_STATEMENTS = [
  "Care Indeed Home Health Care, Inc. shall maintain a designated Governing Body that holds full legal authority and responsibility for the overall operation, management, and regulatory compliance of the home health agency, as required by 42 CFR § 484.105(a).",
  "The Governing Body shall be responsible for ensuring that Care Indeed Home Health Care, Inc. operates in compliance with all applicable federal, state, and local laws, regulations, and licensure requirements at all times.",
  "The Governing Body shall appoint a qualified Administrator who is authorized to act on behalf of the Governing Body in the day-to-day management of the agency and who meets the qualifications defined in agency policy GV-OG-002 and applicable California state requirements.",
  "The Governing Body shall ensure the appointment and ongoing oversight of a qualified Clinical Manager (Director of Nursing) responsible for all clinical services, in compliance with 42 CFR § 484.105(c).",
  "The Governing Body shall approve and oversee the agency's:\n• Scope of services (GV-OG-003)\n• Organizational structure and reporting lines (GV-OG-001)\n• Annual strategic plan and operational goals (GV-OG-004)\n• Policy framework and all REQUIRED-tier policies (GV-PM-001, GV-PM-002)\n• QAPI program (QA-PG-001, QA-PG-002)\n• Corporate compliance program (CO-CP-001)\n• Annual operating budget (FN-FP-005)\n• Emergency preparedness plan (OP-FM-005)",
  "The Governing Body shall meet at a frequency sufficient to fulfill its oversight responsibilities, but not less than quarterly, with meetings documented in formal minutes per policy GV-GB-002.",
  "The Governing Body shall not delegate its ultimate accountability for regulatory compliance, patient safety, or fiscal integrity.",
  "All members of the Governing Body shall disclose and manage conflicts of interest in accordance with policy GV-GB-003.",
  "Only the most current approved version of this policy shall be considered valid. Superseded versions must not be used for any operational or compliance purpose."
];

export const SAMPLE_PROCEDURES = {
  "6.1": {
    title: "6.1 Establishment and Composition",
    rows: [
      ["6.1.1", "Agency Owner / Corporate Entity", "Formally establish the Governing Body through articles of incorporation, operating agreement, or equivalent legal instrument.", "Prior to initial Medicare certification."],
      ["6.1.2", "Governing Body Chair", "Maintain a current roster of all Governing Body members including: full legal name, title/role, date of appointment, term expiration, voting status, and contact information.", "Updated within 7 calendar days of any change."],
      ["6.1.3", "Governing Body", "Ensure composition includes individuals with competency in: (a) healthcare operations; (b) financial management; (c) regulatory compliance.", "Reviewed annually."],
      ["6.1.4", "Compliance Officer", "Verify that no member appears on the OIG LEIE or SAM exclusion database at appointment and monthly thereafter.", "At appointment and monthly."]
    ]
  },
  "6.2": {
    title: "6.2 Core Responsibilities",
    sections: [
      {
        title: "6.2.1 — Legal Authority and Agency Operations",
        rows: [
          ["6.2.1.1", "Governing Body", "Assume and maintain full legal authority for the overall operation and fiscal viability of the agency.", "Continuous."],
          ["6.2.1.2", "Governing Body", "Ensure the agency maintains current and valid licenses, Medicare certification, and accreditation.", "Continuous; verified quarterly."],
          ["6.2.1.3", "Governing Body", "Review and approve the agency's scope of services at least annually.", "Annually."]
        ]
      },
      {
        title: "6.2.2 — Appointment and Oversight of Key Personnel",
        rows: [
          ["6.2.2.1", "Governing Body", "Appoint a qualified Administrator and document in GB minutes.", "Prior to operation; within 30 days of vacancy."],
          ["6.2.2.2", "Governing Body", "Appoint a qualified Clinical Manager (DON) per 42 CFR § 484.105(c).", "Prior to operation; within 30 days of vacancy."],
          ["6.2.2.3", "Governing Body", "Appoint a Compliance Officer with authority to operate the compliance program.", "Prior to operation; within 30 days of vacancy."]
        ]
      },
      {
        title: "6.2.3 — Policy and Compliance Oversight",
        rows: [
          ["6.2.3.1", "Governing Body", "Approve all REQUIRED-tier policies prior to implementation.", "Prior to implementation."],
          ["6.2.3.2", "Governing Body", "Receive quarterly compliance reports from the Compliance Officer.", "Quarterly."],
          ["6.2.3.3", "Governing Body", "Act on high-risk compliance deficiencies within 14 calendar days.", "Within 14 days."]
        ]
      }
    ]
  },
  "6.3": {
    title: "6.3 Governing Body Meetings",
    rows: [
      ["6.3.1", "Governing Body Chair", "Schedule and convene regular meetings no fewer than 4 times per calendar year.", "Quarterly."],
      ["6.3.2", "Governing Body Chair", "Convene special meetings for urgent matters with 48-hour notice.", "As needed."],
      ["6.3.3", "Designated Secretary", "Prepare and distribute meeting agendas 7 days before each meeting.", "7 days prior."],
      ["6.3.4", "Designated Secretary", "Record formal minutes documenting attendance, quorum, motions, and directives.", "Draft within 14 days."],
      ["6.3.5", "Governing Body Chair", "Ensure quorum is present before conducting official business.", "At each meeting."]
    ]
  }
};

export const SAMPLE_DOCS = [
  ["GB establishment", "Articles of incorporation, operating agreement, bylaws", "Corporate Entity", "Corporate records", "Permanently"],
  ["Membership roster", "Current roster (Appendix A)", "GB Chair", "Governance file", "Update within 7 days"],
  ["Meeting minutes", "Formal minutes (Appendix D template)", "Secretary", "Governance file", "Draft within 14 days; retain 7 years"],
  ["Administrator appointment", "Written documentation with qualifications verified", "GB Chair", "Personnel file", "At appointment"],
  ["Conflict of Interest", "Disclosure Forms (Appendix B)", "Compliance Officer", "Compliance file", "Annually; within 7 days of change"],
  ["Quarterly compliance reports", "Compliance Officer's written report", "Compliance Officer", "Governance file", "7 days before each quarterly meeting"],
  ["QAPI reports", "Clinical Manager's written report", "Clinical Manager", "QAPI records", "Presented quarterly"],
  ["Annual budget approval", "Documented GB approval", "GB (approval)", "Financial records", "30 days before fiscal year"],
  ["Policy acknowledgment", "Signed acknowledgment (Appendix C)", "Administrator", "Policy file", "Within 14 days of effective date"]
];

export const SAMPLE_COMPLIANCE = [
  ["Governing Body is legally established and documented.", "Review of establishing documents.", "Current, complete, and on file at all times."],
  ["Governing Body meets at least quarterly.", "Review of meeting minutes with dates and attendance.", "4+ meetings per year with quorum."],
  ["Key personnel appointed and documented.", "Review of minutes and personnel files.", "No vacancy exceeds 30 days without interim designee."],
  ["QAPI plan reviewed and approved annually.", "Review of GB minutes for approval.", "Annual approval documented."],
  ["Compliance reports presented quarterly.", "Review of agendas, minutes, and report files.", "Reports submitted 7 days before each meeting."],
  ["Conflict of Interest disclosures current.", "Review of Appendix B forms.", "100% completion rate."],
  ["Budget approved annually.", "Review of GB minutes and budget document.", "Approved 30 days before fiscal year."],
  ["GB members screened for exclusion.", "Review of OIG/SAM screening logs.", "Monthly screening documented."],
  ["Policy acknowledgments current.", "Review of signed Appendix C forms.", "100% within 14 days."]
];
