"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Lock } from "lucide-react";
import { usePreview } from "../../../_components/PreviewContext";
import { CareIndeedBrand } from "../../../_components/CareIndeedBrand";
import {
  CL_WF_26_DEFINITION as DEF,
  completionPreview,
  validateStage,
  type WorkflowFieldValue,
  type WorkflowStageStatus,
} from "../../../_data/workflowTraining";

type ValueMap = Record<string, WorkflowFieldValue | undefined>;

export function ClWf26Player() {
  const { withPersona, announce } = usePreview();
  const [active, setActive] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [values, setValues] = useState<Record<string, ValueMap>>({});

  const stage = DEF.stages[active];
  const stageValues = values[stage.id] ?? {};

  // Per-stage validation + overall completion (progress is real VALID count, not index).
  const statuses = useMemo(() => {
    const out: Record<string, WorkflowStageStatus> = {};
    for (const s of DEF.stages) out[s.id] = validateStage(s, values[s.id] ?? {}).status;
    return out;
  }, [values]);
  const completion = useMemo(() => completionPreview(DEF, statuses), [statuses]);
  const currentValidation = validateStage(stage, stageValues);
  const currentValid = currentValidation.status === "VALID";

  // Furthest stage reachable when NOT in review mode: first incomplete stage.
  const firstIncomplete = DEF.stages.findIndex((s) => statuses[s.id] !== "VALID");
  const maxReachable = firstIncomplete === -1 ? DEF.stages.length - 1 : firstIncomplete;

  function setField(fieldId: string, value: WorkflowFieldValue) {
    setValues((prev) => ({ ...prev, [stage.id]: { ...(prev[stage.id] ?? {}), [fieldId]: value } }));
  }
  function toggleMulti(fieldId: string, option: string) {
    const cur = (stageValues[fieldId] as string[] | undefined) ?? [];
    setField(fieldId, cur.includes(option) ? cur.filter((v) => v !== option) : [...cur, option]);
  }

  const canAdvance = reviewMode || currentValid;

  return (
    <main className="workflow-player">
      <header className="workflow-player-topbar">
        <Link href={withPersona("/journey/training")}>
          <ArrowLeft aria-hidden="true" />
          Back to Training
        </Link>
        <div>
          <CareIndeedBrand decorative compact />
          <span>{DEF.id} · Training simulation</span>
        </div>
        <Link href={withPersona("/journey/my-journey")} className="workflow-topbar-alt">
          Back to My Journey
        </Link>
      </header>

      <section className="workflow-player-hero" aria-labelledby="cl-wf-26-title">
        <div>
          <p className="eyebrow">MONTHLY WORKFLOW TRAINING · {DEF.id}</p>
          <h1 id="cl-wf-26-title">{DEF.title}</h1>
          <p>{DEF.teaches} Training-only preview — no official record is changed.</p>
          <label className="workflow-review-toggle">
            <input type="checkbox" checked={reviewMode} onChange={(e) => setReviewMode(e.target.checked)} />
            Review mode (browse stages without completing gates)
          </label>
        </div>
        <div className="workflow-player-progress" aria-label={`${completion.percent}% complete`}>
          <strong>{completion.percent}%</strong>
          <span>{completion.validStages} of {completion.totalStages} stages complete</span>
        </div>
      </section>

      <section className="workflow-player-grid">
        <nav className="workflow-stage-rail" aria-label={`${DEF.id} stages`}>
          {DEF.stages.map((item, index) => {
            const st = statuses[item.id];
            const locked = !reviewMode && index > maxReachable;
            return (
              <button
                type="button"
                key={item.id}
                className={`${index === active ? "is-active" : ""} ${st === "VALID" ? "is-valid" : ""}`}
                onClick={() => !locked && setActive(index)}
                disabled={locked}
                aria-current={index === active ? "step" : undefined}
              >
                {st === "VALID" ? <CheckCircle2 aria-hidden="true" /> : locked ? <Lock aria-hidden="true" /> : <Circle aria-hidden="true" />}
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.label}</strong>
              </button>
            );
          })}
        </nav>

        <article className="workflow-stage-panel">
          <div className="workflow-stage-kicker">
            Stage {String(active + 1).padStart(2, "0")} ·{" "}
            <span className={`workflow-stage-status status-${statuses[stage.id].toLowerCase()}`}>
              {statuses[stage.id].replace(/_/g, " ")}
            </span>
          </div>
          <h2>{stage.title}</h2>
          <p>{stage.task}</p>

          <form className="workflow-stage-form" onSubmit={(e) => e.preventDefault()}>
            {stage.fields.map((f) => {
              const v = stageValues[f.id];
              return (
                <div className="workflow-field" key={f.id}>
                  <label className="workflow-field-label" htmlFor={`${stage.id}-${f.id}`}>
                    {f.label}
                    {f.required ? <span aria-hidden="true"> *</span> : null}
                  </label>
                  {f.help ? <p className="workflow-field-help">{f.help}</p> : null}

                  {f.kind === "text" ? (
                    <textarea
                      id={`${stage.id}-${f.id}`}
                      value={(v as string) ?? ""}
                      onChange={(e) => setField(f.id, e.target.value)}
                      rows={2}
                    />
                  ) : f.kind === "date" ? (
                    <input
                      id={`${stage.id}-${f.id}`}
                      type="date"
                      value={(v as string) ?? ""}
                      onChange={(e) => setField(f.id, e.target.value)}
                    />
                  ) : f.kind === "select" ? (
                    <select id={`${stage.id}-${f.id}`} value={(v as string) ?? ""} onChange={(e) => setField(f.id, e.target.value)}>
                      <option value="">Choose…</option>
                      {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : f.kind === "checkbox" ? (
                    <label className="workflow-checkbox">
                      <input
                        id={`${stage.id}-${f.id}`}
                        type="checkbox"
                        checked={v === true}
                        onChange={(e) => setField(f.id, e.target.checked)}
                      />
                      <span>Confirm</span>
                    </label>
                  ) : f.kind === "radiogroup" ? (
                    <div className="workflow-radiogroup" role="radiogroup" aria-label={f.label}>
                      {f.options!.map((o) => (
                        <label key={o.value} className={(v as string) === o.value ? "is-selected" : ""}>
                          <input type="radio" name={`${stage.id}-${f.id}`} checked={(v as string) === o.value} onChange={() => setField(f.id, o.value)} />
                          {o.label}
                        </label>
                      ))}
                    </div>
                  ) : (
                    /* multiselect */
                    <div className="workflow-multiselect">
                      {f.options!.map((o) => {
                        const arr = (v as string[] | undefined) ?? [];
                        return (
                          <label key={o.value} className={arr.includes(o.value) ? "is-selected" : ""}>
                            <input type="checkbox" checked={arr.includes(o.value)} onChange={() => toggleMulti(f.id, o.value)} />
                            {o.label}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </form>

          <div className={`workflow-gate ${currentValid ? "is-open" : "is-blocked"}`}>
            {currentValid ? <CheckCircle2 aria-hidden="true" /> : <Lock aria-hidden="true" />}
            <span>
              {currentValid ? "Gate met — you can continue." : `Gate: ${stage.gate}`}
            </span>
          </div>
          <small className="workflow-fixture">Fixture: {DEF.fixture}</small>

          <footer>
            <button className="button button-secondary" type="button" disabled={active === 0} onClick={() => setActive((x) => Math.max(0, x - 1))}>
              Previous stage
            </button>
            {active < DEF.stages.length - 1 ? (
              <button
                className="button button-primary"
                type="button"
                disabled={!canAdvance}
                onClick={() => setActive((x) => x + 1)}
                title={canAdvance ? undefined : "Complete this stage's required inputs to continue"}
              >
                Continue training
                <ArrowRight aria-hidden="true" />
              </button>
            ) : (
              <button
                className="button button-primary"
                type="button"
                disabled={!completion.allValid}
                onClick={() => announce("CL-WF-26 simulation complete in preview mode. No official completion was recorded.")}
                title={completion.allValid ? undefined : "All six stages must be completed first"}
              >
                Finish simulation
                <ArrowRight aria-hidden="true" />
              </button>
            )}
          </footer>
        </article>
      </section>
    </main>
  );
}
