import reducer, {
  CheckoutState,
  createPendingTransaction,
  payTransaction,
  resetCheckout,
  selectProduct,
  setContact,
} from './checkoutSlice';
import { Product, Transaction } from '../../api/types';
import { api } from '../../api/client';

jest.mock('../../api/client', () => ({
  api: {
    createTransaction: jest.fn(),
    payTransaction: jest.fn(),
  },
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

const initial: CheckoutState = { quantity: 1, status: 'idle' };

const contact = {
  customer: { fullName: 'Jane', email: 'jane@example.com', phone: '+57300' },
  delivery: { address: 'a', city: 'b', region: 'c', postalCode: 'd' },
  card: { number: '4242', cvc: '123', expMonth: '08', expYear: '30', holder: 'Jane' },
};

describe('checkoutSlice reducers', () => {
  it('selects a product and quantity', () => {
    const state = reducer(initial, selectProduct({ product, quantity: 3 }));
    expect(state.product).toEqual(product);
    expect(state.quantity).toBe(3);
  });

  it('stores contact, delivery and card', () => {
    const state = reducer(initial, setContact(contact));
    expect(state.customer).toEqual(contact.customer);
    expect(state.card).toEqual(contact.card);
  });

  it('resets the checkout', () => {
    const populated: CheckoutState = { ...initial, product, transaction };
    expect(reducer(populated, resetCheckout())).toEqual(initial);
  });

  it('handles the create and pay lifecycles', () => {
    const creating = reducer(initial, createPendingTransaction.pending('req'));
    expect(creating.status).toBe('creating');

    const created = reducer(creating, createPendingTransaction.fulfilled(transaction, 'req'));
    expect(created.transaction).toEqual(transaction);
    expect(created.status).toBe('idle');

    const paying = reducer(created, payTransaction.pending('req'));
    expect(paying.status).toBe('paying');

    const approved: Transaction = { ...transaction, status: 'APPROVED' };
    const paid = reducer(paying, payTransaction.fulfilled(approved, 'req'));
    expect(paid.transaction?.status).toBe('APPROVED');
  });

  it('captures errors from failed lifecycles', () => {
    const state = reducer(initial, createPendingTransaction.rejected(new Error('boom'), 'req'));
    expect(state.status).toBe('error');
    expect(state.error).toBe('boom');
  });
});

describe('checkoutSlice thunks', () => {
  const dispatch = jest.fn();

  afterEach(() => jest.clearAllMocks());

  it('creates a pending transaction from the checkout state', async () => {
    (api.createTransaction as jest.Mock).mockResolvedValue(transaction);
    const getState = () => ({ checkout: { ...initial, ...contact, product, quantity: 2 } });

    const result = await createPendingTransaction()(dispatch, getState as never, undefined);

    expect(result.type).toBe('checkout/create/fulfilled');
    expect(api.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ productId: 'p1', quantity: 2 }),
    );
  });

  it('rejects creating when the checkout data is incomplete', async () => {
    const getState = () => ({ checkout: initial });

    const result = await createPendingTransaction()(dispatch, getState as never, undefined);

    expect(result.type).toBe('checkout/create/rejected');
  });

  it('pays the current transaction', async () => {
    (api.payTransaction as jest.Mock).mockResolvedValue({ ...transaction, status: 'APPROVED' });
    const getState = () => ({ checkout: { ...initial, ...contact, transaction } });

    const result = await payTransaction()(dispatch, getState as never, undefined);

    expect(result.type).toBe('checkout/pay/fulfilled');
    expect(api.payTransaction).toHaveBeenCalledWith('tx-1', contact.card);
  });

  it('rejects paying when the payment data is incomplete', async () => {
    const getState = () => ({ checkout: initial });

    const result = await payTransaction()(dispatch, getState as never, undefined);

    expect(result.type).toBe('checkout/pay/rejected');
  });
});
