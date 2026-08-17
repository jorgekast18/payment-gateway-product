import { Customer } from '../../domain/customer/customer.entity';
import { CustomerRepository } from '../../domain/customer/customer.repository';
import { ChargeResult, PaymentGateway } from '../../domain/payment/payment-gateway.port';
import { InsufficientStockError } from '../../domain/product/product.errors';
import { Transaction, TransactionProps } from '../../domain/transaction/transaction.entity';
import {
  FinalizeInput,
  TransactionRepository,
} from '../../domain/transaction/transaction.repository';
import { TransactionStatus } from '../../domain/transaction/transaction-status';
import { err, ok, Result } from '../../shared/result';
import { PayTransactionUseCase } from './pay-transaction.use-case';

const futureYear = ((new Date().getFullYear() + 3) % 100).toString().padStart(2, '0');

const baseProps = (status: TransactionStatus): TransactionProps => ({
  id: 'tx-1',
  reference: 'PGP-1',
  status,
  quantity: 2,
  productAmountInCents: 51980000,
  baseFeeInCents: 200000,
  deliveryFeeInCents: 1500000,
  amountInCents: 53680000,
  cardBrand: null,
  cardLastFour: null,
  gatewayTransactionId: null,
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
});

const pendingTransaction = Transaction.fromPersistence(baseProps('PENDING'));
const approvedTransaction = Transaction.fromPersistence(baseProps('APPROVED'));
const customer = new Customer({
  id: 'c1',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+573001112233',
});

const validCard = {
  number: '4242424242424242',
  cvc: '123',
  expMonth: '08',
  expYear: futureYear,
  holder: 'Jane Doe',
};

interface Overrides {
  transaction?: Transaction | null;
  customer?: Customer | null;
  charge?: () => Promise<ChargeResult>;
  completeApproval?: () => Promise<Result<Transaction, InsufficientStockError>>;
}

const buildUseCase = (
  overrides: Overrides,
): { useCase: PayTransactionUseCase; finalize: jest.Mock } => {
  const finalize = jest.fn((input: FinalizeInput) =>
    Promise.resolve(Transaction.fromPersistence(baseProps(input.status))),
  );
  const transactions: TransactionRepository = {
    create: () => Promise.resolve(pendingTransaction),
    findById: () =>
      Promise.resolve('transaction' in overrides ? overrides.transaction! : pendingTransaction),
    finalize,
    completeApproval:
      overrides.completeApproval ?? (() => Promise.resolve(ok(approvedTransaction))),
  };
  const customers: CustomerRepository = {
    create: () => Promise.resolve(customer),
    findById: () =>
      Promise.resolve('customer' in overrides ? overrides.customer! : customer),
  };
  const gateway: PaymentGateway = {
    charge:
      overrides.charge ??
      (() => Promise.resolve({ gatewayTransactionId: 'g1', status: 'APPROVED' })),
  };

  return { useCase: new PayTransactionUseCase(transactions, customers, gateway), finalize };
};

const run = (overrides: Overrides): ReturnType<PayTransactionUseCase['execute']> =>
  buildUseCase(overrides).useCase.execute({ transactionId: 'tx-1', card: validCard });

describe('PayTransactionUseCase', () => {
  it('fails when the transaction does not exist', async () => {
    const result = await run({ transaction: null });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
    }
  });

  it('fails when the transaction is not pending', async () => {
    const result = await run({ transaction: approvedTransaction });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('TRANSACTION_NOT_PENDING');
    }
  });

  it('fails when the card is invalid', async () => {
    const { useCase } = buildUseCase({});
    const result = await useCase.execute({
      transactionId: 'tx-1',
      card: { ...validCard, number: '1234' },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_CREDIT_CARD');
    }
  });

  it('fails when the customer is missing', async () => {
    const result = await run({ customer: null });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PAYMENT_GATEWAY_ERROR');
    }
  });

  it('marks the transaction in error when the gateway throws', async () => {
    const { useCase, finalize } = buildUseCase({
      charge: () => Promise.reject(new Error('gateway down')),
    });
    const result = await useCase.execute({ transactionId: 'tx-1', card: validCard });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PAYMENT_GATEWAY_ERROR');
    }
    expect(finalize).toHaveBeenCalledWith(expect.objectContaining({ status: 'ERROR' }));
  });

  it('approves the transaction on a successful charge', async () => {
    const result = await run({});
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe('APPROVED');
    }
  });

  it('errors the transaction when stock is exhausted at approval', async () => {
    const { useCase, finalize } = buildUseCase({
      completeApproval: () => Promise.resolve(err(new InsufficientStockError('p1', 2, 0))),
    });
    const result = await useCase.execute({ transactionId: 'tx-1', card: validCard });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INSUFFICIENT_STOCK');
    }
    expect(finalize).toHaveBeenCalledWith(expect.objectContaining({ status: 'ERROR' }));
  });

  it('returns a declined transaction when the charge is declined', async () => {
    const { useCase, finalize } = buildUseCase({
      charge: () => Promise.resolve({ gatewayTransactionId: 'g1', status: 'DECLINED' }),
    });
    const result = await useCase.execute({ transactionId: 'tx-1', card: validCard });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe('DECLINED');
    }
    expect(finalize).toHaveBeenCalledWith(expect.objectContaining({ status: 'DECLINED' }));
  });

  it('maps a voided charge to a declined transaction', async () => {
    const { useCase, finalize } = buildUseCase({
      charge: () => Promise.resolve({ gatewayTransactionId: 'g1', status: 'VOIDED' }),
    });
    await useCase.execute({ transactionId: 'tx-1', card: validCard });
    expect(finalize).toHaveBeenCalledWith(expect.objectContaining({ status: 'DECLINED' }));
  });

  it('errors the transaction when the charge returns an error status', async () => {
    const { useCase, finalize } = buildUseCase({
      charge: () => Promise.resolve({ gatewayTransactionId: 'g1', status: 'ERROR' }),
    });
    const result = await useCase.execute({ transactionId: 'tx-1', card: validCard });
    expect(result.ok).toBe(true);
    expect(finalize).toHaveBeenCalledWith(expect.objectContaining({ status: 'ERROR' }));
  });
});
