"use client";

import { Drawer } from "./ui";

export function PreviewDrawer({
  open,
  onClose,
  title,
  acceptedFormats,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  acceptedFormats: string;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Renew ${title}`}
      description="UI-only document renewal preview"
      className="preview-drawer"
    >
      <div className="preview-callout" role="note">
        <strong>Synthetic preview</strong>
        <p>Files are not transmitted or stored.</p>
      </div>

      <form
        className="renewal-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <label>
          Document family
          <input type="text" value={title} readOnly />
        </label>
        <label>
          Synthetic expiration date
          <input type="date" defaultValue="2027-08-15" />
        </label>
        <label>
          Select a local preview file
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
          <span>Preview formats: {acceptedFormats}. Files are not transmitted or stored.</span>
        </label>
        <label>
          Optional preview note
          <textarea
            rows={4}
            placeholder="Add a note visible only during this UI session."
          />
        </label>
        <button className="button button-primary" type="submit">
          Review preview
        </button>
      </form>

      <p className="drawer-final-message">
        UI preview only — no document was submitted.
      </p>
    </Drawer>
  );
}
