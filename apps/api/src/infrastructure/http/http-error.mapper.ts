import { HttpException } from '@nestjs/common';
import { DomainError } from 'src/shared/domain-error';

const STATUS_BY_CODE: Record<string, number> = {
  PRODUCT_NOT_FOUND: 404,
  TRANSACTION_NOT_FOUND: 404,
  INSUFFICIENT_STOCK: 409,
  TRANSACTION_NOT_PENDING: 409,
  INVALID_QUANTITY: 422,
  INVALID_CREDIT_CARD: 422,
  PAYMENT_GATEWAY_ERROR: 502,
};

export const toHttpException = (error: DomainError): HttpException =>
  new HttpException(
    { code: error.code, message: error.message },
    STATUS_BY_CODE[error.code] ?? 400,
  );
