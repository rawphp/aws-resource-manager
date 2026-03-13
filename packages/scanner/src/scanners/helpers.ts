import type { AwsCredentials } from '../credentials.js';

export function makeCredentials(creds: AwsCredentials) {
  return {
    accessKeyId: creds.accessKeyId,
    secretAccessKey: creds.secretAccessKey,
    sessionToken: creds.sessionToken,
  };
}

export function extractTags(
  tags?: { Key?: string; Value?: string }[],
): Record<string, string> {
  const result: Record<string, string> = {};
  if (tags) {
    for (const tag of tags) {
      if (tag.Key) result[tag.Key] = tag.Value || '';
    }
  }
  return result;
}

export function findName(tags: Record<string, string>): string {
  return tags['Name'] || tags['name'] || '';
}
