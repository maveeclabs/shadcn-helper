import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('maveeclabs.shadcn-help'));
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    const shadcnCommands = commands.filter((c: string) => c.startsWith('shadcnHelp.'));
    assert.ok(shadcnCommands.length > 0, 'Expected shadcn commands to be registered');
    assert.ok(shadcnCommands.includes('shadcnHelp.open'));
    assert.ok(shadcnCommands.includes('shadcnHelp.installComponent'));
    assert.ok(shadcnCommands.includes('shadcnHelp.searchComponents'));
    assert.ok(shadcnCommands.includes('shadcnHelp.checkProject'));
    assert.ok(shadcnCommands.includes('shadcnHelp.refresh'));
  });
});
