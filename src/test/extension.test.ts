import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('maveeclabs.shadcn-helper'));
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    const shadcnCommands = commands.filter((c: string) => c.startsWith('shadcnHelper.'));
    assert.ok(shadcnCommands.length > 0, 'Expected shadcn commands to be registered');
    assert.ok(shadcnCommands.includes('shadcnHelper.open'));
    assert.ok(shadcnCommands.includes('shadcnHelper.installComponent'));
    assert.ok(shadcnCommands.includes('shadcnHelper.searchComponents'));
    assert.ok(shadcnCommands.includes('shadcnHelper.checkProject'));
    assert.ok(shadcnCommands.includes('shadcnHelper.refresh'));
  });
});
