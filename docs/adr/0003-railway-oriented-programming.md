# ADR 0003 — Railway Oriented Programming for use cases

- Status: Accepted
- Date: 2025-10-09

## Context

The payment flow is a sequence of steps that can each fail for expected reasons:
the product may be out of stock, the card may be invalid, the gateway may decline
the charge. Modeling these expected failures with thrown exceptions mixes control
flow with error handling and makes the happy path hard to read.

## Decision

Use cases return an explicit `Result<T, E>` type with two variants, `ok` and
`err`. Steps are composed so that the first failure short-circuits the rest of
the chain, and only unexpected, truly exceptional conditions use exceptions.

Domain errors are typed values, not strings, so the controller layer can map each
one to the correct HTTP status.

## Rationale

- The happy path reads as a straight line; expected failures are values, not
  jumps.
- Errors are exhaustive and typed, which removes an entire class of "unhandled
  case" bugs.
- Testing both branches is straightforward because a use case never throws for an
  expected outcome.

## Consequences

- A small `Result` helper and a set of domain error types are part of the shared
  kernel.
- Controllers contain a single mapping from domain error to HTTP status.

## Alternatives considered

- Exceptions for expected failures: rejected because it hides the failure
  contract and encourages broad catch blocks.
