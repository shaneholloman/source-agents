# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

source-agents is a TUI (Terminal User Interface) tool built with Ink/React that scans directories for CLAUDE.md and AGENTS.md files, analyzes their state, and helps maintain proper sourcing relationships. The canonical pattern is: CLAUDE.md should source AGENTS.md via the `@AGENTS.md` directive at the top of the file.

## Essential Commands

```bash
# Development
bun install                              # Install dependencies
bun run dev --root ~/projects            # Run TUI in dev mode on specific directory
bun run dev --root ~/projects --auto    # Auto-apply recommended fixes
bun run dev --root ~/projects --dry-run # Preview changes without executing

# Code Quality
bun run type-check    # TypeScript type checking
bun run format        # Format code with Biome
bun run lint          # Lint and auto-fix with Biome
bun run check         # Run both format and lint

# Build
bun run build         # Build ESM output to dist/
node dist/cli.js      # Run built CLI
```

## Configuration System

The tool uses a hierarchical configuration system with YAML files:

**Config locations** (in order of priority):

1. `~/.config/source-agents/config.yml` - Global config for all projects
2. `./config.yml` - Project root config
3. `./.source-agents/config.yml` - Project hidden folder config

Project configs override global configs. See `config.example.yml` for structure.

**Config loader** (`utils/config.ts`):

- Loads and merges configs from multiple locations
- Provides default exclude patterns if no config found
- Handles YAML parsing with js-yaml library

## Architecture Overview

The codebase follows a three-layer service architecture:

### 1. Scanner Layer (`services/scanner.ts`)

- Uses fast-glob to recursively find all CLAUDE.md and AGENTS.md files
- Groups files by directory
- Returns list of directories containing these files
- Exclude patterns come from config files (see Configuration System above)
- Default excludes include: node_modules, .git, dist, build artifacts, IDE folders, system folders, package manager caches, and large media folders
- Permission errors are suppressed via `suppressErrors: true` to prevent crashes when scanning restricted directories
- Accepts both `configExcludes` (from config file) and `exclude` (from CLI) and merges them

### 2. Analyzer Layer (`services/analyzer.ts`)

- Analyzes each directory to determine its current state
- Checks file statuses: exists, missing, symlink, broken
- Determines if CLAUDE.md contains `@AGENTS.md` sourcing directive
- Classifies directories into scenarios (7 types):
  - `optimal`: Both exist, CLAUDE sources AGENTS
  - `both-no-source`: Both exist but no sourcing
  - `only-claude`: Only CLAUDE.md exists
  - `only-agents`: Only AGENTS.md exists
  - `both-symlinks`: Both are symlinks (legacy)
  - `mixed-symlinks`: One symlink, one regular file
  - `broken-symlinks`: Has broken symlinks

### 3. Executor Layer (`services/executor.ts`)

- Executes actions to fix directory states
- Supports 9 action types (create, move, add sourcing, convert symlinks, etc.)
- All file operations use fs-extra
- Supports dry-run mode for previewing changes
- Uses templates from `utils/templates.ts` for creating new files

### Data Flow

```flow
CLI (cli.tsx)
  ↓
Load Config (config.yml) → Merge with CLI args
  ↓
App Component (components/App.tsx) - State machine with 5 states
  ↓
Scanner → Analyzer → (UI Display) → User Selection → Executor
  ↓                                                      ↓
DirectoryInfo[]                                   Action Results
```

## TUI State Machine

The main App component (`components/App.tsx`) implements a state machine:

1. `scanning`: Running scanner/analyzer
2. `displaying`: Showing ResultsTable with directory statuses
3. `selecting`: Interactive ActionMenu for user to choose actions
4. `executing`: Applying selected actions
5. `complete`: Showing Summary of results

State transitions are managed via React's useState and triggered by user input or operation completion.

## Important Patterns

### File Sourcing Pattern

The `@AGENTS.md` directive at the top of CLAUDE.md creates a sourcing relationship:

```markdown
@AGENTS.md

# Additional project-specific instructions
```

This tells Claude Code to read AGENTS.md first, then apply CLAUDE.md on top.

### Type System

Core types in `types/index.ts`:

- `DirectoryInfo`: Represents analyzed directory state
- `Scenario`: 7 possible directory states
- `ActionType`: 9 possible fix actions
- `Action`: User-selected action to execute

### Component Structure

Components are in `src/components/`:

- `App.tsx`: Main state machine and orchestration
- `ResultsTable.tsx`: Displays directory scan results in table format
- `ActionMenu.tsx`: Interactive menu for selecting actions per directory
- `Scanner.tsx`: Loading state component
- `Summary.tsx`: Final results display with color-coded messages

### Error Handling

Use the helper pattern for unknown errors:

```typescript
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}
```

This is used consistently across the codebase to avoid `any` types.

## Code Style (from AGENTS.md)

- TypeScript strict mode, ESM imports, 4-space indent (Biome configured)
- Components: PascalCase files (ResultsTable.tsx, ActionMenu.tsx)
- Services/Utils: lowercase files (scanner.ts, paths.ts)
- Variables/functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Keep services pure and stateless; UI logic stays in components
- React JSX transform enabled (no manual React imports needed)

## Testing

No test suite currently exists. When adding tests:

- Use Vitest
- Place in `src/**/__tests__/*.test.ts`
- Prioritize testing services layer (scanner, analyzer, executor)
- Target 80%+ coverage on touched files

## Build System

- Uses Bun's native bundler for fast builds
- Outputs ESM to `dist/`
- Externals: react, ink, ink-spinner, commander, fast-glob, fs-extra
- TypeScript compiles with strict mode and bundler module resolution
