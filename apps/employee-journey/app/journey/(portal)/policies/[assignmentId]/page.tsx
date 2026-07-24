import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  buildPolicyPlayerViewModel,
  findAssignment,
} from "../../../_lib/policyAssignmentView";
import { PolicyLearningPlayer } from "../../../_components/PolicyLearningPlayer";
import { PageHeader } from "../../../_components/shared";

export default async function PolicyAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId: rawAssignmentId } = await params;
  const assignmentId = decodeURIComponent(rawAssignmentId);
  const assignment = findAssignment(assignmentId);

  if (!assignment) {
    return (
      <div className="workspace">
        <PageHeader
          eyebrow="POLICIES"
          title="Assignment not found"
          description="This policy assignment id does not match any record in the current mapping data."
        />
        <div className="empty-state">
          <strong>No matching assignment</strong>
          <p className="no-action-copy">
            &ldquo;{assignmentId}&rdquo; is not a known assignment id in the
            generated policy assignment map.
          </p>
          <p>
            <Link className="text-link" href="/journey/policies">
              <ArrowLeft aria-hidden="true" />
              Back to policy actions
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const data = buildPolicyPlayerViewModel(assignment);
  return <PolicyLearningPlayer data={data} />;
}
