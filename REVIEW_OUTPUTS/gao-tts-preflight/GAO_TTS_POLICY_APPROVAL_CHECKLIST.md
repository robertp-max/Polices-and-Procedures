# GAO TTS Policy Approval Checklist

## Current gate

- Transcript source freeze: COMPLETE for 120 runtime delivery-card transcripts
- Audio generation: HOLD
- Voice ID and model: PENDING OWNER SELECTION
- Policy approval: PENDING
- GAO-001 regeneration: OUT OF SCOPE
- Static node narration generation: OUT OF SCOPE

The canonical source artifact is:

`src/policy/journey/data/gaoTtsSourceManifest.generated.json`

Every record contains the exact runtime `transcript_text`, a SHA-256 hash, word count,
expected duration, output path, approval state, and the QA-audited source commit.
Run `npm run gao:tts:verify` before approving or generating audio. Any source drift
must regenerate the manifest and restart approval for the affected records.

## Required approvals

| Scope | Required owner | Status | Approver | Approval date | Notes |
| --- | --- | --- | --- | --- | --- |
| GAO-002 through GAO-005 | Training content owner | PENDING |  |  | Confirm organization and compliance wording. |
| GAO-006 through GAO-010 | Clinical and compliance policy owner | PENDING |  |  | Confirm abuse reporting, infection control, emergency, ergonomics, and vital-sign rules. |
| GAO-011 through GAO-018 | Training and applicable clinical/HR owner | PENDING |  |  | Confirm communication, documentation, safety, and injury-reporting language. |
| GAO-019 through GAO-022 | HR and employee-relations policy owner | PENDING |  |  | Confirm harassment, drug-free workplace, discipline, and grievance rules. |
| GAO-023 through GAO-025 | Privacy, security, and documentation policy owner | PENDING |  |  | Confirm privacy, cybersecurity, and legal-documentation language. |
| GAO-026 through GAO-027 | HR, payroll, and benefits policy owner | PENDING |  |  | Confirm timekeeping, leave, enrollment windows, benefits, and retirement terms. |

## Pronunciation requirement

For `GAO-004.lesson.l2.delivery`, pronounce "Corporate Compliance Program."
The source image contains the baked typo `CORDORATE`; the audio must not repeat it.

## Release procedure

1. Review the manifest transcript text, not raw `gao-content.md`.
2. Record approver name, date, and notes above.
3. Select the production voice ID and model in `config/gao-tts-source-freeze.json`.
4. Change approval and generation states only after every required owner signs off.
5. Run `npm run gao:tts:freeze`, then `npm run gao:tts:verify`.
6. Generate only the 120 listed main lesson MP3 files.
7. Verify every generated file against its manifest record before registering audio.
