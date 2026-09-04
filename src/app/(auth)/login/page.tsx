import { LoginForm } from '@/features/auth/components/login-form';

interface LoginPageProps {
  searchParams: Promise<{ error?: string | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  let initialError: string | undefined;
  if (error === 'auth_callback_failed') {
    initialError = 'Authentication link expired or failed. Please sign in with your email and password.';
  } else if (error) {
    initialError = 'Authentication error. Please try again.';
  }

  return <LoginForm initialError={initialError} />;
}
