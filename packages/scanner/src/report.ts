import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type {
  AccountScanResult,
  CostBreakdown,
  DiscoveredResource,
  ReportSummary,
  ScanReport,
} from '@aws-resource-manager/shared';

export function getAllResources(accounts: AccountScanResult[]): DiscoveredResource[] {
  const resources: DiscoveredResource[] = [];
  for (const account of accounts) {
    for (const regionResults of Object.values(account.regions)) {
      for (const scanResult of Object.values(regionResults)) {
        resources.push(...scanResult.resources);
      }
    }
  }
  return resources;
}

export function buildSummary(
  resources: DiscoveredResource[],
  costByService: CostBreakdown[],
  costByRegion: CostBreakdown[],
): ReportSummary {
  const resourcesByService: Record<string, number> = {};
  const costByServiceMap: Record<string, number> = {};
  const costByRegionMap: Record<string, number> = {};

  for (const r of resources) {
    resourcesByService[r.service] = (resourcesByService[r.service] || 0) + 1;
  }

  for (const c of costByService) {
    costByServiceMap[c.service] = (costByServiceMap[c.service] || 0) + c.amount;
  }

  for (const c of costByRegion) {
    if (c.region) {
      costByRegionMap[c.region] = (costByRegionMap[c.region] || 0) + c.amount;
    }
  }

  const totalEstimatedMonthlyCost = costByService.reduce(
    (sum, c) => sum + c.amount,
    0,
  );

  const topResources = [...resources]
    .filter((r) => r.estimatedMonthlyCost !== undefined)
    .sort((a, b) => (b.estimatedMonthlyCost || 0) - (a.estimatedMonthlyCost || 0))
    .slice(0, 10);

  return {
    totalResources: resources.length,
    totalEstimatedMonthlyCost: Math.round(totalEstimatedMonthlyCost * 100) / 100,
    resourcesByService,
    costByService: costByServiceMap,
    costByRegion: costByRegionMap,
    topResources,
  };
}

export function generateReport(
  accounts: AccountScanResult[],
  costBreakdowns: Record<string, CostBreakdown[]>,
  costByRegion: CostBreakdown[],
): ScanReport {
  const resources = getAllResources(accounts);

  const allServiceCosts = Object.values(costBreakdowns).flat();
  const summary = buildSummary(resources, allServiceCosts, costByRegion);

  return {
    generatedAt: new Date().toISOString(),
    accounts,
    costBreakdowns,
    summary,
  };
}

export function saveReport(report: ScanReport, outputPath: string): void {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
}

export function formatSummaryTable(summary: ReportSummary): string {
  const lines: string[] = [];
  lines.push('');
  lines.push('=== AWS Resource Manager - Scan Summary ===');
  lines.push('');
  lines.push(`Total Resources: ${summary.totalResources}`);
  lines.push(
    `Total Estimated Monthly Cost: $${summary.totalEstimatedMonthlyCost.toFixed(2)}`,
  );
  lines.push('');

  // Resources by service
  lines.push('Resources by Service:');
  lines.push(
    '  Service'.padEnd(25) +
      'Count'.padStart(8) +
      'Est. Cost'.padStart(14),
  );
  lines.push('  ' + '-'.repeat(45));

  const services = Object.entries(summary.resourcesByService).sort(
    (a, b) => b[1] - a[1],
  );
  for (const [service, count] of services) {
    const cost = summary.costByService[service];
    const costStr = cost !== undefined ? `$${cost.toFixed(2)}` : 'N/A';
    lines.push(
      `  ${service.padEnd(23)}${String(count).padStart(8)}${costStr.padStart(14)}`,
    );
  }

  lines.push('');

  // Cost by region
  if (Object.keys(summary.costByRegion).length > 0) {
    lines.push('Cost by Region:');
    const regions = Object.entries(summary.costByRegion).sort(
      (a, b) => b[1] - a[1],
    );
    for (const [region, cost] of regions) {
      lines.push(`  ${region.padEnd(25)}$${cost.toFixed(2)}`);
    }
    lines.push('');
  }

  // Top resources
  if (summary.topResources.length > 0) {
    lines.push('Top 10 Most Expensive Resources:');
    for (const r of summary.topResources) {
      lines.push(
        `  ${r.name.substring(0, 30).padEnd(32)}${r.service.padEnd(15)}${r.region.padEnd(16)}$${(r.estimatedMonthlyCost || 0).toFixed(2)}`,
      );
    }
    lines.push('');
  }

  return lines.join('\n');
}
