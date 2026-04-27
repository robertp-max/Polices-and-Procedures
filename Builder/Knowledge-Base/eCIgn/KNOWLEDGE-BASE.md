# Knowledge Base — eCIgn

Ten short articles answering the most common questions about the eCIgn-centered submission flow.

---

## 1. What is eCIgn?
eCIgn is the official evidence-capture, signature, submission, validation, and storage workflow for **all** form-based compliance submissions. Every required form goes through the eCIgn workspace where it is disclosed, verified, reviewed, attested, signed, and locked. After lock, the system generates immutable evidence written to S3 + DynamoDB and chained into the audit log.

## 2. How to complete an assigned form task
1. Open **My Tasks** and click the task you want to work on.
2. In the Right Panel, click **Open form workspace**.
3. Walk through the disclosure → verification → review → attestation steps.
4. Submit for signature when all sections are complete.

## 3. How to sign a form
1. Open the task with status **Awaiting signature**.
2. Click **Open form workspace** → **Sign**.
3. Complete MFA. Each required signer must sign individually.
4. The packet locks once all signers complete; you cannot edit a locked packet.

## 4. How to return a form for correction
- An approver can choose **Return for correction** with a written reason.
- The original Coordinator gets the task back in My Tasks with status **Returned for correction**.
- After correcting, resubmit through the eCIgn workspace.

## 5. How to approve a form
- Open the locked packet from My Tasks and click **Approve** with an optional comment.
- Approved packets advance to **Completed** and the linked task is marked Done in all PM views.

## 6. How to find evidence after submission
- Open the completed task; the Right Panel **Evidence** section lists the evidence ID and storage location.
- For an event-wide view, open the **Evidence Center** page.
- Auditors can verify the SHA-256 hash on the audit timeline.

## 7. Why a task is not marked complete
A task is only complete when **all** of these are true:
- eCIgn packet is locked (`signed_locked`).
- If approval is required, an approver decided **Approved**.
- Evidence has been written and validated.
If any step is missing, the task stays in **In progress / Awaiting signature / Awaiting approval**.

## 8. Why weekend scheduling requires an override
The compliance team policy is that work cannot be due on Saturday or Sunday by default. If an event truly requires weekend work (e.g. CMS holiday backlog), a manager must explicitly check **Weekend override** and supply a reason. The override + reason are recorded in the PM audit log.

## 9. How eCIgn supports audit readiness
- Every state change is recorded in a hash-chained audit log.
- Evidence is content-addressed by SHA-256 and immutable in S3.
- The mapping from internal state → UX status → CES status → PM status is **single-sourced** so what an auditor sees in any panel is identical.
- The PM overlay (assignments, sprint pins, due dates) is recorded separately so PM activity never alters compliance evidence.

## 10. How managers track pending eCIgn tasks
- The **CES Board** and **My Tasks** show every task assigned to your reports.
- Status chips show what stage each task is in.
- Drag & drop in Kanban / Sprint moves PM metadata only — it cannot mark a compliance task done.
- Use the **Audit Readiness** page to surface tasks with packets in **Returned for correction** or **Rejected**.
