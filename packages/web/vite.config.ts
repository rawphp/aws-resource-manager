import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, existsSync } from 'fs';
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

export default defineConfig({
  plugins: [react(), reportsApiPlugin(), deleteApiPlugin()],
});
