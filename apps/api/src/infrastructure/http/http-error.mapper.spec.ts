import { HttpException } from '@nestjs/common';
import { DomainError } from 'src/shared/domain-error';
import { ProductNotFoundError } from 'src/domain/product/product.errors';
import { toHttpException } from './http-error.mapper';

class UnknownError extends DomainError {
  readonly code = 'SOMETHING_ELSE';

  constructor() {
    super('unmapped');
  }
}

describe('toHttpException', () => {
  it('maps a known domain error code to its HTTP status', () => {
    const exception = toHttpException(new ProductNotFoundError('p1'));
    expect(exception).toBeInstanceOf(HttpException);
    expect(exception.getStatus()).toBe(404);
    expect(exception.getResponse()).toEqual({
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product p1 was not found',
    });
  });

  it('falls back to 400 for an unmapped code', () => {
    const exception = toHttpException(new UnknownError());
    expect(exception.getStatus()).toBe(400);
  });
});
