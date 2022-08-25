import * as Sentry from '@sentry/node';

// Importing @sentry/tracing patches the global hub for tracing to work.
import '@sentry/tracing';

// If you want to use `@sentry/tracing` in your project directly, use a named import instead:
// import * as SentryTracing from "@sentry/tracing"
// Unused named imports are not guaranteed to patch the global hub.

Sentry.init({
	dsn: 'https://e9784958283b41f1ab7c8b41f7c2d652@o1091405.ingest.sentry.io/6683210',
	integrations: [
		// enable HTTP calls tracing
		new Sentry.Integrations.Http({ tracing: true })
	],
	// We recommend adjusting this value in production, or using tracesSampler
	// for finer control
	tracesSampleRate: 1.0
});
const transaction = Sentry.startTransaction({
	op: 'transaction',
	name: 'My Transaction'
});
// Note that we set the transaction as the span on the scope.
// This step makes sure that if an error happens during the lifetime of the transaction
// the transaction context will be attached to the error event
Sentry.configureScope((scope) => {
	scope.setSpan(transaction);
});
