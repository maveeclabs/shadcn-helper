import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { detectPackageManager } from '../../services/projectDetector';

suite('Project Detector', () => {
  let tempDir: string;

  setup(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shadcn-test-'));
  });

  teardown(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should detect npm when no lock file exists', () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({}));
    const result = detectPackageManager(tempDir);
    assert.strictEqual(result, 'npm');
  });

  test('should detect pnpm from pnpm-lock.yaml', () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({}));
    fs.writeFileSync(path.join(tempDir, 'pnpm-lock.yaml'), '');
    const result = detectPackageManager(tempDir);
    assert.strictEqual(result, 'pnpm');
  });

  test('should detect yarn from yarn.lock', () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({}));
    fs.writeFileSync(path.join(tempDir, 'yarn.lock'), '');
    const result = detectPackageManager(tempDir);
    assert.strictEqual(result, 'yarn');
  });

  test('should detect bun from bun.lockb', () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({}));
    fs.writeFileSync(path.join(tempDir, 'bun.lockb'), '');
    const result = detectPackageManager(tempDir);
    assert.strictEqual(result, 'bun');
  });
});
