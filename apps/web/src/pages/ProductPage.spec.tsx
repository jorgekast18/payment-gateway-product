import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/renderWithProviders';
import { ProductPage } from './ProductPage';
import { api } from '../api/client';
import { Product } from '../api/types';

jest.mock('../api/client', () => ({ api: { getProducts: jest.fn() } }));

const product: Product = {
  id: 'p1',
  name: 'Aurora Wireless Headphones',
  description: 'headphones',
  priceInCents: 25990000,
  imageUrl: 'https://example/a.png',
  stock: 5,
};

describe('ProductPage', () => {
  beforeEach(() => {
    (api.getProducts as jest.Mock).mockResolvedValue([product]);
  });

  it('renders the product returned by the API', async () => {
    renderWithProviders(<ProductPage />);
    expect(await screen.findByText('Aurora Wireless Headphones')).toBeInTheDocument();
  });

  it('stores the selected product when the buyer proceeds', async () => {
    const { store } = renderWithProviders(<ProductPage />);
    await screen.findByText('Aurora Wireless Headphones');

    await userEvent.click(screen.getByRole('button', { name: /pay with credit card/i }));

    expect(store.getState().checkout.product?.id).toBe('p1');
  });

  it('lets the buyer increase the quantity', async () => {
    renderWithProviders(<ProductPage />);
    await screen.findByText('Aurora Wireless Headphones');

    await userEvent.click(screen.getByRole('button', { name: /increase quantity/i }));

    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
