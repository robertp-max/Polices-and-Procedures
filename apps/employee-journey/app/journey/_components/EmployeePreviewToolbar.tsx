"use client";

import { FlaskConical } from "lucide-react";
import { PERSONAS, type PersonaId } from "../_data/fixtures";
import { usePreview } from "./PreviewContext";

export function EmployeePreviewToolbar() {
  const { persona, personaId, setPersonaId } = usePreview();

  return (
    <section className="preview-toolbar" aria-label="Synthetic persona preview">
      <div className="preview-toolbar-label">
        <FlaskConical aria-hidden="true" />
        <div>
          <strong>SYNTHETIC PERSONA PREVIEW</strong>
          <span>No official employee record is shown.</span>
        </div>
      </div>
      <label className="persona-select">
        <span>Preview persona</span>
        <select
          value={personaId}
          onChange={(event) => setPersonaId(event.target.value as PersonaId)}
        >
          {PERSONAS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <div className="preview-toolbar-state" aria-live="polite">
        <span>{persona.fixtureId}</span>
        <strong>{persona.role}</strong>
        <small>{persona.stage}</small>
      </div>
    </section>
  );
}

