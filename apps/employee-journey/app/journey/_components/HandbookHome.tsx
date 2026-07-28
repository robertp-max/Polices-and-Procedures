"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenText,
  ClipboardList,
  FileClock,
  Layers,
  ListChecks,
  Lock,
} from "lucide-react";
import {
  handbookLifecycle,
  handbookSectionsInOrder,
  HANDBOOK_META,
} from "../_lib/handbook";
import { usePreview } from "./PreviewContext";
import { PageHeader } from "./shared";
import { CareIndeedBrand } from "./CareIndeedBrand";
import { HandbookDraftBanner } from "./HandbookDraftBanner";

export function HandbookHome() {
  const { withPersona } = usePreview();
  const sections = handbookSectionsInOrder();
  const lifecycle = handbookLifecycle();

  return (
    <div className="workspace hb-home">
      <PageHeader
        eyebrow="HANDBOOK"
        title="Employee & Field Workforce Handbook"
        description="The controlled 2026 handbook draft. This is the plain-language employee summary; the controlled policy system remains authoritative for detailed rules."
      />

      <HandbookDraftBanner />

      {/* Document control card */}
      <section className="hb-control-card">
        <div className="hb-control-brand">
          <CareIndeedBrand variant="wordmark" />
        </div>
        <dl className="hb-control-meta">
          <div><dt>Document ID</dt><dd>{HANDBOOK_META.documentId}</dd></div>
          <div><dt>Version</dt><dd>{HANDBOOK_META.version}</dd></div>
          <div><dt>Status</dt><dd>{HANDBOOK_META.statusLabel}</dd></div>
          <div><dt>Prepared</dt><dd>{HANDBOOK_META.preparedDate}</dd></div>
          <div><dt>Effective date</dt><dd>{HANDBOOK_META.proposedEffectiveDate}</dd></div>
          <div><dt>Sections</dt><dd>{HANDBOOK_META.sectionCount}</dd></div>
        </dl>
      </section>

      {/* Quick actions */}
      <div className="hb-quicklinks">
        <Link className="hb-quicklink" href={withPersona("/journey/handbook/contents")}>
          <Layers aria-hidden="true" />
          <div><strong>Contents</strong><span>All {HANDBOOK_META.sectionCount} sections</span></div>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link className="hb-quicklink" href={withPersona("/journey/handbook/references")}>
          <ClipboardList aria-hidden="true" />
          <div><strong>References</strong><span>{HANDBOOK_META.policyReferenceCount} policies · {HANDBOOK_META.formReferenceCount} forms</span></div>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link className="hb-quicklink" href={withPersona("/journey/handbook/release-status")}>
          <ListChecks aria-hidden="true" />
          <div><strong>Release status</strong><span>Approval gates (reviewers)</span></div>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link className="hb-quicklink" href={withPersona("/journey/handbook/history")}>
          <FileClock aria-hidden="true" />
          <div><strong>History</strong><span>Retired 2022 record</span></div>
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>

      {/* Acknowledgment — disabled while draft */}
      <section className="hb-ack-locked" role="note">
        <Lock aria-hidden="true" />
        <div>
          <strong>Employee acknowledgment is disabled</strong>
          <p>
            Acknowledgment cannot be enabled while the handbook is a counsel-review draft. It becomes
            available only after every release gate is closed and the approved version is published.
          </p>
        </div>
        <Link className="button button-secondary" href={withPersona("/journey/handbook/acknowledgment")}>
          Why?
        </Link>
      </section>

      {/* Lifecycle map */}
      <div className="annual-subheading">
        <BookOpenText aria-hidden="true" />
        <div>
          <h2>Where the handbook applies in your journey</h2>
          <p>Sections most relevant at each lifecycle phase.</p>
        </div>
      </div>
      <div className="hb-lifecycle-grid">
        {lifecycle.map((phase) => (
          <article className="hb-lifecycle-card" key={phase.key}>
            <h3>{phase.label}</h3>
            <p>{phase.blurb}</p>
            <ul>
              {phase.sectionIds.slice(0, 5).map((id) => {
                const s = sections.find((x) => x.id === id);
                if (!s) return null;
                return (
                  <li key={id}>
                    <Link href={withPersona(`/journey/handbook/section/${id}`)}>{s.title}</Link>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>

      {/* Full contents preview */}
      <div className="annual-subheading">
        <Layers aria-hidden="true" />
        <div>
          <h2>All sections</h2>
          <p>Read in order or jump to any section.</p>
        </div>
      </div>
      <ol className="hb-contents-list">
        {sections.map((s) => (
          <li key={s.id}>
            <Link className="hb-contents-row" href={withPersona(`/journey/handbook/section/${s.id}`)}>
              <span className="hb-toc-num">{s.number}</span>
              <span className="hb-contents-title">{s.title}</span>
              <span className="hb-contents-refs">
                {s.policyIds.length ? <span><BadgeCheck aria-hidden="true" />{s.policyIds.length}</span> : null}
              </span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
