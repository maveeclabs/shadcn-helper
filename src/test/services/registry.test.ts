import * as assert from 'assert';
import { RegistryService } from '../../services/registry';

suite('Registry Service', () => {
  let registry: RegistryService;

  setup(() => {
    registry = new RegistryService('https://ui.shadcn.com');
  });

  test('should have default components', async () => {
    const components = await registry.fetchComponents();
    assert.ok(components.length > 0, 'Expected at least one component');
  });

  test('should find Button component', async () => {
    await registry.fetchComponents();
    const button = registry.getComponent('Button');
    assert.ok(button, 'Expected Button component to exist');
    assert.strictEqual(button!.name, 'Button');
  });

  test('should search components by name', async () => {
    await registry.fetchComponents();
    const results = registry.searchComponents('table');
    assert.ok(results.length > 0, 'Expected at least one table match');
    const hasTable = results.some(c => c.name === 'Table');
    assert.ok(hasTable, 'Expected Table in search results');
  });

  test('should be case-insensitive for getComponent', async () => {
    await registry.fetchComponents();
    const lower = registry.getComponent('button');
    const upper = registry.getComponent('BUTTON');
    const mixed = registry.getComponent('Button');
    assert.ok(lower && upper && mixed, 'Expected all case variants to match');
  });

  test('should return undefined for unknown component', async () => {
    await registry.fetchComponents();
    const result = registry.getComponent('NonExistentComponent999');
    assert.strictEqual(result, undefined);
  });
});
