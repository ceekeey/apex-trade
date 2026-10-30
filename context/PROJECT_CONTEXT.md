# Apex Trade — Project Context

## 1. Product

Apex Trade is a trading journal and performance-analysis application. It helps an individual trader record trades, review execution, track risk and psychology, and understand performance over time.

It is not a broker, exchange, wallet, copy-trading service or trade-execution platform. Do not implement order placement or custody of funds.

Core product outcomes:
- Record and review trades.
- Organize trades by trading account, instrument, strategy and date.
- Record planned risk, execution and final outcome.
- Attach four structured chart screenshots to every completed trade.
- Review discipline, psychology, mistakes and lessons.
- Calculate reliable performance statistics from recorded trades.

## 2. Repository and package-management decisions

The repository currently has this general layout:

```text
apex trade/
├── client/                 # Existing React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json        # Currently exists; to be consolidated
│   └── package-lock.json  # Currently exists; to be consolidated
├── server/
│   └── app.js              # Existing starter file; inspect before changing
├── context/
│   ├── AGENTS.md
│   ├── PROJECT_CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── DATABASE.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── phase/
├── .env
├── .env.local
├── package.json            # Existing root manifest
└── package-lock.json       # Existing root lockfile
```

The desired end state is a single root `package.json` and root `package-lock.json` for both client and server. The current repository is not yet in that state because the client has its own manifest and lockfile. Consolidate deliberately: merge required scripts and dependencies, verify the client build/lint and server tests, then remove nested package files only after successful verification. Do not move frontend source.

The root manifest currently uses JavaScript ES Modules (`"type": "module"`) and includes the backend dependency set. Inspect actual files before relying on this description.

## 3. Technology

Backend:
- Node.js and Express 5
- MySQL with Sequelize 6 and mysql2
- JavaScript ES Modules
- Zod for validation
- bcrypt for password hashing
- jsonwebtoken and cookie-parser for the chosen authentication design
- Nodemailer for SMTP email
- Multer for multipart uploads
- Helmet, CORS and express-rate-limit

Frontend:
- Existing React + Vite application in `client/`
- Preserve the existing frontend stack and behavior.
- Do not change frontend source during backend milestones unless explicitly authorized.

Do not replace MySQL with MongoDB/Mongoose. Do not add TypeScript or other major technology without approval.

## 4. Core application modules

Planned backend modules (not assumed to exist yet):
1. Authentication and sessions
2. Users/profile
3. Trading accounts
4. Instruments
5. Strategies
6. Trades
7. Trade journal/reviews
8. Trade screenshots and private file storage
9. Analytics
10. Optional tags and supporting reference data

Implement only when the corresponding milestone is approved.

## 5. Trade screenshot requirement

Every trade uses exactly four logical screenshot slots:

| Slot key | Display label | Purpose |
|---|---|---|
| `market_context` | Market context / HTF bias | Higher-timeframe direction, bias and market structure |
| `setup_poi` | Setup / POI | Point of interest, setup area and relevant liquidity |
| `entry_execution` | Entry execution / confirmation | Entry confirmation and chart showing entry, stop loss and take profit |
| `trade_outcome` | Trade outcome / exit | Closed trade, exit and final result |

Product rule:
- A trade can be saved as a draft/incomplete trade without all screenshots.
- A trade cannot be marked complete until all four screenshot slots contain valid, persisted images.
- Each slot has one current image. Replacing a screenshot updates that slot and safely cleans up the previous stored file.
- The `trade_outcome` screenshot may be added after the trade closes.
- Completion validation must check the database records and storage state; four upload attempts are not sufficient.
- The backend must return the missing slot keys/labels when completion is blocked.
- Enforce one record per trade and slot using a database unique constraint.

The exact status names and whether the product uses a separate draft state must be reconciled with the existing frontend before implementation.

## 6. Screenshot storage direction

Use a storage abstraction so local development and a future private object-storage provider can share the same application service.

- MySQL stores screenshot metadata and a private storage key.
- Image bytes live in private file/object storage, not in MySQL.
- Never trust a client-provided path or storage key.
- Do not place private screenshots in a publicly served static directory.
- Serve image access through authenticated, ownership-checked endpoints or short-lived signed access if a private object store is later selected.
- The production storage provider is undecided; do not invent credentials or choose a paid provider without approval.
- Local development storage may be used behind the abstraction, with a documented location outside public static assets.

## 7. Data ownership

A user may have multiple trading accounts and many trades. A trade belongs to one owner and, where applicable, one trading account. Screenshots and journal records inherit access through their parent trade. Every read, update, delete, upload, replace and download must enforce ownership server-side.

Do not trust user IDs supplied in request bodies when the authenticated identity is available.

## 8. Financial accuracy

Use MySQL DECIMAL for monetary and precision-sensitive numeric values. Use a decimal-safe calculation approach in JavaScript. Preserve raw recorded values and calculation inputs where appropriate.

Do not assume identical P/L formulas across forex, synthetic indices, crypto, stocks or other instruments. Contract size, tick value, multiplier, quote currency, account currency, fees and conversion rules must be explicit before calculations are implemented.

Define analytics consistently, including treatment of open trades, partial closes, fees and deposits/withdrawals if account equity is later supported.

## 9. Important unknowns — ask rather than invent

- Exact user/profile fields and authentication UX.
- Access/refresh token and cookie strategy.
- Frontend API base URL and deployment origins.
- SMTP provider and credentials.
- Production database and hosting details.
- Cloud/private object-storage provider.
- Maximum screenshot file size and accepted image formats (propose safe defaults for review).
- Whether multiple partial exits are supported.
- Exact trade statuses and required trade fields.
- Instrument specifications and P/L formulas.
- Whether journal notes are one-to-one or multiple per trade.

## 10. Product principles

Prioritize accurate records, disciplined review, privacy, clear feedback, reliable uploads, simple workflows and maintainable code. Avoid feature creep and do not assume the app should execute trades.
