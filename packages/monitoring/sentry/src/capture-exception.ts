import * as Sentry from '@sentry/nextjs';

export function captureException(error: Error & { digest?: string }) {
  return Sentry.captureException(error);
}
