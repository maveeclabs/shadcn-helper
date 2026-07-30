import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { getWorkspaceRoot } from '../utils/workspace';
import { ProjectInfo, PackageManager, UIVariant } from '../types';

const logger = Logger.getInstance();

export interface ProjectDetectionResult {
  project: ProjectInfo | null;
  error?: string;
}

export function detectProject(): ProjectDetectionResult {
  const root = getWorkspaceRoot();
  if (!root) {
    return { project: null, error: 'No workspace open' };
  }

  try {
    const packageJsonPath = path.join(root, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      return { project: null, error: 'Not a Node.js project (no package.json)' };
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    const isReact = 'react' in deps;
    if (!isReact) {
      return { project: null, error: 'Not a React project' };
    }

    const isNextJs = 'next' in deps;

    const componentsJsonPath = path.join(root, 'components.json');
    const hasComponentsJson = fs.existsSync(componentsJsonPath);

    let hasShadcn = hasComponentsJson;
    if (!hasShadcn) {
      hasShadcn = hasShadcnCli(deps);
    }

    let shadcnVersion: string | undefined;
    if (hasShadcn && hasComponentsJson) {
      try {
        const componentsJson = JSON.parse(fs.readFileSync(componentsJsonPath, 'utf-8'));
        shadcnVersion = componentsJson.version;
      } catch (err) {
        logger.debug(`Failed to read version from components.json: ${err}`);
      }
    }

    const packageManager = detectPackageManager(root);

    const uiVariant = detectUIVariant(root, componentsJsonPath, deps);

    logger.info(`Project detected: React=${isReact}, Next.js=${isNextJs}, shadcn=${hasShadcn}, PM=${packageManager}, UI=${uiVariant}`);

    return {
      project: {
        isReact,
        isNextJs,
        hasShadcn,
        hasComponentsJson,
        packageManager,
        shadcnVersion,
        uiVariant
      }
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Project detection failed: ${msg}`);
    return { project: null, error: msg };
  }
}

function hasShadcnCli(deps: Record<string, string>): boolean {
  const shadcnPatterns = ['shadcn-ui', 'shadcn', 'shadcn@'];
  for (const dep of Object.keys(deps)) {
    for (const pattern of shadcnPatterns) {
      if (dep.includes(pattern)) return true;
    }
  }
  return false;
}

export function detectPackageManager(root: string): PackageManager {
  if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(root, 'yarn.lock'))) return 'yarn';
  if (fs.existsSync(path.join(root, 'bun.lockb'))) return 'bun';
  if (fs.existsSync(path.join(root, 'bun.lock')) || fs.existsSync(path.join(root, 'bunfig.toml'))) return 'bun';
  return 'npm';
}

export function detectUIVariant(root: string, componentsJsonPath: string, deps: Record<string, string>): UIVariant {
  if (fs.existsSync(componentsJsonPath)) {
    try {
      const componentsJson = JSON.parse(fs.readFileSync(componentsJsonPath, 'utf-8'));
      const style = componentsJson.style || componentsJson.ui;
      if (style) {
        if (style.includes('react-aria')) return 'react-aria';
        if (style.includes('base')) return 'base-ui';
      }
    } catch (err) {
      logger.debug(`Failed to parse components.json for variant detection: ${err}`);
    }
  }

  const depKeys = Object.keys(deps);

  const hasReactAria = depKeys.some(d =>
    d === 'react-aria-components' || d.startsWith('@react-aria/')
  );
  if (hasReactAria) return 'react-aria';

  const hasRadix = depKeys.some(d => d.startsWith('@radix-ui/'));
  if (hasRadix) return 'radix';

  const hasShadcnCli = depKeys.some(d =>
    d.includes('shadcn-ui') || d.includes('shadcn') || d.includes('shadcn@')
  );
  if (hasShadcnCli) return 'base-ui';

  return 'unknown';
}

export function getPackageManagerCmd(pm: PackageManager, root: string): string {
  const isWindows = process.platform === 'win32';
  const npx = isWindows ? 'npx.cmd' : 'npx';

  switch (pm) {
    case 'pnpm':
      return isWindows ? 'pnpm.cmd' : 'pnpm';
    case 'yarn':
      return 'yarn';
    case 'bun':
      return 'bun';
    case 'npm':
    default:
      return npx;
  }
}
