Patient & Clinician Component Architecture
Foundational Data Model for Home Health / Home Care Staffing
Version: 1.0 Role: Senior Product Architect / Healthcare Staffing Systems Architect Sources: Brad Scheduling Features Requirement Document (v2.0), Project Architecture Brief Scope: Medical staffing processes ONLY — home health and home care

1. Executive Summary
What We Are Building
The foundational data layer for Brad Workforce AI — specifically the Clinician Profile, Client/Patient Profile, and Clinician-Client Connection Layer that all future staffing optimization depends on.

Why the Profile + Connection Layer Must Come First
The Brad requirements document defines a 5-layer legally compliant decision flow:

Layer 1: Hard constraints (credentials, licenses, accommodations, discipline match)
Layer 2: Optimization (distance, continuity, skill match, workload)
Layer 3: Bias check (disparate impact analysis before human review)
Layer 4: Human review (qualified clinical manager approval)
Layer 5: Audit trail (every recommendation and decision logged)
Every single layer depends on clean, normalized, relationship-correct profile data. If the Clinician and Client profiles are incomplete, if credentials aren't tracked with expiration enforcement, if the connection between clinicians and clients is hardwired rather than managed through a junction layer — then Layers 1-5 cannot function. The optimizer can't match. The bias check can't audit. The compliance layer can't enforce.

This is the foundation. Get it wrong, and everything above it is unreliable.

Design Principles (From Requirements Document)
Brad generates the plan first; human reviews and overrides — but Brad needs complete data to generate
All assignment decisions require meaningful human approval (42 CFR §484, FEHA ADS)
Accommodations (religious, ADA, pregnancy, FMLA) are hard constraints — Layer 1, no override
Every staffing decision must be auditable with full citation
The system must support the weighted caseload formula: (L3-L4 × 1.0) + (L2 × 0.75) + (L1 × 0.5) with hard cap at 40 per ACCM
System must track cancellation classification (client-initiated, caregiver-initiated, agency-initiated) with reason codes and preventability flags
No clinician-client relationship hardwired into either profile — junction model required
2. Core Entity Model
2.1 CLINICIAN
Purpose: Represents a licensed or certified caregiver/clinician eligible for patient/client assignment. This is the supply side of staffing.

Key Fields (Required):



Field	Type	Purpose	Source Reference
id	UUID	Primary key	System
firstName	string	Legal first name	Identity
lastName	string	Legal last name	Identity
primaryDiscipline	enum	RN, LVN, PT, OT, MSW, HHA, CNA	Brad data model — disciplines[]
employmentType	enum	FT, PT, PRN, Contract	Brad data model — employment.type
status	enum	active, inactive, onLeave, suspended, terminated	Lifecycle
homeBaseCity	string	City of residence	Brad data model — geography
homeCoordinates	{lat, lng}	GPS for distance calculation	Brad data model — geography
preferredRadius	number (miles)	Preferred travel radius	Brad data model — geography
maxRadius	number (miles)	Absolute max travel distance	Brad data model — geography
maxVisitsPerDay	number	Daily visit cap	Brad data model — availability
maxVisitsPerWeek	number	Weekly visit cap (CA labor law: tied to OT after 40hrs)	Brad data model + legal compliance
createdAt	timestamp	Record creation	Audit
updatedAt	timestamp	Last modification	Audit
createdBy	UUID	Who created the record	Audit
Key Fields (Optional but Architecturally Important):



Field	Type	Purpose	Source Reference
additionalDisciplines[]	enum[]	Secondary certifications	Brad data model — disciplines[]
serviceZones[]	string[]	Named coverage zones	Brad data model — geography
travelTolerance	enum: low/med/high	Willingness to travel beyond preferred radius	Brad data model — geography
languages[]	string[]	Languages spoken (NOTE: must be bias-audited per FEHA)	Brad data model — employment
experienceYears	number	Years of experience	Brad data model — employment
weekendAvailability	boolean	Available for weekend shifts	Brad data model — availability
patientFeedbackAvg	number (0-5)	Average patient rating (IF bias-audited)	Brad data model — performance
documentationTimeliness	number (0-100)	OASIS/documentation compliance score	Brad data model — performance
missedVisitRate	number (0-100)	Historical reliability	Brad data model — performance
continuityScore	number (0-100)	How well clinician maintains patient relationships	Brad data model — performance
profileNotes	text	Admin-visible notes	Operational
profilePhotoUrl	string	Optional photo	UX
Accommodation Fields (REQUIRED — P0 Compliance per FEHA ADS):



Field	Type	Purpose	Source Reference
religiousRestrictions[]	{day, timeRange, description}	Days/times unavailable for religious observance	Brad compliance architecture — Layer 1 hard constraint
adaAccommodations[]	{type, description, effectiveDate}	Disability accommodations	Brad compliance architecture — Layer 1 hard constraint
pregnancyAccommodation	{active, details, expectedEndDate}	Pregnancy-related scheduling limits	Brad compliance architecture — Layer 1 hard constraint
fmlaLeave	{active, startDate, endDate}	FMLA leave dates	Brad compliance architecture — Layer 1 hard constraint
schedulingLimitations[]	{type, description}	Any other hard scheduling restrictions	Brad compliance architecture — Layer 1 hard constraint
Demographic Fields (FOR BIAS AUDIT ONLY — Never Used in Matching):



Field	Type	Purpose	Source Reference
demographicRace	string (optional, self-reported)	Disparate impact monitoring	Brad compliance — Layer 3 bias check
demographicSex	string (optional)	Disparate impact monitoring	Brad compliance — Layer 3 bias check
demographicAge	number (optional)	Disparate impact monitoring	Brad compliance — Layer 3 bias check
Lifecycle/Status Values:

active — Available for assignment
inactive — Not currently available, not terminated
onLeave — FMLA, medical, personal leave (dates tracked)
suspended — Under review, not eligible for assignment
terminated — No longer with agency
Relationships:

Has many Credentials (one-to-many)
Has many Skills (one-to-many)
Has many Availabilities (one-to-many, recurring or date-specific)
Has many ClinicianClientConnections (one-to-many via junction)
Has many ShiftAssignments (one-to-many)
Has many Restrictions (one-to-many)
Has many Preferences (one-to-many)
Has many AuditLogEntries (one-to-many)
2.2 CLIENT (Patient/Facility)
Purpose: Represents a home health patient, home care client, or facility that receives staffing. This is the demand side of staffing.

Key Fields (Required):



Field	Type	Purpose	Source Reference
id	UUID	Primary key	System
clientType	enum	individual_homehealth, individual_homecare, facility	Requirement: support both facility and home care
displayName	string	Patient/client/facility name	Identity
status	enum	active, inactive, discharged, onHold, pending	Lifecycle
acuityLevel	enum	L1_essential, L2_enhanced, L3_specialized, L4_critical	Brad data model — Care Tier System
city	string	Service location city	Brad data model — geography
zone	string	Named service zone	Brad data model — geography
coordinates	{lat, lng}	GPS for distance calculation	Brad data model — geography
primaryDisciplineNeeded	enum	RN, LVN, PT, OT, MSW, HHA, CNA	Brad data model — clinical
createdAt	timestamp	Record creation	Audit
updatedAt	timestamp	Last modification	Audit
createdBy	UUID	Who created the record	Audit
Key Fields (Optional but Architecturally Important):



Field	Type	Purpose	Source Reference
additionalDisciplinesNeeded[]	enum[]	If multiple disciplines required	Brad data model — parsedVisitPlan
visitFrequencyString	string	Raw physician order (e.g., "SN 3w1, 2w3, 1w4")	Brad data model — clinical.visitFrequencyString
requiredSkills[]	string[]	Skills required for care	Brad data model — clinical.requiredSkills
requiredCredentials[]	string[]	Minimum credentials	Brad data model — clinical.requiredCredentials
riskFactors[]	string[]	Clinical risk factors	Brad data model — clinical.riskFactors
diagnosisCategory	string	Primary diagnosis	Brad data model — identity
preferredLanguage	string	Patient's language preference	Brad data model — preferences
continuityPriority	enum: low/med/high	How important is same-clinician continuity	Brad data model — preferences
parkingDifficulty	number (1-5)	Affects visit scheduling time	Brad data model — geography
accessNotes	text	Gate codes, parking instructions, etc.	Brad data model — geography
careNotes	text	Clinical/care notes visible to schedulers	Operational
payerType	string	Medicare, Medi-Cal, Private Insurance	Brad data model — episode.payerType
certPeriodStart	date	Certification period start	Brad data model — episode
certPeriodEnd	date	Certification period end	Brad data model — episode
currentWeek	number	Current week in episode	Brad data model — episode
authorizationLimit	number	Authorized visit count	Brad data model — episode
weightedCaseloadPoints	number	Calculated: L3-L4=1.0, L2=0.75, L1=0.5	Weighted Caseload Formula from Facility/B2B Playbook
Episode Classification (Home Health Specific):



Field	Type	Purpose	Source Reference
episodePattern	string	Classification pattern	Brad data model — classification
visitIntensity	string	High/medium/low intensity	Brad data model — classification
taperType	string	How visit frequency decreases	Brad data model — classification
frontloadIndex	number	How front-loaded the visit plan is	Brad data model — classification
interdisciplinaryComplexity	number	Number of disciplines involved	Brad data model — classification
missedVisitSensitivity	enum: low/med/high/critical	How dangerous is a missed visit for this patient	Brad data model — classification
Lifecycle/Status Values:

active — Currently receiving services
inactive — Not currently receiving services, not discharged
discharged — Episode ended, no longer a patient
onHold — Temporarily suspended (hospitalization, travel, etc.)
pending — Referral received, not yet active (SOC pending)
Relationships:

