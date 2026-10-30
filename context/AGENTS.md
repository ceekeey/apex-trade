# Apex Trade — Agent Operating Rules

## 1. Mission

Build a secure, maintainable trading journal and performance-analysis application. Apex Trade is a record-keeping and education tool; it does not execute trades, hold customer funds, or connect to a broker for order placement unless the owner explicitly approves a future scope change.

These instructions apply to the whole repository. The six project context documents live in `context/`, not in `server/`.

## 2. Mandatory inspection before changes

Before editing code or configuration:

1. Read all six context documents:
   - `context/AGENTS.md`
   - `context/PROJECT_CONTEXT.md`
   - `context/ARCHITECTURE.md`
   - `context/SECURITY.md`
   - `context/DATABASE.md`
   - `context/IMPLEMENTATION_PLAN.md`
2. Read `context/phase/01-folder-setup.md` when working on the initial setup phase.
3. Inspect the root and `client/` package manifests and lockfiles.
4. Inspect the current repository tree, existing source, tests, environment-variable names (never print secret values), `.gitignore`, and Git status.
5. Confirm the installed Node.js/npm versions and the actual module system.
6. Identify existing behavior, unfinished files, risks, missing dependencies, and any mismatch between this documentation and the repository.
7. Present findings and a bounded implementation plan before making significant changes.

Do not assume a file is empty or safe to replace just because its name suggests it. Do not expose `.env` values in reports.

## 3. Approved technology decisions

Current backend direction:
- Node.js
- Express 5
- MySQL
- Sequelize 6
- JavaScript ES Modules
- Zod validation
- bcrypt password hashing
- JWT/session authentication (final lifecycle to be designed and reviewed)
- Nodemailer over SMTP
- Multer for multipart upload handling
- Helmet, CORS, express-rate-limit, cookie-parser

The current root `package.json` is ES Module configured. The uploaded project also contains a separate `client/package.json` and `client/package-lock.json`. The desired end state is one root package manifest and one root lockfile for the monorepo. Consolidation is a planned, controlled task: preserve all client and server dependencies/scripts, verify frontend lint/build and backend tests, and only then retire the nested client manifest/lockfile. Never delete them before successful verification.

Do not introduce MongoDB, Mongoose, TypeScript, a second package manager, or an unapproved framework without explicit approval. Check installed dependencies before adding packages.

## 4. Repository boundaries

Expected top-level layout:
- `client/`: existing React + Vite frontend. Preserve its behavior and styling.
- `server/`: Express + Sequelize backend.
- `context/`: project instructions, architecture, security, database and implementation plan.
- Root `package.json` and root lockfile: the single package configuration after the controlled consolidation.

Do not move or rewrite frontend code as part of backend work. A package-manifest consolidation may touch root/client package metadata and lockfiles, but must not change frontend source files. Keep the existing `server/app.js` compatibility/entry-point behavior in mind; inspect it before replacing or relocating it.

## 5. Architecture and code quality

- Use modular MVC with a service layer.
- Keep controllers focused on HTTP input/output.
- Put business rules in services.
- Keep persistence logic in Sequelize models/repositories.
- Validate request bodies, params, queries and relevant environment variables with Zod.
- Use centralized error handling and consistent API response conventions.
- Prefer small, readable modules over speculative abstractions.
- Use async/await and handle rejected promises.
- Do not duplicate financial formulas or ownership checks across controllers.

## 6. Trade screenshot requirement — mandatory product rule

Every trade has four named screenshot slots:

1. `market_context` — Market context / HTF bias
2. `setup_poi` — Setup / POI
3. `entry_execution` — Entry execution / confirmation
4. `trade_outcome` — Trade outcome / exit

A trade may be saved as a draft/incomplete record while one or more screenshot slots are empty. A trade must not transition to the product's completed state until all four slots each contain one valid screenshot. The exact trade status vocabulary must be confirmed against the frontend/product requirements; do not invent a new status if one already exists.

Each slot holds one current image. Replacing a slot replaces its prior image safely. Enforce one screenshot per `(trade, slot)` in the database. Do not mark a trade complete merely because four upload requests were attempted: verify four persisted, valid slot records. The final screenshot is normally added after the trade closes.

Use private file/object storage. Store file metadata and a storage key in MySQL, not image bytes or arbitrary client-supplied paths. Screenshot access must authenticate the user and verify ownership through the associated trade. Do not expose permanent public URLs for private journal images.

## 7. Security baseline

- Hash passwords using bcrypt with an appropriate work factor.
- Never store plaintext passwords, raw reset tokens or raw refresh tokens.
- Design token expiry, rotation/revocation and logout behavior explicitly.
- Protect cookie-authenticated state-changing routes against CSRF.
- Use HttpOnly, Secure in production, and appropriate SameSite cookie settings.
- Use an explicit CORS allowlist; never combine wildcard origins with credentials.
- Apply rate limits to login, registration, verification, reset and upload endpoints.
- Validate all inputs and enforce ownership on every private resource.
- Use parameterized ORM queries; avoid raw SQL unless safely parameterized.
- Keep secrets out of source control and logs.
- Restrict upload size, count, MIME type and actual file signature; generate server-side names.
- Keep uploads outside publicly served static directories and serve them only through authorized routes.
- Do not trust original filenames, extensions, MIME headers, paths or client-supplied user IDs.
- Return safe production errors without stack traces or secrets.

See `context/SECURITY.md` for the detailed baseline.

## 8. Database and financial integrity

- Use Sequelize migrations for schema changes.
- Do not use `sequelize.sync({ force: true })` or `sequelize.sync({ alter: true })` as a production schema-management strategy.
- Use MySQL DECIMAL for financial values and decimal-safe calculations.
- Do not assume all instruments share the same contract size, tick value, multiplier, currency conversion or P/L formula.
- Use transactions for multi-record operations where atomicity matters.
- Enforce foreign keys, uniqueness and ownership constraints in the database as well as in application code.

## 9. Milestone discipline

Work only on the milestone requested:
1. Inspect.
2. Report findings and plan.
3. Implement the smallest complete scope.
4. Run focused tests and relevant regression tests.
5. Fix regressions caused by the changes.
6. Update `context/IMPLEMENTATION_PLAN.md` with evidence.
7. Report files, dependencies, tests, results, limitations and next step.

Do not begin the next milestone without the user's approval. Do not quietly expand scope.

## 10. Testing and truthful reporting

Test success, validation failures, authorization failures, boundary cases and security-sensitive behavior. For screenshot functionality, test missing slots, duplicate slots, invalid image bytes, oversized files, wrong-owner access, replacement, deletion cleanup, and completion blocked until all four valid slots exist.

Never claim tests passed unless they were actually executed. Distinguish tests not run from tests passed. Do not run destructive tests against production.

## 11. Environment and secrets

- Never overwrite `.env` or `.env.local`.
- Never print secret values.
- Maintain a safe `.env.example` containing names and placeholders only.
- Confirm `.env`, `.env.local`, uploads, logs, build output and local database files are ignored by Git as appropriate.
- If credentials are accidentally exposed, report the exposure and recommend rotation; do not repeat the values.

## 12. Required milestone report

Include:
- Milestone and date
- Findings / implementation summary
- Files created and modified
- Dependencies added or removed
- Commands and tests actually run
- Pass/fail/blocked results
- Security and data-migration considerations
- Known limitations
- Next proposed milestone

The goal is a reliable, secure and maintainable Apex Trade application while preserving existing working code.
