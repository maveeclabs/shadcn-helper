const { defineConfig } = require('@vscode/test-cli');

module.exports = defineConfig({
  files: 'out/test/**/*.test.js',
  workspaceFolder: './test-fixtures/empty-workspace',
  mocha: {
    ui: 'tdd',
    timeout: 20000
  }
});
