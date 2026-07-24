"use client";

import { useState } from "react";
import {
  BookOpen,
  CircleHelp,
  GraduationCap,
  Headphones,
  MessageCircleQuestion,
} from "lucide-react";
import { usePreview } from "./PreviewContext";
import { openNolan } from "./NolanAssistant";
import { PageHeader } from "./shared";
import { Modal } from "./ui";

export function SupportWorkspace() {
  const { persona, announce } = usePreview();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="workspace">
      <PageHeader
        eyebrow="SUPPORT"
        title="Help & support"
        description={`Guidance for ${persona.name}. Opening an option never creates an official support request.`}
      />

      <section className="nolan-panel" aria-labelledby="nolan-title">
        <div className="nolan-mark"><GraduationCap aria-hidden="true" /></div>
        <div>
          <p className="eyebrow">NOLAN</p>
          <h2 id="nolan-title">Ask Nolan — your onboarding &amp; learning assistant</h2>
          <p>
            Nolan explains what&apos;s assigned, what&apos;s due, how the quizzes and attempts
            work, and how to prepare for a supervised visit. Nolan can&apos;t answer quiz
            questions, submit work, or handle patient information. Nolan opens in the panel at the
            bottom-right and is available on every page.
          </p>
          <div className="suggested-prompts" aria-label="Ask Nolan">
            <button type="button" onClick={() => openNolan()}>What should I do first?</button>
            <button type="button" onClick={() => openNolan()}>Why is this policy assigned?</button>
            <button type="button" onClick={() => openNolan()}>How do supervised visits work?</button>
          </div>
        </div>
      </section>

      <div className="support-grid">
        <article>
          <CircleHelp aria-hidden="true" />
          <h2>Assignment help</h2>
          <p>Understand why a training, policy, document, or competency item appears.</p>
          <button className="button button-secondary" type="button" onClick={() => announce("Preview opened. No official record was changed.")}>
            Open guidance preview
          </button>
        </article>
        <article>
          <BookOpen aria-hidden="true" />
          <h2>How this journey works</h2>
          <p>Learn how lifecycle phases, separate statuses, and reviewer-owned steps fit together.</p>
          <button className="button button-secondary" type="button" onClick={() => announce("Preview opened. No official record was changed.")}>
            View guide
          </button>
        </article>
        <article>
          <Headphones aria-hidden="true" />
          <h2>Contact options</h2>
          <p>See which support channel would be appropriate when the real service is connected.</p>
          <button className="button button-secondary" type="button" onClick={() => setContactOpen(true)}>
            View contact preview
          </button>
        </article>
      </div>

      <div className="support-truth" role="note">
        <MessageCircleQuestion aria-hidden="true" />
        <p>
          Support preview opened. No support request was sent. No ticket number,
          email, or production contact record is created.
        </p>
      </div>

      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title="Contact options preview"
        description="No official support request will be sent"
      >
        <div className="contact-options">
          <button type="button" onClick={() => announce("Support preview opened. No support request was sent.")}>
            People Team guidance
            <span>Assignments, documents, and lifecycle questions</span>
          </button>
          <button type="button" onClick={() => announce("Support preview opened. No support request was sent.")}>
            Clinical education guidance
            <span>Competency, supervised practice, and training questions</span>
          </button>
          <button type="button" onClick={() => announce("Support preview opened. No support request was sent.")}>
            Technical guidance
            <span>Access or preview navigation questions</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}

