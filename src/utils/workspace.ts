import * as vscode from 'vscode';

export function getWorkspaceRoot(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return undefined;
  }
  return folders[0].uri.fsPath;
}

export function getWorkspaceRelativePath(relativePath: string): string | undefined {
  const root = getWorkspaceRoot();
  if (!root) return undefined;
  return vscode.Uri.joinPath(vscode.Uri.file(root), relativePath).fsPath;
}

export function hasWorkspace(): boolean {
  return !!getWorkspaceRoot();
}
