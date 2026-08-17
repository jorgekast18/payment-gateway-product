import { Transaction } from 'src/domain/transaction/transaction.entity';
import { CompleteApprovalInput } from 'src/domain/transaction/transaction.repository';
import { PrismaService } from './prisma.service';
import { PrismaTransactionRepository } from './transaction.prisma.repository';

const row = {
  id: 'tx-1',
  reference: 'PGP-1',
  status: 'PENDING',
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
  createdAt: new Date(),
  updatedAt: new Date(),
};

const approvedRow = {
  ...row,
  status: 'APPROVED',
  cardBrand: 'VISA',
  cardLastFour: '4242',
  gatewayTransactionId: 'g1',
};

const approvalInput: CompleteApprovalInput = {
  transactionId: 'tx-1',
  gatewayTransactionId: 'g1',
  cardBrand: 'VISA',
  cardLastFour: '4242',
  productId: 'p1',
  quantity: 2,
  deliveryId: 'd1',
};

const pendingTransaction = Transaction.createPending({
  reference: 'PGP-1',
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
  quantity: 2,
  productPriceInCents: 25990000,
  baseFeeInCents: 200000,
  deliveryFeeInCents: 1500000,
});

describe('PrismaTransactionRepository', () => {
  it('creates a transaction', async () => {
    const create = jest.fn().mockResolvedValue(row);
    const prisma = { transaction: { create } } as unknown as PrismaService;

    const transaction = await new PrismaTransactionRepository(prisma).create(pendingTransaction);

    expect(transaction.id).toBe('tx-1');
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('finds a transaction by id', async () => {
    const prisma = {
      transaction: { findUnique: jest.fn().mockResolvedValue(row) },
    } as unknown as PrismaService;

    const transaction = await new PrismaTransactionRepository(prisma).findById('tx-1');

    expect(transaction?.reference).toBe('PGP-1');
  });

  it('finalizes a transaction with a declined status', async () => {
    const update = jest.fn().mockResolvedValue({ ...row, status: 'DECLINED' });
    const prisma = { transaction: { update } } as unknown as PrismaService;

    const transaction = await new PrismaTransactionRepository(prisma).finalize({
      transactionId: 'tx-1',
      status: 'DECLINED',
      gatewayTransactionId: 'g1',
      cardBrand: 'VISA',
      cardLastFour: '4242',
    });

    expect(transaction.status).toBe('DECLINED');
  });

  it('completes the approval atomically when stock is available', async () => {
    const tx = {
      product: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      delivery: { update: jest.fn().mockResolvedValue({}) },
      transaction: { update: jest.fn().mockResolvedValue(approvedRow) },
    };
    const prisma = {
      $transaction: jest.fn((callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    } as unknown as PrismaService;

    const result = await new PrismaTransactionRepository(prisma).completeApproval(approvalInput);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe('APPROVED');
    }
    expect(tx.product.updateMany).toHaveBeenCalled();
    expect(tx.delivery.update).toHaveBeenCalled();
  });

  it('returns insufficient stock when the conditional decrement affects no rows', async () => {
    const tx = {
      product: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
      delivery: { update: jest.fn() },
      transaction: { update: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn((callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    } as unknown as PrismaService;

    const result = await new PrismaTransactionRepository(prisma).completeApproval(approvalInput);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INSUFFICIENT_STOCK');
    }
    expect(tx.transaction.update).not.toHaveBeenCalled();
  });
});
