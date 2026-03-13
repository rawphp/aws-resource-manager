# Ideate — UR-002

**Reviewed:** 2026-03-14

## Explorer — Assumptions & Perspectives

- The brief assumes a single AWS account, but the app supports multi-account scanning — console URLs need to include the correct account context or at minimum the correct region
- AWS Console URLs differ significantly by service (EC2 uses fragment-based routing, S3 uses a different subdomain, Lambda uses path-based routing) — each of the 14 supported services needs its own URL pattern
- Some resources are global (S3 buckets, CloudFront distributions, Route 53 hosted zones) and their console URLs don't include a region parameter

## Challenger — Risks & Edge Cases

- AWS Console URL patterns are not officially documented as stable — they could change, though in practice they've been stable for years
- Resources in GovCloud or China partitions use different base domains (e.g., `console.amazonaws-us-gov.com`) — current data model has region but not partition info
- The resource `id` field varies in format per service (instance IDs, ARNs, names) — URL builders need to use the right identifier for each service type (e.g., S3 uses bucket name, EC2 uses instance ID, Lambda uses function name)

## Connector — Links & Reuse

- Each `DiscoveredResource` already has `id`, `arn`, `region`, `service`, and `type` — all the data needed to construct console URLs without any backend changes
- The `ResourceTable.tsx` component already renders the resource name/ID — this is the natural place to make it a clickable link
- The `service` field on each resource maps cleanly to URL pattern selection — a simple mapping function in shared or web package would work

## Summary

This is a frontend-only change. The data model already has everything needed to construct AWS Console URLs. The main work is building a URL generator that maps each service+type combination to the correct console URL pattern, then making the resource name/ID in the table a clickable link that opens in a new tab.
