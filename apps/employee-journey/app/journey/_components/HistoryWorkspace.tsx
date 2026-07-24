"use client";

import { useState } from "react";
import { Award, BookOpenCheck, FileClock, GraduationCap, Map } from "lucide-react";
import { HISTORY_ITEMS } from "../_data/fixtures";
import { PageHeader } from "./shared";
import { WorkspaceTabs, workspaceTabId, type TabOption } from "./ui";

type HistoryGroup =
  | "Transcript"
  | "Certificates"
  | "Policy acknowledgments"
  | "Competency history"
  | "Journey milestones";

const tabs: TabOption<HistoryGroup>[] = [
  { id: "Transcript", label: "Transcript" },
  { id: "Certificates", label: "Certificates" },
  { id: "Policy acknowledgments", label: "Policy acknowledgments" },
  { id: "Competency history", label: "Competency history" },
  { id: "Journey milestones", label: "Journey milestones" },
];

const groupIcons = {
  Transcript: GraduationCap,
  Certificates: Award,
  "Policy acknowledgments": BookOpenCheck,
  "Competency history": FileClock,
  "Journey milestones": Map,
} as const;

export function HistoryWorkspace() {
  const [active, setActive] = useState<HistoryGroup>("Transcript");
  const visible = HISTORY_ITEMS.filter((item) => item.group === active);
  const Icon = groupIcons[active];

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="HISTORY"
        title="Certificates & History"
        description="Transcript and evidence-oriented history comes first. Failures, overdue work, and remediation are never gamified."
      />

      <WorkspaceTabs
        label="History views"
        tabs={tabs}
        active={active}
        onChange={setActive}
        panelId="history-panel"
      />

      <section
        id="history-panel"
        className="history-panel"
        role="tabpanel"
        aria-labelledby={workspaceTabId("history-panel", active)}
        aria-label={active}
      >
        {visible.map((item) => (
          <article key={item.id}>
            <div className="history-icon">
              <Icon aria-hidden="true" />
            </div>
            <div>
              <p className="canonical-id">{item.group}</p>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
            </div>
            <time>{item.date}</time>
          </article>
        ))}
        {!visible.length ? (
          <div className="empty-state">
            <strong>No synthetic history in this category</strong>
            <p>Official evidence will appear here when connected.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
