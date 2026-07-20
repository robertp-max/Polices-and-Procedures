import type { GaoProcessNote } from "../../../data/gaoNodes";

export function GaoProcessNoteView({ note }: { note: GaoProcessNote }) {
  const style =
    note.placement.type === "point"
      ? { left: `${note.placement.x}%`, top: `${note.placement.y}%` }
      : undefined;

  return (
    <div
      id={`gao-process-note-${note.id}`}
      role="note"
      className={`gao-process-note gao-process-note-${note.placement.type}`}
      style={style}
    >
      <strong>{note.title}</strong>
      <span>{note.body}</span>
    </div>
  );
}
