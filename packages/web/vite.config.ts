import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

function reportsApiPlugin(): Plugin {
  // Reports directory is at the project root (two levels up from packages/web)
  const reportsDir = resolve(__dirname, '../../reports');

  return {
    name: 'reports-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/reports') {
          res.setHeader('Content-Type', 'application/json');

          if (!existsSync(reportsDir)) {
            res.end(JSON.stringify([]));
            return;
          }

          const files = readdirSync(reportsDir)
            .filter((f) => f.endsWith('.json'))
            .sort()
            .reverse(); // newest first (filenames contain timestamps)

          res.end(JSON.stringify(files));
          return;
        }

        if (req.url?.startsWith('/api/reports/')) {
          const filename = req.url.replace('/api/reports/', '');

          // Prevent path traversal
          if (filename.includes('..') || filename.includes('/')) {
            res.statusCode = 400;
            res.end('Invalid filename');
            return;
          }

          const filePath = join(reportsDir, filename);
          if (!existsSync(filePath)) {
            res.statusCode = 404;
            res.end('Report not found');
            return;
          }

          res.setHeader('Content-Type', 'application/json');
          res.end(readFileSync(filePath, 'utf-8'));
          return;
        }

        next();
      });
    },
  };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function deleteApiPlugin(): Plugin {
  const configPath = resolve(__dirname, '../../accounts.yaml');

  return {
    name: 'delete-api',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (req.url === '/api/delete' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');

          try {
            const body = await readBody(req);
            if (!body) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Request body is required' }));
              return;
            }

            let parsed: { accountName?: string; resources?: unknown[] };
            try {
              parsed = JSON.parse(body);
            } catch {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON' }));
              return;
            }

            if (!parsed.accountName || !Array.isArray(parsed.resources) || parsed.resources.length === 0) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'accountName and non-empty resources array are required' }));
              return;
            }

            // Dynamic import to avoid bundling scanner deps into the client
            const { parseConfigFile, resolveCredentials } = await import(
              '../../packages/scanner/src/credentials.js'
            );
            const { deleteResource } = await import(
              '../../packages/scanner/src/cleanup.js'
            );

            if (!existsSync(configPath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'accounts.yaml not found' }));
              return;
            }

            const config = parseConfigFile(configPath);
            const account = config.accounts.find(
              (a: { name: string }) => a.name === parsed.accountName,
            );

            if (!account) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: `Account "${parsed.accountName}" not found in accounts.yaml` }));
              return;
            }

            const credentials = await resolveCredentials(account);

            const results = [];
            for (const resource of parsed.resources) {
              const result = await deleteResource(credentials, resource);
              results.push(result);
            }

            res.end(JSON.stringify({ results }));
          } catch (err: unknown) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: (err as Error).message }));
          }
          return;
        }

        next();
      });
    },
  };
}

let scanning = false;

function scanApiPlugin(): Plugin {
  const configPath = resolve(__dirname, '../../accounts.yaml');
  const reportsDir = resolve(__dirname, '../../reports');

  return {
    name: 'scan-api',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // GET /api/scan/status
        if (req.url === '/api/scan/status' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ scanning }));
          return;
        }

        // POST /api/scan
        if (req.url === '/api/scan' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');

          if (scanning) {
            res.statusCode = 409;
            res.end(JSON.stringify({ error: 'A scan is already in progress' }));
            return;
          }

          if (!existsSync(configPath)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'accounts.yaml not found. Add accounts first.' }));
            return;
          }

          scanning = true;

          try {
            const { parseConfigFile, resolveCredentials } = await import(
              '../../packages/scanner/src/credentials.js'
            );
            const { scanAccount } = await import(
              '../../packages/scanner/src/engine.js'
            );
            const { allScanners } = await import(
              '../../packages/scanner/src/scanners/index.js'
            );
            const { getCostByService, getCostByRegion, mergeCostsToResources } = await import(
              '../../packages/scanner/src/cost.js'
            );
            const { generateReport, saveReport, getAllResources } = await import(
              '../../packages/scanner/src/report.js'
            );

            const config = parseConfigFile(configPath);

            if (!config.accounts || config.accounts.length === 0) {
              scanning = false;
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'No accounts configured in accounts.yaml' }));
              return;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const accountResults: any[] = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const allCostsByService: Record<string, any[]> = {};
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let allCostsByRegion: any[] = [];

            for (const account of config.accounts) {
              const result = await scanAccount(account, allScanners, {
                concurrency: 5,
              });
              accountResults.push(result);

              // Fetch cost data
              try {
                const credentials = await resolveCredentials(account);
                const serviceCosts = await getCostByService(credentials);
                const regionCosts = await getCostByRegion(credentials);

                allCostsByService[account.name] = serviceCosts;
                allCostsByRegion = [...allCostsByRegion, ...regionCosts];

                const resources = getAllResources([result]);
                mergeCostsToResources(resources, serviceCosts);
              } catch {
                // Cost Explorer may not be available — continue without costs
              }
            }

            const report = generateReport(accountResults, allCostsByService, allCostsByRegion);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const filename = `report-${timestamp}.json`;
            const outputPath = join(reportsDir, filename);
            saveReport(report, outputPath);

            scanning = false;
            res.end(JSON.stringify({ success: true, filename }));
          } catch (err: unknown) {
            scanning = false;
            res.statusCode = 500;
            res.end(JSON.stringify({ error: (err as Error).message }));
          }
          return;
        }

        next();
      });
    },
  };
}

