# Checkout API

NestJS API for the checkout flow, built with hexagonal architecture and Railway
Oriented use cases.

## Architecture

```
src/
  domain/          Entities, value objects, ports, domain errors (no framework)
  application/     Use cases returning a typed Result, depending only on ports
  infrastructure/  Prisma repositories, payment gateway adapter, HTTP controllers
  shared/          Result type and the DomainError base
```

Dependencies point inward: infrastructure → application → domain. The domain has
no dependency on NestJS, Prisma or HTTP. See the
[ADRs](../../docs/adr/README.md) for the reasoning.

## Data model

| Entity | Purpose |
| --- | --- |
| `Product` | Catalog item with price and stock (seeded, never created via the API) |
| `Customer` | Buyer captured during checkout |
| `Transaction` | One payment attempt, with the amount broken into product / base fee / delivery fee |
| `Delivery` | Shipping data, assigned when the transaction is approved |

Money is stored as integer cents. Only the card brand and last four digits are
persisted; full card data is never stored.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/products` | List products with stock |
| GET | `/api/products/:id` | Get a single product |
| POST | `/api/transactions` | Create a pending transaction (customer + delivery) |
| POST | `/api/transactions/:id/payment` | Charge the card and finalize the transaction |
| GET | `/api/transactions/:id` | Get a transaction |
| GET | `/api/health` | Health check |

Interactive documentation is served by Swagger at `/docs`.

## Running locally

```bash
# 1. A local PostgreSQL
docker run -d --name pgp-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=checkout -p 5432:5432 postgres:16

# 2. Environment
cp env.example .env   # then fill in the payment gateway sandbox values

# 3. Schema and seed
npm run prisma:migrate
npm run prisma:seed

# 4. Start
npm run start:dev
```

## Testing

```bash
npm run test:cov
```

Coverage is enforced above 80% across statements, branches, functions and lines.
