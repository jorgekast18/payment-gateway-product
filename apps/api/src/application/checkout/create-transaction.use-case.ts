import { err, ok, Result } from 'src/shared/result';
import { Customer } from 'src/domain/customer/customer.entity';
import { CustomerRepository } from 'src/domain/customer/customer.repository';
import { Delivery } from 'src/domain/delivery/delivery.entity';
import { DeliveryRepository } from 'src/domain/delivery/delivery.repository';
import { ProductRepository } from 'src/domain/product/product.repository';
import {
  InsufficientStockError,
  InvalidQuantityError,
  ProductNotFoundError,
} from 'src/domain/product/product.errors';
import { Transaction } from 'src/domain/transaction/transaction.entity';
import { TransactionRepository } from 'src/domain/transaction/transaction.repository';
import { PricingConfig } from '../ports/pricing.config';
import { ReferenceGenerator } from '../ports/reference-generator';

export interface CreateTransactionCommand {
  productId: string;
  quantity: number;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  delivery: {
    address: string;
    city: string;
    region: string;
    postalCode: string;
  };
}

export type CreateTransactionError =
  InvalidQuantityError | ProductNotFoundError | InsufficientStockError;

export class CreateTransactionUseCase {
  constructor(
    private readonly products: ProductRepository,
    private readonly customers: CustomerRepository,
    private readonly deliveries: DeliveryRepository,
    private readonly transactions: TransactionRepository,
    private readonly references: ReferenceGenerator,
    private readonly pricing: PricingConfig,
  ) {}

  async execute(
    command: CreateTransactionCommand,
  ): Promise<Result<Transaction, CreateTransactionError>> {
    if (!Number.isInteger(command.quantity) || command.quantity < 1) {
      return err(new InvalidQuantityError(command.quantity));
    }

    const product = await this.products.findById(command.productId);
    if (!product) {
      return err(new ProductNotFoundError(command.productId));
    }

    if (!product.hasStockFor(command.quantity)) {
      return err(new InsufficientStockError(product.id, command.quantity, product.stock));
    }

    const customer = await this.customers.create(new Customer(command.customer));
    const delivery = await this.deliveries.create(Delivery.createPending(command.delivery));

    const transaction = Transaction.createPending({
      reference: this.references.generate(),
      productId: product.id,
      customerId: customer.id!,
      deliveryId: delivery.id!,
      quantity: command.quantity,
      productPriceInCents: product.priceInCents,
      baseFeeInCents: this.pricing.baseFeeInCents,
      deliveryFeeInCents: this.pricing.deliveryFeeInCents,
    });

    const saved = await this.transactions.create(transaction);
    return ok(saved);
  }
}
