# Apex Trade — Security Requirements

## 1. Security objectives

Protect user accounts, private trade records, financial journal data and trade screenshots. Assume every request, uploaded file and client-supplied identifier is untrusted.

Apex Trade is a journal, not a broker. Do not collect broker passwords, execute orders or store payment credentials as part of the current scope.

## 2. Authentication and sessions

The final access/refresh strategy must be explicitly designed and documented before implementation. At minimum:

- Hash passwords with bcrypt using a reviewed work factor.
- Enforce password policy without logging submitted passwords.
- Use short-lived access credentials.
- If refresh tokens are used, store only hashes server-side, rotate them on use, detect reuse, and revoke the affected session/token family.
- Give sessions unique identifiers and support logout/revocation.
- Validate JWT algorithm, issuer, audience, expiry and required claims; never accept an algorithm selected by an untrusted token.
- Keep signing secrets in environment variables or a managed secret store.
- Do not place sensitive data in JWT payloads.
- Avoid long-lived tokens in browser localStorage. Prefer a reviewed HttpOnly-cookie design where appropriate.
- If cookies authenticate state-changing requests, implement CSRF protection and validate Origin/Referer as an additional defense.
- Set `HttpOnly`, `Secure` in production, and an intentional `SameSite` policy.
- Clear cookies using matching path/domain/security attributes.
- Return generic responses for account recovery to reduce account enumeration.

## 3. Registration, verification and password reset

- Hash one-time verification/reset tokens before storing them.
- Give tokens short expiry and single-use semantics.
- Consume tokens atomically so concurrent requests cannot reuse them.
- Rate-limit issuance and verification endpoints.
- Do not disclose whether an email address exists in password-reset responses.
- Invalidate or rotate relevant sessions after password changes/resets.
- Do not log raw tokens or include them in analytics/error reports.
- Use database transactions for related user/token changes.

## 4. Authorization and ownership

Every private endpoint must authenticate the user and verify ownership of the requested resource. This includes:
- Trading accounts
- Trades
- Journal entries
- Strategies and user-specific settings
- Screenshot upload, list, view, replace and delete operations
- Analytics queries

Never trust `userId` from a request body, URL or uploaded metadata as proof of ownership. Derive the user identity from the authenticated session and query resources scoped to that owner. Test horizontal privilege escalation by attempting to access another user's IDs.

## 5. Screenshot upload security

Four slots are supported for each trade:

1. `market_context` — Market context / HTF bias
2. `setup_poi` — Setup / POI
3. `entry_execution` — Entry execution / confirmation
4. `trade_outcome` — Trade outcome / exit

Security and integrity rules:
- Only authenticated owners may upload or manage screenshots for their own trades.
- Allow only explicitly approved raster image formats. Establish the exact allowlist and size limit before implementation; do not assume SVG or arbitrary files are safe.
- Validate file extension, declared MIME type and actual file signature. The signature is authoritative; client MIME alone is not.
- Enforce per-file size limits, request limits and upload rate limits.
- Generate random server-side storage keys. Never construct paths from user input or original filenames.
- Reject path traversal, malformed multipart requests and unsupported formats.
- Store files outside the web root / public static directory.
- Do not save image bytes in MySQL. Save metadata and a private storage key.
- Serve images only after authentication and ownership checks, or via short-lived signed access from a private object store.
- Set safe response headers and avoid content sniffing.
- Consider image re-encoding/metadata stripping to reduce malicious payload and EXIF privacy leakage; only add a library after reviewing its maintenance, resource use and requirements.
- Clean up temporary files on every success/failure path.
- Handle replacement carefully: commit the new metadata before deleting the old object; clean up the new object if the DB write fails.
- Provide a safe orphan-file reconciliation mechanism.
- Do not expose storage provider credentials or permanent public URLs.
- Test wrong-owner access, forged MIME, invalid signatures, oversized files, duplicate slot uploads, replacement, deletion and storage failure.

A trade must not be marked complete until exactly one valid, persisted screenshot is present in each of the four slots. Draft/incomplete trades may have fewer. The completion endpoint must report missing slot keys and must not rely on the client to assert completeness.

## 6. Network and HTTP security

- Use Helmet with reviewed settings.
- Use explicit CORS origin allowlists from validated configuration.
- Never use `Access-Control-Allow-Origin: *` with credentials.
- Restrict allowed methods and headers.
- Apply body-size limits appropriate to JSON APIs; uploads have separate limits.
- Use HTTPS in production.
- Disable or minimize framework-identifying headers.
- Apply rate limits to login, registration, reset, verification and upload routes.
- Consider proxy configuration carefully; trust only known reverse proxies.
- Avoid verbose production errors and stack traces.

## 7. Input and database security

- Validate body, params, query and configuration using Zod.
- Normalize/validate email and other identifiers consistently.
- Use Sequelize parameterization; do not concatenate untrusted values into raw SQL.
- Enforce database foreign keys, uniqueness and constraints.
- Scope all queries to the authenticated owner.
- Use least-privilege database credentials.
- Keep production and test databases separate.
- Do not run destructive schema operations in production.
- Use transactions for multi-step database changes.

## 8. Secrets, logs and privacy

- Never commit `.env`, `.env.local`, credentials, tokens, private keys or uploaded trade screenshots.
- `.env.example` contains placeholder values only.
- Never print secret values when inspecting configuration.
- Redact passwords, cookies, authorization headers, tokens, reset links and sensitive email data from logs.
- Do not log screenshot contents or private storage keys unnecessarily.
- Restrict access to logs and define retention appropriate to the deployment.
- If a secret is exposed, recommend immediate rotation.

## 9. Financial data integrity

- Use DECIMAL columns for money and precision-sensitive values.
- Use decimal-safe arithmetic and validate precision/ranges.
- Do not silently recalculate or overwrite a user's recorded trade values.
- Keep calculation logic centralized and tested.
- Do not assume instrument-specific P/L rules.
- Protect analytics endpoints against cross-user data leakage.

## 10. Security test checklist

At minimum test:
- Unauthenticated access to private routes.
- Cross-user access to accounts, trades, journals and screenshots.
- Expired, malformed, revoked and wrong-audience tokens.
- Refresh rotation/reuse and logout revocation.
- One-time token expiry and reuse.
- Login/reset/verification/upload rate limits.
- CORS and CSRF behavior.
- Validation and safe error responses.
- SQL injection-style inputs.
- Upload size, file signature, MIME mismatch and path traversal.
- Screenshot slot uniqueness and replacement races.
- Missing screenshot completion rejection.
- Storage/database failure cleanup.
- Production logs contain no secrets.
