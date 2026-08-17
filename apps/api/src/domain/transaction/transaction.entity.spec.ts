import { Transaction } from './transaction.entity';

describe('Transaction', () => {
  it('creates a pending transaction and computes the amount breakdown', () => {
    const transaction = Transaction.createPending({
      reference: 'PGP-1',
      productId: 'product-1',
      customerId: 'customer-1',
      deliveryId: 'delivery-1',
      quantity: 2,
      productPriceInCents: 25990000,
      baseFeeInCents: 200000,
      deliveryFeeInCents: 1500000,
    });

    expect(transaction.status).toBe('PENDING');
    expect(transaction.isPending()).toBe(true);
    expect(transaction.productAmountInCents).toBe(51980000);
    expect(transaction.baseFeeInCents).toBe(200000);
    expect(transaction.deliveryFeeInCents).toBe(1500000);
    expect(transaction.amountInCents).toBe(53680000);
    expect(transaction.quantity).toBe(2);
    expect(transaction.reference).toBe('PGP-1');
    expect(transaction.productId).toBe('product-1');
    expect(transaction.customerId).toBe('customer-1');
    expect(transaction.deliveryId).toBe('delivery-1');
    expect(transaction.cardBrand).toBeNull();
    expect(transaction.cardLastFour).toBeNull();
    expect(transaction.gatewayTransactionId).toBeNull();
    expect(transaction.id).toBeUndefined();
  });

  it('rebuilds a transaction from persistence', () => {
    const transaction = Transaction.fromPersistence({
      id: 'transaction-1',
      reference: 'PGP-1',
      status: 'APPROVED',
      quantity: 1,
      productAmountInCents: 25990000,
      baseFeeInCents: 200000,
      deliveryFeeInCents: 1500000,
      amountInCents: 27690000,
      cardBrand: 'VISA',
      cardLastFour: '4242',
      gatewayTransactionId: 'gateway-1',
      productId: 'product-1',
      customerId: 'customer-1',
      deliveryId: 'delivery-1',
    });

    expect(transaction.id).toBe('transaction-1');
    expect(transaction.status).toBe('APPROVED');
    expect(transaction.isPending()).toBe(false);
    expect(transaction.cardBrand).toBe('VISA');
    expect(transaction.cardLastFour).toBe('4242');
    expect(transaction.gatewayTransactionId).toBe('gateway-1');
  });
});
