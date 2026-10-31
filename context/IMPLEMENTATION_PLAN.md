# Apex Trade — Implementation Roadmap

## Project status

- Backend framework: Node.js + Express 5
- Database: MySQL + Sequelize 6
- Language/module system: JavaScript ES Modules
- Frontend: existing React + Vite app in `client/`
- Package goal: one root `package.json` and root `package-lock.json`
- Screenshot rule: four required screenshot slots before a trade can be marked complete

No milestone is complete without implementation evidence and actual test results.

## Milestone 0 — Repository inspection and package consolidation plan

- [x] Read all six context documents.
- [x] Inspect root and client package manifests/lockfiles.
- [x] Confirm Node.js/npm versions and module system.
- [x] Inspect existing frontend and backend files.
- [x] Inspect `server/app.js` and current scripts.
- [x] Inspect Git status and `.gitignore`.
- [x] Identify environment variable names without exposing values.
- [x] Record baseline frontend lint/build results.
- [x] Identify current test runner and baseline tests.
- [x] Present a plan to consolidate dependencies/scripts into the root package.
- [x] Do not delete `client/package.json` or its lockfile until the root setup is verified.

## Milestone 1 — Root package and backend foundation

- [x] Consolidate client and server dependencies into root `package.json`.
- [x] Define root scripts for client dev/build/lint and server dev/start/test.
- [x] Generate one root lockfile.
- [x] Verify frontend install, lint and production build.
- [ ] Retire nested client manifest/lockfile only after successful verification. *(Incomplete: nested client package files remain on disk and are still invoked by root scripts)*
- [x] Create the modular server source structure incrementally.
- [x] Validate environment variables.
- [x] Separate Express app creation from server startup.
- [x] Configure Express 5, Helmet, explicit CORS and request-size limits.
- [x] Configure MySQL/Sequelize connection. *(Note: Configuration, pool settings, and connection close verified; live database connection skipped because local MySQL service is offline)*
- [x] Add readiness/health endpoint.
- [x] Add 404 and centralized error handlers.
- [x] Add graceful shutdown.
- [x] Add focused foundation tests.
- [x] Preserve frontend source and behavior.

## Milestone 2 — Email infrastructure

- [x] Configure SMTP through validated environment variables.
- [x] Implement reusable Nodemailer service.
- [x] Add verification, password-reset and welcome templates as required.
- [x] Handle delivery errors safely.
- [x] Test transporter/configuration without exposing credentials.

## Milestone 3 — Authentication and account security

- [ ] Finalize authentication/session architecture.
- [ ] Create user/session/token migrations and models.
- [ ] Implement registration and password hashing.
- [ ] Implement email verification with hashed, expiring, one-time tokens.
- [ ] Implement login and logout/revocation.
- [ ] Implement refresh rotation/reuse detection if refresh tokens are selected.
- [ ] Implement password reset/change with one-time hashed tokens.
- [ ] Add authentication and ownership middleware.
- [ ] Add rate limits and CSRF protection where applicable.
- [ ] Add integration and security regression tests.

## Milestone 4 — Authentication security audit

- [ ] Review JWT validation and secret handling.
- [ ] Review expiry, rotation, revocation and logout.
- [ ] Review verification/reset token single-use behavior.
- [ ] Review rate limits, CORS, cookies and CSRF.
- [ ] Test account enumeration behavior.
- [ ] Test horizontal privilege escalation.
- [ ] Fix findings and rerun regression tests.

## Milestone 5 — Trading accounts, instruments and strategies

- [ ] Confirm account, instrument and strategy requirements.
- [ ] Define ownership and supported fields.
- [ ] Create migrations/models/associations.
- [ ] Implement CRUD endpoints and validation.
- [ ] Enforce ownership.
- [ ] Add integration tests.

## Milestone 6 — Trade journal core

- [ ] Confirm trade fields and status lifecycle with frontend.
- [ ] Define supported instrument-specific P/L calculation rules.
- [ ] Decide whether partial exits are supported.
- [ ] Create trade migrations/models.
- [ ] Implement create/list/detail/update/delete.
- [ ] Add filtering, sorting and pagination.
- [ ] Implement journal notes/psychology fields as approved.
- [ ] Enforce ownership and account relationship integrity.
- [ ] Test decimal precision and financial calculations.
- [ ] Add integration tests.

