/**
 * Sentry Client Configuration
 * This file configures error monitoring for the browser/client-side
 *
 * To enable Sentry, set the NEXT_PUBLIC_SENTRY_DSN environment variable
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  // Get DSN from environment variable
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // We recommend adjusting this value in production.
  // In development, you may want to set it to 0 to avoid noise.
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay configuration for session replay
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes here
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out specific errors
  beforeSend(event, hint) {
    // Filter out network errors and other noise
    const error = hint.originalException;

    if (error && typeof error === 'object') {
      const errorMessage = 'message' in error ? error.message : '';

      // Filter common false positives
      if (
        typeof errorMessage === 'string' &&
        (errorMessage.includes('ResizeObserver') ||
         errorMessage.includes('cancelled') ||
         errorMessage.includes('aborted'))
      ) {
        return null;
      }
    }

    return event;
  },

  // Environment configuration
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
});
