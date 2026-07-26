"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileWarning,
  GraduationCap,
  Info,
  Lightbulb,
  Lock,
  Menu,
} from "lucide-react";
import type { PolicyPlayerViewModel } from "../_lib/policyAssignmentView";
import { usePreview } from "./PreviewContext";
import { MainAppLink } from "./MainAppLink";
import { PageHeader, RequirementCard, StatusBadge } from "./shared";
import { Drawer, WorkspaceTabs, workspaceTabId } from "./ui";
import { PolicyMarkdown, cleanHeading } from "./PolicyMarkdown";
import { openNolan } from "./NolanAssistant";

type TabId = "read" | "changes" | "forms" | "quiz" | "review";

const TAB_ORDER: { id: TabId; label: string }[] = [
  { id: "read", label: "Read" },
  { id: "changes", label: "Key changes" },
  { id: "forms", label: "Forms & appendices" },
  { id: "quiz", label: "Knowledge check" },
  { id: "review", label: "Review & attestation" },
];

const PANEL_ID = "policy-player-panel";

function describeRequiredAction(data: PolicyPlayerViewModel): string {
  if (data.awarenessReferenceOnly) {
    return "Awareness only — no quiz or attestation required";
  }
  const parts: string[] = ["Read policy"];
  if (data.quizRequired) parts.push("pass knowledge check");
  if (data.attestationRequired) parts.push("sign attestation");
  return parts.join(" + ");
}

function classificationLabel(classification: string): string {
  switch (classification) {
    case "EXACT_FORM":
      return "Exact form match";
    case "COMPOSITE_PACKET":
      return "Composite packet (multiple forms)";
    case "QUIZ_NOT_FORM":
      return "Fulfilled by the knowledge check, not a form";
    case "NO_FORM_REQUIRED":
      return "No form required";
    case "FORM_MAPPING_REVIEW_REQUIRED":
      return "Form mapping under review";
    default:
      return classification;
  }
}

export function PolicyLearningPlayer({ data }: { data: PolicyPlayerViewModel }) {
  if (!data.unlocked) {
    return <BlockedPolicyState data={data} />;
  }
  return <UnlockedPolicyPlayer data={data} />;
}

function BlockedPolicyState({ data }: { data: PolicyPlayerViewModel }) {
  const { withPersona } = usePreview();
  return (
    <div className="workspace">
      <PageHeader
        eyebrow="POLICY ASSIGNMENT"
        title={data.policyTitle || data.policyId}
        description={`${data.courseTitle} (${data.courseId}) · ${data.pathway} pathway`}
      />
      <div className="policy-blocked-panel" role="alert">
        <Lock aria-hidden="true" />
        <div>
          <strong>This policy cannot be opened for reading yet</strong>
          <p>{data.lockReason}</p>
          <p className="policy-blocked-note">
            The learning player only launches policies with verified, fully baked
            text. This assignment is preserved here so the requirement stays
            visible, but no policy content is rendered until the source status
            resolves.
          </p>
        </div>
      </div>
      <RequirementCard
        id={data.policyId}
        title={data.policyTitle}
        status={data.releaseStatus}
        fields={[
          {
            label: "Pathway / course",
            value: `${data.pathway} · ${data.courseTitle} (${data.courseId})`,
          },
          { label: "Why assigned", value: data.scopeRationale || "Not supplied" },
          { label: "Required action", value: describeRequiredAction(data) },
          { label: "Initial due", value: data.initialDue || "Not supplied" },
          { label: "Recurrence", value: data.recurrence || "Not supplied" },
          {
            label: "Policy source status",
            value: data.policy?.policyRefStatus ?? "Not found in catalog",
          },
        ]}
        footer={
          <Link className="text-link" href={withPersona("/journey/policies")}>
            <ArrowLeft aria-hidden="true" />
            Back to policy actions
          </Link>
        }
      />
    </div>
  );
}

