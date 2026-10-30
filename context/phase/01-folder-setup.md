# Phase 01 — Repository inspection and folder/package setup

Read these six files before doing any work:

1. `context/AGENTS.md`
2. `context/PROJECT_CONTEXT.md`
3. `context/ARCHITECTURE.md`
4. `context/SECURITY.md`
5. `context/DATABASE.md`
6. `context/IMPLEMENTATION_PLAN.md`

Treat `context/AGENTS.md` as the primary working instruction.

## Important repository facts

- `client/` contains the existing React + Vite frontend. Preserve its source and behavior.
- `server/app.js` exists and must be inspected before changing it.
- The root has `package.json` and `package-lock.json`.
- The current project also has `client/package.json` and `client/package-lock.json`.
- The desired end state is one root package manifest and one root lockfile. Do not delete the nested client files until dependencies/scripts have been consolidated and the frontend lint/build have passed.
- The six context files live in `context/`, not in `server/`.
- The backend uses Node.js, Express 5, MySQL, Sequelize 6 and JavaScript ES Modules.
- Each completed trade must have four valid screenshot slots: `market_context`, `setup_poi`, `entry_execution`, and `trade_outcome`. Incomplete/draft trades may be missing screenshots.

## First task: inspect only

Do not edit, create, delete, install, migrate or reformat anything in this phase.

Inspect and report:
- Full project tree (excluding node_modules and generated output).
- Root and client package manifests and lockfiles.
- Node.js/npm versions and module configuration.
- Existing server files and frontend entry points.
- Existing tests and test commands.
- Git status and ignore rules.
- Environment variable names only; never print secret values.
- Baseline frontend lint/build results if safe to run without changing files.
- Missing or duplicate dependencies/scripts.
- Security concerns and any conflict between code and context documents.

Then propose a small, ordered plan for:
1. Safely consolidating client/server dependencies and scripts into the root package.
2. Verifying the frontend still works.
3. Creating the backend foundation under `server/src/` while preserving compatibility with `server/app.js`.
4. Keeping the four-screenshot-per-completed-trade requirement in the later database and upload milestones.

Stop after the inspection report and plan. Wait for approval before implementation.
