import { Money } from '../shared/money';
import { TransactionStatus } from './transaction-status';

export interface TransactionProps {
  id?: string;
  reference: string;
  status: TransactionStatus;
  quantity: number;
  productAmountInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
  amountInCents: number;
  cardBrand: string | null;
  cardLastFour: string | null;
  gatewayTransactionId: string | null;
  productId: string;
  customerId: string;
  deliveryId: string | null;
}

export interface CreatePendingInput {
  reference: string;
  productId: string;
  customerId: string;
  deliveryId: string;
  quantity: number;
  productPriceInCents: number;
  baseFeeInCents: number;
  deliveryFeeInCents: number;
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  static createPending(input: CreatePendingInput): Transaction {
    const productAmount = Money.fromCents(input.productPriceInCents).multiply(input.quantity);
    const total = productAmount
      .add(Money.fromCents(input.baseFeeInCents))
      .add(Money.fromCents(input.deliveryFeeInCents));

    return new Transaction({
      reference: input.reference,
      status: TransactionStatus.Pending,
      quantity: input.quantity,
      productAmountInCents: productAmount.cents,
      baseFeeInCents: input.baseFeeInCents,
      deliveryFeeInCents: input.deliveryFeeInCents,
      amountInCents: total.cents,
      cardBrand: null,
      cardLastFour: null,
      gatewayTransactionId: null,
      productId: input.productId,
      customerId: input.customerId,
      deliveryId: input.deliveryId,
    });
  }

  static fromPersistence(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  isPending(): boolean {
    return this.props.status === TransactionStatus.Pending;
  }

  get id(): string | undefined {
    return this.props.id;
  }

  get reference(): string {
    return this.props.reference;
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get productAmountInCents(): number {
    return this.props.productAmountInCents;
  }

  get baseFeeInCents(): number {
    return this.props.baseFeeInCents;
  }

  get deliveryFeeInCents(): number {
    return this.props.deliveryFeeInCents;
  }

  get amountInCents(): number {
    return this.props.amountInCents;
  }

  get cardBrand(): string | null {
    return this.props.cardBrand;
  }

  get cardLastFour(): string | null {
    return this.props.cardLastFour;
  }

  get gatewayTransactionId(): string | null {
    return this.props.gatewayTransactionId;
  }

  get productId(): string {
    return this.props.productId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get deliveryId(): string | null {
    return this.props.deliveryId;
  }
}
