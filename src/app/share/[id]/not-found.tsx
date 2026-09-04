import { ErrorState } from '@/components/ui/error-state';
import { getErrorMessage } from '@/lib/error-messages';

export default function ShareNotFound() {
  return (
    <ErrorState
      layout="page"
      icon="lock"
      title="List Not Available"
      message={getErrorMessage('share/not-available')}
      action={{ label: 'Go to TaskFlow', href: '/login' }}
    />
  );
}
