import * as vscode from 'vscode';
import { Logger, LogLevel } from '../utils/logger';
import { RegistryService } from '../services/registry';
import { ComponentTracker } from '../services/tracking';
import { SidebarProvider } from '../providers/sidebarProvider';
import { registerCommands } from '../commands';
import { detectProject } from '../services/projectDetector';
import { getWorkspaceRoot } from '../utils/workspace';

const logger = Logger.getInstance();

export function activate(context: vscode.ExtensionContext): void {
  logger.info('Shadcn Help activating...');

  const config = vscode.workspace.getConfiguration('shadcnHelp');
  const registryUrl = config.get<string>('registry', 'https://ui.shadcn.com');
  const autoDetect = config.get<boolean>('autoDetectProject', true);

  const registry = new RegistryService(registryUrl);
  const tracker = new ComponentTracker();

  const sidebarProvider = new SidebarProvider(context.extensionUri, registry, tracker);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  registerCommands(context, sidebarProvider, registry);

  context.subscriptions.push(
    vscode.workspace      .onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration('shadcnHelp.registry')) {
        const newUrl = vscode.workspace.getConfiguration('shadcnHelp').get<string>('registry', 'https://ui.shadcn.com');
        registry.setRegistryUrl(newUrl);
        sidebarProvider.refresh();
        logger.info(`Registry URL updated to: ${newUrl}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      if (autoDetect) {
        sidebarProvider.refresh();
      }
    })
  );

  if (autoDetect) {
    const result = detectProject();
    if (result.project) {
      logger.info(`Project auto-detected: ${JSON.stringify(result.project)}`);
    }
  }

  context.subscriptions.push({
    dispose: () => {
      logger.info('Shadcn Help deactivating...');
      Logger.getInstance().dispose();
    }
  });

  logger.info('Shadcn Help activated');
}

export function deactivate(): void {
  Logger.getInstance().info('Shadcn Help deactivated');
}
