import { describe, it, expect } from 'vitest';
import { parseArgs } from './cli.js';

describe('parseArgs', () => {
  it('defaults to help command', () => {
    const args = parseArgs(['node', 'cli.js']);
    expect(args.command).toBe('help');
  });

  it('parses scan command', () => {
    const args = parseArgs(['node', 'cli.js', 'scan']);
    expect(args.command).toBe('scan');
    expect(args.configPath).toBe('./accounts.yaml');
    expect(args.outputDir).toBe('./reports');
  });

  it('parses scan with all options', () => {
    const args = parseArgs([
      'node', 'cli.js', 'scan',
      '--config', 'my-accounts.yaml',
      '--output', './out',
      '--account', 'production',
      '--regions', 'us-east-1,us-west-2',
      '--start-date', '2024-01-01',
      '--end-date', '2024-02-01',
    ]);
    expect(args.command).toBe('scan');
    expect(args.configPath).toBe('my-accounts.yaml');
    expect(args.outputDir).toBe('./out');
    expect(args.account).toBe('production');
    expect(args.regions).toEqual(['us-east-1', 'us-west-2']);
    expect(args.startDate).toBe('2024-01-01');
    expect(args.endDate).toBe('2024-02-01');
  });

  it('parses report command with input', () => {
    const args = parseArgs([
      'node', 'cli.js', 'report',
      '--input', './reports/report.json',
    ]);
    expect(args.command).toBe('report');
    expect(args.inputPath).toBe('./reports/report.json');
  });

  it('parses --help flag', () => {
    const args = parseArgs(['node', 'cli.js', 'scan', '--help']);
    expect(args.command).toBe('help');
  });
});
