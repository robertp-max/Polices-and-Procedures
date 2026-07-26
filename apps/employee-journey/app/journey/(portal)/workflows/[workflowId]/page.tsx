import { WorkflowDetail } from "../../../_components/WorkflowDetail";

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ workflowId: string }>;
}) {
  const { workflowId } = await params;
  return <WorkflowDetail workflowId={workflowId} />;
}
