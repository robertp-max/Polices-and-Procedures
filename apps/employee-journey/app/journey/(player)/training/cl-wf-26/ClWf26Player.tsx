"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  ListChecks,
  ShieldCheck,
  Signature,
} from "lucide-react";
import { usePreview } from "../../../_components/PreviewContext";

const stages = [
  {
    id: "sample",
    label: "Sample",
    title: "Select the monthly Plan of Care audit sample",
    icon: ListChecks,
    task: "Review the no-PHI episode fixture and choose a defensible active-episode sample.",
    learnerWork: ["Confirm audit month", "Apply active-episode rule", "Document sample rationale"],
    validation: "Sample rationale is complete before scoring opens.",
  },
  {
    id: "score",
    label: "Score",
    title: "Score required Plan of Care audit points",
    icon: ClipboardCheck,
    task: "Mark the simulated charts against required Plan of Care review points.",
    learnerWork: ["Plan of Care present", "Frequency aligns to order", "Visit notes support ordered care"],
    validation: "Every sampled chart receives a scored result and note.",
  },
  {
    id: "verify",
    label: "Verify",
    title: "Verify evidence before findings are trusted",
    icon: FileSearch,
    task: "Separate confirmed findings from items that need follow-up evidence.",
    learnerWork: ["Check source evidence", "Flag missing support", "Avoid unsupported conclusions"],
    validation: "Only verified findings advance to analysis.",
  },
  {
    id: "analyze",
    label: "Analyze",
    title: "Identify trend, severity, and downstream QAPI impact",
    icon: BarChart3,
    task: "Read the simulated dashboard and decide whether the audit requires QAPI escalation.",
    learnerWork: ["Compare prior month", "Identify recurring gap", "Name QAPI feed condition"],
    validation: "Analysis names whether QA-WF-03 needs downstream feed.",
  },
  {
    id: "correct",
    label: "Correct",
    title: "Draft corrective action without changing production records",
    icon: ShieldCheck,
    task: "Select an owner, due date, and evidence requirement for the training-only corrective action.",
    learnerWork: ["Owner selected", "Due date selected", "Effectiveness check selected"],
    validation: "Corrective action draft is complete in training state only.",
  },
  {
    id: "sign-feed",
    label: "Sign & Feed",
    title: "Check signature readiness and QAPI feed",
    icon: Signature,
    task: "Confirm the packet can be reviewed, signed, and fed into the downstream quarterly QAPI workflow.",
    learnerWork: ["Packet ready", "Signer sequence ready", "QA-WF-03 feed marked as downstream only"],
    validation: "Learner understands this preview records no official completion.",
  },
];

export function ClWf26Player() {
  const { withPersona, announce } = usePreview();
  const [active, setActive] = useState(0);
  const stage = stages[active];
  const Icon = stage.icon;
  const completeCount = active + 1;
  const percent = useMemo(() => Math.round((completeCount / stages.length) * 100), [completeCount]);

  return (
    <main className="workflow-player">
      <header className="workflow-player-topbar">
        <Link href={withPersona("/journey/training")}>
          <ArrowLeft aria-hidden="true" />
          Back to Training
        </Link>
        <div>
          <img src="/assets/logo-careindeed-orange.png" alt="Care Indeed" />
          <span>CL-WF-26 · Training simulation</span>
        </div>
        <p>Training-only preview · no official record is changed</p>
      </header>

      <section className="workflow-player-hero" aria-labelledby="cl-wf-26-title">
        <div>
          <p className="eyebrow">MONTHLY WORKFLOW TRAINING</p>
          <h1 id="cl-wf-26-title">Plan of Care Audit Simulation</h1>
          <p>
            Practice the complete CL-WF-26 workflow as one simulation: select the sample,
            score charts, verify evidence, analyze findings, draft corrective action, and
            prepare the downstream QAPI feed.
          </p>
        </div>
        <div className="workflow-player-progress" aria-label={`${percent}% complete`}>
          <strong>{percent}%</strong>
          <span>{completeCount} of {stages.length} stages opened</span>
        </div>
      </section>

      <section className="workflow-player-grid">
        <nav className="workflow-stage-rail" aria-label="CL-WF-26 stages">
          {stages.map((item, index) => {
            const StageIcon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                className={index === active ? "is-active" : ""}
                onClick={() => setActive(index)}
              >
                <StageIcon aria-hidden="true" />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.label}</strong>
              </button>
            );
          })}
        </nav>

        <article className="workflow-stage-panel">
          <div className="workflow-stage-kicker">
            <Icon aria-hidden="true" />
            Stage {String(active + 1).padStart(2, "0")}
          </div>
          <h2>{stage.title}</h2>
          <p>{stage.task}</p>

          <div className="workflow-stage-workbench">
            <section>
              <h3>Learner work</h3>
              <ul>
                {stage.learnerWork.map((item) => (
                  <li key={item}>
                    <CheckCircle2 aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Validation gate</h3>
              <p>{stage.validation}</p>
              <small>Fixture: TRAIN-CL-WF-26-2026-05 · no PHI · no production mutation</small>
            </section>
          </div>

          <footer>
            <button
              className="button button-secondary"
              type="button"
              disabled={active === 0}
              onClick={() => setActive((value) => Math.max(0, value - 1))}
            >
              Previous stage
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={() => {
                if (active < stages.length - 1) {
                  setActive((value) => value + 1);
                  return;
                }
                announce("CL-WF-26 practice complete in preview mode. No official completion was recorded.");
              }}
            >
              {active < stages.length - 1 ? "Continue training" : "Finish preview"}
              <ArrowRight aria-hidden="true" />
            </button>
          </footer>
        </article>
      </section>
    </main>
  );
}
