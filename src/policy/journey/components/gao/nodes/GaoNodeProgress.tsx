import { Eye } from "lucide-react";

interface GaoNodeProgressProps {
  completed: number;
  total: number;
}

export function GaoNodeProgress({ completed, total }: GaoNodeProgressProps) {
  return (
    <>
      <div className="gao-node-progress" aria-hidden="true">
        <Eye size={14} /> {completed} / {total} observed
      </div>
      <div className="gao-node-live" aria-live="polite" aria-atomic="true">
        {completed} of {total} scene nodes observed
      </div>
    </>
  );
}