Has many ClinicianClientConnections (one-to-many via junction)
Has many ShiftNeeds (one-to-many)
Has many ShiftAssignments (one-to-many)
Has many Restrictions (one-to-many — client-side restrictions)
Has many Preferences (one-to-many — client-side preferences)
Has many AuditLogEntries (one-to-many)
2.3 CLINICIAN-CLIENT CONNECTION
Purpose: The junction model between clinicians and clients. This is the most architecturally critical entity. It NEVER lives inside either the clinician or client profile. It manages eligibility, preference, restriction, assignment history, and approval status independently.

Key Fields (Required):



Field	Type	Purpose
id	UUID	Primary key
clinicianId	UUID (FK)	Reference to Clinician
clientId	UUID (FK)	Reference to Client
connectionStatus	enum	Current relationship state
source	enum	How this connection was created
createdAt	timestamp	When connection was established
updatedAt	timestamp	Last status change
createdBy	UUID	Who created the connection
Key Fields (Connection Intelligence):



Field	Type	Purpose
matchScore	number (0-100)	Brad's calculated match quality (from optimizer)
matchFactors	JSON	Breakdown: disciplineMatch, skillMatch, distanceScore, continuityScore, availabilityScore, feedbackScore, workloadBalance
distanceMiles	number	Calculated distance between clinician home and client location
estimatedDriveMinutes	number	Estimated travel time
approvalStatus	enum	pending, approved, rejected, expired
approvedBy	UUID	Who approved (must be qualified per §484.115)
approvedAt	timestamp	When approved
approvalRationale	text	Required documentation for compliance
effectiveDate	date	When this connection becomes active
expirationDate	date (nullable)	When this connection expires (if applicable)
restrictionReason	text	If blocked/restricted, why
preferenceReason	text	If preferred, why
priorAssignmentCount	number	How many times this clinician has served this client
lastWorkedDate	date (nullable)	Date of most recent completed visit
continuityFlag	boolean	Is this a continuity-of-care relationship
notes	text	Scheduler/admin notes
Connection Status Values:



Status	Meaning	Who Can Set
eligible	Clinician meets hard constraints for this client, not yet preferred or assigned	System (automated from matching rules)
preferred	Clinician is preferred for this client (continuity, skill match, patient request)	Scheduler / Clinical Manager
restricted	Clinician should not be assigned unless override (soft block)	Scheduler / Clinical Manager
blocked	Clinician CANNOT be assigned — hard block (safety, complaint, credential gap)	Clinical Manager / Admin
assigned	Clinician currently has active shift assignment(s) for this client	System (from ShiftAssignment)
pendingApproval	Connection recommended by Brad, awaiting human approval	System → Human
inactive	Previously connected, no longer active (client discharged, clinician left, etc.)	System / Admin
Source Values:



Source	Meaning
bradRecommendation	Brad's optimizer suggested this match
manualAssignment	Scheduler created this connection manually
clientRequest	Client/family requested this clinician
clinicianRequest	Clinician requested this client
historicalContinuity	Carried over from prior episode/assignment
systemMigration	Imported from legacy system / CSV
Unique Constraint: (clinicianId, clientId) — one connection record per pair. Status changes over time are tracked via AuditLog, not by creating duplicate records.

2.4 AVAILABILITY
Purpose: Tracks when clinicians are available for assignment. Supports both recurring patterns and date-specific entries.



Field	Type	Purpose
id	UUID	Primary key
clinicianId	UUID (FK)	Which clinician
availabilityType	enum: recurring, dateSpecific, blocked	Pattern type
dayOfWeek	enum (nullable)	For recurring: MON-SUN
specificDate	date (nullable)	For date-specific entries
startTime	time	Available from
endTime	time	Available until
status	enum: available, unavailable, tentative	Availability state
reason	text (nullable)	Why unavailable (PTO, religious, personal)
isAccommodation	boolean	If true, this is a hard constraint (Layer 1)
createdAt	timestamp	Audit
updatedAt	timestamp	Audit
createdBy	UUID	Audit
Conflict Rule: The system must detect overlapping availability blocks for the same clinician and prevent contradictions. unavailable + isAccommodation=true overrides all other availability for that time slot — no exceptions.

2.5 SKILL
Purpose: Tracks competencies and clinical skills for both clinicians (what they can do) and clients (what they need).



Field	Type	Purpose
id	UUID	Primary key
entityType	enum: clinician, client	Who this skill record belongs to
entityId	UUID (FK)	Clinician or Client ID
skillName	string	Standardized skill name
skillCategory	enum	wound_care, IV, trach, vent, peds, psych, cardiac, diabetic_education, medication_management, SOC_assessment, supervisory
proficiencyLevel	enum: basic, competent, expert (nullable)	For clinicians only
isRequired	boolean	For clients: is this a hard requirement vs. preferred
verifiedDate	date (nullable)	When skill was last verified
verifiedBy	UUID (nullable)	Who verified
status	enum: active, expired, pending_verification	Lifecycle
createdAt	timestamp	Audit
2.6 CREDENTIAL
Purpose: Tracks licenses, certifications, and compliance documents for clinicians. Critical for Layer 1 hard constraints.



Field	Type	Purpose
id	UUID	Primary key
clinicianId	UUID (FK)	Which clinician
credentialType	enum	license, certification, background_check, TB_test, CPR, competency_assessment, driver_license, auto_insurance, COVID_vaccine
credentialName	string	Specific credential (e.g., "CA RN License", "BLS Certification")
issuingAuthority	string	Who issued
licenseNumber	string (nullable)	License/cert number
issueDate	date	When issued
expirationDate	date	When it expires
status	enum: valid, expiringSoon, expired, pending, revoked	Lifecycle
daysUntilExpiry	number (computed)	For alert engine
documentUrl	string (nullable)	Link to uploaded credential document
verifiedBy	UUID (nullable)	Who verified this credential
verifiedDate	date (nullable)	When verified
createdAt	timestamp	Audit
updatedAt	timestamp	Audit
Lifecycle Rules:

valid → expiringSoon at 30 days before expiration (configurable)
expiringSoon → expired at expiration date
expired → clinician becomes ineligible for any assignment requiring this credential (Layer 1 hard block)
No human override can bypass an expired required credential per 42 CFR §484.115
2.7 RESTRICTION
Purpose: Captures restrictions/blocks between clinicians and clients, or on either entity independently.



Field	Type	Purpose
id	UUID	Primary key
restrictionType	enum: clinician_to_client, client_to_clinician, clinician_general, client_general	Scope
clinicianId	UUID (FK, nullable)	Clinician involved
clientId	UUID (FK, nullable)	Client involved
severity	enum: soft, hard	Soft = override possible with documentation. Hard = no override.
reason	text	Why the restriction exists
category	enum: safety, performance, complaint, credential_gap, accommodation, preference, compliance	Classification
restrictedBy	UUID	Who created the restriction
effectiveDate	date	When restriction starts
expirationDate	date (nullable)	When restriction ends (if temporary)
status	enum: active, expired, removed	Lifecycle
removalReason	text (nullable)	If removed, why
removedBy	UUID (nullable)	Who removed
removedAt	timestamp (nullable)	When removed
createdAt	timestamp	Audit
2.8 PREFERENCE
Purpose: Captures preferences (not restrictions) for either clinicians or clients.



Field	Type	Purpose
id	UUID	Primary key
preferenceType	enum: clinician_for_client, client_for_clinician, clinician_general, client_general	Direction
clinicianId	UUID (FK, nullable)	Clinician
clientId	UUID (FK, nullable)	Client
preferenceCategory	enum: continuity, skill_match, language, personality, geography, schedule, other	What kind of preference
description	text	Free-text description
strength	enum: preferred, strongly_preferred	Weight
source	enum: patient_request, family_request, clinician_request, scheduler_observation, historical_continuity	How we know about this preference
status	enum: active, inactive	Lifecycle
createdAt	timestamp	Audit
createdBy	UUID	Audit
2.9 SHIFT NEED
Purpose: Represents a staffing demand — a visit or shift that needs to be filled. This is the unit of work in the staffing pipeline.



Field	Type	Purpose
id	UUID	Primary key
clientId	UUID (FK)	Which client needs the visit
requiredDiscipline	enum	What discipline is needed
requiredSkills[]	string[]	Minimum skills needed
requiredCredentials[]	string[]	Minimum credentials needed
visitDate	date	When the visit should occur
visitWindow	{startTime, endTime}	Time window
shiftType	enum: recurring, prn, soc, discharge, supervisory, respite, liveIn	From Brad data model + Care Indeed shift types
priority	enum: critical, high, medium, low	From Brad demand prioritization: SOC > BID > high-acuity > recert > discharge > routine > aide
status	enum: open, matchingInProgress, matched, assigned, confirmed, completed, missed, cancelled	Full lifecycle
cancellationSource	enum (nullable): client_initiated, caregiver_initiated, agency_initiated	From QA/PI Playbook cancellation classification
cancellationReason	text (nullable)	Reason code
cancellationPreventable	boolean (nullable)	Preventability flag per QA/PI Playbook
acuityLevel	enum: L1-L4	Inherited from client
missedVisitSensitivity	enum: low/med/high/critical	Inherited from client
estimatedDuration	number (minutes)	Expected visit length
notes	text	Scheduling notes
createdAt	timestamp	Audit
createdBy	UUID	Audit
2.10 SHIFT ASSIGNMENT
Purpose: The actual assignment of a clinician to a shift need. This is where the connection becomes operational. Always requires human approval.



