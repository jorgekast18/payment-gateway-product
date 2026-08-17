import { Injectable } from '@nestjs/common';
import { err, ok, Result } from 'src/shared/result';
import { InsufficientStockError } from 'src/domain/product/product.errors';
import { Transaction } from 'src/domain/transaction/transaction.entity';
import {
  CompleteApprovalInput,
  FinalizeInput,
  TransactionRepository,
} from 'src/domain/transaction/transaction.repository';
import { PrismaService } from './prisma.service';
import { toTransaction } from './prisma.mappers';

class StockConflictError extends Error {}

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(transaction: Transaction): Promise<Transaction> {
    const row = await this.prisma.transaction.create({
      data: {
        reference: transaction.reference,
        status: transaction.status,
        quantity: transaction.quantity,
        productAmountInCents: transaction.productAmountInCents,
        baseFeeInCents: transaction.baseFeeInCents,
        deliveryFeeInCents: transaction.deliveryFeeInCents,
        amountInCents: transaction.amountInCents,
        cardBrand: transaction.cardBrand,
        cardLastFour: transaction.cardLastFour,
        gatewayTransactionId: transaction.gatewayTransactionId,
        productId: transaction.productId,
        customerId: transaction.customerId,
        deliveryId: transaction.deliveryId,
      },
    });
    return toTransaction(row);
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.prisma.transaction.findUnique({ where: { id } });
    return row ? toTransaction(row) : null;
  }

  async finalize(input: FinalizeInput): Promise<Transaction> {
    const row = await this.prisma.transaction.update({
      where: { id: input.transactionId },
      data: {
        status: input.status,
        gatewayTransactionId: input.gatewayTransactionId,
        cardBrand: input.cardBrand,
        cardLastFour: input.cardLastFour,
      },
    });
    return toTransaction(row);
  }

  async completeApproval(
    input: CompleteApprovalInput,
  ): Promise<Result<Transaction, InsufficientStockError>> {
    try {
      const row = await this.prisma.$transaction(async (tx) => {
        const decremented = await tx.product.updateMany({
          where: { id: input.productId, stock: { gte: input.quantity } },
          data: { stock: { decrement: input.quantity } },
        });
        if (decremented.count === 0) {
          throw new StockConflictError();
        }

        await tx.delivery.update({
          where: { id: input.deliveryId },
          data: { status: 'ASSIGNED' },
        });

        return tx.transaction.update({
          where: { id: input.transactionId },
          data: {
            status: 'APPROVED',
            gatewayTransactionId: input.gatewayTransactionId,
            cardBrand: input.cardBrand,
            cardLastFour: input.cardLastFour,
          },
        });
      });
      return ok(toTransaction(row));
    } catch (error) {
      if (error instanceof StockConflictError) {
        return err(new InsufficientStockError(input.productId, input.quantity, 0));
      }
      throw error;
    }
  }
}
