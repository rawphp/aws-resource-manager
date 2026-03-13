import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import type { AwsAccountConfig } from '@aws-resource-manager/shared';

export interface CredentialsConfig {
  accounts: AwsAccountConfig[];
}

export function parseConfigFile(filePath: string): CredentialsConfig {
  const raw = readFileSync(filePath, 'utf-8');
  return parseConfigYaml(raw);
}

export function parseConfigYaml(yamlContent: string): CredentialsConfig {
  const parsed = parse(yamlContent);

  if (!parsed || !Array.isArray(parsed.accounts)) {
    throw new Error('Config must contain an "accounts" array');
  }

  const accounts: AwsAccountConfig[] = parsed.accounts.map(
    (acc: Record<string, unknown>, i: number) => {
      if (!acc.name || typeof acc.name !== 'string') {
        throw new Error(`Account ${i + 1}: "name" is required`);
      }
      if (!acc.accessKeyId || typeof acc.accessKeyId !== 'string') {
        throw new Error(`Account "${acc.name}": "accessKeyId" is required`);
      }
      if (!acc.secretAccessKey || typeof acc.secretAccessKey !== 'string') {
        throw new Error(
          `Account "${acc.name}": "secretAccessKey" is required`,
        );
      }

      return {
        name: acc.name as string,
        accessKeyId: acc.accessKeyId as string,
        secretAccessKey: acc.secretAccessKey as string,
        sessionToken: (acc.sessionToken as string) || undefined,
        roleArn: (acc.roleArn as string) || undefined,
        defaultRegion: (acc.defaultRegion as string) || undefined,
      };
    },
  );

  return { accounts };
}

export interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export async function resolveCredentials(
  account: AwsAccountConfig,
): Promise<AwsCredentials> {
  if (account.roleArn) {
    const stsClient = new STSClient({
      region: account.defaultRegion || 'us-east-1',
      credentials: {
        accessKeyId: account.accessKeyId,
        secretAccessKey: account.secretAccessKey,
        sessionToken: account.sessionToken,
      },
    });

    const response = await stsClient.send(
      new AssumeRoleCommand({
        RoleArn: account.roleArn,
        RoleSessionName: `aws-resource-manager-${account.name}`,
        DurationSeconds: 3600,
      }),
    );

    if (!response.Credentials) {
      throw new Error(
        `Failed to assume role ${account.roleArn} for account "${account.name}"`,
      );
    }

    return {
      accessKeyId: response.Credentials.AccessKeyId!,
      secretAccessKey: response.Credentials.SecretAccessKey!,
      sessionToken: response.Credentials.SessionToken,
    };
  }

  return {
    accessKeyId: account.accessKeyId,
    secretAccessKey: account.secretAccessKey,
    sessionToken: account.sessionToken,
  };
}
