#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

// npm workspace scripts change cwd to the package directory.
// INIT_CWD preserves the original directory where the user ran the command.
const userCwd = process.env['INIT_CWD'] || process.cwd();
const resolvePath = (p: string) => resolve(userCwd, p);
import { parseConfigFile } from './credentials.js';
import { resolveCredentials } from './credentials.js';
import { scanAccount } from './engine.js';
import { allScanners } from './scanners/index.js';
import { getCostByService, getCostByRegion, mergeCostsToResources } from './cost.js';
import {
  generateReport,
  saveReport,
  formatSummaryTable,
  getAllResources,
} from './report.js';
import type { AccountScanResult, CostBreakdown, ScanReport } from '@aws-resource-manager/shared';

interface CliArgs {
  command: 'scan' | 'report' | 'help';
  configPath: string;
  outputDir: string;
  account?: string;
  regions?: string[];
  startDate?: string;
  endDate?: string;
  inputPath?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  const result: CliArgs = {
    command: 'help',
    configPath: './accounts.yaml',
    outputDir: './reports',
  };

  if (args.length === 0) {
    return result;
  }

  const command = args[0];
  if (command === 'scan' || command === 'report') {
    result.command = command;
  }

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--config':
        result.configPath = args[++i];
        break;
      case '--output':
        result.outputDir = args[++i];
        break;
      case '--account':
        result.account = args[++i];
        break;
      case '--regions':
        result.regions = args[++i].split(',');
        break;
      case '--start-date':
        result.startDate = args[++i];
        break;
      case '--end-date':
        result.endDate = args[++i];
        break;
      case '--input':
        result.inputPath = args[++i];
        break;
      case '--help':
        result.command = 'help';
        break;
    }
  }

  return result;
}

function printHelp(): void {
  console.log(`
AWS Resource Manager

Usage:
  aws-resource-manager scan [options]    Run a full scan and generate report
  aws-resource-manager report [options]  View an existing report

Scan Options:
  --config <path>       Path to accounts.yaml (default: ./accounts.yaml)
  --output <dir>        Output directory for reports (default: ./reports)
  --account <name>      Scan only this account
  --regions <list>      Comma-separated regions to scan (default: all)
  --start-date <date>   Cost data start date YYYY-MM-DD (default: 30 days ago)
  --end-date <date>     Cost data end date YYYY-MM-DD (default: today)

Report Options:
  --input <path>        Path to existing report JSON file
  --help                Show this help message
`);
}

async function runScan(args: CliArgs): Promise<void> {
  console.log('Loading config from', args.configPath);
  const config = parseConfigFile(resolvePath(args.configPath));

  const accountsToScan = args.account
    ? config.accounts.filter((a) => a.name === args.account)
    : config.accounts;

  if (accountsToScan.length === 0) {
    console.error(
      args.account
        ? `Account "${args.account}" not found in config`
        : 'No accounts found in config',
    );
    process.exit(1);
  }

  console.log(`Scanning ${accountsToScan.length} account(s)...`);

  const accountResults: AccountScanResult[] = [];
  const allCostsByService: Record<string, CostBreakdown[]> = {};
  let allCostsByRegion: CostBreakdown[] = [];

  for (const account of accountsToScan) {
    console.log(`\n--- Scanning account: ${account.name} ---`);

    // Scan resources
    const result = await scanAccount(account, allScanners, {
      concurrency: 5,
      onProgress: (p) => {
        if (p.status === 'starting') {
          process.stdout.write(`  ${p.region}/${p.service}...`);
        } else if (p.status === 'complete') {
          process.stdout.write(' done\n');
        } else if (p.status === 'error') {
          process.stdout.write(` error: ${p.error}\n`);
        }
      },
    });
    accountResults.push(result);

    // Fetch cost data
    console.log('  Fetching cost data...');
    try {
      const credentials = await resolveCredentials(account);
      const costOptions =
        args.startDate && args.endDate
          ? { startDate: args.startDate, endDate: args.endDate }
          : undefined;

      const serviceCosts = await getCostByService(credentials, costOptions);
      const regionCosts = await getCostByRegion(credentials, costOptions);

      allCostsByService[account.name] = serviceCosts;
      allCostsByRegion = [...allCostsByRegion, ...regionCosts];

      // Merge costs to resources
      const resources = getAllResources([result]);
      mergeCostsToResources(resources, serviceCosts);

      console.log('  Cost data retrieved.');
    } catch (err: unknown) {
      console.warn(
        `  Warning: Could not fetch cost data: ${(err as Error).message}`,
      );
      console.warn('  (Cost Explorer API may not be enabled or accessible)');
    }
  }

  // Generate and save report
  const report = generateReport(accountResults, allCostsByService, allCostsByRegion);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPath = join(resolvePath(args.outputDir), `report-${timestamp}.json`);
  saveReport(report, outputPath);

  console.log(formatSummaryTable(report.summary));
  console.log(`\nReport saved to: ${outputPath}`);
}

function showReport(args: CliArgs): void {
  if (!args.inputPath) {
    console.error('--input <path> is required for the report command');
    process.exit(1);
  }

  const raw = readFileSync(resolvePath(args.inputPath), 'utf-8');
  const report: ScanReport = JSON.parse(raw);
  console.log(formatSummaryTable(report.summary));
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  switch (args.command) {
    case 'scan':
      await runScan(args);
      break;
    case 'report':
      showReport(args);
      break;
    case 'help':
    default:
      printHelp();
      break;
  }
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

export { parseArgs };
