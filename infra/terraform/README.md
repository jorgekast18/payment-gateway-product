# Infrastructure

Terraform provisions the full stack on AWS:

- ECR repository for the API image
- RDS PostgreSQL database
- App Runner service running the API over HTTPS
- S3 bucket + CloudFront distribution serving the frontend over HTTPS

See [ADR 0006](../../docs/adr/0006-deployment-topology.md) for the rationale.

## Prerequisites

- AWS credentials with permission to manage the resources above
- Terraform >= 1.6, Docker, and the AWS CLI
- A `terraform.tfvars` file (copy `terraform.tfvars.example`) with the payment
  gateway sandbox credentials. It is git-ignored and must never be committed.

## Deploy

From the repository root:

```bash
bash infra/scripts/deploy.sh
```

The script performs the full flow:

1. Creates the ECR repository.
2. Builds the API image for `linux/amd64` and pushes it to ECR.
3. Applies the remaining infrastructure (RDS, App Runner, S3, CloudFront).
4. Builds the frontend against the App Runner URL and uploads it to S3.
5. Invalidates the CloudFront cache.

It prints the frontend and API URLs at the end.

## Destroy

```bash
cd infra/terraform && terraform destroy
```
