import path from 'node:path';
import fg from 'fast-glob';
import type { DirectoryInfo, ScanOptions, ScanResult } from '../types/index.js';
import { analyzeDirectory } from './analyzer.js';

const DEFAULT_EXCLUDE = [
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
];

export async function scanDirectories(options: ScanOptions): Promise<ScanResult> {
    const startTime = Date.now();
    const excludePatterns = [...DEFAULT_EXCLUDE, ...(options.exclude || [])];

    // Find all CLAUDE.md and AGENTS.md files
    const files = await fg(['**/CLAUDE.md', '**/AGENTS.md'], {
        cwd: options.root,
        absolute: true,
        ignore: excludePatterns,
        onlyFiles: true,
        followSymbolicLinks: false,
        suppressErrors: true, // Suppress permission errors
    });

    // Group files by directory
    const dirMap = new Map<string, Set<string>>();
    for (const file of files) {
        const dir = path.dirname(file);
        if (!dirMap.has(dir)) {
            dirMap.set(dir, new Set());
        }
        dirMap.get(dir)?.add(path.basename(file));
    }

    // Analyze each directory
    const directories: DirectoryInfo[] = [];
    for (const [dir] of dirMap) {
        const info = await analyzeDirectory(dir);
        directories.push(info);
    }

    // Sort by path for consistent display
    directories.sort((a, b) => a.path.localeCompare(b.path));

    const duration = Date.now() - startTime;

    return {
        directories,
        totalScanned: dirMap.size,
        duration,
    };
}
