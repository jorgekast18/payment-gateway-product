import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateTransactionUseCase } from 'src/application/checkout/create-transaction.use-case';
import { PayTransactionUseCase } from 'src/application/checkout/pay-transaction.use-case';
import { GetTransactionUseCase } from 'src/application/checkout/get-transaction.use-case';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PayTransactionDto } from './dto/pay-transaction.dto';
import { TransactionResponse, toTransactionResponse } from './dto/responses';
import { toHttpException } from './http-error.mapper';

@ApiTags('checkout')
@Controller('transactions')
export class CheckoutController {
  constructor(
    private readonly createTransaction: CreateTransactionUseCase,
    private readonly payTransaction: PayTransactionUseCase,
    private readonly getTransaction: GetTransactionUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: TransactionResponse })
  async create(@Body() dto: CreateTransactionDto): Promise<TransactionResponse> {
    const result = await this.createTransaction.execute({
      productId: dto.productId,
      quantity: dto.quantity,
      customer: dto.customer,
      delivery: dto.delivery,
    });
    if (!result.ok) {
      throw toHttpException(result.error);
    }
    return toTransactionResponse(result.value);
  }

  @Post(':id/payment')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TransactionResponse })
  async pay(@Param('id') id: string, @Body() dto: PayTransactionDto): Promise<TransactionResponse> {
    const result = await this.payTransaction.execute({ transactionId: id, card: dto.card });
    if (!result.ok) {
      throw toHttpException(result.error);
    }
    return toTransactionResponse(result.value);
  }

  @Get(':id')
  @ApiOkResponse({ type: TransactionResponse })
  async findOne(@Param('id') id: string): Promise<TransactionResponse> {
    const result = await this.getTransaction.execute(id);
    if (!result.ok) {
      throw toHttpException(result.error);
    }
    return toTransactionResponse(result.value);
  }
}
