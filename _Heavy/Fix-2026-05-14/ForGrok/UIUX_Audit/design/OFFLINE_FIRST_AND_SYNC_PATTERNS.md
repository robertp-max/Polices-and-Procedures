# Offline-First & Data Sync Patterns — CareIndeed Home Health (v2)

**Version:** 1.0  
**Date:** May 2026

---

## 1. Purpose

Field clinicians and surveyors often work in areas with poor or no internet. This document defines how the v2 experience should gracefully handle offline scenarios while maintaining trust and data integrity.

---

## 2. Core Principles

- **Never lose user work** — Evidence capture, signatures, form progress, and notes must be preserved locally.
- **Clear communication** — The user must always know when they are offline and what will happen when they reconnect.
- **Prioritize critical actions** — Signing and evidence capture should work offline when possible.
- **Calm UX** — Offline states should feel intentional and controlled, not broken.

---

## 3. Recommended Patterns

### 3.1 Local-First Data Storage
- Use IndexedDB or a lightweight local database (e.g., WatermelonDB, Realm, or SQLite via Expo SQLite).
- Store drafts of:
  - eCign form progress
  - Evidence metadata + photo references
  - Task notes and status changes
  - Onboarding V2 gate responses

### 3.2 Optimistic Updates
- Allow users to mark tasks complete, capture evidence, or fill forms while offline.
- Show clear “Pending Sync” status.
- Queue actions and sync when connectivity returns.

### 3.3 Evidence Capture Offline
- Allow photo capture even when offline.
- Store photos locally with metadata.
- Upload automatically when back online (with progress indicator).
- Show “Evidence will sync when connected” message.

### 3.4 Signature Flow Offline
- Allow signature capture offline.
- Store the signature image + form state locally.
- Prevent final “Sign & Lock” until the packet can be verified and hashed on the server (or handle it carefully with local hashing + server reconciliation).

---

## 4. UI Patterns

- Persistent offline banner or indicator at the top of the screen (subtle, not alarming).
- “Sync” status in task cards and evidence items.
- Clear “You are offline. Changes will sync when connected.” messaging.
- Retry mechanism for failed syncs.

---

## 5. Conflict Resolution

- Last-write-wins with timestamp for most data.
- For critical items (signed documents), require server confirmation before marking as fully signed.
- Show clear conflict resolution UI when needed.

---

## 6. Testing Requirements

- Test core flows completely offline.
- Test going offline mid-flow (e.g., during evidence upload).
- Test long offline periods (days) and successful sync afterward.

---

*Offline support is not a nice-to-have — it is a core operational requirement for home health work.*

---

**Related Documents:**
- `EVIDENCE_CAPTURE_SPECIFICATION.md`
- `SIGNATURE_CAPTURE_BEST_PRACTICES.md`
- `PERFORMANCE_AND_LOADING_STRATEGY.md`