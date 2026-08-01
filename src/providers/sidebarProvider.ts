import * as vscode from 'vscode';
import * as path from 'path';
import { Logger } from '../utils/logger';
import { RegistryService } from '../services/registry';
import { ComponentTracker } from '../services/tracking';
import { detectProject } from '../services/projectDetector';
import { checkComponentDependencies } from '../services/dependencyChecker';
import { installComponent, initShadcnDefaults, initShadcnInteractive } from '../services/installer';
import { ProjectInfo, ShadcnComponent } from '../types';
import { WebviewMessage } from '../types';

const logger = Logger.getInstance();

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'shadcnHelper.sidebar';

  private _view?: vscode.WebviewView;
  private registry: RegistryService;
  private tracker: ComponentTracker;
  private project: ProjectInfo | null = null;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    registry: RegistryService,
    tracker: ComponentTracker
  ) {
    this.registry = registry;
    this.tracker = tracker;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this.getHtmlContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(
      (message: WebviewMessage) => this.handleMessage(message).catch(err =>
        logger.error(`Unhandled message handler error: ${err}`)
      ),
      undefined
    );

    this.sendProjectInfo();
  }

  refresh(): void {
    this.tracker.refresh();
    this.sendProjectInfo();
    if (this._view) {
      this.sendComponents();
    }
  }

  private async handleMessage(message: WebviewMessage): Promise<void> {
    try {
      logger.debug(`Received message from webview: ${message.type}`);

      switch (message.type) {
      case 'ready':
        await this.initializeView();
        break;

      case 'search':
        this.handleSearch(message.payload as { query: string });
        break;

      case 'install':
        await this.handleInstall(message.payload as { name: string });
        break;

      case 'getDetails':
        await this.handleGetDetails(message.payload as { name: string });
        break;

      case 'checkDependencies':
        this.handleCheckDependencies(message.payload as { name: string });
        break;

      case 'openDocs':
        this.handleOpenDocs(message.payload as { url: string });
        break;

      case 'getAllStatuses':
        this.handleGetAllStatuses(message.payload as { names: string[] });
        break;

      case 'initShadcn':
        await this.handleInitShadcn(message.payload as { mode: 'defaults' | 'interactive' });
        break;

      default:
        logger.warn(`Unknown message type: ${message.type}`);
    }
    } catch (error) {
      logger.error(`Error handling message ${message.type}: ${error}`);
    }
  }

  private async initializeView(): Promise<void> {
    const projectResult = detectProject();
    this.project = projectResult.project;

    if (this.project) {
      this.tracker.refresh();
    }

    await this.sendComponents();
    this.sendProjectInfo();
  }

  private async sendComponents(): Promise<void> {
    const components = await this.registry.fetchComponents();
    const statuses = this.tracker.getAllStatuses(components.map(c => c.name));

    const componentsWithStatus = components.map(c => ({
      ...c,
      status: statuses.find(s => s.name === c.name)?.status || 'unknown'
    }));

    this.postMessage({
      type: 'components',
      payload: componentsWithStatus
    });
  }

  private sendProjectInfo(): void {
    const projectResult = detectProject();
    this.project = projectResult.project;

    this.postMessage({
      type: 'projectInfo',
      payload: this.project || { error: projectResult.error || 'No workspace' }
    });
  }

  private handleSearch(payload: { query: string }): void {
    const results = this.registry.searchComponents(payload.query);
    const statuses = this.tracker.getAllStatuses(results.map(c => c.name));

    const resultsWithStatus = results.map(c => ({
      ...c,
      status: statuses.find(s => s.name === c.name)?.status || 'unknown'
    }));

    this.postMessage({
      type: 'searchResults',
      payload: { query: payload.query, results: resultsWithStatus }
    });
  }

  private async handleInstall(payload: { name: string }): Promise<void> {
    const component = this.registry.getComponent(payload.name);
    if (!component) {
      this.postMessage({
        type: 'installResult',
        payload: { success: false, component: payload.name, error: 'Component not found' }
      });
      return;
    }

    this.postMessage({
      type: 'installProgress',
      payload: { component: payload.name, status: 'starting' }
    });

    const result = await installComponent(component, this.project?.packageManager);

    if (result.success) {
      this.tracker.markInstalled(payload.name);
    }

    this.postMessage({
      type: 'installResult',
      payload: result
    });
  }

  private async handleInitShadcn(payload: { mode: 'defaults' | 'interactive' }): Promise<void> {
    if (payload.mode === 'interactive') {
      initShadcnInteractive();
      this.postMessage({
        type: 'initResult',
        payload: { success: true, interactive: true }
      });
      return;
    }

    this.postMessage({
      type: 'initProgress',
      payload: { status: 'running' }
    });

    const result = await initShadcnDefaults();

    this.postMessage({
      type: 'initResult',
      payload: result
    });

    if (result.success) {
      this.refresh();
    }
  }

  private async handleGetDetails(payload: { name: string }): Promise<void> {
    const component = await this.registry.fetchComponentDetail(payload.name, this.project?.uiVariant) || this.registry.getComponent(payload.name);
    if (!component) {
      this.postMessage({
        type: 'componentDetails',
        payload: { error: 'Component not found' }
      });
      return;
    }

    const deps = checkComponentDependencies(component, this.project?.uiVariant);
    const status = this.tracker.getStatus(payload.name);

    this.postMessage({
      type: 'componentDetails',
      payload: {
        ...component,
        status: status.status,
        dependenciesCheck: deps
      }
    });
  }

  private handleCheckDependencies(payload: { name: string }): void {
    const component = this.registry.getComponent(payload.name);
    if (!component) {
      return;
    }

    const result = checkComponentDependencies(component, this.project?.uiVariant);
    this.postMessage({
      type: 'dependencyCheckResult',
      payload: { name: payload.name, ...result }
    });
  }

  private handleOpenDocs(payload: { url: string }): void {
    vscode.env.openExternal(vscode.Uri.parse(payload.url));
  }

  private handleGetAllStatuses(payload: { names: string[] }): void {
    const statuses = this.tracker.getAllStatuses(payload.names);
    this.postMessage({
      type: 'allStatuses',
      payload: statuses
    });
  }

  private postMessage(message: WebviewMessage): void {
    this._view?.webview.postMessage(message);
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'webview.js')
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; frame-src https://ui.shadcn.com;">
</head>
<body>
  <div id="root"><div class="loading-state"><div class="loading-spinner"></div><p>Loading Shadcn Helper...</p></div></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 64; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
