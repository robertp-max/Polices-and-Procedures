"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, FlaskConical, Search, Workflow } from "lucide-react";
import {
  WORKFLOW_LIBRARY,
  WORKFLOW_LIBRARY_COUNT,
  FEATURED_WORKFLOW_SIMULATION,
} from "../_data/fixtures";
import {
  getPersonaWorkflowReferences,
  DUTY_OVERLAYS,
  type DutyFlag,
  type WorkflowReferenceType,
} from "../_generated/personaWorkflowMap.generated";
import { usePreview } from "./PreviewContext";
import { PageHeader } from "./shared";

const DOMAINS = ["All", "Clinical", "Compliance", "Enterprise", "Finance", "Governance",
  "Human Resources", "IT / Security", "Operations", "QAPI", "Risk Management"];
const REF_TYPES: (WorkflowReferenceType | "all")[] = ["all", "core", "conditional", "awareness", "leadership"];
const REF_LABEL: Record<WorkflowReferenceType, string> = {
  core: "Core reference",
  conditional: "Conditional reference",
  awareness: "Awareness",
  leadership: "Leadership reference",
};
const DUTY_FLAGS = Object.keys(DUTY_OVERLAYS) as DutyFlag[];
const PAGE_SIZE = 25;

export function WorkflowsWorkspace() {
  const { persona, withPersona } = usePreview();
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("All");
  const [refType, setRefType] = useState<WorkflowReferenceType | "all">("all");
  const [duties, setDuties] = useState<DutyFlag[]>([]);
  const [page, setPage] = useState(1);

  // Persona references (universal + role + duty overlays), keyed by workflow id.
  const refMap = useMemo(() => {
    const refs = getPersonaWorkflowReferences(persona.roleCode, duties);
    const m = new Map<string, { referenceType: WorkflowReferenceType; scopeNote?: string }>();
    for (const r of refs) m.set(r.workflowId, { referenceType: r.referenceType, scopeNote: r.scopeNote });
    return m;
  }, [persona.roleCode, duties]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORKFLOW_LIBRARY.filter((w) => {
      if (domain !== "All" && w.domain !== domain) return false;
      if (q && !w.title.toLowerCase().includes(q) && !w.id.toLowerCase().includes(q)) return false;
      if (refType !== "all") return refMap.get(w.id)?.referenceType === refType;
      return true;
    });
  }, [query, domain, refType, refMap]);

  const filterKey = `${query}|${domain}|${refType}|${duties.join(",")}|${persona.id}`;
  const lastKey = useRef(filterKey);
  if (lastKey.current !== filterKey) { lastKey.current = filterKey; if (page !== 1) setPage(1); }
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const myRefCount = refMap.size;

  function toggleDuty(d: DutyFlag) {
    setDuties((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  }

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="WORKFLOWS"
        title="Workflow Reference Library"
        description={`Applicable workflows for your role — as references, not required training. ${WORKFLOW_LIBRARY_COUNT} canonical workflows total; ${myRefCount} relevant to you.`}
      />

      {/* Featured prototype simulation (§18) */}
      <Link className="wf-featured" href={withPersona(FEATURED_WORKFLOW_SIMULATION.href)}>
        <FlaskConical aria-hidden="true" />
        <div>
          <strong>Prototype simulation preview · {FEATURED_WORKFLOW_SIMULATION.id}</strong>
          <span>
            {FEATURED_WORKFLOW_SIMULATION.title} — teaches canonical CL-WF-26. No official
            completion; will migrate to the shared Workflow Training component.
          </span>
        </div>
        <ArrowRight aria-hidden="true" />
      </Link>

      <div className="wf-controls">
        <div className="wf-search">
          <Search aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workflows by title or ID…" aria-label="Search workflows" />
        </div>
        <div className="wf-domain-filter" role="tablist" aria-label="Reference type">
          {REF_TYPES.map((t) => (
            <button key={t} role="tab" aria-selected={refType === t} onClick={() => setRefType(t)}>
              {t === "all" ? "All types" : REF_LABEL[t]}
            </button>
          ))}
        </div>
        <div className="wf-domain-filter" role="tablist" aria-label="Workflow domain">
          {DOMAINS.map((d) => (
            <button key={d} role="tab" aria-selected={domain === d} onClick={() => setDomain(d)}>{d}</button>
          ))}
        </div>
        <details className="wf-duty">
          <summary>Duty overlays ({duties.length})</summary>
          <div className="wf-duty-grid">
            {DUTY_FLAGS.map((d) => (
              <label key={d} className={duties.includes(d) ? "is-selected" : ""}>
                <input type="checkbox" checked={duties.includes(d)} onChange={() => toggleDuty(d)} />
                {d}
              </label>
            ))}
          </div>
        </details>
      </div>

      <p className="no-action-copy wf-count">
        {filtered.length} of {WORKFLOW_LIBRARY_COUNT} workflows{filtered.length > PAGE_SIZE ? ` · page ${safePage}/${totalPages}` : ""}
      </p>

      <ul className="wf-list">
        {paged.map((w) => {
          const ref = refMap.get(w.id);
          return (
            <li key={w.id}>
              <Link className="wf-row" href={withPersona(`/journey/workflows/${w.id}`)}>
                <span className="wf-row-id">{w.id}</span>
                <span className="wf-row-title">
                  {w.title}
                  {ref?.scopeNote ? <em className="wf-scope"> — {ref.scopeNote}</em> : null}
                </span>
                <span className="wf-row-domain">{w.domain}</span>
                <span className={`wf-row-tag ref-${ref?.referenceType ?? "none"}`}>
                  {ref ? REF_LABEL[ref.referenceType] : "Not in your role set"}
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>

      {totalPages > 1 ? (
        <div className="wf-pager" role="navigation" aria-label="Workflow pages">
          <button type="button" className="button button-secondary" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Previous</button>
          <span>Page {safePage} of {totalPages}</span>
          <button type="button" className="button button-secondary" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>Next</button>
        </div>
      ) : null}

      <p className="no-action-copy wf-refnote">
        <Workflow aria-hidden="true" /> Workflow references show the controlled process — they are
        not scored training and carry no completion, progress, or pass state.
      </p>
    </div>
  );
}
