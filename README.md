# source-agents

Keep AGENTS.md and CLAUDE.md clean, consistent, and sourcing correctly.</em>

can projects • Fix sourcing • Convert symlinks • Dry‑run preview

## Quick Start

Requirements: Node 18+, Bun 1.1+.

Clone the repo:

```sh
git clone https://github.com/iannuttall/source-agents.git
```

Enter the folder:

```sh
cd source-agents
```

Install dependencies:

```sh
bun install
```

Run interactively on a specific folder (recommended):

```sh
bun run dev --root ~/projects
```

Auto‑fix recommended actions:

```sh
bun run dev --root ~/projects --auto
```

Preview without making changes:

```sh
bun run dev --root ~/projects --dry-run
```

Exclude extra directories (in addition to defaults):

```sh
bun run dev --root ~/projects --exclude '**/temp/**' '**/backup/**'
```

**Note**: Many directories are excluded by default (node_modules, .git, dist, build artifacts, system folders like .Trash, Library, Applications, package manager caches, and large media folders). Use `--exclude` to add more patterns.

**Tip**: Always use `--root` to specify a project directory rather than scanning your entire home directory, which can be slow and hit permission errors.

## Configuration

Customize default exclusions and scan options using a `config.yml` file. The tool looks for configs in this order (later configs override earlier ones):

1. `~/.config/source-agents/config.yml` (global config)
2. `./config.yml` (project root)
3. `./.source-agents/config.yml` (project hidden folder)

Copy `config.example.yml` to one of these locations and customize:

```sh
# Global config for all projects
mkdir -p ~/.config/source-agents
cp config.example.yml ~/.config/source-agents/config.yml

# Or project-specific config
cp config.example.yml ./config.yml
```

See `config.example.yml` for all available options.

## Global CLI (optional)

Build the CLI:

```sh
bun run build
```

Link globally:

```sh
npm link
```

Run from anywhere:

```sh
source-agents --help
```

Example run:

```sh
source-agents --root ~/projects --auto
```

## Development

Run the TUI in dev mode:

```sh
bun run dev
```

Type‑check:

```sh
bun run type-check
```

Build:

```sh
bun run build
```

## Keyboard & Tips

- ↑↓ to navigate, Enter to select, 's' to skip, Esc/← to go back, Ctrl+C to exit.
- Default root is your home directory; pass --root to limit scope.

## License

MIT
