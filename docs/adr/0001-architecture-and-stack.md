# ADR 0001 — Architecture and technology stack

- Status: Accepted
- Date: 2025-10-09

## Context

We are building a product checkout that charges a credit card through an
external payment gateway. The solution needs a single page application, an HTTP
API with clearly separated business logic, persistent storage for stock,
transactions, customers and deliveries, automated tests above 80% coverage, and
a reproducible cloud deployment.

## Decision

We use a two-application monorepo managed with npm workspaces:

- `apps/api` — HTTP API built with NestJS and TypeScript.
- `apps/web` — Single page application built with React, Vite and Redux Toolkit.
- `infra/terraform` — Infrastructure as code for the cloud deployment.

Supporting choices:

- Language: TypeScript end to end, no implicit `any`.
- Persistence: PostgreSQL through Prisma as the ORM.
- Testing: Jest on both applications with enforced coverage thresholds.
- Package manager: npm workspaces.

## Rationale

- A monorepo keeps the API and the web client versioned together, which makes
  the payment contract between them a single source of truth.
- NestJS provides first class dependency injection, which is the mechanism we
  rely on to keep the domain isolated from frameworks (see ADR 0002).
- React with Redux Toolkit satisfies the required Flux state management and lets
  us persist the checkout progress so the flow survives a page refresh.
- PostgreSQL models the relational nature of the data (a transaction references a
  customer, a product and a delivery) with strong integrity guarantees.
- npm workspaces avoids extra tooling; pnpm is unavailable on the target Node 20
  runtime, and npm keeps the setup reproducible for any reviewer.

## Consequences

- Every module ships with its own tests and coverage gate.
- The domain layer has no dependency on NestJS, Prisma or HTTP concerns, so it
  can be tested in isolation and ported if the framework ever changes.

## Alternatives considered

- Serverless-only backend: rejected as the primary model because it couples the
  first design iteration to a specific runtime; the deployment target is decided
  independently in the infrastructure ADR.
- DynamoDB: rejected because the data is inherently relational and integrity
  across entities is a core requirement.
