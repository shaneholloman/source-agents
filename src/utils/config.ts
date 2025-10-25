import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import yaml from 'js-yaml';
import type { Config } from '../types/index.js';

const DEFAULT_CONFIG: Config = {
    exclude: [
        // Build artifacts and dependencies
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/target/**',
        '**/__pycache__/**',
        '**/.pytest_cache/**',
        '**/venv/**',
        '**/.venv/**',
        // IDE and editor folders
        '**/.vscode/**',
        '**/.idea/**',
        // System and protected directories (macOS/Linux)
        '**/.Trash/**',
        '**/Library/**',
        '**/Applications/**',
        '**/System/**',
        // Package manager caches
        '**/.npm/**',
        '**/.yarn/**',
        '**/.pnpm/**',
        '**/.cache/**',
        // User data directories
        '**/.local/**',
        '**/.config/**',
        // Large media directories (unlikely to contain project files)
        '**/Music/**',
        '**/Movies/**',
        '**/Pictures/**',
        '**/Photos/**',
    ],
    scanOptions: {
        followSymlinks: false,
        verbose: false,
    },
};

/**
 * Load config from a YAML file
 */
function loadConfigFile(configPath: string): Partial<Config> | null {
    try {
        if (!fs.existsSync(configPath)) {
            return null;
        }

        const fileContents = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(fileContents) as Partial<Config>;
        return config;
    } catch (_error) {
        console.warn(`Warning: Failed to load config from ${configPath}`);
        return null;
    }
}

/**
 * Merge multiple configs with priority (later configs override earlier ones)
 */
function mergeConfigs(...configs: (Partial<Config> | null)[]): Config {
    const result: Config = { ...DEFAULT_CONFIG };

    for (const config of configs) {
        if (!config) continue;

        // Merge exclude patterns (concatenate arrays)
        if (config.exclude) {
            // Remove defaults and use only config excludes if provided
            result.exclude = config.exclude;
        }

        // Merge scan options
        if (config.scanOptions) {
            result.scanOptions = {
                ...result.scanOptions,
                ...config.scanOptions,
            };
        }
    }

    return result;
}

/**
 * Load configuration from multiple sources with priority:
 * 1. Global config (~/.config/source-agents/config.yml)
 * 2. Project config (./config.yml or ./.source-agents/config.yml)
 * 3. CLI arguments (passed separately)
 */
export function loadConfig(cwd: string = process.cwd()): Config {
    // Try global config in home directory
    const homeConfigPath = path.join(os.homedir(), '.config', 'source-agents', 'config.yml');
    const globalConfig = loadConfigFile(homeConfigPath);

    // Try project-level configs
    const projectConfigPath = path.join(cwd, 'config.yml');
    const projectHiddenConfigPath = path.join(cwd, '.source-agents', 'config.yml');

    const projectConfig =
        loadConfigFile(projectConfigPath) || loadConfigFile(projectHiddenConfigPath);

    // Merge configs: default -> global -> project
    return mergeConfigs(globalConfig, projectConfig);
}

/**
 * Get default configuration (useful for generating example configs)
 */
export function getDefaultConfig(): Config {
    return { ...DEFAULT_CONFIG };
}
