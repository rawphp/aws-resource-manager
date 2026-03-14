# Contributing

Thanks for your interest in contributing to AWS Resource Manager!

## Getting Started

1. Fork and clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build all packages:
   ```bash
   npm run build
   ```

## Project Structure

This is a monorepo with three packages:

- `packages/shared` — TypeScript types and interfaces
- `packages/scanner` — CLI and AWS scanning engine
- `packages/web` — React dashboard for viewing reports

## Development

### Running Tests

```bash
npm test
```

This runs vitest across all workspaces.

### Linting

```bash
npm run lint
```

Uses ESLint 9 with TypeScript support.

### Building

```bash
npm run build
```

Compiles TypeScript across all packages.

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm test`
4. Ensure linting passes: `npm run lint`
5. Commit with a clear message describing the change
6. Open a pull request against `main`

## Adding a New Scanner

To add support for a new AWS service:

1. Create a new scanner file in `packages/scanner/src/scanners/`
2. Export a scan function following the pattern in existing scanners
3. Register it in `packages/scanner/src/scanners/index.ts`
4. Add the corresponding AWS SDK client to `packages/scanner/package.json`
5. Add tests in `packages/scanner/src/scanners/scanners.test.ts`

## Credential Safety

- Never commit `accounts.yaml` — it contains AWS credentials
- Use `accounts.example.yaml` as a template
- See [SECURITY.md](SECURITY.md) for more details
