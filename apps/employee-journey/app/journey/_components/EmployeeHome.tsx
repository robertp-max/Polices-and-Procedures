"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  FileCheck2,
  GraduationCap,
  Headphones,
  Map,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import {
  getCompetencies,
  getDocuments,
  getFocusItems,
  getJourneyPhases,
  getTrainingAssignments,
} from "../_data/fixtures";
import { usePreview } from "./PreviewContext";
import { StatusBadge, SummaryCard } from "./shared";

const focusLabels = {
  blocker: "CLEARANCE BLOCKER",
  overdue: "OVERDUE",
  "due-soon": "DUE SOON",
  waiting: "WAITING",
  continue: "CONTINUE",
} as const;

export function EmployeeHome() {
  const { persona, withPersona, announce } = usePreview();
  const focusItems = getFocusItems(persona);
  const journey = getJourneyPhases(persona);
  const currentPhase = journey[persona.stageIndex] ?? journey[4];
  const training = getTrainingAssignments(persona);
  const documents = getDocuments(persona);
  const competencies = getCompetencies(persona);
  const documentAttentionCount = documents.filter(
    (item) => item.verificationStatus === "Action needed" || item.verificationStatus === "Expiring",
  ).length;
  const phaseCount = journey.length;
  const velocityPct =
    phaseCount > 1 ? Math.round((persona.stageIndex / (phaseCount - 1)) * 100) : 0;

  return (
    <div className="workspace home-workspace">
      <section className="employee-stage-hero" aria-labelledby="home-title">
        <div>
          <p className="eyebrow">EMPLOYEE JOURNEY</p>
          <h1 id="home-title">{persona.name}</h1>
          <p>{persona.role} · {persona.descriptor}</p>
        </div>
        <div className="current-stage">
          <span>Current stage</span>
          <strong>{persona.stage}</strong>
          <small>{currentPhase.date}</small>
        </div>
      </section>

      <section className="home-dashboard" aria-label="Journey roadmap and velocity">
        <article className="home-roadmap">
          <header>
            <h2>Journey Roadmap</h2>
            <span>Phase {persona.stageIndex + 1} of {phaseCount}</span>
          </header>
          <ol className="roadmap-steps">
            {journey.map((phase, i) => {
              const state = i < persona.stageIndex ? "is-done" : i === persona.stageIndex ? "is-active" : "is-future";
              return (
                <li key={phase.id} className={`roadmap-step ${state}`}>
                  <span className="roadmap-dot">{i < persona.stageIndex ? "✓" : i + 1}</span>
                  <span className="roadmap-label">{phase.label}</span>
                </li>
              );
            })}
          </ol>
        </article>
        <article className="home-velocity">
          <h2>Onboarding Velocity</h2>
          <div
            className="velocity-ring"
            style={{ ["--pct" as string]: String(velocityPct) }}
            role="img"
            aria-label={`Onboarding progress ${velocityPct} percent`}
          >
            <strong>{velocityPct}%</strong>
          </div>
          <span className="velocity-caption">Onboarding progress</span>
        </article>
      </section>

      <section className="continue-card" aria-labelledby="continue-title">
        <picture>
          <source srcSet="/assets/gao001-home-visit.avif" type="image/avif" />
          <source srcSet="/assets/gao001-home-visit.webp" type="image/webp" />
          <img
            src="/assets/gao001-home-visit.png"
            alt="Care Indeed clinician speaking with a patient during a home visit"
          />
        </picture>
        <div>
          <p className="eyebrow">CONTINUE WHERE YOU LEFT OFF</p>
          <h2 id="continue-title">GAO-001 · A New Journey</h2>
          <p>Your preview position is preserved in this session.</p>
          <div className="continue-meta">
            <span>Approved preview content</span>
            <span>About 24 minutes remaining</span>
          </div>
        </div>
        <Link className="button button-primary" href={withPersona("/journey/training/gao-001")}>
          <Play aria-hidden="true" />
          Continue preview
        </Link>
      </section>

      <section className="home-section today-focus" aria-labelledby="focus-title">
        <header className="section-heading">
          <div>
            <p className="eyebrow">TODAY&apos;S FOCUS</p>
            <h2 id="focus-title">The next four things that need attention</h2>
          </div>
          <span>Priority ordered</span>
        </header>
        <div className="focus-list">
          {focusItems.map((item) => (
            <Link key={item.id} href={withPersona(item.href)} className={`focus-item focus-${item.type}`}>
              <span className="focus-priority">{focusLabels[item.type]}</span>
              <div>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
              <ArrowRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section stage-status" aria-labelledby="stage-title">
        <header className="section-heading">
          <div>
            <p className="eyebrow">STAGE STATUS</p>
            <h2 id="stage-title">{currentPhase.label}</h2>
          </div>
          <StatusBadge status={currentPhase.status} />
        </header>
        <div className="stage-status-grid">
          <div>
            <Map aria-hidden="true" />
            <span>Employee action</span>
            <strong>{currentPhase.employeeActions}</strong>
          </div>
          <div>
            <CalendarClock aria-hidden="true" />
            <span>Waiting on another person</span>
            <strong>{currentPhase.waitingOnSupervisor}</strong>
          </div>
          <div>
            <Target aria-hidden="true" />
            <span>Next milestone</span>
            <strong>{currentPhase.nextMilestone}</strong>
          </div>
        </div>
        <Link className="text-link" href={withPersona("/journey/my-journey")}>
          View the full lifecycle <ArrowRight aria-hidden="true" />
        </Link>
      </section>

      <section className="home-section" aria-labelledby="training-summary-title">
        <header className="section-heading">
          <div>
            <p className="eyebrow">TRAINING SUMMARY</p>
            <h2 id="training-summary-title">Assigned learning</h2>
          </div>
          <Link href={withPersona("/journey/training")}>View training</Link>
        </header>
        <div className="summary-grid">
          <SummaryCard
            label="Required now"
            value={String(training.filter((item) => item.status === "Required now").length)}
            detail="Available employee actions"
          />
          <SummaryCard
            label="In progress"
            value={String(training.filter((item) => item.status === "In progress").length)}
            detail="Preview position preserved"
          />
          <SummaryCard
            label="Unavailable"
            value={String(training.filter((item) => !item.available).length)}
            detail="No employee action required"
          />
        </div>
      </section>

      <section className="home-section split-summary" aria-labelledby="policy-summary-title">
        <div>
          <BookOpenCheck aria-hidden="true" />
          <p className="eyebrow">POLICY SUMMARY</p>
          <h2 id="policy-summary-title">Two learner actions due</h2>
          <p>Assignments are presented one policy at a time with version, change context, and required action.</p>
          <Link className="text-link" href={withPersona("/journey/policies")}>Review policy actions</Link>
        </div>
        <div className="summary-side-note">
          <strong>CL-PR-001</strong>
          <span>Patient Rights & Responsibilities</span>
          <StatusBadge status="Due soon" />
        </div>
      </section>

      <section className="home-section split-summary" aria-labelledby="document-summary-title">
        <div>
          <FileCheck2 aria-hidden="true" />
          <p className="eyebrow">DOCUMENT SUMMARY</p>
          <h2 id="document-summary-title">
            {documentAttentionCount} {documentAttentionCount === 1 ? "item needs" : "items need"} attention
          </h2>
          <p>Verification status is synthetic preview data.</p>
          <Link className="text-link" href={withPersona("/journey/documents")}>Open documents</Link>
        </div>
        <div className="summary-side-note">
          <strong>Next role document</strong>
          <span>{persona.nextDocumentDate}</span>
          <StatusBadge status={persona.id === "skyler-driver" ? "Expiring" : "Current"} />
        </div>
      </section>

      <section className="home-section split-summary" aria-labelledby="competency-summary-title">
        <div>
          <ShieldCheck aria-hidden="true" />
          <p className="eyebrow">COMPETENCY / VISIT SUMMARY</p>
          <h2 id="competency-summary-title">{competencies[0]?.requirement ?? "No role-specific visit assigned"}</h2>
          <p>{competencies[0]?.cadence ?? "No employee action required."}</p>
          <Link className="text-link" href={withPersona("/journey/competencies")}>View competencies</Link>
        </div>
        <div className="summary-side-note">
          <strong>Evaluator</strong>
          <span>{competencies[0]?.evaluator ?? "Not assigned in preview"}</span>
          <StatusBadge status={competencies[0]?.status ?? "No action required"} />
        </div>
      </section>

      <section className="home-section split-summary" aria-labelledby="performance-summary-title">
        <div>
          <Target aria-hidden="true" />
          <p className="eyebrow">PERFORMANCE MILESTONE</p>
          <h2 id="performance-summary-title">
            {persona.stage.includes("Day") ? persona.stage : "Next evaluation milestone"}
          </h2>
          <p>Scores and reviewer decisions are read-only in employee view.</p>
          <Link className="text-link" href={withPersona("/journey/performance")}>Open performance</Link>
        </div>
        <div className="summary-side-note">
          <strong>Employee action</strong>
          <span>Review and add discussion topics</span>
          <StatusBadge status="Upcoming" />
        </div>
      </section>

      <section className="home-section annual-summary" aria-labelledby="annual-summary-title">
        <div>
          <GraduationCap aria-hidden="true" />
          <div>
            <p className="eyebrow">ANNUAL SUMMARY</p>
            <h2 id="annual-summary-title">Agency annual plan</h2>
            <p>Only assigned annual requirements appear here. The UI does not claim a universal twelve-module plan for every clinician.</p>
          </div>
        </div>
        <StatusBadge status="Upcoming" />
      </section>

      <section className="home-section support-summary" aria-labelledby="support-summary-title">
        <div className="support-icon"><Sparkles aria-hidden="true" /></div>
        <div>
          <p className="eyebrow">SUPPORT / NOLAN</p>
          <h2 id="support-summary-title">Need help understanding your next step?</h2>
          <p>Nolan can explain this synthetic journey and route you to support options. It cannot open an official request in this preview.</p>
        </div>
        <button
          className="button button-secondary"
          type="button"
          onClick={() => announce("Support preview opened. No support request was sent.")}
        >
          <Headphones aria-hidden="true" />
          Open help preview
        </button>
      </section>
    </div>
  );
}
