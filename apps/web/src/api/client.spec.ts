import { api } from './client';
import { CardInput, CreateTransactionPayload } from './types';

interface FetchStub {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

const stub = (payload: unknown, ok = true, status = 200): Promise<FetchStub> =>
  Promise.resolve({ ok, status, json: () => Promise.resolve(payload) });

describe('api client', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetches products', async () => {
    const fetchMock = jest.fn(() => stub([{ id: 'p1' }]));
    global.fetch = fetchMock as unknown as typeof fetch;

    const products = await api.getProducts();

    expect(products).toEqual([{ id: 'p1' }]);
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/products',
      expect.objectContaining({ headers: { 'Content-Type': 'application/json' } }),
    );
  });

  it('creates a transaction with a POST body', async () => {
    const fetchMock = jest.fn(() => stub({ id: 'tx-1' }));
    global.fetch = fetchMock as unknown as typeof fetch;
    const payload: CreateTransactionPayload = {
      productId: 'p1',
      quantity: 1,
      customer: { fullName: 'Jane', email: 'jane@example.com', phone: '+57300' },
      delivery: { address: 'a', city: 'b', region: 'c', postalCode: 'd' },
    };

    await api.createTransaction(payload);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/transactions',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('pays a transaction', async () => {
    const fetchMock = jest.fn(() => stub({ id: 'tx-1', status: 'APPROVED' }));
    global.fetch = fetchMock as unknown as typeof fetch;
    const card: CardInput = {
      number: '4242',
      cvc: '123',
      expMonth: '08',
      expYear: '30',
      holder: 'Jane',
    };

    const transaction = await api.payTransaction('tx-1', card);

    expect(transaction).toEqual({ id: 'tx-1', status: 'APPROVED' });
  });

  it('throws the API error message on a non-ok response', async () => {
    const fetchMock = jest.fn(() => stub({ message: 'Out of stock' }, false, 409));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(api.getProduct('p1')).rejects.toThrow('Out of stock');
  });

  it('throws a generic message when the body has none', async () => {
    const fetchMock = jest.fn(() => stub(null, false, 500));
    global.fetch = fetchMock as unknown as typeof fetch;

    await expect(api.getTransaction('tx-1')).rejects.toThrow('status 500');
  });
});
