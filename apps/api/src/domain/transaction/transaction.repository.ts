import { Result } from 'src/shared/result';
import { InsufficientStockError } from '../product/product.errors';
import { Transaction } from './transaction.entity';
import { TransactionStatus } from './transaction-status';

export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export interface CompleteApprovalInput {
  transactionId: string;
  gatewayTransactionId: string;
  cardBrand: string;
  cardLastFour: string;
  productId: string;
  quantity: number;
  deliveryId: string;
}

export interface FinalizeInput {
  transactionId: string;
  status: Extract<TransactionStatus, 'DECLINED' | 'ERROR'>;
  gatewayTransactionId: string | null;
  cardBrand: string | null;
  cardLastFour: string | null;
}

export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  finalize(input: FinalizeInput): Promise<Transaction>;
  completeApproval(
    input: CompleteApprovalInput,
  ): Promise<Result<Transaction, InsufficientStockError>>;
}
