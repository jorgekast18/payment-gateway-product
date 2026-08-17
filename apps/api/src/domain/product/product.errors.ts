import { DomainError } from '../../shared/domain-error';

export class ProductNotFoundError extends DomainError {
  readonly code = 'PRODUCT_NOT_FOUND';

  constructor(productId: string) {
    super(`Product ${productId} was not found`);
  }
}

export class InsufficientStockError extends DomainError {
  readonly code = 'INSUFFICIENT_STOCK';

  constructor(productId: string, requested: number, available: number) {
    super(
      `Product ${productId} has insufficient stock: requested ${requested}, available ${available}`,
    );
  }
}

export class InvalidQuantityError extends DomainError {
  readonly code = 'INVALID_QUANTITY';

  constructor(quantity: number) {
    super(`Quantity ${quantity} is invalid; it must be a positive integer`);
  }
}
