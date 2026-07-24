"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import GAO001Scene01WelcomeDesk from "../../../../gao001/components/GAO001Scene01WelcomeDesk";
import { usePreview } from "../../../_components/PreviewContext";

export function Gao001Preview() {
  const { persona, withPersona, announce } = usePreview();

  return (
    <main className="gao-route">
      <header className="gao-route-header">
        <Link href={withPersona("/journey/my-journey")}>
          <ArrowLeft aria-hidden="true" />
          Back to My Journey
        </Link>
        <div>
          <img src="/assets/logo-careindeed-orange.png" alt="Care Indeed" />
          <span>GAO-001 · A New Journey</span>
        </div>
        <p>
          <FlaskConical aria-hidden="true" />
          Synthetic preview · no official completion is recorded
        </p>
      </header>
      <section className="gao-route-stage" aria-label="GAO-001 preview content">
        <GAO001Scene01WelcomeDesk
          learnerName={persona.name}
          learnerRole={persona.role}
          learnerEmail={`${persona.fixtureId.toLowerCase()}@example.invalid`}
          onComplete={() =>
            announce(
              "Practice point completed in this preview. No official completion was recorded.",
            )
          }
        />
      </section>
    </main>
  );
}