Field	Type	Purpose
id	UUID	Primary key
shiftNeedId	UUID (FK)	Which shift need this fills
clinicianId	UUID (FK)	Who is assigned
clientId	UUID (FK)	Denormalized for query performance
connectionId	UUID (FK)	Reference to ClinicianClientConnection
status	enum: proposed, pendingApproval, approved, clinicianNotified, clinicianConfirmed, clinicianDeclined, inProgress, completed, missed, cancelled	Full lifecycle
matchScore	number (0-100)	Brad's calculated match quality at time of assignment
matchFactors	JSON	Full breakdown of scoring factors
distanceMiles	number	Distance at time of assignment
driveTimeMinutes	number	Estimated drive time
assignedBy	UUID	Who made the assignment (system = Brad, human = scheduler)
assignmentSource	enum: bradRecommendation, manualAssignment	How this was created
approvedBy	UUID	Qualified clinical manager who approved
approvedAt	timestamp	When approved
approvalRationale	text	Required documentation
clinicianConfirmedAt	timestamp (nullable)	When clinician accepted
clinicianDeclineReason	text (nullable)	If declined
completedAt	timestamp (nullable)	When visit was completed
completionNotes	text (nullable)	Visit completion notes
overrideReason	text (nullable)	If human overrode Brad's recommendation
biasFlags[]	JSON (nullable)	From Layer 3 bias check
accommodationCheck	JSON	Religious, ADA, pregnancy conflict check results
risks[]	JSON	Risks identified at assignment time
consequences[]	JSON	Consequences projected at assignment time
citationCard	JSON	Full defensibility citation for this assignment
createdAt	timestamp	Audit
updatedAt	timestamp	Audit
2.11 AUDIT LOG
Purpose: Immutable record of every significant action in the system. Required for FEHA ADS compliance, 42 CFR §484 documentation, and defensibility framework.



Field	Type	Purpose
id	UUID	Primary key
entityType	enum: clinician, client, connection, credential, restriction, preference, shiftNeed, shiftAssignment, availability, skill	What was affected
entityId	UUID	ID of affected record
action	enum: created, updated, statusChanged, approved, rejected, overridden, deleted, expired, restored	What happened
fieldChanged	string (nullable)	Specific field that changed
previousValue	JSON (nullable)	Value before change
newValue	JSON (nullable)	Value after change
performedBy	UUID	Who did it
performedByRole	string	Their role at time of action
rationale	text (nullable)	Why (required for overrides, approvals, blocks)
timestamp	timestamp	When
ipAddress	string (nullable)	For security audit
sessionId	string (nullable)	Session tracking
Immutability Rule: Audit log entries are APPEND-ONLY. They cannot be edited or deleted. This is non-negotiable for regulatory compliance.

3. Relationship Model
Text-Based ERD
CLINICIAN (1)──────(M) CREDENTIAL
    │
    ├──(M) SKILL [entityType=clinician]
    │
    ├──(M) AVAILABILITY
    │
    ├──(M) RESTRICTION [clinicianId set]
    │
    ├──(M) PREFERENCE [clinicianId set]
    │
    ├──(M) CLINICIAN_CLIENT_CONNECTION ──(M)──(1) CLIENT
    │           │                                    │
    │           │                                    ├──(M) SKILL [entityType=client]
    │           │                                    │
    │           │                                    ├──(M) RESTRICTION [clientId set]
    │           │                                    │
    │           │                                    ├──(M) PREFERENCE [clientId set]
    │           │                                    │
    │           │                                    └──(M) SHIFT_NEED
    │           │                                              │
    │           └──────────────────────────────────────────────│──(M) SHIFT_ASSIGNMENT
    │                                                          │          │
    └──(M) SHIFT_ASSIGNMENT ──(1)──────────────────────────────┘          │
                                                                          │
                                                                    AUDIT_LOG
                                                              (logs all entities)
Relationship Rules
Clinician ↔ Client: ALWAYS through ClinicianClientConnection. Never a direct foreign key in either profile.
Clinician → ShiftAssignment: A clinician can have many assignments. Each assignment links to exactly one ShiftNeed.
Client → ShiftNeed: A client generates many shift needs (one per required visit).
ShiftNeed → ShiftAssignment: One shift need can have at most one active assignment (but may have historical cancelled/declined assignments).
Skills: Polymorphic — used by both clinicians (what they offer) and clients (what they require).
Credentials: Clinician-only. Clients don't have credentials.
Restrictions & Preferences: Can be directional (clinician→client, client→clinician) or general (clinician-wide, client-wide).
AuditLog: References any entity via entityType + entityId. No direct FK to maintain flexibility.
4. Clinician Profile Architecture
A complete clinician profile contains:

4.1 Identity
Name, contact, photo
Employee/contractor ID
Employment type (FT/PT/PRN/Contract)
Status (active/inactive/onLeave/suspended/terminated)
4.2 Role & Discipline
Primary discipline (RN, LVN, PT, OT, MSW, HHA, CNA)
Additional disciplines
Supervisory capability (can this clinician supervise aides per §484.80?)
4.3 Licenses & Certifications (via Credential entity)
CA state license + number + expiration
CPR/BLS certification + expiration
TB test + expiration
Background check status + date
COVID vaccination status
Any specialty certifications (wound care, IV, etc.)
Driver's license + auto insurance (for home visits)
4.4 Skills (via Skill entity)
Clinical skills: wound_care, IV, trach, vent, peds, psych, cardiac, diabetic_education
Assessment skills: SOC_assessment, OASIS_competent
Supervisory skills: aide_supervision qualified
Proficiency level per skill
4.5 Compliance Status (Computed)
All credentials valid? (boolean)
Any credentials expiring within 30 days? (list)
Any expired credentials? (hard block)
Training compliance current? (boolean)
Supervisory visit compliance? (if applicable)
4.6 Accommodations (Layer 1 Hard Constraints)
Religious scheduling restrictions
ADA accommodations
Pregnancy accommodation
FMLA leave dates
Other scheduling limitations
4.7 Availability (via Availability entity)
Recurring weekly pattern
Date-specific overrides (PTO, blocked dates)
Current week visit count vs. max
Weekend availability
Call-out history (for reliability scoring)
4.8 Service Area (Geography)
Home base city + coordinates
Preferred radius
Maximum radius
Named service zones
Travel tolerance
4.9 Languages
Languages spoken
NOTE: Language match is a Layer 2 optimization factor but MUST be bias-audited per FEHA to ensure bilingual clinicians don't systematically receive higher mileage burden
4.10 Preferences (via Preference entity)
Preferred clients
Preferred zones
Preferred shift types
Scheduling preferences
4.11 Restrictions (via Restriction entity)
Blocked clients (hard restrictions)
Soft restrictions (with reason)
General restrictions (e.g., "no live-in shifts")
4.12 Assignment History (via ShiftAssignment entity)
Total assignments completed
Completion rate
Average match score
Most frequently served clients
Last assignment date
4.13 Reliability Indicators (Computed)
Missed visit rate
Call-out frequency (from call-out history)
Documentation timeliness score
Patient/family feedback average (if bias-audited)
Continuity score
4.14 Notes
Admin notes (visible to schedulers)
Clinical notes (visible to clinical managers)
HR notes (restricted visibility)
4.15 Audit Trail (via AuditLog entity)
Every profile change logged
Every credential change logged
Every status change logged
Who changed what, when, why
5. Client Profile Architecture
A complete client profile contains:

