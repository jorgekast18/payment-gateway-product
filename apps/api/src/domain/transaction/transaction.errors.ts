import { DomainError } from '../../shared/domain-error';

export class TransactionNotFoundError extends DomainError {
  readonly code = 'TRANSACTION_NOT_FOUND';

  constructor(transactionId: string) {
    super(`Transaction ${transactionId} was not found`);
  }
}

export class TransactionNotPendingError extends DomainError {
  readonly code = 'TRANSACTION_NOT_PENDING';

  constructor(transactionId: string) {
    super(`Transaction ${transactionId} is not pending and cannot be paid again`);
  }
}
