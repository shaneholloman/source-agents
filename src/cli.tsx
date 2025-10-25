#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import { Command } from 'commander';
import { render } from 'ink';
import { App } from './components/App.js';
import { loadConfig } from './utils/config.js';
import { expandPath } from './utils/paths.js';

const program = new Command();

program
    .name('source-agents')
    .description('Manage CLAUDE.md and AGENTS.md files with intelligent sourcing')
    .version('1.0.0')
    .option('-r, --root <directory>', 'Root directory to scan', os.homedir())
    .option('-e, --exclude <patterns...>', 'Additional exclude patterns')
    .option('-d, --dry-run', 'Preview changes without executing')
    .option('-a, --auto', 'Automatically apply recommended actions')
    .option('-v, --verbose', 'Show detailed output')
    .parse(process.argv);

const opts = program.opts();

const root = expandPath(opts.root || os.homedir());

// Validate root exists and is a directory before rendering the TUI
try {
    const stat = fs.statSync(root);
    if (!stat.isDirectory()) {
        console.error(`Error: --root path is not a directory: ${root}`);
        process.exit(1);
    }
} catch {
    console.error(`Error: --root path does not exist: ${root}`);
    process.exit(1);
}

// Load configuration
const config = loadConfig(root);

const scanOptions = {
    root,
    exclude: opts.exclude || [],
    configExcludes: config.exclude,
    verbose: opts.verbose || config.scanOptions?.verbose || false,
};

// Render the Ink app
render(<App options={scanOptions} dryRun={opts.dryRun || false} auto={opts.auto || false} />);