5.1 Identity
Display name
Client type: individual_homehealth, individual_homecare, facility
Contact information
Emergency contact
Status (active/inactive/discharged/onHold/pending)
5.2 Location
Address, city, zone
GPS coordinates
Parking difficulty (1-5)
Access notes (gate codes, elevator, wheelchair access)
5.3 Clinical Profile (Home Health Specific)
Visit frequency string (raw physician order)
Parsed visit plan (from Brad's visit frequency parser)
Required disciplines
Required skills
Required credentials
Risk factors
Diagnosis category
Acuity level (L1-L4)
Missed visit sensitivity (how critical is it if a visit is missed)
5.4 Episode Data (Home Health Specific)
Certification period start/end
Current week in episode
Authorization limit (total visits authorized)
Visits used vs. remaining
Payer type
LUPA threshold status (is this episode at risk of falling below threshold?)
5.5 Classification
Episode pattern
Visit intensity
Taper type
Frontload index
Interdisciplinary complexity
Weighted caseload points (computed from acuity: L3-L4=1.0, L2=0.75, L1=0.5)
5.6 Schedule Needs (via ShiftNeed entity)
Required visits per week (derived from parsed visit plan)
Preferred visit times/windows
Recurring schedule pattern
Shift types needed (recurring, PRN, SOC, supervisory, etc.)
5.7 Preferences (via Preference entity)
Preferred clinicians (patient/family request)
Preferred language
Continuity priority (low/med/high)
Gender preference (if applicable)
5.8 Restrictions (via Restriction entity)
Blocked clinicians (patient safety, complaint)
Avoid clinicians (soft preference)
Environmental restrictions (pets, smoking, etc.)
5.9 Care Notes
Scheduler-visible notes
Clinical notes
Special instructions per visit type
5.10 Assignment History (via ShiftAssignment entity)
All clinicians who have served this client
Visit completion rate
Cancellation history (with source: client/caregiver/agency + preventability flag)
Continuity index (% of visits by primary clinician)
5.11 Audit Trail
Every profile change logged
Every status change logged
Every preference/restriction change logged
6. Clinician-Client Connection Layer — Design Detail
Why This Must Be a Separate Entity
The Brad requirements document specifies a 12+ variable matching algorithm. The connection record is where match results live. It cannot be embedded in the clinician profile (clinician doesn't "own" clients) or the client profile (client doesn't "own" clinicians). The connection is its own entity with its own lifecycle.

Connection Lifecycle
[Brad recommends match] → pendingApproval
       ↓
[Clinical manager reviews] → approved (with rationale) OR rejected (with reason)
       ↓
[If approved] → eligible
       ↓
[If assigned to shift] → assigned
       ↓
[If preference established] → preferred
       ↓
[If problem occurs] → restricted OR blocked
       ↓
[If client discharged or clinician leaves] → inactive
Connection Intelligence Fields
The connection record caches computed data to avoid re-calculating on every query:

matchScore — Last calculated score from Brad's optimizer
matchFactors — Breakdown of all scoring components
distanceMiles — Calculated once, updated if either party moves
priorAssignmentCount — Incrementing counter
lastWorkedDate — Updated after each completed visit
continuityFlag — True if 3+ prior assignments with good outcomes
Deduplication Rule
Unique constraint: (clinicianId, clientId) — There is exactly ONE connection record per clinician-client pair. Status changes over time are tracked via AuditLog entries, not duplicate connection records. If a connection goes from preferred → blocked → back to eligible, that's three AuditLog entries on the same connection record.

7. Matching Readiness Logic (Rule-Based, No AI)
Hard Disqualifiers (Layer 1 — MUST FAIL match immediately)
These are non-negotiable. If any of these fail, the clinician is NOT eligible for this client. No override possible.



#	Rule	Check	Source
1	Discipline match	Clinician's primary or additional disciplines must include client's required discipline	Physician order per §484.60
2	Credential validity	All credentials required for this client/visit type must be status=valid (not expired, not pending)	§484.115 + Brad Layer 1
3	License current	State license must not be expired	§484.115
4	Hard block exists	No active restriction with severity=hard between this clinician and client	Safety
5	Religious accommodation conflict	Visit date/time must not conflict with clinician's religiousRestrictions[]	FEHA ADS Layer 1
6	ADA accommodation conflict	Assignment must not violate clinician's adaAccommodations[]	FEHA ADS Layer 1
7	FMLA/pregnancy leave	Clinician must not be on active leave	FEHA ADS Layer 1
8	CA legal work hours	Assignment must not push clinician beyond daily 8hr or weekly 40hr threshold without authorized OT	CA Labor Law
9	Clinician status	Must be active (not inactive, onLeave, suspended, terminated)	Basic eligibility
10	Visit capacity	Clinician must not be at maxVisitsPerDay or maxVisitsPerWeek	Capacity
Ranking Factors (Layer 2 — Used to Score and Rank Eligible Clinicians)
After hard disqualifiers filter the pool, these factors produce a weighted match score:



#	Factor	Weight Range	Logic	Source
1	Distance	+0 to +20	Closer = higher score. Penalty for >20mi (-5 per 5mi over)	Brad optimizer
2	Continuity	+0 to +15	Prior successful assignments with this client = bonus. Scaled by client's continuityPriority	Brad optimizer
3	Skill exact match	+0 to +10	Clinician has exact skills client requires (beyond minimum credential)	Brad optimizer
4	Feedback score	+0 to +10	Patient feedback average (ONLY if bias-audited per FEHA)	Brad optimizer with FEHA caveat
5	Language match	+0 to +5	Clinician speaks client's preferredLanguage. MUST be monitored for mileage disparity	Brad optimizer with FEHA caveat
6	Workload balance	+0 to +10	Less-loaded clinician gets preference (distributes work fairly)	Brad optimizer
7	Client preference	+0 to +10	Client/family has requested this clinician	Preference entity
8	Clinician preference	+0 to +5	Clinician has expressed preference for this zone/client type	Preference entity
9	Overtime risk	-15	Penalty if assignment approaches OT threshold	Brad optimizer
10	Novice on complex case	-10	Penalty if low-experience clinician assigned to L3-L4 acuity	Brad optimizer
11	Soft restriction	-20	Active soft restriction exists (can still be assigned with override + documentation)	Restriction entity
Scoring Formula
matchScore = 50 (base)
  + distanceBonus (max +20)
  + continuityBonus (max +15, scaled by continuityPriority)
  + skillExactMatch (max +10)
  + feedbackBonus (max +10, IF bias-audited)
  + languageMatch (max +5, MONITORED for disparate impact)
  + workloadBalance (max +10)
  + clientPreference (max +10)
  + clinicianPreference (max +5)
  - overtimeRisk (-15 if approaching)
  - noviceOnComplex (-10 if applicable)
  - softRestriction (-20 if exists)
Max theoretical score: 100 Minimum for recommended assignment: Configurable (suggested: 60)

8. Human Approval Workflow
Staffing Pipeline
STEP 1: SHIFT NEED CREATED
├── Source: parsed visit plan, manual entry, or referral intake
├── Status: open
├── Required: discipline, skills, credentials, date, time window
└── System validates: client is active, authorization not exceeded

STEP 2: ELIGIBLE CLINICIANS IDENTIFIED
├── System runs Layer 1 hard disqualifiers
├── Result: pool of eligible clinicians (0 to N)
├── If pool = 0: flag as UNCOVERED, alert scheduler
└── Status: matchingInProgress

STEP 3: CLINICIANS RANKED
├── System runs Layer 2 scoring on eligible pool
├── Result: ranked list with match scores and factor breakdowns
├── System runs Layer 3 bias check on proposed assignments
├── Result: bias flags attached if disparate impact detected
└── System presents top 3-5 candidates with full citation cards

STEP 4: SCHEDULER REVIEWS
├── Scheduler sees: ranked candidates, match scores, bias flags, accommodation checks
├── Scheduler can: approve top recommendation, select alternate, override with rationale
├── Required: scheduler documents rationale for any override
├── Status: pendingApproval → assigned
└── NOTE: This is NOT a rubber stamp — scheduler must have time and information for meaningful review

STEP 5: CLINICAL MANAGER APPROVES (if required)
├── Required for: first-time connections, override of Brad recommendation, high-acuity (L3-L4) assignments, bias-flagged assignments
├── Optional for: routine assignments to existing preferred connections
├── Approver must be qualified per §484.115
└── Status: approved

STEP 6: CLINICIAN NOTIFIED
├── Via: app notification, SMS, or phone call
├── Clinician sees: client summary, visit date/time, location, special instructions
├── Clinician can: confirm, decline (with reason), flag concern
├── Status: clinicianNotified → clinicianConfirmed or clinicianDeclined
└── If declined: system re-triggers matching for this shift need

STEP 7: ASSIGNMENT LOCKED
├── Status: clinicianConfirmed
├── Appears on clinician schedule and client schedule
├── EVV enabled for visit tracking (AlayaCare integration)
└── All data logged to AuditLog

STEP 8: POST-VISIT
├── Visit completed: status → completed, completedAt logged
├── Visit missed: status → missed, trigger recovery protocol per QA/PI Playbook
├── Visit cancelled: status → cancelled, cancellationSource + reason + preventability logged
└── Outcome data feeds back into connection record (priorAssignmentCount, lastWorkedDate, continuityFlag)
Actions Requiring Supervisor/Admin Approval


Action	Required Approver	Rationale
Override Brad's top recommendation	Clinical Manager (§484.115 qualified)	Must document why alternate is better
Assign to bias-flagged match	Clinical Manager	Must review and document that bias concern was evaluated
Assign to L3-L4 acuity patient (first-time connection)	Clinical Manager	High-risk patient requires clinical judgment
Remove a hard restriction/block	Admin	Safety concern — requires investigation before removal
Approve expanded radius (>25 miles)	Scheduler or Clinical Manager	Cost/burnout implication
Authorize PRN/overtime assignment	Clinical Manager or Admin	Cost + labor law compliance
Assign clinician with expiring credential (<7 days)	Not allowed — system blocks	No human override
9. Data Integrity Rules


Rule	Implementation	Prevents
Unique clinician record	Composite unique on: firstName + lastName + primaryDiscipline + dateOfBirth (if available) OR licenseNumber	Duplicate clinicians
Unique client record	Composite unique on: displayName + address + clientType OR external system ID	Duplicate clients
Unique connection	Unique constraint on (clinicianId, clientId)	Duplicate connections
Availability conflict detection	Before saving availability, check for overlapping time ranges for same clinician on same day	Conflicting availability
Credential expiry enforcement	Nightly batch job checks all credentials; auto-transitions valid → expiringSoon → expired. Expired credential = hard block	Assignment to expired credentials
Block enforcement	Before any assignment, check Restriction entity for active hard blocks	Assignment to blocked clients
No auto-assignment	Every ShiftAssignment must have approvedBy populated before status transitions past pendingApproval	Accidental auto-assignment
No hardcoded matching logic	All matching weights and thresholds stored in configuration, not in code	Hidden hardcoded logic
Referential integrity	All foreign keys enforced. Cannot delete a clinician with active assignments. Cannot delete a client with active shift needs.	Orphaned records
Status transition validation	Define valid status transitions per entity. E.g., ShiftAssignment can't go from proposed directly to completed — must pass through approval chain.	Invalid state transitions
10. Audit and Defensibility
What Must Be Logged (Append-Only, Immutable)


Event	Required Fields	Rationale
Profile created	entityType, entityId, all initial values, createdBy, timestamp	Full creation trail
Profile updated	field changed, previous value, new value, changedBy, timestamp	Change tracking
Credential added/updated/expired	credential type, old status, new status, verified by	Compliance proof
Restriction added	restriction type, severity, reason, restricted by	Safety documentation
Restriction removed	removal reason, removed by	Override accountability
Connection status changed	old status, new status, reason, changed by	Relationship tracking
Shift assignment created	full matchScore, matchFactors, bias flags, accommodation check	Defensibility per FEHA
Shift assignment approved	approved by (with credentials), rationale, timestamp	§484 compliance + FEHA meaningful review
Shift assignment overridden	Brad's recommendation, human's override, rationale	Required for FEHA — demonstrates meaningful review
Shift assignment cancelled	cancellation source (client/caregiver/agency), reason, preventability flag	QA/PI Playbook compliance
Bias flag generated	affected group, deviation %, flagged metrics	FEHA Layer 3 documentation
Accommodation applied	type, clinician affected, constraint enforced	FEHA Layer 1 documentation
Citation Card (Attached to Every ShiftAssignment)
Per the defensibility framework from the requirements document, every assignment includes:

{
  "citationCard": {
    "result": "Assigned LVN Rosa Martinez to HH-023 wound care visit",
    "ruleApplied": "Assignment Optimizer — Layer 2 scoring",
    "matchScore": 87,
    "hardConstraintsPassed": ["discipline_match", "credential_valid", "no_accommodation_conflict", "no_hard_block", "within_work_hours"],
    "scoringFactors": {
      "distance": "+18 (12 miles)",
      "continuity": "+15 (3 prior visits, patient high-continuity priority)",
      "skillMatch": "+10 (wound_care exact match)",
      "feedbackScore": "+8 (4.6/5, bias-audited: no disparity detected)",
      "workloadBalance": "+6 (3/5 visits today)"
    },
    "biasCheck": {
      "mileageDisparity": "within tolerance",
      "weekendSkew": "not applicable",
      "acuityCorrelation": "no flag"
    },
    "confidence": "HIGH — policy-driven",
    "assumptions": "none — all data from current profiles",
    "disclaimer": "AI-assisted recommendation. Assignment subject to clinical manager review and approval per 42 CFR §484 and agency policy."
  }
}
11. UX / Navigation Recommendation
Minimum Screens (Information Architecture)


Screen	Purpose	Key Actions
Clinician Directory	Searchable/filterable list of all clinicians. Filter by discipline, status, zone, credential status, availability.	Add clinician, quick-view profile, filter/search
Clinician Profile Detail	Full profile view with tabs.	View/edit identity, credentials (with expiry alerts), skills, availability, accommodations, restrictions, preferences, assignment history, audit trail
Client Directory	Searchable/filterable list of all clients. Filter by type, acuity, status, zone, payer.	Add client, quick-view profile, filter/search
Client Profile Detail	Full profile view with tabs.	View/edit identity, location, clinical requirements, episode data, visit frequency, preferences, restrictions, assignment history, audit trail
Connection Manager	View and manage all clinician-client connections. Filter by status, search by either party.	View connection details, change status (with rationale), see match scores, see history
Shift Need / Assignment Panel	The daily operations view. "Today" and "Tomorrow" views showing all shift needs, their status, assigned clinicians, gaps.	Create shift need, view matching candidates, approve assignment, handle call-outs, see uncovered visits
Matching Review Panel	When a shift need is open, this panel shows Brad's ranked candidates with full scoring breakdown, bias check summary, accommodation verification, and citation card.	Review candidates, approve/override with rationale, escalate
Navigation Structure
Dashboard (daily operations summary)
├── Clinician Directory
│   └── Clinician Profile Detail
│       ├── Tab: Overview
│       ├── Tab: Credentials & Compliance
│       ├── Tab: Skills
│       ├── Tab: Availability & Accommodations
│       ├── Tab: Connections (clients served)
│       ├── Tab: Assignment History
│       └── Tab: Audit Trail
├── Client Directory
│   └── Client Profile Detail
│       ├── Tab: Overview
│       ├── Tab: Clinical Requirements
│       ├── Tab: Episode & Authorization
│       ├── Tab: Schedule Needs
│       ├── Tab: Connections (clinicians assigned)
│       ├── Tab: Preferences & Restrictions
│       ├── Tab: Assignment History
│       └── Tab: Audit Trail
├── Staffing Board (daily shift needs + assignments)
│   ├── Today View
│   ├── Tomorrow View
│   ├── Week View
│   └── Uncovered Visits Alert
├── Connection Manager
│   ├── Active Connections
│   ├── Pending Approval
│   ├── Blocked/Restricted
│   └── Inactive
└── Reports
    ├── Compliance Dashboard (credential expiry, accommodation tracking)
    ├── Bias Monitoring Dashboard (FEHA Layer 3)
    └── Audit Log Viewer (read-only, search/filter)
12. Phased Implementation Plan
Phase 1: Data Model + Mock Data (Weeks 1-2)
Define all TypeScript interfaces for all 11 entities
Create mock data generators for clinicians (70+), clients (150+)
Implement unique constraint validation functions
Set up local state management (or lightweight DB)
Deliverable: All entity types defined, mock data loading, no UI yet
Phase 2: Profile Directories + Detail Views (Weeks 3-4)
Clinician Directory (list, search, filter)
Clinician Profile Detail (tabbed view, read-only first)
Client Directory (list, search, filter)
Client Profile Detail (tabbed view, read-only first)
Deliverable: Can browse and view all clinician and client data
Phase 3: Connection Layer (Weeks 5-6)
ClinicianClientConnection entity implementation
Connection Manager screen
Status transitions with audit logging
Connection CRUD (create, update status, add notes)
Unique constraint enforcement (one connection per pair)
Deliverable: Can create, view, and manage clinician-client connections independently of either profile
Phase 4: Availability / Credentials / Skills (Weeks 7-8)
Availability management (recurring + date-specific)
Conflict detection (overlapping availability blocks)
Credential management with expiration tracking
Credential expiry batch check (valid → expiringSoon → expired)
Skills management (add/remove/verify for both clinicians and clients)
Accommodation fields (religious, ADA, pregnancy, FMLA) — hard constraints
Deliverable: Complete compliance data layer. Can determine if a clinician is eligible for any given shift.
Phase 5: Shift Need + Matching Review (Weeks 9-11)
ShiftNeed creation (from parsed visit plan or manual)
Layer 1 hard disqualifier filter
Layer 2 scoring algorithm (configurable weights)
Matching Review Panel (ranked candidates with score breakdowns)
Staffing Board (daily view: today, tomorrow, week)
Uncovered visit alerting
Deliverable: Can generate ranked match candidates for any open shift need. Human reviews and selects.
Phase 6: Audit Logs + Approval Workflow (Weeks 12-13)
AuditLog entity — append-only
Automatic logging on all entity changes
Approval workflow: proposed → pendingApproval → approved → notified → confirmed
Override documentation (required text field)
Citation card generation per assignment
Bias check stub (flag generation logic, even if basic)
Cancellation tracking with source + reason + preventability flag
Deliverable: Full audit trail. Every assignment traceable. Defensible per FEHA and CoP requirements.
Phase 7: AI / Staffing Assistant Integration (Future — After Foundation)
Brad optimizer integration (auto-generates full daily plan)
Layer 3 bias check automation (statistical analysis on assignments)
Predictive call-out modeling
Visit frequency parser integration
Consequence engine
Embedded Ops Coach (inline training moments)
Deliverable: Brad Workforce AI operating on clean, auditable, legally compliant data foundation.
13. Risks and Safeguards


Risk	Likelihood	Impact	Safeguard
Clinician-client hardwiring — Developer shortcuts that embed client IDs in clinician records or vice versa	High (during rapid dev)	Critical — breaks entire connection model	Enforce via code review: no clientIds[] on Clinician, no clinicianIds[] on Client. Connection table only.
Credential bypass — Human overrides an expired credential block	Medium	Critical — §484.115 violation, survey deficiency	System BLOCKS, not warns. No UI button to override expired required credential.
Accommodation bypass — Accommodation conflicts treated as soft warnings	Medium	Critical — FEHA violation	Accommodation conflicts are Layer 1 hard constraints. System removes clinician from eligible pool entirely. No "assign anyway" option.
Duplicate records — Same clinician entered twice with different spelling	High	High — creates phantom staffing capacity	Composite unique keys + fuzzy match warning on create ("Did you mean...?")
Audit log tampering — Developer or admin edits audit logs	Low	Critical — destroys regulatory defensibility	Audit log table: no UPDATE or DELETE operations permitted at application layer. Append-only.
Bias monitoring skipped — Layer 3 check not implemented or ignored	Medium	High — FEHA exposure for the agency	Build bias check stub from Phase 5. Even basic: "average mileage by demographic group for this plan." Don't ship assignment workflow without it.
Over-engineering connection states — Too many status values create confusion	Medium	Medium — UX friction, data quality issues	Start with 7 states defined above. Don't add more until real operational need emerges.
Performance at scale — 150 clients × 70 clinicians = 10,500 potential connections; matching query on every shift is O(N×M)	Low (at current scale)	Medium (at 500+ clients)	Index on (clinicianId, clientId, connectionStatus). Pre-filter by discipline and zone before scoring. Cache connection scores.
Demo logic leaking into production — Mock data generators or hardcoded demo scenarios left in production code	High	High — unreliable system	Separate /mock and /src directories. Mock data behind environment flag. No mock data in production builds.
Missing cancellation classification — Cancellations tracked without source/reason/preventability	Medium	High — can't run QA/PI Playbook escalation triggers	Make cancellationSource, cancellationReason, and cancellationPreventable REQUIRED fields on any ShiftNeed or ShiftAssignment status transition to cancelled or missed. No "quick cancel" without reason.
14. Recommendations & Feature Enhancement Feedback
What's Strong About the Current Direction
The junction model approach is correct. Separating clinician-client relationships into their own entity is the right architectural call. It enables match scoring, history tracking, approval workflow, and audit logging without polluting either profile.
The 5-layer compliance architecture from the Brad requirements is production-ready. Layers 1-5 map cleanly to the entity model above. Layer 1 = hard constraints on Clinician (credentials, accommodations) + Restriction (hard blocks). Layer 2 = Skill + Preference + Connection scoring. Layer 3 = demographic fields on Clinician + statistical analysis on ShiftAssignment patterns. Layer 4 = approvalStatus + approvedBy on ShiftAssignment. Layer 5 = AuditLog.
The weighted caseload formula integrates naturally. Client.acuityLevel → weighted points → ACCM hard cap at 40. This is a client-side computed field that feeds into the matching readiness logic as a capacity check.
Gaps I've Identified (Not in Current Sources)
ACCM assignment tracking is missing. The weighted caseload formula (hard cap at 40) applies per ACCM, but there's no entity tracking which ACCM owns which client. Recommendation: Add an assignedAccMId field on the Client entity, and a computed currentCaseloadPoints on the ACCM/user profile. The matching readiness logic should check: "If I assign this client to this ACCM's portfolio, does it exceed 40 points?"

Supervisory visit scheduling is implicit, not explicit. The Brad requirements reference aide supervisory compliance (§484.80 — RN must supervise aides every 14 days). The current model tracks it as a credential/skill on the clinician, but there's no mechanism to auto-generate supervisory ShiftNeeds when an HHA/CNA is assigned to a client. Recommendation: When a ShiftAssignment is created for an HHA/CNA, the system should auto-generate a linked supervisory ShiftNeed (shiftType: supervisory, requiredDiscipline: RN, due within 14 days). This prevents the compliance gap identified in the original Brad review.

Visit frequency parsing output needs a home. The Brad requirements define a visit frequency parser that decodes "SN 3w1, 2w3, 1w4" into structured visit plans. The Client profile has visitFrequencyString (raw) but needs a parsedVisitPlan structure that feeds ShiftNeed generation. Recommendation: Add a ParsedVisitPlan embedded object on Client that stores: discipline, segments[] (visits, perWeek, forWeeks), totalVisits, weeklyDistribution[]. When this is populated (by Brad's parser or manual entry), the system can auto-generate the week's ShiftNeeds.

Shift need generation from visit plans is not automated. Currently, ShiftNeeds would need to be created manually. For 150 patients with ~8 visits/week average, that's 1,200 ShiftNeeds per week created by hand. Recommendation for Phase 5: Build a "Generate Weekly Shift Needs" function that reads each active client's parsedVisitPlan + currentWeek and creates the appropriate ShiftNeed records. This is a deterministic, rules-based function (not AI) — it just expands the visit plan into concrete shift needs.

Clinician confirmation flow needs a lightweight mechanism. The workflow defines "clinician notified → clinician confirms/declines" but the current architecture doesn't specify how. Given Phase 1 is local/offline, SMS or phone is realistic. Recommendation: Add a notificationMethod field on ShiftAssignment (enum: app, sms, phone, email) and a notificationSentAt timestamp. For Phase 1, the scheduler manually records confirmation. Phase 2 adds actual notification integration.

Recovery protocol for missed/cancelled visits. The QA/PI Playbook defines escalation triggers (3+ cancellations → at-risk flag, >30% preventable → CEO escalation). The current model tracks cancellation data on ShiftNeed but doesn't define who gets alerted. Recommendation: Add a RecoveryProtocol logic layer (not an entity — a function) that runs after every ShiftNeed status change to cancelled or missed and evaluates:

Is this the 3rd cancellation for this client this week? → Flag client at-risk
Is this a caregiver-initiated cancellation? → Route to CG Success Supervisor (never ACCM per role separation)
Is weekly preventable rate approaching 30%? → Generate CEO escalation alert
Is this an uncovered visit for an L3-L4 patient? → Critical priority re-staffing
No explicit "call-out" event. A caregiver call-out is the most common staffing disruption but it's not a first-class entity. Currently it would be modeled as a ShiftAssignment status change (confirmed → cancelled with source=caregiver_initiated). Recommendation: This is fine for Phase 1. The call-out is an event, not an entity. The ShiftAssignment cancellation + ShiftNeed reopening handles it. But add a callOutHistory[] on the Clinician profile (as specified in the Brad data model) that aggregates: date, reason, shift affected, was it covered. This feeds the reliability scoring.

✅ CONFIRMED: Full System Documentation Received & Reviewed
I have all 15 architecture documents (00–14) plus your live CMS context (collections, folders, operational playbooks, org charts). Here's the deliverable:

TARGETED REVISION PLAN: Clinician & Client Profile Architecture
Scope Constraints Applied
✅ No full architecture rewrite
✅ No code implementation
✅ No unrelated systems added
✅ No product rename
✅ Core design preserved
✅ Terminology: Discipline-first, Competency/Skill-second
1. DATA MODEL GAPS
1.1 Missing: Service Setting Distinction
The current doc 13 has no concept of where care is delivered. Care Indeed operates across:

Home-based (private residence)
Facility-based (ALF, SNF, memory care — B2B)
Home Health (Medicare-certified skilled visits via WellSky)
Fix: Add serviceSetting: 'home' | 'facility' | 'home_health' to both Client and ClinicianClientAssignment models. This drives scheduling rules, access protocols, and supervisory requirements.

1.2 Missing: Discipline as Primary Matching Axis
Doc 13 uses role: ClinicianRole which conflates organizational role with professional discipline.

Fix: Replace with:

primaryDiscipline: Discipline;         // RN, LVN, PT, PTA, OT, COTA, ST, MSW, HHA, CNA, Caregiver
secondaryDisciplines?: Discipline[];   // Additional disciplines held
competencies: Competency[];            // wound care, IV therapy, OASIS, trach, etc.
credentials: Credential[];            // License/cert with state, expiry, evidenceRef
1.3 Missing: Visit Plan / ShiftNeed Generation
No concept exists for converting a Plan of Care into concrete shift needs. The current assignedClinicianIds: string[] is too flat.

Fix: Add:

interface ShiftNeed {
  id: string;
  clientId: string;
  requiredDiscipline: Discipline;
  requiredCompetencies?: string[];     // soft or hard requirements
  frequency: string;                   // "3x/week", "daily", "PRN"
  preferredSchedule?: WeeklyPattern;
  durationHours: number;
  startDate: string;
  endDate?: string;
  status: 'open' | 'filled' | 'partially_filled' | 'cancelled';
  assignedClinicianId?: string;
  source: 'care_plan' | 'physician_order' | 'manual';
}
1.4 Missing: ACCM Caseload Ownership
Care Indeed's model has ACCM as portfolio owner of clients, not the field clinician. The architecture has no concept of this administrative ownership layer.

Fix: Add to Client model:

accmOwnerId: string;                  // ACCM who owns this client's journey
ccmId?: string;                       // RN/CCM for clinical oversight (L3-L4)
cgssId?: string;                      // CG Success Supervisor for assigned caregivers
1.5 Missing: Supervisory Visit Compliance
Home Health requires supervisory visits per 42 CFR §484.80. No model for tracking this.

Fix (defer to Phase 2): Note in architecture that SupervisoryVisit entity is needed with:

Discipline of supervisee
Date of last supervisory visit
Compliant/overdue status
Link to CES compliance event
1.6 Missing: Care Tier / Acuity Level
Care Indeed uses L1–L4 tiers that determine staffing requirements, competency needs, and QA cadence.

Fix: Add to Client:

careTier: 'L1' | 'L2' | 'L3' | 'L4';  // Essential, Enhanced, Complex, Critical
acuityNotes?: string;
2. NAMING RISKS


Current Name	Problem	Fix
Clinician	Implies licensed only; excludes HHAs and Caregivers	Keep Clinician BUT define it broadly as "any care worker" in the type docs. OR rename to CareWorker with discipline determining scope
role: ClinicianRole	Ambiguous — is it org role or professional discipline?	Split into discipline (professional category) and orgRole (admin role in system)
Client	Acceptable for Home Care; for Home Health might be "Patient"	Use Client as the universal term; add serviceType field to indicate HH vs HC
ClinicianClientAssignment	Too generic; doesn't convey shift-level granularity	Rename to CareAssignment — covers both ongoing assignments and per-shift matches
primaryClinician: boolean	Insufficient for multi-discipline teams	Replace with `assignmentRole: 'primary'
Terminology Standard (enforce everywhere):
Discipline = professional/service category (RN, LVN, HHA, Caregiver, etc.)
Competency = specific capability/experience (wound care, trach, Hoyer, etc.)
Credential = license/certification/document proving eligibility
Skill = NEVER use as primary term; always secondary to Discipline
3. PHASE 1 IMPLEMENTATION READINESS
What's Ready (reuse from existing codebase):


Existing Asset	Reuse For
Auth/Cognito system	Clinician accounts
DynamoDB	Profile persistence
Identity/RBAC (userGroups.ts)	Add Clinician, ACCM, VCC groups
Evidence model	Credential evidence storage
eCIgn system	Clinician onboarding signatures
Forms system	Intake forms, assignment forms
CES engine	Credential renewal compliance events
What's NOT Ready:


Gap	Risk
No DynamoDB table design for profiles	Must design before code
No API routes for /api/clinicians or /api/clients	Must create
AlayaCare integration not in codebase	Defer — use mock data
WellSky integration not in codebase	Defer — out of scope
Matching engine logic	Defer to Phase 2
4. LEGAL/COMPLIANCE RISKS


Risk	Severity	Mitigation
PHI in Client model (DOB, diagnosis, address)	Critical	Encrypt at rest in DynamoDB. Add phi: true marker on fields. Require BAA with AWS.
License verification	High	Credential.verifiedAt + verifiedBy fields. Never auto-approve — human verification required.
Supervisory visit tracking	High (Home Health)	Must exist before HH clinicians are assigned. Audit trail required.
HIPAA minimum necessary	High	Brad should NOT have access to PHI fields in client profiles. Corpus exclusion required.
Caregiver ≠ Employee ambiguity	Medium	Add `employmentType: 'W2'
Facility client data	Medium	Facility-based clients may have facility-owned data. Document data ownership.
5. OVER-ENGINEERING RISKS


Proposed Feature (Doc 13)	Over-Engineering?	Verdict
Full S3 evidence wiring in Phase 1	Yes	Defer — use DynamoDB credential metadata first
CES integration for credentials in Phase 1	Yes	Defer — manual credential tracking first
Matching engine	Yes for Phase 1	Defer entirely to Phase 2
Real-time AlayaCare sync	Yes	Defer — mock/manual data
Client care plan parser	Yes	Defer — manual ShiftNeed creation in Phase 1
PDF evidence packets for profiles	Yes	Defer
Multi-entity (HC + HH + GCM) in one model	Yes	Start with Home Care only; add HH in Phase 3
6. MISSING APPROVAL-ROLE DEFINITIONS
The architecture has no concept of who approves what:



Action	Approver	Notes
New clinician profile created	HR/Credentialing	Jennifer's team per org chart
Credential verified	Credentialing Specialist	Albert/Sheila per org chart
Client assigned to ACCM	Care Management Director	
Caregiver-to-client match	ACCM (portfolio owner)	VCC proposes, ACCM approves
Hard gate override	Director-level	Never auto-override
Supervisory visit compliant	RN/CCM	For HHA/CNA supervision
Clinician deactivated	HR + CG Success Supervisor	Joint decision
Fix: Add ApprovalConfig to the architecture specifying required approver role for each state transition.

7. HOME HEALTH vs HOME CARE vs FACILITY DISTINCTIONS


Dimension	Home Care (HC)	Home Health (HH)	Facility (B2B)
Regulation	State HCOA license	42 CFR Part 484 (Medicare CoPs)	Varies by facility contract
Clinician term	Caregiver / HHA	RN, LVN, PT, OT, ST, MSW, HHA	Same as HC
Documentation system	AlayaCare	WellSky	AlayaCare
Orders required	No	Physician orders (485)	Per facility protocol
Supervisory visits	Quarterly QA	Per 484.80 (every 14 days for HHA)	Per facility contract
Scheduling owner	VCC	HH Scheduling Coordinator	VCC (facility access rules)
Portfolio owner	ACCM	HH Clinical Manager	ACCM
Billing	Private pay / LTC insurance	Medicare/Medicaid	Contract rate
Brad scope (Phase 1)	✅ Include	❌ Defer	✅ Include (subset of HC)
Fix: The serviceSetting field on Client combined with serviceEntity: 'home_care' | 'home_health' determines which rules apply. Phase 1 covers Home Care + Facility. Home Health deferred.

8. PARSED VISIT PLAN & SHIFTNEED GENERATION
Current State: Nothing exists.
Recommended Architecture (Phase 2):
Physician Order / Care Plan 
    → Parsed by ACCM/CCM into ShiftNeeds
    → ShiftNeed specifies: discipline, competencies, schedule pattern, duration
    → VCC matches ShiftNeed to available Clinicians
    → ACCM approves match
    → CareAssignment created
Phase 1 Scope:
ShiftNeed as a manually created entity (no parser)
Fields: requiredDiscipline, requiredCompetencies[], frequency, durationHours, status
Display on Client detail page as "Care Needs" section
No auto-matching — just data entry and display
9. ACCM CASELOAD OWNERSHIP
Design:
Every active Home Care client has exactly ONE accmOwnerId
ACCM portfolio is queryable: "Show me all clients owned by ACCM X"
ACCM ≠ the caregiver. ACCM manages the relationship; caregiver delivers the service.
Transfer of ownership requires explicit handoff (create CaseloadTransfer event)
Phase 1 Scope:
accmOwnerId field on Client (required for HC clients)
Client list page filterable by ACCM
Read-only display of ACCM on client detail
Defer:
Caseload capacity metrics
Auto-assignment of new clients to ACCMs
Transfer workflow
10. SUPERVISORY VISIT COMPLIANCE
Regulatory Requirements:
HHA in Home Health: RN supervisory visit every 14 days (42 CFR §484.80)
Caregivers in Home Care: Quarterly quality assurance visit (per HCOA/ACHC)
Facility: Per contract + state regs
Phase 1 Scope:
Do NOT build compliance tracking yet
Add a lastSupervisoryVisit?: string field on CareAssignment
Display as informational only
Flag in UI if >90 days since last visit (yellow) or >14 days for HH (red)
Defer to Phase 2:
CES event generation for upcoming supervisory visits
Automated scheduling reminders
Evidence packet for completed supervisory visits
Regulatory reporting
11. WHAT SHOULD BE DEFERRED
Explicit "DO NOT BUILD YET" List:


Feature	Reason	Target Phase
Matching engine	Complex, requires ShiftNeed + availability + constraint solver	Phase 2
AlayaCare integration	External API dependency; need contract/credentials	Phase 3
WellSky integration	Home Health only; defer HH entirely	Phase 4+
Auto-ShiftNeed generation from care plans	Requires NLP/parsing or structured intake	Phase 2
Credential renewal CES events	CES state persistence must be fixed first (Issue #1 in doc 12)	Phase 2
Supervisory visit compliance engine	Requires CES + scheduling integration	Phase 2
Client intake forms via eCIgn	eCIgn backend is JSONL — not production-grade	Phase 2
Caregiver-client compatibility scoring	ML/algorithm — premature	Phase 3
Caseload balancing	Requires metrics + reporting foundation	Phase 3
Multi-entity support (HH + HC in one view)	Architectural complexity; start HC-only	Phase 3
Mobile app for field clinicians	Completely separate initiative	Future
Brad knowledge of client PHI	HIPAA risk too high without guardrails	Never (or Phase 4 with PHI framework)
OUTPUT: PHASE 1 BUILD SCOPE
Critical Fixes Before Implementation
Terminology correction throughout: Replace all "Skill" references with "Discipline" as primary, "Competency" as secondary
Add serviceSetting distinction (home/facility) — don't try to model Home Health yet
Add careTier (L1-L4) to Client — this drives everything downstream
Add accmOwnerId to Client — ACCM portfolio ownership is fundamental to Care Indeed's model
Split role into discipline + orgRole on Clinician
Add employmentType to Clinician (W2 vs contractor)
Define approval roles for each state transition
Recommended Model Adjustments
Clinician (renamed fields)
interface Clinician {
  id: string;
  userId?: string;                     // Link to auth user (if they have app access)
  firstName: string;
  lastName: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  
  // Professional Identity
  primaryDiscipline: Discipline;
  secondaryDisciplines?: Discipline[];
  competencies: Competency[];
  credentials: Credential[];
  
  // Employment
  employmentType: 'W2' | 'contractor';
  hireDate?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'terminated';
  
  // Organization
  orgRole?: 'field_clinician' | 'supervisor' | 'accm' | 'ccm' | 'vcc' | 'admin';
  supervisorId?: string;
  cgssId?: string;                     // CG Success Supervisor
  
  // Service
  serviceAreas?: string[];             // Zip codes or city names
  maxHoursPerWeek?: number;
  
  createdAt: string;
  updatedAt: string;
}

type Discipline = 
  | 'RN' | 'LVN' | 'LPN'
  | 'PT' | 'PTA' 
  | 'OT' | 'COTA'
  | 'ST' | 'SLP'
  | 'MSW'
  | 'HHA' | 'CNA'
  | 'Caregiver';

interface Competency {
  name: string;                        // "wound_care", "iv_therapy", "oasis", etc.
  level?: 'basic' | 'intermediate' | 'advanced';
  verifiedAt?: string;
  verifiedBy?: string;
}

interface Credential {
  type: string;                        // "RN_License", "CPR", "TB_Test", "HHA_Cert"
  issuingBody?: string;
  licenseNumber?: string;
  state?: string;
  issuedAt: string;
  expiresAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  status: 'active' | 'expired' | 'pending_verification' | 'revoked';
  evidenceRef?: string;
}
Client (renamed: ServiceRecipient internally, displayed as "Client")
interface Client {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  
  // Service Context
  serviceSetting: 'home' | 'facility';
  serviceEntity: 'home_care';           // Phase 1: HC only
  careTier: 'L1' | 'L2' | 'L3' | 'L4';
  status: 'active' | 'inactive' | 'discharged' | 'pending' | 'on_hold';
  
  // Ownership
  accmOwnerId: string;                  // ACCM portfolio owner
  ccmId?: string;                       // RN/CCM for L3-L4
  
  // Location (non-PHI for matching)
  serviceZip?: string;
  serviceCity?: string;
  facilityId?: string;                  // If facility-based
  facilityName?: string;
  
  // Dates
  admissionDate?: string;
  dischargeDate?: string;
  
  // Care Needs (Phase 1: display only)
  primaryDiagnosisCategory?: string;    // NOT the actual diagnosis — just category for matching
  requiredDisciplines: Discipline[];
  requiredCompetencies?: string[];
  
  // PHI (encrypted, access-controlled — defer storage to Phase 2)
  // dateOfBirth?: string;              // DEFER
  // primaryDiagnosis?: string;         // DEFER
  // address?: ClientAddress;           // DEFER
  
  createdAt: string;
  updatedAt: string;
}
CareAssignment (replaces ClinicianClientAssignment)
interface CareAssignment {
  id: string;
  clinicianId: string;
  clientId: string;
  discipline: Discipline;               // What discipline is this assignment for
  assignmentRole: 'primary' | 'secondary' | 'prn' | 'supervisory';
  startDate: string;
  endDate?: string;
  status: 'active' | 'ended' | 'pending_approval';
  
  // Approval
  assignedBy: string;                   // VCC who proposed
  approvedBy?: string;                  // ACCM who approved
  approvedAt?: string;
  
  // Supervisory (informational in Phase 1)
  lastSupervisoryVisit?: string;
  
  createdAt: string;
}
ShiftNeed (Phase 1: manual entry, display only)
interface ShiftNeed {
  id: string;
  clientId: string;
  requiredDiscipline: Discipline;
  requiredCompetencies?: string[];
  isHardRequirement: boolean;           // true = disqualifier; false = ranking factor
  frequency?: string;                   // "3x/week", "daily", "PRN"
  preferredDays?: string[];             // ["Mon", "Wed", "Fri"]
  durationHours?: number;
  startDate: string;
  endDate?: string;
  status: 'open' | 'filled' | 'cancelled';
  assignedCareAssignmentId?: string;
  notes?: string;
  createdAt: string;
}
Fields to Add/Remove/Defer


Action	Field	Reason
ADD	Clinician.primaryDiscipline	Core matching axis
ADD	Clinician.competencies[]	Secondary matching
ADD	Clinician.employmentType	Compliance driver
ADD	Clinician.orgRole	System permissions
ADD	Client.serviceSetting	Rules engine driver
ADD	Client.careTier	QA cadence + staffing reqs
ADD	Client.accmOwnerId	Portfolio ownership
ADD	Client.requiredDisciplines	Matching input
REMOVE	Client.dateOfBirth from Phase 1	PHI risk — defer
REMOVE	Client.primaryDiagnosis from Phase 1	PHI risk — defer
REMOVE	Client.address from Phase 1	PHI risk — defer
REMOVE	Clinician.licenseNumber at top level	Moved into credentials[]
DEFER	ShiftNeed.matchScore	No matching engine yet
DEFER	SupervisoryVisit entity	Phase 2
DEFER	CaseloadTransfer entity	Phase 2
DEFER	AvailabilityWindow entity	Phase 2 (matching engine)
PHASE 1 BUILD SCOPE (Implementation Prompt)
What to Build:
TypeScript types — Clinician, Client, CareAssignment, ShiftNeed, Discipline, Competency, Credential
Directory structure — src/policy/clinician/, src/policy/client/
Mock data — 8-10 clinicians across disciplines, 5-6 clients across tiers and settings
Zustand stores — clinicianStore.ts, clientStore.ts (seeded from mock data)
Read-only pages:
/clinicians — Clinician list (filterable by discipline, status)
/clinicians/:id — Clinician detail (profile, credentials, competencies, assignments)
/clients — Client list (filterable by tier, ACCM, setting)
/clients/:id — Client detail (profile, care needs, assignments, shift needs)
Route registration in App.tsx
Sidebar nav entries in CommandCenterLayout
What NOT to Build:
No write/edit UI (read-only detail views only)
No matching engine
No AlayaCare/WellSky integration
No PHI fields
No credential renewal compliance
No supervisory visit tracking (beyond display)
No approval workflows
No S3 evidence storage
No Brad/IA integration with profile data

claude-opus-4.6
92,106 tokens
·
12:08 AM
clipboard-20260513-001657.png
clipboard-20260513-001657.png
clipboard-20260513-001628.png
clipboard-20260513-001628.png
please rewrite this part i cant copy paste. dont use text box
12:17 AM

FINAL IMPLEMENTATION PROMPT FOR CURSOR/SONNET
CONTEXT:

You are implementing Phase 1 of the Clinician & Client Profile system for the Care Indeed Compliance Platform (ci-policy-app). This is a React 19 + TypeScript + Zustand + Tailwind app. Follow all existing codebase conventions exactly (see naming conventions table below).

TERMINOLOGY (ENFORCE STRICTLY):

Discipline = professional/service category (RN, LVN, HHA, Caregiver, PT, OT, ST, MSW, CNA)
Competency = specific capability/experience (wound care, IV therapy, OASIS, trach, Hoyer lift)
Credential = license/certification/document proving eligibility
NEVER use "Skill" as a substitute for Discipline anywhere in the codebase
NAMING CONVENTIONS:

TypeScript types: PascalCase interface (interface Clinician {})
Zustand stores: camelCase + Store suffix (clinicianStore.ts)
React pages: PascalCase + Page suffix (ClinicianListPage.tsx)
React components: PascalCase (ClinicianCard.tsx)
API service files: camelCase + Api suffix (clinicianApi.ts)
Route paths: kebab-case plural (/clinicians, /clients)
Feature directory: lowercase under src/policy/ (src/policy/clinician/)
Types file: types.ts in feature root
PHASE 1 SCOPE — BUILD EXACTLY THIS:

CREATE TYPES (src/policy/clinician/types.ts):
Discipline type union: 'RN' | 'LVN' | 'LPN' | 'PT' | 'PTA' | 'OT' | 'COTA' | 'ST' | 'SLP' | 'MSW' | 'HHA' | 'CNA' | 'Caregiver'
Competency interface: { name, level?, verifiedAt?, verifiedBy? }
Credential interface: { type, issuingBody?, licenseNumber?, state?, issuedAt, expiresAt?, verifiedAt?, verifiedBy?, status, evidenceRef? }
Clinician interface: { id, firstName, lastName, preferredName?, email?, phone?, primaryDiscipline, secondaryDisciplines?, competencies, credentials, employmentType, hireDate?, status, orgRole?, supervisorId?, cgssId?, serviceAreas?, maxHoursPerWeek?, createdAt, updatedAt }
CareAssignment interface: { id, clinicianId, clientId, discipline, assignmentRole, startDate, endDate?, status, assignedBy, approvedBy?, approvedAt?, lastSupervisoryVisit?, createdAt }
CREATE TYPES (src/policy/client/types.ts):
Client interface: { id, firstName, lastName, preferredName?, serviceSetting, serviceEntity, careTier, status, accmOwnerId, ccmId?, serviceZip?, serviceCity?, facilityId?, facilityName?, admissionDate?, dischargeDate?, primaryDiagnosisCategory?, requiredDisciplines, requiredCompetencies?, createdAt, updatedAt }
ShiftNeed interface: { id, clientId, requiredDiscipline, requiredCompetencies?, isHardRequirement, frequency?, preferredDays?, durationHours?, startDate, endDate?, status, assignedCareAssignmentId?, notes?, createdAt }
CREATE MOCK DATA (src/policy/clinician/data/mockClinicians.ts and src/policy/client/data/mockClients.ts):
10 clinicians: 2 RN, 2 LVN, 1 PT, 1 OT, 3 HHA/CNA, 1 Caregiver. Mix of active/pending/inactive. Mix of employmentTypes. Realistic Bay Area names.
6 clients: 2 L1, 2 L2, 1 L3, 1 L4. Mix of home/facility settings. Each has an accmOwnerId.
8 CareAssignments linking clinicians to clients.
6 ShiftNeeds (some filled, some open).
CREATE STORES:
src/policy/clinician/stores/clinicianStore.ts — Zustand store seeded from mock data. Actions: getClinicians, getClinicianById, filterByDiscipline, filterByStatus.
src/policy/client/stores/clientStore.ts — Zustand store seeded from mock data. Actions: getClients, getClientById, filterByTier, filterByAccm, filterBySetting.
CREATE PAGES (read-only):
src/policy/clinician/pages/ClinicianListPage.tsx — Table/card list with discipline and status filters. Shows: name, discipline, status, competency count, active assignments count.
src/policy/clinician/pages/ClinicianDetailPage.tsx — Full profile: personal info section, credentials section (with expiry status badges), competencies section, active assignments section (linked to clients).
src/policy/client/pages/ClientListPage.tsx — Table/card list with tier, setting, and ACCM filters. Shows: name, tier badge, setting, ACCM name, active assignments count.
src/policy/client/pages/ClientDetailPage.tsx — Full profile: info section, care needs section (required disciplines + competencies), shift needs section, active assignments section (linked to clinicians).
CREATE COMPONENTS:
src/policy/clinician/components/ClinicianCard.tsx
src/policy/clinician/components/CredentialBadge.tsx (shows green/yellow/red based on expiry)
src/policy/clinician/components/DisciplineBadge.tsx
src/policy/client/components/ClientCard.tsx
src/policy/client/components/TierBadge.tsx (L1=green, L2=blue, L3=orange, L4=red)
src/policy/client/components/ShiftNeedCard.tsx
REGISTER ROUTES in src/App.tsx:
/clinicians → ClinicianListPage
/clinicians/:clinicianId → ClinicianDetailPage
/clients → ClientListPage
/clients/:clientId → ClientDetailPage
All inside ProtectedRoute + CommandCenterLayout.
ADD SIDEBAR NAV entries in CommandCenterLayout for "Clinicians" and "Clients" (use Lucide icons: Users for clinicians, Heart for clients).
CONSTRAINTS:

Do NOT build any write/edit functionality (no forms, no create, no update)
Do NOT build a matching engine
Do NOT add PHI fields (no DOB, no diagnosis text, no full address)
Do NOT integrate with AlayaCare or WellSky
Do NOT modify any existing CES, eCIgn, PM, or Journey files
Do NOT modify AuthProvider.tsx
Use existing UI primitives from src/policy/components/ui/ where possible
Use Tailwind for styling consistent with existing pages
Lazy-load all new pages with React.lazy()