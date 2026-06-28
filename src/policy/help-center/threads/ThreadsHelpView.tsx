import { useNavigate } from 'react-router-dom';
import { ThreadsPage } from './ThreadsPage';
import { ThreadDetailPage } from './ThreadDetailPage';
import { ThreadComposer } from './ThreadComposer';

/**
 * Routes the Threads sub-surface that lives under the Help Center `/help/*`
 * splat (no new top-level routes are registered):
 *   /help/threads          → list
 *   /help/threads/new       → composer
 *   /help/threads/:threadId → detail
 */
export function ThreadsHelpView({ splat }: { splat: string }) {
  const navigate = useNavigate();
  const rest = splat.replace(/^threads\/?/, '');
  const segment = rest.split('/')[0] ?? '';

  const openThread = (id: string) => navigate(`/help/threads/${id}`);
  const openList = () => navigate('/help/threads');
  const startThread = () => navigate('/help/threads/new');

  if (segment === 'new') {
    return (
      <ThreadComposer
        source={{ kind: 'general' }}
        defaultType="general_question"
        defaultCategory="other"
        onDone={openThread}
        onCancel={openList}
      />
    );
  }

  if (segment) {
    return (
      <ThreadDetailPage
        threadId={segment}
        onBack={openList}
        onOpenThread={openThread}
        onOpenRoute={route => navigate(route)}
      />
    );
  }

  return <ThreadsPage onOpenThread={openThread} onStartThread={startThread} />;
}

export default ThreadsHelpView;
