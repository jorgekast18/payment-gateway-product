import { err, ok, Result } from 'src/shared/result';
import { Transaction } from 'src/domain/transaction/transaction.entity';
import { TransactionRepository } from 'src/domain/transaction/transaction.repository';
import { TransactionNotFoundError } from 'src/domain/transaction/transaction.errors';

export class GetTransactionUseCase {
  constructor(private readonly transactions: TransactionRepository) {}

  async execute(transactionId: string): Promise<Result<Transaction, TransactionNotFoundError>> {
    const transaction = await this.transactions.findById(transactionId);
    if (!transaction) {
      return err(new TransactionNotFoundError(transactionId));
    }
    return ok(transaction);
  }
}
