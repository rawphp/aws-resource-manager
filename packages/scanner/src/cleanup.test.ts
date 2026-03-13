import { describe, it, expect } from 'vitest';
import { canDelete, buildDryRunSummary } from './cleanup.js';
import type { DiscoveredResource } from '@aws-resource-manager/shared';

const mockResource = (overrides: Partial<DiscoveredResource> = {}): DiscoveredResource => ({
  id: 'r-1',
  arn: 'arn:aws:ec2:us-east-1::instance/r-1',
  type: 'ec2:instance:t3.micro',
  service: 'ec2',
  name: 'test',
  region: 'us-east-1',
  state: 'running',
  tags: {},
  ...overrides,
});

describe('canDelete', () => {
  it('returns true for supported resource types', () => {
    expect(canDelete(mockResource({ type: 'ec2:instance:t3.micro' }))).toBe(true);
    expect(canDelete(mockResource({ type: 'ec2:volume:gp3:100GB' }))).toBe(true);
    expect(canDelete(mockResource({ type: 'ec2:elastic-ip' }))).toBe(true);
    expect(canDelete(mockResource({ type: 's3:bucket', service: 's3' }))).toBe(true);
    expect(canDelete(mockResource({ type: 'lambda:function:nodejs20.x', service: 'lambda' }))).toBe(true);
    expect(canDelete(mockResource({ type: 'elb:application', service: 'elb' }))).toBe(true);
  });

  it('returns false for unsupported resource types', () => {
    expect(canDelete(mockResource({ type: 'eks:cluster:1.28', service: 'eks' }))).toBe(false);
    expect(canDelete(mockResource({ type: 'opensearch:domain', service: 'opensearch' }))).toBe(false);
  });
});

describe('buildDryRunSummary', () => {
  it('separates deletable from non-deletable', () => {
    const resources = [
      mockResource({ id: '1', type: 'ec2:instance:t3.micro' }),
      mockResource({ id: '2', type: 'eks:cluster:1.28', service: 'eks' }),
      mockResource({ id: '3', type: 's3:bucket', service: 's3' }),
    ];

    const { deletable, notDeletable } = buildDryRunSummary(resources);

    expect(deletable).toHaveLength(2);
    expect(notDeletable).toHaveLength(1);
    expect(notDeletable[0].id).toBe('2');
  });

  it('handles empty list', () => {
    const { deletable, notDeletable } = buildDryRunSummary([]);
    expect(deletable).toHaveLength(0);
    expect(notDeletable).toHaveLength(0);
  });
});
