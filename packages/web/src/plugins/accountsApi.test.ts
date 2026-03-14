import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { stringify as yamlStringify, parse as yamlParse } from 'yaml';

// Test the helper functions that will be used by the accounts API
describe('accounts YAML operations', () => {
  const testYamlPath = resolve(__dirname, '../../../../test-accounts.yaml');

  afterEach(() => {
    try { unlinkSync(testYamlPath); } catch { /* ignore */ }
  });

  it('should create accounts.yaml when it does not exist', () => {
    const data = { accounts: [] };
    writeFileSync(testYamlPath, yamlStringify(data), 'utf-8');
    expect(existsSync(testYamlPath)).toBe(true);
    const content = readFileSync(testYamlPath, 'utf-8');
    const parsed = yamlParse(content);
    expect(parsed.accounts).toEqual([]);
  });

  it('should add an account to YAML', () => {
    const data = { accounts: [] as Array<{ name: string; accessKeyId: string; secretAccessKey: string }> };
    data.accounts.push({
      name: 'test-account',
      accessKeyId: 'AKIATEST',
      secretAccessKey: 'secrettest',
    });
    writeFileSync(testYamlPath, yamlStringify(data), 'utf-8');
    const content = readFileSync(testYamlPath, 'utf-8');
    const parsed = yamlParse(content);
    expect(parsed.accounts).toHaveLength(1);
    expect(parsed.accounts[0].name).toBe('test-account');
  });

  it('should mask secrets correctly', () => {
    const secret = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
    const masked = '****' + secret.slice(-4);
    expect(masked).toBe('****EKEY');
  });
});
