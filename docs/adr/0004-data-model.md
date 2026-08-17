# ADR 0004 — Data model

- Status: Accepted
- Date: 2026-08-17

## Context

The API must own stock, transactions, customers and deliveries, and keep them
consistent while a payment is processed. A transaction starts as pending, then
becomes approved or declined based on the gateway result; only an approved
transaction consumes stock and produces a delivery.

## Decision

Four persisted entities with the following relationships:

- `Product` — Catalog item with `name`, `description`, `priceInCents` and
  `stock`. Seeded with dummy data; never created through the API.
- `Customer` — Buyer identity captured during checkout: `fullName`, `email`,
  `phone`.
- `Transaction` — One payment attempt. References a `Product`, a `Customer` and,
  once approved, a `Delivery`. Stores `amountInCents` broken down into
  `productAmountInCents`, `baseFeeInCents` and `deliveryFeeInCents`, plus the
  `status` (`PENDING`, `APPROVED`, `DECLINED`, `ERROR`), the `quantity`, the
  external `gatewayTransactionId` and a masked card reference.
- `Delivery` — Shipping information for an approved transaction: `address`,
  `city`, `region`, `postalCode` and `status`.

Money is stored as integer cents to avoid floating point rounding. Card data is
never persisted: only the brand and the last four digits are kept for display.

## Rationale

- Splitting the amount into its three components makes the summary auditable and
  matches exactly what the user approves before paying.
- Integer cents remove a well known source of payment bugs.
- Keeping only a masked card reference is the minimum needed for the receipt and
  respects the sensitive-data handling requirement.

## Consequences

- Stock is decremented inside the same unit of work that approves the
  transaction, so a refresh or a retry cannot double-spend inventory.

## Alternatives considered

- Storing amounts as decimals or floats: rejected due to rounding risk.
- Persisting full card data: rejected; it is sensitive and unnecessary.
