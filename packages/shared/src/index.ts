export interface AwsAccountConfig {
  name: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  roleArn?: string;
  defaultRegion?: string;
}

export interface DiscoveredResource {
  id: string;
  arn: string;
  type: string;
  service: string;
  name: string;
  region: string;
  state: string;
  createdAt?: string;
  tags: Record<string, string>;
  estimatedMonthlyCost?: number;
}

export interface ServiceScanResult {
  service: string;
  region: string;
  resources: DiscoveredResource[];
  errors: string[];
}

export interface AccountScanResult {
  account: string;
  scannedAt: string;
  regions: Record<string, Record<string, ServiceScanResult>>;
}

export interface CostBreakdown {
  service: string;
  region?: string;
  amount: number;
  currency: string;
  period: { start: string; end: string };
}

export interface ScanReport {
  generatedAt: string;
  accounts: AccountScanResult[];
  costBreakdowns: Record<string, CostBreakdown[]>;
  summary: ReportSummary;
}

export interface ReportSummary {
  totalResources: number;
  totalEstimatedMonthlyCost: number;
  resourcesByService: Record<string, number>;
  costByService: Record<string, number>;
  costByRegion: Record<string, number>;
  topResources: DiscoveredResource[];
}
