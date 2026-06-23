# Discrepancies and Missing Data Report
Detailed explanation of seeded inaccuracies caught by the audit workflow:

### Defect #1: FND-M6-MOCK-EVT-Q2-0002-001
- **Type**: Plan of Care / Signature Block
- **Observed**: PT-0002: POC MISSING PHYSICIAN SIGNATURE
- **Expected**: All forms, credentials, and records must be signed, current, and consistent.
- **Impact**: High audit risk; potentially blocks billing or licensure.

### Defect #2: FND-M6-MOCK-EVT-Q2-0002-002
- **Type**: Plan of Care / Signature Block
- **Observed**: PT-0023: POC not updated after status change to therapy re-eval pending
- **Expected**: All forms, credentials, and records must be signed, current, and consistent.
- **Impact**: High audit risk; potentially blocks billing or licensure.

### Defect #3: FND-M6-MOCK-EVT-Q2-0002-003
- **Type**: Plan of Care / Signature Block
- **Observed**: PT-0033: Duplicate/conflicting POC versions (v1.0 and v2.0 both active, different SN frequencies)
- **Expected**: All forms, credentials, and records must be signed, current, and consistent.
- **Impact**: High audit risk; potentially blocks billing or licensure.

### Defect #4: FND-M6-MOCK-EVT-Q2-0002-004
- **Type**: Plan of Care / Signature Block
- **Observed**: PT-0001: Clean POC
- **Expected**: All forms, credentials, and records must be signed, current, and consistent.
- **Impact**: High audit risk; potentially blocks billing or licensure.

