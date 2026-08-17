import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeStore, renderWithProviders } from '../test/renderWithProviders';
import { StatusPage } from './StatusPage';
import { api } from '../api/client';
import { CheckoutState } from '../features/checkout/checkoutSlice';
import { Transaction } from '../api/types';

jest.mock('../api/client', () => ({ api: { getProducts: jest.fn() } }));

const approved: Transaction = {
  id: 'tx-1',
  reference: 'PGP-1',
  status: 'APPROVED',
  quantity: 1,
  productAmountInCents: 25990000,
  baseFeeInCents: 200000,
  deliveryFeeInCents: 1500000,
  amountInCents: 27690000,
  cardBrand: 'VISA',
  cardLastFour: '4242',
  productId: 'p1',
};

const checkoutWith = (transaction: Transaction): CheckoutState => ({
  quantity: 1,
  status: 'idle',
  transaction,
});

describe('StatusPage', () => {
  beforeEach(() => {
    (api.getProducts as jest.Mock).mockResolvedValue([]);
  });

  it('renders an approved outcome with the reference', () => {
    renderWithProviders(<StatusPage />, { store: makeStore({ checkout: checkoutWith(approved) }) });

    expect(screen.getByText('Payment approved')).toBeInTheDocument();
    expect(screen.getByText(/PGP-1/)).toBeInTheDocument();
    expect(screen.getByText(/VISA/)).toBeInTheDocument();
  });

  it('renders a declined outcome', () => {
    renderWithProviders(<StatusPage />, {
      store: makeStore({ checkout: checkoutWith({ ...approved, status: 'DECLINED' }) }),
    });

    expect(screen.getByText('Payment declined')).toBeInTheDocument();
  });

  it('resets the checkout when returning to the store', async () => {
    const store = makeStore({ checkout: checkoutWith(approved) });
    renderWithProviders(<StatusPage />, { store });

    await userEvent.click(screen.getByRole('button', { name: /back to store/i }));

    expect(store.getState().checkout.transaction).toBeUndefined();
  });
});
