# Forms — Overview

**Article:** 01-Overview  
**Page:** Forms (`/forms`)

---

## What This Page Does

The Forms page provides access to all official compliance forms used by Care Indeed. It serves as both a catalog for browsing and a workspace for completing and electronically signing forms.

---

## Why It Exists

Home health agencies must maintain completed, signed documentation for dozens of compliance activities — from patient consent forms to employee acknowledgments to supervisory visit records. The Forms page provides a centralized, auditable system for this.

---

## Where It Fits in the System

```
Workflow Step (requires a form)
        ↓
Forms Catalog (browse or direct link)
        ↓
Form Signing Workspace (eCIgn)
        ↓
Signed Instance (immutable, hash-chained)
        ↓
Evidence (signed form as evidence for event)
        ↓
Audit Record
```

---

## Form Identification

Forms use the format `{DOMAIN}-FM-{SEQ}`:
- `EN-FM-002` — Environment domain, Form #2
- `HR-FM-001` — Human Resources domain, Form #1

Each form has a `form_id` and a `instance_id` for each specific completion of that form.

---

## Multi-Party Forms

Some forms require signatures from multiple parties in a specific order. The system enforces:
1. **Stage order** — Signer 1 must sign before Signer 2 is notified
2. **Role enforcement** — Only users with the required role can sign each stage
3. **Immutability** — Once signed, content cannot be altered