## Milestone 7 — Four screenshots per trade (core requirement)

Required slot keys and labels:
1. `market_context` — Market context / HTF bias
2. `setup_poi` — Setup / POI
3. `entry_execution` — Entry execution / confirmation
4. `trade_outcome` — Trade outcome / exit

- [ ] Confirm accepted image formats, maximum size and storage provider.
- [ ] Implement private storage adapter (local development first if appropriate).
- [ ] Create screenshot metadata migration/model.
- [ ] Enforce unique `(tradeId, slot)`.
- [ ] Implement authenticated upload per slot.
- [ ] Implement list/view/download with ownership checks.
- [ ] Implement safe replacement and deletion.
- [ ] Validate file signatures, size and image formats.
- [ ] Keep files outside public static directories.
- [ ] Add orphan/temp-file cleanup strategy.
- [ ] Allow incomplete/draft trades to have fewer than four screenshots.
- [ ] Block transition to complete unless all four valid slots exist.
- [ ] Return missing slot details when completion is blocked.
- [ ] Test missing slots, duplicate slot, wrong owner, invalid file, oversized file, replacement, deletion and storage/DB failures.
- [ ] Test race conditions around completion and screenshot replacement/deletion.

## Milestone 8 — Analytics

- [ ] Define win rate, profit factor, gross/net profit, expectancy, average R and drawdown.
- [ ] Define handling of open trades, partial closes, fees and account currency.
- [ ] Implement shared decimal-safe calculation services.
- [ ] Add date/account/instrument/strategy filters.
- [ ] Enforce owner scoping.
- [ ] Add unit tests with known expected results and edge cases.

## Milestone 9 — Final audit and deployment preparation

- [ ] Full frontend lint/build and backend test suite.
- [ ] Authentication/authorization audit.
- [ ] Database and migration audit.
- [ ] Financial calculation audit.
- [ ] Screenshot upload/storage/access audit.
- [ ] Dependency vulnerability review.
- [ ] API and environment documentation.
- [ ] Production storage and backup/recovery plan.
- [ ] Deployment configuration review.
- [ ] Verify no secrets or private screenshots are committed.

## Working rules

1. Work on one milestone at a time.
2. Inspect before editing.
3. Preserve frontend source and existing working behavior.
4. Do not delete nested package files until package consolidation is verified.
5. Do not invent product fields, statuses, P/L formulas or cloud providers.
6. Never mark a trade complete without all four valid screenshot slots.
7. Never mark a milestone complete without running its tests.
8. Update this roadmap with actual evidence, not intentions.
9. Ask the user when an unresolved decision blocks safe implementation.

## Milestone completion report

### Milestone: Milestone 0 (Completed) / Milestone 1 (In Progress Audit)
### Date: 2026-10-30

**Implemented**
- Completed repository-wide inspection of package manifests, lockfiles, Node.js/npm environments, and directory structure.
- Consolidated client and server dependencies and devDependencies into the single root `package.json`.
- Defined root scripts for client dev/build/lint/preview and server dev/start/test.
- Generated single root `package-lock.json` managing both client and server trees.
- Created modular backend structure under `server/src/`:
  - `server/src/app.js` (Express 5 app factory without listening; Helmet, explicit CORS origin allowlist, 10kb body parser limits, cookie-parser, health routing, 404 handler, centralized error handler).
  - `server/src/server.js` (Environment validation, graceful shutdown handling SIGINT/SIGTERM with connection cleanup and timeout protection).
  - `server/src/config/` (`env.js` with Zod validation protecting secrets, `database.js` with Sequelize connection pooling and disconnect routines, `cors.js` with allowlist enforcement).
  - `server/src/database/models/index.js` (Central model registry).
  - `server/src/middlewares/` (`notFoundHandler.js` for 404 responses, `errorHandler.js` for sanitized error formatting and production stack masking).
  - `server/src/routes/health.routes.js` (`GET /health` process uptime and `GET /ready` database status check without credential leaks).
  - `server/app.js` (Backwards-compatibility entry point re-exporting `createApp` and `app`).
