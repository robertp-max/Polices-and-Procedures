# KB-003 — Why Can't I Mark My Unit Complete?

**Audience:** Anyone hitting the "Cannot advance" banner. **Time to read:** 2 minutes.

The most common reasons, in order:

## 1. A required form is missing or unsaved

The drawer's **Evidence Status** panel shows
`Forms complete: X / Y` and lists the missing form IDs.

**Fix:** Click each missing form, fill it, save it.

## 2. A required signature is not yet captured

If the unit is in the **Signature** phase, all required signers must have
signed in eCIgn before you can advance.

**Fix:** See [KB-006 — Send for Signature](KB-006-Send-For-Signature.md).
If you already routed it, check the signers' status in the drawer.

## 3. An upstream dependency is not complete

Your unit cannot advance if a dependency event in
`event.dependencies.dependsOn` is still open.

**Fix:** Click the dependency in the drawer's **Dependencies** tab. Open
that event and either complete it or escalate to its owner.

## 4. Phase out of order

You tried to drag the card past a phase that has not been completed.

**Fix:** Complete each phase in order:
preparation → documentation → review → signature → audit.

## 5. Evidence not tagged

A file was uploaded but is missing one of `event_id`, `workflow_id`, or
`policy_id`.

**Fix:** Go to **Evidence Center**, find the file, and add the missing
tag(s). Re-uploading from the Sprint Board card is the easiest path —
those uploads are auto-tagged.

## Still stuck?

- Open **Audit Mode** → **Missing Items** tab for this event — it lists
  every blocker in plain language.
- Contact your Compliance Officer.
