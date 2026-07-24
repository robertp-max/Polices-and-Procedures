import { PenLine } from "lucide-react";
import type {
  FormContent,
  FormField,
  FormSection,
} from "../_generated/sharedTypes.generated";

/**
 * Renders the ACTUAL baked FormContent (from appendixForms.generated.ts) as a
 * read-only, controlled-document field layout. Every label, instruction,
 * checklist item, table column, and signature role rendered here comes
 * directly from the generated FormContent — nothing is summarized or
 * fabricated. All controls are disabled/read-only: this is a structural
 * preview of the controlled form, not a live submission surface.
 */

function inputTypeFor(field: FormField): string {
  switch (field.type) {
    case "date":
      return "date";
    case "number":
      return "number";
    case "email":
      return "email";
    case "tel":
      return "tel";
    default:
      return "text";
  }
}

function FieldControl({ field }: { field: FormField }) {
  if (field.type === "textarea") {
    return (
      <textarea
        className="cfr-input cfr-textarea"
        placeholder={field.placeholder ?? "—"}
        readOnly
        disabled
        aria-label={field.label}
        rows={3}
      />
    );
  }
  if (field.type === "checkbox") {
    return (
      <span className="cfr-checkbox" role="img" aria-label={`${field.label} checkbox, unchecked`} />
    );
  }
  if (field.type === "radio") {
    return (
      <span className="cfr-radio" role="img" aria-label={`${field.label} option`} />
    );
  }
  if (field.type === "signature") {
    return (
      <span className="cfr-signature-line" role="img" aria-label="Signature line">
        <PenLine aria-hidden="true" />
      </span>
    );
  }
  if (field.type === "select") {
    return (
      <select className="cfr-input" disabled aria-label={field.label} defaultValue="">
        <option value="" disabled>
          {field.placeholder ?? "Select…"}
        </option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      className="cfr-input"
      type={inputTypeFor(field)}
      placeholder={field.placeholder ?? "—"}
      readOnly
      disabled
      aria-label={field.label}
    />
  );
}

function FieldRow({ field }: { field: FormField }) {
  return (
    <label className={`cfr-field cfr-col-${field.col ?? 2}`}>
      <span className="cfr-field-label">
        {field.label}
        {field.required ? (
          <em className="cfr-required" aria-label="required field">
            *
          </em>
        ) : null}
      </span>
      <FieldControl field={field} />
      {field.help ? <small className="cfr-field-help">{field.help}</small> : null}
    </label>
  );
}

function GridBody({ section }: { section: FormSection }) {
  if (!section.fields?.length) return null;
  return (
    <div className="cfr-grid">
      {section.fields.map((field) => (
        <FieldRow key={field.label} field={field} />
      ))}
    </div>
  );
}

function ChecklistBody({ section }: { section: FormSection }) {
  if (!section.items?.length) return null;
  return (
    <ul className="cfr-checklist">
      {section.items.map((item) => (
        <li key={item}>
          <span className="cfr-checkbox" role="img" aria-label="Checklist item, unchecked" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function AttestationBody({ section }: { section: FormSection }) {
  const items = section.acknowledgments ?? section.items ?? [];
  if (!items.length) return null;
  return (
    <ul className="cfr-attestation">
      {items.map((item) => (
        <li key={item}>
          <span className="cfr-checkbox" role="img" aria-label="Acknowledgment, unchecked" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function TableBody({ section }: { section: FormSection }) {
  const columns = section.columns;
  if (!columns?.length) return null;
  const rowCount = section.rowCount ?? 3;
  const rows = Array.from({ length: Math.max(1, Math.min(rowCount, 20)) });
  return (
    <div className="cfr-table-wrap">
      <table className="cfr-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((_, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td key={column} aria-label={`${column}, blank`} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rowCount > 20 ? (
        <p className="cfr-table-note">
          Showing 20 of {rowCount} rows on the controlled form.
        </p>
      ) : null}
    </div>
  );
}

function MatrixBody({ section }: { section: FormSection }) {
  const matrixRows = section.matrixRows;
  const matrixCols = section.matrixCols;
  if (!matrixRows?.length || !matrixCols?.length) return null;
  return (
    <div className="cfr-table-wrap">
      <table className="cfr-table cfr-matrix">
        <thead>
          <tr>
            <th scope="col" />
            {matrixCols.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrixRows.map((row) => (
            <tr key={row}>
              <th scope="row">{row}</th>
              {matrixCols.map((col) => (
                <td key={col}>
                  <span
                    className="cfr-checkbox"
                    role="img"
                    aria-label={`${row} × ${col}, unmarked`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NarrativeBody({ section }: { section: FormSection }) {
  if (!section.body) return null;
  return <p className="cfr-narrative">{section.body}</p>;
}

function ImageBody({ section }: { section: FormSection }) {
  if (!section.image?.src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <figure className="cfr-image">
      <img src={section.image.src} alt={section.image.alt ?? ""} />
      {section.image.caption ? <figcaption>{section.image.caption}</figcaption> : null}
    </figure>
  );
}

function SectionBody({ section }: { section: FormSection }) {
  switch (section.layout) {
    case "grid":
      return <GridBody section={section} />;
    case "checklist":
      return <ChecklistBody section={section} />;
    case "attestation":
      return <AttestationBody section={section} />;
    case "table":
      return <TableBody section={section} />;
    case "matrix":
      return <MatrixBody section={section} />;
    case "narrative":
      return <NarrativeBody section={section} />;
    case "image":
      return <ImageBody section={section} />;
    case "signature":
      return <GridBody section={section} />;
    default:
      return null;
  }
}

export function ControlledFormRenderer({ form }: { form: FormContent }) {
  return (
    <div className="cfr-body">
      {form.sections.map((section, index) => (
        <section
          key={`${section.title}-${index}`}
          className={`cfr-section cfr-section-${section.layout} ${
            section.layout === "signature" ? "cfr-section-signature-block" : ""
          }`}
        >
          <h3 className="cfr-section-title">
            <span className="cfr-section-badge">{index + 1}</span>
            {section.title}
          </h3>
          {section.description ? (
            <p className="cfr-section-desc">{section.description}</p>
          ) : null}
          {section.sectionAck ? (
            <p className="cfr-section-ack">
              This section requires a completion acknowledgment before the form
              may be filed.
            </p>
          ) : null}
          <SectionBody section={section} />
        </section>
      ))}
    </div>
  );
}
