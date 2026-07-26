"use client";

import { useMemo, useRef, useState } from "react";
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

const PAGE_SIZE = 25;

export function WorkflowsWorkspace() {
  const { persona, withPersona } = usePreview();
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("All");
  const [assignedOnly, setAssignedOnly] = useState(false);
  const [page, setPage] = useState(1);

  const assignedIds = useMemo(
    () => new Set(assignedWorkflowsForPersona(persona).map((w) => w.id)),
    [persona],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORKFLOW_LIBRARY.filter(
      (w) =>
        (domain === "All" || w.domain === domain) &&
        (!assignedOnly || assignedIds.has(w.id)) &&
        (!q || w.title.toLowerCase().includes(q) || w.id.toLowerCase().includes(q)),
    );
  }, [query, domain, assignedOnly, assignedIds]);

  // Reset to page 1 whenever the filter set changes (adjust-state-on-change pattern).
  const filterKey = `${query}|${domain}|${assignedOnly}|${persona.id}`;
  const lastKey = useRef(filterKey);
  if (lastKey.current !== filterKey) { lastKey.current = filterKey; if (page !== 1) setPage(1); }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
        <label className="wf-assigned-toggle">
          <input type="checkbox" checked={assignedOnly} onChange={(e) => setAssignedOnly(e.target.checked)} />
          My assigned only ({assignedIds.size})
        </label>
      </div>

      <p className="no-action-copy wf-count">
        {filtered.length} of {WORKFLOW_LIBRARY_COUNT} workflows{filtered.length > PAGE_SIZE ? ` · page ${safePage}/${totalPages}` : ""}
      </p>

      <ul className="wf-list">
        {paged.map((w) => {
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

      {totalPages > 1 ? (
        <div className="wf-pager" role="navigation" aria-label="Workflow pages">
          <button type="button" className="button button-secondary" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
            Previous
          </button>
          <span>Page {safePage} of {totalPages}</span>
          <button type="button" className="button button-secondary" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
