import { activate as activateImpl, deactivate as deactivateImpl } from './activation/activate';

export function activate(context: import('vscode').ExtensionContext): void {
  activateImpl(context);
}

export function deactivate(): void {
  deactivateImpl();
}
