# ADR 0006 — Deployment topology

- Status: Accepted
- Date: 2025-10-09

## Context

The application must be publicly reachable over HTTPS with the API connected to a
managed database, provisioned as infrastructure as code and kept inexpensive.

## Decision

Provision everything with Terraform on AWS:

- **Frontend:** a private S3 bucket served through CloudFront over HTTPS, with an
  Origin Access Control so the bucket is never public. SPA routing is handled by
  mapping 403/404 responses to `index.html`.
- **API:** a container image stored in ECR and run by AWS App Runner, which gives
  a managed HTTPS endpoint, health checks and autoscaling without an ALB.
- **Database:** an RDS PostgreSQL instance. Schema migrations and the product
  seed run at container start (`prisma migrate deploy` then `prisma db seed`).

The browser talks to CloudFront (frontend) and to the App Runner URL (API); the
API enables CORS for the CloudFront origin and every hop is HTTPS.

## Rationale

- App Runner removes the load balancer and the always-on server management that a
  Fargate + ALB setup requires, which keeps the cost low while still running a
  real container image.
- S3 + CloudFront is the standard, cheap and fast way to serve a single page app.
- Running migrations at startup keeps the database schema in lockstep with the
  deployed image.

## Consequences

- App Runner egress IPs are not static, so the sandbox database is publicly
  accessible and protected by a strong generated password and enforced TLS
  (`sslmode=require`). A production deployment would place the database in private
  subnets behind an App Runner VPC connector with a NAT for outbound calls.
- Gateway secrets are injected as App Runner runtime environment variables from
  Terraform variables and are never committed.

## Alternatives considered

- ECS Fargate + ALB + RDS: more "cloud native" but adds an always-on load
  balancer and task cost; rejected in favour of a cheaper managed runtime.
- A single EC2 instance running everything: cheapest but less resilient and not
  representative of a production topology.
