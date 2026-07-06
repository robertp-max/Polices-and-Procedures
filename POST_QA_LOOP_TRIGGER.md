# POST_QA_LOOP_TRIGGER.md

**Trigger condition:** After every QA run (manual or automated), immediately invoke the following prompt with all latest outputs attached (QA report, defect ledger, logs, console, screenshots descriptions, build/lint/test logs, module reports).

---

[PASTE THE ENTIRE "LOOP INSTRUCTION" + "REQUIRED VALIDATION EACH LOOP" + "RUNTIME QA EACH LOOP" + "AUTOMATIC FIX PRIORITY" + "REQUIRED EVIDENCE CONTRACT" + "SEARCHES EACH LOOP" + "QA OUTPUT RULE" + "FILES TO MAINTAIN" sections from the original user query here when triggering]

**Setup note:** This file serves as the prompt trigger definition. After QA, copy relevant outputs into the context and start the loop with "Review the latest QA output..." 

Current setup date: 2026-07-01
Baseline git captured in loop-baseline.txt

Do not proceed to fixes or reviews until a QA run has produced output and this trigger is explicitly activated.
