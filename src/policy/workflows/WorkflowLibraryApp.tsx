import { Navigate, Route, Routes, useParams, useSearchParams } from 'react-router-dom';
import { LandingView } from './components/LandingView';
import { QAWorkflow03SwimlanePage } from './components/QAWorkflow03SwimlanePage';
import { WorkflowDetailView } from './components/WorkflowDetailView';
import { SwimlaneRoutePage } from './swimlanes/SwimlaneRoutePage';
import { getWorkflowFilterState } from './workflowNav';

/* ══════════════════════════════════════════════════════════════════════
   WorkflowLibraryApp — mounted at `/workflows/*` inside the main
   CommandCenterLayout. The outer shell (hamburger, centered Care
   Indeed logo, search, help, user avatar, surrounding one-card frame)
   is provided by CommandCenterLayout, identical to every other page.

  This component only renders the workflow workspace itself. The shell
  owns the contextual sub-navigation so the workflow filters can live
  in the top bar instead of a second internal sidebar.
   ══════════════════════════════════════════════════════════════════════ */

export function WorkflowLibraryApp() {
  const [searchParams] = useSearchParams();
  const { selectedDomain, savedView } = getWorkflowFilterState(`?${searchParams.toString()}`);

  return (
    <div
      className="w-full h-full overflow-hidden bg-ci-bg text-ci-text-primary font-roboto"
    >
      <main className="w-full h-full min-w-0 overflow-hidden bg-ci-bg">
        <Routes>
          <Route
            index
            element={<LandingView selectedDomain={selectedDomain} savedView={savedView} />}
          />
          <Route path="QA-WF-03-swimlane" element={<QAWorkflow03SwimlanePage />} />
          <Route path="QA-WF-03/swimlane" element={<QAWorkflow03SwimlaneRedirect />} />
          <Route path=":workflowId/swimlane" element={<SwimlaneRoutePage />} />
          <Route path=":workflowId" element={<WorkflowDetailOrSwimlane />} />
        </Routes>
      </main>
    </div>
  );
}

function WorkflowDetailOrSwimlane() {
  const { workflowId } = useParams<{ workflowId: string }>();
  if (workflowId?.endsWith('-swimlane')) return <SwimlaneRoutePage />;
  return <WorkflowDetailView />;
}

function QAWorkflow03SwimlaneRedirect() {
  const [searchParams] = useSearchParams();
  const suffix = searchParams.toString();
  return <Navigate to={`/workflows/QA-WF-03-swimlane${suffix ? `?${suffix}` : ''}`} replace />;
}
