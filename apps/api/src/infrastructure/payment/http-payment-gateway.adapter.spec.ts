import { createHash } from 'node:crypto';
import { ChargeCardInput } from 'src/domain/payment/payment-gateway.port';
import { HttpPaymentGateway } from './http-payment-gateway.adapter';
import { PaymentGatewayConfig } from './payment-gateway.config';

const config: PaymentGatewayConfig = {
  apiUrl: 'https://gw/v1',
  publicKey: 'pub',
  privateKey: 'prv',
  integritySecret: 'secret',
  currency: 'COP',
  tokenizePath: '/tokens/cards',
  installments: 1,
  pollAttempts: 3,
  pollDelayMs: 0,
};

const chargeInput: ChargeCardInput = {
  amountInCents: 53680000,
  reference: 'PGP-1',
  customerEmail: 'jane@example.com',
  card: { number: '4242424242424242', cvc: '123', expMonth: '08', expYear: '30', holder: 'Jane' },
};

interface FetchStub {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

const jsonResponse = (payload: unknown, ok = true, status = 200): Promise<FetchStub> =>
  Promise.resolve({ ok, status, json: () => Promise.resolve(payload) });

const merchantPayload = {
  data: {
    presigned_acceptance: { acceptance_token: 'acc' },
    presigned_personal_data_auth: { acceptance_token: 'pda' },
  },
};

interface CapturedBody {
  signature: string;
  acceptance_token: string;
  accept_personal_auth: string;
  payment_method: { token: string };
}

let capturedTransactionBody: CapturedBody | null;

const installFetch = (pollStatuses: string[], transactionOk = true): jest.Mock => {
  capturedTransactionBody = null;
  const statuses = [...pollStatuses];
  const mock = jest.fn((url: string, init?: { method?: string; body?: string }) => {
    const method = init?.method ?? 'GET';
    if (url.includes('/merchants/')) {
      return jsonResponse(merchantPayload);
    }
    if (url.includes('/tokens/cards')) {
      return jsonResponse({ data: { id: 'tok_1' } });
    }
    if (url.endsWith('/transactions') && method === 'POST') {
      capturedTransactionBody = JSON.parse(init?.body ?? '{}') as CapturedBody;
      return jsonResponse(
        { data: { id: 'g1', status: 'PENDING' } },
        transactionOk,
        transactionOk ? 200 : 422,
      );
    }
    return jsonResponse({ data: { id: 'g1', status: statuses.shift() ?? 'PENDING' } });
  });
  global.fetch = mock as unknown as typeof fetch;
  return mock;
};

describe('HttpPaymentGateway', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('charges a card and resolves an approved transaction', async () => {
    installFetch(['APPROVED']);
    const gateway = new HttpPaymentGateway(config);

    const result = await gateway.charge(chargeInput);

    expect(result).toEqual({ gatewayTransactionId: 'g1', status: 'APPROVED' });
    const expectedSignature = createHash('sha256')
      .update('PGP-1' + '53680000' + 'COP' + 'secret')
      .digest('hex');
    expect(capturedTransactionBody?.signature).toBe(expectedSignature);
    expect(capturedTransactionBody?.acceptance_token).toBe('acc');
    expect(capturedTransactionBody?.accept_personal_auth).toBe('pda');
    expect(capturedTransactionBody?.payment_method.token).toBe('tok_1');
  });

  it('waits until the transaction reaches a terminal status', async () => {
    installFetch(['PENDING', 'APPROVED']);
    const gateway = new HttpPaymentGateway(config);

    const result = await gateway.charge(chargeInput);

    expect(result.status).toBe('APPROVED');
  });

  it('returns declined when the gateway declines the charge', async () => {
    installFetch(['DECLINED']);
    const gateway = new HttpPaymentGateway(config);

    const result = await gateway.charge(chargeInput);

    expect(result.status).toBe('DECLINED');
  });

  it('gives up as pending once the poll attempts are exhausted', async () => {
    installFetch(['PENDING', 'PENDING', 'PENDING', 'PENDING']);
    const gateway = new HttpPaymentGateway(config);

    const result = await gateway.charge(chargeInput);

    expect(result.status).toBe('PENDING');
  });

  it('throws when the gateway responds with a non-ok status', async () => {
    installFetch(['APPROVED'], false);
    const gateway = new HttpPaymentGateway(config);

    await expect(gateway.charge(chargeInput)).rejects.toThrow('status 422');
  });
});
