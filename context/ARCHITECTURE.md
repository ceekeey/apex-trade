# Apex Trade — Application and Backend Architecture

## 1. Repository architecture

Apex Trade is a small monorepo with separate source directories and one intended root package configuration.

```text
apex trade/
├── client/                 # Existing React + Vite app; preserve source
├── server/                 # Express API
│   └── src/
├── context/                # Project instructions and plans
├── .env                    # Local secrets; never commit
├── .env.local              # Local secrets; never commit
├── .env.example            # Safe placeholders only
├── package.json            # Single root manifest (target)
└── package-lock.json       # Single root lockfile (target)
```

Current-state caveat: the uploaded repository contains `client/package.json` and `client/package-lock.json` as well as the root files. The target is to consolidate into the root manifest/lockfile. This is a controlled migration, not an immediate deletion. Preserve all required client and server dependencies and scripts, verify builds/tests, then remove the nested files.

## 2. Backend architecture style

Use modular MVC plus a service layer:

- Routes define endpoints and middleware order.
- Controllers translate HTTP requests/responses.
- Services implement business rules and coordinate transactions.
- Models define Sequelize entities and associations.
- Repositories may be introduced when they reduce duplication or isolate complex queries; do not add a repository layer mechanically to every module.
- Validators define Zod schemas.
- Shared middleware handles authentication, authorization, validation, rate limiting and errors.
- Storage service abstracts private screenshot storage.
- Analytics services own shared financial/performance calculations.

Controllers must remain thin. Do not put financial formulas, upload lifecycle logic or multi-step transactions directly in route handlers.

## 3. Proposed backend structure

Create files incrementally as milestones require; this is a target, not a request to generate empty folders.

```text
server/
├── app.js                         # Optional compatibility entry during migration
├── src/
│   ├── app.js                     # Express app factory; no listen() call
│   ├── server.js                  # Startup, DB connection, graceful shutdown
│   ├── config/
│   │   ├── env.js
│   │   ├── database.js
│   │   ├── cors.js
│   │   └── mail.js
│   ├── database/
│   │   ├── models/
│   │   │   └── index.js
│   │   ├── migrations/
│   │   └── seeders/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── trading-accounts/
│   │   ├── instruments/
│   │   ├── strategies/
│   │   ├── trades/
│   │   ├── journal/
│   │   ├── trade-screenshots/
│   │   └── analytics/
│   ├── services/
│   │   ├── email/
│   │   │   └── templates/
│   │   └── storage/
│   ├── middlewares/
│   ├── utils/
│   └── constants/
└── tests/
    ├── unit/
    ├── integration/
    └── security/
```

A typical feature module may contain `*.routes.js`, `*.controller.js`, `*.service.js`, `*.model.js` only if model ownership belongs there, `*.validation.js`, and focused tests. Shared Sequelize model registration and migrations remain in the database layer. Avoid circular imports.

## 4. Root package scripts

The single root `package.json` should own client and server dependencies/scripts after consolidation. Example target scripts (adapt after inspecting current scripts and installed tools):

```json
{
  "scripts": {
    "dev:client": "npm --prefix client run dev",
    "dev:server": "nodemon server/src/server.js",
    "start:server": "node server/src/server.js",
    "build:client": "npm --prefix client run build",
    "lint:client": "npm --prefix client run lint",
    "test:server": "node --test"
  }
}
```

These are illustrative. Verify the actual test runner, Node version, Vite version and script behavior before applying. Do not add `concurrently` or another dependency just to run both processes unless approved. During migration, preserve working commands and document any command changes.

## 5. Express application lifecycle

`server/src/app.js` should create and configure the Express app and export it without listening on a port. It should configure, in a deliberate order:

1. Helmet/security headers.
2. Explicit CORS policy.
3. Request ID / safe request logging if approved.
4. JSON and URL-encoded parsers with small, justified limits.
5. Cookie parsing if the authentication design uses cookies.
6. API routes and route-specific rate limits.
7. Not-found handler.
8. Central error handler.

`server/src/server.js` should validate environment configuration, establish the database connection, start listening, and handle SIGTERM/SIGINT graceful shutdown. The existing `server/app.js` must be inspected; preserve a compatibility wrapper if needed while scripts are migrated.

Health endpoint should distinguish process health from database readiness without exposing secrets or detailed connection errors.

## 6. API conventions

- Prefix API routes consistently, e.g. `/api/v1`.
- Use plural resource paths and HTTP methods consistently.
- Validate params, query strings and bodies.
- Return stable response shapes and safe error codes.
- Use pagination for list endpoints.
- Do not return password hashes, token hashes, internal storage paths or secrets.
- Enforce ownership in the service/query, not only by hiding UI controls.
- Document status codes and validation errors.

## 7. Trade and screenshot domain design

A trade has four logical screenshot slots:

- `market_context`: Market context / HTF bias
- `setup_poi`: Setup / POI
- `entry_execution`: Entry execution / confirmation
- `trade_outcome`: Trade outcome / exit

Recommended persistence model: a `TradeScreenshot` table with fields such as:
- `id`
- `tradeId`
- `slot` (enum or constrained string)
- `storageKey` (private storage identifier)
- `originalName` (sanitized display metadata only)
- `mimeType`
- `sizeBytes`
- optional image dimensions/checksum
- timestamps

Add a unique constraint on `(tradeId, slot)`. The parent trade determines owner access. A denormalized `userId` may be used for query efficiency only if consistency is enforced and justified.

One current image is allowed per slot. A trade can remain draft/incomplete. The service that marks a trade complete must, inside a transaction/consistent operation, verify that all four distinct slots exist and their files are available. Return a useful validation error listing missing slots. Prevent races between screenshot deletion/replacement and completion. The final outcome screenshot can be uploaded after closing the position.

## 8. Upload and storage flow

Use a storage interface such as:
- `put(file, metadata) -> storageKey`
- `open/read(storageKey)` or `createReadStream(storageKey)`
- `delete(storageKey)`
- optional `exists(storageKey)`

Multer should write to a controlled temporary location or stream through a safe storage adapter; avoid buffering arbitrarily large uploads in memory. Validate size, actual file signature and allowed image formats. Generate random storage names; never use the original filename as a path.

Recommended upload flow:
1. Authenticate user.
2. Load trade and verify owner.
3. Validate slot key and upload constraints.
4. Validate actual image bytes, not only extension/header.
5. Store new file privately under a generated key.
6. In a DB transaction, create/replace the `(trade, slot)` metadata record.
7. After successful commit, delete the old file; if commit fails, delete the newly stored orphan.
8. Log cleanup failures safely and provide a reconciliation strategy.

Do not claim a DB transaction can atomically include an external object store. Design for compensating cleanup and orphan reconciliation.

Private screenshot delivery must authenticate and verify trade ownership. Do not mount the storage directory as public static content. The chosen production storage provider remains undecided.

## 9. Analytics architecture

Analytics must reuse centralized decimal-safe calculations and consistent definitions. Filter by authenticated owner, account, instrument, strategy and date range as supported. Define whether open trades, partial exits, fees and deposits/withdrawals are included before implementing each metric.

## 10. Database changes

Use Sequelize migrations. Keep migrations, model definitions and associations aligned. Use transactions for multi-record operations. Never use destructive sync options as production migration tools.

## 11. Testing architecture

Use the test runner already present or select a minimal supported runner after inspection. Separate unit, integration and security tests. Use an isolated test database and test storage adapter. Include end-to-end upload and trade-completion tests, including cleanup failure scenarios.