function UnlockedPolicyPlayer({ data }: { data: PolicyPlayerViewModel }) {
  const { announce, withPersona } = usePreview();
  const [activeTab, setActiveTab] = useState<TabId>("read");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [readSections, setReadSections] = useState<Set<string>>(new Set());
  const [attested, setAttested] = useState(false);
  // Show ONE section at a time (no endless all-sections scroll). Explicit
  // acknowledge marks a section read — passive scroll/visibility does not.
  const [activeSectionState, setActiveSectionState] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<"original" | "optimized">("original");

  const sections = data.policy?.sections ?? [];
  const totalSections = sections.length;
  const activeSectionId = activeSectionState ?? sections[0]?.sectionId ?? "";
  const activeIndex = Math.max(0, sections.findIndex((s) => s.sectionId === activeSectionId));
  const activeSection = sections[activeIndex];
  const nextSection = sections[activeIndex + 1];
  const progressPct =
    totalSections > 0 ? Math.round((readSections.size / totalSections) * 100) : 0;

  function selectSection(sectionId: string) {
    setActiveSectionState(sectionId);
    setActiveTab("read");
    setSheetOpen(false);
  }
  function acknowledgeAndAdvance() {
    if (!activeSection) return;
    setReadSections((prev) => new Set(prev).add(activeSection.sectionId));
    if (nextSection) setActiveSectionState(nextSection.sectionId);
  }

  const currentIndex = TAB_ORDER.findIndex((t) => t.id === activeTab);
  const nextTab = TAB_ORDER[currentIndex + 1];
  const activeLabel = TAB_ORDER.find((t) => t.id === activeTab)?.label ?? "";

  return (
    <div className={`policy-player${layoutMode === "optimized" ? " is-optimized" : ""}`}>
      <div className="policy-player-crumb">
        <Link className="text-link" href={withPersona("/journey/policies")}>
          <ArrowLeft aria-hidden="true" />
          Back to policy actions
        </Link>
        <div className="policy-layout-toggle" role="tablist" aria-label="Reader layout">
          <button
            type="button"
            role="tab"
            aria-selected={layoutMode === "original"}
            className={layoutMode === "original" ? "is-active" : ""}
            onClick={() => setLayoutMode("original")}
          >
            Original layout
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={layoutMode === "optimized"}
            className={layoutMode === "optimized" ? "is-active" : ""}
            onClick={() => setLayoutMode("optimized")}
          >
            Optimized vision
          </button>
        </div>
      </div>

      <header className="policy-player-header">
        <div>
          <p className="eyebrow">
            {data.policyId} · {data.pathway.toUpperCase()} PATHWAY
          </p>
          <h1>{data.policyTitle}</h1>
          <p className="policy-player-subtitle">
            {data.courseTitle} ({data.courseId})
          </p>
        </div>
        <StatusBadge status={data.releaseStatus} />
      </header>

      <dl className="policy-player-meta">
        <div>
          <dt>Version</dt>
          <dd>{data.policy?.versionDate ?? "Not supplied"}</dd>
        </div>
        <div>
          <dt>Effective date</dt>
          <dd>{data.policy?.versionDate ?? "Not supplied"}</dd>
        </div>
        <div>
          <dt>Domain</dt>
          <dd>
            {[data.policy?.domainCode, data.policy?.subdomainCode]
              .filter(Boolean)
              .join(" / ") || "Not supplied"}
          </dd>
        </div>
        <div>
          <dt>Owner / steward</dt>
          <dd>{data.policy?.ownerSteward ?? "Not supplied"}</dd>
        </div>
      </dl>

      <div className="policy-player-mobile-bar">
        <button
          type="button"
          className="button button-secondary"
          onClick={() => setSheetOpen(true)}
        >
          <Menu aria-hidden="true" />
          {activeLabel}
        </button>
        <span className="policy-progress-chip">{progressPct}% read</span>
      </div>

      <div className="policy-player-grid">
        <aside className="policy-player-toc" aria-label="Policy reading navigation">
          <div className="policy-toc-status">
            <span className="status-badge status-complete">
              <BadgeCheck aria-hidden="true" />
              Verified policy text
            </span>
            <dl>
              <div>
                <dt>Pathway</dt>
                <dd>{data.pathway}</dd>
              </div>
              <div>
                <dt>Tier</dt>
                <dd>{data.tier || "Unspecified"}</dd>
              </div>
              <div>
                <dt>Release status</dt>
                <dd>{data.releaseStatus}</dd>
              </div>
            </dl>
          </div>

          <div className="policy-toc-progress">
            <div className="policy-progress-track">
              <div
                className="policy-progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span>
              {readSections.size} of {totalSections} sections read
            </span>
          </div>

          <nav aria-label="Policy sections">
            <ol className="policy-toc-list">
              {sections.map((section) => {
                const isRead = readSections.has(section.sectionId);
                const isActive = section.sectionId === activeSectionId;
                return (
                  <li key={section.sectionId}>
                    <button
                      type="button"
                      className={`${isRead ? "is-read" : ""}${isActive ? " is-active" : ""}`}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => selectSection(section.sectionId)}
                    >
                      {isRead ? (
                        <CheckCircle2 aria-hidden="true" />
                      ) : (
                        <span className="policy-toc-dot" aria-hidden="true" />
                      )}
                      <span>{cleanHeading(section.title)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        <section className="policy-player-center">
          <div className="policy-tabs-desktop">
            <WorkspaceTabs
              label="Policy assignment sections"
              tabs={TAB_ORDER}
              active={activeTab}
              onChange={setActiveTab}
              panelId={PANEL_ID}
            />
          </div>

          <div
            id={PANEL_ID}
            className="policy-tab-panel"
            role="tabpanel"
            aria-labelledby={workspaceTabId(PANEL_ID, activeTab)}
            aria-label={activeLabel}
          >
            {activeTab === "read" && activeSection ? (
              <div className="policy-read-body">
                <article className="policy-section" key={activeSection.sectionId}>
                  <p className="policy-section-eyebrow">
                    Section {String(activeIndex + 1).padStart(2, "0")} of {totalSections}
                  </p>
                  <h3>{cleanHeading(activeSection.title)}</h3>
                  <p className="policy-section-instruction">
                    Read this section, then acknowledge that you understand it before the next
                    section unlocks.
                  </p>
                  <PolicyMarkdown text={activeSection.text} />

                  <div className="policy-section-ack">
                    <label className="policy-ack-check">
                      <input
                        type="checkbox"
                        checked={readSections.has(activeSection.sectionId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setReadSections((prev) => new Set(prev).add(activeSection.sectionId));
                          } else {
                            setReadSections((prev) => {
                              const next = new Set(prev);
                              next.delete(activeSection.sectionId);
                              return next;
                            });
                          }
                        }}
                      />
                      <span>I have read and understood this section.</span>
                    </label>
                    {nextSection ? (
                      <button
                        type="button"
                        className="button button-primary"
                        disabled={!readSections.has(activeSection.sectionId)}
                        onClick={acknowledgeAndAdvance}
                      >
                        Unlock next
                        <ArrowRight aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button button-primary"
                        disabled={!readSections.has(activeSection.sectionId)}
                        onClick={() => nextTab && setActiveTab(nextTab.id)}
                      >
                        {data.quizRequired ? "Continue to knowledge check" : "Continue"}
                        <ArrowRight aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </article>
              </div>
            ) : null}

            {activeTab === "changes" ? <KeyChangesPanel data={data} /> : null}
            {activeTab === "forms" ? (
              <FormsPanel data={data} withPersona={withPersona} />
            ) : null}
            {activeTab === "quiz" ? (
              <QuizPanel data={data} withPersona={withPersona} />
            ) : null}
            {activeTab === "review" ? (
              <ReviewPanel
                data={data}
                attested={attested}
                onAttest={() => {
                  setAttested(true);
                  announce(
                    "Preview attestation recorded for this session only. No official acknowledgment was filed.",
                  );
                }}
              />
            ) : null}
          </div>
        </section>

        <aside className="policy-player-side" aria-label="Assignment details">
          <SidePanel data={data} onOpenTab={setActiveTab} />
        </aside>
      </div>

      <div className="policy-sticky-bar">
        {data.quizRequired ? (
          <Link
            className="button button-secondary"
            href={withPersona(`/journey/policies/${data.assignmentId}/quiz`)}
          >
            Knowledge check
          </Link>
        ) : null}
        <button
          type="button"
          className="button button-primary"
          onClick={() => nextTab && setActiveTab(nextTab.id)}
          disabled={!nextTab}
        >
          {nextTab ? `Continue to ${nextTab.label}` : "Review complete"}
          <ArrowRight aria-hidden="true" />
        </button>
      </div>

      <Drawer
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Jump to section"
        description="Choose a part of this policy assignment"
      >
        <nav className="policy-sheet-nav">
          {TAB_ORDER.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "is-active" : ""}
              onClick={() => {
                setActiveTab(tab.id);
                setSheetOpen(false);
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </Drawer>
    </div>
  );
}

function KeyChangesPanel({ data }: { data: PolicyPlayerViewModel }) {
  return (
    <div className="policy-changes-panel">
      <div className="truth-note" role="note">
        <Info aria-hidden="true" />
        <p>
          Change summary not supplied. The current source data does not include
          a change log or diff for this policy version.
        </p>
      </div>
      <dl className="policy-meta-list">
        <div>
          <dt>Version date</dt>
          <dd>{data.policy?.versionDate ?? "Not supplied"}</dd>
        </div>
        <div>
          <dt>Domain / subdomain</dt>
          <dd>
            {[data.policy?.domainCode, data.policy?.subdomainCode]
              .filter(Boolean)
              .join(" / ") || "Not supplied"}
          </dd>
        </div>
        <div>
          <dt>Owner / steward</dt>
          <dd>{data.policy?.ownerSteward ?? "Not supplied"}</dd>
        </div>
        <div>
          <dt>Classification tier</dt>
          <dd>{data.policy?.tier ?? "Not supplied"}</dd>
        </div>
      </dl>
    </div>
  );
}

function FormsPanel({
  data,
  withPersona,
}: {
  data: PolicyPlayerViewModel;
  withPersona: (href: string) => string;
}) {
  if (data.relatedForms.length === 0) {
    return (
      <div className="policy-forms-panel">
        <div className="truth-note" role="note">
          <Info aria-hidden="true" />
          <p>
            No forms or appendices are linked to this policy assignment&rsquo;s
            related modules in the current source data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="policy-forms-panel">
      {data.relatedForms.map((group) => (
        <article key={group.appendixKey} className="policy-form-group">
          <header>
            <h3>{group.label}</h3>
            <span className="policy-form-classification">
              {classificationLabel(group.classification)}
            </span>
          </header>
          <p className="policy-form-note">{group.note}</p>
          {group.forms.length > 0 ? (
            <ul className="policy-form-list">
              {group.forms.map((form) => (
                <li key={form.id}>
                  <div className="policy-action-row">
                    <FileWarning aria-hidden="true" />
                    <div>
                      <strong>
                        {form.id} · {form.title}
                      </strong>
                      <span>{form.type}</span>
                    </div>
                    <Link
                      className="button button-secondary"
                      href={withPersona(`/journey/forms/${form.id}`)}
                    >
                      Open form
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function QuizPanel({
  data,
  withPersona,
}: {
  data: PolicyPlayerViewModel;
  withPersona: (href: string) => string;
}) {
  if (!data.quizRequired) {
    return (
      <div className="policy-quiz-panel">
        <div className="truth-note" role="note">
          <Info aria-hidden="true" />
          <p>No knowledge check is required for this policy assignment.</p>
        </div>
      </div>
    );
  }

  if (!data.quiz) {
    return (
      <div className="policy-quiz-panel">
        <div className="truth-note" role="note">
          <Info aria-hidden="true" />
          <p>
            This assignment requires a knowledge check, but no quiz bundle
            metadata was found for course {data.courseId}. Marked
            REVIEW_REQUIRED.
          </p>
        </div>
        <Link
          className="button button-secondary"
          href={withPersona(`/journey/policies/${data.assignmentId}/quiz`)}
        >
          Open knowledge check
        </Link>
      </div>
    );
  }

  const { quiz } = data;
  const bankMessage =
    quiz.bankStatus === "APPROVED"
      ? "An approved question bank is ready for this course."
      : quiz.bankStatus === "DRAFT_REVIEW_REQUIRED"
        ? "A draft question bank exists — it opens as an unofficial practice run, not a scored official attempt."
        : "No question bank exists yet for this course. The knowledge check page will show a locked state.";

  return (
    <div className="policy-quiz-panel">
      <RequirementCard
        id={quiz.bundleId}
        title={quiz.title}
        status={quiz.bankStatus.replaceAll("_", " ")}
        fields={[
          { label: "Pass score", value: `${quiz.passScore}%` },
          { label: "Max attempts", value: quiz.maxAttempts },
          { label: "Question count", value: quiz.questionCount },
          {
            label: "Policies covered",
            value: `${quiz.policyIds.length} polic${quiz.policyIds.length === 1 ? "y" : "ies"} in this course`,
          },
        ]}
        footer={
          <div className="card-actions">
            <Link
              className="button button-primary"
              href={withPersona(`/journey/policies/${data.assignmentId}/quiz`)}
            >
              Open knowledge check
            </Link>
            <p className="no-action-copy">{bankMessage}</p>
          </div>
        }
      />
      <p className="policy-quiz-note">{quiz.note}</p>
    </div>
  );
}

function ReviewPanel({
  data,
  attested,
  onAttest,
}: {
  data: PolicyPlayerViewModel;
  attested: boolean;
  onAttest: () => void;
}) {
  return (
    <div className="policy-review-panel">
      <dl className="policy-meta-list">
        <div>
          <dt>Required action</dt>
          <dd>{describeRequiredAction(data)}</dd>
        </div>
        <div>
          <dt>Initial due</dt>
          <dd>{data.initialDue || "Not supplied"}</dd>
        </div>
        <div>
          <dt>Recurrence</dt>
          <dd>{data.recurrence || "Not supplied"}</dd>
        </div>
      </dl>

      {data.attestationRequired ? (
        <div className="policy-attestation-card">
          <label className="policy-attestation-checkbox">
            <input
              type="checkbox"
              checked={attested}
              onChange={() => {
                if (!attested) onAttest();
              }}
            />
            <span>I have read and understand {data.policyTitle}.</span>
          </label>
          <button
            type="button"
            className="button button-primary"
            disabled={attested}
            onClick={onAttest}
          >
            <ClipboardCheck aria-hidden="true" />
            {attested ? "Attestation recorded (preview)" : "Submit attestation preview"}
          </button>
          <div className="preview-callout">
            <strong>Preview only</strong>
            <p>
              No official attestation record is created here. Official policy
              acknowledgment happens through the agency&rsquo;s policy
              acknowledgment system.
            </p>
          </div>
        </div>
      ) : (
        <div className="truth-note" role="note">
          <Info aria-hidden="true" />
          <p>
            No attestation is required on this specific policy record.
            Attestation may still apply at the course level.
          </p>
        </div>
      )}
    </div>
  );
}

function SidePanel({
  data,
  onOpenTab,
}: {
  data: PolicyPlayerViewModel;
  onOpenTab: (tab: TabId) => void;
}) {
  return (
    <div className="policy-side-stack">
      <section className="policy-side-card policy-side-why">
        <h2>
          <Lightbulb aria-hidden="true" />
          Why this matters
        </h2>
        <p>{data.scopeRationale || "This policy sets the standard you are expected to follow in your role."}</p>
        <p className="policy-side-mustdo">
          <strong>What you must do:</strong> read every section, {data.quizRequired ? "pass the knowledge check, " : ""}
          {data.attestationRequired ? "and attest that you understand it." : "and acknowledge it where required."}
        </p>
      </section>

      <section className="policy-side-card policy-side-nolan">
        <h2>
          <GraduationCap aria-hidden="true" />
          Ask Nolan about this policy
        </h2>
        <p>
          Nolan can explain a concept from the approved source, what this means for your role,
          or what&rsquo;s due — it won&rsquo;t answer the knowledge check for you.
        </p>
        <button type="button" className="button button-secondary" onClick={() => openNolan()}>
          <GraduationCap aria-hidden="true" />
          Ask Nolan
        </button>
      </section>

      <section className="policy-side-card">
        <h2>Why this is assigned</h2>
        <p>{data.scopeRationale || "Not supplied"}</p>
      </section>

      <section className="policy-side-card">
        <h2>Required action</h2>
        <p>{describeRequiredAction(data)}</p>
        <dl className="policy-meta-list">
          <div>
            <dt>Due</dt>
            <dd>{data.initialDue || "Not supplied"}</dd>
          </div>
          <div>
            <dt>Recurrence</dt>
            <dd>{data.recurrence || "Not supplied"}</dd>
          </div>
        </dl>
      </section>

      <section className="policy-side-card">
        <h2>Policy basis</h2>
        <p className="policy-basis-source">{data.internalSource || "Not supplied"}</p>
        {data.externalAuthorityUrl ? (
          <a
            className="text-link"
            href={data.externalAuthorityUrl}
            rel="noopener noreferrer"
          >
            <ExternalLink aria-hidden="true" />
            External authority reference
          </a>
        ) : null}
        {data.sourceNotes ? <p className="policy-source-notes">{data.sourceNotes}</p> : null}
      </section>

      <section className="policy-side-card">
        <h2>Related forms</h2>
        {data.relatedForms.length === 0 ? (
          <p className="no-action-copy">None linked in current source data.</p>
        ) : (
          <>
            <ul className="policy-side-chip-list">
              {data.relatedForms.map((group) => (
                <li key={group.appendixKey}>{classificationLabel(group.classification)}</li>
              ))}
            </ul>
            <button
              type="button"
              className="text-link"
              onClick={() => onOpenTab("forms")}
            >
              View forms & appendices
            </button>
          </>
        )}
      </section>

      <section className="policy-side-card">
        <h2>Related module</h2>
        {data.relatedModules.length === 0 ? (
          <p className="no-action-copy">No related module linked.</p>
        ) : (
          <ul className="policy-related-module-list">
            {data.relatedModules.map((mod) =>
              mod.playerAvailable && mod.launchRef ? (
                <li key={mod.id} className="policy-action-row">
                  <FileWarning aria-hidden="true" />
                  <div>
                    <strong>
                      {mod.id} · {mod.title ?? "Untitled module"}
                    </strong>
                    <span>Opens in the main app, same tab</span>
                  </div>
                  <MainAppLink className="button button-secondary" path={mod.launchRef}>
                    Launch
                  </MainAppLink>
                </li>
              ) : (
                <li key={mod.id} className="unavailable-action">
                  <FileWarning aria-hidden="true" />
                  <div>
                    <strong>
                      {mod.id} · {mod.title ?? "Untitled module"}
                    </strong>
                    <span>Player not yet available</span>
                  </div>
                  <button type="button" disabled>
                    Unavailable
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
