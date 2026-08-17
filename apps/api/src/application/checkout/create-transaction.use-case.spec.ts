import { Customer } from '../../domain/customer/customer.entity';
import { CustomerRepository } from '../../domain/customer/customer.repository';
import { Delivery } from '../../domain/delivery/delivery.entity';
import { DeliveryRepository } from '../../domain/delivery/delivery.repository';
import { Product } from '../../domain/product/product.entity';
import { ProductRepository } from '../../domain/product/product.repository';
import { Transaction } from '../../domain/transaction/transaction.entity';
import { TransactionRepository } from '../../domain/transaction/transaction.repository';
import { PricingConfig } from '../ports/pricing.config';
import { ReferenceGenerator } from '../ports/reference-generator';
import {
  CreateTransactionCommand,
  CreateTransactionUseCase,
} from './create-transaction.use-case';

const product = new Product({
  id: 'p1',
  name: 'Aurora',
  description: 'headphones',
  priceInCents: 25990000,
  imageUrl: 'https://example/a.png',
  stock: 5,
});

const command: CreateTransactionCommand = {
  productId: 'p1',
  quantity: 2,
  customer: { fullName: 'Jane Doe', email: 'jane@example.com', phone: '+573001112233' },
  delivery: { address: 'Calle 1', city: 'Bogota', region: 'Cundinamarca', postalCode: '110111' },
};

const pricing: PricingConfig = { baseFeeInCents: 200000, deliveryFeeInCents: 1500000 };
const references: ReferenceGenerator = { generate: () => 'PGP-test' };

const buildUseCase = (productValue: Product | null): CreateTransactionUseCase => {
  const products: ProductRepository = {
    findAll: () => Promise.resolve([]),
    findById: () => Promise.resolve(productValue),
  };
  const customers: CustomerRepository = {
    create: (customer: Customer) =>
      Promise.resolve(
        new Customer({
          id: 'c1',
          fullName: customer.fullName,
          email: customer.email,
          phone: customer.phone,
        }),
      ),
    findById: () => Promise.resolve(null),
  };
  const deliveries: DeliveryRepository = {
    create: (delivery: Delivery) =>
      Promise.resolve(
        new Delivery({
          id: 'd1',
          address: delivery.address,
          city: delivery.city,
          region: delivery.region,
          postalCode: delivery.postalCode,
          status: delivery.status,
        }),
      ),
  };
  const transactions: TransactionRepository = {
    create: (transaction: Transaction) =>
      Promise.resolve(
        Transaction.fromPersistence({
          id: 'tx-1',
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
        }),
      ),
    findById: () => Promise.resolve(null),
    finalize: () => Promise.reject(new Error('not expected')),
    completeApproval: () => Promise.reject(new Error('not expected')),
  };

  return new CreateTransactionUseCase(
    products,
    customers,
    deliveries,
    transactions,
    references,
    pricing,
  );
};

describe('CreateTransactionUseCase', () => {
  it('rejects a non-positive quantity', async () => {
    const result = await buildUseCase(product).execute({ ...command, quantity: 0 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_QUANTITY');
    }
  });

  it('rejects a missing product', async () => {
    const result = await buildUseCase(null).execute(command);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('PRODUCT_NOT_FOUND');
    }
  });

  it('rejects an order above the available stock', async () => {
    const result = await buildUseCase(product).execute({ ...command, quantity: 6 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INSUFFICIENT_STOCK');
    }
  });

  it('creates a pending transaction with the amount breakdown', async () => {
    const result = await buildUseCase(product).execute(command);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe('PENDING');
      expect(result.value.reference).toBe('PGP-test');
      expect(result.value.productAmountInCents).toBe(51980000);
      expect(result.value.amountInCents).toBe(53680000);
      expect(result.value.productId).toBe('p1');
      expect(result.value.customerId).toBe('c1');
      expect(result.value.deliveryId).toBe('d1');
    }
  });
});
