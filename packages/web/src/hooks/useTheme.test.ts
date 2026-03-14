import { describe, it, expect } from 'vitest';

describe('useTheme', () => {
  it('should be importable', async () => {
    const mod = await import('./useTheme.js');
    expect(mod.useTheme).toBeDefined();
    expect(mod.ThemeProvider).toBeDefined();
  });

  it('should export theme names', async () => {
    const mod = await import('./useTheme.js');
    expect(mod.THEMES).toBeDefined();
    expect(mod.THEMES).toContain('light');
    expect(mod.THEMES).toContain('dark');
    expect(mod.THEMES).toContain('cyberpunk');
  });
});
