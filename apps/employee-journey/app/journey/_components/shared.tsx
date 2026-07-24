import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock3,
  Hourglass,
} from "lucide-react";
import type { JourneyPhase } from "../_data/fixtures";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replaceAll(" ", "-").replace("/", "-");
  const Icon =
    status.includes("Complete") || status === "Current"
      ? CheckCircle2
      : status.includes("Waiting") || status.includes("Under review")
        ? Hourglass
        : status.includes("Expiring") ||
            status.includes("Action") ||
            status.includes("Overdue") ||
            status.includes("Remediation")
          ? AlertTriangle
          : status.includes("Upcoming") ||
              status.includes("Due") ||
              status.includes("Scheduled") ||
              status.includes("In progress")
            ? Clock3
            : CircleDot;

  return (
    <span className={`status-badge status-${normalized}`}>
      <Icon aria-hidden="true" />
      {status}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </header>
  );
}

export function RequirementCard({
  id,
  title,
  status,
  fields,
  footer,
  className = "",
}: {
  id?: string;
  title: string;
  status: string;
  fields: { label: string; value: ReactNode }[];
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <article className={`requirement-card ${className}`}>
      <header>
        <div>
          {id ? <p className="canonical-id">{id}</p> : null}
          <h2>{title}</h2>
        </div>
        <StatusBadge status={status} />
      </header>
      <dl className="requirement-fields">
        {fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
      {footer ? <footer>{footer}</footer> : null}
    </article>
  );
}

export function MilestoneCard({
  phase,
  index,
}: {
  phase: JourneyPhase;
  index: number;
}) {
  return (
    <article
      className={`milestone-card ${phase.status === "Current" ? "is-current" : ""}`}
      aria-labelledby={`milestone-${phase.id}`}
    >
      <div className="milestone-marker" aria-hidden="true">
        <span>{index + 1}</span>
      </div>
      <div className="milestone-content">
        <header>
          <div>
            <p className="eyebrow">PHASE {String(index + 1).padStart(2, "0")}</p>
            <h2 id={`milestone-${phase.id}`}>{phase.label}</h2>
            <p>{phase.date}</p>
          </div>
          <StatusBadge status={phase.status} />
        </header>
        <div className="milestone-grid">
          <section>
            <h3>Employee actions</h3>
            <p>{phase.employeeActions}</p>
          </section>
          <section>
            <h3>Waiting on HR</h3>
            <p>{phase.waitingOnHr}</p>
          </section>
          <section>
            <h3>Waiting on supervisor</h3>
            <p>{phase.waitingOnSupervisor}</p>
          </section>
          <section>
            <h3>Training</h3>
            <p>{phase.training}</p>
          </section>
          <section>
            <h3>Policies</h3>
            <p>{phase.policies}</p>
          </section>
          <section>
            <h3>Documents</h3>
            <p>{phase.documents}</p>
          </section>
          <section>
            <h3>Competencies / visits</h3>
            <p>{phase.competencies}</p>
          </section>
          <section>
            <h3>Performance requirement</h3>
            <p>{phase.performance}</p>
          </section>
        </div>
        <footer>
          <span>
            <strong>Policy / workflow basis:</strong> {phase.basis}
          </span>
          <span>
            <strong>Next milestone:</strong> {phase.nextMilestone}
          </span>
        </footer>
      </div>
    </article>
  );
}

export function SummaryCard({
  label,
  value,
  detail,
  children,
}: {
  label: string;
  value: string;
  detail: string;
  children?: ReactNode;
}) {
  return (
    <article className="summary-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
      {children}
    </article>
  );
}

