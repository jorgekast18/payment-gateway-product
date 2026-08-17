import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../../domain/product/product.entity';
import { Transaction } from '../../../domain/transaction/transaction.entity';
import { TransactionStatus } from '../../../domain/transaction/transaction-status';

export class ProductResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  priceInCents!: number;

  @ApiProperty()
  imageUrl!: string;

  @ApiProperty()
  stock!: number;
}

export const toProductResponse = (product: Product): ProductResponse => ({
  id: product.id,
  name: product.name,
  description: product.description,
  priceInCents: product.priceInCents,
  imageUrl: product.imageUrl,
  stock: product.stock,
});

export class TransactionResponse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  reference!: string;

  @ApiProperty({ enum: ['PENDING', 'APPROVED', 'DECLINED', 'ERROR'] })
  status!: TransactionStatus;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  productAmountInCents!: number;

  @ApiProperty()
  baseFeeInCents!: number;

  @ApiProperty()
  deliveryFeeInCents!: number;

  @ApiProperty()
  amountInCents!: number;

  @ApiProperty({ nullable: true, type: String })
  cardBrand!: string | null;

  @ApiProperty({ nullable: true, type: String })
  cardLastFour!: string | null;

  @ApiProperty()
  productId!: string;
}

export const toTransactionResponse = (transaction: Transaction): TransactionResponse => ({
  id: transaction.id!,
  reference: transaction.reference,
  status: transaction.status,
  quantity: transaction.quantity,
  productAmountInCents: transaction.productAmountInCents,
  baseFeeInCents: transaction.baseFeeInCents,
  deliveryFeeInCents: transaction.deliveryFeeInCents,
  amountInCents: transaction.amountInCents,
  cardBrand: transaction.cardBrand,
  cardLastFour: transaction.cardLastFour,
  productId: transaction.productId,
});
