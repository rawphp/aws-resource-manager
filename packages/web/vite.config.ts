import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import type { Plugin } from 'vite';

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

export default defineConfig({
  plugins: [react(), reportsApiPlugin()],
});
