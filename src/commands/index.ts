import * as vscode from 'vscode';
import { Logger } from '../utils/logger';
import { detectProject } from '../services/projectDetector';
import { RegistryService } from '../services/registry';
import { installComponent, initShadcnDefaults, initShadcnInteractive } from '../services/installer';
import { SidebarProvider } from '../providers/sidebarProvider';

const logger = Logger.getInstance();

export function registerCommands(
  context: vscode.ExtensionContext,
  sidebarProvider: SidebarProvider,
  registry: RegistryService
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('shadcnHelp.open', () => {
      vscode.commands.executeCommand('workbench.view.extension.shadcnHelpContainer');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('shadcnHelp.installComponent', async () => {
      const components = await registry.fetchComponents();
      const names = components.map(c => c.name);

      const selected = await vscode.window.showQuickPick(names, {
        placeHolder: 'Select a component to install',
        matchOnDescription: true
      });

      if (!selected) return;

      const component = registry.getComponent(selected);
      if (!component) return;

      const projectResult = detectProject();
      const result = await installComponent(component, projectResult.project?.packageManager);

      if (result.success) {
        vscode.window.showInformationMessage(`Shadcn Help: ${selected} installed successfully`);
        sidebarProvider.refresh();
      } else {
        vscode.window.showErrorMessage(`Shadcn Help: Failed to install ${selected} - ${result.error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('shadcnHelp.searchComponents', async () => {
      const query = await vscode.window.showInputBox({
        placeHolder: 'Search shadcn components...',
        prompt: 'Type a component name or keyword'
      });

      if (!query) return;

      const results = registry.searchComponents(query);
      if (results.length === 0) {
        vscode.window.showInformationMessage(`Shadcn Help: No components found matching "${query}"`);
        return;
      }

      const names = results.map(c => c.name);
      const selected = await vscode.window.showQuickPick(names, {
        placeHolder: `Found ${results.length} components`,
        matchOnDescription: true
      });

      if (!selected) return;

      vscode.commands.executeCommand('workbench.view.extension.shadcnHelpContainer');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('shadcnHelp.checkProject', () => {
      const result = detectProject();
      if (!result.project) {
        vscode.window.showWarningMessage(`Shadcn Help: ${result.error || 'No project detected'}`);
        return;
      }

      const p = result.project;
      const messages: string[] = [
        `React: ${p.isReact ? 'Yes' : 'No'}`,
        `Next.js: ${p.isNextJs ? 'Yes' : 'No'}`,
        `shadcn/ui: ${p.hasShadcn ? 'Yes' : 'No'}`,
        `components.json: ${p.hasComponentsJson ? 'Yes' : 'No'}`,
        `Package manager: ${p.packageManager}`
      ];

      if (p.shadcnVersion) {
        messages.push(`shadcn version: ${p.shadcnVersion}`);
      }

      vscode.window.showInformationMessage(`Shadcn Help Project Info: ${messages.join(' | ')}`);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('shadcnHelp.refresh', () => {
      sidebarProvider.refresh();
      vscode.window.showInformationMessage('Shadcn Help: Refreshed components');
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('shadcnHelp.initShadcn', async () => {
      const projectResult = detectProject();
      if (!projectResult.project) {
        vscode.window.showWarningMessage('Shadcn Help: Open a React project first');
        return;
      }

      if (projectResult.project.hasShadcn) {
        vscode.window.showInformationMessage('Shadcn Help: shadcn/ui is already initialized');
        return;
      }

      const mode = await vscode.window.showQuickPick(
        [
          { label: 'Quick Setup', description: 'Initialize with default options (non-interactive)' },
          { label: 'Interactive Setup', description: 'Walk through the setup in a terminal' }
        ],
        { placeHolder: 'How would you like to set up shadcn/ui?' }
      );

      if (!mode) return;

      if (mode.label === 'Interactive Setup') {
        initShadcnInteractive();
        vscode.window.showInformationMessage('Shadcn Help: Follow the prompts in the terminal');
      } else {
        const result = await initShadcnDefaults();
        if (result.success) {
          vscode.window.showInformationMessage('Shadcn Help: shadcn/ui initialized successfully');
          sidebarProvider.refresh();
        } else {
          vscode.window.showErrorMessage(`Shadcn Help: Init failed - ${result.error || 'Unknown error'}`);
        }
      }
    })
  );

  logger.info('Commands registered');
}
