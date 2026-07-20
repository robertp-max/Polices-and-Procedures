import { ShieldCheck } from "lucide-react";

interface GaoNodeCompletionProps {
  label: string;
  onReview: () => void;
}

export function GaoNodeCompletion({ label, onReview }: GaoNodeCompletionProps) {
  return (
    <div className="gao-node-completion" role="status">
      <div className="gao-node-completion-icon" aria-hidden="true">
        <ShieldCheck size={26} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-extrabold text-[#0F5B54]">{label}</div>
        <p className="mt-1 text-xs leading-relaxed text-[#475569]">
          Knowledge practice only — formal assessment remains separate.
        </p>
      </div>
      <button type="button" onClick={onReview} className="gao-node-review-button">
        Review scene
      </button>
    </div>
  );
}
