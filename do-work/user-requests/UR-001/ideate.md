# Ideate — UR-001

**Reviewed:** 2026-03-14

## Explorer — Assumptions & Perspectives

- **"All services, every region" is a massive scope** — AWS has 200+ services and 30+ regions. A naive approach that calls every API in every region will be extremely slow and may hit API rate limits. Need a strategy for which services to prioritize (the ~30 services that actually generate charges for most accounts) vs. exhaustive enumeration.
- **Cost data vs. resource existence are two different things** — AWS Cost Explorer / Cost & Usage Reports show billing data, while service-specific APIs show resource inventory. The brief conflates "what exists" with "what I'm being charged for" — some resources exist but are free (e.g., empty S3 buckets, unattached security groups), and some charges have no corresponding "resource" (e.g., data transfer, API calls). Need to clarify whether the goal is a resource inventory, a cost breakdown, or both overlaid.
- **Multi-account implies AWS Organizations or standalone** — the brief says "multiple credentials" but doesn't mention whether these are IAM users, roles, SSO profiles, or assume-role chains. The credential model significantly impacts architecture.
- **Who is the user?** — Is this for Tom personally managing a few AWS accounts, or a tool others will use? This affects how polished the UI needs to be vs. a CLI/script approach.

## Challenger — Risks & Edge Cases

- **IAM permissions** — scanning all resources requires broad read-only access (e.g., `ReadOnlyAccess` managed policy or a custom policy). If credentials lack permissions for certain services, the scanner will get AccessDenied errors. Need graceful handling and reporting of permission gaps.
- **Destructive "cleanup" is high-risk** — the second phase involves deleting resources. One wrong deletion (e.g., an RDS database, an S3 bucket with data) is catastrophic and irreversible. This needs confirmation flows, dry-run previews, and possibly a "hold" period before actual deletion.
- **Rate limiting** — AWS APIs have per-service, per-region rate limits. Scanning 30+ regions across dozens of services in parallel could trigger throttling. Need exponential backoff and concurrency controls.
- **Cost Explorer API costs money** — the AWS Cost Explorer API itself charges $0.01 per request. Frequent polling or large date ranges could add up. Consider using Cost & Usage Reports (CUR) exported to S3 as a cheaper alternative for detailed cost data.
- **Credentials security** — storing multiple AWS credentials is a security-sensitive operation. Need to handle credentials safely (never log them, encrypt at rest, prefer temporary credentials/roles over long-lived access keys).

## Challenger — Risks & Edge Cases

- **Stale data** — AWS resources change constantly. The report is a point-in-time snapshot. Should the tool cache results? How fresh does data need to be?
- **Resource dependencies** — deleting a VPC requires first deleting its subnets, ENIs, NAT gateways, etc. The cleanup phase needs dependency-aware ordering or it will fail with "resource in use" errors.

## Connector — Links & Reuse

- **AWS SDK for JavaScript/Python** — boto3 (Python) or @aws-sdk (Node.js) are the standard choices. Since this project is greenfield with no existing stack, the tech choice is open. Python + boto3 is the most mature for AWS multi-service enumeration. Node.js would align better if the visualizer is a web app.
- **Existing tools for reference** — AWS's own "Tag Editor" (resource search across services/regions), `aws-nuke` (resource deletion), and `steampipe` (SQL over AWS APIs) solve parts of this. Worth understanding their approach rather than reinventing.
- **Cost Explorer API + Resource Groups Tagging API** — these two AWS APIs together can provide most of what's needed: Cost Explorer for billing breakdown, and Resource Groups Tagging API for cross-service resource enumeration.

## Summary

The biggest design decision is whether to build a cost-analysis tool (leveraging Cost Explorer/CUR data) or a resource-inventory tool (calling individual service APIs), or both. The "scan everything in every region" requirement needs scoping — start with the ~20 services that account for 95% of charges. The cleanup/deletion phase is the highest-risk feature and needs careful safeguards (dependency ordering, dry runs, confirmation).
