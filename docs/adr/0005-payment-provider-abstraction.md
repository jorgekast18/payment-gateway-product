# ADR 0005 — Payment provider abstraction

- Status: Accepted
- Date: 2025-10-09

## Context

The checkout charges a card through an external payment gateway that exposes a
tokenization endpoint, a transaction endpoint and requires an integrity signature
computed from the reference, the amount and the currency. Two forces shape the
design: the domain must not depend on a specific vendor, and the integration
secrets must never reach the browser.

## Decision

- The application layer depends on a `PaymentGateway` port with vendor-neutral
  operations: `tokenizeCard`, `getAcceptanceToken` and `charge`.
- A single infrastructure adapter implements that port against the real provider,
  reading every endpoint and key from environment variables.
- The integrity signature and every call that uses the private key run
  exclusively on the server. The browser only sends card fields over HTTPS and
  never sees a private key or a signature secret.

## Rationale

- The domain and use cases speak about "charging a card", not about any specific
  brand, so the business rules stay portable and the codebase keeps a neutral
  vocabulary.
- Centralizing the provider behind one adapter means a provider change touches
  exactly one file.
- Computing the signature server-side is both a security requirement and the only
  correct place for a secret-derived value.

## Consequences

- All provider configuration lives in environment variables documented in
  `.env.example`, and secrets are injected at deploy time, never committed.

## Alternatives considered

- Calling the gateway directly from the SPA: rejected; it would expose secrets
  and move business decisions to the client.
