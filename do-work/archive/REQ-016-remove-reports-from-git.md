# REQ-016: Remove reports from git history

**UR:** UR-004
**Status:** done
**Created:** 2026-03-14

## Task

Remove the `reports/` directory and its contents from git tracking and history. Add `reports/` to `.gitignore` to prevent future report files from being committed.

## Context

A scan report (`reports/report-2026-03-13T23-50-21.json`) was committed in `27a24ba`. Generated reports are runtime artifacts and should not be version-controlled.

## Acceptance Criteria

- [x] `reports/` directory is listed in `.gitignore`
- [x] The report file is removed from the current git tree (untracked)
- [x] The report file is removed from git history
- [x] Existing report files on disk are preserved (not deleted from filesystem)

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **test** `git log --all --diff-filter=A -- 'reports/*' | head -20`
   - Expected: no commits show the reports directory (history rewritten)
2. **test** `git ls-files reports/`
   - Expected: empty output (no tracked files in reports/)
3. **test** `grep -q 'reports/' .gitignore && echo "OK"`
   - Expected: "OK" — reports/ is in .gitignore
4. **test** `ls reports/`
   - Expected: report files still exist on disk

## Outputs

- `.gitignore` — added `reports/` to ignored paths
- Git history rewritten via `git filter-repo --invert-paths --path reports/`
