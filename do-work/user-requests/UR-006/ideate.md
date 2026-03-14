# Ideate — UR-006

**Reviewed:** 2026-03-14

## Explorer — Assumptions & Perspectives

- The brief says "public release" but doesn't specify the audience — is this for DevOps teams, cost-conscious startups, or the YouTube channel audience? The README and onboarding flow should be tailored accordingly.
- Public users will need clear IAM policy documentation — the current README mentions "read-only IAM permissions" but doesn't provide a copy-paste IAM policy JSON, which is a common friction point for AWS tools.
- The `do-work/` directory is internal project management scaffolding — it should be excluded from the public release (either via .gitignore or removal) since it exposes internal process details.
- The `accounts.yaml` file is in .gitignore but we must verify it was never committed to git history — if it was, the git history contains real AWS credentials and needs to be cleaned.

## Challenger — Risks & Edge Cases

- **Critical security risk**: Real AWS credentials (`AKIAWRWPBLTAO3ZLDS44`) exist in `accounts.yaml` on disk. While .gitignore prevents future commits, we must verify git history is clean. If credentials were ever committed, they must be rotated AND git history rewritten before public release.
- ESLint 9.0.0 is installed but has no `eslint.config.js` — the lint command currently fails. Public contributors running `npm run lint` will hit an immediate error, creating a poor first impression.
- No LICENSE file means the code is technically "all rights reserved" — nobody can legally use, modify, or distribute it. This must be resolved before any public release.
- The delete/cleanup API endpoint in the Vite dev server (`vite.config.ts`) has no authentication — in a public tool, users could accidentally expose resource deletion capabilities if they run the web dashboard on a network-accessible port.
- There's no `engines` field in package.json specifying minimum Node.js version — AWS SDK v3 requires Node 16+, and users on older versions will get cryptic errors.

## Connector — Links & Reuse

- The project already has a solid `accounts.example.yaml` template — this pattern should extend to other config files if any are added.
- 19 archived REQ files in `do-work/archive/` document the project's evolution — these could be cleaned out for public release, or the entire `do-work/` tree could be gitignored.
- The existing README is comprehensive (132 lines) and covers quick start, CLI reference, and IAM guidance — it's a strong foundation that needs refinement rather than a rewrite.
- The monorepo workspace structure (`packages/shared`, `packages/scanner`, `packages/web`) is clean and well-organized — CI/CD should leverage workspace-aware commands (`npm run test --workspaces`).

## Summary

The three most critical blockers for public release are: (1) verifying no AWS credentials leaked into git history, (2) adding a LICENSE file, and (3) fixing the broken ESLint configuration. Beyond those, the project needs standard open-source scaffolding (CONTRIBUTING.md, CI/CD, SECURITY.md) and should exclude internal `do-work/` files from the public repo. The existing code quality and documentation provide a solid foundation.
