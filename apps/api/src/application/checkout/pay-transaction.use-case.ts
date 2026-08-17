import { err, ok, Result } from 'src/shared/result';
import { CustomerRepository } from 'src/domain/customer/customer.repository';
import { CreditCard, CreditCardInput } from 'src/domain/payment/credit-card';
import { InvalidCreditCardError, PaymentGatewayError } from 'src/domain/payment/payment.errors';
import { ChargeResult, PaymentGateway } from 'src/domain/payment/payment-gateway.port';
import { InsufficientStockError } from 'src/domain/product/product.errors';
import { Transaction } from 'src/domain/transaction/transaction.entity';
import { TransactionRepository } from 'src/domain/transaction/transaction.repository';
import {
  TransactionNotFoundError,
  TransactionNotPendingError,
} from 'src/domain/transaction/transaction.errors';

export interface PayTransactionCommand {
  transactionId: string;
  card: CreditCardInput;
}

export type PayTransactionError =
  | TransactionNotFoundError
  | TransactionNotPendingError
  | InvalidCreditCardError
  | InsufficientStockError
  | PaymentGatewayError;

export class PayTransactionUseCase {
  constructor(
    private readonly transactions: TransactionRepository,
    private readonly customers: CustomerRepository,
    private readonly gateway: PaymentGateway,
  ) {}

  async execute(command: PayTransactionCommand): Promise<Result<Transaction, PayTransactionError>> {
    const transaction = await this.transactions.findById(command.transactionId);
    if (!transaction) {
      return err(new TransactionNotFoundError(command.transactionId));
    }
    if (!transaction.isPending()) {
      return err(new TransactionNotPendingError(command.transactionId));
    }

    const cardResult = CreditCard.create(command.card);
    if (!cardResult.ok) {
      return cardResult;
    }
    const card = cardResult.value;

    const customer = await this.customers.findById(transaction.customerId);
    if (!customer) {
      return err(new PaymentGatewayError('the customer of the transaction is missing'));
    }

    let charge: ChargeResult;
    try {
      charge = await this.gateway.charge({
        amountInCents: transaction.amountInCents,
        reference: transaction.reference,
        customerEmail: customer.email,
        card: {
          number: card.number,
          cvc: card.cvc,
          expMonth: card.expMonth,
          expYear: card.expYear,
          holder: card.holder,
        },
      });
    } catch (error) {
      await this.transactions.finalize({
        transactionId: transaction.id!,
        status: 'ERROR',
        gatewayTransactionId: null,
        cardBrand: card.brand,
        cardLastFour: card.lastFour,
      });
      const reason = error instanceof Error ? error.message : 'unexpected gateway failure';
      return err(new PaymentGatewayError(reason));
    }

    if (charge.status === 'APPROVED') {
      const approval = await this.transactions.completeApproval({
        transactionId: transaction.id!,
        gatewayTransactionId: charge.gatewayTransactionId,
        cardBrand: card.brand,
        cardLastFour: card.lastFour,
        productId: transaction.productId,
        quantity: transaction.quantity,
        deliveryId: transaction.deliveryId!,
      });
      if (!approval.ok) {
        await this.transactions.finalize({
          transactionId: transaction.id!,
          status: 'ERROR',
          gatewayTransactionId: charge.gatewayTransactionId,
          cardBrand: card.brand,
          cardLastFour: card.lastFour,
        });
        return approval;
      }
      return ok(approval.value);
    }

    const status =
      charge.status === 'DECLINED' || charge.status === 'VOIDED' ? 'DECLINED' : 'ERROR';
    const finalized = await this.transactions.finalize({
      transactionId: transaction.id!,
      status,
      gatewayTransactionId: charge.gatewayTransactionId,
      cardBrand: card.brand,
      cardLastFour: card.lastFour,
    });
    return ok(finalized);
  }
}
