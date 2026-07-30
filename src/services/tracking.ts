import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { getWorkspaceRoot } from '../utils/workspace';
import { ComponentStatus, InstallStatus } from '../types';

const logger = Logger.getInstance();

export class ComponentTracker {
  private installedComponents: Set<string> = new Set();
  private cacheValid = false;

  refresh(): void {
    this.installedComponents.clear();
    this.cacheValid = false;
    this.detectInstalledComponents();
  }

  getStatus(name: string): ComponentStatus {
    if (!this.cacheValid) {
      this.detectInstalledComponents();
    }
    return {
      name,
      status: this.installedComponents.has(name.toLowerCase()) ? 'installed' : 'not-installed'
    };
  }

  getAllStatuses(names: string[]): ComponentStatus[] {
    if (!this.cacheValid) {
      this.detectInstalledComponents();
    }
    return names.map(name => ({
      name,
      status: this.installedComponents.has(name.toLowerCase()) ? 'installed' : 'not-installed'
    }));
  }

  markInstalled(name: string): void {
    this.installedComponents.add(name.toLowerCase());
  }

  private detectInstalledComponents(): void {
    const root = getWorkspaceRoot();
    if (!root) {
      this.cacheValid = true;
      return;
    }

    this.detectFromComponentsJson(root);
    this.detectFromFileSystem(root);

    this.cacheValid = true;
    logger.info(`Detected ${this.installedComponents.size} installed components`);
  }

  private detectFromComponentsJson(root: string): void {
    const componentsJsonPath = path.join(root, 'components.json');
    if (!fs.existsSync(componentsJsonPath)) return;

    try {
      const componentsJson = JSON.parse(fs.readFileSync(componentsJsonPath, 'utf-8'));
      if (componentsJson.components) {
        const basePath = componentsJson.resolvedPaths?.components || 
          componentsJson.tsxPaths?.components || 
          path.join(root, 'src', 'components', 'ui');

        for (const [name, filePath] of Object.entries(componentsJson.components)) {
          this.installedComponents.add(name.toLowerCase());
        }
      }
    } catch (error) {
      logger.warn(`Failed to read components.json: ${error}`);
    }
  }

  private detectFromFileSystem(root: string): void {
    const possiblePaths = [
      path.join(root, 'src', 'components', 'ui'),
      path.join(root, 'components', 'ui'),
      // path.join(root, 'src', 'components'),
      // path.join(root, 'components')
    ];

    for (const dir of possiblePaths) {
      if (fs.existsSync(dir)) {
        try {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const name = path.parse(file).name;
            if (name !== 'index' && !name.startsWith('_')) {
              this.installedComponents.add(name.toLowerCase());
            }
          }
        } catch (err) {
          logger.debug(`Failed to read directory ${dir}: ${err}`);
        }
      }
    }
  }
}
