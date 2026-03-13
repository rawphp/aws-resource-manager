import { describe, it, expect } from 'vitest';
import { parseConfigYaml, resolveCredentials } from './credentials.js';
import type { AwsAccountConfig } from '@aws-resource-manager/shared';

describe('parseConfigYaml', () => {
  it('parses valid config with one account', () => {
    const yaml = `
accounts:
  - name: production
    accessKeyId: AKIAIOSFODNN7EXAMPLE
    secretAccessKey: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
`;
    const config = parseConfigYaml(yaml);
    expect(config.accounts).toHaveLength(1);
    expect(config.accounts[0].name).toBe('production');
    expect(config.accounts[0].accessKeyId).toBe('AKIAIOSFODNN7EXAMPLE');
  });

  it('parses config with multiple accounts', () => {
    const yaml = `
accounts:
  - name: production
    accessKeyId: AKIAIOSFODNN7EXAMPLE
    secretAccessKey: secret1
  - name: staging
    accessKeyId: AKIAIOSFODNN8EXAMPLE
    secretAccessKey: secret2
    roleArn: arn:aws:iam::123456789012:role/ReadOnly
`;
    const config = parseConfigYaml(yaml);
    expect(config.accounts).toHaveLength(2);
    expect(config.accounts[1].name).toBe('staging');
    expect(config.accounts[1].roleArn).toBe(
      'arn:aws:iam::123456789012:role/ReadOnly',
    );
  });

  it('parses optional fields', () => {
    const yaml = `
accounts:
  - name: dev
    accessKeyId: AKIAIOSFODNN7EXAMPLE
    secretAccessKey: secret
    sessionToken: token123
    defaultRegion: eu-west-1
`;
    const config = parseConfigYaml(yaml);
    expect(config.accounts[0].sessionToken).toBe('token123');
    expect(config.accounts[0].defaultRegion).toBe('eu-west-1');
  });

  it('throws on missing accounts array', () => {
    expect(() => parseConfigYaml('foo: bar')).toThrow(
      'Config must contain an "accounts" array',
    );
  });

  it('throws on missing name', () => {
    const yaml = `
accounts:
  - accessKeyId: key
    secretAccessKey: secret
`;
    expect(() => parseConfigYaml(yaml)).toThrow('"name" is required');
  });

  it('throws on missing accessKeyId', () => {
    const yaml = `
accounts:
  - name: test
    secretAccessKey: secret
`;
    expect(() => parseConfigYaml(yaml)).toThrow('"accessKeyId" is required');
  });

  it('throws on missing secretAccessKey', () => {
    const yaml = `
accounts:
  - name: test
    accessKeyId: key
`;
    expect(() => parseConfigYaml(yaml)).toThrow(
      '"secretAccessKey" is required',
    );
  });
});

describe('resolveCredentials', () => {
  it('returns direct credentials when no roleArn', async () => {
    const account: AwsAccountConfig = {
      name: 'test',
      accessKeyId: 'AKIA123',
      secretAccessKey: 'secret123',
    };
    const creds = await resolveCredentials(account);
    expect(creds.accessKeyId).toBe('AKIA123');
    expect(creds.secretAccessKey).toBe('secret123');
    expect(creds.sessionToken).toBeUndefined();
  });

  it('returns session token when provided', async () => {
    const account: AwsAccountConfig = {
      name: 'test',
      accessKeyId: 'AKIA123',
      secretAccessKey: 'secret123',
      sessionToken: 'session456',
    };
    const creds = await resolveCredentials(account);
    expect(creds.sessionToken).toBe('session456');
  });
});
