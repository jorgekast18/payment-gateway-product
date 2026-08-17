# Checkout SPA

Mobile-first single page app for the checkout, built with React, Vite and Redux
Toolkit.

## Flow

Five screens drive the process:

1. **Product** — available product, description, price and stock.
2. **Card & delivery** — validated card (VISA / Mastercard detection) and shipping data.
3. **Summary** — product amount, base fee and delivery fee in a backdrop, with the pay button.
4. **Final status** — approved, declined or failed result.
5. **Product** — back to the store with the stock updated.

## State and resilience

State lives in a Redux Toolkit store. The checkout progress is persisted with
`redux-persist`, so a page refresh resumes where the buyer left off. Raw card
data is deliberately excluded from persistence and never written to storage.

## Running locally

```bash
cp env.example .env      # VITE_API_URL, defaults to http://localhost:3000/api
npm run dev
```

The app expects the API from [`apps/api`](../api/README.md) to be running.

## Testing

```bash
npm run test:cov
```

Jest and Testing Library cover the domain helpers, the Redux slices, the
components and the pages, with coverage enforced above 80%.
