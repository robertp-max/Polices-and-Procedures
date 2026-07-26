"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Workflow } from "lucide-react";
import {
  WORKFLOW_LIBRARY,
  WORKFLOW_LIBRARY_COUNT,
  FEATURED_WORKFLOW_SIMULATION,
  assignedWorkflowsForPersona,
} from "../_data/fixtures";
import { usePreview } from "./PreviewContext";
import { PageHeader } from "./shared";

const DOMAINS = [
  "All",
  "Clinical",
  "Compliance",
  "Enterprise",
  "Finance",
  "Governance",
  "Human Resources",
  "IT / Security",
  "Operations",
  "QAPI",
  "Risk Management",
];

export function WorkflowsWorkspace() {
  const { persona, withPersona } = usePreview();
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("All");

  const assignedIds = useMemo(
    () => new Set(assignedWorkflowsForPersona(persona).map((w) => w.id)),
    [persona],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORKFLOW_LIBRARY.filter(
      (w) =>
        (domain === "All" || w.domain === domain) &&
        (!q || w.title.toLowerCase().includes(q) || w.id.toLowerCase().includes(q)),
    );
  }, [query, domain]);

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="WORKFLOWS"
        title="Workflow Library"
        description={`Browse the ${WORKFLOW_LIBRARY_COUNT} approved operational workflows. Your role's required set is highlighted; the rest are reference-only for browsing — not your assignments.`}
      />

      {/* Featured simulation */}
      <Link className="wf-featured" href={withPersona(FEATURED_WORKFLOW_SIMULATION.href)}>
        <Workflow aria-hidden="true" />
        <div>
          <strong>Featured simulation · {FEATURED_WORKFLOW_SIMULATION.id}</strong>
          <span>{FEATURED_WORKFLOW_SIMULATION.title} — {FEATURED_WORKFLOW_SIMULATION.teaches}</span>
        </div>
        <ArrowRight aria-hidden="true" />
      </Link>

      <div className="wf-controls">
        <div className="wf-search">
          <Search aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workflows by title or ID…"
            aria-label="Search workflows"
          />
        </div>
        <div className="wf-domain-filter" role="tablist" aria-label="Workflow domain">
          {DOMAINS.map((d) => (
            <button key={d} role="tab" aria-selected={domain === d} onClick={() => setDomain(d)}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <p className="no-action-copy wf-count">{filtered.length} of {WORKFLOW_LIBRARY_COUNT} workflows</p>

      <ul className="wf-list">
        {filtered.map((w) => {
          const isAssigned = assignedIds.has(w.id);
          return (
            <li key={w.id}>
              <Link className="wf-row" href={withPersona(`/journey/workflows/${w.id}`)}>
                <span className="wf-row-id">{w.id}</span>
                <span className="wf-row-title">{w.title}</span>
                <span className="wf-row-domain">{w.domain}</span>
                <span className={`wf-row-tag ${isAssigned ? "is-assigned" : "is-reference"}`}>
                  {isAssigned ? "Assigned" : "Reference"}
                </span>
                <ArrowRight aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
