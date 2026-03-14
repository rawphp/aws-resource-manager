# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability, please report it responsibly by emailing the maintainer directly rather than opening a public issue.

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

We will acknowledge receipt within 48 hours and aim to provide a fix within 7 days for critical issues.

## AWS Credential Management

This tool requires AWS credentials to scan your resources. Follow these best practices:

### Do

- Use `accounts.example.yaml` as a template for your `accounts.yaml`
- Use read-only IAM credentials with minimum required permissions
- Rotate credentials regularly
- Keep `accounts.yaml` out of version control (it's in `.gitignore` by default)

### Don't

- Never commit `accounts.yaml` or any file containing real AWS credentials
- Never use root account credentials
- Never share credentials in issues, PRs, or discussions
- Never run the web dashboard on a publicly accessible port — the delete API has no authentication

## Resource Deletion

The cleanup feature can delete AWS resources. Always:

1. Review the list of resources before confirming deletion
2. Use the dry-run mode first
3. Ensure you have backups or snapshots where appropriate
4. Run the web dashboard only on `localhost`

## IAM Permissions

Use the principle of least privilege. For read-only scanning, the tool needs permissions like `ec2:Describe*`, `s3:List*`, `rds:Describe*`, etc. See the README for a complete IAM policy.

For cleanup/deletion, additional write permissions are required for the specific services you want to clean up.
