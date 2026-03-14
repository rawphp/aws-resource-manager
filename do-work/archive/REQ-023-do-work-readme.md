# REQ-023: Add do-work README

**UR:** UR-006
**Status:** backlog
**Created:** 2026-03-14

## Task

Add a short `do-work/README.md` explaining what the folder is — a file-based project management system that tracks how features were planned, decomposed, and executed. This makes the folder intentional rather than mysterious for public viewers.

## Context

The project is being built in public. The do-work folder is a real-world demo of a task management workflow and provides a decision log of how the project evolved. Keeping it visible adds transparency.

## Acceptance Criteria

- [ ] `do-work/README.md` exists
- [ ] Briefly explains what do-work is (1-2 paragraphs max)
- [ ] References the folder structure (user-requests, archive, working)

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `test -f do-work/README.md && echo "exists"`
   - Expected: outputs "exists"
