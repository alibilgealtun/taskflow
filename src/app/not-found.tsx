import { ErrorState } from '@/components/ui/error-state';
import { getErrorMessage } from '@/lib/error-messages';

export default function RootNotFound() {
  return (
    <ErrorState
      layout="page"
      icon="notFound"
      title="Page Not Found"
      message={getErrorMessage('general/not-found')}
      action={{ label: 'Return to Tasks', href: '/tasks' }}
    />
  );
}
