import { describe, it, expect } from 'vitest';
import { getAllResources, buildSummary, generateReport, formatSummaryTable } from './report.js';
import type { AccountScanResult, CostBreakdown, DiscoveredResource } from '@aws-resource-manager/shared';

const mockResource = (overrides: Partial<DiscoveredResource> = {}): DiscoveredResource => ({
  id: 'r-1',
  arn: 'arn:aws:ec2:us-east-1::instance/r-1',
  type: 'ec2:instance',
  service: 'ec2',
  name: 'test-instance',
  region: 'us-east-1',
  state: 'running',
  tags: {},
  ...overrides,
});

const mockAccount: AccountScanResult = {
  account: 'test-account',
  scannedAt: '2024-01-01T00:00:00Z',
  regions: {
    'us-east-1': {
      ec2: {
        service: 'ec2',
        region: 'us-east-1',
        resources: [
          mockResource({ id: 'i-1', name: 'server-1' }),
          mockResource({ id: 'i-2', name: 'server-2' }),
        ],
        errors: [],
      },
    },
    'us-west-2': {
      ec2: {
        service: 'ec2',
        region: 'us-west-2',
        resources: [mockResource({ id: 'i-3', name: 'server-3', region: 'us-west-2' })],
        errors: [],
      },
    },
  },
};

describe('getAllResources', () => {
  it('flattens resources from all accounts and regions', () => {
    const resources = getAllResources([mockAccount]);
    expect(resources).toHaveLength(3);
  });

  it('handles empty accounts', () => {
    expect(getAllResources([])).toHaveLength(0);
  });
});

describe('buildSummary', () => {
  it('calculates correct totals', () => {
    const resources = [
      mockResource({ service: 'ec2', estimatedMonthlyCost: 50 }),
      mockResource({ id: 'r-2', service: 'ec2', estimatedMonthlyCost: 30 }),
      mockResource({ id: 'r-3', service: 's3' }),
    ];

    const costByService: CostBreakdown[] = [
      { service: 'ec2', amount: 80, currency: 'USD', period: { start: '2024-01-01', end: '2024-02-01' } },
      { service: 's3', amount: 10, currency: 'USD', period: { start: '2024-01-01', end: '2024-02-01' } },
    ];

    const costByRegion: CostBreakdown[] = [
      { service: '', region: 'us-east-1', amount: 70, currency: 'USD', period: { start: '2024-01-01', end: '2024-02-01' } },
      { service: '', region: 'us-west-2', amount: 20, currency: 'USD', period: { start: '2024-01-01', end: '2024-02-01' } },
    ];

    const summary = buildSummary(resources, costByService, costByRegion);

    expect(summary.totalResources).toBe(3);
    expect(summary.totalEstimatedMonthlyCost).toBe(90);
    expect(summary.resourcesByService).toEqual({ ec2: 2, s3: 1 });
    expect(summary.costByService).toEqual({ ec2: 80, s3: 10 });
    expect(summary.costByRegion).toEqual({ 'us-east-1': 70, 'us-west-2': 20 });
    expect(summary.topResources).toHaveLength(2); // only ones with cost
  });
});

describe('generateReport', () => {
  it('produces a complete report', () => {
    const report = generateReport([mockAccount], {}, []);

    expect(report.generatedAt).toBeDefined();
    expect(report.accounts).toHaveLength(1);
    expect(report.summary.totalResources).toBe(3);
  });
});

describe('formatSummaryTable', () => {
  it('produces human-readable output', () => {
    const summary = buildSummary(
      [mockResource({ estimatedMonthlyCost: 100 })],
      [{ service: 'ec2', amount: 100, currency: 'USD', period: { start: '2024-01-01', end: '2024-02-01' } }],
      [],
    );

    const output = formatSummaryTable(summary);
    expect(output).toContain('Total Resources: 1');
    expect(output).toContain('$100.00');
    expect(output).toContain('ec2');
  });
});
