import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeStore, renderWithProviders } from '../test/renderWithProviders';
import { CardDeliveryPage } from './CardDeliveryPage';
import { api } from '../api/client';
import { Product, Transaction } from '../api/types';

jest.mock('../api/client', () => ({
  api: { createTransaction: jest.fn(), getProducts: jest.fn() },
}));

const futureYear = ((new Date().getFullYear() + 3) % 100).toString().padStart(2, '0');

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

const storeWithProduct = () =>
  makeStore({ checkout: { quantity: 1, status: 'idle', product } });

describe('CardDeliveryPage', () => {
  it('redirects to the store when no product is selected', () => {
    renderWithProviders(<CardDeliveryPage />);
    expect(screen.queryByText('Payment details')).not.toBeInTheDocument();
  });

  it('shows validation errors on an empty submission', async () => {
    renderWithProviders(<CardDeliveryPage />, { store: storeWithProduct() });

    await userEvent.click(screen.getByRole('button', { name: /review order/i }));

    expect(await screen.findByText(/valid VISA or Mastercard/i)).toBeInTheDocument();
  });

  it('creates a pending transaction with valid data', async () => {
    (api.createTransaction as jest.Mock).mockResolvedValue(transaction);
    renderWithProviders(<CardDeliveryPage />, { store: storeWithProduct() });

    await userEvent.type(screen.getByLabelText('Full name'), 'Jane Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
    await userEvent.type(screen.getByLabelText('Phone'), '3001112233');
    await userEvent.type(screen.getByLabelText('Card number'), '4242424242424242');
    await userEvent.type(screen.getByLabelText('Expiry month'), '08');
    await userEvent.type(screen.getByLabelText('Expiry year'), futureYear);
    await userEvent.type(screen.getByLabelText('CVC'), '123');
    await userEvent.type(screen.getByLabelText('Address'), 'Calle 1');
    await userEvent.type(screen.getByLabelText('City'), 'Bogota');
    await userEvent.type(screen.getByLabelText('Region'), 'Cundinamarca');
    await userEvent.type(screen.getByLabelText('Postal code'), '110111');

    await userEvent.click(screen.getByRole('button', { name: /review order/i }));

    await waitFor(() =>
      expect(api.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ productId: 'p1', quantity: 1 }),
      ),
    );
  });
});
