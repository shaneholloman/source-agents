# Repository Guidelines

## Project Structure & Modules

- Source lives in `src/` with ESM TypeScript.
  - CLI entry: `src/cli.tsx` → built to `dist/cli.js`.
  - UI: `src/components/` (Ink + React).
  - Logic: `src/services/` (scanner, analyzer, executor).
  - Helpers: `src/utils/`, shared types in `src/types/`.
- Build output in `dist/` (committed artifacts are not expected).

## Build, Test, and Dev

- Install: `bun install`
- Dev TUI: `bun run dev --root ~/projects` (use `--auto`, `--dry-run`, `--exclude` as needed).
- Code Quality: `bun run format`, `bun run lint`, `bun run check` (format + lint with Biome).
- Type‑check: `bun run type-check`
- Build: `bun run build` (emits ESM to `dist/`).
- Start built CLI: `node dist/cli.js --help`
- CI runs type‑check, build, and a smoke CLI help check.

## Coding Style & Naming

- TypeScript strict, ESM imports, 4‑space indent (Biome configured).
- Components: PascalCase files (`ResultsTable.tsx`, `ActionMenu.tsx`).
- Services/Utils/Types: lowercase filenames (`scanner.ts`, `paths.ts`, `index.ts`).
- Use camelCase for variables/functions, UPPER_SNAKE_CASE for constants, named exports preferred.
- Keep functions small and pure in `services/`; UI logic stays in `components/`.

## Testing Guidelines

- No formal test suite yet; contributions welcome.
- Prefer Vitest for unit tests; place tests under `src/**/__tests__` with `*.test.ts`.
- Target high‑value coverage for `services/` (scanner/analyzer/executor). Aim for 80%+ on touched files.
- Add lightweight CLI smoke tests if feasible.

## Commit & Pull Requests

- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- Scope clearly and write imperative, present‑tense summaries (≤72 chars).
- PRs should include: summary, motivation, screenshots or sample CLI output, steps to verify, and linked issues.
- Keep diffs focused; update README or this file if behavior changes.

## Security & Configuration

- Requires Node 18+ and Bun 1.1+. ESM only.
- Use `--dry-run` for potentially destructive actions; limit scans with `--root`.
- Config system: Hierarchical YAML config files at `~/.config/source-agents/config.yml` (global), `./config.yml` (project), or `./.source-agents/config.yml` (hidden). See `config.example.yml`.
- Default excludes: `node_modules`, `.git`, `dist`, system folders, package manager caches, large media directories. Customize via config or `--exclude`.

## Agent‑Specific Notes

- Follow these guidelines for any code changes in this repo tree.
- Do not introduce unrelated tooling or broad refactors in a single PR.
