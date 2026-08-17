import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CUSTOMER_REPOSITORY, CustomerRepository } from './domain/customer/customer.repository';
import { DELIVERY_REPOSITORY, DeliveryRepository } from './domain/delivery/delivery.repository';
import { PAYMENT_GATEWAY, PaymentGateway } from './domain/payment/payment-gateway.port';
import { PRODUCT_REPOSITORY, ProductRepository } from './domain/product/product.repository';
import {
  TRANSACTION_REPOSITORY,
  TransactionRepository,
} from './domain/transaction/transaction.repository';
import { PRICING_CONFIG, PricingConfig } from './application/ports/pricing.config';
import { REFERENCE_GENERATOR, ReferenceGenerator } from './application/ports/reference-generator';

import { ListProductsUseCase } from './application/products/list-products.use-case';
import { GetProductUseCase } from './application/products/get-product.use-case';
import { CreateTransactionUseCase } from './application/checkout/create-transaction.use-case';
import { PayTransactionUseCase } from './application/checkout/pay-transaction.use-case';
import { GetTransactionUseCase } from './application/checkout/get-transaction.use-case';

import { PrismaService } from './infrastructure/persistence/prisma/prisma.service';
import { PrismaProductRepository } from './infrastructure/persistence/prisma/product.prisma.repository';
import { PrismaCustomerRepository } from './infrastructure/persistence/prisma/customer.prisma.repository';
import { PrismaDeliveryRepository } from './infrastructure/persistence/prisma/delivery.prisma.repository';
import { PrismaTransactionRepository } from './infrastructure/persistence/prisma/transaction.prisma.repository';
import { HttpPaymentGateway } from './infrastructure/payment/http-payment-gateway.adapter';
import {
  PAYMENT_GATEWAY_CONFIG,
  PaymentGatewayConfig,
} from './infrastructure/payment/payment-gateway.config';
import { UuidReferenceGenerator } from './infrastructure/config/uuid-reference-generator';

import { ProductsController } from './infrastructure/http/products.controller';
import { CheckoutController } from './infrastructure/http/checkout.controller';
import { HealthController } from './infrastructure/http/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ProductsController, CheckoutController, HealthController],
  providers: [
    PrismaService,

    { provide: PRODUCT_REPOSITORY, useClass: PrismaProductRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
    { provide: DELIVERY_REPOSITORY, useClass: PrismaDeliveryRepository },
    { provide: TRANSACTION_REPOSITORY, useClass: PrismaTransactionRepository },
    { provide: REFERENCE_GENERATOR, useClass: UuidReferenceGenerator },

    {
      provide: PRICING_CONFIG,
      useFactory: (config: ConfigService): PricingConfig => ({
        baseFeeInCents: Number(config.get<string>('BASE_FEE_IN_CENTS', '200000')),
        deliveryFeeInCents: Number(config.get<string>('DELIVERY_FEE_IN_CENTS', '1500000')),
      }),
      inject: [ConfigService],
    },

    {
      provide: PAYMENT_GATEWAY_CONFIG,
      useFactory: (config: ConfigService): PaymentGatewayConfig => ({
        apiUrl: config.getOrThrow<string>('PAYMENT_API_URL'),
        publicKey: config.getOrThrow<string>('PAYMENT_PUBLIC_KEY'),
        privateKey: config.getOrThrow<string>('PAYMENT_PRIVATE_KEY'),
        integritySecret: config.getOrThrow<string>('PAYMENT_INTEGRITY_SECRET'),
        currency: config.get<string>('PAYMENT_CURRENCY', 'COP'),
        tokenizePath: config.get<string>('PAYMENT_TOKENIZE_PATH', '/tokens/cards'),
        installments: Number(config.get<string>('PAYMENT_INSTALLMENTS', '1')),
        pollAttempts: Number(config.get<string>('PAYMENT_POLL_ATTEMPTS', '8')),
        pollDelayMs: Number(config.get<string>('PAYMENT_POLL_DELAY_MS', '750')),
      }),
      inject: [ConfigService],
    },
    { provide: PAYMENT_GATEWAY, useClass: HttpPaymentGateway },

    {
      provide: ListProductsUseCase,
      useFactory: (products: ProductRepository): ListProductsUseCase =>
        new ListProductsUseCase(products),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: GetProductUseCase,
      useFactory: (products: ProductRepository): GetProductUseCase =>
        new GetProductUseCase(products),
      inject: [PRODUCT_REPOSITORY],
    },
    {
      provide: CreateTransactionUseCase,
      useFactory: (
        products: ProductRepository,
        customers: CustomerRepository,
        deliveries: DeliveryRepository,
        transactions: TransactionRepository,
        references: ReferenceGenerator,
        pricing: PricingConfig,
      ): CreateTransactionUseCase =>
        new CreateTransactionUseCase(
          products,
          customers,
          deliveries,
          transactions,
          references,
          pricing,
        ),
      inject: [
        PRODUCT_REPOSITORY,
        CUSTOMER_REPOSITORY,
        DELIVERY_REPOSITORY,
        TRANSACTION_REPOSITORY,
        REFERENCE_GENERATOR,
        PRICING_CONFIG,
      ],
    },
    {
      provide: PayTransactionUseCase,
      useFactory: (
        transactions: TransactionRepository,
        customers: CustomerRepository,
        gateway: PaymentGateway,
      ): PayTransactionUseCase =>
        new PayTransactionUseCase(transactions, customers, gateway),
      inject: [TRANSACTION_REPOSITORY, CUSTOMER_REPOSITORY, PAYMENT_GATEWAY],
    },
    {
      provide: GetTransactionUseCase,
      useFactory: (transactions: TransactionRepository): GetTransactionUseCase =>
        new GetTransactionUseCase(transactions),
      inject: [TRANSACTION_REPOSITORY],
    },
  ],
})
export class AppModule {}