- Maintained client stability: `npm run lint:client` and `npm run build:client` verified passing.
- Implemented 14 automated backend unit, security, and integration tests using Node.js built-in test runner.

**Files created**
- `.env.example`
- `server/src/app.js`
- `server/src/server.js`
- `server/src/config/cors.js`
- `server/src/config/database.js`
- `server/src/config/env.js`
- `server/src/database/models/index.js`
- `server/src/middlewares/errorHandler.js`
- `server/src/middlewares/notFoundHandler.js`
- `server/src/routes/health.routes.js`
- `server/tests/unit/database.test.js`
- `server/tests/unit/env.test.js`
- `server/tests/security/cors.test.js`
- `server/tests/integration/error-handling.test.js`
- `server/tests/integration/health.test.js`
- `server/tests/integration/mysql-live.test.js`

**Files modified**
- `package.json`
- `package-lock.json`
- `server/app.js`
- `.gitignore`
- `context/IMPLEMENTATION_PLAN.md`

**Dependencies changed**
- Added to root: client dependencies (`@hookform/resolvers`, `axios`, `browser-image-compression`, `date-fns`, `framer-motion`, `lucide-react`, `react`, `react-dom`, `react-dropzone`, `react-hook-form`, `react-hot-toast`, `react-router-dom`, `recharts`, `sweetalert2`, `tailwindcss`, `zod`, `@eslint/js`, `@tailwindcss/vite`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `vite`).

**Commands/tests executed**
- `node -v` (v26.13.0)
- `npm -v` (11.20.0)
- `npm run test:server`
- `npm run lint:client`
- `npm run build:client`
- `git status`
- `git ls-files -s .env*`
- `git check-ignore -v .env .env.local .env.example`

**Results**
- Passed:
  - Backend tests (`npm run test:server`): 13 passed (unit: env, database; security: cors; integration: error-handling, health).
  - Frontend lint (`npm run lint:client`): 0 errors, 0 warnings.
  - Frontend production build (`npm run build:client`): 16 modules transformed, built in 3.56s.
- Failed: 0
- Not run / blocked:
  - 1 backend test skipped (`server/tests/integration/mysql-live.test.js`) because local MySQL service is offline.

**Known issues and security considerations**
- Nested `client/package.json` and `client/package-lock.json` have not yet been retired; root scripts still invoke `npm --prefix client ...`.
- Historical secret exposure: commit `46dd2ae` contained `.env.local` in Git history. While untracked locally and committed as removed in `fd7eec2`, commit `46dd2ae` remains in reachable remote history. Credentials present in that commit must be rotated, and history should be rewritten/purged if approved.
- Live MySQL connection is unverified because MySQL service is currently stopped/unavailable.

**Next proposed milestone**
- Complete Milestone 1 by verifying live MySQL connectivity and retiring nested client package manifests/lockfiles once scripts are updated.

## Current progress

- **Milestone 0 status:** Completed. Repository inspection, environment inventory, baseline checks, and package consolidation plan fully verified.
- **Milestone 1 status:** In Progress. Backend foundation, Express 5 modular architecture, Zod env validation, security headers, CORS allowlist, request limits, error handling, health/readiness endpoints, graceful shutdown, and 13 automated tests are verified. Milestone remains open pending live MySQL database verification (the configured `apex_trade` database is currently missing) and safe retirement of nested client package files (`client/package.json`, `client/package-lock.json`).
- **Milestone 2 status:** In Progress. The SMTP validation, reusable Nodemailer service, three HTML/plain-text templates, safe errors and mocked tests are implemented. The expected local mailbox configuration is not active: `.env.local` is currently absent, and the non-secret `SMTP_HOST`/`SMTP_FROM` settings in `.env` do not match the supplied mailbox values. Local environment files were not changed.
- **Milestones 3–9 status:** Not started.
- **Milestone 1 test results:** `npm run test:server` previously executed 14 tests — 13 passed, 0 failed, 1 skipped (`MySQL Live Integration Test`).
- **Milestone 2 test results:** `npm run test:server` executed 32 tests — 31 passed, 0 failed, 1 skipped (`MySQL Live Integration Test`). `npm run lint:client` and `npm run build:client` passed.
- **Known issues:**
  - The MySQL server responds, but the live integration test skips because the configured database `apex_trade` does not exist.
  - Nested client package files (`client/package.json`, `client/package-lock.json`) are preserved but not yet retired; root scripts still reference `npm --prefix client`.
