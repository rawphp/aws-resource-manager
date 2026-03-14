import { describe, it, expect } from 'vitest';

describe('useAccounts', () => {
  it('should be importable', async () => {
    const mod = await import('./useAccounts.js');
    expect(mod.useAccounts).toBeDefined();
    expect(typeof mod.useAccounts).toBe('function');
  });
});
