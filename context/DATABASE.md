# Apex Trade — Database Design Guidelines

## 1. Database technology

Use MySQL with Sequelize 6 and `mysql2`. JavaScript ES Modules are the current module-system decision. Confirm versions and configuration in the repository before implementation.

Use migrations as the source of schema evolution. Keep Sequelize models, associations and migrations aligned.

## 2. Design principles

- Model ownership explicitly.
- Use foreign keys and appropriate indexes.
- Add database uniqueness constraints for invariants.
- Use transactions for related writes.
- Use DECIMAL for financial values.
- Store timestamps consistently (prefer UTC in persistence; convert for display).
- Avoid speculative fields and premature generic schemas.
- Do not store uploaded image bytes in MySQL.
- Do not use `sequelize.sync({ force: true })` or `sequelize.sync({ alter: true })` in production.

## 3. Conceptual entities

These are planning concepts, not finalized schemas. Confirm actual product fields and frontend needs before migrations.

### Users
Potential fields: id, name/displayName, email, passwordHash, emailVerifiedAt, status, timestamps. Email should have a normalized unique representation.

### Sessions / Refresh Tokens
Potential fields: id, userId, tokenHash, session identifier, expiresAt, revokedAt, replacedById, device metadata with privacy limits, timestamps. Never store raw refresh tokens.

### Email Verification Tokens / Password Reset Tokens
Potential fields: id, userId, tokenHash, expiresAt, consumedAt, createdAt. Store only token hashes; enforce single use atomically.

### Trading Accounts
Potential fields: id, userId, name, broker/platform label, account type, currency, starting balance and optional descriptive metadata. Exact fields are not finalized. A user owns each account.

### Instruments
Potential fields: id, symbol/name, market type, quote/base currency where relevant, contract/tick/multiplier metadata only after the supported instrument rules are defined. Avoid assuming every instrument uses the same calculation model.

### Strategies
Potential fields: id, userId, name, description, rules and active status. Decide whether strategies are user-defined, shared reference data or both before schema design.

### Trades
Potential fields: id, userId, tradingAccountId, instrumentId or instrument snapshot, direction, status, entry/exit times, entry/exit prices, stop loss, take profit, position size, risk, gross P/L, fees, net P/L, notes and timestamps. This is not a finalized field list. Support partial exits only if the product explicitly requires them.

### Journal Entries
Potential fields: id, userId, tradeId, emotional state, confidence, mistakes, lessons learned, notes and timestamps. Decide one-to-one versus one-to-many based on product behavior.

### Trade Screenshots
One metadata row represents the current image in one logical slot for one trade. Suggested fields:
- `id`
- `tradeId` (foreign key)
- `slot` (constrained to the four allowed keys)
- `storageKey` (private storage identifier)
- `originalName` (sanitized display metadata; never a filesystem path)
- `mimeType`
- `sizeBytes`
- optional width, height and checksum
- createdAt / updatedAt

Required invariant: unique `(tradeId, slot)`, so one current image exists per slot. A trade can have zero to four screenshot rows while incomplete. It can be marked complete only when all four distinct allowed slot values are present and their stored files have been verified according to the storage design.

Allowed slot values:
- `market_context`
- `setup_poi`
- `entry_execution`
- `trade_outcome`

The parent trade determines the owner. A `userId` column on screenshots is optional denormalization; if used, enforce consistency with the parent trade and test it. Never rely on a screenshot row's userId alone to authorize access.

## 4. Relationships and ownership

Expected relationships:
- User has many trading accounts.
- User has many trades.
- Trading account has many trades.
- User has many sessions.
- User has many strategies.
- Trade has many journal entries if multi-entry journaling is selected.
- Trade has up to four current screenshot records (one per slot).
- Trade screenshot belongs to one trade.

Use foreign keys and deliberate delete behavior. Account/trade deletion must not accidentally orphan private files. Database cascades do not delete external storage objects; implement explicit cleanup and reconciliation.

Every query for a private resource must be scoped to the authenticated owner. Database constraints complement, but do not replace, application authorization.

## 5. Screenshot integrity and lifecycle

- Store metadata and private storage keys in MySQL; image bytes belong in private file/object storage.
- Enforce unique `(tradeId, slot)`.
- Validate allowed slot values at both application and database level where supported.
- Permit incomplete trades to have fewer than four screenshots.
- On completion, verify all four required slots exist; do not infer completeness from a count alone unless uniqueness and allowed-slot constraints are guaranteed.
- Ensure the stored file exists and is valid before accepting completion.
- Handle replace/delete with compensating cleanup because MySQL transactions cannot atomically include external storage.
- Do not store public URLs as the sole source of truth. Store stable private storage keys; derive authorized delivery URLs/streams at request time.
- Consider a cleanup/outbox table or scheduled reconciliation for orphaned objects if needed at scale; begin with a simpler auditable approach.

## 6. Financial precision

Use MySQL DECIMAL with deliberate precision and scale for:
- Prices
- Balances
- Profit/loss
- Fees and commissions
- Risk amount
- Position size where fractional precision matters

Avoid FLOAT/DOUBLE for money. Sequelize/MySQL drivers may return DECIMAL values as strings; preserve decimal strings at API boundaries or use a decimal library for calculations. Do not coerce financial values through ordinary JavaScript `Number` for precision-sensitive operations.

Before implementing P/L, document the supported instrument formula and inputs. Account for direction, contract size, tick value, multiplier, fees, currency conversion and partial closes only where applicable. Never invent a generic formula for all instruments.

## 7. Migrations and transactions

- Create a new migration for each schema change.
- Never edit an already-applied migration to change a deployed schema.
- Review generated SQL and indexes.
- Test migrations on an isolated database.
- Back up before production schema changes.
- Do not use destructive sync options in production.
- Use transactions for registration/token creation, reset/consumption, session rotation, trade operations and screenshot metadata changes where appropriate.
- Remember external file storage is not part of the MySQL transaction; use compensating actions and cleanup.

## 8. Indexing and constraints

Likely indexes to evaluate:
- Unique normalized user email.
- Session userId, tokenHash unique, expiresAt.
- Token hash unique and userId/expiry lookups.
- Trading account userId.
- Trade userId + createdAt/entryTime; tradingAccountId + date; instrument/strategy filters as needed.
- Screenshot unique `(tradeId, slot)` and tradeId lookup.

Choose indexes based on real query patterns; avoid adding every possible index.

## 9. Required database tests

- Foreign-key and ownership integrity.
- Unique email/session/token constraints.
- Token single-use behavior under concurrent requests.
- Trade/account relationship ownership.
- Screenshot slot allowlist and `(tradeId, slot)` uniqueness.
- Incomplete trade can be saved.
- Completion blocked with any missing slot.
- Completion succeeds with exactly four valid slots.
- Screenshot replacement/deletion does not leave inconsistent metadata.
- Decimal values retain precision across write/read/calculation.
- Transactions roll back database changes on failure.
