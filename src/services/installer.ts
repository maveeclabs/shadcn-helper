import { exec } from 'child_process';
import { promisify } from 'util';
import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { getWorkspaceRoot } from '../utils/workspace';
import { detectPackageManager } from './projectDetector';
import { PackageManager, ShadcnComponent } from '../types';

const execAsync = promisify(exec);

const logger = Logger.getInstance();

const COMPONENT_NAME_RE = /^[a-zA-Z0-9-]+$/;

function validateComponentName(name: string): string {
  const lower = name.toLowerCase();
  if (!COMPONENT_NAME_RE.test(lower)) {
    throw new Error(`Invalid component name: "${name}". Component names must be alphanumeric with hyphens.`);
  }
  return lower;
}

export interface InstallResult {
  success: boolean;
  component: string;
  output?: string;
  error?: string;
}

export interface InitResult {
  success: boolean;
  output?: string;
  error?: string;
}

export async function installComponent(
  component: ShadcnComponent,
  packageManager?: PackageManager
): Promise<InstallResult> {
  const root = getWorkspaceRoot();
  if (!root) {
    return { success: false, component: component.name, error: 'No workspace open' };
  }

  const pm = packageManager || detectPackageManager(root);
  const sanitizedName = validateComponentName(component.name);
  const cmd = getInstallCommand(pm, sanitizedName);

  logger.info(`Installing component: ${component.name} with ${pm}`);
  logger.info(`Command: ${cmd}`);

  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: root, timeout: 120000 });

    const output = [stdout, stderr].filter(Boolean).join('\n');
    logger.info(`Successfully installed ${component.name}`);
    return { success: true, component: component.name, output };

  } catch (error) {
    const err = error as { code?: number; stdout?: string; stderr?: string; message?: string };
    const exitCode = err.code ?? 1;
    const output = [err.stdout, err.stderr].filter(Boolean).join('\n');

    logger.error(`Failed to install ${component.name}: exit code ${exitCode}`);
    return {
      success: false,
      component: component.name,
      error: err.message || `Installation failed with exit code ${exitCode}`,
      output
    };
  }
}

export function initShadcnInteractive(): void {
  const root = getWorkspaceRoot();
  if (!root) {
    vscode.window.showErrorMessage('Shadcn Help: No workspace open');
    return;
  }

  const pm = detectPackageManager(root);
  const cmd = getInitCommand(pm, false);

  const terminal = vscode.window.createTerminal({
    name: 'Shadcn Init',
    cwd: root
  });
  terminal.show();
  terminal.sendText(cmd, true);
  logger.info(`Opened interactive init terminal: ${cmd}`);
}

export async function initShadcnDefaults(): Promise<InitResult> {
  const root = getWorkspaceRoot();
  if (!root) {
    return { success: false, error: 'No workspace open' };
  }

  const pm = detectPackageManager(root);
  const cmd = getInitCommand(pm, true);

  logger.info(`Running init with defaults using ${pm}`);
  logger.info(`Command: ${cmd}`);

  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd: root, timeout: 120000 });
    const output = [stdout, stderr].filter(Boolean).join('\n');
    logger.info('shadcn init completed successfully');
    return { success: true, output };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    const output = [err.stdout, err.stderr].filter(Boolean).join('\n');
    logger.error(`shadcn init failed: ${err.message}`);
    return { success: false, error: err.message || 'Init failed', output };
  }
}

function getInstallCommand(pm: PackageManager, componentName: string): string {
  const name = validateComponentName(componentName);

  switch (pm) {
    case 'pnpm':
      return `pnpm dlx shadcn@latest add ${name}`;
    case 'yarn':
      return `yarn dlx shadcn@latest add ${name}`;
    case 'bun':
      return `bunx shadcn@latest add ${name}`;
    case 'npm':
    default:
      return `npx shadcn@latest add ${name}`;
  }
}

function getInitCommand(pm: PackageManager, useDefaults: boolean): string {
  const base = getPmExec(pm);
  const flags = useDefaults ? ' --defaults' : '';
  return `${base} shadcn@latest init${flags}`;
}

function getPmExec(pm: PackageManager): string {
  switch (pm) {
    case 'pnpm':
      return 'pnpm dlx';
    case 'yarn':
      return 'yarn dlx';
    case 'bun':
      return 'bunx';
    case 'npm':
    default:
      return 'npx';
  }
}
