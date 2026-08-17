# Payment Gateway Product

A product checkout that charges a credit card through an external payment gateway.
The buyer picks a product, enters card and delivery information, reviews a
summary, and gets the final payment status while stock is updated on the server.

## Overview

The project is an npm-workspaces monorepo:

```
apps/
  api/    NestJS API — hexagonal architecture, Railway Oriented use cases
  web/    React SPA — Vite, Redux Toolkit, mobile-first, refresh-resilient
infra/
  terraform/  Infrastructure as code for the cloud deployment
docs/
  adr/    Architecture Decision Records
```

## Checkout flow

The application follows a five-screen business process:

1. Product page — available product, description, price and stock.
2. Card and delivery information — validated card (brand detection) and shipping data.
3. Summary — product amount, base fee (always applied) and delivery fee.
4. Final status — result of the payment.
5. Product page — with the stock updated.

The flow is resilient: the progress is persisted so a page refresh resumes where
the buyer left off.

## Architecture

- **Hexagonal (Ports and Adapters):** business logic lives in the domain and
  application layers and never in controllers. See
  [ADR 0002](docs/adr/0002-hexagonal-architecture.md).
- **Railway Oriented Programming:** use cases return a typed `Result` and
  short-circuit on the first expected failure. See
  [ADR 0003](docs/adr/0003-railway-oriented-programming.md).
- **Payment provider behind a port:** the gateway is vendor-neutral and every
  secret stays on the server. See
  [ADR 0005](docs/adr/0005-payment-provider-abstraction.md).

The full set of decisions lives in [docs/adr](docs/adr/README.md).

## Getting started

Requirements: Node 20+, Docker (for a local PostgreSQL), Terraform (for deploy).

```bash
npm install
```

Per-application instructions live in
[`apps/api/README.md`](apps/api/README.md) and
[`apps/web/README.md`](apps/web/README.md).

## Testing

Both applications enforce coverage thresholds above 80% with Jest.

```bash
npm run test:cov
```

## Deployment

Infrastructure is provisioned with Terraform. See
[`infra/terraform/README.md`](infra/terraform/README.md).

<!-- Deployed URLs, API documentation link, coverage report and screenshots are
added once the corresponding milestones are complete. -->