- **Security remediation status:**
  - `.env.local` local tracking: Untracked (`git ls-files .env.local` returns empty).
  - `.gitignore` rules: Correctly ignoring `.env` and `.env.*`; explicitly keeping `!.env.example` trackable.
  - Remote removal: Committed in `fd7eec2` ("security: stop tracking local environment file") and pushed to `origin/main`.
  - Historical exposure: Commit `46dd2ae` retains `.env.local` in reachable Git history.
  - Credential status: Any secrets contained in commit `46dd2ae` must be considered exposed and rotated immediately.
  - History purge: Requires git history rewriting (e.g. `git filter-repo`) and coordinated force-push once approved.
- **Next proposed action:**
  - Provision the configured MySQL database, rerun `server/tests/integration/mysql-live.test.js` and validate `/ready`; retire nested client package files only after the package migration is approved and verified.

## Milestone 2 implementation report — Email infrastructure

**Date:** 2026-10-31

**Status:** Implementation and automated testing are complete; the milestone remains open until the expected local mailbox configuration is restored and the user approves any real SMTP verification.

**Implemented**
- Validated SMTP host, integer port, secure boolean, credentials and sender format when SMTP is configured. Port 465 requires implicit TLS (`SMTP_SECURE=true`); password whitespace is preserved.
- Added one lazily initialized reusable Nodemailer transporter, transporter verification and validated email sending with the configured sender as default.
- Added verification, password-reset and welcome email templates in HTML and plain text. Dynamic HTML values are escaped, and action URLs are restricted to HTTP(S).
- Added safe configuration, connection, authentication and delivery errors with limited diagnostics; message bodies, credentials and token values are not logged or returned.
- Updated `.env.example` with the supplied non-secret mailbox settings and a password placeholder.

**Evidence**
- `npm run test:server`: 32 tests — 31 passed, 0 failed, 1 skipped because the configured MySQL database `apex_trade` does not exist. Email transport and delivery tests use mocks only.
- `npm run lint:client`: passed.
- `npm run build:client`: passed.
- Nodemailer was already in the root dependencies; no dependency or lockfile change was required.

**SMTP test status**
- Configuration validation: tested.
- Transporter creation and reuse: tested with a mock transport.
- Mocked sending and failure handling: tested.
- Real SMTP connection: not attempted.
- Actual email delivery: not attempted; no email was sent.
- Runtime configuration: `.env.local` is currently absent. The `SMTP_HOST` and `SMTP_FROM` values in `.env` do not match the supplied configuration. Actual values were not displayed or changed.

**Optional manual SMTP verification (requires explicit user approval)**

After correcting the active runtime SMTP configuration and receiving user approval, an operator can verify the SMTP connection without sending a message. The current loader gives `.env` precedence over `.env.local`, so settings in `.env.local` will not override values already loaded from `.env`.

```powershell
node --input-type=module -e "import { verifyEmailTransporter } from './server/src/services/email.service.js'; await verifyEmailTransporter(); console.log('SMTP verification succeeded');"
```

This performs a real SMTP connection/authentication check. It is separate from the automated mocked tests and does not send an email.

**Incomplete requirements**
- The expected local SMTP configuration is not active; `.env.local` is absent and `.env` has mismatched non-secret host/sender settings.
- No real SMTP verification or delivery was performed; verification requires explicit approval for live mailbox/network access.
- The MySQL live test was skipped because the database is missing; the server responded with `Unknown database 'apex_trade'`.
- Milestone 1 remains in progress for its separately documented database and package-file follow-ups.

**Next proposed milestone:** Milestone 3 — Authentication and Account Security. Wait for user review and approval before proceeding.
