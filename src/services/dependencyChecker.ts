import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { getWorkspaceRoot } from '../utils/workspace';
import { ShadcnComponent, UIVariant } from '../types';

const logger = Logger.getInstance();

export interface DependencyCheckResult {
  missingDependencies: string[];
  allInstalled: boolean;
}

export function checkComponentDependencies(component: ShadcnComponent, uiVariant?: UIVariant): DependencyCheckResult {
  if (uiVariant === 'base-ui') {
    return { missingDependencies: [], allInstalled: true };
  }

  if (uiVariant === 'unknown') {
    return { missingDependencies: [], allInstalled: true };
  }

  const root = getWorkspaceRoot();
  if (!root) {
    return { missingDependencies: component.dependencies, allInstalled: false };
  }

  const packageJsonPath = path.join(root, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    return { missingDependencies: component.dependencies, allInstalled: false };
  }

  const missing: string[] = [];

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    for (const dep of component.dependencies) {
      if (!(dep in allDeps)) {
        missing.push(dep);
      }
    }

    logger.info(`Dependency check for ${component.name}: ${missing.length} missing`);
    return {
      missingDependencies: missing,
      allInstalled: missing.length === 0
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to check dependencies: ${msg}`);
    return { missingDependencies: component.dependencies, allInstalled: false };
  }
}
