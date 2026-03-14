# Ideate — UR-004

**Reviewed:** 2026-03-14

## Explorer — Assumptions & Perspectives

- "The report" refers to `reports/report-2026-03-13T23-50-21.json` — a 40KB scan output committed in `27a24ba`. The `/reports/` directory is not in `.gitignore`, so future scans would also be tracked.
- "Remove from git history" implies rewriting history (e.g., `git filter-repo` or BFG), not just deleting the file — this affects anyone who has cloned the repo.
- "Late resource" most likely refers to **ElastiCache** — the most recently added scanner. The URL builder at `awsConsoleUrl.ts:53-54` hardcodes `#/redis/` but ElastiCache can be Redis or Memcached; the scanner already captures the engine type in the resource type field.

## Challenger — Risks & Edge Cases

- Rewriting git history is destructive — if this repo has been pushed to a remote and others have cloned it, they'll need to re-clone or rebase. Need to confirm this is acceptable.
- Simply adding `reports/` to `.gitignore` won't remove the file from history — it only prevents future tracking. Both steps are needed.
- The ElastiCache URL fix needs to handle `engine = 'unknown'` gracefully (scanner defaults to `'unknown'` when `cluster.Engine` is undefined).

## Connector — Links & Reuse

- REQ-014 and REQ-015 (archived) established the `awsConsoleUrl.ts` URL builder and clickable links pattern — the ElastiCache fix follows the same pattern.
- The existing test file `awsConsoleUrl.test.ts` has a Redis test case but no Memcached case — adding one follows the established testing pattern.
- `.gitignore` already excludes other generated artifacts (`dist/`, `coverage/`); adding `reports/` is consistent.

## Summary

Two distinct tasks: (1) a git history cleanup requiring `reports/` removal from history plus `.gitignore` update, and (2) an ElastiCache URL builder fix that needs to dynamically use the engine type instead of hardcoding Redis. The git history rewrite is the riskier operation — confirm the user understands the implications for any existing clones.
