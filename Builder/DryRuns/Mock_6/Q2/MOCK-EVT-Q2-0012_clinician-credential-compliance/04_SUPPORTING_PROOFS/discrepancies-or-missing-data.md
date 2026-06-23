# Discrepancies and Missing Data Report
Detailed explanation of seeded inaccuracies caught by the audit workflow:

### Defect #1: FND-M6-MOCK-EVT-Q2-0012-001
- **Type**: CPR Card Expiration
- **Observed**: CLIN-0002: Expired CPR (11/2025) — actively providing care to multiple clients
- **Expected**: All forms, credentials, and records must be signed, current, and consistent.
- **Impact**: High audit risk; potentially blocks billing or licensure.

### Defect #2: FND-M6-MOCK-EVT-Q2-0012-002
- **Type**: CPR Card Expiration
- **Observed**: CLIN-0005: Annual competency expired (08/2025) — 10 months overdue
- **Expected**: All forms, credentials, and records must be signed, current, and consistent.
- **Impact**: High audit risk; potentially blocks billing or licensure.

### Defect #3: FND-M6-MOCK-EVT-Q2-0012-003
- **Type**: CPR Card Expiration
- **Observed**: CLIN-0014: LVN license pending renewal since 04/2026 — actively providing visits (PT-0017)
- **Expected**: All forms, credentials, and records must be signed, current, and consistent.
- **Impact**: High audit risk; potentially blocks billing or licensure.

### Defect #4: FND-M6-MOCK-EVT-Q2-0012-004
- **Type**: CPR Card Expiration
- **Observed**: CLIN-0015: Expired CPR (12/2025)
- **Expected**: All forms, credentials, and records must be signed, current, and consistent.
- **Impact**: High audit risk; potentially blocks billing or licensure.

### Defect #5: FND-M6-MOCK-EVT-Q2-0012-005
- **Type**: CPR Card Expiration
- **Observed**: CLIN-0020: QAPI Coordinator assigned to direct care visits (PT-0054) — role mismatch
- **Expected**: All forms, credentials, and records must be signed, current, and consistent.
- **Impact**: High audit risk; potentially blocks billing or licensure.