interface AccountEntry {
  name: string;
  accessKeyId: string;
  secretAccessKey: string;
  defaultRegion?: string;
  roleArn?: string;
  sessionToken?: string;
}

function maskSecret(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return '****' + value.slice(-4);
}

function accountsApiPlugin(): Plugin {
  const configPath = resolve(__dirname, '../../accounts.yaml');

  function readAccounts(): AccountEntry[] {
    if (!existsSync(configPath)) return [];
    const content = readFileSync(configPath, 'utf-8');
    // Dynamic import won't work at top level for yaml, so we use a sync require-style approach
    // The yaml package is available via the scanner workspace
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const yaml = require('yaml');
      const parsed = yaml.parse(content);
      return parsed?.accounts || [];
    } catch {
      return [];
    }
  }

  function writeAccounts(accounts: AccountEntry[]): void {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const yaml = require('yaml');
    writeFileSync(configPath, yaml.stringify({ accounts }), 'utf-8');
  }

  return {
    name: 'accounts-api',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // GET /api/accounts
        if (req.url === '/api/accounts' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const accounts = readAccounts().map((a) => ({
            ...a,
            secretAccessKey: maskSecret(a.secretAccessKey) || '',
            sessionToken: maskSecret(a.sessionToken),
          }));
          res.end(JSON.stringify({ accounts }));
          return;
        }

        // POST /api/accounts
        if (req.url === '/api/accounts' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const body = await readBody(req);
            const account: AccountEntry = JSON.parse(body);

            if (!account.name || !account.accessKeyId || !account.secretAccessKey) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'name, accessKeyId, and secretAccessKey are required' }));
              return;
            }

            const accounts = readAccounts();
            if (accounts.some((a) => a.name === account.name)) {
              res.statusCode = 409;
              res.end(JSON.stringify({ error: `Account "${account.name}" already exists` }));
              return;
            }

            // Only include defined optional fields
            const entry: AccountEntry = {
              name: account.name,
              accessKeyId: account.accessKeyId,
              secretAccessKey: account.secretAccessKey,
            };
            if (account.defaultRegion) entry.defaultRegion = account.defaultRegion;
            if (account.roleArn) entry.roleArn = account.roleArn;
            if (account.sessionToken) entry.sessionToken = account.sessionToken;

            accounts.push(entry);
            writeAccounts(accounts);
            res.statusCode = 201;
            res.end(JSON.stringify({ success: true }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
          return;
        }

        // PUT /api/accounts/:name
        if (req.url?.startsWith('/api/accounts/') && req.method === 'PUT') {
          res.setHeader('Content-Type', 'application/json');
          const accountName = decodeURIComponent(req.url.replace('/api/accounts/', ''));

          try {
            const body = await readBody(req);
            const updates: Partial<AccountEntry> = JSON.parse(body);

            const accounts = readAccounts();
            const index = accounts.findIndex((a) => a.name === accountName);

            if (index === -1) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: `Account "${accountName}" not found` }));
              return;
            }

            // Update fields — don't overwrite secrets if masked value sent back
            if (updates.name) accounts[index].name = updates.name;
            if (updates.accessKeyId) accounts[index].accessKeyId = updates.accessKeyId;
            if (updates.secretAccessKey && !updates.secretAccessKey.startsWith('****')) {
              accounts[index].secretAccessKey = updates.secretAccessKey;
            }
            if (updates.defaultRegion !== undefined) accounts[index].defaultRegion = updates.defaultRegion || undefined;
            if (updates.roleArn !== undefined) accounts[index].roleArn = updates.roleArn || undefined;
            if (updates.sessionToken && !updates.sessionToken.startsWith('****')) {
              accounts[index].sessionToken = updates.sessionToken;
            }

            writeAccounts(accounts);
            res.end(JSON.stringify({ success: true }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
          return;
        }

        // DELETE /api/accounts/:name
        if (req.url?.startsWith('/api/accounts/') && req.method === 'DELETE') {
          res.setHeader('Content-Type', 'application/json');
          const accountName = decodeURIComponent(req.url.replace('/api/accounts/', ''));

          const accounts = readAccounts();
          const index = accounts.findIndex((a) => a.name === accountName);

          if (index === -1) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `Account "${accountName}" not found` }));
            return;
          }

          accounts.splice(index, 1);
          writeAccounts(accounts);
          res.end(JSON.stringify({ success: true }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), reportsApiPlugin(), deleteApiPlugin(), scanApiPlugin(), accountsApiPlugin()],
});
