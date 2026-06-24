# Prototype Build 1 Standalone MVP Sandbox

This folder contains a standalone browser proof-of-concept for Prototype Build 1 certificate-gate behavior while Moodle access and tooling decisions remain unavailable.

This standalone sandbox proves logic and flow only; it does not prove Moodle configuration, Moodle compliance execution, active-time plugin behavior, audit export behavior, role permissions, or live certificate issuance.

## What This Sandbox Proves

- Required online CE gates can be evaluated deterministically.
- Incomplete required gates block certificate availability.
- Synthetic passing learners can reach `Certificate available - sandbox only`.
- Optional clinical support is separate, optional, non-credit, non-gating, and excluded from online CE certificate progress.
- QA negative scenarios can be reviewed before Moodle staging configuration begins.
- Audit packet needs can be visualized as a checklist without creating real evidence files.

## What This Sandbox Does Not Prove

- It does not configure Moodle.
- It does not validate Moodle plugins.
- It does not prove Moodle Restrict Access behavior.
- It does not create real learner records.
- It does not issue certificates.
- It does not validate active-time tooling.
- It does not export Moodle reports.
- It does not store PHI, credentials, screenshots, audit packets, backups, or private approvals.

## How It Maps To Moodle

The sandbox mirrors the intended Moodle shell: orientation page, online cap acknowledgement, required profile fields, required theory activity, required interaction, active-time/manual hold, final quiz, affidavit, admin hold, and certificate activity. The exact Moodle implementation remains blocked until staging access, certificate tooling, and active-time tooling decisions are provided outside Git.

## How To Open Locally

Open `standalone-mvp-sandbox/index.html` in a browser. If your browser blocks local JSON loading from `file://`, the app uses the same embedded synthetic fallback data from `app.js`.

## Why Moodle Access Is Still Required

Moodle access is still required to configure real course shells, activity completion, Restrict Access, profile fields, certificate activity behavior, reports, role permissions, test users, and export paths in a staging site.
