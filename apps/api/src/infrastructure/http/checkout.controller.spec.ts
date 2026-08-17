import { HttpException } from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/checkout/create-transaction.use-case';
import { GetTransactionUseCase } from '../../application/checkout/get-transaction.use-case';
import { PayTransactionUseCase } from '../../application/checkout/pay-transaction.use-case';
import { InvalidCreditCardError } from '../../domain/payment/payment.errors';
import { TransactionNotFoundError } from '../../domain/transaction/transaction.errors';
import { Transaction } from '../../domain/transaction/transaction.entity';
import { err, ok } from '../../shared/result';
import { CheckoutController } from './checkout.controller';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PayTransactionDto } from './dto/pay-transaction.dto';

const transaction = Transaction.fromPersistence({
  id: 'tx-1',
  reference: 'PGP-1',
  status: 'PENDING',
  quantity: 1,
  productAmountInCents: 25990000,
  baseFeeInCents: 200000,
  deliveryFeeInCents: 1500000,
  amountInCents: 27690000,
  cardBrand: null,
  cardLastFour: null,
  gatewayTransactionId: null,
  productId: 'p1',
  customerId: 'c1',
  deliveryId: 'd1',
});

const createDto: CreateTransactionDto = {
  productId: 'p1',
  quantity: 1,
  customer: { fullName: 'Jane', email: 'jane@example.com', phone: '+573001112233' },
  delivery: { address: 'Calle 1', city: 'Bogota', region: 'Cundinamarca', postalCode: '110111' },
};

const payDto: PayTransactionDto = {
  card: { number: '4242424242424242', cvc: '123', expMonth: '08', expYear: '30', holder: 'Jane' },
};

const noop = <T>() => ({ execute: jest.fn() }) as unknown as T;

describe('CheckoutController', () => {
  it('creates a transaction', async () => {
    const create = {
      execute: jest.fn().mockResolvedValue(ok(transaction)),
    } as unknown as CreateTransactionUseCase;
    const controller = new CheckoutController(
      create,
      noop<PayTransactionUseCase>(),
      noop<GetTransactionUseCase>(),
    );

    const response = await controller.create(createDto);

    expect(response.id).toBe('tx-1');
    expect(response.status).toBe('PENDING');
  });

  it('maps a create failure to an HTTP exception', async () => {
    const create = {
      execute: jest.fn().mockResolvedValue(err(new InvalidCreditCardError('bad'))),
    } as unknown as CreateTransactionUseCase;
    const controller = new CheckoutController(
      create,
      noop<PayTransactionUseCase>(),
      noop<GetTransactionUseCase>(),
    );

    await expect(controller.create(createDto)).rejects.toBeInstanceOf(HttpException);
  });

  it('pays a transaction', async () => {
    const pay = {
      execute: jest.fn().mockResolvedValue(ok(transaction)),
    } as unknown as PayTransactionUseCase;
    const controller = new CheckoutController(
      noop<CreateTransactionUseCase>(),
      pay,
      noop<GetTransactionUseCase>(),
    );

    const response = await controller.pay('tx-1', payDto);

    expect(response.reference).toBe('PGP-1');
  });

  it('maps a pay failure to an HTTP exception', async () => {
    const pay = {
      execute: jest.fn().mockResolvedValue(err(new InvalidCreditCardError('bad'))),
    } as unknown as PayTransactionUseCase;
    const controller = new CheckoutController(
      noop<CreateTransactionUseCase>(),
      pay,
      noop<GetTransactionUseCase>(),
    );

    await expect(controller.pay('tx-1', payDto)).rejects.toBeInstanceOf(HttpException);
  });

  it('returns a transaction by id', async () => {
    const get = {
      execute: jest.fn().mockResolvedValue(ok(transaction)),
    } as unknown as GetTransactionUseCase;
    const controller = new CheckoutController(
      noop<CreateTransactionUseCase>(),
      noop<PayTransactionUseCase>(),
      get,
    );

    const response = await controller.findOne('tx-1');

    expect(response.id).toBe('tx-1');
  });

  it('maps a missing transaction to an HTTP exception', async () => {
    const get = {
      execute: jest.fn().mockResolvedValue(err(new TransactionNotFoundError('missing'))),
    } as unknown as GetTransactionUseCase;
    const controller = new CheckoutController(
      noop<CreateTransactionUseCase>(),
      noop<PayTransactionUseCase>(),
      get,
    );

    await expect(controller.findOne('missing')).rejects.toBeInstanceOf(HttpException);
  });
});
