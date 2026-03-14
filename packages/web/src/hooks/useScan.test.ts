import { describe, it, expect } from 'vitest';

describe('useScan', () => {
  it('should be importable', async () => {
    const mod = await import('./useScan.js');
    expect(mod.useScan).toBeDefined();
    expect(typeof mod.useScan).toBe('function');
  });
});
