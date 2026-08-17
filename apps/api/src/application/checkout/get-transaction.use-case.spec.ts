import { Transaction } from 'src/domain/transaction/transaction.entity';
import { TransactionRepository } from 'src/domain/transaction/transaction.repository';
import { GetTransactionUseCase } from './get-transaction.use-case';

const transaction = Transaction.fromPersistence({
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
  gatewayTransactionId: null,
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
});

const repositoryReturning = (value: Transaction | null): TransactionRepository => ({
  create: () => Promise.resolve(transaction),
  findById: () => Promise.resolve(value),
  finalize: () => Promise.resolve(transaction),
  completeApproval: () => Promise.resolve({ ok: true, value: transaction }),
});

describe('GetTransactionUseCase', () => {
  it('returns the transaction when it exists', async () => {
    const useCase = new GetTransactionUseCase(repositoryReturning(transaction));
    const result = await useCase.execute('tx-1');
    expect(result.ok && result.value).toBe(transaction);
  });

  it('returns a not found error when the transaction is missing', async () => {
    const useCase = new GetTransactionUseCase(repositoryReturning(null));
    const result = await useCase.execute('missing');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('TRANSACTION_NOT_FOUND');
    }
  });
});
