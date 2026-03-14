# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-03-14

### Added

- Multi-account AWS resource scanning across 14 services (EC2, S3, RDS, Lambda, ELB/ALB, CloudFront, Route 53, ECS, DynamoDB, ElastiCache, Redshift, OpenSearch, SageMaker, EKS)
- Automatic region discovery — scans all enabled regions per account
- AWS Cost Explorer integration with 30-day cost breakdown by service and region
- CLI with scan and report commands
- React web dashboard with filterable resource table, cost charts, and waste detection
- Resource cleanup workflow with dry-run confirmation and `DELETE` safeguard
- Clickable AWS Console links for every discovered resource
- JSON report generation with timestamped output files
- YAML-based multi-account configuration
- GitHub Actions CI pipeline (Node 18, 20, 22)
- MIT License
