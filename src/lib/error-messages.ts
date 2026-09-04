/**
 * Centralized error messages for the TaskFlow application.
 *
 * Every user-facing error string lives in this file. Components and server
 * actions import from here instead of writing ad-hoc text. The
 * `mapSupabaseError` function converts raw Supabase error strings into the
 * matching user-friendly message.
 */

// ---------------------------------------------------------------------------
// Message map
// ---------------------------------------------------------------------------

export const ERROR_MESSAGES = {
  // Auth
  'auth/invalid-credentials': 'The email or password is incorrect.',
  'auth/email-not-confirmed':
    'Check your inbox. Confirm your email before you sign in.',
  'auth/user-already-registered':
    'An account with this email already exists.',
  'auth/weak-password':
    'The password is too weak. Use at least 6 characters.',
  'auth/rate-limit': 'Too many attempts. Wait a moment and try again.',
  'auth/callback-failed':
    'The sign-in link expired or is invalid. Sign in with your email and password.',
  'auth/signup-disabled':
    'New registrations are not available at this time.',
  'auth/session-expired':
    'Your session expired. Sign in again to continue.',
  'auth/logout-failed': 'Sign-out failed. Try again or clear your cookies.',

  // Task
  'task/not-found': 'This task does not exist or was already deleted.',
  'task/save-failed': 'The task could not be saved. Try again.',
  'task/delete-failed': 'The task could not be deleted. Try again.',
  'task/load-failed': 'Your tasks could not be loaded. Try again.',

  // Share
  'share/create-failed': 'The share link could not be created. Try again.',
  'share/update-failed':
    'The share setting could not be updated. Try again.',
  'share/load-failed': 'The shared tasks could not be loaded. Try again.',
  'share/not-available':
    'This shared list does not exist, or the owner turned off sharing.',

  // Clipboard
  'clipboard/copy-failed':
    'The link could not be copied. Copy it manually from the text field.',

  // Realtime
  'realtime/disconnected':
    'Live updates lost connection. The page will retry automatically.',

  // Validation
  'validation/invalid-input':
    'Some fields contain invalid data. Fix the marked fields and try again.',

  // General
  'general/not-authenticated':
    'You are not signed in. Sign in to continue.',
  'general/not-found':
    'The page you requested does not exist or was moved.',
  'general/unexpected':
    'Something went wrong. Try again or reload the page.',
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

/** Return the user-facing message for a known error code. */
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code];
}

// ---------------------------------------------------------------------------
// Supabase error mapping
// ---------------------------------------------------------------------------

type ErrorDomain = 'auth' | 'task' | 'share';

/**
 * Pattern table: each entry maps a substring or regex found in raw Supabase
 * error messages to a user-facing error code.
 */
const SUPABASE_AUTH_PATTERNS: ReadonlyArray<
  readonly [pattern: RegExp, code: ErrorCode]
> = [
  [/invalid login credentials/i, 'auth/invalid-credentials'],
  [/email not confirmed/i, 'auth/email-not-confirmed'],
  [/user already registered/i, 'auth/user-already-registered'],
  [/already been registered/i, 'auth/user-already-registered'],
  [/password.*(?:too short|at least|weak)/i, 'auth/weak-password'],
  [/rate limit/i, 'auth/rate-limit'],
  [/too many requests/i, 'auth/rate-limit'],
  [/signups.*disabled/i, 'auth/signup-disabled'],
  [/signup.*disabled/i, 'auth/signup-disabled'],
  [/refresh_token.*not found/i, 'auth/session-expired'],
  [/token.*expired/i, 'auth/session-expired'],
  [/session.*expired/i, 'auth/session-expired'],
];

const SUPABASE_TASK_PATTERNS: ReadonlyArray<
  readonly [pattern: RegExp, code: ErrorCode]
> = [
  [/not found/i, 'task/not-found'],
];

const SUPABASE_SHARE_PATTERNS: ReadonlyArray<
  readonly [pattern: RegExp, code: ErrorCode]
> = [
  [/not found/i, 'share/not-available'],
];

const DOMAIN_PATTERNS: Record<
  ErrorDomain,
  ReadonlyArray<readonly [pattern: RegExp, code: ErrorCode]>
> = {
  auth: SUPABASE_AUTH_PATTERNS,
  task: SUPABASE_TASK_PATTERNS,
  share: SUPABASE_SHARE_PATTERNS,
};

const DOMAIN_FALLBACKS: Record<ErrorDomain, ErrorCode> = {
  auth: 'general/unexpected',
  task: 'task/save-failed',
  share: 'share/update-failed',
};

/**
 * Convert a raw Supabase error message into a user-friendly string.
 *
 * The function matches the raw message against known patterns for the given
 * domain. When no pattern matches, it returns the domain-level fallback
 * message. The raw message is never shown to the user.
 */
export function mapSupabaseError(
  rawMessage: string,
  domain: ErrorDomain
): string {
  const patterns = DOMAIN_PATTERNS[domain];

  for (const [pattern, code] of patterns) {
    if (pattern.test(rawMessage)) {
      return ERROR_MESSAGES[code];
    }
  }

  return ERROR_MESSAGES[DOMAIN_FALLBACKS[domain]];
}
