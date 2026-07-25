"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  ExternalLink,
  FileText,
  Landmark,
  ScrollText,
  Search,
  UserCog,
} from "lucide-react";
import {
  adjacentSections,
  formHref,
  handbookSectionsInOrder,
  policyHref,
  HANDBOOK_META,
  type HandbookSection,
} from "../_lib/handbook";
import { usePreview } from "./PreviewContext";
import { MainAppLink } from "./MainAppLink";
import { openNolan } from "./NolanAssistant";
import { HandbookDraftBanner } from "./HandbookDraftBanner";

function HandbookBody({ html }: { html: string }) {
  // The body HTML is a build-time-baked, integrity-verified fragment from the
  // controlled counsel package (not user input). Rendered natively (semantic
  // headings, responsive tables, callouts) — never shown as raw source.
  return <div className="hb-body" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function HandbookReader({ section }: { section: HandbookSection }) {
  const { withPersona } = usePreview();
  const [query, setQuery] = useState("");
  const ordered = useMemo(() => handbookSectionsInOrder(), []);
  const { prev, next } = adjacentSections(section.id);

  const filtered = query.trim()
    ? ordered.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.number.includes(query) ||
          s.policyIds.some((p) => p.toLowerCase().includes(query.toLowerCase())) ||
          s.formIds.some((f) => f.toLowerCase().includes(query.toLowerCase())),
      )
    : ordered;

  return (
    <div className="hb-reader">
      <HandbookDraftBanner />

      <div className="hb-reader-crumb">
        <Link className="text-link" href={withPersona("/journey/handbook")}>
          <ArrowLeft aria-hidden="true" />
          Handbook home
        </Link>
        <span className="hb-progress-chip">
          Section {section.order} of {HANDBOOK_META.sectionCount}
        </span>
      </div>

      <div className="hb-reader-grid">
        {/* LEFT RAIL — search + contents + progress */}
        <aside className="hb-rail hb-rail-left" aria-label="Handbook contents">
          <div className="hb-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sections, policy or form IDs…"
              aria-label="Search the handbook"
            />
          </div>
          <div className="hb-progress-track" aria-hidden="true">
            <div
              className="hb-progress-fill"
              style={{ width: `${Math.round((section.order / HANDBOOK_META.sectionCount) * 100)}%` }}
            />
          </div>
          <nav aria-label="Handbook sections">
            <ol className="hb-toc">
              {filtered.map((s) => (
                <li key={s.id}>
                  <Link
                    href={withPersona(`/journey/handbook/section/${s.id}`)}
                    aria-current={s.id === section.id ? "true" : undefined}
                    className={s.id === section.id ? "is-active" : ""}
                  >
                    <span className="hb-toc-num">{s.number}</span>
                    <span>{s.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        {/* CENTER — controlled content */}
        <section className="hb-center" aria-labelledby="hb-section-title">
          <header className="hb-section-header">
            <p className="eyebrow">{section.eyebrow || `Section ${section.number}`}</p>
            <h1 id="hb-section-title">{section.title}</h1>
            {section.lead ? <p className="hb-section-lead">{section.lead}</p> : null}
          </header>

          <HandbookBody html={section.bodyHtml} />

          <div className="hb-section-nav">
            {prev ? (
              <Link className="button button-secondary" href={withPersona(`/journey/handbook/section/${prev.id}`)}>
                <ArrowLeft aria-hidden="true" />
                {prev.number} · {prev.title}
              </Link>
            ) : <span />}
            {next ? (
              <Link className="button button-primary" href={withPersona(`/journey/handbook/section/${next.id}`)}>
                {next.number} · {next.title}
                <ArrowRight aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </section>

        {/* RIGHT RAIL — references, owner, status, Nolan */}
        <aside className="hb-rail hb-rail-right" aria-label="References and status">
          <section className="hb-side-card">
            <h2><UserCog aria-hidden="true" /> Process owner</h2>
            <p>{section.owner || "Not specified"}</p>
            {section.employeeAction ? (
              <p className="hb-employee-action"><strong>Your action:</strong> {section.employeeAction}</p>
            ) : null}
          </section>

          <section className="hb-side-card">
            <h2><ScrollText aria-hidden="true" /> Policies</h2>
            {section.policyIds.length === 0 ? (
              <p className="no-action-copy">None cited.</p>
            ) : (
              <ul className="hb-ref-list">
                {section.policyIds.map((id) => {
                  const href = policyHref(id);
                  return (
                    <li key={id}>
                      {href ? (
                        <MainAppLink className="hb-ref-chip" path={`/library/${id}`}>
                          <ScrollText aria-hidden="true" />
                          {id}
                        </MainAppLink>
                      ) : (
                        <span className="hb-ref-chip is-static">{id}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="hb-side-card">
            <h2><FileText aria-hidden="true" /> Forms & records</h2>
            {section.formIds.length === 0 ? (
              <p className="no-action-copy">None cited.</p>
            ) : (
              <ul className="hb-ref-list">
                {section.formIds.map((id) => {
                  const href = formHref(id);
                  return (
                    <li key={id}>
                      {href ? (
                        <MainAppLink className="hb-ref-chip" path={`/forms/${id}`}>
                          <FileText aria-hidden="true" />
                          {id}
                        </MainAppLink>
                      ) : (
                        <span className="hb-ref-chip is-static">{id}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {section.externalAuthorities.length ? (
            <section className="hb-side-card">
              <h2><Landmark aria-hidden="true" /> External authority</h2>
              <ul className="hb-ref-list">
                {section.externalAuthorities.map((id) => (
                  <li key={id}><span className="hb-ref-chip is-static">{id}</span></li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="hb-side-card hb-side-status">
            <h2><BookOpenText aria-hidden="true" /> Status</h2>
            <p className="hb-status-pill">{HANDBOOK_META.statusLabel}</p>
            <p className="no-action-copy">
              {HANDBOOK_META.documentId} · {HANDBOOK_META.version}. Effective date{" "}
              {HANDBOOK_META.proposedEffectiveDate}.
            </p>
            <button type="button" className="button button-secondary hb-nolan-btn" onClick={() => openNolan()}>
              Ask Nolan about this section
            </button>
            <Link className="text-link" href={withPersona("/journey/handbook/references")}>
              <ExternalLink aria-hidden="true" />
              All policy & form references
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
