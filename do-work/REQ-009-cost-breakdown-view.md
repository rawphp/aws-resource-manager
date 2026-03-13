# REQ-009: Cost Breakdown Visualization

**UR:** UR-001
**Status:** backlog
**Created:** 2026-03-14

## Task

Add a cost breakdown view to the web dashboard with charts showing cost distribution by service and by region. Include a "top spenders" list showing the most expensive individual resources. Highlight resources that are likely wasteful (e.g., stopped EC2 instances with attached EBS, unattached EBS volumes, idle load balancers).

## Context

The user wants to understand "which ones I'm being charged for." Visual cost breakdowns make it easy to identify where money is going and what's wasteful.

## Acceptance Criteria

- [ ] Bar or pie chart showing cost by service
- [ ] Bar or pie chart showing cost by region
- [ ] Top 10 most expensive resources list with details
- [ ] "Potential waste" section flagging: stopped instances, unattached EBS volumes, unused Elastic IPs, empty load balancers
- [ ] Charts are interactive (hover for details, click to filter)
- [ ] View integrates with existing account selector and filters

## Verification Steps

> Execute these after implementation to confirm the feature actually works at runtime. Each must pass before committing.

1. **build** `npm run build`
   - Expected: Web app builds successfully
2. **ui** Navigate to cost breakdown view with sample data loaded
   - Expected: Charts render with correct data, waste indicators visible for flagged resources
