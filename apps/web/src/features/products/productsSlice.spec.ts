import reducer, { fetchProducts, ProductsState } from './productsSlice';
import { Product } from '../../api/types';

const initial: ProductsState = { items: [], status: 'idle' };

const product: Product = {
  id: 'p1',
  name: 'Aurora',
  description: 'headphones',
  priceInCents: 25990000,
  imageUrl: 'https://example/a.png',
  stock: 5,
};

describe('productsSlice', () => {
  it('marks the state as loading while fetching', () => {
    const state = reducer(initial, fetchProducts.pending('req', undefined));
    expect(state.status).toBe('loading');
  });

  it('stores the products when the fetch succeeds', () => {
    const state = reducer(initial, fetchProducts.fulfilled([product], 'req', undefined));
    expect(state.status).toBe('ready');
    expect(state.items).toHaveLength(1);
  });

  it('stores the error message when the fetch fails', () => {
    const action = fetchProducts.rejected(new Error('boom'), 'req', undefined);
    const state = reducer(initial, action);
    expect(state.status).toBe('error');
    expect(state.error).toBe('boom');
  });
});
