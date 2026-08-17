# ADR 0002 — Hexagonal architecture (Ports and Adapters)

- Status: Accepted
- Date: 2026-08-17

## Context

Business logic must not live in the routing or controller layer. The payment
flow has real invariants (stock cannot go negative, a transaction moves through a
strict set of states, the base fee is always applied) that must be protected
regardless of the delivery mechanism or the external services involved.

## Decision

The API is organized in three layers following Ports and Adapters:

- `domain` — Entities, value objects and the business rules. No framework, no I/O.
- `application` — Use cases that orchestrate the domain and depend only on ports
  (interfaces), never on concrete implementations.
- `infrastructure` — Adapters that implement the ports: Prisma repositories, the
  payment gateway HTTP client, and the NestJS controllers that drive the use
  cases.

Dependencies always point inward: infrastructure depends on application,
application depends on domain, and the domain depends on nothing.

## Rationale

- Controllers become thin adapters: they translate HTTP into a use case call and
  a use case result into an HTTP response.
- Ports let us swap the payment provider or the database without touching a
  single business rule, and they make the use cases trivial to unit test with
  in-memory fakes.
- The external payment provider is hidden behind a `PaymentGateway` port, which
  keeps the domain vocabulary neutral (see ADR 0005).

## Consequences

- More explicit wiring through dependency injection tokens.
- Clear test seams: domain and application are tested without any infrastructure.

## Alternatives considered

- Classic layered MVC with logic in services tied to the ORM: rejected because it
  leaks persistence details into business rules and makes isolated testing harder.
