"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  ScrollText,
  Search,
  UserCog,
} from "lucide-react";
import {
  adjacentSections,
  handbookSectionsInOrder,
  HANDBOOK_META,
  type HandbookSection,
} from "../_lib/handbook";
import { usePreview } from "./PreviewContext";
import { MainAppLink } from "./MainAppLink";
import { StatusBadge } from "./shared";
import { openNolan } from "./NolanAssistant";
import { HandbookDraftBanner } from "./HandbookDraftBanner";

function HandbookBody({ html }: { html: string }) {
  // Build-time-baked, integrity-verified fragment from the controlled counsel
  // package (not user input). Rendered natively — never shown as raw source.
  return <div className="hb-body" dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Handbook section reader — mirrors the policy learning player's layout and styling
 * (the .policy-player-* classes / policy-player.css) so the handbook reads the same
 * way as /journey/policies/[assignmentId]: a fullscreen single centered reading lane,
 * a section TOC on the left, and a references/status side rail on the right.
 */
export function HandbookReader({ section }: { section: HandbookSection }) {
  const { withPersona } = usePreview();
  const [query, setQuery] = useState("");
  const ordered = useMemo(() => handbookSectionsInOrder(), []);
  const { prev, next } = adjacentSections(section.id);
  const progressPct = Math.round((section.order / HANDBOOK_META.sectionCount) * 100);

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
    <div className="policy-player">
      <div className="policy-player-crumb">
        <Link className="text-link" href={withPersona("/journey/handbook")}>
          <ArrowLeft aria-hidden="true" />
          Handbook home
        </Link>
        <span className="policy-progress-chip">
          Section {section.order} of {HANDBOOK_META.sectionCount}
        </span>
      </div>

      <HandbookDraftBanner />

      <header className="policy-player-header">
        <div>
          <p className="eyebrow">{section.eyebrow || `SECTION ${section.number}`}</p>
          <h1>{section.title}</h1>
          <p className="policy-player-subtitle">
            {HANDBOOK_META.documentId} · {HANDBOOK_META.version}
          </p>
        </div>
        <StatusBadge status={HANDBOOK_META.statusLabel} />
      </header>

      <dl className="policy-player-meta">
        <div>
          <dt>Section</dt>
          <dd>
            {section.number} · {section.order} of {HANDBOOK_META.sectionCount}
          </dd>
        </div>
        <div>
          <dt>Effective date</dt>
          <dd>{HANDBOOK_META.proposedEffectiveDate}</dd>
        </div>
        <div>
          <dt>Policies cited</dt>
          <dd>{section.policyIds.length || "None"}</dd>
        </div>
        <div>
          <dt>Forms &amp; records</dt>
          <dd>{section.formIds.length || "None"}</dd>
        </div>
      </dl>

      <div className="policy-player-grid">
        {/* LEFT — controlled-draft badge, progress, search, section navigation */}
        <aside className="policy-player-toc" aria-label="Handbook contents">
          <div className="policy-toc-status">
            <span className="status-badge status-complete">
              <BadgeCheck aria-hidden="true" />
              Controlled draft — reference only
            </span>
          </div>

          <div className="policy-toc-progress">
            <div className="policy-progress-track">
              <div className="policy-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span>
              Section {section.order} of {HANDBOOK_META.sectionCount}
            </span>
          </div>

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

          <nav aria-label="Handbook sections">
            <ol className="policy-toc-list">
              {filtered.map((s) => {
                const isActive = s.id === section.id;
                return (
                  <li key={s.id}>
                    <Link
                      href={withPersona(`/journey/handbook/section/${s.id}`)}
                      aria-current={isActive ? "true" : undefined}
                      className={isActive ? "is-active" : ""}
                    >
                      <span className="policy-toc-dot" aria-hidden="true" />
                      <span>
                        {s.number} · {s.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        {/* CENTER — single reading lane */}
        <section className="policy-player-center">
          <div className="policy-tab-panel" role="region" aria-labelledby="hb-section-title">
            <div className="policy-read-body">
              <article className="policy-section">
                <p className="policy-section-eyebrow">
                  Section {section.number} of {HANDBOOK_META.sectionCount}
                </p>
                <h3 id="hb-section-title">{section.title}</h3>
                {section.lead ? (
                  <p className="policy-section-instruction">{section.lead}</p>
                ) : null}

                <HandbookBody html={section.bodyHtml} />

                <div className="policy-section-ack">
                  {prev ? (
                    <Link
                      className="button button-secondary"
                      href={withPersona(`/journey/handbook/section/${prev.id}`)}
                    >
                      <ArrowLeft aria-hidden="true" />
                      {prev.number} · {prev.title}
                    </Link>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <Link
                      className="button button-primary"
                      href={withPersona(`/journey/handbook/section/${next.id}`)}
                    >
                      {next.number} · {next.title}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* RIGHT — owner, Nolan, references, status */}
        <aside className="policy-player-side" aria-label="References and status">
          <div className="policy-side-stack">
            <section className="policy-side-card">
              <h2>
                <UserCog aria-hidden="true" />
                Process owner
              </h2>
              <p>{section.owner || "Not specified"}</p>
              {section.employeeAction ? (
                <p className="policy-side-mustdo">
                  <strong>Your action:</strong> {section.employeeAction}
                </p>
              ) : null}
            </section>

            <section className="policy-side-card policy-side-nolan">
              <h2>
                <GraduationCap aria-hidden="true" />
                Ask Nolan about this section
              </h2>
              <p>
                Nolan can explain a handbook section from the approved source and what it
                means for your role — it won&rsquo;t create an official record.
              </p>
              <button type="button" className="button button-secondary" onClick={() => openNolan()}>
                <GraduationCap aria-hidden="true" />
                Ask Nolan
              </button>
            </section>

            <section className="policy-side-card">
              <h2>
                <ScrollText aria-hidden="true" />
                Policies
              </h2>
              {section.policyIds.length === 0 ? (
                <p className="no-action-copy">None cited.</p>
              ) : (
                <ul className="policy-side-chip-list">
                  {section.policyIds.map((id) => (
                    <li key={id}>
                      <MainAppLink className="hb-ref-chip" path={`/library/${id}`}>
                        <ScrollText aria-hidden="true" />
                        {id}
                      </MainAppLink>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="policy-side-card">
              <h2>
                <FileText aria-hidden="true" />
                Forms &amp; records
              </h2>
              {section.formIds.length === 0 ? (
                <p className="no-action-copy">None cited.</p>
              ) : (
                <ul className="policy-side-chip-list">
                  {section.formIds.map((id) => (
                    <li key={id}>
                      <MainAppLink className="hb-ref-chip" path={`/forms/${id}`}>
                        <FileText aria-hidden="true" />
                        {id}
                      </MainAppLink>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {section.externalAuthorities.length ? (
              <section className="policy-side-card">
                <h2>
                  <Landmark aria-hidden="true" />
                  External authority
                </h2>
                <ul className="policy-side-chip-list">
                  {section.externalAuthorities.map((id) => (
                    <li key={id}>{id}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="policy-side-card">
              <h2>Status</h2>
              <p className="policy-basis-source">{HANDBOOK_META.statusLabel}</p>
              <p className="no-action-copy">
                {HANDBOOK_META.documentId} · {HANDBOOK_META.version}. Effective date{" "}
                {HANDBOOK_META.proposedEffectiveDate}.
              </p>
              <Link className="text-link" href={withPersona("/journey/handbook/references")}>
                <ExternalLink aria-hidden="true" />
                All policy &amp; form references
              </Link>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
