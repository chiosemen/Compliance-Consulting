/**
 * Sentry Edge Configuration
 * This file configures error monitoring for edge runtime (middleware, edge functions)
 *
 * To enable Sentry, set the NEXT_PUBLIC_SENTRY_DSN environment variable
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Get DSN from environment variable
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment configuration
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
});
