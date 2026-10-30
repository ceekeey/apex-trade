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

- [ ] Read all six context documents.
- [ ] Inspect root and client package manifests/lockfiles.
- [ ] Confirm Node.js/npm versions and module system.
- [ ] Inspect existing frontend and backend files.
- [ ] Inspect `server/app.js` and current scripts.
- [ ] Inspect Git status and `.gitignore`.
- [ ] Identify environment variable names without exposing values.
- [ ] Record baseline frontend lint/build results.
- [ ] Identify current test runner and baseline tests.
- [ ] Present a plan to consolidate dependencies/scripts into the root package.
- [ ] Do not delete `client/package.json` or its lockfile until the root setup is verified.

## Milestone 1 — Root package and backend foundation

- [ ] Consolidate client and server dependencies into root `package.json`.
- [ ] Define root scripts for client dev/build/lint and server dev/start/test.
- [ ] Generate one root lockfile.
- [ ] Verify frontend install, lint and production build.
- [ ] Retire nested client manifest/lockfile only after successful verification.
- [ ] Create the modular server source structure incrementally.
- [ ] Validate environment variables.
- [ ] Separate Express app creation from server startup.
- [ ] Configure Express 5, Helmet, explicit CORS and request-size limits.
- [ ] Configure MySQL/Sequelize connection.
- [ ] Add readiness/health endpoint.
- [ ] Add 404 and centralized error handlers.
- [ ] Add graceful shutdown.
- [ ] Add focused foundation tests.
- [ ] Preserve frontend source and behavior.

## Milestone 2 — Email infrastructure

- [ ] Configure SMTP through validated environment variables.
- [ ] Implement reusable Nodemailer service.
- [ ] Add verification, password-reset and welcome templates as required.
- [ ] Handle delivery errors safely.
- [ ] Test transporter/configuration without exposing credentials.

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

### Milestone:
### Date:

**Implemented**
- 

**Files created**
- 

**Files modified**
- 

**Dependencies changed**
- 

**Commands/tests executed**
- 

**Results**
- Passed:
- Failed:
- Not run / blocked:

**Known issues and security considerations**
- 

**Next proposed milestone**
- 

## Current progress

- Milestone 0: Not started.
- Milestone 1: Not started.
- Milestones 2–9: Not started.
