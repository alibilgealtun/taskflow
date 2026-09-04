import { LoginForm } from '@/features/auth/components/login-form';
import { getErrorMessage } from '@/lib/error-messages';

interface LoginPageProps {
  searchParams: Promise<{ error?: string | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  let initialError: string | undefined;
  if (error === 'auth_callback_failed') {
    initialError = getErrorMessage('auth/callback-failed');
  } else if (error) {
    initialError = getErrorMessage('general/unexpected');
  }

  return <LoginForm initialError={initialError} />;
}
