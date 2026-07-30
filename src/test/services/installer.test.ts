import * as assert from 'assert';
import { detectPackageManager, getPackageManagerCmd } from '../../services/projectDetector';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

suite('Installer', () => {
  let tempDir: string;

  setup(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shadcn-test-'));
  });

  teardown(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('getPackageManagerCmd should return correct commands', () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({}));
    fs.writeFileSync(path.join(tempDir, 'pnpm-lock.yaml'), '');

    assert.ok(getPackageManagerCmd('npm', tempDir).includes('npx'));
    assert.ok(getPackageManagerCmd('pnpm', tempDir).includes('pnpm'));
    assert.ok(getPackageManagerCmd('yarn', tempDir).includes('yarn'));
    assert.ok(getPackageManagerCmd('bun', tempDir).includes('bun'));
  });
});
