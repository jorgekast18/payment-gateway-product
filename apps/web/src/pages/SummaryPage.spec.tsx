import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeStore, renderWithProviders } from '../test/renderWithProviders';
import { SummaryPage } from './SummaryPage';
import { api } from '../api/client';
import { CheckoutState } from '../features/checkout/checkoutSlice';
import { Product, Transaction } from '../api/types';

jest.mock('../api/client', () => ({
  api: { payTransaction: jest.fn(), getProducts: jest.fn() },
}));

const product: Product = {
  id: 'p1',
  name: 'Aurora',
  description: 'headphones',
  priceInCents: 25990000,
  imageUrl: 'https://example/a.png',
  stock: 5,
};

const transaction: Transaction = {
  id: 'tx-1',
  reference: 'PGP-1',
  status: 'PENDING',
  quantity: 1,
  productAmountInCents: 25990000,
  baseFeeInCents: 200000,
  deliveryFeeInCents: 1500000,
  amountInCents: 27690000,
  cardBrand: null,
  cardLastFour: null,
  productId: 'p1',
};

const card = { number: '4242424242424242', cvc: '123', expMonth: '08', expYear: '30', holder: 'Jane' };

const baseCheckout: CheckoutState = {
  quantity: 1,
  status: 'idle',
  product,
  transaction,
  card,
};

describe('SummaryPage', () => {
  it('renders the amount breakdown', () => {
    renderWithProviders(<SummaryPage />, { store: makeStore({ checkout: baseCheckout }) });

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Base fee')).toBeInTheDocument();
    expect(screen.getByText('Delivery fee')).toBeInTheDocument();
  });

  it('pays the transaction when confirming', async () => {
    (api.payTransaction as jest.Mock).mockResolvedValue({ ...transaction, status: 'APPROVED' });
    renderWithProviders(<SummaryPage />, { store: makeStore({ checkout: baseCheckout }) });

    await userEvent.click(screen.getByRole('button', { name: /^pay/i }));

    await waitFor(() => expect(api.payTransaction).toHaveBeenCalledWith('tx-1', card));
  });

  it('asks to re-enter the card after a refresh cleared it', () => {
    renderWithProviders(<SummaryPage />, {
      store: makeStore({ checkout: { ...baseCheckout, card: undefined } }),
    });

    expect(screen.getByText(/re-enter your card/i)).toBeInTheDocument();
  });
});
