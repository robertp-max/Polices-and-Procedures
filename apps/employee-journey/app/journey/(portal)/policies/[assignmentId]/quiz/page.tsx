import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { buildQuizViewModel } from "../../../../_lib/policyQuizAccess";
import { QuizPlayer } from "../../../../_components/QuizPlayer";

export default async function PolicyQuizPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const model = buildQuizViewModel(assignmentId);

  if (model.kind === "assignment_not_found") {
    return (
      <div className="workspace">
        <section className="quiz-card quiz-locked" role="alert">
          <AlertTriangle aria-hidden="true" />
          <div>
            <p className="eyebrow">REVIEW_REQUIRED</p>
            <h1>Assignment not recognized</h1>
            <p>
              &quot;{model.assignmentId}&quot; does not match a known policy
              assignment in the generated matrix. No quiz can be shown for an
              unrecognized assignment id. This is a data-mapping conflict,
              not a missed employee task — no employee action is required.
            </p>
            <Link className="button button-secondary" href="/journey/policies">
              Return to policy actions
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return <QuizPlayer model={model} />;
}
