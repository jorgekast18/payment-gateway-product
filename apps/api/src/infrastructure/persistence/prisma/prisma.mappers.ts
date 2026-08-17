import type {
  Customer as CustomerRow,
  Delivery as DeliveryRow,
  Product as ProductRow,
  Transaction as TransactionRow,
} from '@prisma/client';
import { Customer } from 'src/domain/customer/customer.entity';
import { Delivery } from 'src/domain/delivery/delivery.entity';
import { Product } from 'src/domain/product/product.entity';
import { Transaction } from 'src/domain/transaction/transaction.entity';

export const toProduct = (row: ProductRow): Product =>
  new Product({
    id: row.id,
    name: row.name,
    description: row.description,
    priceInCents: row.priceInCents,
    imageUrl: row.imageUrl,
    stock: row.stock,
  });

export const toCustomer = (row: CustomerRow): Customer =>
  new Customer({
    id: row.id,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
  });

export const toDelivery = (row: DeliveryRow): Delivery =>
  new Delivery({
    id: row.id,
    address: row.address,
    city: row.city,
    region: row.region,
    postalCode: row.postalCode,
    status: row.status,
  });

export const toTransaction = (row: TransactionRow): Transaction =>
  Transaction.fromPersistence({
    id: row.id,
    reference: row.reference,
    status: row.status,
    quantity: row.quantity,
    productAmountInCents: row.productAmountInCents,
    baseFeeInCents: row.baseFeeInCents,
    deliveryFeeInCents: row.deliveryFeeInCents,
    amountInCents: row.amountInCents,
    cardBrand: row.cardBrand,
    cardLastFour: row.cardLastFour,
    gatewayTransactionId: row.gatewayTransactionId,
    productId: row.productId,
    customerId: row.customerId,
    deliveryId: row.deliveryId,
  });
